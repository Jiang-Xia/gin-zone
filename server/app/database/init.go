package database

import (
	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gitee.com/jiang-xia/gin-zone/server/pkg/log"
)

func InitTable() {
	var db = Db()
	var err error
	//一个个判断表是否存在
	//if (!db.Migrator().HasTable(&model.User{})) {
	//	err = db.AutoMigrate(&model.User{})
	//	if err == nil {
	//		log.Info("用户表创建成功！")
	//	}
	//}
	//直接创建表 表存在了也不会报错,新加字段也会自动更新表结构
	err = db.AutoMigrate(&model.User{})
	err = db.AutoMigrate(&model.ChatFriends{})
	err = db.AutoMigrate(&model.ChatGroup{})
	err = db.AutoMigrate(&model.ChatGroupMember{})
	err = db.AutoMigrate(&model.ChatLog{})
	err = db.AutoMigrate(&model.Moment{})
	if err != nil {
		log.Info("建表失败==================>", err.Error())
		return
	}
	log.Info("建表成功==================>")
}
