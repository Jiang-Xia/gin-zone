package log

import (
	"gitee.com/jiang-xia/gin-zone/server/pkg/utils"
	"github.com/sirupsen/logrus"
)

// 初始化配置 logrus
func InitLogrus() {
	file := utils.GetLogFile("")
	//设置输出
	logrus.SetOutput(file)
	//设置日志级别
	logrus.SetLevel(logrus.InfoLevel)
	//设置日志格式
	logrus.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: "2006-01-02 15:04:05", // 日志时间格式
	})
	// 设置日志格式为json格式
	// logrus.SetFormatter(&logrus.JSONFormatter{
	// 	TimestampFormat: "2006-01-02 15:04:05",
	// })
}

// 创建logrus 实例
func CreateLogrus() (logger *logrus.Logger) {
	file := utils.GetLogFile("sql")
	//实例化
	logger = logrus.New()
	//设置输出
	logger.SetOutput(file)
	//设置日志级别
	logger.SetLevel(logrus.InfoLevel)
	//设置日志格式
	logger.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: "2006-01-02 15:04:05", // 日志时间格式
	})
	return logger
}

var Logger *logrus.Logger

func init() {
	// 默认创建一个logrus实例
	Logger = CreateLogrus()
}
