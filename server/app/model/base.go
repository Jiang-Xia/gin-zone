package model

import (
	"database/sql/driver"
	"fmt"
	"time"

	"github.com/spf13/cast"
)

type JsonTime struct {
	time.Time
}

// MarshalJSON on JSONTime format Time field with %Y-%m-%d %H:%M:%S
func (t JsonTime) MarshalJSON() ([]byte, error) {
	formatted := fmt.Sprintf("\"%s\"", t.Format("2006-01-02 15:04:05"))
	return []byte(formatted), nil
}

// Value insert timestamp into mysql need this function.
func (t JsonTime) Value() (driver.Value, error) {
	var zeroTime time.Time
	if t.Time.UnixNano() == zeroTime.UnixNano() {
		return nil, nil
	}
	return t.Time, nil
}

// Scan valueof time.Time
func (t *JsonTime) Scan(v interface{}) error {
	value, ok := v.(time.Time)
	if ok {
		*t = JsonTime{Time: value}
		return nil
	}
	return fmt.Errorf("can not convert %v to timestamp", v)
}

// BaseModel 基础model
type BaseModel struct {
	// 自增id
	ID int `gorm:"comment:自增id;primaryKey;autoIncrement;" json:"id,omitempty"`
	// 创建时间
	CreatedAt JsonTime `gorm:"comment:创建时间;column:created_at" json:"createdAt,omitempty"`
	// 更新时间
	UpdatedAt JsonTime `gorm:"comment:更新时间;column:updated_at" json:"updatedAt,omitempty"`
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

type ListQuery struct {
	Page     int `json:"page" example:"1"`
	PageSize int `json:"pageSize" example:"20"`
}
