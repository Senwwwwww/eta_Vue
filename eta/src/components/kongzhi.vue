<template>
  <div class="monitor-screen" @keydown="handleKeyDown" @keyup="handleKeyUp" tabindex="0" :class="{ 'fullscreen-mode': isFullscreen }">
    <!-- 头部标题栏 -->
    <div class="header-section" :class="{ 'header-minimized': isFullscreen }">
      <div class="header-content">
        <div class="title-section">
          <div class="title-icon">📹</div>
          <h1 class="main-title">智能视频监控系统</h1>
          <!--          <div class="subtitle">INTELLIGENT VIDEO MONITORING</div>-->
        </div>
        <!-- 1. 删除头部的检测模式选择器 -->
        <div class="control-section">
          <!-- 删除整个 task-selector 部分 -->

          <!-- 历史视频按钮 -->
          <el-button
              class="history-btn"
              type="info"
              @click="showHistoryDialog = true"
          >
            <i class="el-icon-folder-opened"></i>
            历史视频
          </el-button>

          <!-- 其他按钮保持不变 -->
          <el-button
              class="fullscreen-btn"
              @click="toggleFullscreen"
              :type="isFullscreen ? 'warning' : 'info'"
          >
            <i :class="isFullscreen ? 'el-icon-minus' : 'el-icon-full-screen'"></i>
            {{ isFullscreen ? '退出大屏' : '大屏模式' }}
          </el-button>

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

      <!-- 添加摄像头控制按钮 -->
      <div class="camera-control-bar">
        <el-button
          class="camera-control-btn"
          :type="isCameraEnabled ? 'danger' : 'success'"
          @click="toggleCameraSystem"
        >
          <i :class="isCameraEnabled ? 'el-icon-video-pause' : 'el-icon-video-play'"></i>
          {{ isCameraEnabled ? '关闭摄像头系统' : '开启摄像头系统' }}
        </el-button>
      </div>

    <!-- 4. 修改大屏模式信息栏 -->
      <div class="fullscreen-info-bar" v-if="isFullscreen">
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
            'selected': selectedCamera === index,
            'video-panel-fullscreen': isFullscreen
          }"
            @click="selectCamera(index)"
        >
          <!-- 2. 修改视频面板，为每个视频添加独立的检测模式选择 -->
          <div class="video-panel-header" v-if="!isFullscreen">
            <div class="camera-info">
              <span class="camera-name">{{ camera.name }}</span>
              <span class="camera-location">{{ camera.location }}</span>
            </div>

            <!-- 添加独立的检测模式选择器 -->
            <div class="detection-mode-selector">
              <el-select
                  v-model="camera.detectionMode"
                  @change="handleCameraDetectionModeChange(index)"
                  class="tech-select camera-mode-select"
                  size="mini"
                  :teleported="true"
              >
                <el-option label="人员检测" value="detectpeople"></el-option>
                <el-option label="缺陷检测" value="detectlost"></el-option>
              </el-select>
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

            <!-- 1. 修改视频叠加信息部分，在大屏模式下也显示检测模式选择器 -->
            <div class="video-overlay" :class="{ 'video-overlay-fullscreen': isFullscreen }">
              <div class="overlay-info">
                <div class="camera-title" v-if="isFullscreen">{{ camera.name }} - {{ camera.location }}</div>
                <div class="timestamp" v-if="!isFullscreen">{{ currentTime }}</div>
                <div class="detection-mode" v-if="!isFullscreen">
                  {{ camera.detectionMode === 'detectpeople' ? '人员检测' : '缺陷检测' }}
                </div>
                <div class="status-indicator-fullscreen" v-if="isFullscreen">
                  <span :class="['status-dot', camera.status]"></span>
                  <span class="status-text">{{ camera.statusText }}</span>
                </div>
              </div>

<!--              &lt;!&ndash; 大屏模式下的检测模式选择器 &ndash;&gt;-->
<!--              <div class="fullscreen-detection-selector" v-if="isFullscreen">-->
<!--                <div class="detection-label">检测模式:</div>-->
<!--                <el-select-->
<!--                    v-model="camera.detectionMode"-->
<!--                    @change="handleCameraDetectionModeChange(index)"-->
<!--                    class="fullscreen-mode-select"-->
<!--                    size="small"-->
<!--                    :teleported="true"-->
<!--                    :popper-append-to-body="true"-->

<!--                >-->
<!--                  <el-option label="人员检测" value="detectpeople"></el-option>-->
<!--                  <el-option label="缺陷检测" value="detectlost"></el-option>-->
<!--                </el-select>-->
<!--              </div>-->
<!--              &lt;!&ndash; 报警控制按钮 &ndash;&gt;-->
<!--              <div >-->
<!--                <el-button-->
<!--                    size="mini"-->
<!--                    :type="camera.activebuzzer? 'danger' : 'success'"-->
<!--                    @click="togglebuzzer(index)"-->
<!--                >-->
<!--                  {{ camera.activebuzzer ? '停止报警' : '开始报警' }}-->
<!--                </el-button>-->
<!--              </div>-->
<!--              &lt;!&ndash; 录制控制按钮 &ndash;&gt;-->
<!--              <div class="recording-controls" v-if="!isFullscreen">-->
<!--                <el-button-->
<!--                    size="mini"-->
<!--                    :type="camera.isRecording ? 'danger' : 'success'"-->
<!--                    @click="toggleRecording(index)"-->
<!--                    :disabled="camera.status !== 'online'"-->
<!--                >-->
<!--                  <i :class="camera.isRecording ? 'el-icon-video-pause' : 'el-icon-video-play'"></i>-->
<!--                  {{ camera.isRecording ? '停止录制' : '开始录制' }}-->
<!--                </el-button>-->
<!--              </div>-->
              <!-- 按钮容器 -->
              <div style="display: flex; gap: 10px; align-items: flex-start; align-self: flex-start;">
                <!-- 报警控制按钮 -->
                <div>
                  <el-button
                      size="mini"
                      :type="camera.activebuzzer? 'danger' : 'success'"
                      @click="togglebuzzer(index)"
                  >
                    {{ camera.activebuzzer ? '停止报警' : '开始报警' }}
                  </el-button>
                </div>
                <!-- 录制控制按钮 -->
                <div>
                  <el-button
                      size="mini"
                      :type="camera.isRecording ? 'danger' : 'success'"
                      @click="toggleRecording(index)"
                      :disabled="camera.status !== 'online'"
                  >
                    <i :class="camera.isRecording ? 'el-icon-video-pause' : 'el-icon-video-play'"></i>
                    {{ camera.isRecording ? '停止录制' : '开始录制' }}
                  </el-button>
                </div>
              </div>



