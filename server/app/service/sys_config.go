package service

import (
	"errors"
	"strings"

	db "gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/app/model"
)

// ListSysConfig 查询系统配置
func ListSysConfig() ([]model.SysConfig, error) {
	var list []model.SysConfig
	if err := db.Mysql.Order("id asc").Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

// CreateSysConfig 新增系统配置
func CreateSysConfig(payload *model.SysConfigCreateReq) error {
	if payload == nil || strings.TrimSpace(payload.ConfigKey) == "" {
		return errors.New("配置键不能为空")
	}
	item := &model.SysConfig{
		ConfigKey:   strings.TrimSpace(payload.ConfigKey),
		ConfigValue: payload.ConfigValue,
		Remark:      payload.Remark,
	}
	return db.Mysql.Create(item).Error
}

// UpdateSysConfigByID 更新系统配置
func UpdateSysConfigByID(id int, payload *model.SysConfigEditReq) error {
	if id <= 0 {
		return errors.New("配置id不能为空")
	}
	if payload == nil {
		return errors.New("参数错误")
	}
	return db.Mysql.Model(&model.SysConfig{}).Where("id = ?", id).Updates(map[string]interface{}{
		"config_value": payload.ConfigValue,
		"remark":       payload.Remark,
	}).Error
}

// DeleteSysConfigByID 删除系统配置
func DeleteSysConfigByID(id int) error {
	if id <= 0 {
		return errors.New("配置id不能为空")
	}
	return db.Mysql.Where("id = ?", id).Delete(&model.SysConfig{}).Error
}
