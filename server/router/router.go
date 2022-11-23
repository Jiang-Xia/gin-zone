package router

import (
	"fmt"

	"gitee.com/jiang-xia/gin-zone/server/app/controller/admin"
	"gitee.com/jiang-xia/gin-zone/server/app/controller/base"
	_ "gitee.com/jiang-xia/gin-zone/server/docs" // 需要引入docs, 不然打不开文档
	"gitee.com/jiang-xia/gin-zone/server/middleware"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"     // swagger embed files
	ginSwagger "github.com/swaggo/gin-swagger" // gin-swagger middleware
)

// api文档说明：

/* 初始化路由 */
func RouterApp() (r *gin.Engine) {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	// 静态路由
	router.Static("/public", "./public")
	router.Static("/uploads", "./public/uploads")
	// 跨域处理
	router.Use(middleware.Cors())
	// 不需要经过token验证的路由
	// authController := new(admin.Auth)
	// router.POST("/admin/login", authController.SignIn)

	fmt.Println("接口文档地址为: 127.0.0.1:9600/api/v1/swagger/index.html")
	v1 := router.Group("/api/v1")
	{
		// 基础路由（公共）
		baseGroup := v1.Group("base")
		// baseGroup.Use(middleware.JWTAuth())
		{
			userController := new(base.User)

			baseGroup.POST("login", userController.Login)
			baseGroup.POST("users", userController.Register)
			baseGroup.GET("users", middleware.JWTAuth(), userController.UserList)
			baseGroup.GET("users/info", userController.UserInfo)
			baseGroup.DELETE("delete/:id", userController.DeleteUser)
		}

		// 管理端路由
		back := v1.Group("admin")
		// baseGroup.Use(middleware.JWTAuth())
		{
			momentController := new(admin.Moment)
			back.GET("moments", momentController.GetList)
		}

		// mobile端路由
		app := v1.Group("mobile")
		{
			momentController := new(admin.Moment)
			app.GET("moments", momentController.GetList)
		}

		// swagger 文档
		ginSwagger.PersistAuthorization(true)
		v1.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	return router
}
