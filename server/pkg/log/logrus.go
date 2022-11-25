package log

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"path"
	"path/filepath"

	"gitee.com/jiang-xia/gin-zone/server/pkg/utils"

	"time"

	"github.com/gin-gonic/gin"
	rotatelogs "github.com/lestrrat/go-file-rotatelogs"
	"github.com/rifflock/lfshook"
	"github.com/sirupsen/logrus"
)

var Logger *logrus.Logger

// 自定日志样式 MyFormatter
type MyFormatter struct{}

func (m *MyFormatter) Format(entry *logrus.Entry) ([]byte, error) {
	var b *bytes.Buffer
	if entry.Buffer != nil {
		b = entry.Buffer
	} else {
		b = &bytes.Buffer{}
	}

	timestamp := entry.Time.Format("2006-01-02 15:04:05")
	var newLog string

	//HasCaller()为true才会有调用信息
	if entry.HasCaller() {
		fName := filepath.Base(entry.Caller.File)
		newLog = fmt.Sprintf("[zone-app] [%s] [%s] [%s:%d] [msg=%s]\n",
			timestamp, entry.Level, fName, entry.Caller.Line, entry.Message)
	} else {
		newLog = fmt.Sprintf("[zone-app] [%s] [%s] [msg=%s]\n", timestamp, entry.Level, entry.Message)
	}

	b.WriteString(newLog)
	return b.Bytes(), nil
}

// 配置日志切割
// LogFileCut 日志文件切割
func LogFileCut(fileName string) *rotatelogs.RotateLogs {
	logier, err := rotatelogs.New(
		// 切割后日志文件名称
		fileName,
		//rotatelogs.WithLinkName(Current.LogDir),   // 生成软链，指向最新日志文件
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
		})
	logrus.AddHook(lfHook)
	return logier
}
func ConfigLog() (logger *logrus.Logger) {
	// 没有logs 文件夹则创建
	os.MkdirAll("./logs", 0755)
	logger = logrus.New()
	logger.SetReportCaller(true)
	// 设置日志输出控制台样式
	// logrus.SetFormatter(&MyFormatter{})
	logger.SetFormatter(&logrus.TextFormatter{
		TimestampFormat: "2006-01-02 15:04:05",
	})
	// 按天分割 logs/2006-01-02.log
	logFileName := path.Join("./logs", "zone") + ".%Y%m%d.log"
	// 配置日志分割
	logFileCut := LogFileCut(logFileName)
	writers := []io.Writer{
		logFileCut,
		os.Stdout}

	// 输出到控制台，方便定位到那个文件
	fileAndStdoutWriter := io.MultiWriter(writers...)
	gin.DefaultWriter = fileAndStdoutWriter

	logger.Info("init log end")
	return logger
}

// 初始化配置 logrus
func InitLogrus() {
	file := utils.GetLogFile("")
	//设置输出
	// writers := []io.Writer{
	// 	file,
	// 	os.Stdout}
	// io.MultiWriter(writers...)
	logrus.SetOutput(file)

	//设置日志级别
	logrus.SetLevel(logrus.InfoLevel)
	//设置日志格式
	logrus.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: "2006-01-02 15:04:05", // 日志时间格式
	})
	// 设置日志格式为json格式
	// logrus.SetFormatter(&logrus.TEXTFormatter{
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

// func init() {
// 	// 默认创建一个logrus实例
// 	Logger = CreateLogrus()
// }
