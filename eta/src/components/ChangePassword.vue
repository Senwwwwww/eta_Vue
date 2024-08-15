<template>
  <div class="change-password-page">
    <!-- 验证邮箱弹窗 -->
    <VerifyEmailModal
        :visible.sync="isModalVisible"
        @confirm="handleEmailConfirm"
        @close="handleClose"
    />

    <!-- 修改密码表单 -->
    <el-card class="box-card" v-if="isEmailVerified">
      <div slot="header" class="clearfix">
        <span>修改密码</span>
      </div>
      <el-form :model="form" :rules="rules" ref="form" label-width="120px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="form.oldPassword" type="password" placeholder="请输入旧密码"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="form.newPassword" type="password" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入新密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import {strTomd5} from "@/util/md5";
import VerifyEmailModal from "@/components/VerifyEmailModal.vue";
import {instance} from "@/util/request";

export default {
  name: 'ChangePassword',
  components: {
    VerifyEmailModal,
  },
  data() {
    return {
      form: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        Md5password: '',
      },
      rules: {
        oldPassword: [
          { required: true, message: '请输入旧密码', trigger: 'blur' },
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { validator: (rule, value, callback) => {
              if (value !== this.form.newPassword) {
                callback(new Error('两次输入的密码不一致'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          },
        ],
      },
      isModalVisible: true,  // 控制邮箱验证弹窗显示
      isEmailVerified: false,  // 控制表单是否显示
    };
  },
  methods: {
    handleEmailConfirm() {
      // 验证通过后，显示修改密码表单
      this.isEmailVerified = true;
      this.isModalVisible = false;
    },
    handleClose() {
      // 仅在用户点击取消或关闭时执行跳转
      this.isModalVisible = false;
      if (!this.isEmailVerified) {
        this.$router.push('/layout/home');  // 仅当验证未通过时跳转
      } // 验证取消，跳转回首页或其他页面
    },
    async onSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.form.Md5password = strTomd5(this.form.newPassword);
          instance.put('/user/update/'+this.$store.state.userID, this.form)
              .then(response => {
                if(response.data.success) {
                  this.$message.success('修改成功');
                }else{
                  this.$message.error(response.data.message);
                }
              })
              .catch(error => {
                this.$message.error('修改失败,请稍后再试');
              })
        }
      });
    },
    onReset() {
      this.$refs.form.resetFields();
    },
  },
};
</script>

<style scoped>
.change-password-page {
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.box-card {
  padding: 20px;
}

.el-input {
  width: 100%;
}

.el-button {
  margin-right: 10px;
}
</style>
