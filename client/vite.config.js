import {
	VitePWA
} from 'vite-plugin-pwa'
import {
	defineConfig
} from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
	plugins: [
		uni(),
		// #ifdef H5 || APP-PLUS
		VitePWA({
			"registerType": 'autoUpdate',
			"name": "zone",
			"short_name": "zone",
			"icons": [
			    {
			        "src": "/android-chrome-192x192.png",
			        "sizes": "192x192",
			        "type": "image/png"
			    },
			    {
			        "src": "/android-chrome-512x512.png",
			        "sizes": "512x512",
			        "type": "image/png"
			    }
			],
			"theme_color": "#ffffff",
			"background_color": "#ffffff",
			"display": "standalone"
		})
		// #endif
	],
});
