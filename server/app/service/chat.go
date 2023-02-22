package service

import (
	"errors"
	"fmt"
	db "gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gorm.io/gorm"
	"time"
)

type chat struct {
}

// Chat 结构体实例化
var Chat *chat

// ChatFriends 获取好友列表
func (ch *chat) ChatFriends(userId string) []model.ChatFriends {

	var friends []model.ChatFriends
	//一对一预加载
	db.Mysql.Preload("User").Preload("ChatGroup").Where("user_id = ?", userId).Find(&friends)
	for i, friend := range friends {
		var chatLogs []model.ChatLog
		hasMsg := true // 用于判断是否有未读消息
		if friend.GroupId != 0 {
			groupSql := db.Mysql.Where("group_id = ?", friend.GroupId).Session(&gorm.Session{})
			//查询群组未读消息
			groupSql.Where("updated_at > ?", friend.LastReadTime).Order("updated_at desc").Find(&chatLogs)
			if len(chatLogs) == 0 {
				hasMsg = false
				//没有未读时就去查最新的一消息
				groupSql = groupSql.Order("updated_at desc").First(&chatLogs)
			}
		} else {
			// 新建一个会话 ，条件不会一直累加
			// https://gorm.io/zh_CN/docs/method_chaining.html
			friendSql := db.Mysql.Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
				userId, friend.FriendId, friend.FriendId, userId).Session(&gorm.Session{})
			//查询私聊未读消息 发消息为对方，接受者为自己时
			db.Mysql.Where("updated_at > ? AND sender_id = ? AND receiver_id = ?", friend.LastReadTime, friend.FriendId, friend.UserId).Order("updated_at desc").Find(&chatLogs)
			fmt.Println("未读消息===============================>:", len(chatLogs))
			if len(chatLogs) == 0 {
				hasMsg = false
				//没有未读时就去查最新的一消息
				friendSql.Order("updated_at desc").First(&chatLogs)
			}
		}
		if len(chatLogs) != 0 {
			friends[i].LastInfoTime = chatLogs[0].CreatedAt
			friends[i].LastMsg = chatLogs[0].Content
			friends[i].MsgType = chatLogs[0].MsgType
			if hasMsg {
				friends[i].NoReadMsgCount = len(chatLogs)
			}
		}
		//fmt.Println("friend===============================>:", friends[i].LastInfoTime, friends[i].LastMsg, friends[i].NoReadMsgCount)

	}

	return friends
}

// CreateChatFriends 新增好友关系
func (ch *chat) CreateChatFriends(friend *model.ChatFriends) (err error) {
	var result *gorm.DB
	if friend.GroupId != 0 {
		result = db.Mysql.Where("user_id = ? AND group_id = ?", friend.UserId, friend.GroupId).First(friend)
		if result.RowsAffected != 0 {
			return errors.New("你已经加入该群聊")
		}
		// 添加群成员
		member := model.ChatGroupMember{
			UserId:  friend.UserId,
			GroupId: friend.GroupId,
		}
		ch.CreateChatGroupMember(&member)
	} else if friend.FriendId != "" {
		result = db.Mysql.Where("user_id = ? AND friend_id = ?", friend.UserId, friend.FriendId).First(friend)
		if result.RowsAffected != 0 {
			return errors.New("该用户已经你的好友")
		}
	}
	res := db.Mysql.Create(&friend)
	if res.Error != nil { //判断是否插入数据出错
		fmt.Println(res.Error)
	}
	return
}

// UpdateLastReadTime 修改阅读时间
func (ch *chat) UpdateLastReadTime(friend *model.UpdateReadTime) (err error) {
	if friend.GroupId != 0 {
		err = db.Mysql.Table("z_chat_friends").Where("user_id = ? AND group_id = ?", friend.SenderId, friend.GroupId).Updates(map[string]interface{}{"last_read_time": time.Now()}).Error
	} else if friend.SenderId != "" {
		err = db.Mysql.Table("z_chat_friends").Where("user_id = ? AND friend_id = ?", friend.SenderId, friend.ReceiverId).Updates(map[string]interface{}{"last_read_time": time.Now()}).Error
	}
	// 根据 map 更新
	return
}

