package common

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
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
	pub, err := x509.ReadPublicKeyFromHex(config.App.PublicKey)
	res, err := json.Marshal(data)
	// 0 C1C3C2  1 C1C2C3
	enByte, err := sm2.Encrypt(pub, res, rand.Reader, 0)
	// log.Info("enByte================>", enByte)
	hexStr := hex.EncodeToString(enByte)
	//log.Info("hexStr================>", hexStr)
	if err != nil {
		response.Fail(c, err.Error(), nil)
		return
	}
	response.Success(c, hexStr, "签到成功")
}

func getId() string {
	id := make([]byte, 16)
	_, _ = rand.Read(id)
	// 将字节切片转换为32个字符的十六进制字符串
	key := hex.EncodeToString(id)
	return key
}
