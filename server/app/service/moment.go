package service

import (
	db "gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gorm.io/gorm"
)

type moment struct {
}

// Moment 结构体实例化
var Moment *moment

// List 获取 moment 列表
func (m *moment) List(Page int, PageSize int, maps interface{}) ([]model.Moment, int64, error) {
	var moments []model.Moment
	var total int64
	// Joins("User") 会把关联的用户信息查询出来（用于动态列表展示头像/昵称等）
	query := db.Mysql.Where(maps).Model(&model.Moment{})
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := query.
		Order("created_at desc").
		Offset((Page - 1) * PageSize).
		Limit(PageSize).
		Joins("User").
		Find(&moments).Error; err != nil {
		return nil, 0, err
	}
	return moments, total, nil
}

// CreateMoment 新增
func (m *moment) CreateMoment(moment *model.Moment) (err error) {
	// Omit跳过关联创建
	return db.Mysql.Create(moment).Error
}

// Update 修改
func (m *moment) Update(id int, patch *model.Moment) (err error) {
	return db.Mysql.Model(&model.Moment{}).Where("id = ? ", id).Updates(patch).Error
}
func (m *moment) Find(id int) (moment *model.Moment, err error) {
	var momentModel model.Moment
	if err := db.Mysql.Where("id = ? ", id).First(&momentModel).Error; err != nil {
		return nil, err
	}
	return &momentModel, nil
}

// IncCounter 动态计数原子自增（避免先查再改导致并发覆盖）
func (m *moment) IncCounter(id int, field string, delta int64) (bool, error) {
	// 注释：只允许自增 likes/views 两个字段，防止被滥用更新任意列
	var column string
	switch field {
	case "likes":
		column = "likes"
	case "views":
		column = "views"
	default:
		return false, gorm.ErrInvalidField
	}
	res := db.Mysql.Model(&model.Moment{}).
		Where("id = ?", id).
		UpdateColumn(column, gorm.Expr(column+" + ?", delta))
	if res.Error != nil {
		return false, res.Error
	}
	return res.RowsAffected > 0, nil
}
