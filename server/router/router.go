package router

import (
	"fmt"

	"gitee.com/jiang-xia/gin-zone/server/app/controller/base"
	docs "gitee.com/jiang-xia/gin-zone/server/docs"
	"github.com/gin-gonic/gin" // gin-swagger middleware
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// api文档说明：
// @title           Gin-Zone-Api
// @version         1.0
// @description     zone服务端API服务
// @host      localhost:9600
// @BasePath  /api/v1

// @securityDefinitions.basic  BasicAuth

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

	fmt.Println("接口文档地址为: 127.0.0.1:9600/api/v1/swagger/index.html")
	// 需要设置Swagger BasePath不然和注释里的不一致导致Swagger打不开
	docs.SwaggerInfo.BasePath = "/api/v1"

	v1 := router.Group("/api/v1")
	{
		// 基础路由（公共）
		baseGroup := v1.Group("base")
		baseController := new(base.User)
		{
			baseGroup.POST("login", baseController.Login)
			baseGroup.POST("register", baseController.Register)
			baseGroup.GET("users", baseController.UserList)
			baseGroup.DELETE("delete", baseController.DeleteUser)
		}

		// // 管理端路由
		// back := v1.Group("admin")
		// userController := new(base.User)
		// {

		// }

		// // mobile端路由
		// app := v1.Group("mobile")
		// {
		// 	app.POST("login", userController.Login)
		// }

		// swagger 文档
		v1.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}
	return router
}
