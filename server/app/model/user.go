package model

type User struct {
	BaseModel // 基础 model
	// 用户名
	Username string `json:"username"`
	//密码
	Password string `json:"password"`
	// 是否管理员
	IsAdmin bool `json:"isAdmin"`
}
