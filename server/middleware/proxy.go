package middleware

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"gitee.com/jiang-xia/gin-zone/server/config"
	"gitee.com/jiang-xia/gin-zone/server/pkg/response"
	"github.com/gin-gonic/gin"
)

// https://jiang-xia.top/x-doc/blog-doc/ 文档地址

func ReverseProxy() gin.HandlerFunc {
	//反向代理网关
	return func(c *gin.Context) {
		rPath := c.Request.URL.Path
		prefix := "/api/v1/blog"
		remoteUrl := strings.TrimSpace(config.App.BlogUrl)
		// 中文注释：读取第三方博客地址用于反向代理，线上部署时通过 env.ini 配置即可
		if remoteUrl == "" {
			response.Fail(c, "blog_url 未配置（请检查 env.ini: app.blog_url）", nil)
			return
		}
		newPath := ""
		if strings.Contains(rPath, "blog") {
			//去除url前缀的字符串
			newPath = rPath[len(prefix):]
		}
		remote, err := url.Parse(remoteUrl)
		if err != nil || remote == nil {
			response.Fail(c, "blog_url 配置格式错误", nil)
			return
		}
		proxy := httputil.NewSingleHostReverseProxy(remote) // 新建代理
		newPath = remote.Path + newPath

		proxy.Director = func(req *http.Request) {
			req.Header = c.Request.Header
			req.Host = remote.Host
			req.URL.Scheme = remote.Scheme
			req.URL.Host = remote.Host
			// 地址路径加上request路径
			req.URL.Path = newPath
		}

		// 中文注释：blog-server 也会返回 CORS 相关头；本服务也会统一通过 `middleware.Cors()` 生成。
		// 为避免响应头重复/冲突，移除 blog-server 的 CORS 头，让浏览器最终以本服务的 `Access-Control-Allow-Origin: Origin` 为准。
		proxy.ModifyResponse = func(resp *http.Response) error {
			if resp == nil {
				return nil
			}
			resp.Header.Del("Access-Control-Allow-Origin")
			resp.Header.Del("Access-Control-Allow-Credentials")
			resp.Header.Del("Access-Control-Allow-Headers")
			resp.Header.Del("Access-Control-Allow-Methods")
			resp.Header.Del("Access-Control-Expose-Headers")
			return nil
		}

		//fmt.Printf("c.Header: %+v\n", c.Request.Header)
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
