package library

import "gitee.com/jiang-xia/gin-zone/server/config"

// IsEnv 检测环境
func IsEnv(eType string) bool {
	return config.Config.Section("app").Key("env").MustString("") == eType
}

// IsProd 是否是生产环境
func IsProd() bool {
	return IsEnv("production")
}
