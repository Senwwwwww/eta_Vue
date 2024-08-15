<template>
  <div class="bind-employee-id">
    <el-card class="box-card">
      <h2>绑定员工信息</h2>
      <el-form ref="form" :model="form" label-width="120px" class="form" :rules="rules">
        <!-- 员工ID（必填项） -->
        <el-form-item label="员工ID" prop="employeeId">
          <el-input v-model="form.employeeId" placeholder="请输入员工ID"></el-input>
        </el-form-item>

        <!-- 部门 -->
        <el-form-item label="部门">
          <el-select v-model="form.department" placeholder="请选择部门">
            <el-option label="技术部" value="tech"></el-option>
            <el-option label="人事部" value="hr"></el-option>
            <el-option label="财务部" value="finance"></el-option>
            <!-- 可根据需求添加更多选项 -->
          </el-select>
        </el-form-item>

        <!-- 员工姓名 -->
        <el-form-item label="姓名">
          <el-input v-model="form.name" placeholder="请输入姓名"></el-input>
        </el-form-item>

        <!-- 性别 -->
        <el-form-item label="性别">
          <el-radio-group v-model="form.gender">
            <el-radio label="男"></el-radio>
            <el-radio label="女"></el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 提交和重置按钮 -->
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        employeeId: '',
        department: '',
        name: '',
        gender: '',
      },
      rules: {
        employeeId: [
          { required: true, message: '员工ID是必填项', trigger: 'blur' },
        ],
      },
    };
  },
  methods: {
    onSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 数据更新到数据库
          // 在此处添加提交逻辑
          this.$message.success("成功绑定员工信息")
          this.$router.push('/layout/home')
        } else {
          console.log('验证失败');
          return false;
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
.bind-employee-id {
  width: 600px;
  margin: 0 auto;
  padding: 50px 0;
  .box-card {
    padding: 20px;
  }
  h2 {
    text-align: center;
    margin-bottom: 20px;
  }
  .form {
    padding: 20px;
  }
}
</style>
