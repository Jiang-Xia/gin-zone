# gin-zone-client H5 一键远程部署

对齐 `blog-home-uniapp/deploy/pm2/`：**本地 H5 构建 → tar 上传 → releases/current 切流**（无 PM2）。

## 一条命令

```powershell
# 在 client/ 目录
npm run deploy
```

## 首次配置

```powershell
cp deploy/pm2/deploy.local.env.example deploy/pm2/deploy.local.env
# 填写 DEPLOY_HOST / DEPLOY_USER / DEPLOY_PASSWORD / DEPLOY_HOSTKEY
```

## Nginx

静态目录由 Nginx 指向 `current/`（见外部 nginx 配置）：

```nginx
# 主站（新构建/开发上线一律用 zone.jiang-xia.top）
location /zone/ {
    alias /opt/jxapp/front/zone/current/;
    try_files $uri $uri/ /zone/index.html;
}

# 旧主机 jiang-xia.top/zone/：仅兼容无法发版的线上小程序，勿作为新入口
```

若线上仍为扁平目录 `/opt/jxapp/front/zone/`，首次部署脚本会自动迁移到 releases 布局；之后请将 Nginx `alias` 改为 `.../zone/current/`。

## 发布流程

1. `npm run build:prod`（uni H5 生产构建 → `dist/build/h5`）
2. 打 tar 并上传
3. 远程解压到 `releases/YYYYMMDD-HHMMSS/`
4. `current` 软链原子切换

## 回滚

```powershell
npm run rollback:list
npm run rollback
```

## 线上目录

```
/opt/jxapp/front/zone/
├── current -> releases/20250707-120000/
└── releases/
    ├── backups/
    └── 20250707-120000/
        └── index.html
```

## 访问

- H5：https://zone.jiang-xia.top/zone/#/
- 旧路径（仅小程序）：https://jiang-xia.top/zone/#/（Nginx 保留，新包不要依赖）

API 写入 `src/common/request/config.js`，一律 `zone.jiang-xia.top`；旧主机 `jiang-xia.top/x-zone` 仅 Nginx 反代给线上小程序。
