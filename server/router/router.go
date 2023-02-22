package router

import (
	"fmt"

	"gitee.com/jiang-xia/gin-zone/server/app/controller/admin"
	"gitee.com/jiang-xia/gin-zone/server/app/controller/base"
	"gitee.com/jiang-xia/gin-zone/server/app/controller/mobile"
	"gitee.com/jiang-xia/gin-zone/server/config"
	docs "gitee.com/jiang-xia/gin-zone/server/docs" // 需要引入docs, 不然打不开文档
	"gitee.com/jiang-xia/gin-zone/server/middleware"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"     // swagger embed files
	ginSwagger "github.com/swaggo/gin-swagger" // gin-swagger middleware
)

// App  初始化路由
func App() (r *gin.Engine) {
	// 强制日志颜色化
	//gin.ForceConsoleColor()
	gin.SetMode(gin.ReleaseMode)
	// gin.SetMode(gin.TestMode)
	router := gin.Default()
	// 静态资源路由
	router.Static("/public", "./public")
	// 跨域处理
	router.Use(middleware.Cors())
	router.Use(middleware.LoggerMiddleWare())

	// 不需要经过token验证的路由
	// authController := new(admin.Auth)
	// router.POST("/admin/login", authController.SignIn)
	fmt.Println("接口文档地址为: http://127.0.0.1:9600/api/v1/swagger/index.html")
	v1 := router.Group("/api/v1")
	{
		// 基础路由（公共）
		baseGroup := v1.Group("base")
		// baseGroup.Use(middleware.JWTAuth())
		{
			// 用户路由
			userController := new(base.User)
			baseGroup.POST("auth/wxlogin", userController.WeiXinLogin)
			baseGroup.POST("users/login", userController.Login)
			baseGroup.POST("users", userController.Register)
			baseGroup.Use(middleware.JWTAuth())
			baseGroup.PATCH("users/:id", userController.UpdateUser)
			baseGroup.GET("users", middleware.JWTAuth(), userController.UserList)
			baseGroup.GET("users/info", userController.UserInfo)
			baseGroup.DELETE("users/:id", userController.DeleteUser)
			baseGroup.POST("users/password", userController.ChangePassword)

			// 基础路由
			baseController := new(base.Base)
			baseGroup.POST("/upload", baseController.Upload)
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
		//动态模块
		momentController := new(mobile.Moment)
		{
			app.GET("/moments", momentController.MomentList)
			app.POST("/moments", middleware.JWTAuth(), momentController.AddMoment)
		}
		//聊天模块
		chatController := new(mobile.Chat)
		{
			app.GET("chat", chatController.WebSocketHandle)
			app.Use(middleware.JWTAuth())
			app.GET("chat/friends", chatController.FriendList)
			app.POST("chat/updateReadTime", chatController.UpdateReadTime)
			app.GET("chat/groups", chatController.GroupList)
			app.GET("chat/groupMembers", chatController.GroupMemberList)
			app.POST("chat/logs", chatController.ChatLogList)
			app.POST("chat/friends", chatController.AddFriend)
			app.DELETE("chat/friends/:friendId", chatController.DelFriend)
			app.POST("chat/groups", chatController.AddGroup)
			app.DELETE("chat/groups/:groupId", chatController.DelGroup)
			app.POST("chat/groupMembers", chatController.AddGroupMember)
			app.DELETE("chat/groupMembers/:groupId", chatController.ExitGroupMember)
		}

		//博客模块路由 直接转发到blog-server
		blog := v1.Group("blog")
		blog.POST("article/list", middleware.ReverseProxy())
		blog.GET("article/info", middleware.ReverseProxy())
		blog.GET("tag", middleware.ReverseProxy())
		blog.GET("category", middleware.ReverseProxy())
		blog.GET("comment/findAll", middleware.ReverseProxy())
		blog.GET("article/views", middleware.ReverseProxy())
		blog.GET("resources/daily-img", middleware.ReverseProxy())

		// 用于 这个模块转发其他第三方接口
		third := v1.Group("third")
		thirdController := new(base.Third)
		third.GET("gushici", thirdController.GetGuShiCi)
		third.POST("chatGPT", thirdController.ChatGPT)
		setDocsInfo()
		// swagger 文档
		v1.GET("/swagger/*any", ginSwagger.WrapHandler(
			swaggerFiles.Handler,
			//文档授权持久化
			ginSwagger.PersistAuthorization(true),
		))
	}

	return router
}

// 配置swagger文档信息
func setDocsInfo() {
	docs.SwaggerInfo.BasePath = config.Docs.BasePath
	docs.SwaggerInfo.Host = config.Docs.Host
}
