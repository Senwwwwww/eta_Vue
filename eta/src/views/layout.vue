<script>
import Home_vue from "@/components/home.vue";
import PersonalInfo from "@/components/PersonalInfo.vue";
import AttendanceRecords from "@/components/AttendanceRecords.vue";
import ApplyPage from "@/components/ApplyPage.vue";
import ApplicationRecords from "@/components/ApplicationRecords.vue";
import Feedback from "@/components/Feedback.vue";
import FeedbackRecords from "@/components/FeedbackRecords.vue";
// 导入映射函数
import {instance} from "@/util/request";
import SetUsernameDialog from "@/components/SetUsernameDialog.vue";
import {mapMutations} from "vuex";

export default {
  components: {
    SetUsernameDialog,
    FeedbackRecords, Feedback, ApplicationRecords, ApplyPage, AttendanceRecords, PersonalInfo, Home_vue},
  data() {
    return {
      activeIndex: '1',
      activeIndex2: '1',
      username: localStorage.getItem('loginID')
    };
  },

  created() {
    if(localStorage.getItem("loginID")) {
      // 获取用户ID
      instance.get("user/name/" + localStorage.getItem('loginID'),this.username).then(res => {
        this.setAdmin(res);
        console.log(this.$store.state.admin)
      }).catch(err => {
        this.$message.error("请先登录再访问管理页面")
      })

      // 获取用户名称
      instance.get("user/id/" +this.$store.state.admin.data.userId).then(res => {
        if(res.data.name) {
          this.$store.commit("setName", res.data.name)
        }
      })
          .catch(async err => {
            // sessionStorage.getItem("loginID")
            if (this.$store.state.username) {
              this.$message.warning("请设置用户名")
              // 在此处应用一个弹窗，要求用户设置用户名
              this.$refs.setUsernameDialog.open(); // 打开弹窗
            }
          })
    }else{
      this.$message.error("请先登录再访问管理页面")
      this.$router.push('/login')
    }
  },
  methods: {
    // 导入vuex登录账号方法
    ...('admin',['setAdmin']),
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    exit(){
      // 退出登录
      sessionStorage.removeItem('token')
      localStorage.removeItem("loginID")
      // 如果不为空则移除
      if(localStorage.getItem("password") !== null){
        localStorage.removeItem("password")
      }
      this.$router.push('/login')
    },
  }
};
</script>

<template>
  <div class="main">
    <SetUsernameDialog ref="setUsernameDialog"  />
    <div class="left">
      <div class="logo">简・用</div>
      <el-menu
          default-active="2"
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
          background-color="#2d3a4b"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
      >
        <el-submenu index="0">
        <template slot="title">
          <i class=""></i>
          <span>角色管理</span>
        </template>
        <el-menu-item index="/layout/">用户管理</el-menu-item>
        <el-menu-item index="/layout/manage">角色管理</el-menu-item>
        </el-submenu>
        <el-submenu index="1">
          <template slot="title">
            <i class="el-icon-user"></i>
            <span>个人中心</span>
          </template>
          <el-menu-item index="/layout/person">个人中心</el-menu-item>
        </el-submenu>
        <el-submenu index="2">
          <template slot="title">
            <i class="el-icon-date"></i>
            <span>考勤</span>
          </template>
          <el-menu-item index="/layout/AttRe">本月考勤</el-menu-item>
          <el-menu-item index="/layout/AttReGui">考勤规则</el-menu-item>
        </el-submenu>
        <el-submenu index="3">
          <template slot="title">
            <i class="el-icon-chat-dot-square"></i>
            <span>申请</span>
          </template>
          <el-menu-item index="/layout/app">我要申请</el-menu-item>
          <el-menu-item index="/layout/appre">申请记录</el-menu-item>
        </el-submenu>
        <el-submenu index="4">
          <template slot="title">
            <i class="el-icon-collection-tag"></i>
            <span>意见反馈</span>
          </template>
          <el-menu-item index="/layout/feed">我要反馈</el-menu-item>
          <el-menu-item index="/layout/feedre">反馈记录</el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
    <div class="right">
      <div class="nav">
        <el-menu
            :default-active="activeIndex"
            class="el-menu-demo"
            mode="horizontal"
            background-color="#409EFF"
            text-color="#ffffff"
            active-text-color="#ffd04b"
            @select="handleSelect"
            router
        >
          <el-menu-item index="/layout/home"><i class="el-icon-s-home"></i>返回主页</el-menu-item>
          <el-menu-item index="/layout/message"><i class="el-icon-s-comment"></i>消息中心</el-menu-item>
          <el-menu-item index="/layout/help"><i class="el-icon-s-opportunity"></i>帮助</el-menu-item>
          <el-menu-item index="/login"><i class="el-icon-switch-button"></i>退出</el-menu-item>
          <el-submenu index="5">
            <template slot="title"><i class="el-icon-user-solid"></i>{{this.$store.state.admin.name}}</template>
            <el-menu-item index="/layout/person">个人中心</el-menu-item>
            <el-menu-item index="/layout/change">修改密码</el-menu-item>
            <el-menu-item index="5-3" @click = "exit">重新登录</el-menu-item>
            <el-menu-item index="/layout/yuanID">绑定员工ID</el-menu-item>
          </el-submenu>
        </el-menu>
      </div>
      <div class="content">
        <router-view/>
<!--        <home_vue/>-->
<!--        <PersonalInfo/>-->
<!--        <AttendanceRecords/>-->
<!--        <ApplyPage/>-->
<!--        <ApplicationRecords/>-->
<!--        <Feedback/>-->
<!--        <FeedbackRecords/>-->
      </div>
    </div>
  </div>

</template>

<style scoped lang="scss">
.main {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;

  .left {
    width: 220px;
    background-color: #2d3a4b;
    color: #bfcbd9;
    padding: 20px 10px;

    .logo {
      width: 100%;
      color: #fff;
      font-size: 24px;
      text-align: center;
      margin-bottom: 20px;
      font-weight: bold;
    }
  }

  .right {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #fff;

    .nav {
      height: 60px;
      background-color: #409eff;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 20px;

      .el-menu-item,
      .el-submenu__title {
        margin-left: 20px;
      }
    }

    .content {
      flex: 1;
      padding: 20px;
      background-color: #f9fafc;
    }
  }
}
</style>
