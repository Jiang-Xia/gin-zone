package model

// Moment 动态表
type Moment struct {
	BaseModel
	Content string `gorm:"comment:动态内容;" json:"content"`
	Urls    string `gorm:"comment:动态图片和视频;" json:"urls"`
	UserId  int    `gorm:"comment:用户id;" json:"-"`
	// 直接使用 UserId不行，orm默认使用User表名加本结构ID当成外键造成冲突了
	// 新增外键 默认的外键也需要
	UUniqId string `gorm:"comment:用户唯一id;" json:"uUniqId"`

	Location string `gorm:"comment:地点;" json:"location"`
	Likes    int64  `gorm:"comment:点赞数;" json:"likes"`
	Views    int64  `gorm:"comment:浏览数;" json:"views"`
	User     User   `json:"userInfo"`
}
type AddMoment struct {
	Content  string `gorm:"comment:动态内容;" json:"content"`
	Urls     string `gorm:"comment:动态图片和视频;" json:"urls"`
	UUniqId  string `gorm:"comment:用户id;" json:"uUniqId"`
	Location string `gorm:"comment:地点;" json:"location"`
}
