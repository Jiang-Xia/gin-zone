
<div align="center">
	<!-- <img style="width: 80px;height: 80px" src=""/> -->
	<h1>Zone Admin</h1>
	<p>基于 React18 + TypeScript + Ant Design 的社交动态管理后台系统</p>
</div>

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.4.2-blue)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.4.0-blue)

## 📋 项目简介

Zone Admin 是一个现代化的社交动态管理后台系统，专门用于管理用户发布的社交动态内容。系统采用最新的前端技术栈构建，提供完整的动态内容管理、用户认证、数据展示等功能。

## 🚀 技术栈

### 核心技术
- **React 18.2.0** - 现代化的前端框架，支持并发特性
- **TypeScript 4.4.2** - 类型安全的JavaScript超集
- **Ant Design 5.4.0** - 企业级UI设计语言和React组件库
- **Ant Design Pro Components 2.4.4** - 高级表格和表单组件

### 状态管理
- **Redux Toolkit 1.9.3** - 现代化的Redux状态管理
- **React Redux 8.0.5** - React的Redux绑定
- **Redux Persist 6.0.0** - Redux状态持久化

### 路由与网络
- **React Router DOM 6** - 声明式路由管理
- **Axios 1.3.5** - HTTP客户端库

### 工程化工具
- **Create React App 5.0.1** - 零配置React应用脚手架
- **Craco 7.1.0** - Create React App配置覆盖工具
- **ESLint + Prettier** - 代码质量和格式化工具
- **Day.js 1.11.7** - 轻量级日期处理库

## ✨ 核心功能

### 🔐 用户认证系统
- 账号密码登录
- 手机号验证码登录
- 自动登录功能
- JWT Token认证
- 路由权限控制

### 📱 动态内容管理
- **动态列表管理**：支持分页、搜索、排序的动态内容展示
- **图片预览**：多图片上传预览，支持图片组浏览
- **用户信息**：展示发布者头像、昵称等信息
- **数据统计**：点赞数、浏览数等互动数据展示
- **位置信息**：动态发布地理位置显示
- **时间管理**：创建时间、更新时间的精确显示

### 🎨 界面特性
- **响应式设计**：适配各种屏幕尺寸
- **主题定制**：支持主题色彩配置
- **现代化UI**：基于Ant Design 5.0设计系统
- **表格组件**：高级ProTable组件，支持搜索、排序、筛选
- **图片组件**：支持图片预览、缩放等功能

### 🛠️ 工程特性
- **TypeScript**：完整的类型定义，提高代码质量
- **模块化路由**：自动化路由导入和管理
- **懒加载**：页面组件按需加载，优化性能
- **代码分割**：基于路由的代码分割
- **别名配置**：@符号路径别名，简化导入

## 📁 项目结构

```
src/
├── api/                    # API接口管理
│   ├── modules/           # 接口模块
│   │   ├── moment.ts     # 动态相关接口
│   │   └── user.ts       # 用户相关接口
│   └── index.ts          # API统一导出
├── components/            # 公共组件
│   └── Loading/          # 加载组件
├── config/               # 配置文件
├── layouts/              # 布局组件
├── pages/                # 页面组件
│   ├── login/           # 登录页面
│   ├── moment/          # 动态管理页面
│   │   ├── list.tsx    # 动态列表
│   │   └── detail.tsx  # 动态详情
│   └── Welcome.tsx      # 欢迎页面
├── redux/               # 状态管理
├── routers/             # 路由配置
│   └── modules/        # 路由模块
├── typings/             # 类型定义
└── utils/               # 工具函数
```

## 🎯 功能模块详解

### 动态管理模块
- **列表展示**：以表格形式展示所有动态内容
- **多图展示**：支持多张图片的预览和浏览
- **用户信息**：显示发布者头像和昵称
- **互动数据**：展示点赞数、浏览数等
- **搜索筛选**：支持按更新时间等条件筛选
- **分页加载**：高效的分页数据加载

### 用户认证模块
- **多种登录方式**：支持用户名密码和手机验证码登录
- **表单验证**：完整的前端表单验证
- **自动登录**：Remember Me功能
- **路由守卫**：基于Token的路由权限控制

## 推荐开发环境
- [VSCode](https://code.visualstudio.com/) + [ESLint](http://eslint.org/) + [Prettier](https://prettier.io/)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)

## 在线预览

<!-- - [Zone Admin Demo](https://admin.jiang-xia.top/) -->

## 代码仓库

- [Gitee](https://gitee.com/jiang-xia/gin-zone/admin)
- [GitHub](https://github.com/jiang-xia/gin-zone/admin)

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 启动开发服务器

```bash
# 启动开发服务器 (默认端口: 3001)
npm run start

# 或使用 yarn
yarn start
```

### 构建生产版本

```bash
# 构建项目
npm run build

# 或使用 yarn
yarn build
```

### 代码检查和格式化

```bash
# ESLint 代码检查
npm run lint

# 运行测试
npm run test
```

## 📝 开源协议

本项目基于 [MIT](./LICENSE) 协议开源

## 👥 开源作者

**jiang-xia**

---

如果这个项目对你有帮助，欢迎 ⭐ Star 支持一下！
