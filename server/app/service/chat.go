package service

import (
	"errors"
	"fmt"
	db "gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gorm.io/gorm"
	"strconv"
	"strings"
	"time"
)

type chat struct {
}

// Chat 结构体实例化
var Chat *chat

// ChatFriends 获取好友列表
func (ch *chat) ChatFriends(userId string) ([]model.ChatFriends, error) {
	userId = strings.TrimSpace(userId)
	if userId == "" {
		return []model.ChatFriends{}, errors.New("用户id不能为空")
	}

	// 兼容修复：历史数据里可能存在“群已创建但群主没有会话/成员关系”的情况
	// 这里在读取聊天列表前补齐一次，确保群主创建的群一定能出现在列表里
	if err := ch.ensureOwnerGroupSession(userId); err != nil {
		return nil, err
	}

	var friends []model.ChatFriends
	//一对一预加载
	db.Mysql.Preload("User").Preload("ChatGroup").Where("user_id = ?", userId).Find(&friends)
	for i, friend := range friends {
		var chatLogs []model.ChatLog
		hasMsg := true // 用于判断是否有未读消息
		if friend.GroupId != 0 {
			// 群聊未读口径：只统计“别人发的消息”，避免自己发群消息导致红点一直存在
			groupSql := db.Mysql.
				Where("group_id = ? AND is_deleted = ? AND is_revoked = ?", friend.GroupId, false, false).
				Where("sender_id <> ?", userId).
				Session(&gorm.Session{})
			// 查询群组未读消息
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
				userId, friend.FriendId, friend.FriendId, userId).Where("is_deleted = ? AND is_revoked = ?", false, false).Session(&gorm.Session{})
			//查询私聊未读消息 发消息为对方，接受者为自己时
			db.Mysql.Where("updated_at > ? AND sender_id = ? AND receiver_id = ? AND is_deleted = ? AND is_revoked = ?", friend.LastReadTime, friend.FriendId, friend.UserId, false, false).Order("updated_at desc").Find(&chatLogs)
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

	return friends, nil
}

// ensureOwnerGroupSession 补齐群主的默认群成员与会话关系（用于修复历史漏数据）
func (ch *chat) ensureOwnerGroupSession(userId string) error {
	var groupIDs []int
	if err := db.Mysql.Model(&model.ChatGroup{}).
		Select("id").
		Where("user_id = ?", userId).
		Scan(&groupIDs).Error; err != nil {
		return err
	}
	if len(groupIDs) == 0 {
		return nil
	}

	return db.Mysql.Transaction(func(tx *gorm.DB) error {
		// 1) 补齐群成员关系
		var memberIDs []int
		if err := tx.Model(&model.ChatGroupMember{}).
			Select("group_id").
			Where("user_id = ? AND group_id IN (?)", userId, groupIDs).
			Scan(&memberIDs).Error; err != nil {
			return err
		}
		memberSet := make(map[int]struct{}, len(memberIDs))
		for _, id := range memberIDs {
			memberSet[id] = struct{}{}
		}
		missingMembers := make([]model.ChatGroupMember, 0)
		for _, gid := range groupIDs {
			if _, ok := memberSet[gid]; ok {
				continue
			}
			missingMembers = append(missingMembers, model.ChatGroupMember{
				UserId:  userId,
				GroupId: gid,
			})
		}
		if len(missingMembers) > 0 {
			if err := tx.Create(&missingMembers).Error; err != nil {
				return err
			}
		}

		// 2) 补齐群聊会话关系（聊天列表依赖 z_chat_friends）
		var friendGroupIDs []int
		if err := tx.Model(&model.ChatFriends{}).
			Select("group_id").
			Where("user_id = ? AND group_id IN (?)", userId, groupIDs).
			Scan(&friendGroupIDs).Error; err != nil {
			return err
		}
		friendSet := make(map[int]struct{}, len(friendGroupIDs))
		for _, id := range friendGroupIDs {
			friendSet[id] = struct{}{}
		}
		missingFriends := make([]model.ChatFriends, 0)
		for _, gid := range groupIDs {
			if _, ok := friendSet[gid]; ok {
				continue
			}
			missingFriends = append(missingFriends, model.ChatFriends{
				UserId:       userId,
				GroupId:      gid,
				LastReadTime: model.Time{},
				LastInfoTime: model.Time{},
			})
		}
		if len(missingFriends) > 0 {
			if err := tx.Create(&missingFriends).Error; err != nil {
				return err
			}
		}

		return nil
	})
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
		// 移动端聊天记录默认屏蔽已撤回/已删除消息
		gSql := db.Mysql.Where("group_id = ? AND is_deleted = ? AND is_revoked = ?", query.GroupId, false, false).Session(&gorm.Session{})
		gSql.Order("created_at desc").Offset((Page - 1) * PageSize).Limit(PageSize).Joins("User").Find(&list)
		gSql.Model(&list).Count(&total)
	} else {
		//我发给他或者它发给我的都查询
		fSql := db.Mysql.Where("sender_id = ? AND receiver_id = ?", query.SenderId, query.ReceiverId).
			Or("sender_id = ? AND receiver_id = ?", query.ReceiverId, query.SenderId).
			Where("is_deleted = ? AND is_revoked = ?", false, false).Session(&gorm.Session{})
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
		return res.Error
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
	userId = strings.TrimSpace(userId)
	groupName = strings.TrimSpace(groupName)

	// 不传 groupName 时，约定返回“我创建的群聊”（用于群管理页面）
	if groupName == "" {
		if userId == "" {
			return []model.ChatGroup{}
		}
		db.Mysql.Where("user_id = ?", userId).Find(&list)
		return list
	}

	// 传 groupName 时，约定返回“可加入的群”（排除自己已加入/自己创建的群）
	sql := db.Mysql.Model(&model.ChatGroup{}).Where("group_name LIKE ?", "%"+groupName+"%")
	if userId != "" {
		// 排除自己创建的群
		sql = sql.Where("user_id <> ?", userId)
		// 排除已经加入的群
		sql = sql.Where("id NOT IN (?)",
			db.Mysql.Model(&model.ChatGroupMember{}).Select("group_id").Where("user_id = ?", userId),
		)
	}
	sql.Find(&list)
	return list
}

// getChatGroupOwnerInfoMap 批量查询群主信息，避免 N+1
func (ch *chat) getChatGroupOwnerInfoMap(userIds []string) (map[string]*model.ChatGroupOwnerInfo, error) {
	out := make(map[string]*model.ChatGroupOwnerInfo, len(userIds))
	uniq := make([]string, 0, len(userIds))
	seen := make(map[string]struct{}, len(userIds))
	for _, uid := range userIds {
		uid = strings.TrimSpace(uid)
		if uid == "" {
			continue
		}
		if _, ok := seen[uid]; ok {
			continue
		}
		seen[uid] = struct{}{}
		uniq = append(uniq, uid)
	}
	if len(uniq) == 0 {
		return out, nil
	}
	var rows []model.ChatGroupOwnerInfo
	// 仅查询展示必要字段，避免泄漏敏感信息
	if err := db.Mysql.Table("z_user").
		Select("user_id, user_name, nick_name, avatar").
		Where("user_id IN (?)", uniq).
		Scan(&rows).Error; err != nil {
		return nil, err
	}
	for i := range rows {
		r := rows[i]
		// 注意：取地址要用局部变量，避免指针指向同一块内存
		tmp := r
		out[tmp.UserId] = &tmp
	}
	return out, nil
}

// ChatGroupResList 群组列表（附带群主信息）
func (ch *chat) ChatGroupResList(userId string, groupName string) ([]model.ChatGroupRes, error) {
	list := ch.ChatGroup(userId, groupName)
	if len(list) == 0 {
		return []model.ChatGroupRes{}, nil
	}
	ownerIds := make([]string, 0, len(list))
	for _, g := range list {
		ownerIds = append(ownerIds, g.UserId)
	}
	ownerMap, err := ch.getChatGroupOwnerInfoMap(ownerIds)
	if err != nil {
		return nil, err
	}
	res := make([]model.ChatGroupRes, 0, len(list))
	for _, g := range list {
		res = append(res, model.ChatGroupRes{
			ChatGroup: g,
			OwnerInfo: ownerMap[g.UserId],
		})
	}
	return res, nil
}

// GetChatGroupByID 获取群组详情
func (ch *chat) GetChatGroupByID(id int) (*model.ChatGroup, error) {
	group := &model.ChatGroup{}
	err := db.Mysql.Where("id = ?", id).First(group).Error
	if err != nil {
		return nil, err
	}
	return group, nil
}

// UpdateChatGroup 更新群聊信息（仅群主可改）
func (ch *chat) UpdateChatGroup(currentUserId string, groupId int, payload *model.UpdateChatGroup) error {
	if strings.TrimSpace(currentUserId) == "" {
		return errors.New("用户id不能为空")
	}
	if groupId <= 0 {
		return errors.New("群组id不能为空")
	}
	if payload == nil {
		return errors.New("参数错误")
	}

	// 必须校验“当前用户是否有权修改该群”（群主或管理员才允许改）
	group, err := ch.GetChatGroupByID(groupId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("群组不存在")
		}
		return err
	}
	isAdmin := false
	if group.UserId != currentUserId {
		// 非群主：仅管理员可操作
		admin, aErr := User.IsAdminByUserId(currentUserId)
		if aErr != nil {
			return aErr
		}
		if !admin {
			return errors.New("无权限操作该群组")
		}
		isAdmin = true
	}

	updates := map[string]interface{}{}
	if payload.GroupName != nil {
		updates["group_name"] = strings.TrimSpace(*payload.GroupName)
	}
	if payload.Avatar != nil {
		updates["avatar"] = strings.TrimSpace(*payload.Avatar)
	}
	if payload.Intro != nil {
		updates["intro"] = strings.TrimSpace(*payload.Intro)
	}
	if payload.Notice != nil {
		updates["notice"] = strings.TrimSpace(*payload.Notice)
	}
	if len(updates) == 0 {
		return errors.New("没有需要更新的字段")
	}

	// 管理员允许修改任意群；非管理员仍约束 user_id，避免越权
	sql := db.Mysql.Model(&model.ChatGroup{}).Where("id = ?", groupId)
	if !isAdmin {
		sql = sql.Where("user_id = ?", currentUserId)
	}
	return sql.Updates(updates).Error
}

