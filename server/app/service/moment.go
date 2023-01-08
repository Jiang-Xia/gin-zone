package service

import (
	"fmt"
	db "gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/app/model"
)

type moment struct {
}

// Moment 结构体实例化
var Moment *moment

// List 获取 moment 列表
func (m *moment) List(Page int, PageSize int, maps interface{}) ([]model.Moment, int64) {
	var moments []model.Moment
	var total int64
	db.Mysql.Where(maps).Offset((Page - 1) * PageSize).Limit(PageSize).Find(&moments)
	for i, moment := range moments {
		var user model.User
		db.Mysql.Where("user_id = ?", moment.UserId).Find(&user)
		moments[i].User = user
	}
	db.Mysql.Model(&moments).Count(&total)
	return moments, total
}

// CreateMoment 新增
func (m *moment) CreateMoment(friend *model.Moment) (err error) {
	res := db.Mysql.Create(friend)
	if res.Error != nil { //判断是否插入数据出错
		fmt.Println(res.Error)
	}
	return
}

// Update 修改
func (m *moment) Update(id int, model *model.Moment) (err error) {
	err = db.Mysql.Model(&model).Where("id = ? ", id).Updates(model).Error
	return err
}
func (m *moment) Find(id int) (model *model.Moment, err error) {
	err = db.Mysql.Where("id = ? ", id).Find(&model).Error
	return model, err
}
