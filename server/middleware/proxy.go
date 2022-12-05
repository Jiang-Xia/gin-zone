package middleware

import (
	"fmt"
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
)

// var BlogUrl = "https://jiang-xia.top/x-api/blog-server"
var BlogUrl = "http://localhost:5000"

// https://jiang-xia.top/x-doc/blog-doc/ 文档地址

func ReverseProxy() gin.HandlerFunc {
	target := BlogUrl
	url, _ := url.Parse(target)

	proxy := httputil.NewSingleHostReverseProxy(url) // 新建代理
	//反向代理网关
	return func(c *gin.Context) {
		c.Request.URL.Host = url.Host
		c.Request.URL.Scheme = url.Scheme
		prefix := "/api/v1/blog"
		//去除url前缀的字符串
		newPath := c.Request.URL.Path[len(prefix):]
		//重新设置代理请求的url
		c.Request.URL.Path = newPath
		// c.Request.Host = url.Host
		fmt.Printf("c.Header: %+v\n", c.Request.URL)
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
