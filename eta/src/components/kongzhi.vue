<template>
  <div class="monitor-screen" @keydown="handleKeyDown" @keyup="handleKeyUp" tabindex="0" :class="{ 'fullscreen-mode': isFullscreen }">
    <!-- 头部标题栏 -->
    <div class="header-section" :class="{ 'header-minimized': isFullscreen }">
      <div class="header-content">
        <div class="title-section">
          <div class="title-icon">📹</div>
          <h1 class="main-title">智能视频监控系统</h1>
          <div class="subtitle">INTELLIGENT VIDEO MONITORING SYSTEM</div>
        </div>

        <div class="control-section">
          <div class="task-selector">
            <label class="selector-label">检测模式</label>
            <el-select v-model="selectedTaskType" @change="handleTaskTypeChange" class="tech-select" :class="{ 'tech-select-fullscreen': isFullscreen }">
              <el-option label="人员检测" value="detectperson"></el-option>
              <el-option label="缺陷检测" value="detectlost"></el-option>
            </el-select>
          </div>

          <!-- 大屏模式切换按钮 -->
          <el-button
              class="fullscreen-btn"
              @click="toggleFullscreen"
              :type="isFullscreen ? 'warning' : 'info'"
          >
            <i :class="isFullscreen ? 'el-icon-minus' : 'el-icon-full-screen'"></i>
            {{ isFullscreen ? '退出大屏' : '大屏模式' }}
          </el-button>

          <!-- 左侧：返回主页按钮 -->
          <div class="left-section">
            <el-button class="home-btn" @click="goToHome">
              <i class="el-icon-house"></i>
              返回主页
            </el-button>
          </div>

          <el-button class="publish-btn" type="primary" @click="dialogVisible = true">
            <i class="el-icon-plus"></i>
            发布维修任务
          </el-button>
        </div>
      </div>
    </div>

    <!-- 视频监控区域 -->
    <div class="video-grid-section" :class="{ 'video-fullscreen': isFullscreen }">
      <div class="section-header" v-if="!isFullscreen">
        <div class="section-title">实时监控画面</div>
        <div class="section-subtitle">REAL-TIME MONITORING</div>
      </div>

      <!-- 大屏模式下的快捷信息栏 -->
      <div class="fullscreen-info-bar" v-if="isFullscreen">
        <div class="info-item">
          <span class="info-label">检测模式:</span>
          <span class="info-value">{{ selectedTaskType === 'detectperson' ? '人员检测' : '缺陷检测' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">当前时间:</span>
          <span class="info-value">{{ currentTime }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">在线摄像头:</span>
          <span class="info-value">{{ onlineCameraCount }}/{{ cameras.length }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">按 ESC 退出大屏</span>
        </div>
      </div>

      <div class="video-grid" :class="{ 'video-grid-fullscreen': isFullscreen }">
        <div
            v-for="(camera, index) in cameras"
            :key="index"
            class="video-panel"
            :class="{
              'active': camera.status === 'online',
              'video-panel-fullscreen': isFullscreen
            }"
        >
          <div class="panel-header" v-if="!isFullscreen">
            <div class="camera-info">
              <span class="camera-name">{{ camera.name }}</span>
              <span class="camera-location">{{ camera.location }}</span>
            </div>
            <div class="status-indicator">
              <span :class="['status-dot', camera.status]"></span>
              <span class="status-text">{{ camera.statusText }}</span>
            </div>
          </div>

          <div class="video-container" :class="{ 'video-container-fullscreen': isFullscreen }">
            <div v-if="camera.videoUrl" class="video-wrapper">
              <img
                  :src="camera.videoUrl"
                  :alt="camera.name"
                  class="video-stream"
                  :class="{ 'video-stream-fullscreen': isFullscreen }"
                  @error="handleVideoError(index)"
                  @load="handleVideoLoad(index)"
              />
              <div v-if="camera.isLoading" class="loading-overlay">
                <div class="loading-spinner"></div>
                <div class="loading-text">正在加载...</div>
              </div>
            </div>
            <div v-else class="no-video" :class="{ 'no-video-fullscreen': isFullscreen }">
              <div class="no-video-icon">📷</div>
              <div class="no-video-text">暂无视频</div>
            </div>

            <!-- 视频叠加信息 -->
            <div class="video-overlay" :class="{ 'video-overlay-fullscreen': isFullscreen }">
              <div class="overlay-info">
                <div class="camera-title" v-if="isFullscreen">{{ camera.name }} - {{ camera.location }}</div>
                <div class="timestamp" v-if="!isFullscreen">{{ currentTime }}</div>
                <div class="detection-mode" v-if="!isFullscreen">{{ selectedTaskType === 'detectperson' ? '人员检测' : '缺陷检测' }}</div>
                <div class="status-indicator-fullscreen" v-if="isFullscreen">
                  <span :class="['status-dot', camera.status]"></span>
                  <span class="status-text">{{ camera.statusText }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 维修任务列表 - 在大屏模式下隐藏 -->
    <div class="task-section" v-if="!isFullscreen">
      <div class="section-header">
        <div class="section-title">维修任务管理</div>
        <div class="section-subtitle">MAINTENANCE TASK MANAGEMENT</div>
      </div>

      <div class="task-table-container">
        <el-table
            :data="repairList"
            class="tech-table"
            :header-cell-style="{ background: 'rgba(16, 142, 233, 0.1)', color: '#00d4ff' }"
            :row-style="{ background: 'rgba(0, 212, 255, 0.05)' }"
        >
          <el-table-column prop="task" label="维修类型" width="120">
            <template #default="scope">
              <el-tag :type="getTaskTypeColor(scope.row.task)" effect="dark">
                {{ scope.row.task }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="data" label="维修内容" />
          <el-table-column prop="priority" label="优先级" width="100">
            <template #default="scope">
              <el-tag :type="getPriorityColor(scope.row.priority)" effect="dark">
                {{ scope.row.priority }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="submitTime" label="提交时间" width="180" />
          <el-table-column label="操作" width="160">
            <template #default="scope">
              <el-button
                  size="mini"
                  type="primary"
                  class="action-btn"
                  @click="openRepairDialog(scope.row)"
              >
                处理任务
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 发布维修任务对话框 -->
    <el-dialog
        title="发布维修任务"
        :visible.sync="dialogVisible"
        width="500px"
        class="tech-dialog"
    >
      <el-form :model="form" label-width="100px" class="tech-form">
        <el-form-item label="任务标题">
          <el-input v-model="form.title" class="tech-input" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input type="textarea" v-model="form.data" class="tech-input" />
        </el-form-item>
        <el-form-item label="维修类型">
          <el-select v-model="form.task" placeholder="请选择" class="tech-select">
            <el-option label="电力" value="电力" />
            <el-option label="机械" value="机械" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="维修优先级">
          <el-select v-model="form.priority" placeholder="请选择" class="tech-select">
            <el-option label="紧急" value="紧急" />
            <el-option label="高" value="高" />
            <el-option label="普通" value="普通" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
        <el-button type="primary" @click="submitRepairTask" class="submit-btn">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import {instance} from "@/util/request";
import dayjs from 'dayjs';

export default {
  name: 'TechMonitorScreen',
  data() {
    return {
      repairList: [
        {
          task: 'power',
          data: 'Power outage in room 302',
          submitTime: '2023-05-17 10:30:00',
          priority: '紧急',
        },
        {
          task: 'mechanical',
          data: 'Door jammed in room 401',
          submitTime: '2023-05-17 11:00:00',
          priority: '普通',
        },
        {
          task: 'other',
          data: 'Routine maintenance check',
          submitTime: '2023-05-17 12:00:00',
          priority: '低',
        }
      ]
    }
  },
  setup() {
    const dialogVisible = ref(false);
    const selectedTaskType = ref('detectperson');
    const currentTime = ref('');
    const refreshInterval = ref(null);
    const timeInterval = ref(null);
    const isFullscreen = ref(false);

    const form = reactive({
      title: '',
      data: '',
      task: '',
      priority: '',
      employeeDTO: {}
    });

    // 摄像头配置
    const cameras = ref([
      {
        id: 0,
        name: '摄像头1',
        location: '主入口',
        videoUrl: '',
        isLoading: false,
        status: 'offline',
        statusText: '离线'
      },
      {
        id: 1,
        name: '摄像头2',
        location: '走廊A',
        videoUrl: '',
        isLoading: false,
        status: 'offline',
        statusText: '离线'
      },
      {
        id: 2,
        name: '摄像头3',
        location: '走廊B',
        videoUrl: '',
        isLoading: false,
        status: 'offline',
        statusText: '离线'
      },
      {
        id: 3,
        name: '摄像头4',
        location: '后门',
        videoUrl: '',
        isLoading: false,
        status: 'offline',
        statusText: '离线'
      }
    ]);

    // 在线摄像头数量计算
    const onlineCameraCount = computed(() => {
      return cameras.value.filter(camera => camera.status === 'online').length;
    });

    const baseVideoUrl = 'http://192.168.138.102:5000/video_feed';

    const updateTime = () => {
      currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
    };

    const handleTaskTypeChange = (value) => {
      console.log('任务类型切换为:', value);
      startAllVideoStreams();
    };

    // 修复后的全屏切换函数
    const toggleFullscreen = () => {
      if (isFullscreen.value) {
        // 退出全屏模式
        isFullscreen.value = false;
        // 只有当文档确实处于全屏状态时才调用 exitFullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => {
            console.warn('退出全屏失败:', err);
          });
        }
      } else {
        // 进入全屏模式
        isFullscreen.value = true;
        // 检查是否支持全屏API
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(err => {
            console.warn('进入全屏失败:', err);
            // 如果全屏失败，回退状态
            isFullscreen.value = false;
          });
        } else {
          console.warn('浏览器不支持全屏API');
        }
      }
    };

    // 全屏状态变化监听器
    const handleFullscreenChange = () => {
      // 当用户通过其他方式（如按F11或ESC）改变全屏状态时，同步我们的状态
      if (!document.fullscreenElement && isFullscreen.value) {
        isFullscreen.value = false;
      }
    };

    const startAllVideoStreams = () => {
      cameras.value.forEach((camera, index) => {
        startVideoStream(index);
      });
    };

    const startVideoStream = (cameraIndex) => {
      const camera = cameras.value[cameraIndex];
      camera.isLoading = true;
      camera.status = 'connecting';
      camera.statusText = '连接中...';

      const updateVideoUrl = () => {
        const timestamp = Date.now();
        const type = selectedTaskType.value;
        camera.videoUrl = `${baseVideoUrl}?camera=${cameraIndex}&t=${timestamp}&status=${type}`;
      };

      updateVideoUrl();

      // 定期更新视频流
      const interval = setInterval(() => {
        updateVideoUrl();
      }, 100); // 每100ms更新一次

      // 存储interval以便清理
      camera.interval = interval;
    };

    const stopAllVideoStreams = () => {
      cameras.value.forEach(camera => {
        if (camera.interval) {
          clearInterval(camera.interval);
          camera.interval = null;
        }
      });
    };

    const handleVideoLoad = (cameraIndex) => {
      const camera = cameras.value[cameraIndex];
      camera.status = 'online';
      camera.statusText = '在线';
      camera.isLoading = false;
    };

    const handleVideoError = (cameraIndex) => {
      const camera = cameras.value[cameraIndex];
      camera.status = 'error';
      camera.statusText = '连接失败';
      camera.isLoading = false;
    };

    const openRepairDialog = (row) => {
      const time = dayjs(row.submitTime).format('YYYY-MM-DD HH:mm');
      form.title = `${time}的维修任务`;
      form.data = row.data;
      form.task = row.task;
      form.priority = row.priority;
      dialogVisible.value = true;
    };

    // 键盘事件处理
    const keyStates = reactive({});

    const handleKeyDown = (e) => {
      // ESC键退出大屏模式
      if (e.key === 'Escape' && isFullscreen.value) {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // F11键切换大屏模式
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      if (!keyStates[e.key]) {
        keyStates[e.key] = { pressed: true, start: Date.now() };
        sendKeyState(e.key, 'press');
      }
    };

    const handleKeyUp = (e) => {
      const keyInfo = keyStates[e.key];
      if (keyInfo) {
        const duration = Date.now() - keyInfo.start;
        sendKeyState(e.key, 'release', duration);
        delete keyStates[e.key];
      }
    };

    const sendKeyState = async (key, action, duration = 0) => {
      try {
        await axios.post('http://192.168.138.102:5000/key_event', { key, action, duration });
      } catch (e) {
        console.error('键盘事件发送失败', e);
      }
    };

    onMounted(() => {
      updateTime();
      timeInterval.value = setInterval(updateTime, 1000);
      startAllVideoStreams();

      // 添加全屏状态变化监听
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    });

    onUnmounted(() => {
      stopAllVideoStreams();
      if (timeInterval.value) {
        clearInterval(timeInterval.value);
      }

      // 移除全屏状态变化监听
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    });

    return {
      dialogVisible,
      form,
      cameras,
      selectedTaskType,
      currentTime,
      isFullscreen,
      onlineCameraCount,
      handleTaskTypeChange,
      toggleFullscreen,
      handleKeyDown,
      handleKeyUp,
      handleVideoLoad,
      handleVideoError,
      openRepairDialog
    };
  },
  methods: {
    submitRepairTask() {
      instance.post('/api/publictask', this.form)
          .then(response => {
            if(response.data.success){
              this.$message.success('维修任务提交成功');
              this.dialogVisible = false;
            }else{
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch(error => {
            this.$message.error('维修任务提交失败');
          });
    },
    goToHome(){
      // Use:
      this.$router.push('/layout/home').catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          console.error('Navigation error:', err)
        }
      })
    },
    getTaskTypeColor(task) {
      const colorMap = {
        'power': 'warning',
        'mechanical': 'info',
        'other': 'success'
      };
      return colorMap[task] || 'info';
    },
    getPriorityColor(priority) {
      const colorMap = {
        '紧急': 'danger',
        '高': 'warning',
        '普通': 'primary',
        '低': 'info'
      };
      return colorMap[priority] || 'info';
    }
  }
};
</script>



<template>
  <div class="monitor-screen" @keydown="handleKeyDown" @keyup="handleKeyUp" tabindex="0" :class="{ 'fullscreen-mode': isFullscreen }">
    <!-- 头部标题栏 -->
    <div class="header-section" :class="{ 'header-minimized': isFullscreen }">
      <div class="header-content">
        <div class="title-section">
          <div class="title-icon">📹</div>
          <h1 class="main-title">智能视频监控系统</h1>
          <div class="subtitle">INTELLIGENT VIDEO MONITORING SYSTEM</div>
        </div>

        <div class="control-section">
          <div class="task-selector">
            <label class="selector-label">检测模式</label>
            <el-select v-model="selectedTaskType" @change="handleTaskTypeChange" class="tech-select">
              <el-option label="人员检测" value="detectperson"></el-option>
              <el-option label="缺陷检测" value="detectlost"></el-option>
            </el-select>
          </div>

          <!-- 大屏模式切换按钮 -->
          <el-button
              class="fullscreen-btn"
              @click="toggleFullscreen"
              :type="isFullscreen ? 'warning' : 'info'"
          >
            <i :class="isFullscreen ? 'el-icon-minus' : 'el-icon-full-screen'"></i>
            {{ isFullscreen ? '退出大屏' : '大屏模式' }}
          </el-button>

          <!-- 左侧：返回主页按钮 -->
          <div class="left-section">
            <el-button class="home-btn" @click="goToHome">
              <i class="el-icon-house"></i>
              返回主页
            </el-button>
          </div>

          <el-button class="publish-btn" type="primary" @click="dialogVisible = true">
            <i class="el-icon-plus"></i>
            发布维修任务
          </el-button>
        </div>
      </div>
    </div>

    <!-- 视频监控区域 -->
    <div class="video-grid-section" :class="{ 'video-fullscreen': isFullscreen }">
      <div class="section-header" v-if="!isFullscreen">
        <div class="section-title">实时监控画面</div>
        <div class="section-subtitle">REAL-TIME MONITORING</div>
      </div>

      <!-- 大屏模式下的快捷信息栏 -->
      <div class="fullscreen-info-bar" v-if="isFullscreen">
        <div class="info-item">
          <span class="info-label">检测模式:</span>
          <span class="info-value">{{ selectedTaskType === 'detectperson' ? '人员检测' : '缺陷检测' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">当前时间:</span>
          <span class="info-value">{{ currentTime }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">在线摄像头:</span>
          <span class="info-value">{{ onlineCameraCount }}/{{ cameras.length }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">按 ESC 退出大屏</span>
        </div>
      </div>

      <div class="video-grid" :class="{ 'video-grid-fullscreen': isFullscreen }">
        <div
            v-for="(camera, index) in cameras"
            :key="index"
            class="video-panel"
            :class="{
              'active': camera.status === 'online',
              'video-panel-fullscreen': isFullscreen
            }"
        >
          <div class="panel-header" v-if="!isFullscreen">
            <div class="camera-info">
              <span class="camera-name">{{ camera.name }}</span>
              <span class="camera-location">{{ camera.location }}</span>
            </div>
            <div class="status-indicator">
              <span :class="['status-dot', camera.status]"></span>
              <span class="status-text">{{ camera.statusText }}</span>
            </div>
          </div>

          <div class="video-container" :class="{ 'video-container-fullscreen': isFullscreen }">
            <div v-if="camera.videoUrl" class="video-wrapper">
              <img
                  :src="camera.videoUrl"
                  :alt="camera.name"
                  class="video-stream"
                  :class="{ 'video-stream-fullscreen': isFullscreen }"
                  @error="handleVideoError(index)"
                  @load="handleVideoLoad(index)"
              />
              <div v-if="camera.isLoading" class="loading-overlay">
                <div class="loading-spinner"></div>
                <div class="loading-text">正在加载...</div>
              </div>
            </div>
            <div v-else class="no-video" :class="{ 'no-video-fullscreen': isFullscreen }">
              <div class="no-video-icon">📷</div>
              <div class="no-video-text">暂无视频</div>
            </div>

            <!-- 视频叠加信息 -->
            <div class="video-overlay" :class="{ 'video-overlay-fullscreen': isFullscreen }">
              <div class="overlay-info">
                <div class="camera-title" v-if="isFullscreen">{{ camera.name }} - {{ camera.location }}</div>
                <div class="timestamp" v-if="!isFullscreen">{{ currentTime }}</div>
                <div class="detection-mode" v-if="!isFullscreen">{{ selectedTaskType === 'detectperson' ? '人员检测' : '缺陷检测' }}</div>
                <div class="status-indicator-fullscreen" v-if="isFullscreen">
                  <span :class="['status-dot', camera.status]"></span>
                  <span class="status-text">{{ camera.statusText }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 维修任务列表 - 在大屏模式下隐藏 -->
    <div class="task-section" v-if="!isFullscreen">
      <div class="section-header">
        <div class="section-title">维修任务管理</div>
        <div class="section-subtitle">MAINTENANCE TASK MANAGEMENT</div>
      </div>

      <div class="task-table-container">
        <el-table
            :data="repairList"
            class="tech-table"
            :header-cell-style="{ background: 'rgba(16, 142, 233, 0.1)', color: '#00d4ff' }"
            :row-style="{ background: 'rgba(0, 212, 255, 0.05)' }"
        >
          <el-table-column prop="task" label="维修类型" width="120">
            <template #default="scope">
              <el-tag :type="getTaskTypeColor(scope.row.task)" effect="dark">
                {{ scope.row.task }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="data" label="维修内容" />
          <el-table-column prop="priority" label="优先级" width="100">
            <template #default="scope">
              <el-tag :type="getPriorityColor(scope.row.priority)" effect="dark">
                {{ scope.row.priority }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="submitTime" label="提交时间" width="180" />
          <el-table-column label="操作" width="160">
            <template #default="scope">
              <el-button
                  size="mini"
                  type="primary"
                  class="action-btn"
                  @click="openRepairDialog(scope.row)"
              >
                处理任务
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 发布维修任务对话框 -->
    <el-dialog
        title="发布维修任务"
        :visible.sync="dialogVisible"
        width="500px"
        class="tech-dialog"
    >
      <el-form :model="form" label-width="100px" class="tech-form">
        <el-form-item label="任务标题">
          <el-input v-model="form.title" class="tech-input" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input type="textarea" v-model="form.data" class="tech-input" />
        </el-form-item>
        <el-form-item label="维修类型">
          <el-select v-model="form.task" placeholder="请选择" class="tech-select">
            <el-option label="电力" value="电力" />
            <el-option label="机械" value="机械" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="维修优先级">
          <el-select v-model="form.priority" placeholder="请选择" class="tech-select">
            <el-option label="紧急" value="紧急" />
            <el-option label="高" value="高" />
            <el-option label="普通" value="普通" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
        <el-button type="primary" @click="submitRepairTask" class="submit-btn">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import {instance} from "@/util/request";
import dayjs from 'dayjs';

export default {
  name: 'TechMonitorScreen',
  data() {
    return {
      repairList: [
        {
          task: 'power',
          data: 'Power outage in room 302',
          submitTime: '2023-05-17 10:30:00',
          priority: '紧急',
        },
        {
          task: 'mechanical',
          data: 'Door jammed in room 401',
          submitTime: '2023-05-17 11:00:00',
          priority: '普通',
        },
        {
          task: 'other',
          data: 'Routine maintenance check',
          submitTime: '2023-05-17 12:00:00',
          priority: '低',
        }
      ]
    }
  },
  setup() {
    const dialogVisible = ref(false);
    const selectedTaskType = ref('detectperson');
    const currentTime = ref('');
    const refreshInterval = ref(null);
    const timeInterval = ref(null);
    const isFullscreen = ref(false);

    const form = reactive({
      title: '',
      data: '',
      task: '',
      priority: '',
      employeeDTO: {}
    });

    // 摄像头配置
    const cameras = ref([
      {
        id: 0,
        name: '摄像头1',
        location: '主入口',
        videoUrl: '',
        isLoading: false,
        status: 'offline',
        statusText: '离线'
      },
      {
        id: 1,
        name: '摄像头2',
        location: '走廊A',
        videoUrl: '',
        isLoading: false,
        status: 'offline',
        statusText: '离线'
      },
      {
        id: 2,
        name: '摄像头3',
        location: '走廊B',
        videoUrl: '',
        isLoading: false,
        status: 'offline',
        statusText: '离线'
      },
      {
        id: 3,
        name: '摄像头4',
        location: '后门',
        videoUrl: '',
        isLoading: false,
        status: 'offline',
        statusText: '离线'
      }
    ]);

    // 在线摄像头数量计算
    const onlineCameraCount = computed(() => {
      return cameras.value.filter(camera => camera.status === 'online').length;
    });

    const baseVideoUrl = 'http://192.168.138.102:5000/video_feed';

    const updateTime = () => {
      currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
    };

    const handleTaskTypeChange = (value) => {
      console.log('任务类型切换为:', value);
      startAllVideoStreams();
    };

    // 修复后的全屏切换函数
    const toggleFullscreen = () => {
      if (isFullscreen.value) {
        // 退出全屏模式
        isFullscreen.value = false;
        // 只有当文档确实处于全屏状态时才调用 exitFullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => {
            console.warn('退出全屏失败:', err);
          });
        }
      } else {
        // 进入全屏模式
        isFullscreen.value = true;
        // 检查是否支持全屏API
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(err => {
            console.warn('进入全屏失败:', err);
            // 如果全屏失败，回退状态
            isFullscreen.value = false;
          });
        } else {
          console.warn('浏览器不支持全屏API');
        }
      }
    };

    // 全屏状态变化监听器
    const handleFullscreenChange = () => {
      // 当用户通过其他方式（如按F11或ESC）改变全屏状态时，同步我们的状态
      if (!document.fullscreenElement && isFullscreen.value) {
        isFullscreen.value = false;
      }
    };

    const startAllVideoStreams = () => {
      cameras.value.forEach((camera, index) => {
        startVideoStream(index);
      });
    };

    const startVideoStream = (cameraIndex) => {
      const camera = cameras.value[cameraIndex];
      camera.isLoading = true;
      camera.status = 'connecting';
      camera.statusText = '连接中...';

      const updateVideoUrl = () => {
        const timestamp = Date.now();
        const type = selectedTaskType.value;
        camera.videoUrl = `${baseVideoUrl}?camera=${cameraIndex}&t=${timestamp}&status=${type}`;
      };

      updateVideoUrl();

      // 定期更新视频流
      const interval = setInterval(() => {
        updateVideoUrl();
      }, 100); // 每100ms更新一次

      // 存储interval以便清理
      camera.interval = interval;
    };

    const stopAllVideoStreams = () => {
      cameras.value.forEach(camera => {
        if (camera.interval) {
          clearInterval(camera.interval);
          camera.interval = null;
        }
      });
    };

    const handleVideoLoad = (cameraIndex) => {
      const camera = cameras.value[cameraIndex];
      camera.status = 'online';
      camera.statusText = '在线';
      camera.isLoading = false;
    };

    const handleVideoError = (cameraIndex) => {
      const camera = cameras.value[cameraIndex];
      camera.status = 'error';
      camera.statusText = '连接失败';
      camera.isLoading = false;
    };

    const openRepairDialog = (row) => {
      const time = dayjs(row.submitTime).format('YYYY-MM-DD HH:mm');
      form.title = `${time}的维修任务`;
      form.data = row.data;
      form.task = row.task;
      form.priority = row.priority;
      dialogVisible.value = true;
    };

    // 键盘事件处理
    const keyStates = reactive({});

    const handleKeyDown = (e) => {
      // ESC键退出大屏模式
      if (e.key === 'Escape' && isFullscreen.value) {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // F11键切换大屏模式
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      if (!keyStates[e.key]) {
        keyStates[e.key] = { pressed: true, start: Date.now() };
        sendKeyState(e.key, 'press');
      }
    };

    const handleKeyUp = (e) => {
      const keyInfo = keyStates[e.key];
      if (keyInfo) {
        const duration = Date.now() - keyInfo.start;
        sendKeyState(e.key, 'release', duration);
        delete keyStates[e.key];
      }
    };

    const sendKeyState = async (key, action, duration = 0) => {
      try {
        await axios.post('http://192.168.138.102:5000/key_event', { key, action, duration });
      } catch (e) {
        console.error('键盘事件发送失败', e);
      }
    };

    onMounted(() => {
      updateTime();
      timeInterval.value = setInterval(updateTime, 1000);
      startAllVideoStreams();

      // 添加全屏状态变化监听
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    });

    onUnmounted(() => {
      stopAllVideoStreams();
      if (timeInterval.value) {
        clearInterval(timeInterval.value);
      }

      // 移除全屏状态变化监听
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    });

    return {
      dialogVisible,
      form,
      cameras,
      selectedTaskType,
      currentTime,
      isFullscreen,
      onlineCameraCount,
      handleTaskTypeChange,
      toggleFullscreen,
      handleKeyDown,
      handleKeyUp,
      handleVideoLoad,
      handleVideoError,
      openRepairDialog
    };
  },
  methods: {
    submitRepairTask() {
      instance.post('/api/publictask', this.form)
          .then(response => {
            if(response.data.success){
              this.$message.success('维修任务提交成功');
              this.dialogVisible = false;
            }else{
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch(error => {
            this.$message.error('维修任务提交失败');
          });
    },
    goToHome(){
      // Use:
      this.$router.push('/layout/home').catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          console.error('Navigation error:', err)
        }
      })
    },
    getTaskTypeColor(task) {
      const colorMap = {
        'power': 'warning',
        'mechanical': 'info',
        'other': 'success'
      };
      return colorMap[task] || 'info';
    },
    getPriorityColor(priority) {
      const colorMap = {
        '紧急': 'danger',
        '高': 'warning',
        '普通': 'primary',
        '低': 'info'
      };
      return colorMap[priority] || 'info';
    }
  }
};
</script>

<style scoped>
.monitor-screen {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  outline: none;
  overflow-x: hidden;
  transition: all 0.3s ease;
}

/* 大屏模式样式 */
.fullscreen-mode {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: #000;
}

/* 头部样式 */
.header-section {
  background: linear-gradient(90deg, rgba(0, 212, 255, 0.1) 0%, rgba(16, 142, 233, 0.1) 100%);
  border-bottom: 2px solid rgba(0, 212, 255, 0.3);
  padding: 20px 40px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.header-minimized {
  padding: 10px 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  opacity: 0.9;
}

.header-minimized:hover {
  opacity: 1;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.title-icon {
  font-size: 32px;
  background: linear-gradient(45deg, #00d4ff, #108ee9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: pulse 2s infinite;
}

.main-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #00d4ff, #108ee9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}

.subtitle {
  font-size: 12px;
  color: #00d4ff;
  opacity: 0.7;
  letter-spacing: 2px;
}

.control-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.task-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selector-label {
  color: #00d4ff;
  font-size: 14px;
  white-space: nowrap;
}

/* 大屏模式按钮样式 */
.fullscreen-btn {
  background: linear-gradient(45deg, #722ed1, #9254de) !important;
  border: none !important;
  color: #fff !important;
  box-shadow: 0 0 15px rgba(146, 84, 222, 0.3) !important;
  transition: all 0.3s ease !important;
}

.fullscreen-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 5px 20px rgba(146, 84, 222, 0.5) !important;
}

.fullscreen-btn[type="warning"] {
  background: linear-gradient(45deg, #faad14, #fadb14) !important;
  box-shadow: 0 0 15px rgba(250, 173, 20, 0.3) !important;
}

/* 视频网格样式 */
.video-grid-section {
  padding: 30px 40px;
  max-width: 1400px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.video-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  max-width: none;
  margin: 0;
  padding: 80px 20px 20px 20px;
  background: #000;
  z-index: 999;
}

.section-header {
  text-align: center;
  margin-bottom: 30px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #00d4ff;
  margin-bottom: 5px;
}

.section-subtitle {
  font-size: 12px;
  color: rgba(0, 212, 255, 0.6);
  letter-spacing: 1px;
}

/* 大屏模式信息栏 */
.fullscreen-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.info-label {
  color: #00d4ff;
  font-weight: 600;
}

.info-value {
  color: #fff;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.video-grid-fullscreen {
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 0;
  height: calc(100vh - 140px);
}

.video-panel {
  background: rgba(16, 142, 233, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.video-panel-fullscreen {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 212, 255, 0.5);
  border-radius: 8px;
  padding: 5px;
  height: 100%;
}

.video-panel.active {
  border-color: #00d4ff;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.camera-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.camera-name {
  font-size: 16px;
  font-weight: 600;
  color: #00d4ff;
}

.camera-location {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 15px;
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background: #52c41a;
  box-shadow: 0 0 10px rgba(82, 196, 26, 0.6);
}

.status-dot.offline {
  background: #8c8c8c;
}

.status-dot.error {
  background: #ff4d4f;
  box-shadow: 0 0 10px rgba(255, 77, 79, 0.6);
}

.status-dot.connecting {
  background: #faad14;
  animation: pulse 1s infinite;
}

.video-container {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  min-height: 200px;
}

.video-container-fullscreen {
  height: 100%;
  border-radius: 4px;
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-stream {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.video-stream-fullscreen {
  height: 100%;
  min-height: calc((100vh - 140px) / 2 - 30px);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: #00d4ff;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 2px solid transparent;
  border-top: 2px solid #00d4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 12px;
}

.no-video {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.5);
}

.no-video-fullscreen {
  height: 100%;
}

.no-video-icon {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.no-video-text {
  font-size: 14px;
}

.video-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.video-overlay-fullscreen {
  top: 5px;
  left: 5px;
  right: 5px;
}

.overlay-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}



.camera-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.camera-name {
  font-size: 16px;
  font-weight: 600;
  color: #00d4ff;
}

.camera-location {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 15px;
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background: #52c41a;
  box-shadow: 0 0 10px rgba(82, 196, 26, 0.6);
}

.status-dot.offline {
  background: #8c8c8c;
}

.status-dot.error {
  background: #ff4d4f;
  box-shadow: 0 0 10px rgba(255, 77, 79, 0.6);
}

.status-dot.connecting {
  background: #faad14;
  animation: pulse 1s infinite;
}

.video-container {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  min-height: 200px;
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-stream {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: #00d4ff;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 2px solid transparent;
  border-top: 2px solid #00d4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 12px;
}

.no-video {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.5);
}

.no-video-icon {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.no-video-text {
  font-size: 14px;
}

.video-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.overlay-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.timestamp,
.detection-mode {
  background: rgba(0, 0, 0, 0.7);
  color: #00d4ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  backdrop-filter: blur(5px);
}

/* 任务列表样式 */
.task-section {
  padding: 30px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.task-table-container {
  background: rgba(16, 142, 233, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

/* Element UI 组件样式覆盖 */
.tech-select {
  background: rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(0, 212, 255, 0.5) !important;
  color: #fff !important;
}

.tech-select .el-input__inner {
  background: transparent !important;
  border: none !important;
  color: #fff !important;
}

.tech-input .el-input__inner {
  background: rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(0, 212, 255, 0.5) !important;
  color: #fff !important;
}

.tech-input .el-textarea__inner {
  background: rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(0, 212, 255, 0.5) !important;
  color: #fff !important;
}

.tech-table {
  background: transparent !important;
}

.tech-table .el-table__body tr {
  background: rgba(0, 212, 255, 0.05) !important;
  color: #fff !important;
}

.tech-table .el-table__body tr:hover {
  background: rgba(0, 212, 255, 0.1) !important;
}

.tech-table .el-table__body td {
  border-bottom: 1px solid rgba(0, 212, 255, 0.2) !important;
  color: #fff !important;
}

.tech-dialog .el-dialog {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
  border: 1px solid rgba(0, 212, 255, 0.3) !important;
}

.tech-dialog .el-dialog__header {
  background: rgba(0, 212, 255, 0.1) !important;
  color: #00d4ff !important;
}

.tech-dialog .el-dialog__body {
  background: transparent !important;
}

.tech-form .el-form-item__label {
  color: #00d4ff !important;
}

.publish-btn {
  background: linear-gradient(45deg, #00d4ff, #108ee9) !important;
  border: none !important;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3) !important;
  transition: all 0.3s ease !important;
}

.publish-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 5px 25px rgba(0, 212, 255, 0.5) !important;
}

.action-btn {
  background: linear-gradient(45deg, #00d4ff, #108ee9) !important;
  border: none !important;
  font-size: 12px !important;
}

.submit-btn {
  background: linear-gradient(45deg, #00d4ff, #108ee9) !important;
  border: none !important;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #fff !important;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .video-stream {
    height: 150px;
  }

  .no-video {
    height: 150px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
  }

  .video-grid {
    grid-template-columns: 1fr;
  }

  .monitor-screen {
    padding: 10px;
  }

  .video-grid-section,
  .task-section {
    padding: 20px;
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #00d4ff, #108ee9);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #108ee9, #00d4ff);
}
</style>