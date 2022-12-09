package utils

import (
	"bytes"
	mathrand "math/rand"
	"net/http"
	"reflect"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// GetTime 当前时间
func GetTime() (retTime string) {
	currentTime := time.Now().Local()
	year := strconv.Itoa(currentTime.Year())
	month := strconv.Itoa(int(currentTime.Month()))
	day := strconv.Itoa(currentTime.Day())
	hour := strconv.Itoa(currentTime.Hour())
	minute := strconv.Itoa(currentTime.Minute())
	second := strconv.Itoa(currentTime.Second())

	retTime = year + "年" + month + "月" + day + "日 " + hour + ":" + minute + ":" + second

	return
}

// Empty 类似于 PHP 的 empty() 函数
func Empty(val interface{}) bool {
	if val == nil {
		return true
	}
	v := reflect.ValueOf(val)

	switch v.Kind() {
	case reflect.String, reflect.Array:
		return v.Len() == 0
	case reflect.Map, reflect.Slice:
		return v.Len() == 0 || v.IsNil()
	case reflect.Bool:
		return !v.Bool()
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return v.Int() == 0
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64, reflect.Uintptr:
		return v.Uint() == 0
	case reflect.Float32, reflect.Float64:
		return v.Float() == 0
	case reflect.Interface, reflect.Ptr:
		return v.IsNil()
	}

	return reflect.DeepEqual(val, reflect.Zero(v.Type()).Interface())
}

// NowTime 获取当前时间
func NowTime() interface{} {
	return time.Now().Format("2006-01-02 15:04:05")
}

type Merge struct {
	Sum      int
	Strings  string
	SumFloat float64
}

// Interface2Type 实现传任意多个任意类型的参数
// https://github.com/JLynnLee/learnGrammar/blob/1e0f16e5af8ea2ac44e7b5ca93b6af3f0d41ceb1/main.go
func (m *Merge) Interface2Type(inter interface{}) {
	switch inter.(type) {
	case string:
		bt := bytes.Buffer{}
		bt.WriteString(m.Strings)
		bt.WriteString(inter.(string))
		m.Strings = bt.String()
		break
	case int:
		m.Sum += inter.(int)
		break
	case float64:
		m.SumFloat += inter.(float64)
		break
	}
}

// IsGet 是否是Gost
func IsGet(c *gin.Context) bool {
	if c.Request.Method == http.MethodGet {
		return true
	}
	return false
}

// RandomString 生成长度为 length 的随机字符串
func RandomString(length int) string {
	mathrand.Seed(time.Now().UnixNano())
	letters := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	b := make([]byte, length)
	for i := range b {
		b[i] = letters[mathrand.Intn(len(letters))]
	}

	return string(b)
}
