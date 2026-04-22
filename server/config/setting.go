package config

import (
	"fmt"
	"runtime"

	"gopkg.in/ini.v1"
)

var AllConfig *ini.File
var App *appModel
var Database *databaseModel
var Docs *docsModel
var Redis *redisModel
var Log *logModel

// AppModel 应用相关配置
type appModel struct {
	Env             string `ini:"env"`
	Key             string `ini:"key"`
	PageSize        int    `ini:"page_size"`
	WechatAppId     string `ini:"wechat_app_id"`
	WechatAppSecret string `ini:"wechat_app_secret"`
	OpenaiAppKey    string `ini:"openai_app_key"`
	PublicPath      string `ini:"public_path"`
	PublicKey       string `ini:"public_key"`
	PrivateKey      string `ini:"private_key"`
	// AllowedOrigins 逗号分隔，生产环境 WebSocket Origin 白名单（dev 下本机多端口见 chat 内逻辑）
	AllowedOrigins string `ini:"allowed_origins"`
	// SensitiveAutoRevoke 敏感词命中后是否自动撤回（默认开启）
	SensitiveAutoRevoke bool `ini:"sensitive_auto_revoke"`
}

// 数据库配置
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

// 文档配置
type docsModel struct {
	Host     string `ini:"host"`
	BasePath string `ini:"base_path"`
}

// redis配置
type redisModel struct {
	Host string `ini:"host"`
}

// 日志配置
type logModel struct {
	LogFilePath    string `ini:"log_file_path"`
	LogFileName    string `ini:"log_file_name"`
	LogFileSqlName string `ini:"log_file_sql_name"`
	LogLevel       string `ini:"log_level"`
}

func InitLoadInIConfig() {
	loadInI()
}

// LoadInI 载入配置
func loadInI() {
	//服务器和本地配置分开，不然取git的配置有些密钥容易过期
	filePath := "config/env.ini"
	if runtime.GOOS == "linux" {
		filePath = "/opt/jxapp/config/zone_env.ini"
	} else if runtime.GOOS == "windows" {
		// 切换电脑需要根据配置文件修改和增加public和logs目录
		filePath = "D:/study/config/env.ini"
	}
	fmt.Println("配置文件路径:", filePath)
	var err error
	AllConfig, err = ini.Load(filePath)
	if err != nil {
		panic(fmt.Sprintf("Fail to parse 'conf/env.ini': %v", err))
	}
	setApp()
}

func setApp() {
	App = new(appModel)
	// 中文注释：敏感词策略默认“记录命中+自动撤回+广播拦截提示”
	App.SensitiveAutoRevoke = true
	Database = new(databaseModel)
	Docs = new(docsModel)
	Redis = new(redisModel)
	Log = new(logModel)

	if err := AllConfig.Section("app").MapTo(App); err != nil {
		fmt.Println("初始化配置失败 app", err.Error())
	}
	if err := AllConfig.Section("database").MapTo(Database); err != nil {
		fmt.Println("初始化配置失败 database", err.Error())
	}
	if err := AllConfig.Section("docs").MapTo(Docs); err != nil {
		fmt.Println("初始化配置失败 docs", err.Error())
	}
	if err := AllConfig.Section("redis").MapTo(Redis); err != nil {
		fmt.Println("初始化配置失败 redis", err.Error())
	}
	if err := AllConfig.Section("log").MapTo(Log); err != nil {
		fmt.Println("初始化配置失败 log", err.Error())
	}
	fmt.Printf("初始化项目配置完成: env=%s, dbHost=%s, redisHost=%s\n", App.Env, Database.Host, Redis.Host)
}
