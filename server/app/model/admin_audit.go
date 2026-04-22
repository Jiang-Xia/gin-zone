package model

// AdminAuditLog 管理端操作审计日志
type AdminAuditLog struct {
	BaseModel
	OperatorUserId string `gorm:"type:varchar(20);index;comment:操作者userId" json:"operatorUserId"`
	Action         string `gorm:"type:varchar(64);index;comment:操作动作" json:"action"`
	TargetType     string `gorm:"type:varchar(64);index;comment:操作对象类型" json:"targetType"`
	TargetID       string `gorm:"type:varchar(64);index;comment:操作对象标识" json:"targetId"`
	Reason         string `gorm:"type:varchar(255);comment:操作原因" json:"reason,omitempty"`
	BeforeValue    string `gorm:"type:text;comment:变更前值(JSON)" json:"beforeValue,omitempty"`
	AfterValue     string `gorm:"type:text;comment:变更后值(JSON)" json:"afterValue,omitempty"`
	IP             string `gorm:"type:varchar(64);comment:请求IP" json:"ip,omitempty"`
	UserAgent      string `gorm:"type:varchar(255);comment:请求UA" json:"userAgent,omitempty"`
}
