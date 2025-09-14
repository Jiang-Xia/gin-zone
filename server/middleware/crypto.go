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
	"github.com/gin-gonic/gin"
	"github.com/tjfoc/gmsm/sm4"
)

var ctx = context.Background()

type encryptBody struct {
	Content string `json:"content"`
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
				c.JSON(http.StatusBadRequest, gin.H{"error": "body读取失败"})
				c.Abort()
				return
			}

			// 2. 解密请求体
			body := &encryptBody{}
			if err := json.Unmarshal(originBody, &body); err != nil {
				log.Error("解析加密请求体失败: ", err)
				c.JSON(http.StatusBadRequest, gin.H{"error": "解析加密请求体失败"})
				c.Abort()
				return
			}
			log.Infof("body.Content: %s", body.Content)

			// 3. 根据sessionId获取SM4密钥
			sm4Key, err := database.Redis().Get(ctx, "sessionId:"+sessionId).Result()
			if err != nil {
				log.Error("获取SM4密钥失败: ", err)
				c.JSON(http.StatusUnauthorized, gin.H{"error": "获取SM4密钥失败"})
				c.Abort()
				return
			}
			log.Infof("sm4Key: %s", sm4Key)

			sm4KeyBytes, err := hex.DecodeString(sm4Key)
			if err != nil {
				log.Error("密钥格式错误: ", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "sm4Key 转化失败"})
				c.Abort()
				return
			}
			contentBytes, err := hex.DecodeString(body.Content)
			if err != nil {
				log.Error("密文转化失败: ", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "密文转化失败"})
				c.Abort()
				return
			}
			// 4. 解密请求内容
			decryptedData, err := sm4.Sm4Ecb(sm4KeyBytes, contentBytes, false)
			if err != nil {
				log.Error("解密失败: ", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "解密失败"})
				c.Abort()
				return
			}
			log.Info("解密后的数据: ", decryptedData)
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

		} else {
			c.Next()
		}
	}
}
