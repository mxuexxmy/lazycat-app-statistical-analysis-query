import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'xe-utils'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import './assets/main.css'

// 创建应用实例
const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 配置 VXE-Table
app.use(VXETable)

// 配置 Element Plus
app.use(ElementPlus, {
  locale: zhCn,
})

// 配置 Pinia
const pinia = createPinia()
app.use(pinia)

// 配置路由
app.use(router)

// 挂载应用
app.mount('#app') 