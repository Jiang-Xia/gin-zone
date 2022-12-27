package mobile

import (
	"bytes"
	"crypto/md5"
	"fmt"
	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gitee.com/jiang-xia/gin-zone/server/pkg/log"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/spf13/cast"
	"net/http"
	"time"
)

type Chat struct {
}

var upGrader = websocket.Upgrader{
	// 解决跨域问题
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func init() {
	go model.Manager.Start()
	go model.Manager.Quit()
	go model.Manager.BroadcastSend()
}

// Chating webSocket请求ping 返回pong
func (ch *Chat) Chating(c *gin.Context) {
	//升级get请求为webSocket协议
	ws, err := upGrader.Upgrade(c.Writer, c.Request, nil)
	fmt.Println("升级协议", "ua:", c.Request.Header["User-Agent"], "referer:", c.Request.Header["Referer"])
	if err != nil {
		return
	}
	fmt.Println("webSocket 建立连接:", ws.RemoteAddr().String())

	defer ws.Close()
	for {
		//读取ws中的数据
		mt, message, err := ws.ReadMessage()
		if err != nil {
			break
		}
		buffer := bytes.Buffer{}
		buffer.Write([]byte("您的消息为："))
		fmt.Println("客户端消息：", message)
		buffer.Write(message)
		//写入ws数据
		err = ws.WriteMessage(mt, buffer.Bytes())
		if err != nil {
			break
		}
	}
}

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
	client := &model.Client{
		ID:     idMd5,
		Socket: conn, Send: make(chan []byte),
		IpAddress:  ip,
		IpSource:   "未知",
		UserId:     userid,
		Start:      time.Now(),
		ExpireTime: time.Minute * 1,
	}
	model.Manager.Register <- client
	go client.Read() // 以goroutine的方式调用Client的Read、Write、Check方法
	go client.Write()
	go client.Check()
}
