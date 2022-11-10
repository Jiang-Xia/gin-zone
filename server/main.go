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

// @title           Gin-Zone-Api
// @version         1.0
// @description     This is a sample server celler server.
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:9600
// @BasePath  /api/v1

// @securityDefinitions.basic  BasicAuth

func main() {
	if err := Init(time.Now().Format("2006-01-02"), 1); err != nil {
		fmt.Printf("init failed ,err:%v\n", err)
	}
	id := GenId()
	fmt.Println(id)
	// 设置日志级别
	logrus.SetLevel(logrus.DebugLevel)
	logrus.Info("======App start======")
	// fmt.Printf("接口地址为:127.0.0.1:9600")
	router := router.RouterApp()
	// router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	router.Run(":9600")
}
