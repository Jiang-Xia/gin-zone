package main

import (
	"fmt"
	"gitee.com/jiang-xia/gin-zone/server/app/cron"
	"gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/config"
	"gitee.com/jiang-xia/gin-zone/server/pkg/log"
	"gitee.com/jiang-xia/gin-zone/server/pkg/translate"
	"gitee.com/jiang-xia/gin-zone/server/router"
)

// 先执行init函数
//func init() {
//	log.ConfigLog()
//}

/* 整个项目的swagger文档说明需要写在main.go中，不然执行swag init 生成的docs.go 中的SwaggerInfo都为空，导致信息和鉴权之类用不了 */

// @title       Gin-Zone-Api
// @version     1.0
// @description zone服务端API服务
// @host        localhost:9600
// @BasePath    /api/v1

/* @securityDefinitions.basic  BasicAuth */

// @securityDefinitions.apikey  Authorization
// @in                          header
// @name                        Authorization
// @description                 jwt token 鉴权
func main() {
	log.Info("======App Loading======")
	//初始化配置文件
	config.InitLoadInIConfig()
	// 初始化日志
	log.ConfigLog()
	// 初始化数据库
	database.Setup()
	//初始化redis
	database.RedisInit()
	//初始化定时任务
	cron.TaskInit()
	if err := translate.InitTrans("zh"); err != nil {
		fmt.Println("初始化翻译器错误")
		return
	}
	app := router.App()
	log.Info("======App starting======")
	app.Run(":9600")
}