// CanAccessChatGroup 判断用户是否可访问该群（群主/管理员/群成员）
func (ch *chat) CanAccessChatGroup(userId string, groupId int) (bool, error) {
	if strings.TrimSpace(userId) == "" {
		return false, errors.New("用户id不能为空")
	}
	if groupId <= 0 {
		return false, errors.New("群组id不能为空")
	}
	group, err := ch.GetChatGroupByID(groupId)
	if err != nil {
		return false, err
	}
	if group.UserId == userId {
		return true, nil
	}
	admin, err := User.IsAdminByUserId(userId)
	if err == nil && admin {
		return true, nil
	}
	var count int64
	err = db.Mysql.Model(&model.ChatGroupMember{}).Where("user_id = ? AND group_id = ?", userId, groupId).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// GetChatGroupInfo 获取群聊信息（需要是群主/管理员/群成员）
func (ch *chat) GetChatGroupInfo(currentUserId string, groupId int) (*model.ChatGroup, error) {
	ok, err := ch.CanAccessChatGroup(currentUserId, groupId)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, errors.New("无权限查看该群组")
	}
	return ch.GetChatGroupByID(groupId)
}

// GetChatGroupInfoRes 获取群聊信息（附带群主信息）
func (ch *chat) GetChatGroupInfoRes(currentUserId string, groupId int) (*model.ChatGroupRes, error) {
	group, err := ch.GetChatGroupInfo(currentUserId, groupId)
	if err != nil {
		return nil, err
	}
	ownerMap, err := ch.getChatGroupOwnerInfoMap([]string{group.UserId})
	if err != nil {
		return nil, err
	}
	return &model.ChatGroupRes{
		ChatGroup: *group,
		OwnerInfo: ownerMap[group.UserId],
	}, nil
}

