package translate

import (
	"fmt"
	"reflect"
	"strings"

	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/locales/en"
	"github.com/go-playground/locales/zh"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	en_translations "github.com/go-playground/validator/v10/translations/en"
	zh_translations "github.com/go-playground/validator/v10/translations/zh"
)

var (
	trans    ut.Translator
	uni      *ut.UniversalTranslator
	validate *validator.Validate
)

func InitTrans(locale string) (err error) {
	// 修改gin框架中的validator引擎属性，实现定制
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		// 注册一个获取json的tag的自定义方法
		v.RegisterTagNameFunc(func(field reflect.StructField) string {
			jsonName := field.Tag.Get("json")           // json name
			jsonLabel := field.Tag.Get("label")         // json字段 对应中文名 label
			allName := jsonLabel + "(" + jsonName + ")" // 拼接字段完整名字
			if jsonName == "-" {
				return ""
			}
			return allName
		})

		zhT := zh.New() // 中文翻译器
		enT := en.New() // 英文翻译器
		// 第一个参数是备用的语言环境，后面的参数是应该支持的语言环境
		uni := ut.New(enT, zhT, enT)
		trans, ok = uni.GetTranslator(locale)
		fmt.Println(ok)
		if !ok {
			return fmt.Errorf("uni.GetTranslator(%s)", locale)
		}
		switch locale {
		case "en":
			en_translations.RegisterDefaultTranslations(v, trans)
		case "zh":
			zh_translations.RegisterDefaultTranslations(v, trans)
		default:
			en_translations.RegisterDefaultTranslations(v, trans)
		}
		return
	}
	return
}

// 全部翻译并且全部返回错误信息
func TranslateAll(err error, c *gin.Context) string {
	errs := err.(validator.ValidationErrors)
	var msgs []string // 声明一个空切片
	for _, e := range errs {
		msgs = append(msgs, e.Translate(trans))
	}
	fMsg := strings.Join(msgs, ",") // 切片变为字符串
	response.Fail(c, fMsg, nil)
	return fMsg
	//列如:password为必填字段,userName长度必须至少为4个字符
}

// 一次只翻译一个错误信息并且返回
func TranslateIndividual(err error, c *gin.Context) string {
	errs := err.(validator.ValidationErrors)
	var msg string
	for _, e := range errs {
		msg = e.Translate(trans)
		break
	}
	response.Fail(c, msg, nil)
	return msg
	// 列如："userName长度必须至少为4个字符"
}
