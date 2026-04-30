package admin

import (
	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gitee.com/jiang-xia/gin-zone/server/app/service"
	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"strings"
)

type Moment struct{}

func (m *Moment) GetList(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	page := cast.ToInt(c.DefaultQuery("page", "1"))
	pageSize := cast.ToInt(c.DefaultQuery("pageSize", "20"))
	_ = strings.TrimSpace(c.Query("content"))
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	list, total, err := service.Moment.List(page, pageSize, "")
	if err != nil {
		response.Fail(c, "获取动态列表失败", err.Error())
		return
	}
	response.Success(c, model.ListRes{List: list, Total: total}, "")
}

func (m *Moment) UpdateInteraction(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	id := cast.ToInt(c.Param("id"))
	if id <= 0 {
		response.Fail(c, "参数错误", "id不能为空")
		return
	}
	var req struct {
		AllowComment bool `json:"allowComment"`
		AllowReply   bool `json:"allowReply"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, "参数错误", err.Error())
		return
	}
	err := service.Moment.Update(id, &model.Moment{
		AllowComment: req.AllowComment,
		AllowReply:   req.AllowReply,
	})
	if err != nil {
		response.Fail(c, "更新失败", err.Error())
		return
	}
	response.Success(c, true, "更新成功")
}

func (m *Moment) CommentList(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	page := cast.ToInt(c.DefaultQuery("page", "1"))
	pageSize := cast.ToInt(c.DefaultQuery("pageSize", "20"))
	keyword := strings.TrimSpace(c.Query("keyword"))
	momentId := cast.ToInt(c.Query("momentId"))
	list, total, err := service.Moment.ListCommentForAdmin(page, pageSize, keyword, momentId)
	if err != nil {
		response.Fail(c, "获取评论列表失败", err.Error())
		return
	}
	response.Success(c, model.ListRes{List: list, Total: total}, "")
}

func (m *Moment) DeleteComment(c *gin.Context) {
	if !ensureAdmin(c) {
		return
	}
	id := cast.ToInt(c.Param("id"))
	if id <= 0 {
		response.Fail(c, "参数错误", "id不能为空")
		return
	}
	if err := service.Moment.DeleteComment(id); err != nil {
		response.Fail(c, "删除失败", err.Error())
		return
	}
	response.Success(c, true, "删除成功")
}
