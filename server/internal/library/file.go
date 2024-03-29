package l

import (
	"fmt"
	"gitee.com/jiang-xia/gin-zone/server/config"
	"os"
	"path"
)

// 判断路径是否存在
func IsExists(path string) (os.FileInfo, bool) {
	f, err := os.Stat(path)
	return f, err == nil
}

// 获取记录日志的文件
func GetLogFile(t string) (file *os.File) {
	logFilePath := config.Log.LogFilePath
	logFileName := config.Log.LogFileName

	// 获取sql记录的日志文件
	if t == "sql" {
		logFileName = config.Log.LogFileSqlName
	}
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
	_, b := IsExists(fileName)
	var err error
	if b {
		//打开文件，
		file, _ = os.OpenFile(fileName, os.O_APPEND|os.O_RDWR, os.ModeAppend)
	} else {
		//新建文件
		file, err = os.Create(fileName)
	}

	if err != nil {
		fmt.Println("err", err)
	}
	return file
}
