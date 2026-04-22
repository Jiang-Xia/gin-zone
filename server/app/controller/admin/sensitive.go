package admin

import (
	"strings"

	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gitee.com/jiang-xia/gin-zone/server/app/service"
	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
)

type Sensitive struct{}

// List godoc
//
// @Summary 管理端-敏感词列表
// @Tags    管理端-敏感词
// @Security Authorization
// @Accept json
// @Produce json
// @Param query query model.SensitiveWordQuery false "查询参数"
// @Success 200 {object} response.ResType
// @Router /admin/sensitiveWords [get]
func (s *Sensitive) List(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	var query model.SensitiveWordQuery
	_ = c.ShouldBindQuery(&query)
	list, total, err := service.SensitiveWordList(query.Page, query.PageSize, &query)
	if err != nil {
		response.Fail(c, "查询失败", err.Error())
		return
	}
	response.Success(c, model.ListRes{List: list, Total: total}, "")
}

// Create godoc
//
// @Summary 管理端-新增敏感词
// @Tags    管理端-敏感词
// @Security Authorization
// @Accept json
// @Produce json
// @Param payload body model.SensitiveWordCreateReq true "参数"
// @Success 200 {object} response.ResType
// @Router /admin/sensitiveWords [post]
func (s *Sensitive) Create(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	payload := &model.SensitiveWordCreateReq{}
	if err := c.ShouldBindJSON(payload); err != nil {
		response.Fail(c, "参数错误", err.Error())
		return
	}
	payload.Word = strings.TrimSpace(payload.Word)
	if payload.Word == "" {
		response.Fail(c, "参数错误", "敏感词不能为空")
		return
	}
	if err := service.CreateSensitiveWord(payload); err != nil {
		response.Fail(c, "新增失败", err.Error())
		return
	}
	service.CreateAdminAuditLog(&service.AdminAuditPayload{
		OperatorUserId: model.GetUserUid(c),
		Action:         "sensitive_word.create",
		TargetType:     "sensitive_word",
		TargetID:       payload.Word,
		AfterValue:     payload,
		IP:             c.ClientIP(),
		UserAgent:      c.Request.UserAgent(),
	})
	response.Success(c, true, "操作成功")
}

// Update godoc
//
// @Summary 管理端-编辑敏感词
// @Tags    管理端-敏感词
// @Security Authorization
// @Accept json
// @Produce json
// @Param id path int true "敏感词id"
// @Param payload body model.SensitiveWordUpdateReq true "参数"
// @Success 200 {object} response.ResType
// @Router /admin/sensitiveWords/{id} [patch]
func (s *Sensitive) Update(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	id := cast.ToInt(c.Param("id"))
	if id <= 0 {
		response.Fail(c, "参数错误", "id不能为空")
		return
	}
	payload := &model.SensitiveWordUpdateReq{}
	if err := c.ShouldBindJSON(payload); err != nil {
		response.Fail(c, "参数错误", err.Error())
		return
	}
	if err := service.UpdateSensitiveWord(id, payload); err != nil {
		response.Fail(c, "更新失败", err.Error())
		return
	}
	service.CreateAdminAuditLog(&service.AdminAuditPayload{
		OperatorUserId: model.GetUserUid(c),
		Action:         "sensitive_word.update",
		TargetType:     "sensitive_word",
		TargetID:       cast.ToString(id),
		AfterValue:     payload,
		IP:             c.ClientIP(),
		UserAgent:      c.Request.UserAgent(),
	})
	response.Success(c, true, "操作成功")
}

// Delete godoc
//
// @Summary 管理端-删除敏感词
// @Tags    管理端-敏感词
// @Security Authorization
// @Accept json
// @Produce json
// @Param id path int true "敏感词id"
// @Success 200 {object} response.ResType
// @Router /admin/sensitiveWords/{id} [delete]
func (s *Sensitive) Delete(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	id := cast.ToInt(c.Param("id"))
	if id <= 0 {
		response.Fail(c, "参数错误", "id不能为空")
		return
	}
	if err := service.DeleteSensitiveWord(id); err != nil {
		response.Fail(c, "删除失败", err.Error())
		return
	}
	service.CreateAdminAuditLog(&service.AdminAuditPayload{
		OperatorUserId: model.GetUserUid(c),
		Action:         "sensitive_word.delete",
		TargetType:     "sensitive_word",
		TargetID:       cast.ToString(id),
		IP:             c.ClientIP(),
		UserAgent:      c.Request.UserAgent(),
	})
	response.Success(c, true, "操作成功")
}

// Hits godoc
//
// @Summary 管理端-敏感词命中记录
// @Tags    管理端-敏感词
// @Security Authorization
// @Accept json
// @Produce json
// @Param query query model.SensitiveHitLogQuery false "查询参数"
// @Success 200 {object} response.ResType
// @Router /admin/sensitiveWords/hits [get]
func (s *Sensitive) Hits(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	var query model.SensitiveHitLogQuery
	_ = c.ShouldBindQuery(&query)
	list, total, err := service.SensitiveHitLogList(query.Page, query.PageSize, &query)
	if err != nil {
		response.Fail(c, "查询失败", err.Error())
		return
	}
	response.Success(c, model.ListRes{List: list, Total: total}, "")
}
