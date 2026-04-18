package common

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"strings"
	"time"

	"gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/config"
	"gitee.com/jiang-xia/gin-zone/server/pkg/utils"
	"github.com/tjfoc/gmsm/sm2"

	//"github.com/tjfoc/gmsm/sm2"

	//"gitee.com/jiang-xia/gin-zone/server/config"
	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/tjfoc/gmsm/x509"
)

type Common struct {
}

var ctx = context.Background()

// SignIn godoc

func (m *Common) SignIn(c *gin.Context) {
	data := make(map[string]interface{})
	var err error
	//if err = c.ShouldBindJSON(data); err != nil {
	//	// 字段参数校验
	//	response.Fail(c, "参数错误", err.Error())
	//	return
	//}
	workKey := getId()
	sessionId := utils.GenId() + getId()

	key := "sessionId:" + sessionId
	err = database.Redis().Set(ctx, key, workKey, 180*time.Minute).Err()
	data["sessionId"] = sessionId
	data["workKey"] = workKey

	pubHex := strings.TrimSpace(config.App.PublicKey)
	if pubHex == "" {
		response.Fail(c, "服务端未配置国密公钥 app.public_key，请检查 env.ini（Linux 为 /opt/jxapp/config/zone_env.ini）", nil)
		return
	}
	pub, err := x509.ReadPublicKeyFromHex(pubHex)
	if err != nil || pub == nil {
		response.Fail(c, "国密公钥解析失败，请确认 public_key 为合法 SM2 公钥十六进制字符串", err)
		return
	}

	res, err := json.Marshal(data)
	if err != nil {
		response.Fail(c, "会话数据序列化失败", err.Error())
		return
	}
	// 0 C1C3C2  1 C1C2C3
	enByte, err := sm2.Encrypt(pub, res, rand.Reader, 0)
	if err != nil {
		response.Fail(c, "国密加密失败", err.Error())
		return
	}
	hexStr := hex.EncodeToString(enByte)
	response.Success(c, hexStr, "签到成功")
}

func getId() string {
	id := make([]byte, 16)
	_, _ = rand.Read(id)
	// 将字节切片转换为32个字符的十六进制字符串
	key := hex.EncodeToString(id)
	return key
}
