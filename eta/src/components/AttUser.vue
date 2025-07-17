<template>
  <div class="inspection-rules">
    <el-container>
      <el-main>
        <div class="rules-title">巡检规则</div>
        <el-row :gutter="20" class="rules-list">
          <el-col :span="24" v-for="(rule, index) in rules" :key="index">
            <el-card class="rule-card" shadow="hover">
              <div slot="header" class="rule-header">
                第 {{ index + 1 }} 条
              </div>
              <div class="rule-content">{{ rule }}</div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'InspectionRules',
  data() {
    return {
      rules: [
        '人工巡检周期为 7 天 / 次，每个周期第一天自动将所有设备状态初始化为 “待巡检”，同步生成周期巡检清单。',
        '管理员 7 天内完成实地巡检，扫描设备二维码登录系统，根据检查结果将状态更新为 “正常” 或 “故障”，更新时需记录巡检时间、人员及必要备注。',
        '状态为 “故障” 的设备显示在 “待处理故障” 列表，管理员可通过 “一键发布任务” 生成维修单，支持手动或自动分配给维修人员。',
        '扫描二维码可查看设备所有往期巡检记录，包括状态变更、故障及处理情况，支持记录导出。',
        '巡检后 “待巡检” 状态更新为 “正常” 或 “故障”，故障设备维修完成后由维修人员更新状态，等待下一周期重新初始化。'
      ]
    };
  }
};
</script>

<style scoped>
.inspection-rules {
  padding: 20px;
  background-color: #f5f7fa;
  height: 100%;
  box-sizing: border-box;
}
.rules-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}
.rules-list {
  max-height: 84vh;
  overflow-y: auto;
}
.rule-card {
  margin-bottom: 20px;
}
.rule-header {
  font-size: 18px;
  font-weight: 600;
  color: #409EFF;
}
.rule-content {
  font-size: 16px;
  line-height: 1.6;
}
</style>
