package model

type User struct {
	BaseModel `gorm:"embedded"` // 基础 model
	// 用户唯一id
	UserId int64 `json:"userId"`
	// 用户名
	UserName string `json:"userName"`
	// 用户昵称
	NickName string `json:"nickName"`
	//密码
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
