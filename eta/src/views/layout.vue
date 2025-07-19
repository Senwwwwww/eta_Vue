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
          background-color="transparent"
          text-color="#e6f4ff"
          active-text-color="#00d4ff"
          router
      >
        <el-submenu index="0"  v-if="userRole.roleLevel === 1000 ">
          <!--          这里先简单用roleId-->
          <template slot="title">
            <i class="el-icon-setting"></i>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/layout/usermanage">
            <i class="el-icon-user"></i>
            用户管理
          </el-menu-item>
          <el-menu-item index="/layout/manage">
            <i class="el-icon-s-custom"></i>
            职务管理
          </el-menu-item>
          <el-menu-item index="/layout/manageEmployee">
            <i class="el-icon-s-check"></i>
            员工管理
          </el-menu-item>
        </el-submenu>
        <el-submenu index="1">
          <template slot="title">
            <i class="el-icon-user-solid"></i>
            <span>个人中心</span>
          </template>
          <el-menu-item index="/layout/person">
            <i class="el-icon-s-order"></i>
            个人信息
          </el-menu-item>
        </el-submenu>
        <el-submenu index="2"  v-if="userRole.roleLevel <= 100">
          <template slot="title">
            <i class="el-icon-monitor"></i>
            <span>设备检修</span>
          </template>
          <el-menu-item index="/layout/AttRe" v-if="userDepartmentId !== 1 ">
            <i class="el-icon-document"></i>
            检修记录
          </el-menu-item>
          <el-menu-item index="/layout/AttReGui" v-if="userRole.roleLevel === 1000">
            <i class="el-icon-setting"></i>
            制定检修规则
          </el-menu-item>
          <el-menu-item index="/layout/AttUser" v-if="userRole.roleLevel <= 100">
            <i class="el-icon-view"></i>
            巡检规则
          </el-menu-item>
          <el-menu-item index="/layout/jianxiu" v-if="userDepartmentId === 2 ">
            <i class="el-icon-warning-outline"></i>
            待检修
          </el-menu-item>
          <el-menu-item index="/layout/attendanceChange" v-if="userDepartmentId === 1 ">
            <i class="el-icon-edit-outline"></i>
            修改检修任务状态
          </el-menu-item>
          <el-menu-item index="/layout/instrumentChange" v-if="userDepartmentId === 1 ">
            <i class="el-icon-cpu"></i>
            电力设备管理
          </el-menu-item>
        </el-submenu>
        <el-submenu index="3"   v-if="userRole.roleLevel <= 100">
          <template slot="title">
            <i class="el-icon-chat-dot-square"></i>
            <span >申请管理</span>
          </template>
          <el-menu-item index="/layout/app" v-if="userDepartmentId !== 1 ">
            <i class="el-icon-plus"></i>
            我要申请
          </el-menu-item>
