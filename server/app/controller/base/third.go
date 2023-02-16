package base

import (
	"context"
	"encoding/json"
	"fmt"
	"gitee.com/jiang-xia/gin-zone/server/config"
	"gitee.com/jiang-xia/gin-zone/server/pkg/translate"
	gogpt "github.com/sashabaranov/go-gpt3"

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

type ChatGPT struct {
	Text string `json:"text" example:"以《是她》为标题写一首诗"`
}

//	godoc
//
// @Summary     chatGPT
// @Description chatGPT
// @Tags        第三方模块
// @Accept      json
// @Produce     json
// @Success     200  {object} ChatGPT
// @Param       chatGPT body     ChatGPT true "需要上传的json"
// @Router      /third/chatGPT [post]
func (t *Third) ChatGPT(c *gin.Context) {
	req := &ChatGPT{}
	if err := c.ShouldBindJSON(&req); err != nil {
		translate.Individual(err, c)
		return
	}
	data := make(map[string]interface{})
	sec := config.Config.Section("app")
	openaiAppKey := sec.Key("openai_app_key").String()
	client := gogpt.NewClient(openaiAppKey)
	ctx := context.Background()
	//fmt.Println(req.Text, openaiAppKey)
	gptReq := gogpt.CompletionRequest{
		Model:       gogpt.GPT3TextDavinci003,
		MaxTokens:   1000,
		Temperature: 0,
		Prompt:      req.Text,
	}
	resp, err := client.CreateCompletion(ctx, gptReq)
	if err != nil {
		return
	}
	data["text"] = resp.Choices[0].Text
	//fmt.Println(resp.Choices[0].Text)
	response.Success(c, data, "请求成功")
}
