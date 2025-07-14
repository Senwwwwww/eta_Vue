<template>
  <el-dialog
      title="隐私验证"
      :visible.sync="visible"
      width="400px"
      @close="onClose"
  >
    <div class="dialog-content">
      <p>该操作涉及到隐私，请验证您的邮箱。</p>
      <el-form :model="form" :rules="rules" ref="emailForm">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入您的邮箱" />
        </el-form-item>
        <el-form-item label="验证码" prop="verificationCode">
          <el-input v-model="form.verificationCode" placeholder="请输入验证码" />
          <el-button type="primary" @click="sendVerificationCode" size="small">发送验证码</el-button>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onConfirm">确认</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {sendEmailVerification, verifyCode} from "@/api/email";
import {instance} from "@/util/request";

export default {
  name: 'VerifyEmailModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
        email: '',
        verificationCode: '',
        userId:this.$store.state.admin.admin.data.data.userId,
        username:localStorage.getItem("loginID"),
      },
      rules: {
        email: [
          { required: true, type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],

      }
    }
  },
  methods: {
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
    onConfirm() {
      this.$refs.emailForm.validate(async (valid, fields) => {
        if(valid) {

          // Call API to verify the code and bind the email
          verifyCode(this.form.email, this.form.verificationCode)
              .then(async response => {
                this.$setToken()
                instance.post('/user/bindEmail/'+this.$store.state.admin.admin.data.data.userId+'?'+"email="+this.form.email, this.form)
                    .then(res => {
                      console.log(res)
                      if(res.data.success){
                        this.$message.success('邮箱验证成功')

                        // 修改事件状态
                        this.$emit('confirm');
                      }else{
                        this.$router.push('/layout/home')
                        this.$message.error(res.data.data)
                      }
                    })
                    .catch(res=>{

                    })
              })
              .catch(error => {
                console.log("错误了")
                this.$message.error("验证码错误，请重新输入");
              });
        }else{
          this.$message.error("请完善信息");
        }
      });
    },
    onClose() {
      this.$emit('close');
    }
  }
}
</script>

<style scoped lang="scss">
.dialog-content {
  padding: 10px 0;
  p {
    margin-bottom: 20px;
  }
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
