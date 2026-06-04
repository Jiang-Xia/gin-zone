# Gin Zone Client（uni-app CLI 脚手架）

由原 **HBuilderX 工程 `client/`** 迁移而来，采用 **uni-app CLI + Vite** 标准目录：业务源码集中在 **`src/`**，根目录仅保留构建与依赖配置。

## 目录对照

| 旧 HBuilderX 根目录 | 当前 CLI 脚手架 |
|----------------------|-----------------|
| `main.js`、`App.vue`、`pages.json` | `src/main.js`、`src/App.vue`、`src/pages.json` |
| `pages/`、`packageA/`、`packageB/` | `src/pages/`、`src/packageA/`、`src/packageB/` |
| `common/`、`components/`、`stores/` | `src/common/`、`src/components/`、`src/stores/` |
| `vite.config.js`、`package.json` | 项目根目录（与 `index.html` 同级） |

路径别名 **`@/`** 指向 **`src/`**（与原先 `@/stores/user.js` 等写法一致）。

## 快速开始

```bash
cd client
npm install
npm run dev              # H5，默认 http://localhost:9100
npm run dev:mp-weixin    # 微信小程序（watch 开发模式）
npm run build:h5
npm run build:mp-weixin  # 微信小程序生产包
```

依赖安装若遇 peer 冲突，项目已配置根目录 `.npmrc`（`legacy-peer-deps=true`）。

## 微信小程序开发（实时更新）

`npm run dev:mp-weixin` 会启动 **watch 开发编译**（`uni -p mp-weixin`），监听 `src/` 下源码变更并持续输出到：

```text
client/dist/dev/mp-weixin
```

### 推荐双开流程

1. **终端**（保持运行，不要关）  
   ```bash
   npm run dev:mp-weixin
   ```
2. **微信开发者工具**  
   - **导入目录**：`client/dist/dev/mp-weixin`（不是 `src`）  
   - 设置中开启 **「修改文件时自动编译」**  
   - 保存 `.vue` / `.js` / 样式后，等终端编译完成，模拟器一般会 **自动刷新**

`src/project.private.config.json` 中已配置 `"compileHotReLoad": true`，对应开发者工具侧 **热重载**，样式与模板改动通常更快生效。

### 与 H5 热更新的区别

| 能力 | H5 (`npm run dev`) | 微信小程序 (`npm run dev:mp-weixin`) |
|------|-------------------|----------------------------------------|
| 机制 | Vite HMR | CLI 重编 + 开发者工具刷新 |
| 改页面/样式/普通 JS | 即时 | 可实时，需等一次编译 |
| 改 `pages.json`、新增页面 | 一般自动 | 多数情况可；偶需 **重启** dev |
| 改 `manifest.json`、分包结构 | — | 建议重启 dev 并 **重新编译** |
| 页面状态 | 常可保留 | 大改动可能 **整页刷新**、状态丢失 |

小程序端 **没有** 浏览器那种模块级 HMR，属于平台限制，不是脚手架配置问题。

### 保存后没反应时

1. 确认终端里 `dev:mp-weixin` 仍在跑且无编译报错  
2. 确认开发者工具打开的是 **`dist/dev/mp-weixin`**  
3. 开发者工具：**编译** → **重新编译**，或 **清缓存并重新编译**  
4. 仍无效：停掉 `dev:mp-weixin` 后重新执行，必要时删除 `dist/dev/mp-weixin` 再 dev

## 多环境 H5（SIT / UAT / PROD）

`package.json` → `uni-app.scripts` 已保留原 `client` 配置，可在 HBuilderX 自定义运行方案或 CLI 环境变量中使用 `MY_ENV`（`sit` / `uat` / `prod`）。

## 接口与代理

- 环境地址：`src/common/request/config.js`
- 开发代理：根目录 `vite.config.js`（`/dev-api`、`/prod-api`、`/dev-ws`、`/prod-ws`）

## 文档

- [登录与即时通讯链路](./src/docs/登录与即时通讯链路.md)
