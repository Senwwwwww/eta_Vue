<template>
  <div>
    <el-form ref="bindEmailForm" :model="form" :rules="rules" label-width="80px" class="bind-email-box">
      <!-- Logo or title -->
      <div id="image_bind">
        <img src="../assets/logo.png" alt="" class="logo"/>
      </div>
      <h3 class="bind-email-title">绑定邮箱</h3>

      <!-- Email input -->
      <el-form-item label="邮箱" prop="email">
        <el-input type="email" placeholder="请输入邮箱" v-model="form.email"/>
      </el-form-item>

      <!-- Verification code input -->
      <el-form-item label="验证码" prop="verificationCode">
        <el-input placeholder="请输入验证码" v-model="form.verificationCode"/>
        <el-button type="primary" @click="sendVerificationCode" size="small">发送验证码</el-button>
      </el-form-item>

      <!-- Buttons -->
      <el-form-item>
        <div class="button-container">
          <el-button type="primary" @click="onSubmit('bindEmailForm')">完成</el-button>
          <el-button  @click="redirectTolo">返回登录</el-button>
          <el-button @click="onReset('bindEmailForm')">重置</el-button>
        </div>
      </el-form-item>
    </el-form>

    <!-- Dialog for messages -->
    <el-dialog
        title="提示"
        :visible.sync="dialogVisible"
        width="30%">
      <span>{{ dialogMessage }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="closeDialog">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {sendEmailVerification, verifyCode} from "@/api/email";
import {instance} from "@/util/request"; // Assume this is the function to send verification code

export default {
  name: "BindEmail",
  data() {
    return {
      form: {
        email: '',
        verificationCode: '',
        userId:sessionStorage.getItem("userID"),
        username: localStorage.getItem("loginID"),

      },
      rules: {
        email: [
          { required: true, type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        verificationCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ]
      },
      dialogVisible: false,
      dialogMessage: ''
    }
  },
  methods: {
    sendVerificationCode() {
      if (!this.form.email) {
        this.$message.warning('请先输入邮箱')
        return;
      }
      sendEmailVerification(this.form.email,this.form.username)
          .then(response => {
          this.$message.success("验证码已发送到您的邮箱")
          })
          // .catch(error => {
          //   this.dialogMessage = '发送验证码失败，请稍后再试';
          //   this.dialogVisible = true;
          // });
    },
    onSubmit(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          // Call API to verify the code and bind the email
          verifyCode(this.form.email,this.form.verificationCode)
          .then(async response => {
            console.log(sessionStorage.getItem("userID"))
           instance.put('/user/login/update/'+sessionStorage.getItem("userID")+'?'+'userId='+this.form.userId+'&&'+'email='+this.form.email,this.form).then(response => {
             console.log(response.data.success)
             if(response.data.success){
               this.$message.success("绑定成功")
               // 延时跳转
               setTimeout(() => {
                 window.location.href = '/login';
               },100)

             }else{
               this.$message.error("绑定失败，请稍后再试")
             }
           })
               .catch(error => {
                 this.$message.error("绑定失败，请稍后再试")
               })

          })
              .catch(error => {
                this.$message.error("验证码错误")
              });


        } else {
          this.$message.error("请完善信息")
        }
      });
    },
    onReset(formName) {
      this.$refs[formName].resetFields();
    },
    closeDialog() {
      this.dialogVisible = false;
    },
    redirectTolo() {
      window.location.href ='/login';
    }
  }
}
</script>

<style scoped lang="scss">
.bind-email-box {
  border: 1px solid #DCDFE6;
  width: 360px;
  margin: 100px auto;
  padding: 40px 30px;
  padding-left: 10px;
  border-radius: 8px;
  box-shadow: 0 0 20px #ddd;
}

.logo {
  display: block;
  width: 100px;
  margin: 0 auto 20px auto;
}

.bind-email-title {
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

</style>
