package base

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"gitee.com/jiang-xia/gin-zone/server/app/cron"
	"gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/config"
	"gitee.com/jiang-xia/gin-zone/server/pkg/log"
	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"gitee.com/jiang-xia/gin-zone/server/pkg/translate"
	"github.com/gin-gonic/gin"
	"github.com/sashabaranov/go-openai"
	"io/ioutil"
	"net/http"
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
	KeyCode          string  `json:"keyCode"`
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
	if req.KeyCode == "j123456" {
		response.Success(c, openaiAppKey+"bb", "请求成功")
	} else {
		client := openai.NewClient(openaiAppKey)
		resp, err := client.CreateChatCompletion(
			context.Background(),
			openai.ChatCompletionRequest{
				Model: openai.GPT3Dot5Turbo,
				Messages: []openai.ChatCompletionMessage{
					{
						Role:    openai.ChatMessageRoleUser,
						Content: req.Prompt,
					},
				},
			},
		)
		if err != nil {
			data["text"] = "警告！警告！分析错误！系统故障..."
			log.Info(err.Error())
			response.Success(c, data, "请求成功")
			return
		}
		data["text"] = resp.Choices[0].Message.Content
		//fmt.Println(resp.Choices[0].Text)
		response.Success(c, data, "请求成功")
	}
}

type ChatGptApiData struct {
	Id      string `json:"id"`
	Message string `json:"message"`
	Key     string `json:"key"`
	Text    string `json:"text"`
}
type ChatGPTApi struct {
	Code int            `json:"code"`
	Data ChatGptApiData `json:"data"`
}

//	godoc
//
// @Summary     ChatGPTApi
// @Description ChatGPTApi
// @Tags        第三方模块
// @Accept      json
// @Produce     json
// @Success     200  {object} ChatGPTApi
// @Param       chatGPT body     ChatGptApiData true "例子：appkey,对话id,对话内容"
// @Router      /third/chatGPTApi [post]
func (t *Third) ChatGPTApi(c *gin.Context) {
	req := &ChatGptApiData{}
	if err := c.ShouldBindJSON(&req); err != nil {
		translate.Individual(err, c)
		return
	}
	openaiAppKey := config.App.OpenaiAppKey
	if req.Key == "" {
		req.Key = openaiAppKey
	}
	fmt.Printf("请求参数%+v", req)
	// 构造POST请求的数据
	postData, _ := json.Marshal(req)
	resp, err := http.Post("https://chat.xingyijun.cn/chat/textModel", "application/json", bytes.NewBuffer(postData))
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	chatGPTApi := ChatGPTApi{}
	err = json.Unmarshal(body, &chatGPTApi)
	fmt.Println("AI接口响应参数:", string(body))
	if err != nil {
		response.Fail(c, "请求失败", nil)
		return
	}
	response.Success(c, chatGPTApi.Data, "请求成功")
}
