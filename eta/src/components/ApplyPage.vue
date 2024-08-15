<template>
  <div class="apply-page">
    <el-row :gutter="20">
      <!-- 申请表单 -->
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>我要申请</span>
          </div>
          <el-form ref="applyForm" :model="form" :rules="rules" label-width="120px" class="form">
            <el-form-item label="申请类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择申请类型">
                <el-option label="事假申请" value="leaveShi"></el-option>
                <el-option label="病班申请" value="leaveBing"></el-option>
                <el-option label="加班申请" value="outTime"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="申请原因" prop="reason">
              <el-input type="textarea" v-model="form.reason" placeholder="请输入申请原因" ></el-input>
            </el-form-item>

            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                  v-model="form.startTime"
                  type="datetime"
                  placeholder="选择开始时间"
                  format="yyyy-MM-dd HH:mm"
              ></el-date-picker>
            </el-form-item>

            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                  v-model="form.endTime"
                  type="datetime"
                  placeholder="选择结束时间"
                  format="yyyy-MM-dd HH:mm"
              ></el-date-picker>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitForm('applyForm')">提交申请</el-button>
              <el-button @click="resetForm('applyForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 提交结果提示 -->
    <el-dialog title="申请结果" :visible.sync="dialogVisible">
      <span>您的申请已提交成功！</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "ApplyPage",
  data() {
    return {
      form: {
        type: '',
        reason: '',
        startTime: '',
        endTime: '',
      },
      rules: {
        type: [{ required: true, message: '请选择申请类型', trigger: 'change' }],
        reason: [{ required: true, message: '请输入申请原因', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
      },
      dialogVisible: false,
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.dialogVisible = true; // 显示提交结果弹窗
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
  },
};
</script>

<style scoped>
.apply-page {
  padding: 20px;
  background-color: #f9fafc;
}

.el-card {
  margin-bottom: 20px;
}

.form {
  max-width: 600px;
  margin: 0 auto;
}

.dialog-footer {
  text-align: right;
}

</style>
