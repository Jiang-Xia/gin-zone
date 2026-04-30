package mobile

import (
	"gitee.com/jiang-xia/gin-zone/server/app/model"
	"gitee.com/jiang-xia/gin-zone/server/app/service"
	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/spf13/cast"
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
	// 注释：身份以 JWT 解析出的当前用户为准，禁止信任前端传入 userId
	userId := c.GetString("current_user_uid")
	if userId == "" {
		response.Fail(c, "请先登录", nil)
		return
	}
	err := service.Moment.CreateMoment(&model.Moment{
		Content:  addMoment.Content,
		Urls:     addMoment.Urls,
		UserId:   userId,
		Location: addMoment.Location,
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
