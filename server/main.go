package main

import (
	"fmt"
	"time"

	"gitee.com/jiang-xia/gin-zone/server/router"
	"github.com/bwmarrin/snowflake"
	"github.com/sirupsen/logrus"
)

var node *snowflake.Node

func GenId() int64 {
	return node.Generate().Int64()
}

func Init(startTime string, machineId int64) (err error) {
	var st time.Time
	st, err = time.Parse("2006-01-02", startTime)
	if err != nil {
		return err
	}
	fmt.Println("st:", st)
	snowflake.Epoch = st.UnixNano() / 1000000
	node, err = snowflake.NewNode(machineId)
	return err
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
	if err := Init(time.Now().Format("2006-01-02"), 1); err != nil {
		fmt.Printf("init failed ,err:%v\n", err)
	}
	id := GenId()
	fmt.Println(id)
	// 设置日志级别
	logrus.SetLevel(logrus.DebugLevel)
	logrus.Info("======App start======")

	router := router.RouterApp()

	router.Run(":9600")
}
