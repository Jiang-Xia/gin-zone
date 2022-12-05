package middleware

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"net/http/httputil"
	"net/url"
)

var BlogUrl = "https://jiang-xia.top/x-api/blog-server"

//var BlogUrl = "http://localhost:5000"

// https://jiang-xia.top/x-doc/blog-doc/ 文档地址

func ReverseProxy() gin.HandlerFunc {
	//反向代理网关
	return func(c *gin.Context) {
		target := BlogUrl
		remote, _ := url.Parse(target)
		proxy := httputil.NewSingleHostReverseProxy(remote) // 新建代理
		prefix := "/api/v1/blog"
		//去除url前缀的字符串
		newPath := c.Request.URL.Path[len(prefix):]
		proxy.Director = func(req *http.Request) {
			req.Header = c.Request.Header
			req.Host = remote.Host
			req.URL.Scheme = remote.Scheme
			req.URL.Host = remote.Host
			// 地址路径加上request路径
			req.URL.Path = remote.Path + newPath
		}
		//fmt.Printf("c.Header: %+v\n", c.Request.Header)

		//巨坑！！ 因为blog-server设置了跨域请求，本项目也设置了跨域请求。导致响应头Access-Control-Allow-Origin出现多个，导致浏览器出现跨域问题。
		// 现在删掉一个即可（删掉的是本项目设置的指定域名）
		c.Writer.Header().Del("Access-Control-Allow-Origin")
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
