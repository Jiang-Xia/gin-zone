package utils

import "github.com/mojocn/base64Captcha"

var store = base64Captcha.DefaultMemStore
var driver = base64Captcha.NewDriverDigit(40, 120, 4, 0.3, 70)

type Captcha struct {
	base64Captcha *base64Captcha.Captcha
}

// GenerateCaptcha 生成验证码
func GenerateCaptcha() (id, bs64 string, err error) {
	return base64Captcha.NewCaptcha(driver, store).Generate()
}

// Verify 验证
func Verify(id, value string) bool {
	return store.Verify(id, value, true)
}
