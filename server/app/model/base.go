package model

import (
	"time"

	"gitee.com/jiang-xia/gin-zone/server/pkg/utils"
	"github.com/spf13/cast"
	"gorm.io/gorm"
)

// BaseModel 基础model
type BaseModel struct {
	// 自增id
	ID uint `gorm:"primaryKey;autoIncrement;" json:"id"`
	// 创建时间
	CreatedAt time.Time `gorm:"column:created_at" json:"createdAt"`
	// 更新时间
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

// 创建记录时可用的 hook  自动添加创建时间和更新时间
func (v *BaseModel) BeforeCreate(tx *gorm.DB) error {
	tx.UpdateColumn("created_at", utils.NowTime())
	tx.UpdateColumn("updated_at", utils.NowTime())
	return nil
}

// 更新数据时可用的 hook  自动添加创建时间和更新时间
func (v *BaseModel) BeforeUpdate(tx *gorm.DB) error {
	tx.UpdateColumn("updated_at", utils.NowTime())
	return nil
}

// StringID 获取 ID 的字符串格式
func (v *BaseModel) StringID() string {
	return cast.ToString(v.ID)
}
