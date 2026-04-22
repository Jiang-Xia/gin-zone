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
	UserId         string    `gorm:"comment:好友列表所属的用户id;" json:"userId"`
	FriendId       string    `gorm:"comment:好友id" json:"friendId"`
	GroupId        int       `gorm:"comment:群组id" json:"groupId"`
	LastReadTime   Time      `gorm:"comment:上次阅读消息时间" json:"lastReadTime"`
	User           User      `gorm:"foreignKey:FriendId;references:UserId;comment:用户数据;" json:"userInfo,omitempty"`
	ChatGroup      ChatGroup `gorm:"foreignKey:GroupId;references:ID;comment:群组数据;" json:"chatGroup,omitempty"`
	MsgType        int8      `json:"msgType"`
	LastMsg        string    `json:"lastMsg"`        // 最新消息
	NoReadMsgCount int       `json:"noReadMsgCount"` // 未读消息数
	LastInfoTime   Time      `json:"lastInfoTime"`   // 最新消息时间
}
type AddFriend struct {
	UserId       string `gorm:"comment:好友列表所属的用户id;" json:"userId"`
	FriendId     string `gorm:"comment:好友id" json:"friendId"`
	GroupId      int    `gorm:"comment:群组id" json:"groupId"`
	LastReadTime Time   `gorm:"comment:上次阅读消息时间" json:"lastReadTime"`
}

// ChatGroup 群组表
type ChatGroup struct {
	BaseModel
	Avatar    string `gorm:"comment:群头像;" json:"avatar,omitempty"`
	GroupName string `gorm:"comment:群名" json:"groupName,omitempty"`
	Intro     string `gorm:"comment:群介绍" json:"intro,omitempty"`
	Notice    string `gorm:"comment:群公告" json:"notice,omitempty"`
	UserId    string `gorm:"comment:群主用户id;" json:"userId,omitempty"`
}

// ChatGroupOwnerInfo 群主信息（用于群组信息展示）
type ChatGroupOwnerInfo struct {
	UserId   string `json:"userId,omitempty"`   // 中文注释：群主用户id
	UserName string `json:"userName,omitempty"` // 中文注释：群主用户名
	NickName string `json:"nickName,omitempty"` // 中文注释：群主昵称
	Avatar   string `json:"avatar,omitempty"`   // 中文注释：群主头像
}

// ChatGroupRes 群组信息返回结构（在 ChatGroup 基础上补充群主信息）
type ChatGroupRes struct {
	ChatGroup
	OwnerInfo *ChatGroupOwnerInfo `json:"ownerInfo,omitempty"` // 中文注释：群主信息（展示用）
}

// ChatGroupMember 群成员表
type ChatGroupMember struct {
	BaseModel
	UserId   string `gorm:"comment:成员用户id;" json:"userId"`
	GroupId  int    `gorm:"comment:群组id" json:"groupId"`
	UserInfo User   `gorm:"foreignKey:UserId;references:UserId;comment:用户数据;" json:"userInfo,omitempty"`
}

// ChatLog 聊天记录表
type ChatLog struct {
	BaseModel
	SenderId   string `gorm:"comment:发送人id;" json:"senderId"`
	ReceiverId string `gorm:"comment:接收人id;" json:"receiverId"`
	GroupId    int    `gorm:"comment:群组id;" json:"groupId"`
	Content    string `gorm:"comment:聊天内容;" json:"content"`
	LogType    int8   `gorm:"comment:记录类型 1-私聊记录 2-群聊记录;" json:"logType"`
	MsgType    int8   `gorm:"comment:消息类型 1-文本 2-图片 3-视频 4-音频; 5-其他" json:"msgType"`
	User       User   `gorm:"foreignKey:UserId;references:SenderId;comment:用户数据;" json:"userInfo"`
}

// ChatLogQuery 聊天记录查询结构体
type ChatLogQuery struct {
	ListQuery  `gorm:"embedded"`
	SenderId   string `json:"senderId"`
	ReceiverId string `json:"receiverId"`
	GroupId    int    `json:"groupId"`
	Content    string `json:"content"  example:""`
}

type UpdateReadTime struct {
	SenderId   string `json:"senderId"`
	ReceiverId string `json:"receiverId"`
	GroupId    int    `json:"groupId"`
}

// UpdateChatGroup 修改群聊信息（PATCH 语义：字段可选）
type UpdateChatGroup struct {
	Avatar    *string `json:"avatar,omitempty"`    // 中文注释：群头像（可选）
	GroupName *string `json:"groupName,omitempty"` // 中文注释：群名称（可选）
	Intro     *string `json:"intro,omitempty"`     // 中文注释：群介绍（可选）
	Notice    *string `json:"notice,omitempty"`    // 中文注释：群公告（可选）
}

// AdminChatFriendsQuery 管理端好友/群聊关系查询
type AdminChatFriendsQuery struct {
	ListQuery `gorm:"embedded"`
	UserId    string `json:"userId"`
	FriendId  string `json:"friendId"`
	GroupId   int    `json:"groupId"`
}

// AdminChatFriendRow 管理端-好友/群聊关系展示结构
type AdminChatFriendRow struct {
	ID            int    `gorm:"column:id" json:"id"`
	UserId        string `gorm:"column:user_id" json:"userId"`
	UserNickName  string `gorm:"column:user_nick_name" json:"userNickName,omitempty"`
	UserAvatar    string `gorm:"column:user_avatar" json:"userAvatar,omitempty"`
	FriendId      string `gorm:"column:friend_id" json:"friendId,omitempty"`
	FriendNickName string `gorm:"column:friend_nick_name" json:"friendNickName,omitempty"`
	FriendAvatar  string `gorm:"column:friend_avatar" json:"friendAvatar,omitempty"`
	GroupId       int    `gorm:"column:group_id" json:"groupId,omitempty"`
	GroupName     string `gorm:"column:group_name" json:"groupName,omitempty"`
	GroupAvatar   string `gorm:"column:group_avatar" json:"groupAvatar,omitempty"`
	CreatedAt     Time   `gorm:"column:created_at" json:"createdAt,omitempty"`
}

// AdminChatGroupsQuery 管理端群组查询
type AdminChatGroupsQuery struct {
	ListQuery  `gorm:"embedded"`
	GroupName  string `json:"groupName"`
}

// AdminChatGroupRow 管理端-群组列表行（补充群主昵称，便于直接展示）
type AdminChatGroupRow struct {
	ID            int    `gorm:"column:id" json:"id"`
	Avatar        string `gorm:"column:avatar" json:"avatar,omitempty"`
	GroupName     string `gorm:"column:group_name" json:"groupName,omitempty"`
	Intro         string `gorm:"column:intro" json:"intro,omitempty"`
	Notice        string `gorm:"column:notice" json:"notice,omitempty"`
	UserId        string `gorm:"column:user_id" json:"userId,omitempty"`
	OwnerNickName string `gorm:"column:owner_nick_name" json:"ownerNickName,omitempty"`
	CreatedAt     Time   `gorm:"column:created_at" json:"createdAt,omitempty"`
}
