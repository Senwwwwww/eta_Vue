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
              <el-select v-model="feedbackForm.type" placeholder="请选择反馈类型" @change="handleTypeChange">
                <el-option label="功能问题" value="功能问题"></el-option>
                <el-option label="UI问题" value="UI问题"></el-option>
                <el-option label="检修问题" value="检修问题"></el-option>
                <el-option label="性能问题" value="性能问题"></el-option>
                <el-option label="其他问题" value="其他问题"></el-option>
              </el-select>
            </el-form-item>

            <!-- 检修内容（仅当类型为“检修问题”时显示） -->
            <el-form-item
                v-if="feedbackForm.type === '检修问题'"
                label="检修内容"
                prop="repairDetail"
            >
              <el-select v-model="feedbackForm.repairContent" placeholder="请选择检修内容" >
                <el-option
                    v-for="item in repairOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
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
import {instance} from "@/util/request";
import {log} from "util";

export default {
  data() {
    return {
      feedbackForm: {
        type: '',
        content: '',
        userId: this.$store.state.admin.admin.data.data.userId,
        repairContent: [],
      },
      repairOptions: [], // 动态加载的检修内容列表
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
          this.$setToken()
          instance.post('/user/addNewFeedbackInfo/'+this.$store.state.admin.admin.data.data.userId,this.feedbackForm)
              .then(response => {
                if(response.data.success) {
                  this.$message.success("反馈提交成功");
                  this.handleReset();
                }else{
                  this.$message.error(response.data.errorMsg);
                }
              })
              .catch(error => {
                this.$message.error('反馈提交失败');
              })

        } else {
          this.$message.error('请填写完整的反馈信息');
          return false;
        }
      });
    },
    handleTypeChange(value) {
      if (value === '检修问题') {
        this.feedbackForm.repairDetail = ''; // 重置之前选择
        try {
          this.$setToken();
          instance.get('/user/getAttendance/'+this.$store.state.admin.admin.data.data.userId).then(
              res => {
                if(res.data.success) {
                  const rawList = res.data.data || [];
                  this.repairOptions = rawList.map(item => ({
                    label: item.data,
                    value: item.data
                  }));
                }
                else {
                  this.$message.error(res.data.errorMsg);
                }
              }
          ) // 假设接口为此路径
          // 假设返回数据格式：[{ label: '电路故障', value: '电路故障' }, ...]
        } catch (error) {
          this.$message.error('获取检修内容失败');
        }
      } else {
        this.feedbackForm.repairDetail = '';
      }
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