// RemoveChatGroupMember 删除群成员（群主或管理员）
func (ch *chat) RemoveChatGroupMember(currentUserId string, groupId int, memberUserId string) error {
	if strings.TrimSpace(currentUserId) == "" {
		return errors.New("用户id不能为空")
	}
	if groupId <= 0 {
		return errors.New("群组id不能为空")
	}
	if strings.TrimSpace(memberUserId) == "" {
		return errors.New("成员用户id不能为空")
	}
	group, err := ch.GetChatGroupByID(groupId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("群组不存在")
		}
		return err
	}

	// 群主可删成员；管理员也可操作
	if group.UserId != currentUserId {
		admin, aErr := User.IsAdminByUserId(currentUserId)
		if aErr != nil {
			return aErr
		}
		if !admin {
			return errors.New("无权限操作该群组")
		}
	}
	// 不允许删除群主自身（避免群失去 owner）
	if memberUserId == group.UserId {
		return errors.New("不能删除群主")
	}

	return db.Mysql.Transaction(func(tx *gorm.DB) error {
		// 删除群成员关系
		if err := tx.Where("user_id = ? AND group_id = ?", memberUserId, groupId).Delete(&model.ChatGroupMember{}).Error; err != nil {
			return err
		}
		// 删除聊天会话关系（群聊在好友表里也会占一行）
		if err := tx.Where("user_id = ? AND group_id = ?", memberUserId, groupId).Delete(&model.ChatFriends{}).Error; err != nil {
			return err
		}
		return nil
	})
}

