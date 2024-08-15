<template>
  <div class="personal-info">
    <el-row :gutter="20">
      <!-- Left side: Personal Information -->
      <el-col :span="12">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
            <el-link class="view-link" @click="viewDetails">查看</el-link>
          </div>
          <div class="info-content">
            <div class="avatar-container">
              <el-avatar :size="100" :src="require('@/assets/logo.png')"></el-avatar>
            </div>
            <div id="person">
              <p>用户ID: {{userInfo.userID}}</p>
              <p>员工ID: {{userInfo.ygID}}</p>
              <p>部门: {{userInfo.bumeng}}</p>
              <p>姓名: {{userInfo.name}}</p>
              <p>性别: {{userInfo.sex}}</p>
              <p>联系方式: {{userInfo.email}}</p>
              <p>出生日期: {{userInfo.birthday}}</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Right side -->
      <el-col :span="12">
        <el-row :gutter="20">
          <!-- Attendance Visualization -->
          <el-col :span="24">
            <el-card class="box-card" shadow="hover">
              <div slot="header" class="clearfix">
                <span>考勤可视化</span>
              </div>
              <div class="attendance-visualization">
                <el-carousel :interval="4000" arrow="always">
                  <el-carousel-item v-for="item in 3" :key="item">
                    <img src="https://via.placeholder.com/400x200" alt="考勤图表" />
                  </el-carousel-item>
                </el-carousel>
              </div>
            </el-card>
          </el-col>

          <!-- Unread Reminders -->
          <el-col :span="24">
            <el-card class="box-card" shadow="hover">
              <div slot="header" class="clearfix">
                <span>未读提醒</span>
                <el-link class="view-link" @click="viewMessages">查看</el-link>
              </div>
              <div class="reminder-content">
                <p>xxxxxxxxxxxxxxxxxxxxxxxx</p>
                <p>xxxxxxxxxxxxxxxxxxxxxxxx</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getUserInfo } from "@/api/user"; // Assume you have an API call to get user info

export default {
  name: "PersonalInfo",
  data() {
    return {
      userInfo: {
        userID: "",
        ygID: "",
        bumeng: "",
        name: "",
        sex: "",
        email: "",
        birthday: ""
      }
    };
  },
  created() {
    this.fetchUserInfo();
  },
  methods: {
    fetchUserInfo() {
      getUserInfo()
          .then(response => {
            this.userInfo = response.data;
          })
          .catch(error => {
            this.$message.error("获取个人信息失败");
          });
    },
    viewDetails() {
      this.$message("查看个人信息详情");
    },
    viewMessages() {
      this.$message("查看未读提醒");
    }
  }
};
</script>

<style scoped>
.personal-info {
  padding: 20px;
  background-color: #f9fafc;
}

.el-card {
  margin-bottom: 20px;
}

.avatar-container {
  text-align: center;
  margin-bottom: 20px;
}

.info-content p {
  margin: 5px 0;
  text-align: left;
}

.info-content {
  height: 57vh;
}

.attendance-visualization {
  text-align: center;
}

.reminder-content p {
  margin: 5px 0;
}

.view-link {
  float: right;
}
</style>
