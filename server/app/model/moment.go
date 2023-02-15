package model

// Moment 动态表
type Moment struct {
	BaseModel
	Content  string `gorm:"comment:动态内容;" json:"content"`
	Urls     string `gorm:"comment:动态图片和视频;" json:"urls"`
	UserId   string `gorm:"comment:用户id;" json:"userId"`
	Location string `gorm:"comment:地点;" json:"location"`
	Likes    int64  `gorm:"comment:点赞数;" json:"likes"`
	Views    int64  `gorm:"comment:浏览数;" json:"views"`
	// 多对一的写法，需要在当前多的结构体中写，外键和引用。
	User User `gorm:"foreignKey:UserId;references:UserId;comment:用户数据;" json:"userInfo"`
}
type AddMoment struct {
	Content  string `gorm:"comment:动态内容;" json:"content"`
	Urls     string `gorm:"comment:动态图片和视频;" json:"urls"`
	UserId   string `gorm:"comment:用户id;" json:"userId"`
	Location string `gorm:"comment:地点;" json:"location"`
}
