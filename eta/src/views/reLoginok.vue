<template>
  <div class="reset-success-container">
    <fish/>
    <el-card class="box-card" id ="q1" shadow="always">
        <fish/>
        <el-col :sm="100" :lg="1000">
          <el-result icon="success" title="成功提示" subTitle="您可以重新登录系统验证您的新密码">
            <template slot="extra">
              <el-button type="primary" size="medium" @click="www">返回</el-button>
            </template>
          </el-result>
        </el-col>

    </el-card>
  </div>
</template>

<script>
import Fish from "@/components/Fish.vue";

export default {
  name: "ResetPasswordSuccess",
  components: {Fish},
  methods: {
    www() {
      // Redirect to login page
      window.location.href ='/login';
    },
  }
}
</script>

<style scoped>
.reset-success-container {
  width: 400px;
  margin: 100px auto;
  text-align: center;
}

.box-card {
  padding: 20px;
  box-shadow: 0 0  rgba(0, 0, 0, 0.1);
}

#q1{
  text-align: center;
}
</style>
