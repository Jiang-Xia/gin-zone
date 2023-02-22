package config

import (
	"fmt"
	"log"
	"runtime"

	"gopkg.in/ini.v1"
)

var AllConfig *ini.File
var App *appModel
var Database *databaseModel
var Docs *docsModel
var Redis *redisModel

// AppModel 应用相关配置
type appModel struct {
	Env             string `ini:"env"`
	Key             string `ini:"key"`
	PageSize        int    `ini:"page_size"`
	WechatAppId     string `ini:"wechat_app_id"`
	WechatAppSecret string `ini:"wechat_app_secret"`
	OpenaiAppKey    string `ini:"openai_app_key"`
}
type databaseModel struct {
	Type        string `ini:"type"`
	Host        string `ini:"host"`
	Port        string `ini:"port"`
	User        string `ini:"user"`
	Password    string `ini:"password"`
	DbName      string `ini:"dbname"`
	Charset     string `ini:"charset"`
	MaxIdle     string `ini:"max_idle"`
	MaxConn     string `ini:"max_conn"`
	TablePrefix string `ini:"table_prefix"`
}

type docsModel struct {
	Host     string `ini:"host"`
	BasePath string `ini:"base_path"`
}

type redisModel struct {
	Host string `ini:"host"`
}

func InitLoadInIConfig() {
	loadInI()
}

// LoadInI 载入配置
func loadInI() {
	//服务器和本地配置分开，不然取git的配置有些密钥容易过期
	filePath := "config/env.ini"
	if runtime.GOOS == "linux" {
		filePath = "/root/server/config/env.ini"
	} else if runtime.GOOS == "windows" {
		filePath = "D:/study/gitee/config/env.ini"
	}
	fmt.Println("配置文件路径:", filePath)
	var err error
	AllConfig, err = ini.Load(filePath)
	if err != nil {
		log.Fatalf("Fail to parse 'conf/env.ini': %v", err)
	}
	setApp()
}

func setApp() {
	var err error
	App = new(appModel)
	Database = new(databaseModel)
	Docs = new(docsModel)
	Redis = new(redisModel)
	err = AllConfig.Section("app").MapTo(App)
	err = AllConfig.Section("database").MapTo(Database)
	err = AllConfig.Section("docs").MapTo(Docs)
	err = AllConfig.Section("redis").MapTo(Redis)
	fmt.Printf("初始化项目app配置: %+v\n", App)
	fmt.Printf("初始化项目database配置: %+v\n", Database)
	fmt.Printf("初始化项目Docs配置: %+v\n", Docs)
	fmt.Printf("初始化项目Redis配置: %+v\n", Redis)

	if err != nil {
		fmt.Println("初始化配置失败", err.Error())
	}
}
