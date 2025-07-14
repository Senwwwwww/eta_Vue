<template>
  <div>
    <fish/>
    <el-form ref="registerForm" :model="form" :rules="rules" label-width="80px" class="register-box">
      <!-- 插入一张logo图片 -->
      <div id="image_wo">
        <img src="../assets/logo.png" alt="" class="logo"/>
      </div>
      <div id = "image_wo2">
      <h3 class="register-title" id="image_lo2">用户注册</h3>
      </div>
      <el-form-item label="账号" prop="username">
        <el-input type="text" placeholder="请输入账号" v-model="form.username"/>
      </el-form-item>



      <el-form-item label="密码" prop="password">
        <el-input type="password" placeholder="请输入密码" v-model="form.password"/>
      </el-form-item>

      <el-form-item label="确认密码" prop="checkPass">
        <el-input type="password" placeholder="请确认密码" v-model="form.checkPass"/>
      </el-form-item>

      <el-form-item>
        <div class="button-container">
          <el-button  @click="redirectTolo">返回登录</el-button>
          <el-button type="primary" @click="onSubmit('registerForm')">下一步</el-button>
          <el-button @click="onReset('registerForm')">重置</el-button>
        </div>
      </el-form-item>
    </el-form>

    <el-dialog
        title="温馨提示"
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
import Fish from "@/components/Fish.vue";
import {strTomd5} from "@/util/md5";
import {instance} from "@/util/request";
import   "../store/module/Admin";

export default {
  name: "register_vue",
  components: {Fish},
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.form.checkPass !== '') {
          this.$refs.registerForm.validateField('checkPass');
        }
        callback();
      }
    };
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };

    return {
      form: {
        username: '',
        password: '',
        checkPass: '',
        Md5password:''
      },
      rules: {
        username: [
          { required: true, message: "账号不可为空", trigger: 'blur' },
          { min: 5, message: "账号长度不能少于5个字符", trigger: 'blur' }, // 最小长度限制
          { max: 20, message: "账号长度不能超过20个字符", trigger: 'blur' }, // 最大长度限制
          { pattern: /^[a-zA-Z0-9_]+$/, message: "账号只能包含字母、数字和下划线", trigger: 'blur' }, // 字符类型限制
        ],

        password: [
          { required: true, message: "密码不可为空", trigger: 'blur' },
          { min: 8, message: "密码长度不能少于8个字符", trigger: 'blur' }, // 最小长度限制
          { max: 20, message: "密码长度不能超过20个字符", trigger: 'blur' }, // 最大长度限制
          { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/,
            message: "密码必须包含大小写字母、数字",
            trigger: 'blur' }, // 字符复杂性限制
          { validator: validatePass, trigger: 'blur' } // 自定义验证器
        ],
        checkPass: [
          {required: true, validator: validatePass2, trigger: 'blur'}
        ]
      },

    }
  },
  methods: {


    validate(callback) {
      this.$refs.registerForm.validate((valid, fields) => {
        callback(valid, fields);
      });
    },
    resetFields() {
      this.$refs.registerForm.resetFields();
    },
    onSubmit(formName) {
      this.validate( (valid, fields) => {
        if (valid) {
          // 设置md5编码
          this.form.Md5password = strTomd5(this.form.password);
          // 同步数据库
          instance.post('/user/login/register', this.form).then(response => {
            console.log(response)
            if (response.data.success) {
              this.$message.success("注册成功")
              console.log(response.data.data)
              sessionStorage.setItem("userID", response.data.data)
              localStorage.setItem('loginID', this.form.username)
              // 延时跳转
              this.$router.push('/bind')
            } else {
              this.$message.error(response.data.errorMsg)
            }
          })
              .catch(error => {
                this.$message.error("注册失败，请稍后再试")
              })
        } else {
          this.$message.error("请完善注册信息")
          console.log('未通过校验的字段:', fields);
        }
      });
    },
    onReset(formName) {
      this.resetFields();
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

<style lang="scss" scoped>
.register-box {
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
</style>
