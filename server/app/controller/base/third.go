package base

import (
	"context"
	"encoding/json"
	"fmt"
	"gitee.com/jiang-xia/gin-zone/server/config"
	"gitee.com/jiang-xia/gin-zone/server/pkg/translate"
	gogpt "github.com/sashabaranov/go-gpt3"

	"gitee.com/jiang-xia/gin-zone/server/app/cron"
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
// @Param       refresh query     string false "立即刷新古诗词"
// @Router      /third/gushici [get]
func (t *Third) GetGuShiCi(c *gin.Context) {
	refresh := c.Query("refresh")
	if refresh != "" {
		cron.GetGuShiCi()
	}
	data := make(map[string]interface{})
	val, err := database.Redis().Get(ctx, "z_gu_shi_ci").Result()
	if err != nil {
		panic(err)
	}
	err = json.Unmarshal([]byte(val), &data)
	fmt.Println("z_gu_shi_ci", data)
	if err != nil {
		response.Fail(c, "", err)
	}
	response.Success(c, data, "")
}

type ChatGPT struct {
	Model            string  `json:"model" example:"text-davinci-003"`
	Prompt           string  `json:"prompt" example:"介绍一下自己"`
	Suffix           string  `json:"suffix" example:"小夏"`       //返回文本后缀
	MaxTokens        int     `json:"maxTokens" example:"150"`   //返回文本长度
	Temperature      float32 `json:"temperature" example:"0.9"` //随机性程度
	TopP             float32 `json:"topP" example:"1"`
	FrequencyPenalty float32 `json:"frequencyPenalty" example:"0.0"`
	PresencePenalty  float32 `json:"presencePenalty" example:"0.6"`
}

//	godoc
//
// @Summary     chatGPT
// @Description chatGPT
// @Tags        第三方模块
// @Accept      json
// @Produce     json
// @Success     200  {object} ChatGPT
// @Param       chatGPT body     ChatGPT true "例子：为对话聊天机器人配置"
// @Router      /third/chatGPT [post]
func (t *Third) ChatGPT(c *gin.Context) {
	req := &ChatGPT{}
	if err := c.ShouldBindJSON(&req); err != nil {
		translate.Individual(err, c)
		return
	}
	data := make(map[string]interface{})
	openaiAppKey := config.App.OpenaiAppKey
	client := gogpt.NewClient(openaiAppKey)
	ctx := context.Background()
	//fmt.Println(req.Text, openaiAppKey)
	gptReq := gogpt.CompletionRequest{
		Model:            req.Model,
		Prompt:           req.Prompt,
		MaxTokens:        req.MaxTokens,
		Temperature:      req.Temperature,
		Suffix:           req.Suffix,
		TopP:             req.TopP,
		PresencePenalty:  req.PresencePenalty,
		FrequencyPenalty: req.FrequencyPenalty,
	}
	resp, err := client.CreateCompletion(ctx, gptReq)
	if err != nil {
		response.Fail(c, err.Error(), "请求失败")
		return
	}
	data["text"] = resp.Choices[0].Text
	//fmt.Println(resp.Choices[0].Text)
	response.Success(c, data, "请求成功")
}
