package response

import (
	"fmt"
	"net/http"
	"reflect"

	"gitee.com/jiang-xia/gin-zone/server/pkg/tip"
	"gitee.com/jiang-xia/gin-zone/server/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	"github.com/sirupsen/logrus"
)

// JSON 响应 200 和 JSON 数据，没有code
func JSON(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, data)
}

// Ok 成功响应，不需要Data数据
func Ok(c *gin.Context, code int) {
	JSON(c, gin.H{
		"code": code,
		"msg":  defaultMessage("操作成功！", tip.Msg(code)),
	})
}

// Success 成功响应，需要Data数据
func Success(c *gin.Context, data interface{}, args ...interface{}) {
	var code int
	var msg = tip.Msg(tip.Success)

	// 如果传入args，int类型为code， string类型为msg
	if len(args) > 0 {
		code, msg = handleMessage(args[0])
	}

	// 如果没有传入args，则code为0， msg为操作成功
	JSON(c, gin.H{
		"code": code,
		"data": data,
		"msg":  msg,
	})
}

// Fail 失败响应，不需要Data
func Fail(c *gin.Context, code int, args ...interface{}) {
	var msg string

	t := reflect.TypeOf(args)

	if t.String() == "string" { // msg
		msg = fmt.Sprintf("%v", args)
	} else { // code
		msg = tip.Msg(code)
	}

	c.JSON(http.StatusInternalServerError, gin.H{
		"code": code,
		"msg":  defaultMessage("操作失败！", msg),
	})
}

// Bad 失败响应，需要Data
func Bad(c *gin.Context, code int, data interface{}, msg ...string) {
	c.JSON(http.StatusInternalServerError, gin.H{
		"code": code,
		"data": data,
		"msg":  defaultMessage("操作失败！", msg...),
	})
}

// Error 响应 404 或 422，未传参 msg 时使用默认消息
// 处理请求时出现错误 err，会附带返回 error 信息，如登录错误、找不到 ID 对应的 Model
func Error(c *gin.Context, err error, msg ...string) {
	logrus.Error(err)

	// error 类型为『数据库未找到内容』
	if err == gorm.ErrRecordNotFound {
		Error404(c)
		return
	}

	c.AbortWithStatusJSON(http.StatusUnprocessableEntity, gin.H{
		"msg":   defaultMessage("请求处理失败，", msg...),
		"error": err.Error(),
	})
}

// Error404 响应 404，未传参 msg 时使用默认消息
func Error404(c *gin.Context, msg ...string) {
	c.AbortWithStatusJSON(http.StatusNotFound, gin.H{
		"msg": defaultMessage("数据不存在，请确定请求正确", msg...),
	})
}

// Error500 响应 500，未传参 msg 时使用默认消息
func Error500(c *gin.Context, msg ...string) {
	c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
		"msg": defaultMessage("服务器内部错误，请稍后再试", msg...),
	})
}

// defaultMessage 内用的辅助函数，用以支持默认参数默认值
// Go 不支持参数默认值，只能使用多变参数来实现类似效果
func defaultMessage(defaultMsg string, msg ...string) (message string) {
	if len(msg) > 0 {
		message = msg[0]
	} else {
		message = defaultMsg
	}

	return
}

// handleMessage 对传入的参数进行处理
func handleMessage(args interface{}) (code int, msg string) {
	code = 0
	msg = "查询返回成功"

	m := utils.Merge{}
	t := reflect.TypeOf(args)

	if t.String() == "string" { // msg
		msg = fmt.Sprintf("%v", args)
	} else { // code
		m.Interface2Type(args)
		code = m.Sum
		msg = tip.Msg(code)
	}

	return
}
