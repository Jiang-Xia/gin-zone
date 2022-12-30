package model

import (
	"strconv"

	"gitee.com/jiang-xia/gin-zone/server/middleware"
	"gitee.com/jiang-xia/gin-zone/server/pkg/hash"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type User struct {
	//gorm.Model
	BaseModel  `gorm:"embedded"` // 基础 model
	MainUser   `gorm:"embedded"`
	UpdateUser `gorm:"embedded"`
}

type MainUser struct {
	// 用户唯一id
	UserId string `json:"userId" gorm:"unique;comment:用户唯一id"`
	// 用户名
	UserName string `gorm:"comment:用户名;" json:"userName" binding:"required,min=4,max=12" label:"用户名" example:"test" `
	// 密码 - 不会json化
	Password string `gorm:"comment:密码;" json:"password" binding:"required,min=6,max=16" label:"密码" example:"123456"`
	// 是否管理员
	IsAdmin bool `gorm:"comment:是否管理员;" json:"isAdmin" default:"0"`
	// 是否已锁
	IsLock bool `gorm:"comment:是否已锁;" json:"isLock" default:"0"`
	// 微信openid
	WxOpenId   string `gorm:"comment:微信openid;" json:"-"`
	UpdateUser `gorm:"embedded"`
}

type UpdateUser struct {
	// 用户头像
	Avatar string `gorm:"comment:用户头像;" json:"avatar" example:"https://******.com/aa.png"`
	// 用户昵称
	NickName string `gorm:"comment:用户昵称;" json:"nickName" example:"酱"`
	//个人介绍
	Intro string `gorm:"comment:个人介绍;" json:"intro" example:"个人介绍"`
	// 邮箱
	Email string `gorm:"comment:邮箱;" json:"email" example:"123456789@qq.com"`
	// 性别
	Gender int `gorm:"comment:性别;" json:"gender"`
}

// LoginForm 登录
type LoginForm struct {
	UserName string `json:"userName" binding:"required,min=4,max=12" label:"用户名" example:"test"`
	Password string `json:"password" binding:"required,min=6,max=16" label:"密码" example:"123456"`
}

// ChangePassword 修改密码
type ChangePassword struct {
	LoginForm   `gorm:"embedded"`
	NewPassword string `json:"newPassword" binding:"required,min=6,max=16" label:"新密码" example:"123456"`
}

// BeforeCreate user 创建前hook 密码加密&权限控制
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.Password = hash.BcryptHash(u.Password)
	return nil
}

func (u *User) AfterCreate(tx *gorm.DB) (err error) {
	//先会执行这个插入的sql，再执行插入的sql
	if u.UserName == "" {
		tx.Model(u).Update("user_name", "user_"+strconv.Itoa(u.ID))
	}
	return nil
}

func GetUserID(c *gin.Context) int {
	token := c.GetHeader("authorization")
	uInfo, _ := middleware.NewJWT().ParseToken(token)
	return uInfo.ID
}
