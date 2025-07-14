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
import {mapState} from "vuex";

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
  computed: {
    // 添加计算属性确保响应性
    userRole() {
      return this.$store.state.admin?.admin?.data?.data?.role || {}
    },
    userName() {
      return this.$store.state.admin?.admin?.data?.data?.name || ''
    },
    // 添加安全的department计算属性
    userDepartment() {
      return this.$store.state.admin?.admin?.data?.data?.department || {}
    },
    // 添加安全的departmentId计算属性
    userDepartmentId() {
      return this.$store.state.admin?.admin?.data?.data?.department?.departmentId || null
    }
  },
  created() {
    // this.crea();
  },
  mounted() {
    if(localStorage.getItem("loginID")) {
      this.$setToken()
      // 获取用户ID
      instance.get("user/name/" + localStorage.getItem('loginID'),this.username).then(res => {
        this.$store.commit("setAdmin", res)
        // 获取用户名称
        this.$setToken()
        instance.get("user/id/" + this.$store.state.admin.admin.data.data.userId,this.$store.state.admin.admin.data.data.userId).then(res1 => {
          if (res1.data.data.name != null) {
            this.$store.commit("setAdmin", res1)
            console.log(res1)
            this.$setToken()
            instance.get("user/personalInfo/id/" + this.$store.state.admin.admin.data.data.userId,this.$store.state.admin.admin.data.data.userId).then(res2 => {
              this.$store.commit("setAdmin", res2)
              console.log(res2)
              sessionStorage.setItem("flag","true")
              this.$store.commit("setAdmin", res2)
              this.$store.commit("setRole",res2.data.data.role)
              this.$store.commit("setName",res2.data.data.name)
              if(res2.data.data.department!=null) {
                this.$store.commit("setDepartment", res2.data.data.department)
              }
              this.$store.commit("setBioinformatics",res2.data.data.bioinformatics)
              this.$store.commit("setEmployeeDTO",res2.data.data.employeeDTO)
              this.$store.commit("setPersonalInfo",res2.data.data.personalInformationDTO)

            })
                .catch(err => {
                  // this.$message.error("请稍后再试")
                  sessionStorage.setItem("flag","false")
                })

          }else{
            this.$refs.setUsernameDialog.open()
          }
        })
            .catch(async err => {
              // sessionStorage.getItem("loginID")
              if (this.$store.state.admin.admin.data) {
                this.$message.warning("请设置用户名")
              }
            })
      })
          .catch(err => {
            this.$router.push('/login')
          })
      //设置等待时间
      // 获取用户信息

    }else{
      this.$message.error("请先登录再访问管理页面")
      this.$router.push('/login')
    }

  },
  methods: {

    ...mapMutations('admin', ['setAdmin']),
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    handleSelect(key, keyPath) {
      // // 如果是退出相关的操作，不进行路由跳转
      // if (key === 'login' || key === 'relogin') {
      //   return;
      // }
      // console.log(key, keyPath);
    },
    exit(event) {
      // 阻止默认的路由跳转行为
      // if (event) {
      //   event.preventDefault();
      //   event.stopPropagation();
      // }

      // 退出登录
      // 清除用户数据
      instance.post('/user/logout',).then(response => {
        if(response.data.success){
          this.$message.success("退出成功")
          this.$router.push('/login')
          this.$store.commit("setAdmin", null)
          // 删除 token
          localStorage.removeItem("token");
          // 清除 Vuex 状态（如你存了用户信息）
          this.$store.commit("setAdmin", null);
          this.$store.commit("setEmployeeDTO", null);
          this.$store.commit("setPersonalInfo", null);
          this.$store.commit("setRole", null);
          this.$store.commit("setName", null);
          this.$store.commit("setDepartment", null);
          this.$store.commit("setBioinformatics", null);
        }else {
          this.$message.error(response.data.errorMsg)
        }
      })

    },
    exit1(event){
      // 阻止默认的路由跳转行为
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      if(sessionStorage.getItem('token') !==null) {
        sessionStorage.removeItem('token')
      }
      // 重新登录不清空password和username
      this.$message.success("退出成功")
      // 退出登录
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
        <el-submenu index="0"  v-if="userRole.roleLevel === 1000 ">
          <!--          这里先简单用roleId-->
          <template slot="title">
            <i class="el-icon-setting"></i>
            <span>管理</span>
          </template>
          <el-menu-item index="/layout/usermanage">用户管理</el-menu-item>
          <el-menu-item index="/layout/manage">职务管理</el-menu-item>
          <el-menu-item index="/layout/manageEmployee">员工管理</el-menu-item>
        </el-submenu>
        <el-submenu index="1">
          <template slot="title">
            <i class="el-icon-user"></i>
            <span>个人中心</span>
          </template>
          <el-menu-item index="/layout/person">个人中心</el-menu-item>
        </el-submenu>
        <el-submenu index="2"  v-if="userRole.roleLevel <= 100">
          <template slot="title">
            <i class="el-icon-date"></i>
            <span>检修</span>
          </template>
          <el-menu-item index="/layout/AttRe" v-if="userDepartmentId !== 1 ">检修记录</el-menu-item>
          <el-menu-item index="/layout/AttReGui" v-if="userRole.roleLevel === 1000">制定检修规则</el-menu-item>
          <el-menu-item index="/layout/AttUser" v-if="userRole.roleLevel <= 100">检修规则</el-menu-item>
          <el-menu-item index="/layout/jianxiu" v-if="userDepartmentId === 2 ">待检修</el-menu-item>
          <el-menu-item index="/layout/attendanceChange" v-if="userDepartmentId === 1 ">修改检修任务状态</el-menu-item>
          <el-menu-item index="/layout/instrumentChange" v-if="userDepartmentId === 1 ">电力器材管理</el-menu-item>
        </el-submenu>
        <el-submenu index="3"   v-if="userRole.roleLevel <= 100">
          <template slot="title">
            <i class="el-icon-chat-dot-square"></i>
            <span >申请</span>
          </template>
          <el-menu-item index="/layout/app" v-if="userDepartmentId !== 1 ">我要申请</el-menu-item>
<!--          <el-menu-item index="/layout/appre" v-if="userRole.roleLevel <= 100">申请记录</el-menu-item>-->
          <el-menu-item index="/layout/attendanceManage" v-if="userDepartmentId === 1">审批申请</el-menu-item>
        </el-submenu>
        <el-submenu index="4"   v-if="userRole.roleLevel <= 100">
          <template slot="title">
            <i class="el-icon-collection-tag"></i>
            <span>意见反馈</span>
          </template>
          <el-menu-item index="/layout/feed" v-if="userRole.roleLevel <= 100">我要反馈</el-menu-item>
          <el-menu-item index="/layout/feedre" v-if="userDepartmentId !== 1">反馈记录</el-menu-item>
          <el-menu-item index="/layout/feedManage" v-if="userDepartmentId === 1">用户反馈</el-menu-item>
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
          <el-menu-item index="/layout/qr"><i class="el-icon-camera-solid"></i>扫一扫</el-menu-item>
          <el-menu-item index="/layout/home"><i class="el-icon-s-home"></i>返回主页</el-menu-item>
          <el-menu-item index="/layout/message"><i class="el-icon-s-comment"></i>消息中心</el-menu-item>
          <el-menu-item index="/layout/help"><i class="el-icon-s-opportunity"></i>帮助</el-menu-item>

          <!-- 退出按钮：设置唯一index，通过事件阻止路由跳转 -->
          <el-menu-item index="/login" @click.prevent="exit">
            <i class="el-icon-switch-button"></i>退出
          </el-menu-item>

          <el-submenu index="5">
            <template slot="title"><i class="el-icon-user-solid"></i>{{userName}}</template>
            <el-menu-item index="/layout/person">个人中心</el-menu-item>
            <el-menu-item index="/layout/change">修改密码</el-menu-item>

            <!-- 重新登录：设置唯一index，通过事件阻止路由跳转 -->
            <el-menu-item index="/login" @click.prevent="exit">重新登录</el-menu-item>

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
  overflow: hidden;

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

      // 针对退出按钮的特殊样式，防止高亮
      .el-menu-item[index="logout"],
      .el-menu-item[index="relogin"] {
        &.is-active {
          background-color: transparent !important;
          color: #ffffff !important;
        }

        &:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
      }
    }

    .content {
      flex: 1;
      //设置大小为99%
      padding: 20px;
      background-color: #f9fafc;
    }
  }
}
</style>
