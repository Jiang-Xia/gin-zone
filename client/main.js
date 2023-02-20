import pageJson from "./pages"
// #ifndef VUE3
import Vue from 'vue'
import App from './App'
Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
// #endif
// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import App from './App.vue'
import api from './common/request/api.js'

import common,{mixins} from './common/utils/common.js'
import {
	baseUrl,
	fileUrl
} from './common/request/api.js'

export function createApp() {
	const app = createSSRApp(App)
	app.config.globalProperties.$api = api
	app.config.globalProperties.$common = common
	app.config.globalProperties.$fileUrl = fileUrl
	app.config.globalProperties.$baseUrl = baseUrl
	app.config.globalProperties.$pages = pageJson.pages,
	app.mixin(mixins)
	return {
		app
	}
}
// #endif
