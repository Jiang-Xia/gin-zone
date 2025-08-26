import pageJson from "./pages"

import {createSSRApp} from 'vue'
import dayjs from 'dayjs'
import * as Pinia from 'pinia';
import App from './App.vue'
import api from './common/request/api.js'
import common,{mixins} from './common/utils/common.js'
// const mode = import.meta.env.MODE;
import {
	baseUrl,
	fileUrl
} from './common/request/api.js'

export function createApp() {
	const app = createSSRApp(App)
	app.use(Pinia.createPinia());
	app.config.globalProperties.$api = api
	app.config.globalProperties.$common = common
	app.config.globalProperties.$fileUrl = fileUrl
	app.config.globalProperties.$baseUrl = baseUrl
	app.config.globalProperties.$pages = pageJson.pages,
    app.config.globalProperties.$dayjs = dayjs
	app.mixin(mixins)
	return {
		app,
		Pinia // 此处必须将 Pinia 返回
	}
}

/* 
 小程序打包优化：
  1.使用分包，主包一般放tabbar中的页面，其他页面放到分包中
  2.组件按需加载引入
  3.禁止uni.scss写公共类名样式，因为会注入到每个页面中
  4.static资源改为在线引入，图片字体等资源
 */