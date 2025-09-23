import {
    defineConfig
} from "vite";
import uni from "@dcloudio/vite-plugin-uni";
// // #ifdef H5
// import {
// 	VitePWA
// } from "vite-plugin-pwa";
// //  #endif 
export default defineConfig({
    server: {
        port: 5173,
        http: false,
        proxy: {
            "/prod-api": {
                target: "https://jiang-xia.top/x-zone/api/v1/",
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/prod-api/, ''),
            },
            "/dev-api": {
                target: "http://127.0.0.1:9600/api/v1/",
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/dev-api/, ''),
            },
            "/prod-ws": {
                target: "wss://jiang-xia.top/x-zone/api/v1/",
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/prod-ws/, ''),
            },
            "/dev-ws": {
                target: "ws://192.168.1.6:9600/api/v1",
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/dev-ws/, ''),
            }
        }
    },
    plugins: [
        uni({
            vueOptions: {
                reactivityTransform: true, // 开启响应式语法糖
            },
        }),
        // // #ifdef H5
        // VitePWA({
        // 	registerType: "autoUpdate",
        // 	manifest: {
        // 		name: "zone",
        // 		short_name: "zone",
        // 		icons: [{
        // 				src: "./static/logo/android-chrome-192x192.png",
        // 				sizes: "192x192",
        // 				type: "image/png",
        // 				purpose: "any",
        // 			},
        // 			{
        // 				src: "./static/logo/android-chrome-512x512.png",
        // 				sizes: "512x512",
        // 				type: "image/png",
        // 				purpose: "any",
        // 			},
        // 			{
        // 				src: "./static/logo/apple-touch-icon.png",
        // 				sizes: "180x180",
        // 				type: "image/png",
        // 				purpose: "any",
        // 			},
        // 		],
        // 		"theme_color": "#ffffff",
        // 		"background_color": "#ffffff",
        // 		"display": "standalone"
        // 	},
        // }),
        // //  #endif 
    ],
});