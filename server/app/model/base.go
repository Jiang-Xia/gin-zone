package model

import (
	"database/sql/driver"
	"fmt"
	"time"

	"github.com/spf13/cast"
)

const timeFormat = "2006-01-02 15:04:05"
const timezone = "Asia/Shanghai"

// Time 全局定义
type Time time.Time

//其他地方使用的使用model.Time{}实例化一个即可

func (t Time) MarshalJSON() ([]byte, error) {
	b := make([]byte, 0, len(timeFormat)+2)
	b = append(b, '"')
	b = time.Time(t).AppendFormat(b, timeFormat)
	b = append(b, '"')
	return b, nil
}

func (t *Time) UnmarshalJSON(data []byte) (err error) {
	now, err := time.ParseInLocation(`"`+timeFormat+`"`, string(data), time.Local)
	*t = Time(now)
	return
}

func (t Time) String() string {
	return time.Time(t).Format(timeFormat)
}

func (t Time) local() time.Time {
	loc, _ := time.LoadLocation(timezone)
	return time.Time(t).In(loc)
}

func (t Time) Value() (driver.Value, error) {
	var zeroTime time.Time
	var ti = time.Time(t)
	if ti.UnixNano() == zeroTime.UnixNano() {
		return nil, nil
	}
	return ti, nil
}

func (t *Time) Scan(v interface{}) error {
	value, ok := v.(time.Time)
	if ok {
		*t = Time(value)
		return nil
	}
	return fmt.Errorf("can not convert %v to timestamp", v)
}

// BaseModel 基础model
type BaseModel struct {
	// 自增id
	ID int `gorm:"comment:自增id;primaryKey;autoIncrement;" json:"id,omitempty"`
	// 创建时间
	CreatedAt Time `gorm:"comment:创建时间;column:created_at" json:"createdAt,omitempty"`
	// 更新时间
	UpdatedAt Time `gorm:"comment:更新时间;column:updated_at" json:"updatedAt,omitempty"`
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
