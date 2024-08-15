<template>
  <div class="submit-feedback">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>意见反馈</span>
          </div>
          <el-form ref="feedbackForm" :model="feedbackForm" :rules="rules" label-width="120px">
            <el-form-item label="反馈类型" prop="type">
              <el-select v-model="feedbackForm.type" placeholder="请选择反馈类型">
                <el-option label="功能问题" value="功能问题"></el-option>
                <el-option label="UI问题" value="UI问题"></el-option>
                <el-option label="性能问题" value="性能问题"></el-option>
                <el-option label="其他问题" value="其他问题"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="反馈内容" prop="content">
              <el-input
                  type="textarea"
                  v-model="feedbackForm.content"
                  placeholder="请输入您的反馈内容"
                  rows="5"
              ></el-input>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSubmit">提交反馈</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      feedbackForm: {
        type: '',
        content: '',
      },
      rules: {
        type: [{ required: true, message: '请选择反馈类型', trigger: 'blur' }],
        content: [{ required: true, message: '请输入反馈内容', trigger: 'blur' }],
      },
    };
  },
  methods: {
    handleSubmit() {
      this.$refs.feedbackForm.validate((valid) => {
        if (valid) {
          this.$message.success('反馈提交成功！');
          this.handleReset();
        } else {
          this.$message.error('请填写完整的反馈信息');
          return false;
        }
      });
    },
    handleReset() {
      this.$refs.feedbackForm.resetFields();
    },
  },
};
</script>

<style scoped>
.submit-feedback {
  padding: 20px;
  background-color: #f9fafc;
}

.el-card {
  margin-bottom: 20px;
}
</style>
