// 导入util
import {get,post,setToken} from '../util/request'
// 定义一个插件
export default{
    // 插件中必须包含install方法
    install:function(Vue){
        // 给Vue 混入成员
        Vue.mixin({
            methods: {
                // get 请求方法
                $get(url, params) {
                    return get(url, params)
                },
                // post请求方法
                $post(url, prams) {
                    return post(url, prams)
                },
                // 执行该方法，就会将token保存到头部
                $setToken(){
                    setToken()
                }
            },
        })
    }
}