<template>
  <div class="attendance-rules-page">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>检修规则</span>
      </div>
      <el-form :model="form" label-width="150px">
        <el-form-item label="上班时间">
          <span>{{ form.clockInTime }}</span>
        </el-form-item>
        <el-form-item label="下班时间">
          <span>{{ form.clockOutTime }}</span>
        </el-form-item>
        <el-form-item label="迟到规定">
          <span>{{ form.clockBeLate }}</span>
        </el-form-item>
        <el-form-item label="请假流程">
          <span>{{ form.leaveProcess }}</span>
        </el-form-item>
        <el-form-item label="旷工处理">
          <span>{{ form.absenteeismPolicy }}</span>
        </el-form-item>
        <el-form-item label="加班规则">
          <span>{{ form.overtimeRules }}</span>
        </el-form-item>
      </el-form>
      <el-alert
          title="注意：。"
          type="warning"
          show-icon
          style="margin-top: 20px;"
      />
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';
import {instance} from "@/util/request";

export default {
  name: 'AttendanceRulesPage',
  data() {
    return {
      form: {
        clockInTime: '',
        clockOutTime: '',
        clockBeLate: '',
        leaveProcess: '',
        absenteeismPolicy: '',
        overtimeRules: '',
      },
    };
  },
  created() {
    this.fetchAttendanceRules();
  },
  methods: {
    async fetchAttendanceRules() {
      try {
        this.$setToken();
        const response = await instance.get('/user/getAttendanceRules');
        if (response.data.success) {
          this.form = response.data.data;
        } else {
          this.$message.error(response.data.errorMsg);
        }
      } catch (error) {
        this.$message.error("获取考勤规则失败");
      }
    },
  },
};
</script>

<style scoped>
.attendance-rules-page {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.box-card {
  padding: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
