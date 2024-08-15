<template>
  <div class="home-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>欢迎, {{ username }}</span>
          </div>
          <div class="home-content">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card class="info-card">
                  <div class="info-header">
                    <i class="el-icon-s-home info-icon"></i>
                    <span class="info-title">个人中心</span>
                  </div>
                  <div class="info-body">
                    <el-button type="primary" @click="goToPage('个人中心')">进入</el-button>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="info-card">
                  <div class="info-header">
                    <i class="el-icon-date info-icon"></i>
                    <span class="info-title">考勤记录</span>
                  </div>
                  <div class="info-body">
                    <el-button type="primary" @click="goToPage('考勤记录')">查看</el-button>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="info-card">
                  <div class="info-header">
                    <i class="el-icon-chat-dot-square info-icon"></i>
                    <span class="info-title">申请记录</span>
                  </div>
                  <div class="info-body">
                    <el-button type="primary" @click="goToPage('申请记录')">查看</el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <el-row :gutter="20" class="stat-section">
              <el-col :span="8">
                <el-card class="stat-card">
                  <div class="stat-title">本月打卡天数</div>
                  <div class="stat-value">{{ attendanceDays }}</div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="stat-card">
                  <div class="stat-title">未处理申请</div>
                  <div class="stat-value">{{ pendingApplications }}</div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="stat-card">
                  <div class="stat-title">反馈数量</div>
                  <div class="stat-value">{{ feedbackCount }}</div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '张三',  // 这里你可以动态获取用户名
      attendanceDays: 20,  // 示例数据，可以替换为真实数据
      pendingApplications: 3,
      feedbackCount: 5,
    };
  },
  methods: {
    goToPage(pageName) {
      this.$router.push({ name: pageName });
    },
  },
};
</script>

<style scoped>
.home-page {
  padding: 20px;
  background-color: #f9fafc;
}

.home-content {
  margin-top: 20px;
}

.info-card {
  text-align: center;
}

.info-header {
  font-size: 18px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-icon {
  font-size: 24px;
  margin-right: 8px;
}

.stat-section {
  margin-top: 20px;
}

.stat-card {
  text-align: center;
  padding: 30px 0;
  background-color: #f5f7fa;
}

.stat-title {
  font-size: 16px;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}
</style>
