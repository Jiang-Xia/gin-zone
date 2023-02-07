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
	list, total := service.Moment.List(page, pageSize, "")
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
// @Param       user body     model.Moment true "需要上传的json"
// @Success     200  {object} model.Moment
// @Router       /mobile/moments [post]
func (m *Moment) AddMoment(c *gin.Context) {
	addMoment := &model.AddMoment{}
	if err := c.ShouldBindJSON(&addMoment); err != nil {
		// 字段参数校验
		response.Fail(c, "参数错误", err.Error())
		return
	}
	err := service.Moment.CreateMoment(&model.Moment{
		BaseModel: addMoment.BaseModel,
		Content:   addMoment.Content,
		Urls:      addMoment.Urls,
		UserId:    addMoment.UserId,
		Location:  addMoment.Location,
	})
	if err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	response.Success(c, addMoment.ID, "添加成功")
}

// UpdateMoment godoc
// @Summary     更新动态数据
// @Description 更新点赞或者浏览数
// @Tags        动态模块
// @Security	Authorization
// @Accept      json
// @Produce     json
// @Param       id   query     string            true  "Moment.ID"
// @Param       t   query     string            true  "like或者view"
// @Success     200  {object} response.ResType
// @Router      /mobile/moments/UpdateMoment [get]
func (m *Moment) UpdateMoment(c *gin.Context) {
	id := cast.ToInt(c.Query("id"))
	t := c.Query("t")
	if id == 0 || t == "" {
		// 字段参数校验
		response.Fail(c, "参数错误", nil)
		return
	}
	var err error
	moment, _ := service.Moment.Find(id)
	if t == "like" {
		err = service.Moment.Update(id, &model.Moment{Likes: moment.Likes + 1})

	} else if t == "view" {
		err = service.Moment.Update(id, &model.Moment{Views: moment.Views + 1})
	}
	if err != nil {
		response.Fail(c, "服务器错误", nil)
	}
	response.Success(c, true, "操作成功")
}
