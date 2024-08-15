// 请求相关的方法
import Vue from 'vue'
import axios from 'axios'

//导入加载进度条工具
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 初始化一个axios对象
var instance = axios.create({
    // 接口的根路径
    baseURL: "http://192.168.50.226:8004",
    // 请求超时时间
    timeout: 5000,
})
// 创建一个get请求方法
// async是异步方法
// await 是异步等待
let get =async function(url,params){
    // get 需要多包一层
    let {data} = await instance.get(url,{params});
    return data;
}
// 创建一个post方法
let post =async function(url,prams){
    let {data} =await instance.post(url,prams);
    return data;
}

// 添加请求拦截器
instance.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
   NProgress.start();
    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  });

// 添加响应拦截器
instance.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    //加载进度条结束
    NProgress.done();
    return response;
  }, function (error) {
    NProgress.done();
    // 对响应错误做点什么
    return Promise.reject(error);
  });


let setToken =function(){
    // 将token信息保存到信息头的方法
    instance.defaults.headers.common['token'] = sessionStorage.getItem('token');
}
// 导出
export {get,post,setToken,instance}