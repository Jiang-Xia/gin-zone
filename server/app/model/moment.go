package model

// Moment 动态表
type Moment struct {
	BaseModel
	Content string `gorm:"comment:动态内容;" json:"content"`
	Title   string `gorm:"comment:动态标题;" json:"title"`
	Urls    string `gorm:"comment:动态图片和视频;" json:"urls"`
	UserId  string `gorm:"comment:用户id;" json:"userId"`
}
