package model

import (
	"errors"

	"gitee.com/jiang-xia/gin-zone/server/pkg/hash"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type User struct {
	BaseModel `gorm:"embedded"` // 基础 model
	MainUser  `gorm:"embedded"`
}

type MainUser struct {
	// 用户唯一id
	UserId int64 `json:"userId"`
	// 用户名
	UserName string `json:"userName"`
	// 用户昵称
	NickName string `json:"nickName"`
	// 密码
	Password string `json:"password"`
	// 邮箱
	Email string `json:"email"`
	// 性别
	Gender int `json:"gender"`
	// 是否管理员
	IsAdmin bool `json:"isAdmin"`
	// 是否管理员
	IsLock bool `json:"isLock"`
}

type LoginForm struct {
	UserName string
	Password string
}

// user 创建前hook 密码加密&权限控制
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.Password = hash.BcryptHash(u.Password)
	return nil
}

/*
*
校验用户名
*/
func (u *User) checkName() (err error) {
	nameLen := len(u.UserName)

	if !(nameLen < 12) {
		err = errors.New("用户名长度必须是4到12位")
		return
	}
	return
}

// CurrentUserID 从 gin.context 中获取当前登录用户 ID
func CurrentUserID(c *gin.Context) string {
	return c.GetString("current_user_id")
}
