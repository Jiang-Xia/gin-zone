package middleware

import (
	"github.com/gin-gonic/gin"
	"net/http/httputil"
	"net/url"
)

var BlogUrl = "https://jiang-xia.top/x-api/blog-server"

// https://jiang-xia.top/x-doc/blog-doc/ 文档地址

func ReverseProxy() gin.HandlerFunc {
	target := BlogUrl
	url, _ := url.Parse(target)
	proxy := httputil.NewSingleHostReverseProxy(url)
	return func(c *gin.Context) {
		//fmt.Println("Request", c.Request.RequestURI)
		prefix := "/api/v1/blog"
		//去除url前缀的字符串
		str := c.Request.URL.Path[len(prefix):]
		//重新设置代理请求的url
		c.Request.URL.Path = str
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
