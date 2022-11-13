package model

import (
	"gitee.com/jiang-xia/gin-zone/server/pkg/utils"
	"github.com/jinzhu/gorm"
	"github.com/spf13/cast"
)

// BaseModel 基础model
type BaseModel struct {
	Id         int    `gorm:"primary_key;autoIncrement;column:id" json:"id,omitempty"`
	Createtime string `gorm:"column:create_time" json:"create_time,omitempty" form:"create_time"`
	Updatetime string `gorm:"column:update_time" json:"update_time,omitempty" form:"update_time"`
}

func (v *BaseModel) BeforeCreate(scope *gorm.Scope) error {
	err := scope.SetColumn("create_time", utils.NowTime())

	if err != nil {
		return err
	}

	err2 := scope.SetColumn("update_time", utils.NowTime())

	if err != nil {
		return err2
	}

	return nil
}

func (v *BaseModel) BeforeUpdate(scope *gorm.Scope) error {
	err := scope.SetColumn("update_time", utils.NowTime())

	if err != nil {
		return err
	}

	return nil
}

// StringID 获取 ID 的字符串格式
func (v *BaseModel) StringID() string {
	return cast.ToString(v.Id)
}
