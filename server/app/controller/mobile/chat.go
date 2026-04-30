package mobile

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gitee.com/jiang-xia/gin-zone/server/app/service"
	"gitee.com/jiang-xia/gin-zone/server/config"
	"gitee.com/jiang-xia/gin-zone/server/pkg/log"
	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"gitee.com/jiang-xia/gin-zone/server/pkg/tip"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/spf13/cast"
)

type Chat struct {
}

// 升级协议
var upGrader = websocket.Upgrader{
	// 浏览器 Origin 是页面站点，常与 API 的 Host:端口 不一致（如 5173 -> 9600），不能只做 r.Host 相等判断
	CheckOrigin: checkWebSocketOrigin,
}

func checkWebSocketOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	if origin == "" {
		return true
	}
	if origin == "http://"+r.Host || origin == "https://"+r.Host {
		return true
	}
	if config.App != nil && strings.TrimSpace(config.App.AllowedOrigins) != "" {
		for _, a := range strings.Split(config.App.AllowedOrigins, ",") {
			a = strings.TrimSpace(a)
			if a != "" && origin == a {
				return true
			}
		}
	}
	ou, err := url.Parse(origin)
	if err != nil {
		return false
	}
	h := strings.ToLower(ou.Hostname())
	if config.App != nil && strings.EqualFold(config.App.Env, "dev") {
		if h == "localhost" || h == "127.0.0.1" || h == "::1" {
			return true
		}
	}
	return false
}

// Client 客户端结构体
type Client struct {
	ID         string
	IpAddress  string
	IpSource   string
	UserId     string
	Socket     *websocket.Conn
	SendChan   chan []byte
	LastActiveAtNano int64 // 最近一次心跳/消息时间（纳秒），用于连接保活与过期判断
	ExpireTime time.Duration // 一段时间没有接收到心跳则过期

	unregisterOnce sync.Once // 只允许触发一次注销，避免 Read/Write/Check 重复注销
	closeOnce      sync.Once // 连接资源只释放一次，避免重复 close 引发 panic
	closedFlag     int32     // 连接是否已关闭（1=已关闭）
}

func (c *Client) unregister() {
	// 连接退出统一走注销通道，由 Manager.Quit() 负责清理资源与更新在线人数
	if c == nil {
		return
	}
	c.unregisterOnce.Do(func() {
		Manager.UnRegisterChan <- c
	})
}

func (c *Client) Close() {
	// 统一释放连接资源，避免 goroutine 泄漏（只执行一次）
	if c == nil {
		return
	}
	c.closeOnce.Do(func() {
		atomic.StoreInt32(&c.closedFlag, 1)
		// 先关 socket，避免继续读写阻塞
		if c.Socket != nil {
			_ = c.Socket.Close()
		}
		// 再关发送通道，唤醒 Write() 退出
		if c.SendChan != nil {
			close(c.SendChan)
		}
	})
}

// ClientManager 客户端管理结构体
type ClientManager struct {
	Clients        map[string]*Client // 记录在线用户 (上线增加一个客户端)
	BroadcastChan  chan []byte        //触发消息广播 (当前广播的消息)
	RegisterChan   chan *Client       // 触发新用户登陆 (当前登录的客户端)
	UnRegisterChan chan *Client       // 触发用户退出(当前退出的客户端)
	mu             sync.RWMutex
}

// WsMessage 消息模板结构体
type WsMessage struct {
	Cmd   string `json:"cmd"`
	Count int    `json:"count"`
	model.ChatLog
	UserInfo interface{} `json:"userInfo"`
}

// Manager 管理实例声明
var Manager = ClientManager{
	Clients:        make(map[string]*Client), // 初始化chan(实例化)
	// 带缓冲避免高并发下 Register/UnRegister/Broadcast 相互阻塞卡死
	BroadcastChan:  make(chan []byte, 1024),
	RegisterChan:   make(chan *Client, 256),
	UnRegisterChan: make(chan *Client, 256),
}

