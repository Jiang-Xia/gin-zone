package admin

import (
	"errors"
	"strings"

	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gitee.com/jiang-xia/gin-zone/server/app/service"
	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"gorm.io/gorm"
)

type System struct{}

// UsersList godoc
//
// @Summary     管理端-用户列表
// @Description 管理端-用户列表（支持关键词、状态、分页）
// @Tags        管理端-系统模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       query query model.AdminUserListQuery false "查询参数"
// @Success     200 {object} response.ResType
// @Router      /admin/users [get]
func (s *System) UsersList(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	var query model.AdminUserListQuery
	_ = c.ShouldBindQuery(&query)
	list, total, err := service.User.AdminList(query.Page, query.PageSize, &query)
	if err != nil {
		response.Fail(c, "查询失败", err.Error())
		return
	}
	response.Success(c, model.ListRes{List: list, Total: total}, "")
}

// UserDetail godoc
//
// @Summary     管理端-用户详情
// @Description 管理端-按uid查询用户详情
// @Tags        管理端-系统模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       uid path string true "用户uid"
// @Success     200 {object} response.ResType
// @Router      /admin/users/{uid} [get]
func (s *System) UserDetail(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	uid := strings.TrimSpace(c.Param("uid"))
	if uid == "" {
		response.Fail(c, "参数错误", "uid不能为空")
		return
	}
	user, err := service.User.GetByUID(uid)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Fail(c, "用户不存在", nil)
			return
		}
		response.Fail(c, "查询失败", err.Error())
		return
	}
	user.Password = ""
	response.Success(c, user, "")
}

// RestrictUser godoc
//
// @Summary     管理端-封禁/解封用户
// @Description 管理端-按uid设置用户封禁状态（限制登录）
// @Tags        管理端-系统模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       uid path string true "用户uid"
// @Param       payload body model.AdminUserRestrictReq true "封禁参数"
// @Success     200 {object} response.ResType
// @Router      /admin/users/{uid}/restrict [post]
func (s *System) RestrictUser(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	uid := strings.TrimSpace(c.Param("uid"))
	if uid == "" {
		response.Fail(c, "参数错误", "uid不能为空")
		return
	}
	payload := &model.AdminUserRestrictReq{}
	if err := c.ShouldBindJSON(payload); err != nil {
		response.Fail(c, "参数错误", err.Error())
		return
	}
	currentUserId := model.GetUserUid(c)
	beforeUser, _ := service.User.GetByUID(uid)
	if err := service.User.SetUserLockByUID(uid, payload.IsLock); err != nil {
		response.Fail(c, "操作失败", err.Error())
		return
	}
	afterUser, _ := service.User.GetByUID(uid)
	action := "user.unrestrict"
	if payload.IsLock {
		action = "user.restrict"
	}
	service.CreateAdminAuditLog(&service.AdminAuditPayload{
		OperatorUserId: currentUserId,
		Action:         action,
		TargetType:     "user",
		TargetID:       uid,
		Reason:         payload.Reason,
		BeforeValue:    beforeUser,
		AfterValue:     afterUser,
		IP:             c.ClientIP(),
		UserAgent:      c.Request.UserAgent(),
	})
	response.Success(c, true, "操作成功")
}

// AuditLogs godoc
//
// @Summary     管理端-审计日志
// @Description 管理端-审计日志查询
// @Tags        管理端-系统模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       query query model.AdminAuditLogQuery false "查询参数"
// @Success     200 {object} response.ResType
// @Router      /admin/auditLogs [get]
func (s *System) AuditLogs(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	var query model.AdminAuditLogQuery
	_ = c.ShouldBindQuery(&query)
	list, total, err := service.QueryAdminAuditLogs(query.Page, query.PageSize, &query)
	if err != nil {
		response.Fail(c, "查询失败", err.Error())
		return
	}
	response.Success(c, model.ListRes{List: list, Total: total}, "")
}

// GetSysConfig godoc
//
// @Summary     管理端-系统配置查询
// @Description 管理端-系统配置查询
// @Tags        管理端-系统模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Success     200 {object} response.ResType
// @Router      /admin/sysConfig [get]
func (s *System) GetSysConfig(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	list, err := service.ListSysConfig()
	if err != nil {
		response.Fail(c, "查询失败", err.Error())
		return
	}
	response.Success(c, list, "")
}

// CreateSysConfig godoc
//
// @Summary     管理端-系统配置新增
// @Description 管理端-系统配置新增
// @Tags        管理端-系统模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       payload body model.SysConfigCreateReq true "配置参数"
// @Success     200 {object} response.ResType
// @Router      /admin/sysConfig [post]
func (s *System) CreateSysConfig(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	payload := &model.SysConfigCreateReq{}
	if err := c.ShouldBindJSON(payload); err != nil {
		response.Fail(c, "参数错误", err.Error())
		return
	}
	if err := service.CreateSysConfig(payload); err != nil {
		response.Fail(c, "新增失败", err.Error())
		return
	}
	service.CreateAdminAuditLog(&service.AdminAuditPayload{
		OperatorUserId: model.GetUserUid(c),
		Action:         "sys_config.create",
		TargetType:     "sys_config",
		TargetID:       payload.ConfigKey,
		AfterValue:     payload,
		IP:             c.ClientIP(),
		UserAgent:      c.Request.UserAgent(),
	})
	response.Success(c, true, "操作成功")
}

// UpdateSysConfig godoc
//
// @Summary     管理端-系统配置编辑
// @Description 管理端-系统配置编辑
// @Tags        管理端-系统模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       id path int true "配置id"
// @Param       payload body model.SysConfigEditReq true "配置参数"
// @Success     200 {object} response.ResType
// @Router      /admin/sysConfig/{id} [patch]
func (s *System) UpdateSysConfig(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	id := cast.ToInt(c.Param("id"))
	if id <= 0 {
		response.Fail(c, "参数错误", "id不能为空")
		return
	}
	payload := &model.SysConfigEditReq{}
	if err := c.ShouldBindJSON(payload); err != nil {
		response.Fail(c, "参数错误", err.Error())
		return
	}
	if err := service.UpdateSysConfigByID(id, payload); err != nil {
		response.Fail(c, "更新失败", err.Error())
		return
	}
	service.CreateAdminAuditLog(&service.AdminAuditPayload{
		OperatorUserId: model.GetUserUid(c),
		Action:         "sys_config.update",
		TargetType:     "sys_config",
		TargetID:       cast.ToString(id),
		AfterValue:     payload,
		IP:             c.ClientIP(),
		UserAgent:      c.Request.UserAgent(),
	})
	response.Success(c, true, "操作成功")
}

// DeleteSysConfig godoc
//
// @Summary     管理端-系统配置删除
// @Description 管理端-系统配置删除
// @Tags        管理端-系统模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       id path int true "配置id"
// @Success     200 {object} response.ResType
// @Router      /admin/sysConfig/{id} [delete]
func (s *System) DeleteSysConfig(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	id := cast.ToInt(c.Param("id"))
	if id <= 0 {
		response.Fail(c, "参数错误", "id不能为空")
		return
	}
	if err := service.DeleteSysConfigByID(id); err != nil {
		response.Fail(c, "删除失败", err.Error())
		return
	}
	service.CreateAdminAuditLog(&service.AdminAuditPayload{
		OperatorUserId: model.GetUserUid(c),
		Action:         "sys_config.delete",
		TargetType:     "sys_config",
		TargetID:       cast.ToString(id),
		IP:             c.ClientIP(),
		UserAgent:      c.Request.UserAgent(),
	})
	response.Success(c, true, "操作成功")
}
