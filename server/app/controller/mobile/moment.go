package mobile

import (
	"strings"

	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gitee.com/jiang-xia/gin-zone/server/app/service"
	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
	"gorm.io/gorm"
)

type Moment struct{}

// MomentList godoc
// @Summary     动态列表
// @Description 动态列表
// @Tags        动态模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       page   query     string            true  "page"
// @Param       pageSize   query     string            true  "pageSize"
// @Success     200  {object} response.ResType
// @Router      /mobile/moments [get]
func (m *Moment) MomentList(c *gin.Context) {
	page := cast.ToInt(c.Query("page"))
	pageSize := cast.ToInt(c.Query("pageSize"))
	if page == 0 || pageSize == 0 {
		// 字段参数校验
		response.Fail(c, "参数错误", nil)
		return
	}
	list, total, err := service.Moment.List(page, pageSize, "")
	if err != nil {
		response.Fail(c, "服务器错误", err.Error())
		return
	}
	data := model.ListRes{List: list, Total: total}
	response.Success(c, data, "")
}

// AddMoment godoc
//
// @Summary     发动态
// @Description 发动态
// @Tags        动态模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       addMoment body     model.AddMoment true "需要上传的json"
// @Success     200  {object} model.AddMoment
// @Router       /mobile/moments [post]
func (m *Moment) AddMoment(c *gin.Context) {
	addMoment := &model.AddMoment{}
	if err := c.ShouldBindJSON(&addMoment); err != nil {
		// 字段参数校验
		response.Fail(c, "参数错误", err.Error())
		return
	}
	// 注释：兼容旧版小程序 body.userId，但最终身份仍以 JWT 解析出的当前用户为准
	userId := c.GetString("current_user_uid")
	if userId == "" {
		response.Fail(c, "请先登录", nil)
		return
	}
	// 若前端仍传 userId，则要求与 token 内身份一致（防止伪造他人发动态）
	if addMoment.UserId != "" && addMoment.UserId != userId {
		response.Fail(c, "用户身份校验失败", nil)
		return
	}
	err := service.Moment.CreateMoment(&model.Moment{
		Content:      addMoment.Content,
		Urls:         addMoment.Urls,
		UserId:       userId,
		Location:     addMoment.Location,
		AllowComment: addMoment.AllowComment,
		AllowReply:   addMoment.AllowReply,
	})
	if err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	response.Success(c, addMoment, "添加成功")
}

// UpdateMoment godoc
// @Summary     更新动态数据
// @Description 更新点赞或者浏览数
// @Tags        动态模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       id   body     string            true  "Moment.ID"
// @Param       t   body     string            true  "like或者view"
// @Success     200  {object} response.ResType
// @Router      /mobile/moments/UpdateMoment [post]
func (m *Moment) UpdateMoment(c *gin.Context) {
	// 注释：用 POST 更新计数，避免 GET 被预取/缓存导致误触发
	var req struct {
		ID int    `json:"id"`
		T  string `json:"t"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, "参数错误", err.Error())
		return
	}
	id := req.ID
	t := req.T
	if id == 0 || t == "" {
		// 字段参数校验
		response.Fail(c, "参数错误", nil)
		return
	}
	// 注释：仅允许两种操作类型，避免参数穿透导致“无更新也成功”
	var field string
	switch t {
	case "like":
		field = "likes"
	case "view":
		field = "views"
	default:
		response.Fail(c, "参数错误", "t must be like/view")
		return
	}
	ok, err := service.Moment.IncCounter(id, field, 1)
	if err != nil {
		response.Fail(c, "服务器错误", err.Error())
		return
	}
	if !ok {
		response.Fail(c, "动态不存在", nil)
		return
	}
	response.Success(c, true, "操作成功")
}

// CommentList 获取动态评论/回复
func (m *Moment) CommentList(c *gin.Context) {
	momentId := cast.ToInt(c.Param("id"))
	if momentId <= 0 {
		response.Fail(c, "参数错误", "id不能为空")
		return
	}
	list, err := service.Moment.ListComments(momentId)
	if err != nil {
		response.Fail(c, "服务器错误", err.Error())
		return
	}
	response.Success(c, list, "")
}

// AddComment 新增评论/回复
func (m *Moment) AddComment(c *gin.Context) {
	momentId := cast.ToInt(c.Param("id"))
	if momentId <= 0 {
		response.Fail(c, "参数错误", "id不能为空")
		return
	}
	userId := c.GetString("current_user_uid")
	if userId == "" {
		response.Fail(c, "请先登录", nil)
		return
	}
	req := &model.AddMomentComment{}
	if err := c.ShouldBindJSON(req); err != nil {
		response.Fail(c, "参数错误", err.Error())
		return
	}
	if strings.TrimSpace(req.Content) == "" {
		response.Fail(c, "参数错误", "content不能为空")
		return
	}
	momentInfo, err := service.Moment.Find(momentId)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			response.Fail(c, "动态不存在", nil)
			return
		}
		response.Fail(c, "服务器错误", err.Error())
		return
	}
	if !momentInfo.AllowComment {
		response.Fail(c, "该动态已关闭评论", nil)
		return
	}
	comment := &model.MomentComment{
		MomentId: momentId,
		UserId:   userId,
		ParentId: req.ParentId,
		Content:  strings.TrimSpace(req.Content),
	}
	if req.ParentId > 0 {
		if !momentInfo.AllowReply {
			response.Fail(c, "该动态已关闭回复", nil)
			return
		}
		parent, err := service.Moment.GetCommentByID(req.ParentId)
		if err != nil || parent.MomentId != momentId || parent.IsDeleted {
			response.Fail(c, "被回复评论不存在", nil)
			return
		}
		comment.ReplyToUserId = parent.UserId
	}
	if err := service.Moment.CreateComment(comment); err != nil {
		response.Fail(c, "评论失败", err.Error())
		return
	}
	response.Success(c, comment, "评论成功")
}

// DeleteComment 删除评论/回复（仅本人或动态作者可删）
func (m *Moment) DeleteComment(c *gin.Context) {
	momentId := cast.ToInt(c.Param("id"))
	commentId := cast.ToInt(c.Param("commentId"))
	if momentId <= 0 || commentId <= 0 {
		response.Fail(c, "参数错误", "id/commentId不能为空")
		return
	}
	currentUserId := c.GetString("current_user_uid")
	if currentUserId == "" {
		response.Fail(c, "请先登录", nil)
		return
	}
	comment, err := service.Moment.GetCommentByID(commentId)
	if err != nil || comment.MomentId != momentId || comment.IsDeleted {
		response.Fail(c, "评论不存在", nil)
		return
	}
	momentInfo, err := service.Moment.Find(momentId)
	if err != nil {
		response.Fail(c, "服务器错误", err.Error())
		return
	}
	// 评论删除权限：评论作者本人，或动态作者
	if comment.UserId != currentUserId && momentInfo.UserId != currentUserId {
		response.Fail(c, "无权限删除该评论", nil)
		return
	}
	if err := service.Moment.DeleteComment(commentId); err != nil {
		response.Fail(c, "删除失败", err.Error())
		return
	}
	response.Success(c, true, "删除成功")
}
