<template>
  <div class="container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span style="font-size: 18px; font-weight: bold;">器械二维码扫描</span>
      </div>

      <el-radio-group v-model="scanMode" @change="handleModeChange" style="margin-bottom: 20px;">
        <el-radio-button label="camera">摄像头扫描</el-radio-button>
        <el-radio-button label="upload">上传图片</el-radio-button>
        <el-radio-button label="manual">手动输入</el-radio-button>
      </el-radio-group>

<!--      <div v-if="scanMode === 'camera'" class="scanner-container" :key="scannerKey">-->
<!--        <div id="scanner" ref="scannerContainer"></div>-->
<!--        <div class="scanner-overlay" v-if="!cameraActive">-->
<!--          <div class="scan-frame"></div>-->
<!--        </div>-->
<!--      </div>-->
      <div v-if="scanMode === 'camera'" class="scanner-container" :key="scannerKey">
        <video ref="videoElement" autoplay muted playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
      </div>

      <div
          v-if="scanMode === 'upload'"
          class="upload-area"
          @click="$refs.fileInput.click()"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
      >
        <i class="el-icon-upload" style="font-size: 48px; color: #409EFF;"></i>
        <div style="margin-top: 10px;">
          <p>点击或拖拽二维码图片到此区域</p>
          <p style="color: #999; font-size: 14px;">支持 JPG、PNG、GIF 格式</p>
        </div>
        <input ref="fileInput" type="file" accept="image/*" @change="handleFileUpload" style="display: none;" />
      </div>

      <div v-if="scanMode === 'manual'">
        <el-input v-model="manualInput" placeholder="请输入器械ID或二维码内容" @keyup.enter="handleManualSubmit">
          <el-button slot="append" @click="handleManualSubmit">查询</el-button>
        </el-input>
      </div>

      <div v-if="scanResult" style="margin-top: 20px;">
        <el-alert :title="'扫描成功：' + scanResult" type="success" :closable="false" show-icon></el-alert>
      </div>

      <div v-if="instrumentInfo" class="instrument-info">
        <h3>器械信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="器械ID">{{ instrumentInfo.instrumentId }}</el-descriptions-item>
          <el-descriptions-item label="器械名称">{{ instrumentInfo.name }}</el-descriptions-item>
          <el-descriptions-item label="详细信息" :span="2">{{ instrumentInfo.detail }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusTagType(instrumentInfo.status)" class="status-tag">
              {{ getStatusText(instrumentInfo.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 20px;">
          <h4>修改状态</h4>
          <el-select v-model="newStatus" placeholder="请选择新状态" style="width: 200px;">
            <el-option label="正常" value="normal"></el-option>
            <el-option label="维修中" value="repairing"></el-option>
            <el-option label="故障" value="broken"></el-option>
            <el-option label="停用" value="disabled"></el-option>
          </el-select>
          <el-button type="primary" @click="updateInstrumentStatus" :loading="updating" style="margin-left: 10px;">
            更新状态
          </el-button>
        </div>
      </div>

      <div class="action-buttons">
        <el-button v-if="scanMode === 'camera'" @click="startCamera" :disabled="cameraActive">
          {{ cameraActive ? '扫描中...' : '开始扫描' }}
        </el-button>
        <el-button v-if="scanMode === 'camera'" @click="stopCamera" :disabled="!cameraActive">停止扫描</el-button>
        <el-button @click="resetScan" v-if="scanResult">重新扫描</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import Quagga from 'quagga';
import {instance} from "@/util/request";
import { BrowserQRCodeReader } from '@zxing/browser';
let codeReader = null;
import {url} from "@/api/email"
export default {
  name: 'InstrumentScanner',
  data() {
    return {
      scanMode: 'camera',
      scanResult: '',
      instrumentInfo: null,
      newStatus: '',
      updating: false,
      cameraActive: false,
      manualInput: '',
      scannerKey: 1, // 用于强制重新渲染scanner组件
    };
  },
  mounted() {
    this.initializeScanner();
  },
  beforeDestroy() {
    this.stopCamera();
  },
  methods: {
    handleModeChange() {
      this.resetScan();
      // 完全停止并清理
      this.stopCamera();

      if (this.scanMode === 'camera') {
        // 更新key强制重新渲染
        this.scannerKey++;
        // 等待DOM更新
        this.$nextTick(() => {
          this.initializeScanner();
        });
      } else {
        this.scannerKey++;
      }
    },

    // 新增：清理扫描器容器的方法
    clearScannerContainer() {
      const scannerElement = document.querySelector('#scanner');
      if (scannerElement) {
        // 清空容器内容
        scannerElement.innerHTML = '';

        // 移除所有可能的视频元素
        const videos = scannerElement.querySelectorAll('video');
        videos.forEach(video => {
          if (video.srcObject) {
            const stream = video.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
          }
          video.remove();
        });

        // 移除所有canvas元素
        const canvases = scannerElement.querySelectorAll('canvas');
        canvases.forEach(canvas => canvas.remove());
      }
    },

    initializeScanner() {
      if (this.scanMode !== 'camera') return;

      // 检查浏览器支持
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.$message.error('您的浏览器不支持摄像头功能');
        return;
      }

      // 延迟启动确保DOM完全准备好
      this.$nextTick(() => {
        setTimeout(() => {
          this.startCamera();
        }, 200);
      });
    },

    async startCamera() {
      const video = this.$refs.videoElement;
      if (!video) {
        this.$message.error('找不到 video 元素');
        return;
      }

      try {
        this.codeReader = new BrowserQRCodeReader();

        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 },
          }
        };

        const resultPromise = this.codeReader.decodeFromConstraints(constraints, video, (result, error) => {
          if (result) {
            const text = result.getText();
            console.log('扫码结果1111:', text);
            this.handleScanResult(text);
            this.stopCamera();
          }
        });

        this.cameraActive = true;
        this.$message.success('摄像头启动成功，请对准二维码');

        await resultPromise;
      } catch (err) {
        console.error('摄像头启动失败:', err);
        this.$message.error('摄像头启动失败');
        this.cameraActive = false;
      }
    },

    stopCamera() {
      if (this.codeReader) {
        this.codeReader.reset();
        this.codeReader = null;
      }
      this.cameraActive = false;
    },
    // 新增：清理媒体流的方法
    cleanupMediaStreams() {
      const scannerElement = this.$refs.scannerContainer;
      if (scannerElement) {
        const videos = scannerElement.querySelectorAll('video');
        videos.forEach(video => {
          if (video.srcObject) {
            const stream = video.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => {
              track.stop();
              console.log('媒体轨道已停止:', track.kind);
            });
            video.srcObject = null;
          }
        });
      }
    },


    handleFileUpload(e) {
      const file = e.target.files[0];
      if (file) this.processImageFile(file);
    },

    handleDragOver(e) {
      e.currentTarget.classList.add('dragover');
    },

    handleDragLeave(e) {
      e.currentTarget.classList.remove('dragover');
    },

    handleDrop(e) {
      e.currentTarget.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) this.processImageFile(files[0]);
    },

    async processImageFile(file) {
      try {
        this.$message.info('图片上传成功，正在解析二维码...');

        // 创建FormData对象来发送文件
        const formData = new FormData();
        formData.append('image', file);

        // 调用后端二维码解析API
        const response = await instance.post('/api/qrcode/parse', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data && response.data.success) {
          const qrContent = response.data.content;
          this.$message.success('二维码解析成功');
          this.handleScanResult(qrContent);
        } else {
          this.$message.error(response.data.message || '二维码解析失败');
        }
      } catch (error) {
        console.error('二维码解析错误:', error);
        if (error.response && error.response.data && error.response.data.message) {
          this.$message.error(error.response.data.message);
        } else {
          this.$message.error('二维码解析失败，请确保图片包含有效的二维码');
        }
      }
    },
    handleManualSubmit() {
      if (!this.manualInput.trim()) {
        this.$message.warning('请输入器械ID或二维码内容');
        return;
      }
      this.handleScanResult(this.manualInput);
    },

    handleScanResult(result) {

      console.log('扫码1111结果:', result);
      // 如果是 URL，就跳转
        setTimeout(() => {
          window.location.href = result; // 跳转到二维码中的 URL
        }, 200);
    },

    extractInstrumentId(qrContent) {
      // 尝试从URL中提取ID
      const match = qrContent.match(/[?&]id=([^&]+)/);
      return match ? match[1] : qrContent;
    },

    async fetchInstrumentInfo(id) {
      try {
        this.$setToken()
        const response = await instance.get(`/api/instruments/${id}`);

        if (response) {
          this.instrumentInfo = response.data;
          this.newStatus = this.instrumentInfo.status;
          this.$message.success('器械信息获取成功');
        } else {
          this.$message.error('获取器械信息失败');
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.$message.error('器械不存在，请检查ID是否正确');
        } else {
          this.$message.error('网络错误，请重试');
        }
      }
    },

    async updateInstrumentStatus() {
      if (!this.newStatus) {
        this.$message.warning('请选择新状态');
        return;
      }

      if (this.newStatus === this.instrumentInfo.status) {
        this.$message.info('状态未发生变化');
        return;
      }

      this.updating = true;
      try {
        this.$setToken()
        const response = await instance.put(`/api/instruments/${this.instrumentInfo.instrumentId}/status`, {
          status: this.newStatus
        });

        if (response.data && response.data.success) {
          this.instrumentInfo.status = this.newStatus;
          this.$message.success('状态更新成功');
        } else {
          this.$message.error(response.data.message || '状态更新失败');
        }
      } catch (error) {
        console.error('更新状态错误:', error);
        if (error.response && error.response.data && error.response.data.message) {
          this.$message.error(error.response.data.message);
        } else {
          this.$message.error('网络错误，请重试');
        }
      } finally {
        this.updating = false;
      }
    },

    // 改进的重置方法
    resetScan() {
      this.scanResult = '';
      this.instrumentInfo = null;
      this.newStatus = '';
      this.manualInput = '';
    },

    getStatusTagType(status) {
      const statusMap = {
        normal: 'success',
        repairing: 'warning',
        broken: 'danger',
        disabled: 'info'
      };
      return statusMap[status] || 'info';
    },

    getStatusText(status) {
      const statusMap = {
        normal: '正常',
        repairing: '维修中',
        broken: '故障',
        disabled: '停用'
      };
      return statusMap[status] || status;
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.scanner-container {
  position: relative;
  width: 100%;
  height: 400px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

#scanner {
  width: 100%;
  height: 100%;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.scan-frame {
  width: 200px;
  height: 200px;
  border: 3px solid #409EFF;
  border-radius: 12px;
  position: relative;
  background: transparent;
}

.scan-frame::before,
.scan-frame::after {
  content: '';
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid #409EFF;
}

.scan-frame::before {
  top: -3px;
  left: -3px;
  border-right: none;
  border-bottom: none;
}

.scan-frame::after {
  bottom: -3px;
  right: -3px;
  border-left: none;
  border-top: none;
}

.instrument-info {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.status-tag {
  margin-left: 10px;
}

.action-buttons {
  text-align: center;
  margin-top: 20px;
}

.upload-area {
  border: 2px dashed #409EFF;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.upload-area:hover {
  background: #f0f9ff;
}

.upload-area.dragover {
  background: #e6f7ff;
  border-color: #1890ff;
}
</style>