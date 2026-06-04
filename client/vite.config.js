import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// uni-app CLI 脚手架：源码在 src/，开发代理与旧 client 保持一致
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // 屏蔽 uni_modules/uni-scss 等依赖里的 Sass 弃用提示（不影响编译结果）
        quietDeps: true,
        silenceDeprecations: [
          'legacy-js-api',
          'import',
          'global-builtin',
          'color-functions',
        ],
      },
    },
  },
  server: {
    port: 9100,
    proxy: {
      '/prod-api': {
        target: 'https://jiang-xia.top/x-zone/api/v1/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/prod-api/, ''),
      },
      '/dev-api': {
        target: 'http://127.0.0.1:9600/api/v1/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/dev-api/, ''),
      },
      '/prod-ws': {
        target: 'wss://jiang-xia.top/x-zone/api/v1/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/prod-ws/, ''),
      },
      '/dev-ws': {
        target: 'ws://192.168.1.6:9600/api/v1',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/dev-ws/, ''),
      },
    },
  },
  plugins: [
    uni({
      vueOptions: {
        reactivityTransform: true,
      },
    }),
  ],
})
