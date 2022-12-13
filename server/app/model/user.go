package model

import (
	"fmt"
	"gitee.com/jiang-xia/gin-zone/server/middleware"
	"gitee.com/jiang-xia/gin-zone/server/pkg/hash"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"strconv"
)

type User struct {
	//gorm.Model
	BaseModel `gorm:"embedded"` // 基础 model
	MainUser  `gorm:"embedded"`
}

type MainUser struct {
	// 用户唯一id
	UserId int64 `json:"userId" gorm:"unique;`
	// 用户名
	UserName string `json:"userName" binding:"required,min=4,max=12" label:"用户名" example:"test"`
	// 密码 - 不会json化
	Password string `json:"password" binding:"required,min=6,max=16" label:"密码" example:"123456"`
	// 是否管理员
	IsAdmin bool `json:"isAdmin" default:"0"`
	// 是否管理员
	IsLock     bool `json:"isLock" default:"0"`
	UpdateUser `gorm:"embedded"`
}

type UpdateUser struct {
	Avatar string `json:"avatar" example:":https://******.com/aa.png"`
	// 用户昵称
	NickName string `json:"nickName" example:"酱"`
	// 邮箱
	Email string `json:"email" example:"123456789@qq.com"`
	// 性别
	Gender int `json:"gender"`
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
func (u *User) AfterSave(tx *gorm.DB) (err error) {
	fmt.Println("u.UserName", u.UserName == "", u.ID)
	if u.UserName == "" {
		tx.Model(&User{}).Where("id = ?", u.ID).Update("userName", "user_"+strconv.Itoa(u.ID))
	}
	return nil
}

func GetUserID(c *gin.Context) int {
	token := c.GetHeader("authorization")
	uInfo, _ := middleware.NewJWT().ParseToken(token)
	return uInfo.ID
}

type Oauth struct {
	//用户表id作为主键
	ID     int    `json:"id"`
	Type   int    `json:"type"`
	Openid string `json:"openid"`
	AuthId int64
	User   User `gorm:"foreignKey:AuthId"`
}
