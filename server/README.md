
<div align="center">
	<!-- <img style="width: 80px;height: 80px" src=""/> -->
	<h1>zone</h1>
</div>


[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

#### 1.介绍
##### 1.1简介
 Zone server 服务端是使用go、gin、等技术栈编写后端服务

#### 1.2 技术栈

##### 1.2.1 后台
技术 | 说明 | 官网
----|----|----
Golang - 1.19 | 开发语言 | [https://go.dev/](https://go.dev/)
Gin - 1.8.1 | Gin Web Framework | [https://gin-gonic.com/zh-cn/docs/](https://gin-gonic.com/zh-cn/docs/)
Mysql - 8.0.28 | 数据库 | [https://www.mysql.com/cn/](https://www.mysql.com/cn/)
Gorm - 1.9.16 | Golang ORM | [https://gorm.io/zh_CN/docs/index.html](https://gorm.io/zh_CN/docs/index.html)
Jwt | Golang jwt | [https://github.com/golang-jwt/jwt](https://github.com/golang-jwt/jwt)
Logrus | 日志 | [https://github.com/sirupsen/logrus](https://github.com/sirupsen/logrus)
Base64Captcha | 验证码 | [https://github.com/mojocn/base64Captcha](https://github.com/mojocn/base64Captcha)
Crypto | 密码库 | [https://golang.org/x/crypto](https://golang.org/x/crypto)
Ini | ini文件库 | [https://github.com/go-ini/ini](https://github.com/go-ini/ini)
Goment | 时间处理工具 | [https://github.com/nleeper/goment](https://github.com/nleeper/goment)
Air | 热更新工具 | [https://github.com/cosmtrek/air](https://github.com/cosmtrek/air)
gin-swagger 自动生成RESTful风格文档 | [https://github.com/swaggo/gin-swagger](https://github.com/swaggo/gin-swagger)
#### 1.3 开发工具


系统 | 工具 | 官网
----|----|----
VS Code | 开发工具 | [https://code.visualstudio.com/](https://code.visualstudio.com/)
DBeaver | 开源数据库管理工具 | [https://dbeaver.io/](https://dbeaver.io/)
Chrome | 调试工具 | [https://www.google.com/intl/zh-CN/chrome/](https://www.google.com/intl/zh-CN/chrome/)
  
#### 1.4 文件结构
整体的结构参考世上最优美的框架 [Laravel](https://laravel.com/)。
```javascript
├─app                 // 核心代码
│  ├─controller       // 控制层
│  │  ├─admin
│  │  └─mobile
│  ├─database        // 数据库链接
│  ├─model           // 模型层
│  └─service         // 操作数据层
├─config             // 配置文件
├─pkg                // 所有工具文件
│  ├─tip             // 编写一些常量状态和提示信息
│  ├─hash            // 验证码
│  ├─response        // 返回封装
│  └─utils           // 工具库
```

Tips：

- Air
由于go本身没有热加载技术，所以还需要一个热加载工具的支持。可选的也不多，
##### 1. [Fresh](https://github.com/gravityblast/fresh)
Fresh满足基础的应用，每次保存文件都会生成或重新启动Web应用程序，只是这工具多年未更新所以弃用。
##### 2. [Air](https://github.com/cosmtrek/air)
Air的优点也比较突出：彩色日志输出，自定义构建或二进制命令，支持忽略子目录，启动后支持监听新目录等等的。
###### 2.1 `Air` 存在问题
Air存在缓存问题，虽然在cmd里边结束Air，但刷新浏览器程序依然在运行，这时就需要手工结束进程然后重启。
```javascript
// 查找 PID，9888为端口号
netstat -ano | findstr 9888
// 杀死进程，14172 查到的pid
taskkill /pid 14172 /f
```
#### 代码仓库

- [gin-zone/server](https://gitee.com/jiang-xia/gin-zone/server)

<!-- #### 项目示例图 -->

#### 安装使用

- 安装依赖

```bash
go mod download
```

- 运行

```bash
air
```

- 打包

```bash
 go build
```

## 开源作者

**jiang-xia**
