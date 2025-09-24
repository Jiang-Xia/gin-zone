
<div align="center">
	<!-- <img style="width: 80px;height: 80px" src=""/> -->
	<h1>Gin Zone Client</h1>
	<p>基于 Vue3 + Uniapp 的现代化跨端应用</p>
</div>

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D.svg)](https://vuejs.org/)
[![Uniapp](https://img.shields.io/badge/Uniapp-latest-2B9939.svg)](https://uniapp.dcloud.net.cn/)
[![Vite](https://img.shields.io/badge/Vite-latest-646CFF.svg)](https://vitejs.dev/)

## 📖 项目简介

Gin Zone Client 是一个基于 Vue3、Vite、Uniapp 构建的现代化跨端前端项目，作为 "Gin Zone" 开源项目的客户端部分。项目采用一套代码多端发布的理念，支持 H5、App、微信小程序等多个平台，旨在提供高效的开发体验和统一的用户界面。

## ✨ 核心功能

### 📱 主要模块
- **📝 博客模块** - 文章浏览、详情查看、文章列表
- **💬 聊天模块** - 实时聊天、AI聊天、好友管理、群聊创建
- **🌟 动态模块** - 动态发布、内容展示（小程序端不可用）
- **👤 个人中心** - 用户信息管理、个人资料设置、登录认证
- **📊 图表展示** - 数据可视化图表
- **💰 支付转账** - 支付功能演示
- **🌐 Webview** - 外部网页加载
- **📱 扫码功能** - 二维码扫描（中间按钮）

### 🎯 核心特性
- **🔧 一码多端** - 基于 Uniapp，一套代码发布到 H5、App、微信小程序
- **🎨 现代化UI** - 集成丰富的 uni-ui 组件库
- **⚡ 高性能** - Vue3 Composition API + Vite 构建
- **🔐 安全加密** - 集成国密算法支持
- **📱 实时通信** - WebSocket 实时聊天功能
- **🎭 富文本渲染** - 支持 Markdown 解析和代码高亮
- **🌍 多环境支持** - SIT、UAT、PROD 环境配置

## 🛠️ 技术栈

### 核心框架
- **[Vue 3](https://vuejs.org/)** - 渐进式 JavaScript 框架
- **[Uniapp](https://uniapp.dcloud.net.cn/)** - 跨端开发框架
- **[Vite](https://vitejs.dev/)** - 下一代前端构建工具

### 主要依赖
- **[dayjs](https://dayjs.gitee.io/zh-CN/)** `^1.11.13` - 轻量级日期处理库
- **[marked](https://marked.js.org/)** `^4.2.12` - Markdown 解析器
- **[prismjs](https://prismjs.com/)** `^1.29.0` - 代码语法高亮
- **[mp-html](https://jin-yufeng.gitee.io/mp-html/)** `^2.4.1` - 小程序富文本组件
- **[sm-crypto](https://github.com/JuneAndGreen/sm-crypto)** `^0.3.13` - 国密算法库
- **[emojilib](https://github.com/muan/emojilib)** `^4.0.2` - Emoji 表情库

### UI 组件库
- **uni-ui** - Uniapp 官方组件库（完整集成）
- **qiun-data-charts** - 图表组件
- **uv-ui** - 扩展 UI 组件

## 🚀 快速开始

### 环境要求
- **Node.js** >= 14.0.0
- **HBuilderX** 最新版本（推荐）

### 安装运行

#### 方法一：使用 HBuilderX（推荐）
1. 下载并安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 使用 HBuilderX 打开项目根目录
3. 点击工具栏「运行」→「运行到浏览器」→ 选择浏览器
4. 项目将自动编译并在浏览器中打开

#### 方法二：命令行运行
```bash
# 安装依赖
npm install

# 开发环境运行
npm run dev:h5

# 其他平台编译
npm run dev:mp-weixin  # 微信小程序
npm run dev:app        # App
```

### 环境配置

项目支持多环境配置，通过 `package.json` 中的 `uni-app.scripts` 配置：

```json
{
  "sit": "SIT测试环境",
  "uat": "UAT预发环境", 
  "prod": "生产环境"
}
```

构建输出目录：
- SIT → `dist/sit`
- UAT → `dist/uat`
- PROD → `dist/prod`

## 📁 项目结构

```
client/
├── common/                # 公共资源
│   ├── css/              # 全局样式
│   ├── request/          # API请求封装
│   └── utils/            # 工具函数
├── components/           # 公共组件
│   ├── pageConfig/       # 页面配置组件
│   └── tabbar/           # 底部导航组件
├── pages/                # 主包页面
│   ├── blog/            # 博客页面
│   ├── chat/            # 聊天页面
│   ├── moment/          # 动态页面
│   ├── my/              # 个人中心
│   └── start/           # 启动页面
├── packageA/             # 分包A
│   ├── components/       # 分包组件（mp-html等）
│   └── pages/           # 分包页面
├── packageB/             # 分包B
│   └── pages/           # 扩展功能页面
├── static/               # 静态资源
├── stores/               # 状态管理
├── uni_modules/          # uni-app插件市场组件
├── App.vue              # 应用入口
├── main.js              # 应用初始化
├── pages.json           # 页面路由配置
├── manifest.json        # 应用配置
└── package.json         # 项目配置
```

## 🔧 开发工具

### 推荐 IDE
- **[HBuilderX](https://www.dcloud.io/hbuilderx.html)** - 官方推荐，内置 Uniapp 开发环境
- **VS Code** - 需要安装 Uniapp 相关插件

### 调试工具
- **Chrome DevTools** - H5端调试
- **微信开发者工具** - 微信小程序调试
- **HBuilderX 内置调试器** - App端调试

## 🌐 在线预览

- **H5版本**: [Gin Zone](https://jiang-xia.top/zone/#/pages/blog/index)
- **微信小程序**: 扫描小程序码体验
<img src="https://jiang-xia.top/_nuxt/mini-program-code.7wTjEkFg.jpg" width="200" height="200">
- **APP**: 扫描下载APP体验
<img src="https://jiang-xia.top/_nuxt/app-code.Bsz8QBxF.png" width="200" height="200">

## 📚 相关文档

- [Uniapp 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [uni-ui 组件库](https://uniapp.dcloud.net.cn/component/uniui/uni-ui.html)

## 📦 代码仓库

- **Gitee**: [gin-zone/client](https://gitee.com/jiang-xia/gin-zone/client)
- **GitHub**: [gin-zone/client](https://github.com/jiang-xia/gin-zone/client)

<!-- ## 项目示例图 -->

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 开源协议

本项目基于 [MIT](./LICENSE) 协议开源。

## 👨‍💻 作者

**jiang-xia**

---

⭐ 如果这个项目对你有帮助，请给一个 Star！
