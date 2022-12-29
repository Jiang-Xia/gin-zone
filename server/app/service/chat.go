package service

import (
	db "gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/app/model"
)

type chat struct {
}

// Chat 结构体实例化
var Chat *chat

type FriendsList struct {
	model.FriendsList `gorm:"embedded"`
	model.User        `gorm:"embedded"` // 合并成一个结构体
}

// FriendsList 获取好友列表
func (u *chat) FriendsList(userId int) []FriendsList {
	var friends []FriendsList
	db.Mysql.Where("user_id = ?", userId).Find(&friends)
	db.Mysql.Model(&friends)
	//去根据好友id查询用户信息
	for i, friend := range friends {
		var user model.User
		db.Mysql.Where("id = ?", friend.FriendId).Find(&user)
		//需要取切片里的元素，不能使用循环中的friend
		friends[i].User = user
		//fmt.Printf("user===============================:%+v", friend.User)
	}
	return friends
}

// ChatLogList 获取聊天记录
// https://gorm.io/zh_CN/docs/query.html#%E6%9D%A1%E4%BB%B6
func (u *chat) ChatLogList(Page int, PageSize int, maps interface{}) ([]model.ChatLog, int64) {
	// Where可以使用Struct或者Map作为条件
	var logs []model.ChatLog
	var total int64
	db.Mysql.Where(maps).Offset((Page - 1) * PageSize).Limit(PageSize).Find(&logs)
	db.Mysql.Model(&logs).Count(&total)
	return logs, total
}
