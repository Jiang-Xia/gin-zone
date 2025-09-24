
<div align="center">
	<!-- <img style="width: 80px;height: 80px" src=""/> -->
	<h1>zone</h1>
</div>


[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

#### 1.介绍
##### 1.1 项目简介
 Zone Server 是一个基于 Go + Gin 框架构建的社交平台后端服务，采用 MVC 架构模式开发。项目支持用户管理、动态发布、实时聊天、文件上传等核心功能，并集成了微信登录、JWT认证、WebSocket实时通信等特性。

##### 1.2 主要功能
- 🔐 **用户系统**：用户注册/登录、微信授权登录、JWT令牌认证、密码加密
- 📝 **动态模块**：发布动态、图片/视频上传、点赞浏览统计、动态列表展示
- 💬 **聊天系统**：WebSocket实时通信、私聊/群聊、好友管理、聊天记录
- 📁 **文件管理**：文件上传、静态资源服务、多媒体文件支持
- 🔧 **系统管理**：后台管理接口、日志记录、定时任务、系统监控
- 🎯 **第三方集成**：古诗词API、ChatGPT集成、博客系统代理
- 📚 **接口文档**：Swagger自动生成API文档，支持在线调试

#### 1.3 技术栈

##### 1.3.1 核心技术
| 技术 | 版本 | 说明 | 官网 |
|------|------|------|------|
| Golang | 1.23.3 | 开发语言 | [https://go.dev/](https://go.dev/) |
| Gin | 1.10.0 | Web框架 | [https://gin-gonic.com/zh-cn/docs/](https://gin-gonic.com/zh-cn/docs/) |
| GORM | 1.25.12 | ORM框架 | [https://gorm.io/zh_CN/docs/index.html](https://gorm.io/zh_CN/docs/index.html) |
| MySQL | 8.0+ | 关系型数据库 | [https://www.mysql.com/cn/](https://www.mysql.com/cn/) |
| Redis | - | 缓存数据库 | [https://redis.io/](https://redis.io/) |
| JWT | 4.5.1 | 身份认证 | [https://github.com/golang-jwt/jwt](https://github.com/golang-jwt/jwt) |
| WebSocket | - | 实时通信 | [https://github.com/gorilla/websocket](https://github.com/gorilla/websocket) |
| Logrus | 1.9.3 | 日志记录 | [https://github.com/sirupsen/logrus](https://github.com/sirupsen/logrus) |
| Swagger | 1.16.4 | API文档 | [https://github.com/swaggo/gin-swagger](https://github.com/swaggo/gin-swagger) |
| Air | - | 热重载工具 | [https://github.com/cosmtrek/air](https://github.com/cosmtrek/air) |
| Cron | 3.0.1 | 定时任务 | [https://github.com/robfig/cron](https://github.com/robfig/cron) |
| Base64Captcha | 1.3.6 | 验证码生成 | [https://github.com/mojocn/base64Captcha](https://github.com/mojocn/base64Captcha) |
#### 1.4 开发工具


系统 | 工具 | 官网
----|----|----
VS Code | 开发工具 | [https://code.visualstudio.com/](https://code.visualstudio.com/)
DBeaver | 开源数据库管理工具 | [https://dbeaver.io/](https://dbeaver.io/)
Chrome | 调试工具 | [https://www.google.com/intl/zh-CN/chrome/](https://www.google.com/intl/zh-CN/chrome/)
  
#### 1.5 项目结构
整体的结构参考世上最优美的框架 [Laravel](https://laravel.com/)。
```
gin-zone/server/
├── app/                    # 应用核心代码
│   ├── controller/         # 控制器层
│   │   ├── admin/          # 后台管理控制器
│   │   │   └── moment.go   # 动态管理
│   │   ├── base/           # 基础控制器
│   │   │   ├── base.go     # 基础功能(文件上传等)
│   │   │   ├── third.go    # 第三方接口
│   │   │   └── user.go     # 用户管理
│   │   ├── common/         # 公共控制器
│   │   │   └── common.go   # 公共登录等
│   │   └── mobile/         # 移动端控制器
│   │       ├── chat.go     # 聊天功能
│   │       └── moment.go   # 动态功能
│   ├── cron/              # 定时任务
│   │   ├── cron.go        # 定时任务配置
│   │   └── task.go        # 具体任务实现
│   ├── database/          # 数据库配置
│   │   ├── init.go        # 数据库初始化
│   │   ├── mysql.go       # MySQL连接
│   │   └── redis.go       # Redis连接
│   ├── model/             # 数据模型层
│   │   ├── base.go        # 基础模型
│   │   ├── chat.go        # 聊天相关模型
│   │   ├── moment.go      # 动态模型
│   │   └── user.go        # 用户模型
│   └── service/           # 业务逻辑层
│       ├── chat.go        # 聊天服务
│       ├── moment.go      # 动态服务
│       └── user.go        # 用户服务
├── config/                # 配置文件
│   ├── env.ini           # 环境配置
│   ├── env.dev.ini       # 开发环境配置
│   ├── env.prod.ini      # 生产环境配置
│   └── setting.go        # 配置加载
├── internal/              # 内部工具包
│   ├── library/          # 内部库
│   └── func.go           # 内部函数
├── middleware/            # 中间件
│   ├── cors.go           # 跨域处理
│   ├── crypto.go         # 加密中间件
│   ├── jwt.go            # JWT认证
│   ├── logger.go         # 日志中间件
│   └── proxy.go          # 代理中间件
├── pkg/                   # 工具包
│   ├── hash/             # 密码哈希
│   ├── log/              # 日志工具
│   ├── response/         # 响应封装
│   ├── tip/              # 状态码定义
│   ├── translate/        # 国际化
│   └── utils/            # 通用工具
├── public/               # 静态资源
│   ├── data/            # 数据文件
│   └── uploads/         # 上传文件
├── router/               # 路由配置
│   └── router.go        # 路由定义
├── storage/              # 存储相关
│   ├── initData.sql     # 初始化数据
│   └── zone.sql         # 数据库结构
├── go.mod               # Go模块文件
├── go.sum               # 依赖校验文件
├── main.go              # 程序入口
└── README.md            # 项目说明
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
#### 2. 快速开始

##### 2.1 环境要求
- Go 1.23.3+
- MySQL 8.0+
- Redis
- Git

##### 2.2 代码仓库
- 主仓库：[gin-zone/server](https://gitee.com/jiang-xia/gin-zone/server)
- GitHub 镜像：[gin-zone](https://github.com/jiang-xia/gin-zone)

<!-- #### 项目示例图 -->

##### 2.3 安装步骤

**1. 克隆项目**
```bash
git clone https://gitee.com/jiang-xia/gin-zone.git
cd gin-zone/server
```

**2. 安装依赖**
```bash
go mod download
# 如果下载缓慢，可设置代理
go env -w GOPROXY=https://goproxy.cn,direct
```

**3. 配置环境**
- 复制配置文件：`cp config/env.ini config/env.local.ini`
- 修改 `config/setting.go` 中的 `filePath` 为本地配置文件路径
- 配置数据库连接信息（MySQL、Redis）
- 设置文件上传路径和日志路径

**4. 初始化数据库**
```bash
# 创建数据库
mysql -u root -p < storage/zone.sql
# 导入初始数据（可选）
mysql -u root -p zone_db < storage/initData.sql
```

**5. 安装开发工具（可选）**
```bash
# 安装热重载工具
go install github.com/air-verse/air@latest
# 安装API文档生成工具
go install github.com/swaggo/swag/cmd/swag@latest
```

##### 2.4 运行项目

**开发环境（推荐）**
```bash
# 使用Air热重载
air
```

**生产环境**
```bash
# 直接运行
go run main.go

# 或编译后运行
go build -o zone-server main.go
./zone-server
```

##### 2.5 访问服务
- 应用服务：http://localhost:9600
- API文档：http://localhost:9600/api/v1/swagger/index.html
- 健康检查：http://localhost:9600/api/v1/common/signIn
#### 3. API接口说明

##### 3.1 主要接口模块

**用户模块 (`/api/v1/base/users`)**
- `POST /login` - 用户登录
- `POST /` - 用户注册  
- `GET /info` - 获取用户信息
- `PATCH /:id` - 更新用户信息
- `DELETE /:id` - 删除用户
- `POST /password` - 修改密码

**动态模块 (`/api/v1/mobile/moments`)**
- `GET /` - 获取动态列表
- `POST /` - 发布动态
- `GET /UpdateMoment` - 更新动态

**聊天模块 (`/api/v1/mobile/chat`)**
- `GET /` - WebSocket聊天连接
- `GET /friends` - 获取好友列表
- `POST /friends` - 添加好友
- `DELETE /friends/:friendId` - 删除好友
- `POST /logs` - 获取聊天记录
- `GET /groups` - 获取群组列表
- `POST /groups` - 创建群组

**文件模块 (`/api/v1/base`)**
- `POST /upload` - 文件上传

**第三方接口 (`/api/v1/third`)**
- `GET /gushici` - 古诗词接口
- `POST /chatGPT` - ChatGPT对话

##### 3.2 认证说明
- 大部分接口需要JWT认证
- 请求头添加：`Authorization: Bearer <token>`
- 登录后获取token，有效期可配置

#### 4. 部署说明

##### 4.1 生产环境部署

**1. 编译项目**
```bash
# Linux/macOS
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o zone-server main.go

# Windows
go build -o zone-server.exe main.go
```

**2. 配置文件**
- 修改 `config/env.prod.ini` 生产环境配置
- 确保数据库、Redis连接信息正确
- 设置正确的文件路径和域名

**3. 系统服务（Linux）**
```bash
# 创建服务文件
sudo vim /etc/systemd/system/zone-server.service

# 服务文件内容
[Unit]
Description=Zone Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/server/zone
ExecStart=/home/server/zone/zone-server
Restart=always

[Install]
WantedBy=multi-user.target

# 启动服务
sudo systemctl enable zone-server
sudo systemctl start zone-server
```

##### 4.2 Docker部署（推荐）
```dockerfile
# Dockerfile示例
FROM golang:1.23.3-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 go build -o zone-server main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/
COPY --from=builder /app/zone-server .
COPY --from=builder /app/config ./config
EXPOSE 9600
CMD ["./zone-server"]
```

```bash
# 构建和运行
docker build -t zone-server .
docker run -d -p 9600:9600 --name zone-server zone-server
```

#### 5. 注意事项

##### 5.1 Air热重载问题
Air存在缓存问题，虽然在cmd里边结束Air，但刷新浏览器程序依然在运行，这时就需要手工结束进程然后重启。

**Windows解决方案：**
```bash
# 查找进程PID（9600为端口号）
netstat -ano | findstr 9600
# 杀死进程（14172为查到的PID）
taskkill /pid 14172 /f
```

**Linux/macOS解决方案：**
```bash
# 查找并杀死进程
lsof -ti:9600 | xargs kill -9
```

##### 5.2 配置文件路径
请根据实际环境修改 `config/setting.go` 中的配置文件路径：
- Windows：`D:/study/config/env.ini`
- Linux：`/home/server/config/env.ini`
- 开发环境：`config/env.ini`

##### 5.3 文件权限
确保以下目录有写权限：
- 日志目录：`log_file_path`
- 上传目录：`public_path`
- 配置目录：`config/`

#### 6. 在线演示

- **API文档**：[https://jiang-xia.top/x-zone/api/v1/swagger/index.html](https://jiang-xia.top/x-zone/api/v1/swagger/index.html)
- **项目主页**：[https://jiang-xia.top/zone/#/](https://jiang-xia.top/zone/#/)

#### 7. 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个Pull Request

#### 8. 许可证

本项目采用 MIT 许可证。详情请查看 [LICENSE](./LICENSE) 文件。

#### 9. 联系方式

**开发者：jiang-xia**
- 邮箱：963798512@qq.com
- 博客：[https://jiang-xia.top](https://jiang-xia.top)
- Gitee：[https://gitee.com/jiang-xia](https://gitee.com/jiang-xia)

---

如果这个项目对您有帮助，请给个 ⭐️ Star 支持一下！
