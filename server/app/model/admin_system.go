package model

// AdminUserListQuery 管理端用户列表查询
type AdminUserListQuery struct {
	ListQuery `gorm:"embedded"`
	Keyword   string `json:"keyword" form:"keyword"`
	Status    int    `json:"status" form:"status"` // -1全部 0正常 1封禁
}

// AdminUserRestrictReq 管理端用户封禁请求
type AdminUserRestrictReq struct {
	IsLock bool   `json:"isLock"`           // true=封禁 false=解封
	Reason string `json:"reason,omitempty"` // 封禁原因（可选）
}

// AdminAuditLogQuery 管理端审计日志查询
type AdminAuditLogQuery struct {
	ListQuery      `gorm:"embedded"`
	OperatorUserId string `json:"operatorUserId" form:"operatorUserId"`
	Action         string `json:"action" form:"action"`
	TargetType     string `json:"targetType" form:"targetType"`
	StartAt        string `json:"startAt" form:"startAt"` // 起始时间（yyyy-MM-dd HH:mm:ss）
	EndAt          string `json:"endAt" form:"endAt"`     // 结束时间（yyyy-MM-dd HH:mm:ss）
}

// SysConfig 系统配置表（KV）
type SysConfig struct {
	BaseModel
	ConfigKey   string `gorm:"type:varchar(64);uniqueIndex;comment:配置键" json:"configKey"`
	ConfigValue string `gorm:"type:text;comment:配置值" json:"configValue"`
	Remark      string `gorm:"type:varchar(255);comment:配置说明" json:"remark,omitempty"`
}

// SysConfigUpdateReq 系统配置更新请求
type SysConfigUpdateReq struct {
	Items []SysConfigItem `json:"items" binding:"required"`
}

// SysConfigItem 系统配置项
type SysConfigItem struct {
	ConfigKey   string `json:"configKey" binding:"required"`
	ConfigValue string `json:"configValue"`
	Remark      string `json:"remark,omitempty"`
}

// SysConfigCreateReq 系统配置新增请求
type SysConfigCreateReq struct {
	ConfigKey   string `json:"configKey" binding:"required"`
	ConfigValue string `json:"configValue"`
	Remark      string `json:"remark,omitempty"`
}

// SysConfigEditReq 系统配置编辑请求
type SysConfigEditReq struct {
	ConfigValue string `json:"configValue"`
	Remark      string `json:"remark,omitempty"`
}
