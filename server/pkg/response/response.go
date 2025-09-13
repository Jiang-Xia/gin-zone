package response

import (
	"context"
	"encoding/hex"
	"encoding/json"
	"net/http"

	"gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/config"
	"gitee.com/jiang-xia/gin-zone/server/pkg/log"
	"gitee.com/jiang-xia/gin-zone/server/pkg/tip"
	"github.com/gin-gonic/gin"
	"github.com/tjfoc/gmsm/sm4"
)

// ResType 响应数据格式化类型
type ResType struct {
	Code    int         `json:"code" default:"0"`
	Msg     string      `json:"msg" default:"操作成功"`
	Data    interface{} `json:"data"`
	Encrypt string      `json:"encrypt" default:""`
}

// JSON 响应 200 和 JSON 数据，没有code
func JSON(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, data)
}

// Response 自定义响应
func Response(c *gin.Context, code int, data interface{}) bool {
	res := ResType{
		Code: code,
		Msg:  tip.Msg(code),
		Data: data,
	}
	if config.App.Env == "dev" {
		log.Infof("响应数据: %+v", res)
	}
	c.JSON(http.StatusOK, res)
	return true
}

// Success 成功响应
func Success(c *gin.Context, data interface{}, msg string) bool {
	if msg == "" {
		msg = tip.Msg(tip.Success)
	}
	res := ResType{
		Code: tip.Success,
		Msg:  msg,
		Data: data,
	}
	err := crypto(c, &res)
	if err != nil {
		res.Msg = "报文加密失败"
		res.Data = ""
	}

	if config.App.Env == "dev" {
		log.Infof("响应数据: %+v", res)
	}
	c.JSON(http.StatusOK, res)
	return true
}

// Fail 失败响应
func Fail(c *gin.Context, msg string, data interface{}) bool {
	res := ResType{
		Code: tip.Error,
		Msg:  msg,
		Data: data,
	}

	err := crypto(c, &res)
	if err != nil {
		res.Msg = "报文加密失败"
		res.Data = ""
	}
	log.Infof("失败响应数据: %+v", res)
	c.JSON(http.StatusOK, res)
	return true
}

var ctx = context.Background()

// 加解密统一处理
func crypto(c *gin.Context, res *ResType) error {
	security := c.Request.Header.Get("Jx-Security")
	sessionId := c.Request.Header.Get("Jx-SessionId")
	if security == "Jx-Security" {
		sm4Key, err := database.Redis().Get(ctx, "sessionId:"+sessionId).Result()
		sm4KeyBytes, err := hex.DecodeString(sm4Key)
		strContent, err := json.Marshal(res.Data)
		encryptedData, err := sm4.Sm4Ecb(sm4KeyBytes, strContent, true)
		if err != nil {
			log.Error(err)
			return err
		}
		hexSrt := hex.EncodeToString(encryptedData)
		res.Encrypt = hexSrt
		res.Data = ""
	}
	return nil
}

//常用格式化函数 Printf 格式化字符串输出到终端 Sprintf 格式化并返回一符串而不输出到终端
