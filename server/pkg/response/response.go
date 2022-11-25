package response

import (
	"net/http"

	"gitee.com/jiang-xia/gin-zone/server/pkg/tip"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// JSON 响应 200 和 JSON 数据，没有code
func JSON(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, data)
}

func Response(c *gin.Context, code int, data interface{}) bool {
	c.JSON(http.StatusOK, gin.H{
		"code": code,
		"msg":  tip.Msg(code),
		"data": data,
	})
	return true
}

func Success(c *gin.Context, data interface{}) bool {
	c.JSON(http.StatusOK, gin.H{
		"code": tip.Success,
		"msg":  tip.Msg(tip.Success),
		"data": data,
	})
	logrus.Info(tip.Msg(tip.Success), data)
	return true
}

func Fail(c *gin.Context, msg string, data interface{}) bool {
	c.JSON(http.StatusOK, gin.H{
		"code": tip.Error,
		"msg":  msg,
		"data": data,
	})
	logrus.Info(msg)
	return true
}
