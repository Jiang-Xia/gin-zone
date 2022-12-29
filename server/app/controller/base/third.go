package base

import (
	"context"
	"encoding/json"
	"fmt"

	"gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"github.com/gin-gonic/gin"
)

type Third struct {
}

var ctx = context.Background()

//	godoc
//
// @Summary     今日古诗词
// @Description 今日古诗词
// @Tags        第三方模块
// @Accept      json
// @Produce     json
// @Success     200  {object} Third
// @Router      /third/gushici [get]
func (t *Third) GetGuShiCi(c *gin.Context) {
	data := make(map[string]interface{})
	val, err := database.Redis().Get(ctx, "z_gu_shi_ci").Result()
	if err != nil {
		panic(err)
	}
	json.Unmarshal([]byte(val), &data)
	fmt.Println("z_gu_shi_ci", data)
	if err != nil {
		response.Fail(c, "", err)
	}
	response.Success(c, data, "")
}
