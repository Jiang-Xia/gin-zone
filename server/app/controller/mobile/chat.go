package mobile

import (
	"crypto/md5"
	"fmt"
	"net/http"
	"time"

	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gitee.com/jiang-xia/gin-zone/server/app/service"
	"gitee.com/jiang-xia/gin-zone/server/pkg/log"
	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/spf13/cast"
)

type Chat struct {
}

var upGrader = websocket.Upgrader{
	// 解决跨域问题
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// 初始化 执行客户端管理方法
func init() {
	go model.Manager.Start()
	go model.Manager.Quit()
	go model.Manager.BroadcastSend()
}

// WebSocketHandle webSocket升级协议，并且初始化上线用户数据
func (ch *Chat) WebSocketHandle(ctx *gin.Context) {
	conn, err := (&websocket.Upgrader{
		// 决解跨域问题
		CheckOrigin: func(r *http.Request) bool { return true },
	}).Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		http.NotFound(ctx.Writer, ctx.Request)
		log.Error(err.Error())
		return
	}
	userid := cast.ToInt64(ctx.Query("userId"))
	ip := ctx.ClientIP()
	//addr, err := common.GetIpAddressAndSource(ip)
	if err != nil {
		http.NotFound(ctx.Writer, ctx.Request)
		log.Error(err.Error())
		return
	}
	ua := ctx.GetHeader("User-Agent")
	id := ip + ua
	idMd5 := fmt.Sprintf("%x", md5.Sum([]byte(id)))
	//新用户(新的客户端) 连上就新建一个客户端实例
	client := &model.Client{
		ID:         idMd5,
		Socket:     conn,
		SendChan:   make(chan []byte),
		IpAddress:  ip,
		IpSource:   "未知",
		UserId:     userid,
		Start:      time.Now(),
		ExpireTime: time.Minute * 1,
	}
	// 使用通道Register发送变量client
	model.Manager.RegisterChan <- client
	fmt.Printf("client%v\n", client)
	go client.Read() // 以goroutine的方式调用Client的Read、Write、Check方法
	go client.Write()
	go client.Check()
}

//	godoc
//
// @Summary     好友列表
// @Description 好友列表
// @Tags        聊天模块
// @Accept      json
// @Produce     json
// @Param       userId   query     int            true  "User.ID"
// @Success     200  {object} response.ResType
// @Router      /mobile/chat/friends [get]
func (ch *Chat) FriendList(c *gin.Context) {
	userId := c.Query("userId")
	friends := service.Chat.ChatFriends(cast.ToInt(userId))
	response.Success(c, friends, "")
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
		return
	}
	logs, total := service.Chat.ChatLogList(1, 50, query)
	data := model.ListRes{List: logs, Total: total}
	response.Success(c, data, "")
}
