# gin-zone-server PM2 一键远程部署

对齐 `blog-server/deploy/pm2/` 的发布流程：**本地打包（含生产配置）→ SSH 上传 → releases/current 切流 → PM2 reload**。

## 一条命令

```powershell
# 在 server/ 目录
make deploy

# 或直接
powershell -ExecutionPolicy Bypass -File deploy/pm2/deploy.ps1
```

## 首次配置

### 1. SSH 凭据

```powershell
cp deploy/pm2/deploy.local.env.example deploy/pm2/deploy.local.env
# 填写 DEPLOY_HOST / DEPLOY_USER / DEPLOY_PASSWORD / DEPLOY_HOSTKEY
```

### 2. 生产配置（本地维护，不打进 git）

```powershell
cp deploy/pm2/env.production.example deploy/pm2/env.production
# 填写真实 DB/Redis/密钥（勿提交 git）
```

| 文件 | Git | 说明 |
|------|-----|------|
| `deploy/pm2/env.production.example` | ✅ | 模板 |
| `deploy/pm2/env.production` | ❌ | 真实生产 ini，部署时打进 `config/env.production` |

`env.production` 中推荐路径（随 PM2 cwd = `current`）：

- `public_path = public`（release 内软链 → 部署根共享 uploads）
- `log_file_path = ../logs`（release 外共享日志）

### 3. PM2（服务器一次）

```bash
source ~/.nvm/nvm.sh && nvm use default && npm install -g pm2
mkdir -p /opt/jxapp/server/zone-server/logs /opt/jxapp/server/zone-server/public/uploads
```

## 发布流程

1. 本地 `GOOS=linux GOARCH=amd64` 交叉编译 `zone-server`
2. 打 tar（二进制 + `ecosystem.config.js` + **`config/env.production`** + `public/data`）
3. 上传至 `/tmp/gin-zone-server.tar.gz`
4. 远程解压到 `releases/YYYYMMDD-HHMMSS/`
5. `current` 软链切换 + `pm2 reload gin-zone-server`

配置随 release 原子切换，无需在服务器单独维护配置文件。

## 回滚

```powershell
make rollback:list
make rollback
```

## 线上目录

```
/opt/jxapp/server/zone-server/
├── current -> releases/20250707-120000/
├── releases/
│   ├── backups/
│   └── 20250707-120000/
│       ├── zone-server
│       ├── ecosystem.config.js
│       ├── config/env.production
│       └── public -> ../../public
├── logs/
└── public/uploads/          # 共享，跨 release 保留（禁止被 prune 删除）
```

## Nginx

- 主站：`zone.jiang-xia.top/api/v1/` → `localhost:9600`
- 旧主机（仅线上小程序）：`jiang-xia.top/x-zone/api/v1/` → 同一 upstream，新构建勿依赖
- WebSocket：`/api/v1/mobile/chat`（旧：`/x-zone/api/v1/mobile/chat`）
- 博客反代目标：`blog_url=https://jiang-xia.top/x-blog/api/v1`（博客仍在主域）

生产 ini：`allowed_origins` 含主站；可保留 `https://jiang-xia.top` 仅供旧路径页面 Origin。

## 故障排查

```bash
pm2 logs gin-zone-server
tail -50 /opt/jxapp/server/zone-server/logs/app-err.log
curl -sf http://127.0.0.1:9600/api/v1/common/signIn
```