// DeleteChatFriends 删除好友关系
func (ch *chat) DeleteChatFriends(userId string, friendId string) bool {
	db.Mysql.Where("user_id = ? AND friend_id = ?", userId, friendId).Delete(&model.ChatFriends{})
	return true
}

// DeleteGroupFriends 删除群聊关系
func (ch *chat) DeleteGroupFriends(userId string, groupId int) bool {
	db.Mysql.Where("user_id = ? AND group_id = ?", userId, groupId).Delete(&model.ChatFriends{})
	return true
}

// ChatLogList 获取聊天记录
// https://gorm.io/zh_CN/docs/query.html#%E6%9D%A1%E4%BB%B6
func (ch *chat) ChatLogList(Page int, PageSize int, query *model.ChatLogQuery) ([]model.ChatLog, int64) {
	// Where可以使用Struct或者Map作为条件
	var list []model.ChatLog
	var total int64
	if query.GroupId != 0 {
		gSql := db.Mysql.Where("group_id", query.GroupId).Session(&gorm.Session{})
		gSql.Order("created_at desc").Offset((Page - 1) * PageSize).Limit(PageSize).Joins("User").Find(&list)
		gSql.Model(&list).Count(&total)
	} else {
		//我发给他或者它发给我的都查询
		fSql := db.Mysql.Where("sender_id = ? AND receiver_id = ?", query.SenderId, query.ReceiverId).
			Or("sender_id = ? AND receiver_id = ?", query.ReceiverId, query.SenderId).Session(&gorm.Session{})
		fSql.Order("created_at desc").Offset((Page - 1) * PageSize).Limit(PageSize).Joins("User").Find(&list)
		fSql.Model(&list).Count(&total)
	}
	fmt.Printf("聊天记录数据: %+v", total)
	// 条件统计
	return list, total
}

// CreateChatLog 新增
func (ch *chat) CreateChatLog(model *model.ChatLog) (err error) {
	// fmt.Printf("创建消息记录:%+v", model)
	res := db.Mysql.Create(model)
	if res.Error != nil { //判断是否插入数据出错
		fmt.Println(res.Error)
	}
	return
}

// DeleteChatLog 删除
func (ch *chat) DeleteChatLog(id int) bool {
	db.Mysql.Where("id = ?", id).Delete(&model.ChatLog{})
	return true
}

// ChatGroup 群组
func (ch *chat) ChatGroup(userId string, groupName string) []model.ChatGroup {
	var list []model.ChatGroup
	if userId != "" {
		db.Mysql.Where("user_id = ?", userId).Find(&list)
	} else if groupName != "" {
		db.Mysql.Where("group_name LIKE  ?", "%"+groupName+"%").Find(&list)
	}
	return list
}

// CreateGroup 新增
func (ch *chat) CreateGroup(model *model.ChatGroup) (err error) {
	res := db.Mysql.Create(model)
	if res.Error != nil { //判断是否插入数据出错
		fmt.Println(res.Error)
	}
	return
}

// DeleteGroup 删除
func (ch *chat) DeleteGroup(userId string, id int) bool {
	db.Mysql.Where("id = ? AND user_id = ?", id, userId).Delete(&model.ChatGroup{})
	return true
}

// ChatGroupMember 群成员
func (ch *chat) ChatGroupMember(groupId int) []model.ChatGroupMember {
	var list []model.ChatGroupMember
	db.Mysql.Where("group_id = ?", groupId).Find(&list)
	return list
}

// CreateChatGroupMember 新增
func (ch *chat) CreateChatGroupMember(model *model.ChatGroupMember) (err error) {
	res := db.Mysql.Create(model)
	if res.Error != nil { //判断是否插入数据出错
		fmt.Println(res.Error)
	}
	return
}

// DeleteChatGroupMember 删除
func (ch *chat) DeleteChatGroupMember(id string) bool {
	db.Mysql.Where("user_id = ?", id).Delete(&model.ChatGroupMember{})
	return true
}
