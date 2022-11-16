package main

import (
	"gitee.com/jiang-xia/gin-zone/server/router"
	"github.com/sirupsen/logrus"
)

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
	// 设置日志级别
	logrus.SetLevel(logrus.DebugLevel)
	logrus.Info("======App start======")

	router := router.RouterApp()

	router.Run(":9600")
}
