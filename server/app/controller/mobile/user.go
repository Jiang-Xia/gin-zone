package mobile

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type User struct{}

func (u *User) Login(c *gin.Context) {
	c.String(http.StatusOK, "请求输入用户名")
}
func (u *User) Register(c *gin.Context) {
	c.String(http.StatusOK, "请求输入用户名")
}
