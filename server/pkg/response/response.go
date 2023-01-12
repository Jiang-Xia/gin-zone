package response

import (
	"net/http"

	"gitee.com/jiang-xia/gin-zone/server/pkg/log"
	"gitee.com/jiang-xia/gin-zone/server/pkg/tip"
	"github.com/gin-gonic/gin"
)

// ResType 响应数据格式化类型
type ResType struct {
	Code int         `json:"code" default:"0"`
	Msg  string      `json:"msg" default:"操作成功"`
	Data interface{} `json:"data"`
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
	// log.Infof("响应数据: %+v", res)
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
	log.Infof("成功响应数据: %+v", res)
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
	log.Infof("失败响应数据: %+v", res)
	c.JSON(http.StatusOK, res)
	return true
}

//常用格式化函数 Printf 格式化字符串输出到终端 Sprintf 格式化并返回一符串而不输出到终端
