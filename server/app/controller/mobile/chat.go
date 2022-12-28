package mobile

import (
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
