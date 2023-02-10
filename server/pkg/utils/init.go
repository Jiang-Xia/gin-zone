package utils

import (
	"fmt"
	"time"

	"github.com/bwmarrin/snowflake"
)

var node *snowflake.Node

func GenId() string {
	id := node.Generate()
	// fmt.Printf("Int64  ID: %d\n", id)
	// fmt.Printf("String ID: %s\n", id)
	// fmt.Printf("Base2  ID: %s\n", id.Base2())
	// fmt.Printf("Base64 ID: %s\n", id.Base64())
	// 字符串好点，不然传到前端JSON会失真
	return id.String()
}

func InitSnowflake(startTime string, machineId int64) (err error) {
	var st time.Time
	st, err = time.Parse("2006-01-02", startTime)
	if err != nil {
		return err
	}
	fmt.Println("st:", st)
	snowflake.Epoch = st.UnixNano() / 1000000
	node, err = snowflake.NewNode(machineId) // 绑定机器号
	return err
}

// 初始化雪花算法
func init() {
	if err := InitSnowflake(time.Now().Format("2006-01-02"), 1); err != nil {
		fmt.Printf("init failed ,err:%v\n", err)
	}
	id := GenId()
	// for i := 0; i < 10000; i++ {
	// 	fmt.Println(GenId())
	// }
	fmt.Println("GenId: ", id)
}