<!--          <el-menu-item index="/layout/appre" v-if="userRole.roleLevel <= 100">申请记录</el-menu-item>-->
          <el-menu-item index="/layout/attendanceManage" v-if="userDepartmentId === 1">
            <i class="el-icon-s-check"></i>
            审批申请
          </el-menu-item>
        </el-submenu>
        <el-submenu index="4"   v-if="userRole.roleLevel <= 100">
          <template slot="title">
            <i class="el-icon-message-solid"></i>
            <span>意见反馈</span>
          </template>
          <el-menu-item index="/layout/feed" v-if="userRole.roleLevel <= 100">
            <i class="el-icon-edit"></i>
            我要反馈
          </el-menu-item>
          <el-menu-item index="/layout/feedre" v-if="userDepartmentId !== 1">
            <i class="el-icon-document-copy"></i>
            反馈记录
          </el-menu-item>
          <el-menu-item index="/layout/feedManage" v-if="userDepartmentId === 1">
            <i class="el-icon-s-comment"></i>
            用户反馈
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
    <div class="right">
      <div class="nav">
        <el-menu
            :default-active="activeIndex"
            class="el-menu-demo"
            mode="horizontal"
            background-color="transparent"
            text-color="#ffffff"
            active-text-color="#ffd700"
            @select="handleSelect"
            router
        >
          <el-menu-item index="/layout/qr">
            <i class="el-icon-camera-solid"></i>
            扫一扫
          </el-menu-item>
          <el-menu-item index="/layout/home">
            <i class="el-icon-s-home"></i>
            返回主页
          </el-menu-item>
          <el-menu-item index="/layout/message">
            <i class="el-icon-s-comment"></i>
            消息中心
          </el-menu-item>
          <el-menu-item index="/layout/help">
            <i class="el-icon-s-opportunity"></i>
            帮助
          </el-menu-item>

          <!-- 退出按钮：设置唯一index，通过事件阻止路由跳转 -->
          <el-menu-item index="/login" @click.prevent="exit">
            <i class="el-icon-switch-button"></i>
            退出
          </el-menu-item>

       <el-submenu index="5" style="color: black;">
            <template slot="title">
              <i class="el-icon-user-solid" ></i>
              <span >{{userName}}</span>
            </template>
            <el-menu-item index="/layout/person" style="color: black;">
              <i class="el-icon-s-order" style="color: black;"></i>
              个人中心
            </el-menu-item>
            <el-menu-item index="/layout/change" style="color: black;">
              <i class="el-icon-key" style="color: black;"></i>
              修改密码
            </el-menu-item>

            <!-- 重新登录：设置唯一index，通过事件阻止路由跳转 -->
            <el-menu-item index="/login" @click.prevent="exit" style="color: black;">
              <i class="el-icon-refresh" style="color: black;"></i>
              重新登录
            </el-menu-item>

            <el-menu-item index="/layout/yuanID" style="color: black;">
              <i class="el-icon-postcard" style="color: black;"></i>
              绑定员工ID
            </el-menu-item>
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

