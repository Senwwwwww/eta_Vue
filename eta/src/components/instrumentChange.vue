<template>
  <div class="instrument-management">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span style="font-size: 20px; font-weight: bold">设备管理</span>
        <div class="header-buttons">
          <el-button type="success" @click="showAddDialog">添加设备</el-button>
          <el-button type="primary" @click="showQRDialog">生成二维码</el-button>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索设备名称"
            class="search-input"
            @keyup.enter="searchInstruments"
        >
          <el-button slot="append" @click="searchInstruments">搜索</el-button>
        </el-input>
        <el-select v-model="statusFilter" placeholder="筛选状态" @change="filterByStatus">
          <el-option label="全部" value=""></el-option>
          <el-option label="正常" value="normal"></el-option>
          <el-option label="维修中" value="repairing"></el-option>
          <el-option label="故障" value="broken"></el-option>
        </el-select>
      </div>

      <!-- 设备表格 -->
      <el-table
          :data="instrumentList"
          border
          style="width: 100%"
          v-loading="loading"
      >
        <el-table-column prop="instrumentId" label="设备ID" width="100" />
        <el-table-column prop="name" label="设备名称" width="150" />
        <el-table-column prop="detail" label="设备详情" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag
                :type="getStatusType(scope.row.status)"
                size="small"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template #default="scope">
            <el-button size="mini" type="primary" @click="showEditDialog(scope.row)">
              编辑
            </el-button>
            <el-button size="mini" type="danger" @click="deleteInstrument(scope.row.instrumentId)">
              删除
            </el-button>
            <el-button
                v-if="scope.row.status === 'broken'"
                size="mini"
                type="warning"
                @click="showRepairDialog(scope.row)"
            >
              发布维修任务
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          style="margin-top: 20px; text-align: center;"
      >
      </el-pagination>
    </el-card>

    <!-- 添加/编辑设备对话框 -->
    <el-dialog
        :title="dialogTitle"
        :visible.sync="instrumentDialogVisible"
        width="500px"
    >
      <el-form :model="instrumentForm" label-width="100px" ref="instrumentForm">
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="instrumentForm.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备详情" prop="detail">
          <el-input
              type="textarea"
              v-model="instrumentForm.detail"
              placeholder="请输入设备详情"
              :rows="4"
          />
        </el-form-item>
        <el-form-item label="设备状态" prop="status">
          <el-select v-model="instrumentForm.status" placeholder="请选择状态">
            <el-option label="正常" value="normal" />
            <el-option label="维修中" value="repairing" />
            <el-option label="故障" value="broken" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="instrumentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveInstrument">确定</el-button>
      </div>
    </el-dialog>

    <!-- 发布维修任务对话框 -->
    <el-dialog title="发布维修任务" :visible.sync="repairDialogVisible" width="500px">
      <el-form :model="repairForm" label-width="100px">
        <el-form-item label="任务标题">
          <el-input v-model="repairForm.title" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input type="textarea" v-model="repairForm.data" :rows="4" />
        </el-form-item>
        <el-form-item label="维修类型">
          <el-select v-model="repairForm.task" placeholder="请选择">
            <el-option label="设备维修" value="设备维修" />
            <el-option label="电力" value="电力" />
            <el-option label="机械" value="机械" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="维修优先级">
          <el-select v-model="repairForm.priority" placeholder="请选择">
            <el-option label="紧急" value="紧急" />
            <el-option label="高" value="高" />
            <el-option label="普通" value="普通" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="repairDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRepairTask">确定</el-button>
      </div>
    </el-dialog>

    <!-- 二维码生成对话框 -->
    <el-dialog title="生成二维码" :visible.sync="qrDialogVisible" width="600px">
      <div class="qr-generator-container">
        <el-form :model="qrForm" label-width="100px" @submit.native.prevent="generateQRCode">
          <el-form-item label="设备ID">
            <el-input
                v-model="qrForm.id"
                placeholder="请输入设备ID"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="generateQRCode">生成二维码</el-button>
          </el-form-item>
        </el-form>

        <div v-if="qrCodeBase64" class="qr-result">
          <div class="qr-card">
            <h4 class="qr-title">生成结果</h4>
            <img :src="qrCodeBase64" alt="QR Code" class="qr-image" />
            <div class="qr-button-container">
              <el-button type="success" @click="downloadQRCode" class="qr-button">下载二维码</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { instance } from "@/util/request";
