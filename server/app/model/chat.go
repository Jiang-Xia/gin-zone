package model

import (
	"encoding/json"
	"fmt"
	"gitee.com/jiang-xia/gin-zone/server/pkg/log"
	"github.com/gorilla/websocket"
	"time"
)

/*
fmt.Printf()常用格式化打印符号
%v在打印接口类型时，会打印出其实际的值。而在打印结构体对象时，打印的是结构体成员对象的值。
%+v打印结构体对象中的字段类型+字段值。
%#v先打印结构体名，再输出结构体对象的字段类型+字段的值。
*/

// Client 客户端结构体
type Client struct {
	ID         string
	IpAddress  string
	IpSource   string
	UserId     int64
	Socket     *websocket.Conn
	SendChan   chan []byte
	Start      time.Time
	ExpireTime time.Duration // 一段时间没有接收到心跳则过期
}

// ClientManager 客户端管理结构体
type ClientManager struct {
	Clients        map[string]*Client // 记录在线用户 (上线增加一个客户端)
	BroadcastChan  chan []byte        //触发消息广播 (当前广播的消息)
	RegisterChan   chan *Client       // 触发新用户登陆 (当前登录的客户端)
	UnRegisterChan chan *Client       // 触发用户退出(当前退出的客户端)
}

// WsMessage 消息模板结构体
type WsMessage struct {
	Cmd  string      `json:"cmd"`
	Data interface{} `json:"data"`
}

// Manager 管理实例声明
var Manager = ClientManager{
	Clients:        make(map[string]*Client), // 初始化chan(实例化)
	BroadcastChan:  make(chan []byte),
	RegisterChan:   make(chan *Client),
	UnRegisterChan: make(chan *Client),
}

// Read 读取客户端发送过来的消息
func (c *Client) Read() {
	// 出现故障后把当前客户端注销(即不是无限循环 阻塞着就关闭)
	defer func() {
		fmt.Println("用户:", c.UserId, "关闭Socket连接")
		_ = c.Socket.Close()
		// 退出
		Manager.UnRegisterChan <- c
	}()
	sum := 0
	// 无限循环 应用服务器常用于监听
	for {
		sum++
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
		if err != nil {
			log.Error(err.Error())
			break
		}
		fmt.Printf("客户端所发信息:%+v ", msg)
		switch msg.Cmd {
		case "ping":
			// 如果是心跳监测消息（利用心跳监测来判断对应客户端是否在线）
			resp, _ := json.Marshal(&WsMessage{Cmd: "ping", Data: "pong"})
			c.Start = time.Now() // 重新刷新时间
			// 发送变量到 SendChan 通道中
			c.SendChan <- resp
		case "online":
			// 获取在线人数
			count := len(Manager.Clients)
			resp, _ := json.Marshal(&WsMessage{Cmd: "online", Data: count})
			c.SendChan <- resp
		case "history":
			// 获取消息历史记录
			_data := ChatRecord() //你的获取消息记录的操作
			resp, _ := json.Marshal(&WsMessage{Cmd: "history", Data: _data})
			c.SendChan <- resp
		case "text":
			// 发送文本消息
			resp, _ := json.Marshal(&WsMessage{Cmd: "text", Data: msg.Data})
			Manager.BroadcastChan <- resp
		case "file":
			// 发送文本消息
			resp, _ := json.Marshal(&WsMessage{Cmd: "file", Data: msg.Data})
			Manager.BroadcastChan <- resp
		case "recall":
			// 你的撤回消息的操作
			c.SendChan <- []byte("回复消息")

		}
		fmt.Println("sum:", sum, "次")
	}
}

// Write 把对应消息写回客户端
func (c *Client) Write() {
	defer func() {
		_ = c.Socket.Close()
		Manager.UnRegisterChan <- c
	}()
	for {
		select {
		//监听是否有消息发送
		case msg, ok := <-c.SendChan:
			if !ok {
				// 没有消息则发送空响应
				err := c.Socket.WriteMessage(websocket.CloseMessage, []byte{})
				if err != nil {
					log.Error(err.Error())
					return
				}
				return
			}
			var wsMsg WsMessage
			err := json.Unmarshal(msg, &wsMsg)
			fmt.Printf("服务端所发信息:%+v ", wsMsg)
			err = c.Socket.WriteMessage(websocket.TextMessage, msg)
			if err != nil {
				log.Error(err.Error())
				return
			}
		}
	}
}

// Check 实时监测过期
func (c *Client) Check() {
	for {
		now := time.Now()
		var duration = now.Sub(c.Start)
		if duration >= c.ExpireTime {
			// 过期退出
			Manager.UnRegisterChan <- c
			break
		}
	}
}

// Start 开始监听有人连接
func (manager *ClientManager) Start() {
	for {
		select {
		case conn := <-Manager.RegisterChan:
			Manager.Clients[conn.ID] = conn
			// 如果有新用户连接则发送最近聊天记录和在线人数给他
			count := len(Manager.Clients)
			Manager.InitSend(conn, count)
		}
	}
}

// InitSend 初始化客户端管理器
func (manager *ClientManager) InitSend(cur *Client, count int) {
	// 初始化时发送在线人数
	resp, _ := json.Marshal(&WsMessage{Cmd: "online", Data: count})
	Manager.BroadcastChan <- resp

	// 初始化时 发送历史聊天记录
	_data := YouChatHistoryList() //获取聊天室历史消息记录操作
	resp, _ = json.Marshal(&WsMessage{Cmd: "history", Data: _data})
	cur.SendChan <- resp
}

// BroadcastSend 群发消息
func (manager *ClientManager) BroadcastSend() {
	for {
		select {
		// 只要有一方发消息就广播
		case msg := <-Manager.BroadcastChan:
			//广播给所有的在线客户端
			for _, conn := range Manager.Clients {
				conn.SendChan <- msg
			}
		}
	}
}

// Quit 离线用户触发删除
func (manager *ClientManager) Quit() {
	for {
		select {
		case conn := <-Manager.UnRegisterChan:
			//删除对应在线客户端
			delete(Manager.Clients, conn.ID)
			// 给客户端刷新在线人数
			resp, _ := json.Marshal(&WsMessage{Cmd: "online", Data: len(Manager.Clients)})
			//有人退出时 广播刷新在线人数
			manager.BroadcastChan <- resp
		}
	}
}

// ChatRecord 获取聊天记录
func ChatRecord() (data interface{}) {
	return
}

// YouChatHistoryList 获取聊天记录
func YouChatHistoryList() (data interface{}) {
	return
}
