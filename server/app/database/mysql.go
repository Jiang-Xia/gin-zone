package database

import (
	"fmt"
	"log"
	"time"

	"gitee.com/jiang-xia/gin-zone/server/pkg/utils"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
)

var Mysql *gorm.DB

func init() {
	dbSetup()
}

/*
*
数据库初始化
*/
func dbSetup() {
	// dsn := "root:88888888@/elk-blog?charset=utf8&parseTime=True&loc=Local"

	var (
		err                                               error
		dbType, dbName, user, password, host, tablePrefix string
	)

	sec := utils.Config.Section("database")

	dbType = sec.Key("type").String()
	dbName = sec.Key("dbname").String()
	user = sec.Key("user").String()
	password = sec.Key("password").String()
	host = sec.Key("host").String()
	tablePrefix = sec.Key("table_prefix").String()

	Mysql, err = gorm.Open(
		dbType,
		fmt.Sprintf("%s:%s@tcp(%s)/%s?charset=utf8",
			user,
			password,
			host,
			dbName,
		))

	// defer Mysql.Close()

	if err != nil {
		panic(err)
	}

	// 设置默认表名的命名规则
	gorm.DefaultTableNameHandler = func(Mysql *gorm.DB, defaultTableName string) string {
		return tablePrefix + defaultTableName
	}
	Mysql.SingularTable(true)                      // 全局禁用表名复数
	Mysql.DB().SetMaxIdleConns(25)                 // 设置最大空闲连接数
	Mysql.DB().SetMaxOpenConns(100)                // 设置最大连接数
	Mysql.DB().SetConnMaxLifetime(5 * time.Minute) // 设置每个链接的过期时间

	// 启用Logger，显示详细日志
	Mysql.LogMode(true)

	// 调试单个操作，显示此操作的详细日志
	// Mysql.Debug().Where("name = ?", "jinzhu").First(&User{})
}

func CloseDB() {
	defer func() {
		err := Mysql.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()
}
