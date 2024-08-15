// 导入element-ui
import Vue from 'vue'
import e from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(e)
// 注册myPlugin插件
import myPlugin from './myPlugin'
Vue.use(myPlugin);