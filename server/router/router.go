package router

import (
	"fmt"

	"gitee.com/jiang-xia/gin-zone/server/app/controller/admin"
	"gitee.com/jiang-xia/gin-zone/server/app/controller/mobile"
	"github.com/gin-gonic/gin"
)

// 初始化路由

func RouterApp() (r *gin.Engine) {
	gin.SetMode(gin.ReleaseMode)
	const version = "zone/v1/"
	router := gin.Default()
	// 静态路由
	router.Static("/public", "./public")
	router.Static("/uploads", "./public/uploads")

	// 不需要经过token验证的路由
	// authController := new(admin.Auth)
	// router.POST("/admin/login", authController.SignIn)

	// 管理端路由
	back := router.Group(version + "admin")
	fmt.Printf("接口地址为:127.0.0.1:9600/" + version + "admin/login")
	userController := new(admin.User)
	{
		// back.GET("welcome", func(c *gin.Context) {
		// 	c.String(http.StatusOK, "Hello World")
		// })
		back.POST("login", userController.Login)

	}

	// mobile端路由
	app := router.Group(version + "mobile")
	{
		userController := new(mobile.User)
		app.POST("login", userController.Login)
	}
	return router
}
