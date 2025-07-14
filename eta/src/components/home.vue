<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <div>
      <home_vue1 v-if="isDepartmentOne" />
    </div>
    <div>
      <VideoControlPage v-if="isDepartmentTwo" />
    </div>
  </div>
</template>

<script>
import Home_vue1 from "@/components/home1.vue";
import VideoControlPage from "@/components/home_vue2.vue";

export default {
  name:"home_vue",
  components: {
    Home_vue1,
    VideoControlPage
  },
  computed: {
    // 安全获取用户数据
    userData() {
      return this.$store.state?.admin?.admin?.data?.data || {};
    },

    // 安全获取部门信息
    userDepartment() {
      return this.userData.department || {};
    },

    // 安全获取部门ID
    userDepartmentId() {
      return this.userDepartment.departmentId || null;
    },

    // 安全获取角色信息
    userRole() {
      return this.userData.role || {};
    },

    // 安全获取员工DTO
    userEmployeeDTO() {
      return this.userData.employeeDTO || null;
    },

    // 使用计算属性从 store 中获取 departmentId
    isDepartmentOne() {
      // 如果员工DTO为空，默认显示部门一的内容
      if (this.userEmployeeDTO === null) {
        return true;
      }
      // 部门ID为2或者角色等级为1000时显示部门一的内容
      return (this.userDepartmentId === 2) || (this.userRole.roleLevel === 1000);
    },

    isDepartmentTwo() {
      // 只有部门ID为1时显示部门二的内容
      return this.userDepartmentId === 1;
    }
  }
};
</script>