// AdminChatFriendsList 管理端：好友/群聊关系列表
func (ch *chat) AdminChatFriendsList(page int, pageSize int, query *model.AdminChatFriendsQuery) ([]model.AdminChatFriendRow, int64, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	// 管理端需要展示 user/friend/group 的具体信息，这里用 join 一次性查出（避免依赖模型里不稳定的 Preload 关系）
	sql := db.Mysql.
		Table("z_chat_friends as f").
		Select(strings.Join([]string{
			"f.id",
			"f.user_id",
			"u_owner.nick_name as user_nick_name",
			"u_owner.avatar as user_avatar",
			"f.friend_id",
			"u_friend.nick_name as friend_nick_name",
			"u_friend.avatar as friend_avatar",
			"f.group_id",
			"g.group_name as group_name",
			"g.avatar as group_avatar",
			"f.created_at",
		}, ",")).
		Joins("LEFT JOIN z_user u_owner ON u_owner.user_id = f.user_id").
		Joins("LEFT JOIN z_user u_friend ON u_friend.user_id = f.friend_id").
		Joins("LEFT JOIN z_chat_group g ON g.id = f.group_id")
	if query != nil {
		if strings.TrimSpace(query.UserId) != "" {
			sql = sql.Where("f.user_id = ?", strings.TrimSpace(query.UserId))
		}
		if strings.TrimSpace(query.FriendId) != "" {
			sql = sql.Where("f.friend_id = ?", strings.TrimSpace(query.FriendId))
		}
		if query.GroupId > 0 {
			sql = sql.Where("f.group_id = ?", query.GroupId)
		}
	}
	var total int64
	if err := sql.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []model.AdminChatFriendRow
	if err := sql.Order("f.id desc").Offset((page - 1) * pageSize).Limit(pageSize).Scan(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

// AdminDeleteChatFriendsByID 管理端：按主键删除关系
func (ch *chat) AdminDeleteChatFriendsByID(id int) error {
	if id <= 0 {
		return errors.New("id不能为空")
	}
	return db.Mysql.Where("id = ?", id).Delete(&model.ChatFriends{}).Error
}

// AdminChatGroupsList 管理端：群组列表（支持名称查询）
func (ch *chat) AdminChatGroupsList(page int, pageSize int, groupName string) ([]model.AdminChatGroupRow, int64, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	sql := db.Mysql.
		Table("z_chat_group as g").
		Select(strings.Join([]string{
			"g.id",
			"g.avatar",
			"g.group_name",
			"g.intro",
			"g.notice",
			"g.user_id",
			"u.nick_name as owner_nick_name",
			"g.created_at",
		}, ",")).
		Joins("LEFT JOIN z_user u ON u.user_id = g.user_id")

	if strings.TrimSpace(groupName) != "" {
		sql = sql.Where("g.group_name LIKE ?", "%"+strings.TrimSpace(groupName)+"%")
	}
	var total int64
	if err := sql.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []model.AdminChatGroupRow
	if err := sql.Order("g.id desc").Offset((page - 1) * pageSize).Limit(pageSize).Scan(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

// AdminGetChatGroupDetail 管理端：群组详情（含群主信息）
func (ch *chat) AdminGetChatGroupDetail(currentUserId string, groupId int) (*model.ChatGroupRes, error) {
	return ch.GetChatGroupInfoRes(currentUserId, groupId)
}

// AdminDissolveChatGroup 管理端：解散群组（群主或管理员）
func (ch *chat) AdminDissolveChatGroup(currentUserId string, groupId int) error {
	if strings.TrimSpace(currentUserId) == "" {
		return errors.New("用户id不能为空")
	}
	group, err := ch.GetChatGroupByID(groupId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("群组不存在")
		}
		return err
	}
	if group.UserId != currentUserId {
		isAdmin, aErr := User.IsAdminByUserId(currentUserId)
		if aErr != nil {
			return aErr
		}
		if !isAdmin {
			return errors.New("无权限操作该群组")
		}
	}
	return db.Mysql.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("group_id = ?", groupId).Delete(&model.ChatGroupMember{}).Error; err != nil {
			return err
		}
		if err := tx.Where("group_id = ?", groupId).Delete(&model.ChatFriends{}).Error; err != nil {
			return err
		}
		if err := tx.Where("id = ?", groupId).Delete(&model.ChatGroup{}).Error; err != nil {
			return err
		}
		return nil
	})
}

// AdminTransferChatGroupOwner 管理端：转移群主（群主或管理员）
func (ch *chat) AdminTransferChatGroupOwner(currentUserId string, groupId int, targetUserId string) error {
	targetUserId = strings.TrimSpace(targetUserId)
	if targetUserId == "" {
		return errors.New("目标用户不能为空")
	}
	group, err := ch.GetChatGroupByID(groupId)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("群组不存在")
		}
		return err
	}
	if group.UserId != currentUserId {
		isAdmin, aErr := User.IsAdminByUserId(currentUserId)
		if aErr != nil {
			return aErr
		}
		if !isAdmin {
			return errors.New("无权限操作该群组")
		}
	}
	var memberCount int64
	if err = db.Mysql.Model(&model.ChatGroupMember{}).
		Where("group_id = ? AND user_id = ?", groupId, targetUserId).
		Count(&memberCount).Error; err != nil {
		return err
	}
	if memberCount == 0 {
		return errors.New("目标用户不是群成员")
	}
	return db.Mysql.Model(&model.ChatGroup{}).Where("id = ?", groupId).Update("user_id", targetUserId).Error
}

