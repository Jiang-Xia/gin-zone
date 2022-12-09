package base

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"time"

	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"github.com/gin-gonic/gin"
)

type Third struct {
}

//	godoc
//
// @Summary     今日古诗词
// @Description 今日古诗词
// @Tags        第三方模块
// @Accept      json
// @Produce     json
// @Success     200  {object} Third
// @Router      /third/gushichi [get]
func (t *Third) GetGuShiCi(c *gin.Context) {
	// 任意变量
	data := make(map[string]interface{})
	var GuShiCiUrl = "https://v1.jinrishici.com/all.json"
	resp, _ := http.Get(GuShiCiUrl)
	body, _ := ioutil.ReadAll(resp.Body)
	// 创建文件
	file, _ := os.Create("public/data/gushichi.json")
	// 写入JSON数据
	file.Write(body)
	err := json.Unmarshal(body, &data)
	data["time"] = time.Now().UnixMilli()
	if err != nil {
		response.Fail(c, "", err)
	}
	response.Success(c, data, "")
}
