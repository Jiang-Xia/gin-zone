package log

import (
	"fmt"
	"os"
	"path"

	"gitee.com/jiang-xia/gin-zone/server/pkg/utils"
	"github.com/sirupsen/logrus"
)

// 判断路径是否存在
func IsExists(path string) (os.FileInfo, bool) {
	f, err := os.Stat(path)
	return f, err == nil
}

// 初始化 logrus
func InitLogrus() (logger *logrus.Logger) {
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
	// logger = logrus.New()
	// 直接使用logrus，是进行全局配置，不用单个实例化
	//设置输出
	logrus.SetOutput(src)
	//设置日志级别
	logrus.SetLevel(logrus.DebugLevel)
	//设置日志格式
	logrus.SetFormatter(&logrus.TextFormatter{
		TimestampFormat: "2006-01-02 15:04:05", // 日志时间格式
	})
	// 设置日志格式为json格式
	// logrus.SetFormatter(&logrus.JSONFormatter{
	//     TimestampFormat:"2006-01-02 15:04:05",
	// })
	return logger
}

// var Logger *logrus.Logger

// func init() {
// 	Logger = InitLogrus()
// }