// Read 读取客户端发送过来的消息
func (c *Client) Read() {
	// 出现故障后把当前客户端注销(即不是无限循环 阻塞着就关闭)
	defer func() {
		log.Info("用户关闭Socket连接 userId=" + c.UserId)
		c.unregister()
	}()
	//sum := 0
	// 无限循环 应用服务器常用于监听
	for {
		//sum++
		_, data, err := c.Socket.ReadMessage()
		//var err error
		//var data []byte
		if err != nil {
			log.Error(err.Error())
			break
		}
		//ioutil.WriteFile("./nani.mp4", []byte(data), 0644)
		var msg WsMessage
		err = json.Unmarshal(data, &msg)
		// fmt.Println("WsMessage===========>", msg)
		if err != nil {
			log.Error(err.Error())
			break
		}
		//fmt.Printf("客户端所发信息:%+v\n ", msg)
		switch msg.Cmd {
		case "heartbeat":
			var hMsg = map[string]interface{}{}
			hMsg["cmd"] = msg.Cmd
			hMsg["content"] = "ok"
			hMsg["senderId"] = msg.SenderId
			// 如果是心跳监测消息（利用心跳监测来判断对应客户端是否在线）
			resp, _ := json.Marshal(hMsg)
			atomic.StoreInt64(&c.LastActiveAtNano, time.Now().UnixNano()) // 刷新最后活跃时间
			// 发送变量到 SendChan 通道中（非阻塞，避免慢连接卡死读协程）
			trySend(c, resp)
		case "online":
			// 获取在线人数
			Manager.mu.RLock()
			count := len(Manager.Clients)
			Manager.mu.RUnlock()
			msg.Count = count
			resp, _ := json.Marshal(msg)
			// 在线人数回包同样走非阻塞投递，避免慢连接拖住
			trySend(c, resp)
		case "text":
			// 发送文本消息
			atomic.StoreInt64(&c.LastActiveAtNano, time.Now().UnixNano()) // 非心跳消息也算活跃
			chatLog := &model.ChatLog{
				SenderId:   c.UserId,
				ReceiverId: msg.ReceiverId,
				GroupId:    msg.GroupId,
				Content:    msg.Content,
				LogType:    msg.LogType,
				MsgType:    msg.MsgType,
			}
			if err = service.Chat.CreateChatLog(chatLog); err != nil {
				log.Error("写入聊天记录失败: " + err.Error())
				continue
			}
			// 消息落库后再做敏感词检测，命中后自动撤回并替换广播内容
			processRes, pErr := service.ProcessSensitiveMessage(chatLog)
			if pErr != nil {
				log.Error("写入敏感词命中日志失败: " + pErr.Error())
			}
			if processRes != nil && processRes.AutoRevoked {
				msg.Content = "[消息包含敏感内容，已被系统拦截]"
				msg.IsRevoked = true
			}
			//查询用户信息
			UserInfo, _ := service.User.GetByUserId(chatLog.SenderId)
			msg.SenderId = c.UserId
			msg.UserInfo = UserInfo
			UserInfo.Password = ""
			resp, _ := json.Marshal(msg)
			// 广播队列满时不应阻塞当前读协程
			tryBroadcast(resp)
		case "recall":
			// 你的撤回消息的操作
			c.SendChan <- []byte("回复消息")

		}
		//fmt.Println("sum:", sum, "次")
	}
}

// Write 把对应消息写回客户端
func (c *Client) Write() {
	defer func() {
		c.unregister()
	}()
	for {
		select {
		//监听是否有消息发送
		case msg, ok := <-c.SendChan:
			if !ok {
				return
			}
			err := c.Socket.WriteMessage(websocket.TextMessage, msg)
			if err != nil {
				log.Error(err.Error())
				return
			}
		}
	}
}

