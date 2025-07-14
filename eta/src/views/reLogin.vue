<template>
  <div>
    <fish/>
    <el-form ref="registerForm" :model="form" :rules="rules" label-width="80px" class="register-box">
      <div id="image_wo3">
        <el-steps :space="200" :active="1" finish-status="success" process-status="process">
          <el-step title="步骤 1"></el-step>
          <el-step title="进行中"></el-step>
          <el-step id ="qwe" title="步骤 3"></el-step>
        </el-steps>
      </div>
      <!-- 插入一张logo图片 -->
      <div id="image_wo">
        <img src="../assets/logo.png" alt="" class="logo"/>
      </div>
      <div id = "image_wo2">
        <h3 class="register-title" id="image_lo2">找回密码</h3>
      </div>
      <el-form-item label="账号" prop="username">
        <el-input type="text" placeholder="请输入账号" v-model="form.username"/>
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input type="email" placeholder="请输入邮箱" v-model="form.email"/>
      </el-form-item>
      <!-- Verification code input -->
      <el-form-item label="验证码" prop="verificationCode">
        <el-input placeholder="请输入验证码" v-model="form.verificationCode"/>
        <el-button type="primary" @click="sendVerificationCode" size="small">发送验证码</el-button>
      </el-form-item>



      <el-form-item>
        <div class="button-container">
          <el-button type="primary" @click="onSubmit('registerForm')">下一步</el-button>
          <el-button  @click="redirectTolo">返回登录</el-button>
          <el-button @click="onReset('registerForm')">重置</el-button>
        </div>
      </el-form-item>
    </el-form>

<!--    <el-dialog-->
<!--        title="温馨提示"-->
<!--        :visible.sync="dialogVisible"-->
<!--        width="30%">-->
<!--      <span>{{ dialogMessage }}</span>-->
<!--      <span slot="footer" class="dialog-footer">-->
<!--        <el-button type="primary" @click="closeDialog">确定</el-button>-->
<!--      </span>-->
<!--    </el-dialog>-->
  </div>
</template>

<script>
import Fish from "@/components/Fish.vue";
import {sendEmailVerification, verifyCode} from "@/api/email";

export default {
  name: "register_vue",
  components: {Fish},
  data() {


    return {
      form: {
        username: '',
        email: '',
        verificationCode: '',

      },
      rules: {
        username: [
          {required: true, message: "账号不可为空", trigger: 'blur'}
        ],
        email: [
          {required: true, message: "邮箱不可为空", trigger: 'blur'},
          {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
        ],verificationCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ]

      },
      // dialogVisible: true,
      // dialogMessage: ''
    }
  },
  methods: {
    validate(callback) {
      this.$refs.registerForm.validate((valid, fields) => {
        callback(valid, fields);
      });
    },
    sendVerificationCode() {
      if (!this.form.email) {
        this.$message.error('请先输入邮箱')
        return;
      }
      sendEmailVerification(this.form.email,this.form.username)
          .then(response => {
            // this.dialogMessage = '验证码已发送到您的邮箱';
            // // this.dialogVisible = true;
            this.$message.success("验证码已发送到您的邮箱")
          })
          .catch(error => {
            // this.dialogMessage = '发送验证码失败，请稍后再试';
            // this.dialogVisible = true;
            this.$message.error('发送验证码失败，请稍后再试')
          });
    },
    resetFields() {
      this.$refs.registerForm.resetFields();
    },
    onSubmit(formName) {
      this.validate((valid, fields) => {
        if (valid) {
          // Call API to verify the code and bind the email
          verifyCode(this.form.email, this.form.verificationCode)
              .then(async response => {
                let res = await this.$post('/user/login/RecoverPassword', this.form);
                console.log(res)
                if (res.success) {
                  //延时跳转
                  setTimeout(() => {
                   this.$message.success('邮箱验证成功');
                   sessionStorage.setItem("userID", res.data);
                   console.log(res.data);
                    // this.$router.push('/login');
                    // 使用windows进行跳转
                    window.location.href = '/relogin2';
                  }, 100);
                }else{
                  this.$message.error(res.errorMsg)
                }
              })

              .catch(error => {
               this.$message.error('验证码错误，请重新输入')
              });
        }else{
          this.$message.error('请完善信息')
          console.log('未通过校验的字段:', fields);
        }
      })
    },

    onReset(formName) {
      this.resetFields();
    },
    closeDialog() {
      this.dialogVisible = false;
    },
    redirectTolo() {
      // Redirect to login page
      window.location.href ='/login';
    },

  }
}
</script>

<style lang="scss" scoped>
.register-box {
  border: 1px solid #DCDFE6;
  width: 360px;
  margin: 100px auto;
  padding: 40px 30px;
  padding-left: 0px;
  border-radius: 8px;
  box-shadow: 0 0 20px #ddd;
}

.logo {
  display: block;
  width: 100px;
  margin: 0 auto 20px auto;
}

.register-title {
  text-align: center;
  margin: 20px 0;
  color: #303133;
  font-weight: bold;
  font-size: 20px;
}

.button-container {
  display: flex;
  justify-content: space-between;
}
#image_wo{
  padding-left: 20px;
  padding-bottom: 0px;
  padding-right: 0px;
  padding-right: 0px;
}
#image_wo2{
  padding-left: 20px;
  padding-bottom: 0px;
  padding-right: 0px;
  padding-right: 0px;
}
#image_wo3{
  padding-left: 87px;
  padding-bottom: 0px;
  padding-right: 0px;
  padding-right: 0px;
  opacity: 0.5;
}
#qwe{
//  长度变小
  width: 10px;

}
</style>
