const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  lintOnSave:false,
  transpileDependencies: true,
  devServer: {
    // client: {
    //   overlay: false,
    // },


    proxy: {
      // 配置代理服务器
      '/api': {
        target: 'http://localhost:5678',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
})
