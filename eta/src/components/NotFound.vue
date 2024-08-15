<template>
  <div class="not-found-page">
    <el-card class="box-card">
      <div class="not-found-content">
        <el-image
            :src="require('@/assets/404.png')"
            fit="contain"
            class="not-found-image"
        ></el-image>
        <div class="not-found-text">
          <p>抱歉，您访问的页面不存在</p>
          <el-button type="primary" @click="goHome">返回主页</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name:"NotFound",
  methods: {
    goHome() {
      this.$router.push("/layout/home");
    },
  },
};
</script>

<style scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f9fafc;
}

.box-card {
  padding: 40px;
  text-align: center;
}

.not-found-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.not-found-image {
  width: 300px;
  margin-bottom: 20px;
}

.not-found-text {
  text-align: center;
}

.not-found-text h1 {
  font-size: 100px;
  margin: 0;
  color: #409eff;
}

.not-found-text p {
  font-size: 18px;
  margin: 10px 0 30px;
  color: #606266;
}
</style>
