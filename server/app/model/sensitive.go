package model

// SensitiveWord 敏感词表
type SensitiveWord struct {
	BaseModel
	Word   string `gorm:"type:varchar(128);uniqueIndex;comment:敏感词" json:"word"`
	Status int    `gorm:"comment:状态 1启用 0禁用;default:1" json:"status"`
	Level  int    `gorm:"comment:风险等级 1低 2中 3高;default:3" json:"level"`
	Remark string `gorm:"type:varchar(255);comment:备注" json:"remark,omitempty"`
}

// SensitiveHitLog 敏感词命中日志
type SensitiveHitLog struct {
	BaseModel
	Word      string `gorm:"type:varchar(128);index;comment:命中词" json:"word"`
	MessageID int    `gorm:"index;comment:命中消息id" json:"messageId"`
	SenderID  string `gorm:"type:varchar(20);index;comment:发送人userId" json:"senderId"`
	GroupID   int    `gorm:"index;comment:群组id" json:"groupId"`
	Content   string `gorm:"type:text;comment:命中原文" json:"content"`
}

type SensitiveWordQuery struct {
	ListQuery `gorm:"embedded"`
	Word      string `json:"word" form:"word"`
	Status    int    `json:"status" form:"status"` // -1全部 0禁用 1启用
	Level     int    `json:"level" form:"level"`   // -1全部 1低 2中 3高
}

type SensitiveWordCreateReq struct {
	Word   string `json:"word" binding:"required"`
	Status int    `json:"status"`
	Level  int    `json:"level"`
	Remark string `json:"remark,omitempty"`
}

type SensitiveWordUpdateReq struct {
	Word   string `json:"word,omitempty"`
	Status *int   `json:"status,omitempty"`
	Level  *int   `json:"level,omitempty"`
	Remark string `json:"remark,omitempty"`
}

type SensitiveHitLogQuery struct {
	ListQuery `gorm:"embedded"`
	Word      string `json:"word" form:"word"`
	SenderID  string `json:"senderId" form:"senderId"`
	GroupID   int    `json:"groupId" form:"groupId"`
}
