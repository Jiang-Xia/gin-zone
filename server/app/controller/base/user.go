package base

import (
	"net/http"

	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"github.com/gin-gonic/gin"
)

// User类，go类的写法
type User struct {
	model.User
}

// Register godoc
//
// @Summary 	注册接口
// @Description 用户注册接口
// @Tags 		用户模块
// @Accept 		json
// @Produce 	json
// @Param 		user body User false "需要上传的json"
// @Success 	200 {object} User
// @Router       /base/register [post]
func (u *User) Register(c *gin.Context) {
	c.JSON(http.StatusOK, "注册")
}

// Login godoc
//
// @Summary 	登录接口
// @Description 用户登录接口
// @Tags 		用户模块
// @Accept 		json
// @Produce 	json
// @Param 		user body User false "需要上传的json"
// @Success 	200 {object} User
// @Router       /base/login [post]
func (u *User) Login(c *gin.Context) {
	c.JSON(http.StatusOK, "登录")
}

// Login godoc
//
// @Summary 	用户信息
// @Description 用户信息接口
// @Tags 		用户模块
// @Accept 		json
// @Produce 	json
// @Param 		id path int true "用户id"
// @Success 	200 {object} User
// @Router       /base/users/{id} [get]
func (u *User) UserInfo(c *gin.Context) {
	c.JSON(http.StatusOK, "用户信息")
}

// UserList godoc
//
// @Summary 	用户列表
// @Description 用户列表接口
// @Tags 		用户模块
// @Accept 		json
// @Produce 	json
// @Param 		q    query   string  false  "username search by q"  Format(email)
// @Success 	200 {object} User
// @Router       /base/users [get]
func (u *User) UserList(c *gin.Context) {
	c.JSON(http.StatusOK, "用户列表")
}

// DeleteUser godoc
//
// @Summary 	删除用户
// @Description 删除用户接口
// @Tags 		用户模块
// @Accept 		json
// @Produce 	json
// @Param 		id path int true "用户id" (param name,param type,data type,is mandatory（是否鉴权）?,comment attribute(optional))
// @Success 	200 {object} User
// @Router       /base/delete/{id} [delete]
func (u *User) DeleteUser(c *gin.Context) {
	c.JSON(http.StatusOK, "删除用户")
}
