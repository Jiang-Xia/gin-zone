package model

import (
	"github.com/spf13/cast"
	"time"
)

// BaseModel 基础model
type BaseModel struct {
	// 自增id
	ID int `gorm:"comment:自增id;primaryKey;autoIncrement;" json:"id"`
	// 创建时间
	CreatedAt time.Time `gorm:"comment:创建时间;column:created_at" json:"createdAt"`
	// 更新时间
	UpdatedAt time.Time `gorm:"comment:更新时间;column:updated_at" json:"updatedAt"`
}

// gorm hook 文档 ：https://gorm.io/zh_CN/docs/hooks.html
// 创建记录时可用的 hook  自动添加创建时间和更新时间
// func (v *BaseModel) BeforeCreate(tx *gorm.DB) error {
// 	tx.UpdateColumn("created_at", utils.NowTime())
// 	tx.UpdateColumn("updated_at", utils.NowTime())
// 	return nil
// }

// // 更新数据时可用的 hook  自动添加创建时间和更新时间
// func (v *BaseModel) BeforeUpdate(tx *gorm.DB) error {
// 	tx.UpdateColumn("updated_at", utils.NowTime())
// 	return nil
// }

// StringID 获取 ID 的字符串格式
func (v *BaseModel) StringID() string {
	return cast.ToString(v.ID)
}

// ListRes 返回列表数据结构体
type ListRes struct {
	List  interface{} `json:"list"`
	Total int64       `json:"total"`
}