import dayjs from 'dayjs';
import {url} from "@/api/email"

export default {
  name: 'InstrumentManagement',
  data() {
    return {
      loading: false,
      instrumentList: [],
      searchKeyword: '',
      statusFilter: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,

      // 设备对话框
      instrumentDialogVisible: false,
      dialogTitle: '添加设备',
      isEdit: false,
      instrumentForm: {
        instrumentId: null,
        name: '',
        detail: '',
        status: 'normal'
      },

      // 维修任务对话框
      repairDialogVisible: false,
      repairForm: {
        title: '',
        data: '',
        task: '设备维修',
        priority: '普通',
        employeeDTO: {}
      },

      // 二维码对话框
      qrDialogVisible: false,
      qrForm: {
        id: ''
      },
      qrCodeBase64: ''
    };
  },

  mounted() {
    this.loadInstruments();
  },

  methods: {
    // 加载设备列表
    async loadInstruments() {
      try {
        this.loading = true;
        this.$setToken();
        const response = await instance.get('/api/instruments');
        this.instrumentList = response.data;
        this.total = response.data.length;
      } catch (error) {
        console.error('加载设备列表失败:', error);
        this.$message.error('加载设备列表失败');
      } finally {
        this.loading = false;
      }
    },

    // 搜索设备
    async searchInstruments() {
      if (!this.searchKeyword.trim()) {
        this.loadInstruments();
        return;
      }

      try {
        this.loading = true;
        this.$setToken();
        const response = await instance.get('/api/instruments/search', {
          params: { name: this.searchKeyword }
        });
        this.instrumentList = response.data;
        this.total = response.data.length;
      } catch (error) {
        console.error('搜索设备失败:', error);
        this.$message.error('搜索设备失败');
      } finally {
        this.loading = false;
      }
    },

    // 按状态筛选
    async filterByStatus() {
      if (!this.statusFilter) {
        this.loadInstruments();
        return;
      }

      try {
        this.loading = true;
        this.$setToken();
        const response = await instance.get(`/api/instruments/status/${this.statusFilter}`);
        this.instrumentList = response.data;
        this.total = response.data.length;
      } catch (error) {
        console.error('筛选设备失败:', error);
        this.$message.error('筛选设备失败');
      } finally {
        this.loading = false;
      }
    },

    // 显示添加对话框
    showAddDialog() {
      this.dialogTitle = '添加设备';
      this.isEdit = false;
      this.instrumentForm = {
        instrumentId: null,
        name: '',
        detail: '',
        status: 'normal'
      };
      this.instrumentDialogVisible = true;
    },

    // 显示编辑对话框
    showEditDialog(instrument) {
      this.dialogTitle = '编辑设备';
      this.isEdit = true;
      this.instrumentForm = { ...instrument };
      console.log(this.instrumentForm);
      this.instrumentDialogVisible = true;
    },

    // 保存设备
    async saveInstrument() {
      if (!this.instrumentForm.name.trim()) {
        this.$message.warning('请输入设备名称');
        return;
      }

      try {
        this.$setToken();
        let response;

        if (this.isEdit) {
          // 编辑设备
          response = await instance.put(`/api/instruments/${this.instrumentForm.instrumentId}`, this.instrumentForm);
        } else {
          // 添加设备
          this.instrumentForm.instrumentId = null;
          response = await instance.post('/api/instruments', this.instrumentForm);
        }

        if (response.status === 200 || response.status === 201) {
          this.$message.success(this.isEdit ? '设备更新成功' : '设备添加成功');
          this.instrumentDialogVisible = false;
          this.loadInstruments();
        }
      } catch (error) {
        console.error('保存设备失败:', error);
        this.$message.error('保存设备失败');
      }
    },

    // 删除设备
    async deleteInstrument(instrumentId) {
      try {
        await this.$confirm('确定删除该设备吗？', '提示', {
          type: 'warning'
        });

        this.$setToken();
        const response = await instance.delete(`/api/instruments/${instrumentId}`);

        if (response.data.success) {
          this.$message.success('设备删除成功');
          this.loadInstruments();
        } else {
          this.$message.error(response.data.message || '删除失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除设备失败:', error);
          this.$message.error('删除设备失败');
        }
      }
    },

    // 显示维修任务对话框
    showRepairDialog(instrument) {
      const time = dayjs().format('YYYY-MM-DD HH:mm');
      this.repairForm = {
        title: `${instrument.name} 维修任务`,
        data: `设备ID: ${instrument.instrumentId}, 设备名称: ${instrument.name}, 当前状态: ${this.getStatusText(instrument.status)}`,
        task: '设备维修',
        priority: instrument.status === 'fault' ? '紧急' : '普通',
        employeeDTO: {}
      };
      this.repairDialogVisible = true;
    },

    // 提交维修任务
    async submitRepairTask() {
      if (!this.repairForm.title.trim()) {
        this.$message.warning('请输入任务标题');
        return;
      }

      try {
        this.$setToken()
        const response = await instance.post('/api/publictask', this.repairForm);

        if (response.data.success) {
          this.$message.success('维修任务提交成功');
          this.repairDialogVisible = false;
        } else {
          this.$message.error(response.data.errorMsg || '提交失败');
        }
      } catch (error) {
        console.error('提交维修任务失败:', error);
        this.$message.error('维修任务提交失败');
      }






    },

    // 显示二维码对话框
    showQRDialog() {
      this.qrDialogVisible = true;
      this.qrForm.id = '';
      this.qrCodeBase64 = '';
    },

    // 生成二维码
    async generateQRCode() {
      if (!this.qrForm.id.trim()) {
        this.$message.warning('请输入设备ID');
        return;
      }

      try {
        this.$setToken();
        const url = `/qrcode/${encodeURIComponent(this.qrForm.id)}`;

        const response = await instance.get(url, {
          responseType: 'blob'
        });

        if (response.status === 200) {
          const blob = response.data;
          const reader = new FileReader();
          reader.onload = () => {
            this.qrCodeBase64 = reader.result;
            this.$message.success('二维码生成成功');
          };
          reader.readAsDataURL(blob);
        } else {
          this.$message.error('二维码生成失败，请检查设备ID');
        }
      } catch (err) {
        console.error(err);
        this.$message.error('生成二维码失败，请检查网络或服务器状态');
      }
    },

    // 下载二维码
    downloadQRCode() {
      const link = document.createElement('a');
      link.href = this.qrCodeBase64;
      link.download = `qrcode_${this.qrForm.id}.png`;
      link.click();
    },

    // 获取状态类型
    getStatusType(status) {
      const typeMap = {
        'normal': 'success',
        'repairing': 'warning',
        'broken': 'danger'
      };
      return typeMap[status] || 'info';
    },

    // 获取状态文本
    getStatusText(status) {
      const textMap = {
        'normal': '正常',
        'repairing': '维修中',
        'broken': '故障'
      };
      return textMap[status] || status;
    },

    // 分页处理
    handleCurrentChange(page) {
      this.currentPage = page;
      // 这里可以根据需要实现服务端分页
    }
  }
};
</script>

<style scoped>
.instrument-management {
  padding: 20px;
}

.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

.header-buttons {
  float: right;
}

.header-buttons .el-button {
  margin-left: 10px;
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
}

.search-input {
  width: 300px;
}

.dialog-footer {
  text-align: right;
}

.qr-generator-container {
  padding: 20px;
}

.qr-result {
  text-align: center;
  margin-top: 30px;
}

.qr-card {
  text-align: center;
  padding: 20px 30px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fafafa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.qr-title {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
}

.qr-image {
  max-width: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.qr-button-container {
  text-align: center;
  margin-top: 10px;
  width: 100%;
}

.qr-button {
  margin-top: 15px;
}
</style>