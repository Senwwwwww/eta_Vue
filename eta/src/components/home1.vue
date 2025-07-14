<template>
  <div class="home-page">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>我的首页</span>
      </div>
      <div class="card-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="hover" class="info-card">
              <div class="card-header">未读提醒</div>
              <div class="card-body">
                <el-link type="primary" @click="goToMessageCenter">查看消息中心</el-link>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="hover" class="info-card">
              <div class="card-header">个人信息</div>
              <div class="card-body">
                <el-link type="primary" @click="goToPersonalInfo">查看个人信息</el-link>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "home_vue1",
  methods: {
    goToMessageCenter() {
      this.$router.push('/layout/message');
    },
    goToPersonalInfo() {
      this.$router.push('/layout/person');
    }
  }
};
</script>

<style scoped>
.home-page {
  padding: 20px;
  background-color: #f9fafc;
}

.card-content {
  margin-top: 20px;
}

.info-card {
  background-color: #ffffff;
  padding: 20px;
}

.card-header {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.card-body {
  font-size: 16px;
}
</style>
