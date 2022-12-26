package mobile

import (
	"bytes"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"net/http"
)

type Chat struct {
}

var upGrader = websocket.Upgrader{
	// 解决跨域问题
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Chating webSocket请求ping 返回pong
func (u *Chat) Chating(c *gin.Context) {
	//升级get请求为webSocket协议
	ws, err := upGrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
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
