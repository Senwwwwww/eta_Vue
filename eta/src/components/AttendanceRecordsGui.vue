<template>
  <div class="attendance-rules-page">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>考勤规则</span>
        <el-button type="primary" size="small" @click="handleSave">
          {{ isEditing ? '保存' : '编辑' }}
        </el-button>
      </div>
      <el-form :model="form" label-width="150px">
        <el-form-item label="上班时间">
          <el-time-picker
              v-if="isEditing"
              v-model="form.clockInTime"
              placeholder="选择上班时间"
              value-format="HH:mm:ss"
          />
          <span v-else>{{ form.clockInTime }}</span>
        </el-form-item>
        <el-form-item label="下班时间">
          <el-time-picker
              v-if="isEditing"
              v-model="form.clockOutTime"
              placeholder="选择下班时间"
              value-format="HH:mm:ss"
          />
          <span v-else>{{ form.clockOutTime }}</span>
        </el-form-item>
        <el-form-item label="迟到规定">
          <el-time-select
              v-if="isEditing"
              v-model="form.lateAfter"
              :picker-options="{
              start: '09:00',
              step: '00:15',
              end: '12:00'
            }"
              placeholder="选择时间"
          />
          <span v-else>{{ form.clockBeLate }}</span>
        </el-form-item>
        <el-form-item label="请假流程">
          <el-input
              v-if="isEditing"
              v-model="form.leaveProcess"
              placeholder="请假流程说明"
          />
          <span v-else>{{ form.leaveProcess }}</span>
        </el-form-item>
        <el-form-item label="旷工处理">
          <el-input
              v-if="isEditing"
              v-model="form.absenteeismPolicy"
              placeholder="旷工处理说明"
          />
          <span v-else>{{ form.absenteeismPolicy }}</span>
        </el-form-item>
        <el-form-item label="加班规则">
          <el-input
              v-if="isEditing"
              v-model="form.overtimeRules"
              placeholder="加班规则说明"
          />
          <span v-else>{{ form.overtimeRules }}</span>
        </el-form-item>
      </el-form>
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
import axios from 'axios';
import {instance} from "@/util/request";

export default {
  name: 'AttendanceRulesPage',
  data() {
    return {
      isEditing: false,
      form: {
        clockInTime: '08:00:00',
        clockOutTime: '17:00:00',
        clockBeLate: '09:00:00',
        // earlyLeaveBefore: '17:00',
        leaveProcess: '请假需提前提交申请并得到批准',
        absenteeismPolicy: '连续三天未打卡视为旷工',
        overtimeRules: '加班需提前申请并得到批准',
      },
    };
  },
  methods: {
    handleSave() {
      if (this.isEditing) {
        this.saveToDatabase();
      }
      this.isEditing = !this.isEditing;
    },
    async saveToDatabase() {
      this.$setToken()
      instance.post('/user/admin/addAndUpdateAttendanceRules', this.form)
          .then(response => {
            if (response.data.success) {
              this.$message.success("保存成功");
            } else {
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch(error => {
            this.$message.error("保存失败");
          })
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

.el-button {
  float: right;
}
</style>
