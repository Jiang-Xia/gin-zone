// gin-zone-server PM2 配置（cwd 指向 current -> releases/xxx）
module.exports = {
  apps: [
    {
      name: 'gin-zone-server',
      script: './zone-server',
      cwd: './',
      watch: false,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      kill_timeout: 10000,
      listen_timeout: 10000,
      // 日志在部署根目录 logs/（release 外），cwd 为 current -> releases/xxx
      error_file: '../logs/app-err.log',
      out_file: '../logs/app-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      min_uptime: '60s',
      max_restarts: 30,
      restart_delay: 60,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
