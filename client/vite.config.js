import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni({
			vueOptions: {
				reactivityTransform: true, // 开启响应式语法糖
			},
		}),
  ],
})
