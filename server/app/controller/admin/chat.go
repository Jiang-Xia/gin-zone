package admin

import (
	"strings"

	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gitee.com/jiang-xia/gin-zone/server/app/service"
	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
)

type Chat struct{}

// 中文注释：管理端权限校验统一在 controller 入口做一次（避免 service 依赖 gin context）
func ensureAdmin(c *gin.Context) bool {
	currentUserId := model.GetUserUid(c)
	if currentUserId == "" {
		response.Fail(c, "token无效", nil)
		return false
	}
	ok, err := service.User.IsAdminByUserId(currentUserId)
	if err != nil {
		response.Fail(c, "权限校验失败", err.Error())
		return false
	}
	if !ok {
		response.Fail(c, "无权限", nil)
		return false
	}
	return true
}

// FriendsList godoc
//
// @Summary     管理端-好友/群聊关系列表
// @Description 管理端-好友/群聊关系列表
// @Tags        管理端-聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       query query     model.AdminChatFriendsQuery false "查询参数"
// @Success     200  {object} response.ResType
// @Router      /admin/chat/friends [get]
func (a *Chat) FriendsList(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	var query model.AdminChatFriendsQuery
	_ = c.ShouldBindQuery(&query)
	list, total, err := service.Chat.AdminChatFriendsList(query.Page, query.PageSize, &query)
	if err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	response.Success(c, model.ListRes{List: list, Total: total}, "")
}

// DeleteFriendRelation godoc
//
// @Summary     管理端-删除好友/群聊关系
// @Description 管理端-按关系主键删除（z_chat_friends.id）
// @Tags        管理端-聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       id path int true "关系id"
// @Success     200  {object} response.ResType
// @Router      /admin/chat/friends/{id} [delete]
func (a *Chat) DeleteFriendRelation(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	id := cast.ToInt(c.Param("id"))
	if id <= 0 {
		response.Fail(c, "参数错误", "id不能为空")
		return
	}
	if err := service.Chat.AdminDeleteChatFriendsByID(id); err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	response.Success(c, true, "删除成功")
}

// GroupsList godoc
//
// @Summary     管理端-群组列表
// @Description 管理端-群组列表（支持 groupName 模糊查询）
// @Tags        管理端-聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       query query     model.AdminChatGroupsQuery false "查询参数"
// @Success     200  {object} response.ResType
// @Router      /admin/chat/groups [get]
func (a *Chat) GroupsList(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	var query model.AdminChatGroupsQuery
	_ = c.ShouldBindQuery(&query)
	list, total, err := service.Chat.AdminChatGroupsList(query.Page, query.PageSize, query.GroupName)
	if err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	response.Success(c, model.ListRes{List: list, Total: total}, "")
}

// UpdateGroup godoc
//
// @Summary     管理端-修改群聊信息
// @Description 管理端-修改群聊信息（管理员）
// @Tags        管理端-聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       groupId path int true "群组id"
// @Param       payload body model.UpdateChatGroup true "需要上传的json"
// @Success     200  {object} response.ResType
// @Router      /admin/chat/groups/{groupId} [patch]
func (a *Chat) UpdateGroup(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	groupId := cast.ToInt(c.Param("groupId"))
	if groupId <= 0 {
		response.Fail(c, "参数错误", "groupId不能为空")
		return
	}
	payload := &model.UpdateChatGroup{}
	if err := c.ShouldBindJSON(payload); err != nil {
		response.Fail(c, "参数错误", err.Error())
		return
	}
	if payload.GroupName != nil && strings.TrimSpace(*payload.GroupName) == "" {
		response.Fail(c, "参数错误", "groupName不能为空")
		return
	}
	currentUserId := model.GetUserUid(c)
	if err := service.Chat.UpdateChatGroup(currentUserId, groupId, payload); err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	response.Success(c, true, "操作成功")
}

// RemoveGroupMember godoc
//
// @Summary     管理端-删除群成员
// @Description 管理端-删除群成员（管理员）
// @Tags        管理端-聊天模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       groupId path int true "群组id"
// @Param       userId  path string true "成员用户id"
// @Success     200  {object} response.ResType
// @Router      /admin/chat/groupMembers/{groupId}/{userId} [delete]
func (a *Chat) RemoveGroupMember(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	groupId := cast.ToInt(c.Param("groupId"))
	memberUserId := strings.TrimSpace(c.Param("userId"))
	if groupId <= 0 || memberUserId == "" {
		response.Fail(c, "参数错误", "groupId/userId不能为空")
		return
	}
	currentUserId := model.GetUserUid(c)
	if err := service.Chat.RemoveChatGroupMember(currentUserId, groupId, memberUserId); err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	response.Success(c, true, "操作成功")
}

