<template>
  <div class="home-page">


    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>我的首页</span>
      </div>

      <!-- 炫酷的智能视频监控系统按钮 -->
      <div class="monitor-button-container">
        <button class="monitor-btn" @click="goToMonitorSystem">
          <div class="btn-bg"></div>
          <div class="btn-content">
            <div class="icon-wrapper">
              <div class="monitor-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M21,16V4H3V16H21M21,2A2,2 0 0,1 23,4V16A2,2 0 0,1 21,18H14L16,20V21H8V20L10,18H3C1.89,18 1,17.1 1,16V4C1,2.89 1.89,2 3,2H21M5,6H19V14H5V6Z"/>
                </svg>
              </div>
              <div class="pulse-ring"></div>
            </div>
            <span class="btn-text">智能视频监控系统</span>
            <div class="btn-subtitle">INTELLIGENT VIDEO MONITORING</div>
          </div>
          <div class="btn-glow"></div>
        </button>
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
    },
    goToMonitorSystem() {
      // 跳转到智能视频监控系统页面
      this.$router.push('/monitor'); // 根据实际路由调整
    }
  }
};
</script>

<style scoped>
.home-page {
  padding: 20px;
  background-color: #f9fafc;
}

/* 炫酷监控按钮样式 */
.monitor-button-container {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.monitor-btn {
  position: relative;
  width: 350px;
  height: 100px;
  border: none;
  border-radius: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
  outline: none;
}

.monitor-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
}

.monitor-btn:active {
  transform: translateY(-1px);
}

.btn-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #00d4ff 0%, #108ee9 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.monitor-btn:hover .btn-bg {
  opacity: 1;
}

.btn-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ffffff;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  gap: 15px;
}

.icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.monitor-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  animation: float 3s ease-in-out infinite;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.btn-text {
  font-size: 18px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
}

.btn-subtitle {
  position: absolute;
  bottom: 15px;
  right: 20px;
  font-size: 10px;
  opacity: 0.7;
  letter-spacing: 2px;
  font-weight: 300;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.monitor-btn:hover .btn-glow {
  transform: translateX(100%);
}

/* 动画效果 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

/* 添加一些粒子效果 */
.monitor-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="1" fill="white" opacity="0.3"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/></circle><circle cx="80" cy="30" r="1" fill="white" opacity="0.3"><animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/></circle><circle cx="40" cy="70" r="1" fill="white" opacity="0.3"><animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite"/></circle></svg>');
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.monitor-btn:hover::before {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .monitor-btn {
    width: 300px;
    height: 80px;
  }

  .btn-text {
    font-size: 16px;
  }

  .btn-subtitle {
    font-size: 8px;
  }

  .monitor-icon {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .monitor-btn {
    width: 280px;
    height: 70px;
  }

  .btn-text {
    font-size: 14px;
  }

  .btn-content {
    gap: 10px;
  }
}

/* 原有样式保持不变 */
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