// Check 实时监测过期
func (c *Client) Check() {
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()
	for {
		<-ticker.C
		last := atomic.LoadInt64(&c.LastActiveAtNano)
		// 刚建连但尚未收到心跳/消息时，兜底按当前时间
		if last == 0 {
			last = time.Now().UnixNano()
			atomic.StoreInt64(&c.LastActiveAtNano, last)
		}
		duration := time.Since(time.Unix(0, last))
		if duration >= c.ExpireTime {
			// 过期退出
			c.unregister()
			return
		}
	}
}

// Start 开始监听有人连接
func (manager *ClientManager) Start() {
	for {
		select {
		case conn := <-Manager.RegisterChan:
			Manager.mu.Lock()
			Manager.Clients[conn.ID] = conn
			count := len(Manager.Clients)
			Manager.mu.Unlock()
			// 如果有新用户连接则发送最近聊天记录和在线人数给他
			Manager.InitSend(conn, count)
		}
	}
}

// InitSend 初始化客户端管理器
func (manager *ClientManager) InitSend(cur *Client, count int) {
	// 初始化时发送在线人数
	resp, _ := json.Marshal(&WsMessage{Cmd: "online", Count: count})
	tryBroadcast(resp)
}

func newConnID() string {
	// 连接 ID 不能用 ip+ua，否则同网段/同设备多开会互相覆盖；这里用随机值避免冲突
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(b)
}

func trySend(conn *Client, msg []byte) {
	// 非阻塞投递：慢连接不应拖垮全局广播协程
	if conn == nil {
		return
	}
	// 已关闭连接直接跳过；极端并发下仍可能出现 send on closed channel，这里用 recover 兜底
	if atomic.LoadInt32(&conn.closedFlag) == 1 {
		return
	}
	defer func() {
		if r := recover(); r != nil {
			// 并发竞态导致的 panic（例如 send on closed channel），直接吞掉避免影响广播主循环
		}
	}()
	select {
	case conn.SendChan <- msg:
	default:
		log.Warn("聊天投递丢弃：连接发送队列已满 userId=" + conn.UserId)
	}
}

func tryBroadcast(msg []byte) {
	// BroadcastChan 写入也可能在高峰期阻塞，这里做非阻塞兜底，避免 Start/Quit 被卡死
	select {
	case Manager.BroadcastChan <- msg:
	default:
		log.Warn("聊天广播丢弃：广播队列已满")
	}
}

// BroadcastSend 群发消息
func (manager *ClientManager) BroadcastSend() {
	for {
		select {
		// 只要有一方发消息就广播
		case msg := <-Manager.BroadcastChan:
			wsMsg := WsMessage{}
			err := json.Unmarshal(msg, &wsMsg)
			if err != nil {
				wsMsg.Content = "消息解析错误:" + err.Error()
				log.Error(wsMsg.Content)
			}
			//fmt.Printf("WsMessage消息模板:%+v\n", wsMsg)
			//fmt.Println("群聊id:", wsMsg.GroupId)
			//fmt.Println("当前连接者id:", wsMsg.GroupId)
			//fmt.Println("接受者id:", wsMsg.ReceiverId)
			//群聊时找到所有群成员广播消息
			if wsMsg.GroupId != 0 {
				list := service.Chat.ChatGroupMember(wsMsg.GroupId)
				// fmt.Println("群组成员列表：", len(list))
				Manager.mu.RLock()
				connections := make([]*Client, 0, len(Manager.Clients))
				for _, conn := range Manager.Clients {
					connections = append(connections, conn)
				}
				Manager.mu.RUnlock()

				//遍历所有群成员
				for _, member := range list {
					//找到所有在线的群成员用户(在线实例用户id和群成员用户id一致)
					for _, conn := range connections {
						//自己发消息时，不用广播给自己
						if wsMsg.SenderId == conn.UserId {
							continue
						}
						if member.UserId == conn.UserId {
							// fmt.Println("群组成员：", conn.UserId)
							// 同一用户可能多端在线，这里全部投递
							trySend(conn, msg)
						}
					}
				}
			} else if wsMsg.ReceiverId != "" {
				//	私聊时找到对应结接收方用户广播消息
				Manager.mu.RLock()
				connections := make([]*Client, 0, len(Manager.Clients))
				for _, conn := range Manager.Clients {
					connections = append(connections, conn)
				}
				Manager.mu.RUnlock()
				for _, conn := range connections {
					//接受者is和当前连接实例相等时
					if wsMsg.ReceiverId == conn.UserId {
						// 私聊接收方多端在线时全部投递
						trySend(conn, msg)
					}
				}
			}
			//fmt.Printf("客户端发送的消息:%+v", wsMsg)
			////广播给所有的在线客户端
			//for _, conn := range Manager.Clients {
			//	conn.SendChan <- msg
			//}
		}
	}
}

