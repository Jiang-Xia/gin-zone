package log

import (
	"gitee.com/jiang-xia/gin-zone/server/config"
	"github.com/gin-gonic/gin"
	rotatelogs "github.com/lestrrat/go-file-rotatelogs"
	"github.com/rifflock/lfshook"
	"github.com/sirupsen/logrus"
	"io"
	"os"
	"path"
	"time"
)

// Logger 需要创建一个实例，gorm那边使用到，不然会出现多个实例，导致多次打印和写入
var Logger = logrus.New()

// FileCut 日志文件切割
func FileCut(fileName string) *rotatelogs.RotateLogs {
	logier, err := rotatelogs.New(
		// 切割后日志文件名称
		fileName,
		// rotatelogs.WithLinkName(Current.LogDir),   // 生成软链，指向最新日志文件
		rotatelogs.WithMaxAge(30*24*time.Hour),    // 文件最大保存时间
		rotatelogs.WithRotationTime(24*time.Hour), // 日志切割时间间隔
		//rotatelogs.WithRotationCount(3),
		//rotatelogs.WithRotationTime(time.Minute), // 日志切割时间间隔
	)

	if err != nil {
		panic(err)
	}
	lfHook := lfshook.NewHook(lfshook.WriterMap{
		logrus.InfoLevel:  logier,
		logrus.FatalLevel: logier,
		logrus.DebugLevel: logier,
		logrus.WarnLevel:  logier,
		logrus.ErrorLevel: logier,
		logrus.PanicLevel: logier,
	},
		// 设置分割日志样式
		&logrus.TextFormatter{
			TimestampFormat: "2006-01-02 15:04:05", // 日志时间格式
			DisableColors:   false,
		},
	)
	logrus.AddHook(lfHook)
	return logier
}

// ConfigLog 初始化配置 实例
func ConfigLog() {
	logFilePath := config.Log.LogFilePath
	// 没有logs 文件夹则创建
	//err := os.MkdirAll("./logs", 0755)
	//if err != nil {
	//	return
	//}
	//日志输出所在文件
	//Logger.SetReportCaller(true)
	// 设置日志输出控制台样式
	Logger.SetFormatter(&logrus.TextFormatter{
		TimestampFormat: "2006-01-02 15:04:05",
		//ForceColors:     true, // 控制台强制彩色
	})
	// 按天分割 logs/2006-01-02.log
	logFileName := path.Join(logFilePath, "%Y%m%d") + ".info.log"

	// 配置日志分割
	logFileCut := FileCut(logFileName)

	writers := []io.Writer{logFileCut, os.Stdout}
	// errorWriters := []io.Writer{errorLogFileCut, os.Stdout}
	// 输出到控制台，方便定位到那个文件
	fileAndStdoutWriter := io.MultiWriter(writers...)

	// logrus也要设置输出到文件 不然gorm不会记录
	Logger.SetOutput(fileAndStdoutWriter)
	// gin 配置将一般日志写入到文件
	gin.DefaultWriter = fileAndStdoutWriter
	Logger.Info("init log end")
}

func Info(args ...interface{}) {
	Logger.Info(args...)
}
func Trace(args ...interface{}) {
	Logger.Trace(args...)
}
func Debug(args ...interface{}) {
	Logger.Debug(args...)
}
func Print(args ...interface{}) {
	Logger.Print(args...)
}
func Warn(args ...interface{}) {
	Logger.Debug(args...)
}
func Warning(args ...interface{}) {
	Logger.Debug(args...)
}
func Error(args ...interface{}) {
	Logger.Debug(args...)
}
func Fatal(args ...interface{}) {
	Logger.Debug(args...)
}
func Panic(args ...interface{}) {
	Logger.Debug(args...)
}
func Infof(format string, args ...interface{}) {
	Logger.Infof(format, args...)
}
