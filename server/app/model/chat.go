package model

/*
fmt.Printf()常用格式化打印符号
%v在打印接口类型时，会打印出其实际的值。而在打印结构体对象时，打印的是结构体成员对象的值。
%+v打印结构体对象中的字段类型+字段值。
%#v先打印结构体名，再输出结构体对象的字段类型+字段的值。
*/

/* 表-结构体*/

// ChatFriends 好友表
type ChatFriends struct {
	BaseModel
	UserId   string `gorm:"comment:好友所属的用户id;" json:"userId"`
	FriendId string `gorm:"comment:好友id" json:"friendId"`
	GroupId  int    `gorm:"comment:群组id" json:"groupId"`
}

// ChatGroup 群组表
type ChatGroup struct {
	BaseModel
	GroupName string `gorm:"comment:群名" json:"groupName"`
	Intro     string `gorm:"comment:群介绍" json:"intro"`
	Notice    string `gorm:"comment:群公告" json:"notice"`
	UserId    string `gorm:"comment:群主用户id;" json:"userId"`
}

// ChatGroupMember 群成员表
type ChatGroupMember struct {
	BaseModel
	UserId  string `gorm:"comment:成员用户id;" json:"userId"`
	GroupId int    `gorm:"comment:群组id" json:"groupId"`
}

// ChatLog 聊天记录表
type ChatLog struct {
	BaseModel
	SenderId   string `gorm:"comment:发送人id;" json:"senderId"`
	ReceiverId string `gorm:"comment:接收人id;" json:"receiverId"`
	GroupId    int    `gorm:"comment:群组id;" json:"groupId"`
	Content    string `gorm:"comment:聊天内容;" json:"content"`
	Remark     string `gorm:"comment:备注;" json:"remark"`
	LogType    int8   `gorm:"comment:记录类型 1-私聊记录 2-群聊记录;" json:"logType"`
	MsgType    int8   `gorm:"comment:消息类型 1-文本 2-图片 3-视频 4-音频; 5-其他" json:"msgType"`
}

// ChatLogQuery 聊天记录查询结构体
type ChatLogQuery struct {
	ListQuery  `gorm:"embedded"`
	SenderId   string `json:"senderId"`
	ReceiverId string `json:"receiverId"`
	GroupId    int    `json:"groupId"`
	Content    string `json:"content"  example:""`
}
