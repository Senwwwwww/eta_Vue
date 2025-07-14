<template>
  <div>
    <fish/>
    <el-form ref="loginForm" :model="form" :rules="rules" label-width="60px" class="login-box">
      <!-- 插入一张logo图片 -->
      <div id="image_lo">
      <img src="../assets/logo.png" alt="" class="logo"/>
      </div>
      <h2 class="login-title" id="image_lo2">智慧电力全景监控与管理系统</h2>
      <el-form-item label="账号" prop="username">
        <el-input type="text" placeholder="请输入账号" v-model="form.username"/>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" placeholder="请输入密码" v-model="form.password"/>
      </el-form-item>
<!--      使用蜜罐技术，诱骗机器人-->
      <input type="text" v-model="form.honeypot" style="display:none;">
      <el-form-item label="记住我" prop="delivery">
        <el-switch v-model="form.delivery"></el-switch>
      </el-form-item>
      <el-form-item>
        <div class="button-container">
          <el-button plain  @click="redirectToRes">注册</el-button>
          <el-button type="primary" @click="onSubmit('loginForm')" >登录</el-button>
        </div>
        <!-- 下面加入忘记密码 -->
        <span class="forget-password" @click="redirectTorelo" id = "qqq">忘记密码</span>
      </el-form-item>
    </el-form>
    <el-dialog
      title="温馨提示"
      :visible.sync="dialogVisible"
      width="30%">
      <span>请输入账号和密码</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import fish from "@/components/Fish.vue";
import {strTomd5} from "@/util/md5";
import Fish from "@/components/Fish.vue";
import {instance} from "@/util/request";
// 导入md5加密方法
export default {
  name: "login_vue",
  components: {Fish},
  data() {
    return {
      form: {
        username: '',
        password: '',
        delivery: false,
        Md5password:'',
        // 添加一个隐藏的字段，用于防止表单被恶意利用
        honeypot:''

      },
      rules: {
        username: [
          {required: true, message: "账号不可为空", trigger: 'blur'}
        ],
        password: [
          {required: true, message: "密码不可为空", trigger: 'blur'}
        ]
      },
      dialogVisible: false
    }
  },
  created() {
    if(localStorage.getItem("loginID")){
      this.form.username = localStorage.getItem("loginID")
    }
    if(localStorage.getItem("password")){
      this.form.password = localStorage.getItem("password")
    }
  },
  methods: {
    onSubmit(formName) {
      this.$refs[formName].validate(async (valid) => {
        if(this.form.honeypot){
          this.$message.error('检测到机器人操作');
          return;
        }
        if (valid) {

          // 实现登录
          // 对密码进行加密
          this.form.Md5password = strTomd5(this.form.password);
         instance.post('/user/login',this.form)

             .then(response => {
               if(response.data.success){
                 this.$message.success("登录成功")
                 this.$store.commit('admin/setUsername',this.form.username)
                 // 如果成功，服务器会返回一个token（令牌），这个token令牌里面保存的就是你的身份
                 // 所以需要保存该token信息，通常会保存在浏览器的缓存空间中
                 sessionStorage.setItem('token',response.data.token)
                 // 浏览器的缓存空间有两种 local和session storage
                 // local里面的一直存在
                 // session里面的数据随着浏览器关闭而消失
                 // 将token保存到请求头中
                 this.$setToken()
                 //保存登录名
                 localStorage.setItem("loginID",this.form.username)
                 // 在浏览器中保存登录名
                 if(this.form.delivery){
                   localStorage.setItem("password",this.form.password)
                 }
                 this.$store.dispatch('logActivity', '登录')
                 // 设置延迟跳转
                 setTimeout(() => {
                   window.location.href = '/layout/home';
                 }, 100);


               }else{
                 this.$message.error(response.data.errorMsg)
               }
})
             .catch(error => {
               this.$message.error("登录失败")
             })
         // 判断是否登录成功
        } else {
          return false;
        }
      });
    },
    redirectToRes() {
      // 使用windows跳转
      window.location.href = '/register';
    },
    redirectTorelo() {
      window.location.href ='/reLogin'
    },

  }
}
</script>

<style lang="scss" scoped>
.login-box {
  border: 1px solid #DCDFE6;
  width: 320px;  /* 调整宽度 */
  margin: 100px auto;
  padding: 40px 30px;
  padding-left: 5px;
  border-radius: 8px;
  box-shadow: 0 0 20px #ddd;
}

.logo {
  display: block;
  width: 100px;  /* 调整 logo 大小 */
  margin: 0 auto 20px auto;
}

.login-title {
  text-align: center;
  margin: 20px 0;
  color: #303133;
  font-weight: bold;
  font-size: 22px;  /* 增加标题字体大小 */
}

.button-container {
  display: flex;
  justify-content: space-between; /* 调整按钮间距 */
}

.forget-password {
  display: block;
  text-align: right;
  color: #909399;
  margin-top: 10px;
  font-size: 12px;
}
#image_lo{
  padding-left: 20px;
  padding-bottom: 0px;
  padding-right: 0px;
  padding-right: 0px;
}
#image_lo2{
  padding-left: 20px;
  padding-bottom: 0px;
  padding-right: 0px;
  padding-right: 0px;
}
#qqq{
  // 设置鼠标悬浮在字体上变成可点击
  cursor: pointer;
  width: 50px;
  // 设置板块靠右，不是文本
  float: right;


}
</style>
