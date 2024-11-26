package database

import (
	"context"

	"gitee.com/jiang-xia/gin-zone/server/config"
	"gitee.com/jiang-xia/gin-zone/server/pkg/log"
	"github.com/go-redis/redis/v9"
)

var ctx = context.Background()
var RedisObj *redis.Client

func RedisInit() {
	Addr := config.Redis.Host
	RedisObj = redis.NewClient(&redis.Options{
		Addr:     Addr,
		Password: "", // no password set
		DB:       0,  // use default DB //选择0-15号redis数据库，
	})
	log.Info("Redis初始化成功==================>")
	// redisKvCache["system_info"] = createKv(map[string]string{"tail": "system_info"})
	// redisKvCache["user_info"] = createKv(map[string]string{"tail": "user_info"})
	// redisKvCache["video_parse_cache"] = createKv(map[string]string{"tail": "video_parse_cache"})
	// redisKvCache["video_parse_user"] = createKv(map[string]string{"tail": "video_parse_user"})
}

func Redis() *redis.Client {
	return RedisObj
}
