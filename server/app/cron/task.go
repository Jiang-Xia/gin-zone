package cron

import (
	"context"
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"

	"gitee.com/jiang-xia/gin-zone/server/app/database"
)

var ctx = context.Background()

// GetGuShiCi 每日凌晨0点去获取古诗词一次，更新到redis缓存中
func GetGuShiCi() {
	//一级分类
	var categoryList = [2]string{"rensheng/lizhi", "rensheng/zheli"}
	//随机取切片中的一项
	category := categoryList[rand.Intn(len(categoryList))]
	//data := make(map[string]interface{})
	var err error
	var GuShiCiUrl = "https://v1.jinrishici.com/" + category + ".json"
	resp, _ := http.Get(GuShiCiUrl)
	body, _ := ioutil.ReadAll(resp.Body)
	//json.Unmarshal([]byte(body), &data)
	fmt.Printf("古诗词数据: %+v\n", string(body))
	//第三个参数为到期时间
	err = database.Redis().Set(ctx, "z_gu_shi_ci", body, 0).Err()
	if err != nil {
		panic(err)
	}
}

// TaskInit 初始化调用
func TaskInit() {
	GetGuShiCi()
}