// Quit 离线用户触发删除
func (manager *ClientManager) Quit() {
	for {
		select {
		case conn := <-Manager.UnRegisterChan:
			// 删除对应在线客户端，并统一释放资源，避免 goroutine 残留
			conn.Close()
			manager.mu.Lock()
			delete(Manager.Clients, conn.ID)
			count := len(Manager.Clients)
			manager.mu.Unlock()
			// 给客户端刷新在线人数
			resp, _ := json.Marshal(&WsMessage{Cmd: "online", Count: count})
			//有人退出时 广播刷新在线人数
			tryBroadcast(resp)
		}
	}
}

// 初始化 执行客户端管理方法
func init() {
	go Manager.Start()
	go Manager.Quit()
	go Manager.BroadcastSend()
}

// WebSocketHandle webSocket升级协议，并且初始化上线用户数据
func (ch *Chat) WebSocketHandle(ctx *gin.Context) {
	userId := model.GetUserUid(ctx)
	if userId == "" {
		// token 鉴权失败返回业务码，前端统一按 code 清登录态
		response.Response(ctx, tip.AuthCheckTokenFail, nil)
		return
	}
	conn, err := upGrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		http.NotFound(ctx.Writer, ctx.Request)
		log.Error(err.Error())
		return
	}
	ip := ctx.ClientIP()
	ua := ctx.GetHeader("User-Agent")
	_ = ua
	//新用户(新的客户端) 连上就新建一个客户端实例
	client := &Client{
		ID:         newConnID(),
		Socket:     conn,
		// 加缓冲避免慢连接阻塞全局广播
		SendChan:   make(chan []byte, 64),
		IpAddress:  ip,
		IpSource:   "未知",
		UserId:     userId,
		LastActiveAtNano: time.Now().UnixNano(),
		ExpireTime: time.Minute * 1,
	}
	// 使用通道Register发送变量client
	Manager.RegisterChan <- client
	go client.Read() // 以goroutine的方式调用Client的Read、Write、Check方法
	go client.Write()
	go client.Check()
}

/*
*
* 聊天相关接口开始==============================>
*
 */

//	FriendList godoc
//
// @Summary     好友列表
// @Description 好友列表
// @Tags        聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       userId   query     int            true  "User.ID"
// @Success     200  {object} response.ResType
// @Router      /mobile/chat/friends [get]
func (ch *Chat) FriendList(c *gin.Context) {
	userId := model.GetUserUid(c)
	if userId == "" {
		response.Fail(c, "用户id不能为空", []string{})
		return
	}
	friends, err := service.Chat.ChatFriends(userId)
	if err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	response.Success(c, friends, "")
}

