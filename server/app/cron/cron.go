package cron

import (
	"gitee.com/jiang-xia/gin-zone/server/pkg/log"
	"github.com/robfig/cron/v3"
)

//var Services *cron.Cron

// @yearly  每年一次（晚上12点执行）
// @monthly 每月一次
// @weekly 每周一次
// @daily 每天一次
// @hourly 每小时一次
// @every 1d1h30m5s 每一天一小时三十分五秒一次

func init() {
	// 创建一个默认的cron对象 默认为分开始 设置为秒
	c := cron.New(cron.WithSeconds())
	_, err := c.AddFunc("@daily", func() {
		log.Info("每日凌晨执行===========>")
		GetGuShiCi()
	})
	if err != nil {
		log.Warning("添加定时任务报错")
	}
	//c.AddFunc("@daily", func() {
	//	log.Info("每日凌晨执行===========>")
	//	getGuShiCi()
	//})
	//开始执行任务
	c.Start()
	//select {} //阻塞
}