func parseAdminQueryTime(value string) (time.Time, error) {
	return time.ParseInLocation("2006-01-02 15:04:05", strings.TrimSpace(value), time.Local)
}

// AdminSearchChatMessages 管理端：消息检索
func (ch *chat) AdminSearchChatMessages(page int, pageSize int, query *model.AdminChatMessageQuery) ([]model.AdminChatMessageRow, int64, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	sql := db.Mysql.Table("z_chat_log").
		Select("id,sender_id,receiver_id,group_id,content,log_type,msg_type,is_revoked,is_deleted,created_at")
	if query != nil {
		if strings.TrimSpace(query.SenderId) != "" {
			sql = sql.Where("sender_id = ?", strings.TrimSpace(query.SenderId))
		}
		if query.GroupId > 0 {
			sql = sql.Where("group_id = ?", query.GroupId)
		}
		if strings.TrimSpace(query.Keyword) != "" {
			sql = sql.Where("content LIKE ?", "%"+strings.TrimSpace(query.Keyword)+"%")
		}
		if query.MsgType > 0 {
			sql = sql.Where("msg_type = ?", query.MsgType)
		}
		if strings.TrimSpace(query.StartAt) != "" {
			startAt, err := parseAdminQueryTime(query.StartAt)
			if err != nil {
				return nil, 0, errors.New("startAt格式错误，应为yyyy-MM-dd HH:mm:ss")
			}
			sql = sql.Where("created_at >= ?", startAt)
		}
		if strings.TrimSpace(query.EndAt) != "" {
			endAt, err := parseAdminQueryTime(query.EndAt)
			if err != nil {
				return nil, 0, errors.New("endAt格式错误，应为yyyy-MM-dd HH:mm:ss")
			}
			sql = sql.Where("created_at <= ?", endAt)
		}
	}
	var total int64
	if err := sql.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []model.AdminChatMessageRow
	if err := sql.Order("id desc").Offset((page - 1) * pageSize).Limit(pageSize).Scan(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

// AdminRevokeChatMessage 管理端：软撤回消息
func (ch *chat) AdminRevokeChatMessage(operatorUserId string, id int) error {
	if strings.TrimSpace(operatorUserId) == "" || id <= 0 {
		return errors.New("参数错误")
	}
	return db.Mysql.Model(&model.ChatLog{}).Where("id = ?", id).Updates(map[string]interface{}{
		"is_revoked": true,
		"operate_by": operatorUserId,
	}).Error
}

// AdminSoftDeleteChatMessage 管理端：软删除消息
func (ch *chat) AdminSoftDeleteChatMessage(operatorUserId string, id int) error {
	if strings.TrimSpace(operatorUserId) == "" || id <= 0 {
		return errors.New("参数错误")
	}
	return db.Mysql.Model(&model.ChatLog{}).Where("id = ?", id).Updates(map[string]interface{}{
		"is_deleted": true,
		"operate_by": operatorUserId,
	}).Error
}

// GetChatMessageByID 根据主键查询消息（用于审计前后值）
func (ch *chat) GetChatMessageByID(id int) (*model.ChatLog, error) {
	out := &model.ChatLog{}
	if err := db.Mysql.Where("id = ?", id).First(out).Error; err != nil {
		return nil, err
	}
	return out, nil
}

// GetChatGroupMembersByGroupID 查询群成员（用于群详情展示）
func (ch *chat) GetChatGroupMembersByGroupID(groupId int, page int, pageSize int) ([]model.ChatGroupMember, int64, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	var total int64
	sql := db.Mysql.Model(&model.ChatGroupMember{}).Where("group_id = ?", groupId)
	if err := sql.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []model.ChatGroupMember
	if err := sql.Preload("UserInfo").Order("id desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

// BuildChatAuditTargetID 组装审计对象标识（避免 controller 重复拼接）
func BuildChatAuditTargetID(prefix string, id int) string {
	return prefix + ":" + strconv.Itoa(id)
}

// CreateGroup 新增
func (ch *chat) CreateGroup(group *model.ChatGroup) (err error) {
	// 创建群聊时，群主必须同时成为群成员，并且生成一条会话关系，否则聊天列表（z_chat_friends）里查不到该群
	if group == nil {
		return errors.New("参数错误")
	}
	if strings.TrimSpace(group.UserId) == "" {
		return errors.New("群主用户id不能为空")
	}

	return db.Mysql.Transaction(func(tx *gorm.DB) error {
		// 1) 创建群聊
		if err := tx.Create(group).Error; err != nil {
			return err
		}

		// 2) 群主默认入群（幂等：已存在则跳过）
		var memberCount int64
		if err := tx.Model(&model.ChatGroupMember{}).
			Where("user_id = ? AND group_id = ?", group.UserId, group.ID).
			Count(&memberCount).Error; err != nil {
			return err
		}
		if memberCount == 0 {
			if err := tx.Create(&model.ChatGroupMember{
				UserId:  group.UserId,
				GroupId: int(group.ID),
			}).Error; err != nil {
				return err
			}
		}

		// 3) 群聊会话关系（幂等：已存在则跳过）
		var friendCount int64
		if err := tx.Model(&model.ChatFriends{}).
			Where("user_id = ? AND group_id = ?", group.UserId, group.ID).
			Count(&friendCount).Error; err != nil {
			return err
		}
		if friendCount == 0 {
			if err := tx.Create(&model.ChatFriends{
				UserId:       group.UserId,
				GroupId:      int(group.ID),
				LastReadTime: model.Time{},
				LastInfoTime: model.Time{},
			}).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// DeleteGroup 删除
func (ch *chat) DeleteGroup(userId string, id int) bool {
	db.Mysql.Where("id = ? AND user_id = ?", id, userId).Delete(&model.ChatGroup{})
	return true
}

// ChatGroupMember 群成员
func (ch *chat) ChatGroupMember(groupId int) []model.ChatGroupMember {
	var list []model.ChatGroupMember
	// 预加载成员信息，便于前端展示昵称/头像等
	db.Mysql.Preload("UserInfo").Where("group_id = ?", groupId).Find(&list)
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
func (ch *chat) DeleteChatGroupMember(userId string, groupId int) bool {
	db.Mysql.Where("user_id = ? AND group_id = ?", userId, groupId).Delete(&model.ChatGroupMember{})
	return true
}