// AddFriend godoc
//
// @Summary     添加好友关系
// @Description 添加好友或加入群聊
// @Tags        聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       user body     model.AddFriend true "需要上传的json"
// @Success     200  {object} model.AddFriend
// @Router      /mobile/chat/friends [post]
func (ch *Chat) AddFriend(c *gin.Context) {
	addFriend := &model.AddFriend{}
	if err := c.ShouldBindJSON(&addFriend); err != nil {
		// 字段参数校验
		response.Fail(c, "参数错误", err.Error())
		return
	}
	currentUserId := model.GetUserUid(c)
	if currentUserId == "" {
		response.Fail(c, "用户id不能为空", nil)
		return
	}
	addFriend.UserId = currentUserId
	if addFriend.FriendId == currentUserId {
		response.Fail(c, "不能添加自己为好友", nil)
		return
	}
	err := service.Chat.CreateChatFriends(&model.ChatFriends{
		UserId:       addFriend.UserId,
		FriendId:     addFriend.FriendId,
		GroupId:      addFriend.GroupId,
		LastReadTime: model.Time{},
		LastInfoTime: model.Time{},
	})
	if addFriend.FriendId != "" {
		//对方 好友列表同时加上自身
		err = service.Chat.CreateChatFriends(&model.ChatFriends{
			UserId:       addFriend.FriendId,
			FriendId:     addFriend.UserId,
			LastReadTime: model.Time{},
			LastInfoTime: model.Time{},
		})
	}
	if err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	response.Success(c, addFriend, "添加成功")
}

// DelFriend godoc
//
// @Summary     删除好友
// @Description 删除好友
// @Tags        聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       friendId path  string true "好友id"
// @Success     200  {object}  response.ResType
// @Router      /mobile/chat/friends/{friendId} [delete]
func (ch *Chat) DelFriend(c *gin.Context) {
	userId := model.GetUserUid(c)
	friendId := c.Param("friendId")
	bool := service.Chat.DeleteChatFriends(userId, friendId)
	//互删
	bool = service.Chat.DeleteChatFriends(friendId, userId)
	if !bool {
		response.Fail(c, "删除失败", nil)
		return
	}
	response.Success(c, bool, "删除成功")
}

// UpdateReadTime godoc
//
// @Summary     更新阅读时间
// @Description 更新上次阅读信息时间
// @Tags        聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       query body     model.UpdateReadTime true "需要上传的json"
// @Success     200  {boolean} true
// @Router      /mobile/chat/updateReadTime [post]
func (ch *Chat) UpdateReadTime(c *gin.Context) {
	var query model.UpdateReadTime
	if err := c.ShouldBindJSON(&query); err != nil {
		response.Fail(c, "参数错误", err.Error())
		return
	}
	currentUserId := model.GetUserUid(c)
	if currentUserId == "" {
		response.Fail(c, "用户id不能为空", nil)
		return
	}
	query.SenderId = currentUserId
	if query.GroupId == 0 && strings.TrimSpace(query.ReceiverId) == "" {
		response.Fail(c, "参数错误", "receiverId不能为空")
		return
	}
	err := service.Chat.UpdateLastReadTime(&query)
	if err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	response.Success(c, true, "操作成功")
}

// ChatLogList godoc
//
// @Summary     聊天记录
// @Description 聊天记录
// @Tags        聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       query body     model.ChatLogQuery true "需要上传的json"
// @Success     200 {array} model.ChatLog
// @Router     /mobile/chat/logs [post]
func (ch *Chat) ChatLogList(c *gin.Context) {
	query := &model.ChatLogQuery{}
	if err := c.ShouldBindJSON(&query); err != nil {
		response.Fail(c, "参数错误", err.Error())
		return
	}
	currentUserId := model.GetUserUid(c)
	if currentUserId == "" {
		response.Fail(c, "用户id不能为空", nil)
		return
	}
	query.SenderId = currentUserId
	// 群聊记录必须校验当前用户是群主/管理员/群成员，避免越权读取
	if query.GroupId != 0 {
		ok, err := service.Chat.CanAccessChatGroup(currentUserId, query.GroupId)
		if err != nil {
			response.Fail(c, err.Error(), nil)
			return
		}
		if !ok {
			response.Fail(c, "无权限查看该群聊天记录", nil)
			return
		}
	}
	// fmt.Printf("ChatLogList查询参数: %+v", query)
	list, total := service.Chat.ChatLogList(query.Page, query.PageSize, query)
	data := model.ListRes{List: list, Total: total}
	response.Success(c, data, "")
}

