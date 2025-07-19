

<template>
  <div class="instrument-management">
    <!-- 主功能卡片 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span style="font-size: 20px; font-weight: bold">设备管理</span>
        <div class="header-buttons">
          <el-button type="success" @click="showAddDialog">添加设备</el-button>
          <el-button type="primary" @click="showQRDialog">生成二维码</el-button>
          <el-button type="info" @click="showHistoryDialog">查看历史记录</el-button>
          <el-button type="warning" @click="batchUpdateInspection">批量更新巡检状态</el-button>
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
          <el-option label="待巡检" value="pending_inspection"></el-option>
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
        <el-table-column label="操作" width="400">
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
            <el-button size="mini" type="info" @click="viewInstrumentHistory(scope.row.instrumentId)">
              查看历史
            </el-button>
            <el-button
                v-if="scope.row.status === 'pending_inspection'"
                size="mini"
                type="success"
                @click="completeInspection(scope.row)"
            >
              完成巡检
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

    <!-- 历史记录对话框 -->
    <el-dialog
        title="设备历史记录"
        :visible.sync="historyDialogVisible"
        width="60%"
        top="5vh"
    >
      <div class="history-filters">
        <el-select v-model="historyFilter.instrumentId" placeholder="选择设备" @change="loadHistoryData">
          <el-option label="全部设备" value=""></el-option>
          <el-option
              v-for="instrument in instrumentList"
              :key="instrument.instrumentId"
              :label="instrument.name"
              :value="instrument.instrumentId"
          />
        </el-select>
        <el-select v-model="historyFilter.employeeId" placeholder="选择操作员" @change="loadHistoryData">
          <el-option label="全部操作员" value=""></el-option>
          <el-option
              v-for="employee in employeeList"
              :key="employee.employeeId"
              :label="employee.name"
              :value="employee.employeeId"
          />
        </el-select>
        <el-select v-model="historyFilter.status" placeholder="筛选状态" @change="loadHistoryData">
          <el-option label="全部状态" value=""></el-option>
          <el-option label="正常" value="normal"></el-option>
          <el-option label="维修中" value="repairing"></el-option>
          <el-option label="故障" value="broken"></el-option>
          <el-option label="待巡检" value="pending_inspection"></el-option>
        </el-select>
        <el-button type="primary" @click="loadHistoryData">查询</el-button>
      </div>

      <el-table
          :data="historyList"
          border
          style="width: 100%; margin-top: 20px;"
          v-loading="historyLoading"
      >
        <el-table-column prop="historyInstrumentId" label="记录ID" width="100" />
        <el-table-column prop="instrument.name" label="设备名称" width="150" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="记录时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.time) }}
          </template>
        </el-table-column>
        <el-table-column prop="employee.realName" label="操作员" width="120" />
        <el-table-column prop="employee.department.departmentName" label="部门" width="120" />
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button size="mini" type="text" @click="viewHistoryDetail(scope.row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 历史记录分页 -->
      <el-pagination
          @current-change="handleHistoryPageChange"
          :current-page="historyCurrentPage"
          :page-size="historyPageSize"
          :total="historyTotal"
          layout="total, prev, pager, next"
          style="margin-top: 20px; text-align: center;"
      >
      </el-pagination>
    </el-dialog>

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
            <el-option label="待巡检" value="pending_inspection" />
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

    <!-- 历史记录详情对话框 -->
    <el-dialog title="历史记录详情" :visible.sync="historyDetailDialogVisible" width="600px">
      <div v-if="selectedHistoryRecord">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录ID">{{ selectedHistoryRecord.historyInstrumentId }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ selectedHistoryRecord.instrument?.name }}</el-descriptions-item>
          <el-descriptions-item label="设备详情">{{ selectedHistoryRecord.instrument?.detail }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedHistoryRecord.status)" size="small">
              {{ getStatusText(selectedHistoryRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="记录时间">{{ formatTime(selectedHistoryRecord.time) }}</el-descriptions-item>
          <el-descriptions-item label="操作员">{{ selectedHistoryRecord.employee?.realName }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ selectedHistoryRecord.employee?.department?.departmentName }}</el-descriptions-item>
          <el-descriptions-item label="员工ID">{{ selectedHistoryRecord.employee?.employeeId }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { instance } from "@/util/request";
import dayjs from 'dayjs';

export default {
  name: 'InstrumentManagement',
  data() {
    return {
      loading: false,
      instrumentList: [],
      employeeList: [], // 员工列表
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
        employeeDTO: {},
      },

      // 二维码对话框
      qrDialogVisible: false,
      qrForm: {
        id: ''
      },
      qrCodeBase64: '',

      // 历史记录相关
      historyDialogVisible: false,
      historyDetailDialogVisible: false,
      historyList: [],
      historyLoading: false,
      historyCurrentPage: 1,
      historyPageSize: 10,
      historyTotal: 0,
      selectedHistoryRecord: null,
      historyFilter: {
        instrumentId: '',
        employeeId: '',
        status: ''
      },

      // 定时器
      inspectionTimer: null
    };
  },

  mounted() {
    this.loadInstruments();
    this.loadEmployees();
    this.startInspectionTimer();
  },

  beforeDestroy() {
    if (this.inspectionTimer) {
      clearInterval(this.inspectionTimer);
    }
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
    // 新增历史维修记录方法
    async createMaintenanceHistory(instrument, oldStatus, newStatus) {
      try {
        this.$setToken();
        const historyRecord = {
          instrument: instrument,
          status: newStatus,
          time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          employee: {
            employeeId: this.getCurrentEmployeeId(),
            realName: this.getRealName(),
            department: this.getCurrentUserDepartment(),
            employeeIsDelete:0,
            userId: this.getCurrentUserId(),
          }
        };

        const response = await instance.post('/api/history-instruments', historyRecord);

        if (response.status === 201) {
          console.log('历史维修记录创建成功');
        }
      } catch (error) {
        console.error('创建历史维修记录失败:', error);
        // 可以选择是否显示错误信息给用户
        // this.$message.warning('创建历史记录失败，但设备状态已更新');
      }
    },

    // 加载员工列表
    async loadEmployees() {
      try {
        this.$setToken();
        const response = await instance.get('/api/employees');
        this.employeeList = response.data;
      } catch (error) {
        console.error('加载员工列表失败:', error);
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
      this.instrumentDialogVisible = true;
    },

    // 保存设备
    // 修改保存设备方法
    async saveInstrument() {
      if (!this.instrumentForm.name.trim()) {
        this.$message.warning('请输入设备名称');
        return;
      }

      try {
        this.$setToken();
        let response;

        // 获取旧状态（仅在编辑时需要）
        const oldStatus = this.isEdit ?
            this.instrumentList.find(i => i.instrumentId === this.instrumentForm.instrumentId)?.status :
            null;

        if (this.isEdit) {
          response = await instance.put(`/api/instruments/${this.instrumentForm.instrumentId}`, this.instrumentForm);
        } else {
          this.instrumentForm.instrumentId = null;
          response = await instance.post('/api/instruments', this.instrumentForm);
        }

        if (response.status === 200 || response.status === 201) {
          this.$message.success(this.isEdit ? '设备更新成功' : '设备添加成功');

          // 如果是编辑且状态发生变化，创建历史维修记录
          console.log(this.isEdit);
          console.log(oldStatus);
          console.log(this.instrumentForm.status);
          if (this.isEdit && oldStatus && oldStatus !== this.instrumentForm.status) {
            await this.createMaintenanceHistory(
                this.instrumentForm,
                oldStatus,
                this.instrumentForm.status
            );
          }

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

        if (response.status === 204 || response.status === 200) {
          this.$message.success('设备删除成功');
          this.loadInstruments();
        } else {
          this.$message.error('删除失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除设备失败:', error);
          this.$message.error('删除设备失败');
        }
      }
    },
    getCurrentEmployeeId() {
      return this.$store.state.admin.admin.data.data.employeeDTO?.employeeId;
    },
    getRealName(){
      return this.$store.state.admin.admin.data.data.employeeDTO?.realName;
    },

    // 显示维修任务对话框
    showRepairDialog(instrument) {
      this.repairForm = {
        title: `${instrument.name} 维修任务`,
        data: `设备ID: ${instrument.instrumentId}, 设备名称: ${instrument.name}, 当前状态: ${this.getStatusText(instrument.status)}`,
        task: '设备维修',
        priority: instrument.status === 'broken' ? '紧急' : '普通',
        employeeDTO: {}
      };
      this.repairDialogVisible = true;
    },

    // 提交维修任务
    async submitRepairTask() {

      try {
        this.$setToken();
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
        }
      } catch (err) {
        console.error(err);
        this.$message.error('生成二维码失败');
      }
    },

    // 下载二维码
    downloadQRCode() {
      const link = document.createElement('a');
      link.href = this.qrCodeBase64;
      link.download = `qrcode_${this.qrForm.id}.png`;
      link.click();
    },

    // 显示历史记录对话框
    showHistoryDialog() {
      this.historyDialogVisible = true;
      this.historyCurrentPage = 1;
      this.historyFilter = {
        instrumentId: '',
        employeeId: '',
        status: ''
      };
      this.loadHistoryData();
    },

    // 加载历史数据
    async loadHistoryData() {
      try {
        this.historyLoading = true;
        this.$setToken();

        let url = '/api/history-instruments/page';
        const params = {
          page: this.historyCurrentPage - 1,
          size: this.historyPageSize,
          sortBy: 'time',
          sortDir: 'desc'
        };

        // 根据筛选条件构建不同的请求URL
        if (this.historyFilter.instrumentId) {
          url = `/api/history-instruments/instrument/${this.historyFilter.instrumentId}/page`;
        } else if (this.historyFilter.employeeId) {
          url = `/api/history-instruments/employee/${this.historyFilter.employeeId}/page`;
        } else if (this.historyFilter.status) {
          // 如果只有状态过滤，需要使用普通接口然后手动分页
          const statusResponse = await instance.get(`/api/history-instruments/status/${this.historyFilter.status}`);
          this.historyList = statusResponse.data;
          this.historyTotal = statusResponse.data.length;
          return;
        }

        const response = await instance.get(url, { params });

        if (response.data.content) {
          this.historyList = response.data.content;
          this.historyTotal = response.data.totalElements;
        } else {
          this.historyList = response.data;
          this.historyTotal = response.data.length;
        }
      } catch (error) {
        console.error('加载历史数据失败:', error);
        this.$message.error('加载历史数据失败');
      } finally {
        this.historyLoading = false;
      }
    },

    // 查看指定设备的历史记录
    async viewInstrumentHistory(instrumentId) {
      this.historyFilter.instrumentId = instrumentId;
      this.historyFilter.employeeId = '';
      this.historyFilter.status = '';
      this.historyCurrentPage = 1;
      this.historyDialogVisible = true;
      this.loadHistoryData();
    },

    // 查看历史记录详情
    viewHistoryDetail(record) {
      this.selectedHistoryRecord = record;
      this.historyDetailDialogVisible = true;
    },

    // 创建历史记录
    async createHistoryRecord(instrument, status) {
      try {
        this.$setToken();
        const historyRecord = {
          instrument: instrument,
          status: status,
          time: dayjs().format('HH:mm:ss'),
          employee: {
            employeeId: this.getCurrentEmployeeId(),
            realName: this.getRealName(),
            department: this.getCurrentUserDepartment(),
            employeeIsDelete:0,
            userId: this.getCurrentUserId(),
          }
        };

        await instance.post('/api/history-instruments', historyRecord);
      } catch (error) {
        console.error('创建历史记录失败:', error);
      }
    },

    // 修改完成巡检方法
    async completeInspection(instrument) {
      try {
        await this.$confirm('确认完成巡检吗？', '提示', {
          type: 'info'
        });

        this.$setToken();
        const oldStatus = instrument.status;
        const updatedInstrument = {
          ...instrument,
          status: 'normal',
          lastInspectionTime: new Date()
        };

        const response = await instance.put(`/api/instruments/${instrument.instrumentId}`, updatedInstrument);

        if (response.status === 200) {
          this.$message.success('巡检完成');

          // 创建历史维修记录
          await this.createMaintenanceHistory(
              instrument,
              oldStatus,
              'normal'
          );

          this.loadInstruments();
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('完成巡检失败:', error);
          this.$message.error('完成巡检失败');
        }
      }
    },
    // 修改批量更新巡检状态方法
    async batchUpdateInspection() {
      try {
        await this.$confirm('确认将所有符合条件的设备状态更新为"待巡检"吗？', '提示', {
          type: 'warning'
        });

        this.$setToken();
        const oneWeekAgo = dayjs().subtract(7, 'day').toDate();

        // 获取需要更新的设备列表
        const devicesToUpdate = this.instrumentList.filter(device => {
          const lastInspection = device.lastInspectionTime ? new Date(device.lastInspectionTime) : null;
          return (!lastInspection || lastInspection < oneWeekAgo);
        });

        if (devicesToUpdate.length === 0) {
          this.$message.info('没有需要更新的设备');
          return;
        }

        // 批量更新设备状态
        for (const device of devicesToUpdate) {
          const oldStatus = device.status;
          const updatedDevice = {
            ...device,
            status: 'pending_inspection'
          };

          await instance.put(`/api/instruments/${device.instrumentId}`, updatedDevice);

          // 创建历史维修记录
          await this.createMaintenanceHistory(
              device,
              oldStatus,
              'pending_inspection'
          );
        }

        this.$message.success(`成功更新 ${devicesToUpdate.length} 台设备状态为待巡检`);
        this.loadInstruments();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量更新失败:', error);
          this.$message.error('批量更新失败');
        }
      }
    },


    // 启动巡检定时器（每小时检查一次）
    startInspectionTimer() {
      this.inspectionTimer = setInterval(() => {
        this.checkAndUpdateInspectionStatus();
      }, 3600000); // 1小时 = 3600000毫秒
    },

    // 修改自动检查巡检状态方法
    async checkAndUpdateInspectionStatus() {
      try {
        this.$setToken();
        const oneWeekAgo = dayjs().subtract(7, 'day').toDate();

        // 获取需要更新的设备列表
        const devicesToUpdate = this.instrumentList.filter(device => {
          const lastInspection = device.lastInspectionTime ? new Date(device.lastInspectionTime) : null;
          return device.status === 'normal' && (!lastInspection || lastInspection < oneWeekAgo);
        });

        if (devicesToUpdate.length > 0) {
          // 批量更新设备状态
          for (const device of devicesToUpdate) {
            const oldStatus = device.status;
            const updatedDevice = {
              ...device,
              status: 'pending_inspection'
            };

            await instance.put(`/api/instruments/${device.instrumentId}`, updatedDevice);

            // 创建历史维修记录
            await this.createMaintenanceHistory(
                device,
                oldStatus,
                'pending_inspection'
            );
          }

          // 刷新设备列表
          this.loadInstruments();

          // 可选：显示通知
          console.log(`自动更新了 ${devicesToUpdate.length} 台设备状态为待巡检`);
        }
      } catch (error) {
        console.error('自动检查巡检状态失败:', error);
      }
    },
    // 分页处理
    handleCurrentChange(page) {
      this.currentPage = page;
      // 这里可以添加分页逻辑，目前是前端分页
      // 如果需要后端分页，可以在这里调用API
    },

    // 历史记录分页处理
    handleHistoryPageChange(page) {
      this.historyCurrentPage = page;
      this.loadHistoryData();
    },

    // 获取状态标签类型
    getStatusType(status) {
      const statusTypes = {
        'normal': 'success',
        'repairing': 'warning',
        'broken': 'danger',
        'pending_inspection': 'info'
      };
      return statusTypes[status] || 'info';
    },

    // 获取状态文本
    getStatusText(status) {
      const statusTexts = {
        'normal': '正常',
        'repairing': '维修中',
        'broken': '故障',
        'pending_inspection': '待巡检'
      };
      return statusTexts[status] || '未知';
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '无';
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    },

    // 格式化时间
    formatTime(time) {
      if (!time) return '无';
      return time;
    },

    // 获取当前用户ID（需要根据实际的用户管理系统实现）
    getCurrentUserId() {
     return this.$store.state.admin.admin.data.data?.userId;
    },

    // 获取当前用户名称
    getCurrentUserName() {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      return userInfo.name || '系统管理员';
    },

    // 获取当前用户部门
    getCurrentUserDepartment() {
      return this.$store.state.admin.admin.data.data?.department;

    }
  }
};
</script>

<style scoped>
.instrument-management {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
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
  gap: 15px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

.history-filters {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
}

.history-filters .el-select {
  width: 150px;
}

.qr-generator-container {
  text-align: center;
}

.qr-result {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.qr-card {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 20px;
  background: #f9f9f9;
  text-align: center;
  max-width: 300px;
}

.qr-title {
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
}

.qr-image {
  width: 200px;
  height: 200px;
  margin: 15px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.qr-button-container {
  margin-top: 15px;
}

.qr-button {
  width: 100%;
}

.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-buttons {
    float: none;
    margin-top: 10px;
  }

  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .history-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .history-filters .el-select {
    width: 100%;
  }
}

/* 表格样式优化 */
.el-table {
  font-size: 14px;
}

.el-table .el-button--mini {
  padding: 5px 8px;
  font-size: 12px;
}

/* 状态标签样式 */
.el-tag {
  font-weight: 500;
}

/* 对话框样式 */
.el-dialog {
  border-radius: 8px;
}

.el-dialog__header {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #f0f0f0;
}

.el-dialog__body {
  padding: 20px;
}

/* 分页样式 */
.el-pagination {
  margin-top: 20px;
  text-align: center;
}

/* 加载状态样式 */
.el-loading-mask {
  background-color: rgba(255, 255, 255, 0.8);
}

/* 表单样式 */
.el-form-item {
  margin-bottom: 20px;
}

.el-form-item__label {
  font-weight: 500;
}

/* 按钮组样式 */
.el-button + .el-button {
  margin-left: 8px;
}

/* 描述列表样式 */
.el-descriptions {
  margin-top: 20px;
}

.el-descriptions__label {
  font-weight: 500;
}
</style>