// 电力科技感主题样式
.main {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0a1428 0%, #1a2b47 50%, #0f1b2e 100%);
  overflow: hidden;
  position: relative;


  // 科技感背景效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(24, 144, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(82, 196, 26, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: -1;
  }


  .left {
    width: 260px;
    background: linear-gradient(180deg, #1e3a5f 0%, #0f1b2e 100%);
    color: #e6f4ff;
    padding: 0;
    border-right: 2px solid rgba(0, 212, 255, 0.3);
    position: relative;
    z-index: 1;
    box-shadow: 5px 0 20px rgba(0, 0, 0, 0.3);


    // 侧边栏发光效果
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 1px;
      height: 100%;
      background: linear-gradient(to bottom, 
        transparent 0%, 
        rgba(0, 212, 255, 0.8) 20%, 
        rgba(0, 212, 255, 0.8) 80%, 
        transparent 100%);
      box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
    }
  


    .logo {
      width: 100%;
      color: #fff;
      font-size: 28px;
      text-align: center;
      margin: 30px 0;
      font-weight: 700;
      position: relative;
      background: linear-gradient(45deg, #00d4ff, #1890ff, #52c41a);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
      letter-spacing: 4px;
      
      // 添加电力图标
      &::before {
        content: '⚡';
        position: absolute;
        left: 50%;
        top: -40px;
        transform: translateX(-50%);
        font-size: 32px;
        color: #ffd700;
        text-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
        animation: pulse-electric 2s infinite;
      }
      // 底部装饰线
      &::after {
        content: '';
        position: absolute;
        bottom: -15px;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 3px;
        background: linear-gradient(90deg, transparent, #00d4ff, transparent);
        border-radius: 2px;
        box-shadow: 0 0 10px rgba(0, 212, 255, 0.7);
      }
    }
  

    // 菜单样式优化
    ::v-deep .el-menu {
      background: transparent !important;
      border: none !important;
      
      .el-submenu {
        .el-submenu__title {
          background: transparent !important;
          color: #e6f4ff !important;
          border-radius: 8px;
          margin: 5px 15px;
          padding: 0 20px !important;
          height: 50px !important;
          line-height: 50px !important;
          transition: all 0.3s ease;
          position: relative;
          
          
          &:hover {
            background: linear-gradient(90deg, rgba(0, 212, 255, 0.2), rgba(24, 144, 255, 0.1)) !important;
            color: #00d4ff !important;
            transform: translateX(5px);
            box-shadow: 0 5px 15px rgba(0, 212, 255, 0.3);
          }
          

          i {
            color: #00d4ff;
            margin-right: 12px;
            font-size: 16px;
          }
        }
        

        &.is-active > .el-submenu__title {
          background: linear-gradient(90deg, rgba(0, 212, 255, 0.3), rgba(24, 144, 255, 0.2)) !important;
          color: #00d4ff !important;
        }
      }


      .el-menu-item {
        background: transparent !important;
        color: #b3d9ff !important;
        border-radius: 6px;
        margin: 3px 25px 3px 35px;
        padding: 0 20px !important;
        height: 42px !important;
        line-height: 42px !important;
        transition: all 0.3s ease;
        border-left: 3px solid transparent;
      
        
        &:hover {
          background: linear-gradient(90deg, rgba(0, 212, 255, 0.15), rgba(24, 144, 255, 0.08)) !important;
          color: #00d4ff !important;
          transform: translateX(8px);
          border-left-color: #00d4ff;
          box-shadow: 0 3px 10px rgba(0, 212, 255, 0.2);
        }



        &.is-active {
          background: linear-gradient(90deg, rgba(0, 212, 255, 0.25), rgba(24, 144, 255, 0.15)) !important;
          color: #ffffff !important;
          border-left-color: #00d4ff;
          box-shadow: 0 3px 15px rgba(0, 212, 255, 0.4);
        }
      }
    }
  }

  .right {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #f8faff 0%, #e6f4ff 100%);
    position: relative;
    // z-index: 0;

    .nav {
      height: 70px;
      background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 30px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      position: relative;

      // 顶部发光线条
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, 
          rgba(0, 212, 255, 0.8), 
          rgba(24, 144, 255, 0.8), 
          rgba(0, 212, 255, 0.8));
        box-shadow: 0 0 10px rgba(0, 212, 255, 0.6);
      }

      ::v-deep .el-menu {
        background: transparent !important;
        border: none !important;

        .el-menu-item {
          color: #ffffff !important;
          border-radius: 8px;
          margin: 0 8px;
          padding: 0 16px !important;
          height: 45px !important;
          line-height: 45px !important;
          transition: all 0.3s ease;
          position: relative;
          
          &:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            color: #ffffff !important;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          }

          &.is-active {
            background: rgba(255, 255, 255, 0.25) !important;
            color: #ffd700 !important;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
          }

          i {
            margin-right: 8px;
            font-size: 16px;
          }
        }

        .el-submenu {
          .el-submenu__title {
            color: #ffffff !important;
            border-radius: 8px;
            margin: 0 8px;
            padding: 0 16px !important;
            height: 45px !important;
            line-height: 45px !important;
            transition: all 0.3s ease;
            
            &:hover {
              background: rgba(255, 255, 255, 0.2) !important;
              color: #ffffff !important;
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }

            i {
              margin-right: 8px;
              font-size: 16px;
            }
          }

          .el-menu-item {
            background: rgba(0, 0, 0, 0.8) !important;
            
            &:hover {
              background: rgba(0, 212, 255, 0.8) !important;
            }
          }
        }
      }

      // 退出按钮特殊样式
      ::v-deep .el-menu-item[index="/login"] {
        background: linear-gradient(45deg, #ff4d4f, #ff7875) !important;
        color: #ffffff !important;
        margin-left: 20px;
        
        &:hover {
          background: linear-gradient(45deg, #ff7875, #ff4d4f) !important;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 77, 79, 0.4);
        }
      }
    }

    .content {
      flex: 1;
      padding: 25px;
      background: linear-gradient(135deg, #f8faff 0%, #e6f4ff 100%);
      position: relative;
      overflow: auto;

      // 内容区域微妙纹理
      &::before {
        z-index: -1;
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(0, 212, 255, 0.02) 2px,
            rgba(0, 212, 255, 0.02) 4px
          );
        pointer-events: none;
      }
      }
    }
  }

// 电力脉冲动画
@keyframes pulse-electric {
  0%, 100% {
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
    transform: translateX(-50%) scale(1);
  }
  50% {
    text-shadow: 0 0 30px rgba(255, 215, 0, 1), 0 0 40px rgba(255, 215, 0, 0.5);
    transform: translateX(-50%) scale(1.1);
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .main .left {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .main {
    .left {
      width: 200px;
      
      .logo {
        font-size: 24px;
        margin: 20px 0;
      }
    }
    
    .right .nav {
      height: 60px;
      padding: 0 15px;
    }
  }
}
</style>


