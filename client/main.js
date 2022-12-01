

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
import { createSSRApp } from 'vue'
import App from './App.vue'
import CNavbar from './common/colorui/components/c-navbar/c-navbar.vue'

export function createApp() {
  const app = createSSRApp(App)
  app.component("c-navbar", CNavbar)
  return {
    app
  }
}
// #endif