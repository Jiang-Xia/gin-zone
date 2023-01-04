
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
	plugins: [
		uni(),
		VitePWA({ registerType: 'autoUpdate' })
	],
});