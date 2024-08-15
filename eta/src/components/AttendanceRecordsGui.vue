<template>
  <div class="attendance-rules-page">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>考勤规则</span>
      </div>
      <el-descriptions title="公司考勤规则" border>
        <el-descriptions-item label="打卡时间">每日8:30 - 9:00</el-descriptions-item>
        <el-descriptions-item label="迟到规定">9:00以后打卡为迟到</el-descriptions-item>
        <el-descriptions-item label="早退规定">17:30之前下班为早退</el-descriptions-item>
        <el-descriptions-item label="请假流程">请假需提前提交申请并得到批准</el-descriptions-item>
        <el-descriptions-item label="旷工处理">连续三天未打卡视为旷工</el-descriptions-item>
        <el-descriptions-item label="加班规则">加班需提前申请并得到批准</el-descriptions-item>
      </el-descriptions>
      <el-alert
          title="注意：违反考勤规则将会影响考勤记录和绩效考核。"
          type="warning"
          show-icon
          style="margin-top: 20px;"
      />
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'AttendanceRulesPage',
  data() {
    return {
      // Add any additional data if needed
    };
  },
  methods: {
    // Add any methods if needed
  }
};
</script>

<style scoped>
.attendance-rules-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.box-card {
  padding: 20px;
}

.el-descriptions-item__label {
  font-weight: bold;
}
</style>
