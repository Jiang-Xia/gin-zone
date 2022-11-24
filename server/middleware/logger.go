package middleware

import (
	"fmt"
	"os"
	"path"
	"time"

	"gitee.com/jiang-xia/gin-zone/server/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// 判断路径是否存在
func IsExists(path string) (os.FileInfo, bool) {
	f, err := os.Stat(path)
	return f, err == nil
}

// 日志记录到文件
func LoggerToFile() gin.HandlerFunc {
	sec := utils.Config.Section("log")
	logFilePath := sec.Key("log_file_path").String()
	logFileName := sec.Key("log_file_name").String()
	//日志文件
	fileName := path.Join(logFilePath, logFileName)
	// fmt.Println("fileName", fileName)
	//写入文件
	// os.O_RDONLY // 只读
	// os.O_WRONLY // 只写
	// os.O_RDWR // 读写
	// os.O_APPEND // 往文件中添建（Append）
	// os.O_CREATE // 如果文件不存在则先创建
	// os.O_TRUNC // 文件打开时裁剪文件
	// os.O_EXCL // 和O_CREATE一起使用，文件不能存在
	// os.O_SYNC // 以同步I/O的方式打开
	_, bool := IsExists(fileName)
	var src *os.File
	var err error
	if bool {
		//打开文件，
		src, _ = os.OpenFile(fileName, os.O_APPEND|os.O_RDWR, os.ModeAppend)
	} else {
		//新建文件
		src, err = os.Create(fileName)
	}

	if err != nil {
		fmt.Println("err", err)
	}
	//实例化
	logger := logrus.New()
	//设置输出
	logger.Out = src
	//设置日志级别
	logger.SetLevel(logrus.DebugLevel)
	//设置日志格式
	logger.SetFormatter(&logrus.TextFormatter{
		TimestampFormat: "2006-01-02 15:04:05", // 日志时间格式
	})
	// 设置日志格式为json格式
	// logger.SetFormatter(&logrus.JSONFormatter{
	//     TimestampFormat:"2006-01-02 15:04:05",
	// })
	return func(c *gin.Context) {
		// 开始时间
		startTime := time.Now()
		// 处理请求
		c.Next()
		// 结束时间
		endTime := time.Now()
		// 执行时间
		latencyTime := endTime.Sub(startTime)
		// 请求方式
		reqMethod := c.Request.Method
		// 请求路由
		reqUri := c.Request.RequestURI
		// 状态码
		statusCode := c.Writer.Status()
		// 请求IP
		clientIP := c.ClientIP()
		// 日志格式
		logger.Infof("| %3d | %13v | %15s | %s | %s |",
			statusCode,
			latencyTime,
			clientIP,
			reqMethod,
			reqUri,
		)
	}
}

// 日志记录到 MongoDB
func LoggerToMongo() gin.HandlerFunc {
	return func(c *gin.Context) {
	}
}

// 日志记录到 ES
func LoggerToES() gin.HandlerFunc {
	return func(c *gin.Context) {
	}
}

// 日志记录到 MQ
func LoggerToMQ() gin.HandlerFunc {
	return func(c *gin.Context) {
	}
}
