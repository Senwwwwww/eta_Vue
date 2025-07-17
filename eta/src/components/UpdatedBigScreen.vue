
<template>
  <div
    class="maintenance-records"
    tabindex="0"
    @keydown="handleKeydown"
  >
    <!-- 页面头部 -->
    <div class="header-section">
      <div class="title-section">
        <h2 class="page-title">
          <i class="el-icon-s-tools"></i>
          我的检修任务
        </h2>
        <p class="page-subtitle">查看并处理分配给我的待检修任务</p>
      </div>
      <div class="stats-section">
        <div class="stat-item" v-for="(value, label) in stats" :key="label">
          <div class="stat-number">{{ value }}</div>
          <div class="stat-label">{{ label }}</div>
        </div>
      </div>
    </div>

    <!-- 控制区 -->
    <div class="controls-section">
      <el-select
        v-model="statusFilter"
        placeholder="筛选状态"
        size="small"
        clearable
        @change="handleStatusFilter"
        style="width: 120px; margin-right: 10px; z-index: 9999;"
        :popper-append-to-body="false"
        popper-class="status-filter-popper"
      >
        <el-option label="全部" value=""></el-option>
        <el-option label="待维修" value="待维修"></el-option>
        <el-option label="维修中" value="维修中"></el-option>
        <el-option label="已完成" value="已完成"></el-option>
      </el-select>

      <el-button
        size="small"
        icon="el-icon-refresh"
        @click="refreshData"
      >
        刷新
      </el-button>

      <el-button
        size="small"
        class="return-home-btn"
        type="danger"
        @click="goToHomePage"
      >
        返回主页
      </el-button>
    </div>

    <!-- 摄像头视图区 -->
    <div class="camera-grid">
      <div
        class="camera-view"
        v-for="(camera, index) in cameras"
        :key="index"
        :class="{ active: index === activeCameraIndex }"
        @click="selectCamera(index)"
      >
        <div class="camera-title">摄像头 {{ index + 1 }}</div>
        <div class="camera-feed">{{ camera }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BigScreenMaintenance",
  data() {
    return {
      totalTasks: 120,
      pendingTasks: 30,
      workingTasks: 45,
      completedTasks: 45,
      statusFilter: "",
      cameras: ["A", "B", "C", "D"],
      activeCameraIndex: null,
    };
  },
  computed: {
    stats() {
      return {
        "总任务数": this.totalTasks,
        "待维修": this.pendingTasks,
        "维修中": this.workingTasks,
        "已完成": this.completedTasks,
      };
    },
  },
  methods: {
    handleStatusFilter() {
      console.log("筛选状态为：", this.statusFilter);
    },
    refreshData() {
      console.log("刷新数据");
    },
    goToHomePage() {
      this.$message.success("返回主页");
    },
    selectCamera(index) {
      this.activeCameraIndex = index;
    },
    handleKeydown(event) {
      if (this.activeCameraIndex !== null) {
        console.log(`键盘输入: "${event.key}" 发送到摄像头 ${this.activeCameraIndex + 1}`);
      }
    },
  },
  mounted() {
    // 确保键盘监听可用
    this.$el.focus();
  },
};
</script>

<style scoped>
.maintenance-records {
  padding: 20px;
  outline: none;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
}

.title-section .page-title {
  font-size: 24px;
  margin: 0;
}

.title-section .page-subtitle {
  font-size: 14px;
  color: #666;
}

.stats-section {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.controls-section {
  margin: 20px 0;
}

.return-home-btn {
  background: red;
  color: white;
  border: none;
}

.camera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.camera-view {
  border: 2px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  background: #f4f4f4;
  transition: border-color 0.3s ease;
  cursor: pointer;
}

.camera-view.active {
  border-color: #409EFF;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}

.camera-title {
  font-weight: bold;
  margin-bottom: 8px;
}
</style>
