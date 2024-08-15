// 当前登录账号模块
export default {
  // 设为私有命名空间
  namespace:true,
  state: {
      // 登录用户信息
    admin:{}
  },
  mutations: {
    setAdmin(state,admin){
      state.admin = admin
    }
  }
}