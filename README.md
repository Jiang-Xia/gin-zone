<div align="center">
	<h1>🚀 Gin Zone</h1>
	<p>一个现代化的全栈开发练手项目</p>
	<p>Go + React + UniApp 技术栈的完整实现</p>
</div>

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Go](https://img.shields.io/badge/Go-1.23.3-blue.svg)](https://golang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![UniApp](https://img.shields.io/badge/UniApp-latest-green.svg)](https://uniapp.dcloud.net.cn/)
[![Gin](https://img.shields.io/badge/Gin-1.10.0-blue.svg)](https://gin-gonic.com/)

## 📖 项目介绍

Gin Zone 是一个基于现代化技术栈的全栈开发练手项目，采用前后端分离架构，旨在为开发者提供一个完整的学习和实践平台。项目涵盖了社交动态、实时聊天、博客系统、后台管理等多个核心功能模块。

### 🎯 项目特色
- **🏗️ 现代化架构**：采用前后端分离，微服务化设计思想
- **📱 一码多端**：基于 UniApp 实现 H5、小程序、APP 多端发布
- **⚡ 高性能后端**：Go + Gin 提供高并发、低延迟的 API 服务
- **🎨 现代化前端**：React + TypeScript + Ant Design 构建管理后台
- **💬 实时通信**：WebSocket 实现的实时聊天功能
- **🔐 完善权限**：JWT 认证 + 路由守卫的安全体系
- **📊 数据可视化**：图表展示和数据分析功能
- **🚀 工程化**：Husky + Commitlint 规范化开发流程

## 🛠️ 技术栈

### 后端服务 (Server)
| 技术 | 版本 | 说明 |
|------|------|------|
| Go | 1.23.3 | 开发语言 |
| Gin | 1.10.0 | Web框架 |
| GORM | 1.25.12 | ORM框架 |
| MySQL | 8.0+ | 关系型数据库 |
| Redis | latest | 缓存数据库 |
| JWT | 4.5.1 | 身份认证 |
| WebSocket | latest | 实时通信 |
| Swagger | 1.16.4 | API文档 |
| Logrus | 1.9.3 | 日志记录 |

### 前端管理后台 (Admin)
| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.2.0 | 前端框架 |
| TypeScript | 4.4.2 | 类型系统 |
| Ant Design | 5.4.0 | UI组件库 |
| Redux Toolkit | 1.9.3 | 状态管理 |
| React Router | 6.x | 路由管理 |
| Axios | 1.3.5 | HTTP客户端 |
| Craco | 7.1.0 | 构建工具 |

### 跨端客户端 (Client)
| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.x | 前端框架 |
| UniApp | latest | 跨端框架 |
| Vite | latest | 构建工具 |
| uni-ui | latest | UI组件库 |
| dayjs | 1.11.13 | 日期处理 |
| marked | 4.2.12 | Markdown解析 |
| prismjs | 1.29.0 | 代码高亮 |

## ✨ 核心功能

### 🔐 用户系统
- 用户注册/登录、微信授权登录
- JWT令牌认证、密码加密
- 用户信息管理、头像上传
- 权限控制和路由守卫

### 📝 动态模块
- 发布动态、图片/视频上传
- 点赞浏览统计、动态列表展示
- 地理位置标记、时间管理
- 富文本编辑、Markdown支持

### 💬 聊天系统
- WebSocket实时通信
- 私聊/群聊功能
- 好友管理、聊天记录
- AI聊天集成、表情支持

### 📱 博客系统
- 文章发布和管理
- Markdown编辑器
- 代码高亮显示
- 文章分类和标签

### 📊 数据展示
- 图表可视化
- 数据统计分析
- 支付转账演示
- 扫码功能

### 🔧 管理后台
- 动态内容管理
- 用户信息管理
- 数据统计报表
- 系统配置管理

## 📁 项目结构

```
gin-zone/
├── server/                 # 后端服务 (Go + Gin)
│   ├── app/               # 应用核心代码
│   │   ├── controller/    # 控制器层
│   │   ├── service/       # 业务逻辑层
│   │   ├── model/         # 数据模型
│   │   ├── cron/          # 定时任务
│   │   └── database/      # 数据库配置
│   ├── config/            # 配置文件
│   ├── middleware/        # 中间件
│   ├── router/            # 路由配置
│   ├── pkg/               # 工具包
│   ├── docs/              # API文档
│   ├── storage/           # 数据库脚本
│   └── main.go            # 程序入口
├── admin/                 # 管理后台 (React + TypeScript)
│   ├── src/
│   │   ├── api/           # API接口
│   │   ├── pages/         # 页面组件
│   │   ├── components/    # 公共组件
│   │   ├── redux/         # 状态管理
│   │   ├── routers/       # 路由配置
│   │   └── utils/         # 工具函数
│   └── package.json
├── client/                # 跨端客户端 (UniApp + Vue3)
│   ├── pages/             # 页面路由
│   ├── components/        # 自定义组件
│   ├── uni_modules/       # UI组件库
│   ├── stores/            # 状态管理
│   ├── common/            # 公共资源
│   ├── static/            # 静态资源
│   └── package.json
├── scripts/               # 自动化脚本
│   ├── install.sh         # 依赖安装
│   └── run.sh             # 启动脚本
└── package.json           # 根目录配置
```

## 🚀 快速开始

### 环境要求
- **Go** 1.23.3+
- **Node.js** 16.0.0+
- **MySQL** 8.0+
- **Redis** latest
- **Git** latest

### 一键安装
```bash
# 克隆项目
git clone https://github.com/Jiang-Xia/gin-zone.git
cd gin-zone

# 安装所有依赖
npm run i:all
# 或者使用脚本
bash ./scripts/install.sh
```

### 数据库配置
1. 创建MySQL数据库
```sql
CREATE DATABASE zone_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 导入数据库结构
```bash
mysql -u root -p zone_db < server/storage/zone.sql
```

3. 导入初始数据（可选）
```bash
mysql -u root -p zone_db < server/storage/initData.sql
```

4. 配置环境变量
```bash
# 复制并修改配置文件
cp server/config/env.ini server/config/env.local.ini
# 根据实际情况修改数据库连接信息
```

### 启动服务

#### 一键启动所有服务
```bash
npm run r:all
# 或者使用脚本
bash ./scripts/run.sh
```

#### 分别启动服务

**后端服务**
```bash
cd server
# 开发环境（推荐使用Air热重载）
air
# 或直接运行
go run main.go
```

**管理后台**
```bash
cd admin
npm start
# 默认端口: 3001
```

**客户端**
```bash
cd client
# H5开发
npm run dev:h5
# 微信小程序
npm run dev:mp-weixin
# 使用HBuilderX（推荐）
# 用HBuilderX打开client文件夹，点击运行
```

### 访问地址
- **后端API**: http://localhost:9600
- **API文档**: http://localhost:9600/api/v1/swagger/index.html
- **管理后台**: http://localhost:3001
- **客户端H5**: http://localhost:3000

## 📱 在线预览

### 🌐 在线体验
- **H5版本**: [Gin Zone](https://jiang-xia.top/zone/#/pages/blog/index)
- **管理后台**: [Zone Admin](https://admin.jiang-xia.top)
- **API文档**: [Swagger文档](https://jiang-xia.top/x-zone/api/v1/swagger/index.html)

### 📱 移动端体验
| APP下载 | H5页面 | 微信小程序 | 支付宝小程序 |
|-----------|--------|-----------|--------|
| <img src="https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-11/2e5d10df027b4cf28545b44901f7e8a4-app-code.png" width="120"> | <img src="https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-11/ea68358e78fd433fb5d2123e2cc0763b-h5.png" width="120"> | <img src="https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-11/1d6c3ffe42c3498a820965d9a46e0e2b-mini-program-code.jpg" width="120"> | <img src="https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-11/68a238667168490ea59c417e7f438b4b-circle_blue_slogan_50cm.png" width="120"> |
| 扫码下载APP | 扫码体验H5页面| 扫码体验小程序 | 扫码体验小程序 |

## 📚 详细文档

### Server端 (详细文档请查看 [server/README.md](./server/README.md))
- **架构设计**: MVC分层架构，中间件模式
- **API接口**: RESTful API设计，Swagger文档
- **数据库**: GORM + MySQL + Redis
- **认证授权**: JWT + 微信登录
- **实时通信**: WebSocket聊天系统
- **定时任务**: Cron定时任务调度
- **日志系统**: 结构化日志记录
- **文件上传**: 多媒体文件处理

### Client端 (详细文档请查看 [client/README.md](./client/README.md))
- **跨端开发**: 一套代码多端发布
- **UI组件**: 丰富的uni-ui组件库
- **状态管理**: Vuex状态管理
- **网络请求**: 统一的API请求封装
- **富文本**: Markdown解析和代码高亮
- **实时聊天**: WebSocket客户端实现
- **国密加密**: 安全通信支持
- **多环境**: SIT/UAT/PROD环境配置

### Admin端 (详细文档请查看 [admin/README.md](./admin/README.md))
- **现代化UI**: React 18 + Ant Design 5
- **类型安全**: TypeScript完整类型定义
- **状态管理**: Redux Toolkit
- **路由管理**: React Router 6
- **动态管理**: 社交动态内容管理
- **用户认证**: 多种登录方式
- **数据展示**: 高级表格和图表组件

## 🚀 部署指南

### Docker部署（推荐）
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 传统部署
```bash
# 后端编译 部署linux系统
set CGO_ENABLED=0
# 坑点：这是window cmd中的语法
set GOOS=linux
# powershell 需要使用以下命令设置
$env:GOOS="linux"
set GOARCH=amd64
cd server
go build -o zone-server main.go

# 前端构建
cd admin
npm run build

cd client
npm run build
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 提交规范
本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：
```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

## 🔗 相关链接

### 代码仓库
- **Gitee**: [gin-zone](https://gitee.com/jiang-xia/gin-zone)
- **GitHub**: [gin-zone](https://github.com/Jiang-Xia/gin-zone)

### 技术文档
- [Go官方文档](https://golang.org/doc/)
- [Gin框架文档](https://gin-gonic.com/zh-cn/docs/)
- [React官方文档](https://reactjs.org/docs/)
- [UniApp官方文档](https://uniapp.dcloud.net.cn/)
- [Ant Design组件库](https://ant.design/components/overview-cn/)

## 📄 开源协议

本项目基于 [MIT](./LICENSE) 协议开源。

## 👨‍💻 开源作者

**jiang-xia**
- 邮箱：963798512@qq.com
- 博客：[https://jiang-xia.top](https://jiang-xia.top)
- Gitee：[https://gitee.com/jiang-xia](https://gitee.com/jiang-xia)

---

⭐ 如果这个项目对你有帮助，请给一个 Star 支持一下！