//	GroupList godoc
//
// @Summary     群组列表
// @Description 群组列表
// @Tags        聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       userId   query     int            false  "User.ID"
// @Param       groupName   query     string            false  "Group.groupName"
// @Success     200  {object} response.ResType
// @Router      /mobile/chat/groups [get]
func (ch *Chat) GroupList(c *gin.Context) {
	userId := model.GetUserUid(c)
	groupName := c.Query("groupName")
	list, err := service.Chat.ChatGroupResList(userId, groupName)
	if err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	response.Success(c, list, "")
}

// GroupInfo godoc
//
// @Summary     群聊信息
// @Description 获取群聊信息（群主/管理员/群成员可查看）
// @Tags        聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       groupId path    int true "群组id"
// @Success     200  {object} response.ResType
// @Router      /mobile/chat/groups/{groupId} [get]
func (ch *Chat) GroupInfo(c *gin.Context) {
	groupId := cast.ToInt(c.Param("groupId"))
	if groupId <= 0 {
		response.Fail(c, "参数错误", "groupId不能为空")
		return
	}
	currentUserId := model.GetUserUid(c)
	if currentUserId == "" {
		response.Fail(c, "用户id不能为空", nil)
		return
	}
	group, err := service.Chat.GetChatGroupInfoRes(currentUserId, groupId)
	if err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	response.Success(c, group, "")
}

// AddGroup godoc
//
// @Summary     创建群聊
// @Description 创建群聊
// @Tags        聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       user body     model.ChatGroup true "需要上传的json"
// @Success     200  {object} model.ChatGroup
// @Router      /mobile/chat/groups [post]
func (ch *Chat) AddGroup(c *gin.Context) {
	group := &model.ChatGroup{}
	if err := c.ShouldBindJSON(&group); err != nil {
		// 字段参数校验
		response.Fail(c, "参数错误", err.Error())
		return
	}
	currentUserId := model.GetUserUid(c)
	if currentUserId == "" {
		response.Fail(c, "用户id不能为空", nil)
		return
	}
	group.UserId = currentUserId
	err := service.Chat.CreateGroup(group)
	if err != nil {
		response.Fail(c, "创建失败", err.Error())
		return
	}
	response.Success(c, group.ID, "添加成功")
}

// UpdateGroup godoc
//
// @Summary     修改群聊信息
// @Description 修改群聊信息（仅群主可修改）
// @Tags        聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       groupId path    int true "群组id"
// @Param       payload body    model.UpdateChatGroup true "需要上传的json"
// @Success     200  {object} response.ResType
// @Router      /mobile/chat/groups/{groupId} [patch]
func (ch *Chat) UpdateGroup(c *gin.Context) {
	groupId := cast.ToInt(c.Param("groupId"))
	if groupId <= 0 {
		response.Fail(c, "参数错误", "groupId不能为空")
		return
	}
	payload := &model.UpdateChatGroup{}
	if err := c.ShouldBindJSON(payload); err != nil {
		response.Fail(c, "参数错误", err.Error())
		return
	}
	currentUserId := model.GetUserUid(c)
	if currentUserId == "" {
		response.Fail(c, "用户id不能为空", nil)
		return
	}

	// 群名不允许被更新为空字符串，其他字段允许置空（例如清空公告）
	if payload.GroupName != nil && strings.TrimSpace(*payload.GroupName) == "" {
		response.Fail(c, "参数错误", "groupName不能为空")
		return
	}

	if err := service.Chat.UpdateChatGroup(currentUserId, groupId, payload); err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	response.Success(c, true, "操作成功")
}

