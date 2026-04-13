
<div align="center">
	<!-- <img style="width: 80px;height: 80px" src=""/> -->
	<h1>Gin Zone Client</h1>
	<p>基于 Vue3 + UniApp + Vite 的跨端客户端</p>
</div>

[![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D.svg)](https://vuejs.org/)
[![UniApp](https://img.shields.io/badge/UniApp-Vite-2B9939.svg)](https://uniapp.dcloud.net.cn/)
[![Vite](https://img.shields.io/badge/Vite-latest-646CFF.svg)](https://vitejs.dev/)

## 项目简介

Gin Zone Client 是 Gin Zone 的 **uni-app（Vue 3，`createSSRApp`）** 客户端：一套工程覆盖 **H5、App、微信小程序、支付宝小程序** 等端（业务上可按 `pages.json` 与条件编译实际裁剪）。项目侧重 **博客、动态、即时聊天、个人中心**，并带有图表演示、支付/WebView 等业务向示例页。

## 核心功能

### 主包与 Tab

- **博客**：首页流、下拉刷新；分包内 **文章列表**、**文章详情**（富文本 / Markdown 等能力依赖页面实现）。
- **动态**：动态流、**发动态**；**微信小程序原生 TabBar 不包含「动态」页**（见 `pages.json` 中 `#ifndef MP-WEIXIN`），其余端保留该 Tab。
- **聊天**：会话列表、**聊天详情**（含 WebSocket 会话逻辑，见 `stores/chat.js` 与启动时 `initChat`）、**AI 聊天**、**添加好友**、**创建群聊**。
- **我的**：自定义导航的个人中心；分包内 **登录**、**资料编辑**、**设置**、**其他功能**、**关于** 等。
- **TabBar 中间按钮**：在 **H5 / App** 下点击触发 **扫码**（`App.vue` 中 `uni.onTabBarMidButtonTap` + `uni.scanCode`）；小程序端行为以各端运行时为准。

### 分包与其它页面

- **packageA**：启动相关（如自动登录页）、博客详情/列表、动态发布、聊天与「我的」系列子页。
- **packageB**：
  - **图表**：基于 `qiun-data-charts` 的示例页。
  - **Demo**：组件/能力演示（如表情等）。
  - **业务 WebView**：外链容器页（标题配置为「手机号登录」等，以实际业务为准）。
  - **支付收银台流程**：多步模拟/对接页（中转、支付方式、本行卡、收银台、结果等）；**整段路由在 `pages.json` 中用 `#ifndef MP-WEIXIN` 包裹，微信小程序不包含这些页面**。

### 工程与体验特性

- **状态管理**：**Pinia**，并接入 **pinia-plugin-persistedstate** 做持久化。
- **UI**：**[TDesign UniApp](https://tdesign.tencent.com/miniprogram/overview)**（`pages.json` 的 `easycom` 将 `t-*` 映射到 `@tdesign/uniapp`）；同时大量使用 **uni_modules** 官方与社区组件（如列表、分页 `z-paging` 等）。
- **请求层**：`this.$api` 为底层封装；**`this.$apis`** 为语义化接口（集中在 `common/request/apis/index.js`，涵盖鉴权、博客、聊天、动态、支付、第三方 AI、WebView 相关等）。
- **安全**：集成 **sm-crypto（国密）**；请求加解密 **默认开启**，本地存储 **`zoneOpenCrypto='0'`** 可关闭（详见 `common/request/config.js`）。
- **富文本与 Markdown**：**marked**、**marked-highlight**、**highlight.js**；**mp-html** 等用于小程序富文本场景；依赖中仍包含 **prismjs**（与历史/部分高亮场景兼容，以实际引用为准）。
- **H5 开发调试**：开发模式下可启用 **vconsole**（见 `main.js`）。
- **开发代理**：`vite.config.js` 中配置了 **`/dev-api`、`/prod-api`** 等代理，便于本地对接后端。

## 技术栈

| 类别 | 说明 |
|------|------|
| 框架 | Vue 3、uni-app、Vite |
| 状态 | Pinia + pinia-plugin-persistedstate |
| UI | @tdesign/uniapp；uni_modules（含 uni-ui 系列、z-paging、qiun-data-charts 等） |
| 工具 | dayjs、china-area-data、image-tools、emojilib 等 |

## 主要依赖（节选）

版本以 `package.json` 为准，常见有：

- `@tdesign/uniapp` — TDesign 小程序/uni 组件
- `pinia-plugin-persistedstate` — Pinia 持久化
- `dayjs` — 日期时间
- `marked`、`marked-highlight`、`highlight.js` — Markdown 与代码高亮
- `mp-html` — 富文本
- `sm-crypto` — 国密算法
- `emojilib` — Emoji 数据
- 开发依赖：`vconsole`；`vite-plugin-pwa`（仓库内默认未在 `vite.config.js` 中启用，可按需打开注释）

## 快速开始

### 环境要求

- **Node.js**：建议 **18+**（与当前 Vite/uni 工具链更匹配）。
- 运行到 **微信 / App** 等仍推荐使用 **HBuilderX** 或官方 CLI 对应平台命令。

### 安装与脚本

当前 `package.json` 中已声明的 npm 脚本以 **H5** 为主：

```bash
npm install

# H5 开发（默认端口见 vite.config.js，当前为 5173）
npm run dev:h5
# 或
npm run dev

# H5 构建
npm run build:h5
```

其它端（如微信小程序、App）请使用 **HBuilderX「运行」菜单** 或 uni-app 文档中的 **`uni -p mp-weixin`** 等平台命令自行扩展脚本。

### 多环境构建（H5）

通过 `package.json` → `uni-app.scripts` 配置 **SIT / UAT / PROD**，在 HBuilderX 自定义运行/发行方案中选择对应环境；输出目录示例：

- SIT → `dist/sit`
- UAT → `dist/uat`
- PROD → `dist/prod`

环境变量示例：`MY_ENV` 为 `sit` / `uat` / `prod`（与脚本配置一致）。

### 接口地址

开发与生产的 **`baseUrl` / `fileUrl` / `wsUrl`** 在 `common/request/config.js` 中维护；本地联调可改为 `127.0.0.1` 等（以你当前文件为准）。

## 项目结构（摘要）

```
client/
├── common/
│   ├── css/                 # 全局样式
│   ├── request/             # 请求封装、config、loading、session
│   │   ├── api.commercial.js
│   │   └── apis/index.js    # $apis 语义层
│   └── utils/               # 通用方法、mixins、UI 封装等
├── components/              # 全局业务组件（含 pageConfig、tabbar、ca* 等）
├── pages/                   # 主包：启动、博客、动态、聊天、我的
├── packageA/                # 分包：博客详情/列表、聊天子页、我的子页等
├── packageB/                # 分包：图表、demo、webview、支付相关页
├── static/
├── stores/                  # Pinia：user.js、chat.js 等
├── uni_modules/             # uni 插件市场组件
├── App.vue
├── main.js                  # createSSRApp、Pinia、全局属性注入
├── pages.json               # 路由、TabBar、easycom、条件编译
├── manifest.json
├── vite.config.js           # 构建与 dev server 代理
└── package.json
```

## 全局属性（`main.js`）

在选项式 API 中可通过 `this` 使用（与 mixin 配合）：

- `$api` — 底层请求实例  
- `$apis` — 业务接口语义层  
- `$tool`、`$common` — 工具与通用逻辑  
- `$toast`、`$showModal` — 统一交互  
- `$dayjs`、`$baseUrl`、`$fileUrl`、`$getImg`、`$pages` 等  

具体以 `main.js` 中 `app.config.globalProperties` 注册为准。

## 多端差异（摘要）

以下以 `pages.json`、`App.vue`、`manifest.json` 中的条件编译为准；未列出的端以实际打包配置为准。

| 项目 | 微信小程序 | 其它常见端（H5 / App 等） |
|------|------------|---------------------------|
| TabBar「动态」入口 | 不包含 | 包含 |
| packageB 支付收银台相关页面 | 子包中不注册 | 注册 |
| TabBar 中间钮「扫码」 | 未在 `App.vue` 中绑定 `onTabBarMidButtonTap` | H5 / App 绑定扫码 |
| 小程序能力 | 例：`showShareMenu`、启动时 `authorize` 定位等 | 按端分支处理 |

`manifest.json` 中已配置 **微信小程序（`mp-weixin`）**、**支付宝小程序（`mp-alipay`）**、**H5（hash 路由、`base` 为 `./`）**、**App（`app-plus`）** 等，发版前请自行核对各端 **appid、域名白名单、隐私与权限文案**。

## 网络请求与联调

### 请求封装

- **`common/request/api.commercial.js`**：业务用 `CommercialApi`（`this.$api`）。支持路径模板中的 **`{id}`** 占位替换、从 Pinia 读取 **`Authorization`**、以及可选的 **国密加解密** 与调试日志。
- **`common/request/session.js`**：加解密链路下的 **`zoneSessionId`**、**`zoneWorkKey`** 读写（`uni.setStorageSync`）。
- **`common/request/loading.js`**：全局 **Loading**（并发计数 + 防抖），减少连续请求导致的遮罩闪烁。
- **`common/request/mockPay.js`**：支付演示用的 **Mock POST**：在 **微信小程序 / 支付宝小程序 / App** 下直接引用 `static/data/json/pay` 下 JSON；在 **H5** 下通过 `uni.request` 拉取 `./static/data/json/pay/{接口名}.json`。

### 加解密与调试开关（`config.js`）

| 存储键 | 作用 |
|--------|------|
| `zoneOpenCrypto === '0'` | 关闭请求加解密（默认开启加密） |
| `zoneCryptoDebugLog === '1'` | 强制打印加解密相关调试日志；未设置时 **非 production** 下默认更易打出调试信息 |

生产环境 **不要在仓库中长期保留明文敏感密钥**；当前 `publicKey` / `privateKey` / `sm4Key` 等建议逐步改为构建注入或受控下发。

### H5 与 Vite 代理

`vite.config.js` 中已配置 **`/dev-api`、`/prod-api`** 以及 **`/dev-ws`、`/prod-ws`** 的转发规则。默认 **`config.js` 使用带主机名的 `baseUrl`** 时，浏览器请求**不会**自动走上述同源代理。若希望开发期全部走 Vite 代理，需要把 **`baseUrl` / `wsUrl`** 改成以这些前缀开头的地址，并与 `rewrite` 规则、后端路径保持一致。

### 新增接口约定

新业务接口请优先在 **`common/request/apis/index.js`** 中增加 **`$apis` 分组与方法**，页面侧只调用语义化方法，避免散落硬编码 URL（与仓库内 `.cursor/rules` 约定一致）。

## 开发与调试

- **H5**：Chrome DevTools；开发模式下可自动挂载 **vConsole**（见 `main.js`）。
- **微信小程序**：微信开发者工具；注意合法域名、TLS、分包体积等约束。
- **App**：HBuilderX 内置运行/真机调试，或按 DCloud 文档使用自定义基座。

编辑器可选 **HBuilderX**（运行/发行一体化）或 **VS Code** 并安装 uni-app / Vue 相关插件。

## 在线预览

- **H5**：[Gin Zone](https://jiang-xia.top/zone/#/pages/blog/index)
- **微信小程序**：扫描小程序码体验  
  <img src="https://jiang-xia.top/_nuxt/mini-program-code.7wTjEkFg.jpg" width="200" height="200">
- **APP**：扫描下载体验  
  <img src="https://jiang-xia.top/_nuxt/app-code.Bsz8QBxF.png" width="200" height="200">

## 相关文档

- **本项目**：[登录与即时通讯链路](./docs/登录与即时通讯链路.md)（鉴权、`signIn` 加密会话、WebSocket 与时序说明）
- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [TDesign 小程序 / UniApp](https://tdesign.tencent.com/miniprogram/overview)

## 代码仓库

- **Gitee**：[gin-zone/client](https://gitee.com/jiang-xia/gin-zone/client)
- **GitHub**：[gin-zone/client](https://github.com/jiang-xia/gin-zone/client)

## 贡献指南

欢迎通过 Issue / Pull Request 反馈问题或提交改进。

1. Fork 本仓库  
2. 创建特性分支（`git checkout -b feature/your-feature`）  
3. 提交改动（`git commit -m 'Describe your change'`）  
4. 推送到远程并发起 Pull Request  

## 开源协议

本包在 `package.json` 中声明为 **ISC**；若仓库根目录另有统一协议文件，以仓库约定为准。

## 作者

**jiang-xia**

---

若本项目对你有帮助，欢迎点个 Star。
