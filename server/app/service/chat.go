package service

import (
	"errors"
	"fmt"
	"gorm.io/gorm"
	"gorm.io/gorm/utils"
	"time"

	db "gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/app/model"
)

type chat struct {
}

// Chat 结构体实例化
var Chat *chat

type ChatFriends struct {
	model.ChatFriends `gorm:"embedded"`
	model.User        `gorm:"embedded"` // 合并成一个结构体
	model.ChatGroup   `gorm:"embedded"`
	MsgType           int8      `json:"msgType"`
	LastMsg           string    `json:"lastMsg"`        // 最新消息
	NoReadMsgCount    int       `json:"noReadMsgCount"` // 未读消息数
	LastInfoTime      time.Time `json:"lastInfoTime"`   // 最新消息时间
}

//func setData(friend ChatFriends, chatLogs []model.ChatLog) {
//	if len(chatLogs) != 0 {
//		friend.NoReadMsgCount = len(chatLogs)
//		friend.LastInfoTime = chatLogs[0].CreatedAt
//		friend.LastMsg = chatLogs[0].Content
//	}
//}

// ChatFriends 获取好友列表
func (ch *chat) ChatFriends(userId string) []ChatFriends {

	var friends []ChatFriends
	db.Mysql.Where("user_id = ?", userId).Or("group_id = ?", userId).Find(&friends)
	//去根据好友id查询用户信息
	for i, friend := range friends {
		var user model.User
		db.Mysql.Where("user_id = ?", friend.FriendId).Find(&user)
		//需要取切片里的元素，不能使用循环中的friend
		friends[i].User = user
		// 是群组查询群组自身信息
		if friend.GroupId != 0 {
			var chatGroup model.ChatGroup
			db.Mysql.Where("id = ?", friend.GroupId).Find(&chatGroup)
			friends[i].ChatGroup = chatGroup
		}
		// fmt.Printf("user===============================:%+v", friend.User)
		var chatLogs []model.ChatLog
		hasMsg := true // 用于判断是否有未读消息
		if friend.GroupId != 0 {
			//查询群组未读消息
			db.Mysql.Where("group_id = ?", friend.GroupId).Where("updated_at > ?", friend.LastReadTime).Order("updated_at desc").Find(&chatLogs)
			if len(chatLogs) == 0 {
				hasMsg = false
				//没有未读时就去查最新的一消息
				db.Mysql.Where("group_id = ?", friend.GroupId).Order("updated_at desc").First(&chatLogs)
			}
		} else {
			//查询私聊未读消息
			db.Mysql.Where("sender_id = ? AND receiver_id = ?", userId, friend.ChatFriends.FriendId).
				Or("sender_id = ? AND receiver_id = ?", friend.ChatFriends.FriendId, userId).
				Where("updated_at > ?", friend.LastReadTime).Order("updated_at desc").Find(&chatLogs)
			if len(chatLogs) == 0 {
				hasMsg = false
				//没有未读时就去查最新的一消息
				db.Mysql.Where("sender_id = ? AND receiver_id = ?", userId, friend.ChatFriends.FriendId).
					Or("sender_id = ? AND receiver_id = ?", friend.ChatFriends.FriendId, userId).
					Order("updated_at desc").First(&chatLogs)
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
		//fmt.Println("friend===============================:", friend.LastInfoTime, friend.LastMsg, friend.NoReadMsgCount)

	}
	//fmt.Printf("user===============================:%+v", friends)
	return friends
}

// CreateChatFriends 新增
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
	res := db.Mysql.Create(friend)
	if res.Error != nil { //判断是否插入数据出错
		fmt.Println(res.Error)
	}
	return
}

// UpdateLastReadTime 修改密码
func (ch *chat) UpdateLastReadTime(friend *model.UpdateReadTime) (err error) {
	if friend.GroupId != 0 {
		err = db.Mysql.Table("z_chat_friends").Where("user_id = ? AND group_id = ?", friend.SenderId, friend.GroupId).Updates(map[string]interface{}{"last_read_time": time.Now()}).Error
	} else if friend.SenderId != "" {
		err = db.Mysql.Table("z_chat_friends").Where("user_id = ? AND friend_id = ?", friend.SenderId, friend.ReceiverId).Updates(map[string]interface{}{"last_read_time": time.Now()}).Error
	}
	// 根据 map 更新
	return
}

// DeleteChatFriends 删除
func (ch *chat) DeleteChatFriends(id int) bool {
	db.Mysql.Where("id = ?", id).Delete(&model.ChatFriends{})
	return true
}

// ChatLog 这个命名需要合model中的结构体保持一致(不然绑定gorm时查询表名对应不上)
type ChatLog struct {
	model.ChatLog `gorm:"embedded"`
	User          model.User `json:"userInfo"`
	UserId        string     `json:"-"` // 需要外键约束
}

// ChatLogList 获取聊天记录
// https://gorm.io/zh_CN/docs/query.html#%E6%9D%A1%E4%BB%B6
func (ch *chat) ChatLogList(Page int, PageSize int, query *model.ChatLogQuery) ([]ChatLog, int64) {
	// Where可以使用Struct或者Map作为条件
	var list []ChatLog
	var total int64
	if query.GroupId != 0 {
		db.Mysql.Where("group_id", query.GroupId).Order("created_at desc").Offset((Page - 1) * PageSize).Limit(PageSize).Find(&list)
		db.Mysql.Model(&list).Where("group_id", query.GroupId).Count(&total)
	} else {
		//我发给他或者它发给我的都查询
		db.Mysql.Where("sender_id = ? AND receiver_id = ?", query.SenderId, query.ReceiverId).Or("sender_id = ? AND receiver_id = ?", query.ReceiverId, query.SenderId).Order("created_at desc").Offset((Page - 1) * PageSize).Limit(PageSize).Find(&list)
		db.Mysql.Model(&list).Where("sender_id = ? AND receiver_id = ?", query.SenderId, query.ReceiverId).Or("sender_id = ? AND receiver_id = ?", query.ReceiverId, query.SenderId).Count(&total)
	}
	var users []model.User
	var userIds []string
	//sort.Slice(list, func(i, j int) bool {
	//	return list[i].CreatedAt.Second() < list[j].CreatedAt.Second()
	//})
	for i, log := range list {
		var user model.User
		// 缓存用户信息不用每次都查询数据库
		if utils.Contains(userIds, log.SenderId) {
			for _, value := range users {
				if value.UserId == log.SenderId {
					list[i].User = value
					break
				}
			}
			continue
		} else {
			db.Mysql.Where("user_id = ?", log.SenderId).Find(&user)
			user.Password = ""
			list[i].User = user
			users = append(users, user)
			userIds = append(userIds, user.UserId)
		}
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
func (ch *chat) DeleteGroup(id int) bool {
	db.Mysql.Where("id = ?", id).Delete(&model.ChatGroup{})
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
func (ch *chat) DeleteChatGroupMember(id int) bool {
	db.Mysql.Where("id = ?", id).Delete(&model.ChatGroupMember{})
	return true
}
