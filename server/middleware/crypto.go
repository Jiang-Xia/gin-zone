package middleware

import (
	"bytes"
	"context"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/pkg/log"
	"gitee.com/jiang-xia/gin-zone/server/pkg/tip"
	"github.com/gin-gonic/gin"
	"github.com/tjfoc/gmsm/sm4"
)

var ctx = context.Background()

type encryptBody struct {
	Content string `json:"content"`
}

func writeBizError(c *gin.Context, code int, msg string, data interface{}) {
	c.JSON(http.StatusOK, gin.H{
		"code":    code,
		"msg":     msg,
		"data":    data,
		"encrypt": "",
	})
}

// GMSMMiddleware 国密中间件
func GMSMMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		security := c.Request.Header.Get("Jx-Security")
		sessionId := c.Request.Header.Get("Jx-SessionId")
		method := c.Request.Method
		// log.Info("security:", security)
		if security == "Jx-Security" && (method == "POST" || method == "PUT" || method == "PATCH") {
			// 开始时间（可用于计算耗时）
			start := time.Now()
			log.Infof("处理加密计时开始: %s", start)
			var err error

			originBody, err := io.ReadAll(c.Request.Body)
			if err != nil {
				log.Error("body读取失败: ", err)
				writeBizError(c, tip.InvalidParams, "body读取失败", nil)
				c.Abort()
				return
			}

			// 2. 解密请求体
			body := &encryptBody{}
			if err := json.Unmarshal(originBody, &body); err != nil {
				log.Error("解析加密请求体失败: ", err)
				writeBizError(c, tip.InvalidParams, "解析加密请求体失败", nil)
				c.Abort()
				return
			}

			// 3. 根据sessionId获取SM4密钥
			sm4Key, err := database.Redis().Get(ctx, "sessionId:"+sessionId).Result()
			if err != nil {
				log.Error("获取SM4密钥失败: ", err)
				writeBizError(c, tip.AuthCryptoSessionExpire, "加密会话失效，请重新签到", gin.H{
					"cryptoSessionExpired": true,
				})
				c.Abort()
				return
			}

			sm4KeyBytes, err := hex.DecodeString(sm4Key)
			if err != nil {
				log.Error("密钥格式错误: ", err)
				writeBizError(c, tip.AuthCryptoSessionExpire, "加密会话失效，请重新签到", gin.H{
					"cryptoSessionExpired": true,
				})
				c.Abort()
				return
			}
			contentBytes, err := hex.DecodeString(body.Content)
			if err != nil {
				log.Error("密文转化失败: ", err)
				writeBizError(c, tip.InvalidParams, "密文转化失败", nil)
				c.Abort()
				return
			}
			// 4. 解密请求内容
			decryptedData, err := sm4.Sm4Ecb(sm4KeyBytes, contentBytes, false)
			if err != nil {
				log.Error("解密失败: ", err)
				writeBizError(c, tip.AuthCryptoSessionExpire, "加密会话失效，请重新签到", gin.H{
					"cryptoSessionExpired": true,
				})
				c.Abort()
				return
			}
			// 统一响应拦截时，报文加密用到
			c.Set("sm4Key", sm4Key)
			//data := make(map[string]interface{})
			//err = json.Unmarshal(decryptedData, &data)
			//log.Info("解密后的数据结构化 data: ", data)
			////log.Info("client", data["client"])
			//if err != nil {
			//	log.Error("json化失败: ", err)
			//	c.JSON(http.StatusInternalServerError, gin.H{"error": "json化失败"})
			//	return
			//}

			// 5. 将解密后的数据重新设置到请求体中
			c.Request.Body = io.NopCloser(bytes.NewReader(decryptedData))
			c.Request.ContentLength = int64(len(decryptedData))
			c.Request.Header.Set("Content-Type", "application/json")
			latency := time.Since(start)
			log.Infof("解密报文耗时: %s", latency)
			c.Next()

		} else {
			c.Next()
		}
	}
}
