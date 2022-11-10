package router

import (
	"fmt"

	"gitee.com/jiang-xia/gin-zone/server/app/controller/admin"
	"gitee.com/jiang-xia/gin-zone/server/app/controller/mobile"
	docs "gitee.com/jiang-xia/gin-zone/server/docs"
	"github.com/gin-gonic/gin" // gin-swagger middleware
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// swagger embed files

// 初始化路由

func RouterApp() (r *gin.Engine) {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	// 静态路由
	router.Static("/public", "./public")
	router.Static("/uploads", "./public/uploads")

	// 不需要经过token验证的路由
	// authController := new(admin.Auth)
	// router.POST("/admin/login", authController.SignIn)
	fmt.Println("接口地址为:127.0.0.1:9600/api/v1/admin/user/list")

	// 需要设置Swagger BasePath不然和注释里的不一致导致Swagger打不开
	docs.SwaggerInfo.BasePath = "/api/v1"

	v1 := router.Group("/api/v1")
	{
		// 管理端路由
		back := v1.Group("admin")
		userController := new(admin.User)
		{
			// back.GET("welcome", func(c *gin.Context) {
			// 	c.String(http.StatusOK, "Hello World")
			// })
			back.POST("login", userController.Login)
			back.POST("register", userController.Register)
			back.GET("user/list", userController.UserList)
			back.DELETE("delete", userController.DeleteUser)

		}

		// mobile端路由
		app := v1.Group("mobile")
		{
			userController := new(mobile.User)
			app.POST("login", userController.Login)
			app.POST("register", userController.Register)
		}

		// swagger 文档
		v1.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}
	return router
}
