package model

import (
	"encoding/json"
	"gitee.com/jiang-xia/gin-zone/server/pkg/log"
	"github.com/gorilla/websocket"
	"time"
)

// Client 客户端结构体
type Client struct {
	ID         string
	IpAddress  string
	IpSource   string
	UserId     interface{}
	Socket     *websocket.Conn
	Send       chan []byte
	Start      time.Time
	ExpireTime time.Duration // 一段时间没有接收到心跳则过期
}

// ClientManager 客户端管理结构体
type ClientManager struct {
	Clients    map[string]*Client // 记录在线用户
	Broadcast  chan []byte        //触发消息广播
	Register   chan *Client       // 触发新用户登陆
	UnRegister chan *Client       // 触发用户退出
}

// WsMessage 消息模板结构体
type WsMessage struct {
	Type int         `json:"type"`
	Data interface{} `json:"data"`
}

// Manager 管理实例声明
var Manager = ClientManager{
	Broadcast:  make(chan []byte),
	Register:   make(chan *Client),
	UnRegister: make(chan *Client),
	Clients:    make(map[string]*Client),
}

// Read 读取客户端发送过来的消息
func (c *Client) Read() {
	// 出现故障后把当前客户端注销
	defer func() {
		_ = c.Socket.Close()
		Manager.UnRegister <- c
	}()
	for {
		_, data, err := c.Socket.ReadMessage()
		if err != nil {
			log.Error(err.Error())
			break
		}
		var msg WsMessage
		err = json.Unmarshal(data, &msg)
		if err != nil {
			log.Error(err.Error())
			break
		}

		switch msg.Type {
		case 6:
			// 如果是心跳监测消息（利用心跳监测来判断对应客户端是否在线）
			resp, _ := json.Marshal(&WsMessage{Type: 6, Data: "pong"})
			c.Start = time.Now() // 重新刷新时间
			c.Send <- resp
		case 1:
			// 获取在线人数
			count := len(Manager.Clients)
			resp, _ := json.Marshal(&WsMessage{Type: 1, Data: count})
			c.Send <- resp
		case 2:
			// 获取消息历史记录
			_data := ChatRecord() //你的获取消息记录的操作
			resp, _ := json.Marshal(&WsMessage{Type: 2, Data: _data})
			c.Send <- resp
		case 3:
			// 发送文本消息
			resp, _ := json.Marshal(&WsMessage{Type: 3, Data: msg.Data})
			Manager.Broadcast <- resp

		case 4:
			// 你的撤回消息的操作
			c.Send <- []byte("回复消息")

		}
	}
}

// Write 把对应消息写回客户端
func (c *Client) Write() {
	defer func() {
		_ = c.Socket.Close()
		Manager.UnRegister <- c
	}()
	for {
		select {
		case msg, ok := <-c.Send:
			if !ok {
				// 没有消息则发送空响应
				err := c.Socket.WriteMessage(websocket.CloseMessage, []byte{})
				if err != nil {
					log.Error(err.Error())
					return
				}
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
	for {
		now := time.Now()
		var duration = now.Sub(c.Start)
		if duration >= c.ExpireTime {
			Manager.UnRegister <- c
			break
		}
	}
}

// Start 开始监听有人连接
func (manager *ClientManager) Start() {
	for {
		select {
		case conn := <-Manager.Register:
			Manager.Clients[conn.ID] = conn
			// 如果有新用户连接则发送最近聊天记录和在线人数给他
			count := len(Manager.Clients)
			Manager.InitSend(conn, count)
		}
	}
}

// InitSend 初始化客户端管理器
func (manager *ClientManager) InitSend(cur *Client, count int) {
	resp, _ := json.Marshal(&WsMessage{Type: 1, Data: count})
	Manager.Broadcast <- resp

	_data := YouChatHistoryList() //获取聊天室历史消息记录操作
	resp, _ = json.Marshal(&WsMessage{Type: 2, Data: _data})
	cur.Send <- resp
}

// BroadcastSend 群发消息
func (manager *ClientManager) BroadcastSend() {
	for {
		select {
		// 只要有一方发消息就广播
		case msg := <-Manager.Broadcast:
			for _, conn := range Manager.Clients {
				conn.Send <- msg
			}
		}
	}
}

// Quit 离线用户触发删除
func (manager *ClientManager) Quit() {
	for {
		select {
		case conn := <-Manager.UnRegister:
			delete(Manager.Clients, conn.ID)
			// 给客户端刷新在线人数
			resp, _ := json.Marshal(&WsMessage{Type: 1, Data: len(Manager.Clients)})
			manager.Broadcast <- resp
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
