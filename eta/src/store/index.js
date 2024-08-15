import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
// 导入
import admin from "./module/Admin"
export default new Vuex.Store({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    admin
  }
})
