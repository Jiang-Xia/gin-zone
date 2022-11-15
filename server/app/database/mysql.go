package database

import (
	"fmt"

	"gitee.com/jiang-xia/gin-zone/server/pkg/utils"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
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
		err                                                     error
		dbType, dbName, user, password, host, port, tablePrefix string
	)
	// 读取配置
	sec := utils.Config.Section("database")

	dbType = sec.Key("type").String()
	dbName = sec.Key("dbname").String()
	user = sec.Key("user").String()
	password = sec.Key("password").String()
	host = sec.Key("host").String()
	port = sec.Key("port").String()
	tablePrefix = sec.Key("table_prefix").String()
	fmt.Println(dbType, dbName, user, password, host, tablePrefix)
	// dsn := user + ":" + password + "@tcp(" + host + ":" + port + ")/" + dbName + "?charset=utf8mb4&parseTime=True&loc=Local"
	//拼接下dsn参数, dsn格式可以参考上面的语法，这里使用Sprintf动态拼接dsn参数，因为一般数据库连接参数，我们都是保存在配置文件里面，需要从配置文件加载参数，然后拼接dsn。
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", user, password, host, port, dbName)
	db, err := gorm.Open(mysql.New(mysql.Config{
		DSN:                       dsn,   // DSN data source name
		DefaultStringSize:         256,   // string 类型字段的默认长度
		DisableDatetimePrecision:  true,  // 禁用 datetime 精度，MySQL 5.6 之前的数据库不支持
		DontSupportRenameIndex:    true,  // 重命名索引时采用删除并新建的方式，MySQL 5.7 之前的数据库和 MariaDB 不支持重命名索引
		DontSupportRenameColumn:   true,  // 用 `change` 重命名列，MySQL 8 之前的数据库和 MariaDB 不支持重命名列
		SkipInitializeWithVersion: false, // 根据当前 MySQL 版本自动配置
	}), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	fmt.Println(db)
	// 设置默认表名的命名规则
	// gorm.DefaultTableNameHandler = func(Mysql *gorm.DB, defaultTableName string) string {
	// 	return tablePrefix + defaultTableName
	// }

	// Mysql.SingularTable(true)                      // 全局禁用表名复数
	// Mysql.DB().SetMaxIdleConns(25)                 // 设置最大空闲连接数
	// Mysql.DB().SetMaxOpenConns(100)                // 设置最大连接数
	// Mysql.DB().SetConnMaxLifetime(5 * time.Minute) // 设置每个链接的过期时间

	// 启用Logger，显示详细日志
	// Mysql.LogMode(true)

	// 调试单个操作，显示此操作的详细日志
	// Mysql.Debug().Where("name = ?", "jinzhu").First(&User{})
}

func CloseDB() {
	defer func() {
		// err := Mysql.Close()
		// if err != nil {
		// 	log.Fatal(err)
		// }
	}()
}