<!--              &lt;!&ndash; 大屏模式下的录制控制按钮 &ndash;&gt;-->
<!--              <div class="fullscreen-recording-controls" v-if="isFullscreen">-->
<!--                <el-button-->
<!--                    size="small"-->
<!--                    :type="camera.isRecording ? 'danger' : 'success'"-->
<!--                    @click="toggleRecording(index)"-->
<!--                    :disabled="camera.status !== 'online'"-->
<!--                >-->
<!--                  <i :class="camera.isRecording ? 'el-icon-video-pause' : 'el-icon-video-play'"></i>-->
<!--                  {{ camera.isRecording ? '停止录制' : '开始录制' }}-->
<!--                </el-button>-->
<!--              </div>-->


            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 维修任务列表 - 在大屏模式下隐藏 -->
    <div class="task-section" v-if="!isFullscreen">
      <div class="section-header">
        <div class="section-title">维修任务管理</div>
        <div class="refresh-status" style="margin-left: 20px; color: #00ffb0; font-size: 14px;">
          状态：<span :style="{ color: isAutoRefreshing ? '#00ffb0' : '#ff6666' }">
          {{ isAutoRefreshing ? '正在刷新' : '已暂停刷新（按空格继续）' }}
    </span>
        </div>
        <div class="section-subtitle">MAINTENANCE TASK MANAGEMENT</div>
      </div>

      <div class="task-table-container">
        <el-table
            :data="displayList"
            class="tech-table"
            :header-cell-style="{ background: 'rgba(16, 142, 233, 0.1)', color: '#00d4ff' }"
            :row-style="{ background: 'rgba(0, 212, 255, 0.05)' }"
        >

          <el-table-column prop="task" label="任务类型" width="120">
            <template #default="scope">
              <el-tag :type="getTaskTypeColor(scope.row.task)" effect="dark">
                {{ scope.row.task }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="scene" label="场景" width="100">
            <template #default="scope">
              <el-tag :type="getPriorityColor(scope.row.scene)" effect="dark">
                {{ scope.row.scene }}
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
                  @click.stop="openRepairDialog(scope.row)"
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
        width="800px"
        class="tech-dialog"
    >
      <el-form :model="form" label-width="100px" class="tech-form">
        <el-form-item>
          <template #label>
            <span class="custom-label">任务描述</span>
          </template>
          <el-input type="textarea" v-model="form.data" class="tech-input" />
        </el-form-item>
        <el-form-item>
          <template #label>
            <span class="custom-label">维修类型</span>
          </template>
          <el-select v-model="form.task" placeholder="请选择" class="tech-select">
            <el-option label="人员检测" value="detectpeople" />
            <el-option label="缺陷检测" value="detectlost" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <template #label>
            <span class="custom-label">维修优先级</span>
          </template>
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


    <!-- 美化的对话框 -->
    <el-dialog
        title="历史视频管理"
        :visible.sync="showHistoryDialog"
        width="1200px"
        class="tech-dialog history-dialog"
        :show-close="true"
        custom-class="beautiful-dialog"
    >
        <!-- 查询条件 -->
        <div class="history-filters">
          <div class="filter-row">
            <div class="filter-item">
              <label>摄像头：</label>
              <el-select v-model="historyFilter.cameraId" placeholder="选择摄像头" class="tech-select">
                <el-option
                    v-for="(camera, index) in cameras"
                    :key="index"
                    :label="camera.name + ' - ' + camera.location"
                    :value="index">
                </el-option>
              </el-select>
            </div>
            <div class="filter-item">
              <label>日期：</label>
              <el-date-picker
                  v-model="historyFilter.date"
                  type="date"
                  placeholder="选择日期"
                  class="tech-input"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd">
              </el-date-picker>
            </div>
            <div class="filter-item">
              <el-button type="primary" @click="loadHistoryVideos" class="search-btn">
                <i class="el-icon-search"></i>
                查询
              </el-button>
            </div>
          </div>
        </div>

        <!-- 历史视频列表 -->
        <div class="history-list">
          <div class="list-header">
            <h3>📹 历史视频记录</h3>
            <div class="list-info">
              共 <strong>{{ historyVideos.length }}</strong> 条记录
            </div>
          </div>

          <div class="table-container">
            <el-table
                :data="historyVideos"
                class="tech-table"
                v-loading="historyLoading"
                element-loading-text="加载中..."
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(255, 255, 255, 0.8)"
                :header-cell-style="headerCellStyle"
                :row-style="rowStyle"
                @row-click="handleRowClick"
            >
              <el-table-column prop="filename" label="📄 文件名" min-width="200">
                <template #default="scope">
                  <div class="filename-cell">
                    <i class="el-icon-video-camera file-icon"></i>
                    {{ scope.row.filename }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="cameraName" label="📷 摄像头" width="150">
                <template #default="scope">
                  <el-tag class="camera-tag" type="success" effect="plain">
                    {{ scope.row.cameraName }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column prop="startTime" label="🕐 开始时间" width="180">
                <template #default="scope">
                  <div class="time-cell">
                    <i class="el-icon-time"></i>
                    {{ scope.row.startTime }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="endTime" label="🕑 结束时间" width="180">
                <template #default="scope">
                  <div class="time-cell">
                    <i class="el-icon-time"></i>
                    {{ scope.row.endTime }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="fileSize" label="📊 文件大小" width="120">
                <template #default="scope">
                  <el-tag class="file-size-tag" type="warning" effect="plain">
                    {{ scope.row.fileSize }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="⚙️ 操作" width="300" fixed="right">
                <template #default="scope">
                  <div style="display: flex; gap: 8px;">
                    <el-button
                        size="mini"
                        type="primary"
                        @click="playHistoryVideo(scope.row)"
                        class="action-btn"
                    >
                      <i class="el-icon-video-play"></i>
                      播放
                    </el-button>
                    <el-button
                        size="mini"
                        type="success"
                        @click="downloadVideo(scope.row)"
                        class="action-btn"
                    >
                      <i class="el-icon-download"></i>
                      下载
                    </el-button>
                    <el-button
                        size="mini"
                        type="danger"
                        @click="this.deleteVideo(scope.row)"
                        class="action-btn"
                    >
                      <i class="el-icon-delete"></i>
                      删除
                    </el-button>
                  </div>
                </template>
              </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>


    <!-- 视频播放对话框 -->
    <el-dialog
        title="视频播放"
        :visible.sync="showVideoPlayer"
        width="920px"
        class="tech-dialog video-player-dialog"
        :before-close="closeVideoPlayer"
        :close-on-click-modal="false"
        :show-close="false"
    >
      <div class="video-player-content">
        <div class="player-header">
          <div class="video-info">
            <h3>{{ currentVideo.filename }}</h3>
            <div class="video-meta">
              <span><i class="el-icon-video-camera"></i>摄像头: {{ currentVideo.cameraName }}</span>
              <span><i class="el-icon-time"></i>时间: {{ currentVideo.startTime }} - {{ currentVideo.endTime }}</span>
              <span><i class="el-icon-timer"></i>时长: {{ currentVideo.duration }}</span>
            </div>
          </div>
          <div class="header-actions">
            <el-button type="text" @click="closeVideoPlayer" class="close-btn">
              <i class="el-icon-close"></i>
            </el-button>
          </div>
        </div>

        <div class="player-container">
          <video
              ref="videoPlayer"
              class="history-video-player"
              controls
              preload="metadata"
              :src="currentVideo.videoUrl"
              @loadstart="onVideoLoadStart"
              @canplay="onVideoCanPlay"
              @error="onVideoError"
              style="width:100%;"
          >
            您的浏览器不支持视频播放
          </video>


          <div v-if="videoLoading" class="video-loading">
            <div class="loading-spinner"></div>
            <div class="loading-text">视频加载中...</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import axios from 'axios';
import { instance } from "@/util/request";
import dayjs from 'dayjs';

export default {
  name: 'TechMonitorScreen',
  data() {
// 1. 在 data() 中添加新的数据属性
    return {
      // repairList: [],
      // displayList: [], // 用于显示的列表
      // currentIndex: 0, // 当前滚动位置
      autoRefreshTimer: null, // 自动刷新定时器
      scrollTimer: null, // 滚动定时器
      // ... 其他现有属性
    }
  },

  setup() {
    const isCameraEnabled = ref(false); // 添加摄像头系统状态控制
    const repairList = ref([]);
    const displayList = ref([]);
    const currentIndex = ref(0);
    const handleCameraDetectionModeChange = (cameraIndex) => {
      try {
        startVideoStream(cameraIndex);
      } catch (error) {
        console.error('切换检测模式失败:', error);
      }
    };


    const fetchData = async () => {
      try {
        const response = await axios.get('http://192.168.138.102:5000/task_get');
        if (response.data != null) {
          repairList.value = response.data.repairList;
          updateDisplayList();

          repairList.value.forEach(task => {
            task.taskTypeColor = getTaskTypeColor(task.task);
            task.priorityColor = getPriorityColor(task.priority);
          });
        } else {
          repairList.value = [];
        }
      } catch (e) {
        console.error(e);
      }
    };

    const updateDisplayList = () => {
      try {
        if (repairList.value.length <= 6) {
          displayList.value = [...repairList.value];
          return;
        }
        const totalItems = repairList.value.length;
        const items = [];
        for (let i = 0; i < 6; i++) {
          const index = (currentIndex.value + i) % totalItems;
          items.push(repairList.value[index]);
        }
        displayList.value = items;
        currentIndex.value = (currentIndex.value + 1) % totalItems;
      } catch (error) {
        console.error('更新任务列表失败:', error);
      }
    };

    const getTaskTypeColor = (t) => {
      return { power: 'warning', mechanical: 'info', other: 'success' }[t] || 'info';
    };

    const getPriorityColor = (p) => {
      return { '紧急':'danger','高':'warning','普通':'primary','低':'info' }[p] || 'info';
    };

    const dialogVisible = ref(false);
    const selectedTaskType = ref('detectpeople');
    const currentTime = ref('');
    const timeInterval = ref(null);
    const isFullscreen = ref(false);

    // 历史视频相关
    const showHistoryDialog = ref(false);
    const showVideoPlayer = ref(false);
    const historyLoading = ref(false);
    const videoLoading = ref(false);
    const historyVideos = ref([]);
    const currentVideo = ref({});
    const historyFilter = reactive({
      cameraId: null,
      date: null
    });

    const form = reactive({ title: '', data: '', task: '', priority: '', employeeDTO: {} });
    const isAutoRefreshing = ref(true); // 默认自动刷新中

    let autoRefreshTimer = null;

    const startAutoRefresh = () => {
      if (autoRefreshTimer) return; // 避免重复开启
      autoRefreshTimer = setInterval(() => {
        fetchData();
      }, 5000);
    };

    const stopAutoRefresh = () => {
      if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
      }
    };

    // 开始滚动
    const startScrolling = () => {
      if (this.repairList.length > 6) {
        this.scrollTimer = setInterval(() => {
          this.updateDisplayList();
        }, 3000); // 每3秒滚动一次
      }
    };

    // 停止滚动
    const stopScrolling = () => {
      if (this.scrollTimer) {
        clearInterval(this.scrollTimer);
        this.scrollTimer = null;
      }
    };
    const activebuzzer =false;
    const cameras = ref([
      {
        id: 0,
        name: '摄像头1',
        location: '',
        videoUrl: '',
        isLoading: false,
        status: 'offline',
        statusText: '离线',
        isRecording: false,
        detectionMode: 'detectpeople',
        activebuzzer: false
      },
      {
        id: 1,
        name: '摄像头2',
        location: '',
        videoUrl: '',
        isLoading: false,
        status: 'offline',
        statusText: '离线',
        isRecording: false,
        detectionMode: 'detectpeople', // 添加独立的检测模式
        activebuzzer: false
      },
      {
        id: 2,
        name: '摄像头3',
        location: '',
        videoUrl: '',
        isLoading: false,
        status: 'offline',
        statusText: '离线',
        isRecording: false,
        detectionMode: 'detectlost' ,// 添加独立的检测模式
        activebuzzer: false
      },
      {
        id: 3,
        name: '摄像头4',
        location: '',
        videoUrl: '',
        isLoading: false,
        status: 'offline',
        statusText: '离线',
        isRecording: false,
        detectionMode: 'detectlost', // 添加独立的检测模式
        activebuzzer: false
      }
    ]);

    // 在线摄像头数量
    const onlineCameraCount = computed(() => cameras.value.filter(c => c.status === 'online').length);

    const baseVideoUrl = 'http://192.168.138.102:5000/video_feed';

    const updateTime = () => currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const handleTaskTypeChange = () => startAllVideoStreams();

    //报警控制
    const togglebuzzer = async (cameraIndex) => {
      const camera = cameras.value[cameraIndex];
      try {
        if (camera.activebuzzer) {
          console.log('停止报警');
          // 停止报警
          await axios.post('http://192.168.138.102:5000/stop_buzzer', {
            camera: cameraIndex
          });
          camera.activebuzzer = false;
          camera.statusText = '在线';
        } else {
          // 启动报警
          await axios.post('http://192.168.138.102:5000/start_buzzer', {
            camera: cameraIndex
          });
          camera.activebuzzer = true;
          camera.statusText = '报警中';
        }
    }
    catch (error) {
      console.error('报警操作失败:', error);
      // 可以添加错误提示
    }
  };


    // 录制控制
    const toggleRecording = async (cameraIndex) => {
      const camera = cameras.value[cameraIndex];
      try {
        if (camera.isRecording) {
          // 停止录制
          await axios.post('http://192.168.138.102:5000/stop_recording', {
            camera: cameraIndex
          });
          camera.isRecording = false;
          camera.statusText = '在线';
        } else {
          // 开始录制
          await axios.post('http://192.168.138.102:5000/start_recording', {
            camera: cameraIndex,
           // filename: `camera_${cameraIndex}_${dayjs().format('YYYYMMDD_HHmmss')}.mp4`
          });
          camera.isRecording = true;
          camera.statusText = '录制中';
        }
      } catch (error) {
        console.error('录制操作失败:', error);
        // 可以添加错误提示
      }
    };

    // 加载历史视频
    const loadHistoryVideos = async () => {


      historyLoading.value = true;
      try {
        if (historyFilter.cameraId === null) {
          // 提示用户选择摄像头
        }

        const response = await axios.get('http://192.168.138.102:5000/get_history_videos', {

          params: {
            camera: historyFilter.cameraId,
            date: historyFilter.date || null
          }
        });

        historyVideos.value = response.data.videos?.map(video => ({
          ...video,
          cameraName: cameras.value[historyFilter.cameraId]?.name || `摄像头${historyFilter.cameraId}`
        }));
      } catch (error) {
        console.error('加载历史视频失败:', error);
        historyVideos.value = [];
      } finally {
        historyLoading.value = false;
      }
    };

    // 播放历史视频
    const playHistoryVideo = async (video) => {
      try {
        videoLoading.value = true;
        currentVideo.value = {
          ...video,
          videoUrl: `http://192.168.138.102:5000/get_video/${video.filename}`
        };
        showVideoPlayer.value = true;
      } catch (error) {
        console.error('播放视频失败:', error);
        ElMessage.error('播放视频失败');
        videoLoading.value = false;
      }
    };

    // 下载视频
    const downloadVideo = async (video) => {
      try {
        const response = await axios.get(`http://192.168.138.102:5000/download_video/${video.filename}`, {
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', video.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('下载视频失败:', error);
      }
    };


    // 视频播放事件
    const onVideoLoadStart = () => {
      videoLoading.value = true;
    };

    const onVideoCanPlay = () => {
      videoLoading.value = false;
    };

    const onVideoError = () => {
      videoLoading.value = false;
      console.error('视频加载失败');
    };

    const closeVideoPlayer = () => {
      try {
        showVideoPlayer.value = false;
        currentVideo.value = {};
      } catch (error) {
        console.error('关闭视频播放器失败:', error);
      }
    };

    // 全屏 & DOM 全屏 API
    const toggleFullscreen = () => {
      try {
        if (isFullscreen.value) {
          isFullscreen.value = false;
          if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        } else {
          isFullscreen.value = true;
          if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => { isFullscreen.value = false; });
        }
      } catch (error) {
        console.error('切换全屏失败:', error);
      }
    };
    const handleFullscreenChange = () => { if (!document.fullscreenElement && isFullscreen.value) isFullscreen.value = false; };

    // 添加摄像头系统控制方法
    const toggleCameraSystem = () => {
      isCameraEnabled.value = !isCameraEnabled.value;
      if (isCameraEnabled.value) {
        startAllVideoStreams();
      } else {
        stopAllVideoStreams();
        // 清除所有摄像头的视频流
        cameras.value.forEach(cam => {
          cam.videoUrl = '';
          cam.status = 'offline';
          cam.statusText = '已关闭';
          cam.isLoading = false;
        });
      }
    };

    const startAllVideoStreams = () => {
      if (isCameraEnabled.value) {
        cameras.value.forEach((_, i) => startVideoStream(i));
      }
    };
    
    const stopAllVideoStreams = () => cameras.value.forEach(cam => { 
      if (cam.interval) {
        clearInterval(cam.interval);
        cam.interval = null;
      } 
    });

    const startVideoStream = (i) => {
      if (!isCameraEnabled.value) return;
      
      i=i%2;
      i*=2;
      console.log('开始视频流', i);
      const cam = cameras.value[i];
      cam.isLoading = true;
      cam.status = 'connecting';
      cam.statusText = '连接中...';

      // 清除之前的定时器
      if (cam.interval) {
        clearInterval(cam.interval);
      }

      // 添加错误计数器和重试机制
      let consecutiveErrors = 0;
      const maxConsecutiveErrors = 5;

      const updateVideoFrame = async () => {
        try {
          const newUrl = `${baseVideoUrl}?camera=${i}&t=${Date.now()}&status=${cam.detectionMode}`;
          
          // 创建一个新的Image对象来测试图片是否能够成功加载
          await new Promise((resolve, reject) => {
            const testImg = new Image();
            const timeout = setTimeout(() => {
              testImg.onload = null;
              testImg.onerror = null;
            }, 3000); // 3秒超时
            
            testImg.onload = () => {

              clearTimeout(timeout);
              // 图片加载成功，更新摄像头的videoUrl
              cam.videoUrl = newUrl;
              cam.status = 'online';
              cam.statusText = cam.isRecording ? '录制中' : '在线';
              cam.isLoading = false;
              consecutiveErrors = 0; // 重置错误计数
              resolve(true);
            };
            
            testImg.onerror = () => {
              clearTimeout(timeout);
              // 图片加载失败，不更新videoUrl，保持原有图片
              consecutiveErrors++;
              console.warn(`摄像头 ${i} 图片加载失败 (${consecutiveErrors}/${maxConsecutiveErrors})，保持原有图片`);
              
              // 如果连续错误次数过多，更新状态
              if (consecutiveErrors >= maxConsecutiveErrors) {
                cam.status = 'error';
                cam.statusText = '连接异常';
                cam.isLoading = false;
              }
              
              reject(false);
            };
            
            testImg.src = newUrl;
          });
        } catch (error) {
          consecutiveErrors++;
          console.error(`摄像头 ${i} 更新失败 (${consecutiveErrors}/${maxConsecutiveErrors}):`, error);
          
          if (consecutiveErrors >= maxConsecutiveErrors) {
            cam.status = 'error';
            cam.statusText = '连接失败';
            cam.isLoading = false;
          }
          
          return false;
        }
      };

      // 立即执行一次
      updateVideoFrame();

      // 设置定时器，每66.67毫秒尝试更新一次
      cam.interval = setInterval(async () => {
        try {
          await updateVideoFrame();
        } catch (error) {
          console.error(`摄像头 ${i} 更新失败:`, error);
          // 错误已在updateVideoFrame中处理
        }
      }, 66.67);
    };

    const handleVideoLoad = (i) => {
      try {   
        const cam = cameras.value[i];
        cam.status = 'online';
        cam.statusText = cam.isRecording ? '录制中' : '在线';
        cam.isLoading = false;
      } catch (error) {
        console.error('视频加载处理失败:', error);
      }
    };
    const handleVideoError = (i) => {
      try {
        const cam = cameras.value[i];
        cam.status = 'error';
        cam.statusText = '连接失败';
        cam.isLoading = false;
      } catch (error) {
        console.error('视频错误处理失败:', error);
      }
    };

    const selectedCamera = ref(null);
    const selectCamera = (i) => {
      try {
        selectedCamera.value = i;
      } catch (error) {
        console.error('选择摄像头失败:', error);
      }
    };

    // 键盘事件处理
    const keyStates = reactive({});
    const handleKeyDown = (e) => {
      try {
        if (e.key === 'Escape' && isFullscreen.value) {
          e.preventDefault();
          toggleFullscreen();
          return;
        }
        if (e.key === 'F11') {
          e.preventDefault();
          toggleFullscreen();
          return;
        }
        if (e.key === ' ') {
          e.preventDefault(); // 阻止页面滚动
          if (isAutoRefreshing.value) {
            stopAutoRefresh();
            isAutoRefreshing.value = false;
          } else {
            startAutoRefresh();
            isAutoRefreshing.value = true;
          }
          return;
        }
        if (!keyStates[e.key] && selectedCamera.value !== null) {
          keyStates[e.key] = { start: Date.now() };
          sendKeyState(e.key, 'press');
        }
      } catch (error) {
        console.error('键盘事件处理失败:', error);
      }
    };
    const handleKeyUp = (e) => {
      try {
        const info = keyStates[e.key];
        if (info) {
          const duration = Date.now() - info.start;
          sendKeyState(e.key, 'release', duration);
          delete keyStates[e.key];
        }
      } catch (error) {
        console.error('键盘抬起事件处理失败:', error);
      }
    };

    const sendKeyState = async (key, action, duration = 0) => {
      try {
        await axios.post('http://192.168.138.102:5000/key_event', { key, action, duration, camera: selectedCamera.value });
      } catch {}
    };

    onMounted(() => {
      updateTime(); timeInterval.value = setInterval(updateTime, 5000);
      startAllVideoStreams(); document.addEventListener('fullscreenchange', handleFullscreenChange);
      fetchData();
      startAutoRefresh();
      startScrolling();
      updateTime();
      timeInterval.value = setInterval(updateTime, 1000);
      startAllVideoStreams();
      document.addEventListener('fullscreenchange', handleFullscreenChange);

    });
    onUnmounted(() => { stopAllVideoStreams(); clearInterval(timeInterval.value); document.removeEventListener('fullscreenchange', handleFullscreenChange); });

    return {
      dialogVisible, form, cameras, currentTime,
      isFullscreen, onlineCameraCount, selectCamera, selectedCamera,
      toggleFullscreen, handleKeyDown, handleKeyUp,
      handleVideoLoad, handleVideoError, toggleRecording,
      showHistoryDialog, showVideoPlayer, historyLoading, videoLoading,
      historyVideos, currentVideo, historyFilter, loadHistoryVideos,
      playHistoryVideo, downloadVideo,  onVideoLoadStart, onVideoCanPlay,
      onVideoError, closeVideoPlayer, startAutoRefresh,
      stopAutoRefresh, startScrolling, stopScrolling, repairList, displayList, currentIndex,
      fetchData, updateDisplayList, getTaskTypeColor, getPriorityColor,
      handleCameraDetectionModeChange, isAutoRefreshing, togglebuzzer,
      isCameraEnabled, toggleCameraSystem, // 添加新的摄像头控制相关内容
    };
  },



  beforeDestroy() {
    this.stopAutoRefresh();
    this.stopScrolling();
  },
  methods: {


    mounted() {
      // 组件挂载后检查紧急任务
      this.checkUrgentTasks();
    },

    openRepairDialog(row) {
      // 阻止事件冒泡
      event.stopPropagation();

      // 这里可以添加打开维修任务详情对话框的逻辑
      this.$message.info(`正在处理任务: ${row.data}`);
      this.dialogVisible = true;
      this.form = row;

    },

       // 删除视频
    async deleteVideo(video){
      try {
        const response = await axios.get(`http://192.168.138.102:5000/delete_video/${video.filename}`);
        if (response.status === 200) {
          this.$message.success('删除成功');
          await loadHistoryVideos();
        }
      } catch (error) {
        console.error('删除视频失败:', error);
        this.$message.error('删除失败');
      }
    },

    // 检查紧急任务的方法
    checkUrgentTasks() {
      const urgentTasks = this.displayList.filter(task =>
          task.priority === '紧急' || task.priority === 'urgent'
      );

      if (urgentTasks.length > 0) {
        this.showUrgentWarning(urgentTasks);
      }
    },

    // 显示紧急任务警告弹窗
    showUrgentWarning(urgentTasks) {
      const taskList = urgentTasks.map(task =>
          `• ${task.task} - ${task.data || '无描述'} (${task.submitTime})`
      ).join('\n');

      this.$confirm(
          `发现 ${urgentTasks.length} 个紧急任务需要立即处理：\n\n${taskList}`,
          '紧急任务警告',
          {
            confirmButtonText: '立即处理',
            cancelButtonText: '稍后处理',
            type: 'warning',
            dangerouslyUseHTMLString: false,
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            customClass: 'urgent-warning-dialog'
          }
      ).then(() => {
        // 用户点击"立即处理"后的操作
        this.handleUrgentTasks(urgentTasks);
      }).catch(() => {
        // 用户点击"稍后处理"后的操作
        this.$message({
          type: 'info',
          message: '请记得及时处理紧急任务！'
        });
      });
    },

    // 处理紧急任务的方法
    handleUrgentTasks(urgentTasks) {
      // 这里可以实现具体的处理逻辑，比如跳转到第一个紧急任务
      if (urgentTasks.length > 0) {
        this.openRepairDialog(urgentTasks[0]);
      }
    },

    submitRepairTask() {
      this.$setToken();
      instance.post('/api/publictask', this.form)
          .then(r => {
            if (r.data.success) {
              this.$message.success('提交成功');
              this.dialogVisible = false; // 成功时关闭对话框
            } else {
              this.$message.error(r.data.errorMsg);
            }
          })
          .catch(() => this.$message.error('提交失败'));
    },
    goToHome() {
      this.$router.push('/layout/home').catch(() => {
      });
    },
    watch: {
      // 监听 displayList 数据变化，自动检查紧急任务
      displayList: {
        handler(newVal) {
          if (newVal && newVal.length > 0) {
            this.$nextTick(() => {
              this.checkUrgentTasks();
            });
          }
        },
        deep: true,
        immediate: true
      }
    },

  }
};
</script>

<style scoped>


.video-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.detection-mode-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.camera-mode-select {
  width: 120px;
}

.camera-mode-select .el-input__inner {
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(0, 212, 255, 0.5) !important;
  color: #fff !important;
  font-size: 12px !important;
  height: 28px !important;
  line-height: 28px !important;
}

.camera-mode-select .el-input__inner:focus {
  border-color: #00d4ff !important;
}

.camera-mode-select .el-input__suffix {
  color: #00d4ff !important;
}

@media (max-width: 768px) {
  .video-panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .detection-mode-selector {
    width: 100%;
  }

  .camera-mode-select {
    width: 100%;
  }
}

.custom-label {
  color: #00d4ff;
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.monitor-screen {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  outline: none;
  overflow-x: hidden;
  transition: all 0.3s ease;
  padding-top: 100px; /* 为固定头部留出空间 */
}

/* 历史视频按钮样式 */
.history-btn {
  background: linear-gradient(45deg, #52c41a, #73d13d) !important;
  border: none !important;
  color: #fff !important;
  box-shadow: 0 0 15px rgba(82, 196, 26, 0.3) !important;
  transition: all 0.3s ease !important;
}

.history-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 5px 20px rgba(82, 196, 26, 0.5) !important;
}

/* 录制按钮样式 */
.recording-controls {
  position: absolute;
  top: 10px;
  right: 10px;
}

.record-btn {
  background: linear-gradient(45deg, #ff4d4f, #ff7875) !important;
  border: none !important;
  color: #fff !important;
  font-size: 12px !important;
  padding: 5px 10px !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.3) !important;
  transition: all 0.3s ease !important;
}

.record-btn[type="success"] {
  background: linear-gradient(45deg, #52c41a, #73d13d) !important;
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3) !important;
}

.record-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.5) !important;
}

/* 历史视频对话框样式 */
.history-dialog {
  z-index: 2000;
}

.history-content {
  max-height: 600px;
  overflow-y: auto;
}

.history-filters {
  background: rgba(16, 142, 233, 0.1);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  color: #00d4ff;
  font-weight: 600;
  white-space: nowrap;
}
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
/* 大屏模式样式 - 关键修改 */
/* 大屏模式样式 - 压缩优化 */
.fullscreen-mode {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: #000;
  padding: 0;
}

.header-section {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(90deg, rgba(0, 212, 255, 0.1) 0%, rgba(16, 142, 233, 0.1) 100%);
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  padding: 8px 20px; /* 减少padding */
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.tech-select-fullscreen-active .el-input__inner { background: rgba(0,0,0,0.3) !important; }
:deep(.el-select-dropdown) {
  z-index: 9999 !important;
}

.fullscreen-mode {
  overflow: visible !important;
  position: relative;
}
.home-btn {
  background: linear-gradient(45deg, #52c41a, #73d13d) !important;
  border: none !important;
  color: #fff !important;
  box-shadow: 0 0 15px rgba(82,196,26,0.3) !important;
  transition: all 0.3s ease !important;
}
.home-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 5px 20px rgba(82,196,26,0.5) !important;
}
.video-panel.selected { border: 2px solid #52c41a !important; }



.header-minimized {
  padding: 5px 15px; /* 进一步压缩 */
  background: rgba(0, 0, 0, 0.9);
  opacity: 0.95;
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
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: pulse 2s infinite;
}

.main-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #00d4ff, #108ee9);
  -webkit-background-clip: text;
  background-clip: text;
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
.camera-control-bar {
  display: flex;
  justify-content: center;
  padding: 10px 0;
  margin-bottom: 20px;
}

.camera-control-btn {
  min-width: 160px;
  padding: 10px 20px;
  font-size: 16px !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.camera-control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.video-grid-section {
  padding: 30px 40px;
  max-width: 1400px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

/* 视频网格 - 大屏模式优化 */
.video-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  max-width: none;
  margin: 0;
  padding: 50px 10px 10px 10px; /* 减少padding */
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

.refresh-btn, .export-btn {
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* 大屏模式下的检测模式选择器样式 */
.fullscreen-detection-selector {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.7);
  padding: 6px 12px;
  border-radius: 6px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  z-index: 10;
  justify-content: center; /* 水平居中 */

}

.detection-label {
  color: #00d4ff;
  font-size: 12px;
  white-space: nowrap;
  font-weight: 500;
}

.fullscreen-mode-select {
  min-width: 100px;
}

.fullscreen-mode-select .el-input__inner {
  background: rgba(0, 212, 255, 0.1) !important;
  border: 1px solid rgba(0, 212, 255, 0.3) !important;
  color: #00d4ff !important;
  font-size: 12px !important;
  height: 28px !important;
  line-height: 28px !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
}

.fullscreen-mode-select .el-input__inner:focus {
  border-color: #00d4ff !important;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2) !important;
}

.fullscreen-mode-select .el-input__inner:hover {
  border-color: rgba(0, 212, 255, 0.5) !important;
}

.fullscreen-mode-select .el-input__suffix {
  color: #00d4ff !important;
}

.fullscreen-mode-select .el-select__caret {
  color: #00d4ff !important;
}

/* 大屏模式下的录制控制按钮样式 */
.fullscreen-recording-controls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 10;
}

.fullscreen-record-btn {
  background: rgba(0, 0, 0, 0.7) !important;
  border: 1px solid rgba(0, 212, 255, 0.3) !important;
  color: #00d4ff !important;
  backdrop-filter: blur(10px);
  border-radius: 6px !important;
  padding: 6px 12px !important;
  font-size: 12px !important;
  transition: all 0.3s ease !important;
}

.fullscreen-record-btn:hover {
  background: rgba(0, 212, 255, 0.2) !important;
  border-color: #00d4ff !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 212, 255, 0.3);
}

.fullscreen-record-btn.el-button--danger {
  background: rgba(255, 77, 79, 0.2) !important;
  border-color: rgba(255, 77, 79, 0.5) !important;
  color: #ff4d4f !important;
}

.fullscreen-record-btn.el-button--danger:hover {
  background: rgba(255, 77, 79, 0.3) !important;
  border-color: #ff4d4f !important;
}

.fullscreen-record-btn.el-button--success {
  background: rgba(82, 196, 26, 0.2) !important;
  border-color: rgba(82, 196, 26, 0.5) !important;
  color: #52c41a !important;
}

.fullscreen-record-btn.el-button--success:hover {
  background: rgba(82, 196, 26, 0.3) !important;
  border-color: #52c41a !important;
}

/* 优化现有的tech-select样式以与主题更好匹配 */
.tech-select .el-input__inner {
  background: rgba(0, 212, 255, 0.1) !important;
  border: 1px solid rgba(0, 212, 255, 0.3) !important;
  color: #00d4ff !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
}

.tech-select .el-input__inner:focus {
  border-color: #00d4ff !important;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2) !important;
}

.tech-select .el-input__inner:hover {
  border-color: rgba(0, 212, 255, 0.5) !important;
}

.tech-select .el-input__suffix {
  color: #00d4ff !important;
}

.tech-select .el-select__caret {
  color: #00d4ff !important;
}

/* 摄像头模式选择器样式优化 */
.camera-mode-select .el-input__inner {
  background: rgba(0, 212, 255, 0.1) !important;
  border: 1px solid rgba(0, 212, 255, 0.3) !important;
  color: #00d4ff !important;
  font-size: 12px !important;
  height: 24px !important;
  line-height: 24px !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
}

.camera-mode-select .el-input__inner:focus {
  border-color: #00d4ff !important;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2) !important;
}

.camera-mode-select .el-input__inner:hover {
  border-color: rgba(0, 212, 255, 0.5) !important;
}

.camera-mode-select .el-input__suffix {
  color: #00d4ff !important;
}

.camera-mode-select .el-select__caret {
  color: #00d4ff !important;
}


/* 针对fullscreen模式的特殊处理 */
.fullscreen-mode .el-select-dropdown {
  background: rgba(0, 0, 0, 0.9) !important;
  border: 1px solid rgba(0, 212, 255, 0.5) !important;
  box-shadow: 0 12px 40px rgba(0, 212, 255, 0.3) !important;
}

.history-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: none;
  border: none;
}

.list-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.list-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
  }
}

.list-header h3 {
  font-size: 1.4rem;
  margin-bottom: 6px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
  position: relative;
  z-index: 1;
  font-weight: 600;
}

.list-info {
  font-size: 0.9rem;
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

.list-info strong {
  color: #ffd700;
  font-weight: 600;
}



/* Element UI Table 样式覆盖 */
.tech-table {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.tech-table ::v-deep .el-table {
  height: 100%;
}

.tech-table ::v-deep .el-table__header-wrapper {
  background: transparent;
}

.tech-table ::v-deep .el-table__header th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  font-size: 12px !important;
  text-align: center !important;
  padding: 12px 8px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.tech-table ::v-deep .el-table__body-wrapper {
  background: white;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.tech-table ::v-deep .el-table__row {
  background: rgba(255, 255, 255, 0.9) !important;
  transition: all 0.2s ease !important;
}

.tech-table ::v-deep .el-table__row:nth-child(even) {
  background: rgba(102, 126, 234, 0.02) !important;
}

.tech-table ::v-deep .el-table__row:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.tech-table ::v-deep .el-table td {
  padding: 12px 8px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
  font-size: 12px !important;
  color: #333 !important;
}

/* 自定义单元格样式 */
.filename-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.file-icon {
  color: #667eea;
  font-size: 14px;
}

.camera-tag {
  background: linear-gradient(135deg, #a8e6cf, #88d8a3) !important;
  color: #2d3436 !important;
  border: none !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  padding: 2px 8px !important;
  font-size: 11px !important;
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #666;
}

.time-cell i {
  color: #667eea;
  font-size: 12px;
}

.file-size-tag {
  background: linear-gradient(135deg, #ffeaa7, #fab1a0) !important;
  color: #2d3436 !important;
  border: none !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  padding: 2px 8px !important;
  font-size: 11px !important;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  border-radius: 16px !important;
  padding: 6px 12px !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  min-width: 60px !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.play-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
}

.download-btn {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
  color: white !important;
}

.action-btn i {
  font-size: 12px !important;
}

/* 加载动画样式 */
.tech-table ::v-deep .el-loading-mask {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(3px) !important;
}

.tech-table ::v-deep .el-loading-spinner {
  color: #667eea !important;
}

/* 弹窗适配样式 */
@media (max-width: 1200px) {
  .list-header h3 {
    font-size: 1.2rem;
  }

  .tech-table ::v-deep .el-table th,
  .tech-table ::v-deep .el-table td {
    padding: 10px 6px !important;
  }

  .action-btn {
    padding: 5px 10px !important;
    font-size: 10px !important;
    min-width: 50px !important;
  }
}

@media (max-width: 768px) {
  .list-header {
    padding: 12px 16px;
  }

  .list-header h3 {
    font-size: 1.1rem;
    margin-bottom: 4px;
  }

  .list-info {
    font-size: 0.8rem;
  }

  .table-container {
    padding: 12px;
  }

  .tech-table ::v-deep .el-table th,
  .tech-table ::v-deep .el-table td {
    padding: 8px 4px !important;
  }

  .action-btn {
    padding: 4px 8px !important;
    font-size: 9px !important;
    min-width: 45px !important;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .filename-cell {
    gap: 4px;
  }

  .time-cell {
    gap: 2px;
  }
}

/* 表格滚动条美化 */
.tech-table ::v-deep .el-table__body-wrapper::-webkit-scrollbar {
  width: 6px;
}

.tech-table ::v-deep .el-table__body-wrapper::-webkit-scrollbar-track {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 3px;
}

.tech-table ::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 3px;
}

.tech-table ::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd8, #6a42a0);
}

/* 表格行进入动画 */
.tech-table ::v-deep .el-table__row {
  animation: slideInUp 0.4s ease forwards;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

::v-deep .beautiful-dialog {
  .el-dialog {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  }

  .el-dialog__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 0;
    border-radius: 12px 12px 0 0;
  }

  .el-dialog__body {
    padding: 20px;
    background: #fafafa;
  }

  .el-dialog__footer {
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
    padding: 15px 20px;
  }
}

.dialog-title-beautiful {
  color: white;
  padding: 18px 25px;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  .title-icon {
    margin-right: 12px;
    font-size: 24px;
    animation: pulse 2s infinite;
  }

  .title-text {
    font-weight: 600;
    flex: 1;
  }

  .title-actions {
    .close-btn {
      color: rgba(255, 255, 255, 0.8);
      font-size: 18px;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        transform: rotate(90deg);
      }
    }
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.dialog-content {
  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 15px;

    .search-input {
      flex: 1;
      max-width: 300px;
    }
  }

  .video-list {
    .video-item {
      display: flex;
      align-items: center;
      background: white;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .video-thumbnail {
        position: relative;
        width: 160px;
        height: 90px;
        border-radius: 6px;
        overflow: hidden;
        margin-right: 15px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-duration {
          position: absolute;
          bottom: 5px;
          right: 5px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }
      }

      .video-info {
        flex: 1;

        h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }

        p {
          margin: 0 0 10px 0;
          color: #7f8c8d;
          font-size: 14px;
          line-height: 1.4;
        }

        .video-meta {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: #95a5a6;

          span {
            &:first-child::before {
              content: '📅 ';
            }
            &:last-child::before {
              content: '👁 ';
            }
          }
        }
      }

      .video-actions {
        display: flex;
        flex-direction: column;
        gap: 5px;

        .el-button {
          padding: 5px 10px;
          font-size: 12px;
        }
      }
    }
  }
}

/* 科技风格对话框 */
.tech-dialog {
  --primary-color: #00d4ff;
  --secondary-color: #0066cc;
  --bg-dark: #1a1a1a;
  --bg-lighter: #2d2d2d;
  --border-color: #333;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --shadow-color: rgba(0, 212, 255, 0.3);
}

.tech-dialog :deep(.el-dialog) {
  background: linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-lighter) 100%);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.5),
      0 0 30px var(--shadow-color),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.tech-dialog :deep(.el-dialog)::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
  transparent 0%,
  var(--primary-color) 50%,
  transparent 100%);
  animation: pulse 2s ease-in-out infinite;
}

.tech-dialog :deep(.el-dialog__header) {
  padding: 20px 24px 0;
  border-bottom: none;
  background: transparent;
}

.tech-dialog :deep(.el-dialog__title) {
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 0 10px var(--primary-color);
  letter-spacing: 0.5px;
}

.tech-dialog :deep(.el-dialog__body) {
  padding: 20px 24px 24px;
  color: var(--text-primary);
}

.tech-dialog :deep(.el-dialog__headerbtn) {
  display: none;
}

.video-player-content {
  position: relative;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg,
  rgba(0, 212, 255, 0.1) 0%,
  rgba(0, 102, 204, 0.1) 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(5px);
}

.video-info h3 {
  margin: 0 0 12px 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 0 8px var(--primary-color);
}

.video-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.video-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 14px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.video-meta span i {
  color: var(--primary-color);
  font-size: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.close-btn {
  color: var(--text-secondary) !important;
  font-size: 18px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.close-btn:hover {
  color: var(--primary-color) !important;
  background: rgba(0, 212, 255, 0.1);
  border-color: var(--primary-color);
  transform: scale(1.1);
}

.player-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  border: 2px solid var(--border-color);
  box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(0, 212, 255, 0.2);
}

.history-video-player {
  width: 100%;
  height: 480px;
  background: #000;
  outline: none;
  border: none;
}


.video-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 10;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0, 212, 255, 0.3);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 0 10px var(--primary-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tech-dialog :deep(.el-dialog) {
    width: 95vw !important;
    margin: 0 auto;
  }

  .player-header {
    flex-direction: column;
    gap: 16px;
  }

  .video-meta {
    flex-direction: column;
    gap: 8px;
  }

  .history-video-player {
    height: 300px;
  }
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 滚动条美化 */
.tech-dialog :deep(.el-dialog__body)::-webkit-scrollbar {
  width: 8px;
}

.tech-dialog :deep(.el-dialog__body)::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.tech-dialog :deep(.el-dialog__body)::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--primary-color), var(--secondary-color));
  border-radius: 4px;
}

.tech-dialog :deep(.el-dialog__body)::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #00e6ff, #0080ff);
}

/* 入场动画 */
.tech-dialog :deep(.el-dialog) {
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

</style>