// DelGroup godoc
//
// @Summary     删除群聊
// @Description 删除群聊
// @Tags        聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       groupId path    string true "群组id"
// @Success     200  {object} response.ResType
// @Router      /mobile/chat/groups/{groupId} [delete]
func (ch *Chat) DelGroup(c *gin.Context) {
	userId := model.GetUserUid(c)
	groupId := cast.ToInt(c.Param("groupId"))
	bool := service.Chat.DeleteGroup(userId, groupId)
	if !bool {
		response.Fail(c, "删除失败", nil)
		return
	}
	response.Success(c, bool, "删除成功")
}

//	GroupList godoc
//
// @Summary     群成员列表
// @Description 群成员列表
// @Tags        聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       groupId   query     int            true  "ChatGroup.ID"
// @Success     200  {object} response.ResType
// @Router      /mobile/chat/groupMembers [get]
func (ch *Chat) GroupMemberList(c *gin.Context) {
	groupId := c.Query("groupId")
	currentUserId := model.GetUserUid(c)
	if currentUserId == "" {
		response.Fail(c, "用户id不能为空", nil)
		return
	}
	gid := cast.ToInt(groupId)
	if gid <= 0 {
		response.Fail(c, "参数错误", "groupId不能为空")
		return
	}
	// 群成员列表必须校验权限，避免群成员被枚举
	ok, err := service.Chat.CanAccessChatGroup(currentUserId, gid)
	if err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	if !ok {
		response.Fail(c, "无权限查看该群成员", nil)
		return
	}
	list := service.Chat.ChatGroupMember(gid)
	response.Success(c, list, "")
}

// AddGroupMember godoc
//
// @Summary     添加群成员
// @Description 添加群成员
// @Tags        聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       user body     model.ChatGroupMember true "需要上传的json"
// @Success     200  {object} model.ChatGroupMember
// @Router      /mobile/chat/groupMembers [post]
func (ch *Chat) AddGroupMember(c *gin.Context) {
	member := &model.ChatGroupMember{}
	if err := c.ShouldBindJSON(&member); err != nil {
		// 字段参数校验
		response.Fail(c, "参数错误", err)
		return
	}
	currentUserId := model.GetUserUid(c)
	if currentUserId == "" {
		response.Fail(c, "用户id不能为空", nil)
		return
	}
	member.UserId = currentUserId
	err := service.Chat.CreateChatGroupMember(member)
	if err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	response.Success(c, member.ID, "添加成功")
}

// RemoveGroupMember godoc
//
// @Summary     删除群成员
// @Description 群主/管理员删除群成员
// @Tags        聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       groupId path   int    true "群组id"
// @Param       userId  path   string true "成员用户id"
// @Success     200  {object} response.ResType
// @Router      /mobile/chat/groupMembers/{groupId}/{userId} [delete]
func (ch *Chat) RemoveGroupMember(c *gin.Context) {
	currentUserId := model.GetUserUid(c)
	if currentUserId == "" {
		response.Fail(c, "用户id不能为空", nil)
		return
	}
	groupId := cast.ToInt(c.Param("groupId"))
	memberUserId := strings.TrimSpace(c.Param("userId"))
	if groupId <= 0 || memberUserId == "" {
		response.Fail(c, "参数错误", "groupId/userId不能为空")
		return
	}
	if err := service.Chat.RemoveChatGroupMember(currentUserId, groupId, memberUserId); err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	response.Success(c, true, "操作成功")
}

// ExitGroupMember godoc
//
// @Summary     退出群聊
// @Description 退出群聊
// @Tags        聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       groupId path   string true "需要上传的json"
// @Success     200  {object} response.ResType
// @Router      /mobile/chat/groupMembers/{groupId} [delete]
func (ch *Chat) ExitGroupMember(c *gin.Context) {
	userId := model.GetUserUid(c)
	groupId := cast.ToInt(c.Param("groupId"))
	bool := service.Chat.DeleteChatGroupMember(userId, groupId)
	bool = service.Chat.DeleteGroupFriends(userId, groupId)
	//删除群关系
	if !bool {
		response.Fail(c, "退出失败", nil)
		return
	}
	response.Success(c, bool, "退出成功")
}
