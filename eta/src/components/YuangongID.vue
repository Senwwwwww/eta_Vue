<template>
  <div class="bind-employee-id">
    <el-card class="box-card">
      <h2>绑定员工信息</h2>
      <el-form ref="form" :model="form" label-width="120px" class="form" :rules="rules">
        <!-- 员工ID（必填项） -->
        <el-form-item label="员工ID" prop="employeeId">
          <el-input v-model="form.employeeId" placeholder="请输入员工ID" @blur="fetchEmployeeName"></el-input>
        </el-form-item>


        <!-- 部门 -->
        <el-form-item label="职务">
          <el-select v-model="form.department" placeholder="请选择职务">
            <el-option
                v-for="department in departments"
                :key="department.departmentId"
                :label="department.departmentName"
                :value="department.departmentId"
            ></el-option>
          </el-select>
        </el-form-item>

        <!-- 员工姓名 -->
        <el-form-item label="姓名">
          <el-input v-model="form.realName" placeholder="请输入姓名"></el-input>
        </el-form-item>

        <!-- 性别 -->
        <el-form-item label="性别">
          <el-radio-group v-model="form.sex">
            <el-radio label="男"></el-radio>
            <el-radio label="女"></el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 生日 -->
        <el-form-item label="生日" :label-width="formLabelWidth">
          <div class="block">
            <el-date-picker
                v-model="form.birthDay"
                type="date"
                format="yyyy 年 MM 月 dd 日"
                placeholder="选择日期"
            ></el-date-picker>
          </div>
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
import { instance } from "@/util/request";

export default {
  data() {
    return {
      formLabelWidth: '100px',
      form: {
        employeeId: '',
        department: '',
        realName: '',
        sex: '',
        birthDay: '',
        userId: this.$store.state.admin.admin.data.data.userId,
      },
      rules: {
        employeeId: [
          { required: true, message: '员工ID是必填项', trigger: 'blur' },
        ],
      },
      departments: [], // 新增的部门列表
    };
  },
  mounted() {
    this.fetchDepartments(); // 在组件挂载时请求部门数据
  },
  methods: {
    fetchEmployeeName() {
      if(this.form.employeeId) {
        this.$setToken();
        instance.get(`/user/getEmployeeInfo/${this.form.employeeId}`)
            .then(response => {
              if(response.data.success) {
                this.form.realName = response.data.data.realName; // 自动填入员工姓名
              } else {
                this.$message.error(response.data.errorMsg);
              }
            })
            .catch(error => {
            });
      }
    },
    fetchDepartments() {
      this.$setToken();
      instance.get('/user/admin/getAllDepartmentInfo')
          .then(response => {
            if (response.data.success) {
              this.departments = response.data.data; // 获取部门数据
            } else {
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch(error => {
            this.$message.error("获取部门信息失败");
          });
    },
    onSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$setToken();

          instance.put('/user/addAndUpdatePersonalInfo/'+this.$store.state.admin.admin.data.data.userId,this.form)
              .then(res => {
                if(res.data.success){
                  this.$setToken();

                  instance.put('/user/bindUser/'+this.$store.state.admin.admin.data.data.userId+"?"+"departmentId="+this.form.department+'&'+'employeeId='+this.form.employeeId+'&'+'realName='+this.form.realName,{departmentId:this.form.department,employeeId:this.form.employeeId,realName:this.form.realName})
                      .then(response => {
                        if(response.data.success) {
                          this.$message.success("成功绑定员工信息");
                          this.$router.push('/layout/home');
                        } else {
                          this.$message.error(response.data.errorMsg);
                        }
                      });
                } else {
                  this.$message.error(res.data.errorMsg);
                }
              })
              .catch(error => {
                this.$message.error("绑定失败");
              });
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
}
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
</style>
