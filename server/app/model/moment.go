package model

// Moment 动态表
type Moment struct {
	BaseModel
	Content      string `gorm:"comment:动态内容;" json:"content"`
	Urls         string `gorm:"comment:动态图片和视频;" json:"urls"`
	UserId       string `gorm:"comment:用户id;" json:"userId"`
	Location     string `gorm:"comment:地点;" json:"location"`
	Likes        int64  `gorm:"comment:点赞数;" json:"likes"`
	Views        int64  `gorm:"comment:浏览数;" json:"views"`
	AllowComment bool   `gorm:"comment:是否允许评论;default:true;" json:"allowComment"`
	AllowReply   bool   `gorm:"comment:是否允许回复;default:true;" json:"allowReply"`
	CommentCount int64  `gorm:"comment:评论总数;" json:"commentCount"`
	// 多对一的写法，需要在当前多的结构体中写，外键和引用。用户结构体外键为UserId，引用到动态的UserId中
	User User `gorm:"foreignKey:UserId;references:UserId;comment:用户数据;" json:"userInfo"`
	// CommentPreview 动态列表默认回传 3 条评论预览（非持久化字段）
	CommentPreview []MomentComment `gorm:"-" json:"commentPreview"`
}
type AddMoment struct {
	Content      string `gorm:"comment:动态内容;" json:"content"`
	Urls         string `gorm:"comment:动态图片和视频;" json:"urls"`
	UserId       string `gorm:"comment:用户id;" json:"userId"`
	Location     string `gorm:"comment:地点;" json:"location"`
	AllowComment bool   `gorm:"comment:是否允许评论;" json:"allowComment"`
	AllowReply   bool   `gorm:"comment:是否允许回复;" json:"allowReply"`
}

// MomentComment 动态评论/回复（parentId=0 为评论，>0 为回复）
type MomentComment struct {
	BaseModel
	MomentId      int    `gorm:"comment:动态id;index;" json:"momentId"`
	UserId        string `gorm:"comment:评论用户id;index;" json:"userId"`
	ReplyToUserId string `gorm:"comment:被回复用户id;" json:"replyToUserId"`
	ParentId      int    `gorm:"comment:父评论id;" json:"parentId"`
	Content       string `gorm:"comment:内容;" json:"content"`
	IsDeleted     bool   `gorm:"comment:是否删除;default:false;" json:"isDeleted"`
	User          User   `gorm:"foreignKey:UserId;references:UserId;comment:评论用户;" json:"userInfo"`
	ReplyToUser   User   `gorm:"foreignKey:ReplyToUserId;references:UserId;comment:被回复用户;" json:"replyToUserInfo"`
}

type AddMomentComment struct {
	Content  string `json:"content"`
	ParentId int    `json:"parentId"`
}
