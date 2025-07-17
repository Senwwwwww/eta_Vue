<template>
  <div class="maintenance-records">
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
        <div class="stat-item">
          <div class="stat-number">{{ totalTasks }}</div>
          <div class="stat-label">总任务数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ pendingTasks }}</div>
          <div class="stat-label">待维修</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ workingTasks }}</div>
          <div class="stat-label">维修中</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ completedTasks }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
    </div>

    <el-row :gutter="24">
      <el-col :span="18">
        <el-card class="table-card" shadow="hover">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-document-checked"></i>
              待检修任务列表
            </span>
            <div class="header-actions">
              <el-select
                  v-model="statusFilter"
                  placeholder="筛选状态"
                  size="small"
                  clearable
                  @change="handleStatusFilter"
                  style="width: 120px; margin-right: 10px;"
                  :popper-append-to-body="true"
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
               class="return-home-btn"
               size="small"
              @click="goToHomePage"
              >
               返回主页
            </el-button>
            </div>
          </div>

          <div class="table-container">
            <el-table
                :data="paginatedData"
                border
                stripe
                height="450"
                class="maintenance-table"
                :header-cell-style="{ background: '#f8f9fa', color: '#333' }"
                v-loading="loading"
            >
              <el-table-column prop="task" label="任务类型" width="120">
                <template slot-scope="scope">
                  <el-tag :type="getTaskType(scope.row.task)" size="mini">
                    {{ scope.row.task }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="data" label="任务内容" width="200" show-overflow-tooltip />
              <el-table-column prop="priority" label="优先级" width="100" align="center">
                <template slot-scope="scope">
                  <el-tag :type="getPriorityType(scope.row.priority)" size="mini">
                    {{ scope.row.priority || '普通' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="startTime" label="发布时间" width="160">
                <template slot-scope="scope">
                  <div class="time-cell">
                    <i class="el-icon-time"></i>
                    {{ formatDateTime(scope.row.startTime) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="110" align="center">
                <template slot-scope="scope">
                  <el-tag :type="getStatusType(scope.row.status)" size="small">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" align="center">
                <template slot-scope="scope">
                  <el-button
                      v-if="scope.row.status === '维修中' || scope.row.status === '已完成'"
                      size="mini"
                      icon="el-icon-view"
                      @click="handleView(scope.row)"
                  >
                    查看
                  </el-button>
                  <el-button
                      v-if="scope.row.status === '维修中' && scope.row.employeeId === getCurrentEmployeeId()"
                      size="mini"
                      type="success"
                      icon="el-icon-check"
                      @click="handleComplete(scope.row)"
                  >
                    完成
                  </el-button>
                  <el-button
                      v-else-if="scope.row.status === '待维修'"
                      size="mini"
                      type="primary"
                      icon="el-icon-check"
                      @click="handleAccept(scope.row)"
                  >
                    接取
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="pagination.currentPage"
                  :page-sizes="[10, 20, 50]"
                  :page-size="pagination.pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="filteredAttendanceData.length"
                  background
              >
              </el-pagination>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <!-- 当前维修任务卡片 -->
        <el-card class="chart-card current-task-card" shadow="hover">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-s-claim"></i>
              当前维修中任务
            </span>
          </div>
          <div v-if="currentWorkingTask" class="current-task-content">
            <div class="task-info">
              <p><strong>任务类型：</strong>{{ currentWorkingTask.task }}</p>
              <p><strong>任务内容：</strong>{{ currentWorkingTask.data }}</p>
              <p><strong>发布时间：</strong>{{ formatDateTime(currentWorkingTask.startTime) }}</p>
              <p><strong>优先级：</strong>
                <el-tag :type="getPriorityType(currentWorkingTask.priority)" size="mini">
                  {{ currentWorkingTask.priority || '普通' }}
                </el-tag>
              </p>
            </div>
            <div class="task-actions">
              <el-button
                  type="success"
                  size="small"
                  icon="el-icon-check"
                  @click="handleComplete(currentWorkingTask)"
              >
                完成任务
              </el-button>
            </div>
          </div>
          <div v-else class="empty-task">
            <i class="el-icon-s-opportunity"></i>
            <p>当前暂无维修中的任务</p>
          </div>
        </el-card>

        <!-- 任务统计卡片 -->
        <el-card class="chart-card stats-card" shadow="hover" style="margin-top: 20px;">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-s-data"></i>
              任务统计
            </span>
          </div>
          <div class="stats-content">
            <div class="progress-item">
              <div class="progress-label">
                <span>完成率</span>
                <span class="progress-percentage">{{ completionRate }}%</span>
              </div>
              <el-progress
                  :percentage="completionRate"
                  :color="getProgressColor(completionRate)"
                  :stroke-width="8"
              ></el-progress>
            </div>
            <div class="quick-stats">
              <div class="quick-stat">
                <i class="el-icon-time"></i>
                <span>平均完成时间</span>
                <span class="stat-value">{{ averageCompletionTime }}</span>
              </div>
              <div class="quick-stat">
                <i class="el-icon-warning"></i>
                <span>紧急任务</span>
                <span class="stat-value">{{ urgentTasks }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务详情对话框 -->
    <el-dialog
        title="检修任务详情"
        :visible.sync="dialogVisible"
        width="600px"
        class="task-detail-dialog"
    >
      <el-form :model="selectedTask" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务类型">
              <el-tag :type="getTaskType(selectedTask.task)">{{ selectedTask.task }}</el-tag>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级">
              <el-tag :type="getPriorityType(selectedTask.priority)">
                {{ selectedTask.priority || '普通' }}
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="任务内容">
          <span>{{ selectedTask.data }}</span>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发布时间">
              <span>{{ formatDateTime(selectedTask.startTime) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="完成时间" v-if="selectedTask.endTime && selectedTask.endTime !== '未完成'">
              <span>{{ formatDateTime(selectedTask.endTime) }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态">
          <el-tag :type="getStatusType(selectedTask.status)">{{ selectedTask.status }}</el-tag>
        </el-form-item>
        <el-form-item label="备注" v-if="selectedTask.notes">
          <span>{{ selectedTask.notes }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button
            v-if="selectedTask.status === '待维修'"
            type="primary"
            @click="handleAccept(selectedTask)"
        >
          接取任务
        </el-button>
        <el-button
            v-if="selectedTask.status === '维修中' && selectedTask.employeeId === getCurrentEmployeeId()"
            type="success"
            @click="handleComplete(selectedTask)"
        >
          完成任务
        </el-button>
      </div>
    </el-dialog>

    <!-- 完成任务对话框 -->
    <el-dialog
        title="完成任务"
        :visible.sync="completeDialogVisible"
        width="500px"
    >
      <el-form :model="completeForm" label-width="100px">
        <el-form-item label="完成情况">
          <el-input
              v-model="completeForm.notes"
              type="textarea"
              :rows="4"
              placeholder="请描述任务完成情况..."
          ></el-input>
        </el-form-item>
        <el-form-item label="完成时间">
          <el-date-picker
              v-model="completeForm.completionTime"
              type="datetime"
              placeholder="选择完成时间"
              style="width: 100%"
              :default-time="['00:00:00']"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button type="success" @click="confirmComplete">确认完成</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { instance } from '@/util/request';
import moment from 'moment';

export default {
  data() {
    return {
      attendanceData: [],
      filteredAttendanceData: [],
      currentWorkingTask: null,
      dialogVisible: false,
      completeDialogVisible: false,
      selectedTask: {},
      completeForm: {
        notes: '',
        completionTime: new Date()
      },
      statusFilter: '',
      loading: false,
      pagination: {
        currentPage: 1,
        pageSize: 10
      }
    };
  },
  computed: {
    totalTasks() {
      return this.attendanceData.length;
    },
    pendingTasks() {
      return this.attendanceData.filter(task => task.status === '待维修').length;
    },
    workingTasks() {
      return this.attendanceData.filter(task => task.status === '维修中').length;
    },
    completedTasks() {
      return this.attendanceData.filter(task => task.status === '已完成').length;
    },
    urgentTasks() {
      return this.attendanceData.filter(task => task.priority === '紧急').length;
    },
    completionRate() {
      if (this.totalTasks === 0) return 0;
      return Math.round((this.completedTasks / this.totalTasks) * 100);
    },

    averageCompletionTime() {
      const completedTasks = this.attendanceData.filter(task =>
          task.status === '已完成' && task.startTime && task.endTime && task.endTime !== '未完成'
      );

      if (completedTasks.length === 0) return '无数据';

      let totalHours = 0;
      completedTasks.forEach(task => {
        const start = moment(task.startTime);
        const end = moment(task.endTime);
        totalHours += end.diff(start, 'hours', true);
      });

      const avgHours = totalHours / completedTasks.length;
      if (avgHours < 24) {
        return `${avgHours.toFixed(1)}小时`;
      } else {
        return `${(avgHours / 24).toFixed(1)}天`;
      }
    },
    paginatedData() {
      const start = (this.pagination.currentPage - 1) * this.pagination.pageSize;
      const end = start + this.pagination.pageSize;
      return this.filteredAttendanceData.slice(start, end);
    }
  },
  methods: {
    formatDateTime(dateTime) {
      if (!dateTime || dateTime === '未完成') return dateTime === '未完成' ? '未完成' : '--';
      return moment(dateTime).format('YYYY-MM-DD HH:mm');
    },
    getCurrentEmployeeId() {
      return this.$store.state.admin.admin.data.data.employeeDTO?.employeeId;
    },
    getRealName(){
      return this.$store.state.admin.admin.data.data.employeeDTO?.realName;
    },
    getTaskType(task) {
      const map = {
        '预防性维护': 'info',
        '故障维修': 'danger',
        '定期检查': 'warning',
        '升级改造': 'success',
        '应急维修': 'danger',
      };
      return map[task] || 'info';
    },
    getStatusType(status) {
      const map = {
        '已完成': 'success',
        '待维修': 'danger',
        '维修中': 'warning',
        '未定义': 'info',
      };
      return map[status] || 'info';
    },
    getPriorityType(priority) {
      const map = {
        '紧急': 'danger',
        '高': 'warning',
        '普通': 'info',
        '低': 'success',
      };
      return map[priority] || 'info';
    },
    getProgressColor(percentage) {
      if (percentage < 30) return '#f56c6c';
      if (percentage < 70) return '#e6a23c';
      return '#67c23a';
    },
    // 更新当前维修中的任务
    updateCurrentWorkingTask() {
      this.currentWorkingTask = this.attendanceData.find(
          (item) => item.status === '维修中' && item.employeeId === this.getCurrentEmployeeId()
      );
    },
    handleStatusFilter() {
      if (this.statusFilter === '') {
        this.filteredAttendanceData = this.attendanceData;
      } else {
        this.filteredAttendanceData = this.attendanceData.filter(
            task => task.status === this.statusFilter
        );
      }
      this.pagination.currentPage = 1;
    },
    handleView(row) {
      this.selectedTask = row;
      this.dialogVisible = true;
    },
    handleAccept(row) {
      this.$confirm('确定要接取此任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.acceptTask(row);
      });
    },
    acceptTask(task) {
      this.loading = true;
      this.$setToken();

      // 构造更新数据，将状态改为"维修中"
      const updateData = {
        employeeDTO: this.$store.state.admin.admin.data.data.employeeDTO,
        priority: task.originalData.priority,
        data: task.data,
        task: task.originalData.task,
        clockInStatus: '维修中',
        clockInStartTime: task.originalData.clockInStartTime,
        clockInEndTime: null,
        attendanceInfoId: task.originalData.attendanceInfoId,
      };

      instance.post('/user/updateTaskStatus', updateData)
          .then((res) => {
            if (res.data.success) {
              this.$message.success('接取成功！');

              // 更新任务状态
              task.status = '维修中';
              task.employeeId = this.getCurrentEmployeeId();

              // 立即更新当前维修中的任务
              this.updateCurrentWorkingTask();

              // 更新筛选后的数据
              this.handleStatusFilter();

              this.dialogVisible = false;
            } else {
              this.$message.error(res.data.errorMsg || '接取失败');
            }
          })
          .catch(() => {
            this.$message.error('请求失败');
          })
          .finally(() => {
            this.loading = false;
          });
    },
    handleComplete(row) {
      this.selectedTask = row;
      this.completeForm = {
        notes: '',
        completionTime: new Date()
      };
      this.completeDialogVisible = true;
    },
    confirmComplete() {
      if (!this.completeForm.completionTime) {
        this.$message.warning('请选择完成时间');
        return;
      }

      this.loading = true;
      this.$setToken();

      // 构造更新数据，将状态改为"已完成"
      const updateData = {
        employeeDTO: this.$store.state.admin.admin.data.data.employeeDTO,
        priority: this.selectedTask.originalData.priority,
        data: this.selectedTask.data,
        task: this.selectedTask.originalData.task,
        clockInStatus: '已完成',
        clockInStartTime: this.selectedTask.originalData.clockInStartTime,
        clockInEndTime: this.completeForm.completionTime,
        attendanceInfoId: this.selectedTask.originalData.attendanceInfoId,
      };

      instance.post('/user/updateTaskStatus', updateData)
          .then((res) => {
            if (res.data.success) {
              this.$message.success('任务完成！');

              // 更新任务状态
              this.selectedTask.status = '已完成';
              this.selectedTask.endTime = this.completeForm.completionTime;

              // 立即更新当前维修中的任务（清除已完成的任务）
              this.updateCurrentWorkingTask();

              // 更新筛选后的数据
              this.handleStatusFilter();

              this.completeDialogVisible = false;
              this.dialogVisible = false;
            } else {
              this.$message.error(res.data.errorMsg || '完成失败');
            }
          })
          .catch(() => {
            this.$message.error('请求失败');
          })
          .finally(() => {
            this.loading = false;
          });
    },
    fetchAttendanceData() {
      this.loading = true;
      this.$setToken();

      instance.get('/user/getAllAttendanceInfo')
          .then((res) => {
            if (res.data.success) {
              this.attendanceData = res.data.data.map((item) => ({
                employeeId: item.employeeDTO?.employeeId,
                id: item.attendanceInfoId,
                task: item.task,
                data: item.data,
                startTime: item.clockInStartTime,
                endTime: item.clockInEndTime || '未完成',
                priority: item.priority || '普通',
                status: item.clockInStatus || '未定义',
                notes: item.notes || '',
                originalData: item
              }));

              // 更新当前维修中的任务
              this.updateCurrentWorkingTask();

              this.handleStatusFilter();
            } else {
              this.$message.error(res.data.errorMsg || '获取任务失败');
            }
          })
          .catch((error) => {
            this.$message.error('获取任务失败'+error);
          })
          .finally(() => {
            this.loading = false;
          });
    },
    refreshData() {
      this.fetchAttendanceData();
      this.$message.success('数据已刷新');
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.pagination.currentPage = 1;
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
    }
  },
  mounted() {
    this.fetchAttendanceData();
  },
};
</script>

<style scoped>
.maintenance-records {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 84vh;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title-section h2 {
  color: #2c3e50;
  font-size: 28px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-section h2 i {
  color: #3498db;
}

.page-subtitle {
  color: #7f8c8d;
  margin: 5px 0 0 0;
  font-size: 14px;
}

.stats-section {
  display: flex;
  gap: 30px;
}

.stat-item {
  text-align: center;
  padding: 10px 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-width: 80px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

.table-card, .chart-card {
  border-radius: 12px;
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title i {
  color: #3498db;
}

.header-actions {
  display: flex;
  align-items: center;
}

.maintenance-table {
  border-radius: 8px;
  overflow: hidden;
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
}

.time-cell.urgent {
  color: #f56c6c;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}

.current-task-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.current-task-card .card-title {
  color: white;
}

.current-task-content {
  padding: 10px 0;
}

.task-info p {
  margin: 8px 0;
  line-height: 1.6;
}

.task-actions {
  margin-top: 20px;
  text-align: center;
}

.empty-task {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
  margin-top: 20px;
}

.empty-task i {
  font-size: 48px;
  margin-bottom: 10px;
  display: block;
}

.stats-card {
  background: white;
}

.stats-content {
  padding: 10px 0;
}

.progress-item {
  margin-bottom: 20px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.progress-percentage {
  font-weight: bold;
  color: #409eff;
}

.quick-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.quick-stat {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.quick-stat i {
  color: #409eff;
  font-size: 16px;
}

.stat-value {
  margin-left: auto;
  font-weight: bold;
  color: #2c3e50;
}

.task-detail-dialog .el-dialog__body {
  padding: 20px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 20px;
  }

  .stats-section {
    flex-wrap: wrap;
    gap: 10px;
  }

  .stat-item {
    min-width: 60px;
    padding: 8px 15px;
  }
}

/* 动画效果 */
.maintenance-table tbody tr:hover {
  background-color: #f5f7fa;
  transition: background-color 0.3s ease;
}

.el-card {
  transition: all 0.3s ease;
}

.el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 标签样式增强 */
.el-tag {
  border-radius: 12px;
  font-weight: 500;
}

/* 按钮样式增强 */
.el-button {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.table-container {
  overflow: visible !important;
}
.status-filter-popper {
  z-index: 9999 !important;
  position: absolute !important;
}
.return-home-btn {
  background-color: green !important;
  color: green !important;
  border-color: #409EFF !important;
  margin-left: 10px;
}

</style>

