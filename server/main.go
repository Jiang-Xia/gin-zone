package main

import (
	"fmt"

	"gitee.com/jiang-xia/gin-zone/server/app/database"
	"gitee.com/jiang-xia/gin-zone/server/pkg/log"
	"gitee.com/jiang-xia/gin-zone/server/pkg/translate"
	"gitee.com/jiang-xia/gin-zone/server/router"
	"github.com/sirupsen/logrus"
)

func init() {
	// 需初始化配置之后使用logrus才会定制话
	log.InitLogrus()
}

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
	if err := translate.InitTrans("zh"); err != nil {
		fmt.Println("初始化翻译器错误")
		return
	}
	// 初始化数据库
	database.DatabaseSetup()
	logrus.Info("======App start======")
	router := router.RouterApp()
	router.Run(":9600")
}
