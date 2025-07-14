<template>
  <div class="status-management">
    <!-- 顶部操作栏 -->
    <div class="header-section">
      <div class="title-section">
        <h2 class="page-title">
          <i class="el-icon-edit"></i>
          检修任务状态管理
        </h2>
        <p class="page-subtitle">管理员专用 - 检修任务状态修改与跟踪</p>
      </div>
      <div class="action-section">
        <el-button
            size="medium"
            type="primary"
            icon="el-icon-refresh"
            @click="refreshData"
            class="refresh-btn"
        >
          刷新数据
        </el-button>

      </div>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="hover" :body-style="{ padding: '0px' }">
      <div class="filter-container">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select
                v-model="filters.status"
                placeholder="筛选状态"
                clearable
                @change="handleFilter"
            >
              <el-option label="全部状态" value=""></el-option>
              <el-option label="待维修" value="待维修"></el-option>
              <el-option label="维修中" value="维修中"></el-option>
              <el-option label="已完成" value="已完成"></el-option>
              <el-option label="未定义" value="未定义"></el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
                v-model="filters.taskType"
                placeholder="筛选任务类型"
                clearable
                @change="handleFilter"
            >
              <el-option label="全部类型" value=""></el-option>
              <el-option label="预防性维护" value="预防性维护"></el-option>
              <el-option label="故障维修" value="故障维修"></el-option>
              <el-option label="定期检查" value="定期检查"></el-option>
              <el-option label="升级改造" value="升级改造"></el-option>
              <el-option label="应急维修" value="应急维修"></el-option>
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-input
                v-model="filters.keyword"
                placeholder="搜索负责人或检修内容"
                clearable
                @clear="handleFilter"
                @keyup.enter.native="handleFilter"
            >
              <el-button slot="append" icon="el-icon-search" @click="handleFilter"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="handleFilter" icon="el-icon-search">搜索</el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-row :gutter="24">
      <!-- 左侧任务列表 -->
      <el-col :span="18">
        <el-card class="table-card" shadow="hover" :body-style="{ padding: '10px' }">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-list"></i>
              检修任务列表
            </span>
            <span class="record-count">共 {{ filteredData.length }} 条记录</span>
          </div>

          <div class="table-container">
            <el-table
                :data="paginatedData"
                border
                stripe
                height="350"
                class="maintenance-table"
                :header-cell-style="{ background: '#f8f9fa', color: '#333' }"
                @row-click="handleRowClick"
            >
              <el-table-column
                  prop="name"
                  label="负责人"
                  width="120"
                  sortable
                  show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <div class="name-cell">
                    <i class="el-icon-user-solid"></i>
                    <span>{{ scope.row.name }}</span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column
                  prop="task"
                  label="任务类型"
                  width="120"
                  sortable
              >
                <template slot-scope="scope">
                  <el-tag
                      size="mini"
                      :type="getTaskType(scope.row.task)"
                      effect="plain"
                  >
                    {{ scope.row.task }}
                  </el-tag>
                </template>
              </el-table-column>


              <el-table-column
                  prop="priority"
                  label="优先级"
                  width="120"
                  sortable
              >
                <template slot-scope="scope">
                  <el-tag
                      size="mini"
                      :type="getPriorityType(scope.row.priority)"
                      effect="plain"
                      :class="getPriorityClass(scope.row.priority)"
                  >
                    <i :class="getPriorityIcon(scope.row.priority)"></i>
                    {{ scope.row.priority }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column
                  prop="data"
                  label="检修内容"
                  min-width="170"
                  show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <div class="content-cell">
                    {{ scope.row.data }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column
                  prop="startTime"
                  label="发布时间"
                  width="140"
                  sortable
              >
                <template slot-scope="scope">
                  <div class="time-cell">
                    <i class="el-icon-time"></i>
                    <span>{{ formatDateTime(scope.row.startTime) }}</span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column
                  prop="status"
                  label="当前状态"
                  width="110"
                  sortable
                  align="center"
              >
                <template slot-scope="scope">
                  <el-tag
                      :type="getStatusType(scope.row.status)"
                      effect="dark"
                      size="small"
                      class="status-tag"
                  >
                    <i :class="getStatusIcon(scope.row.status)"></i>
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column
                  label="操作"
                  width="100"
                  align="center"
                  fixed="right"
              >
                <template slot-scope="scope">
                  <el-button
                      size="mini"
                      type="primary"
                      @click.stop="openStatusDialog(scope.row)"
                      icon="el-icon-edit"
                  >
                    修改
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
                  :page-sizes="[10, 20, 50, 100]"
                  :page-size="pagination.pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="filteredData.length"
              >
              </el-pagination>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧操作面板 -->
      <el-col :span="6">
        <!-- 快速统计 -->
        <el-card class="stats-card" shadow="hover">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-data-analysis"></i>
              状态统计
            </span>
          </div>
          <div class="stats-grid">
            <div class="stat-item pending">
              <div class="stat-number">{{ statusStats.待维修 || 0 }}</div>
              <div class="stat-label">待维修</div>
            </div>
            <div class="stat-item processing">
              <div class="stat-number">{{ statusStats.维修中 || 0 }}</div>
              <div class="stat-label">维修中</div>
            </div>
            <div class="stat-item completed">
              <div class="stat-number">{{ statusStats.已完成 || 0 }}</div>
              <div class="stat-label">已完成</div>
            </div>
            <div class="stat-item undefined">
              <div class="stat-number">{{ statusStats.未定义 || 0 }}</div>
              <div class="stat-label">未定义</div>
            </div>
          </div>
        </el-card>

      </el-col>
    </el-row>

    <!-- 状态修改对话框 -->
    <el-dialog
        title="修改检修任务状态"
        :visible.sync="statusDialog.visible"
        width="500px"
        :center="true"
        style="max-height: 100vh"
        @close="closeStatusDialog"
        top="5vh"
    >
      <div class="dialog-content" v-if="statusDialog.currentTask" style="padding-bottom: 0px;">
        <div class="task-info">
          <h4>任务信息</h4>
          <p><strong>负责人：</strong>{{ statusDialog.currentTask.name }}</p>
          <p><strong>任务类型：</strong>{{ statusDialog.currentTask.task }}</p>
          <p><strong>检修内容：</strong>{{ statusDialog.currentTask.data }}</p>
          <p><strong>当前状态：</strong>
            <el-tag :type="getStatusType(statusDialog.currentTask.status)">
              {{ statusDialog.currentTask.status }}
            </el-tag>
          </p>
        </div>

        <el-divider></el-divider>

        <div class="status-change">
          <h4>状态修改</h4>
          <el-form :model="statusDialog.form" label-width="70px">
            <el-form-item label="新状态">
              <el-select
                  v-model="statusDialog.form.newStatus"
                  placeholder="请选择新状态"
                  style="width: 100%"
              >
                <el-option label="待维修" value="待维修"></el-option>
                <el-option label="维修中" value="维修中"></el-option>
                <el-option label="已完成" value="已完成"></el-option>
                <el-option label="未定义" value="未定义"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="优先级">
              <el-select
                  v-model="statusDialog.form.newPriority"
                  placeholder="请选择优先级"
                  style="width: 100%"
              >
                <el-option label="紧急" value="紧急"></el-option>
                <el-option label="高" value="高"></el-option>
                <el-option label="普通" value="普通"></el-option>
                <el-option label="低" value="低"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="完成时间" v-if="statusDialog.form.newStatus === '已完成'">
              <el-date-picker
                  v-model="statusDialog.form.completionTime"
                  type="datetime"
                  placeholder="选择完成时间"
                  style="width: 100%"
                  :default-time="['00:00:00']"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item label="备注">
              <el-input
                  v-model="statusDialog.form.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入状态修改说明（可选）"
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="closeStatusDialog">取消</el-button>
        <el-button
            type="primary"
            @click="confirmStatusChange"
            :disabled="!statusDialog.form.newStatus"
        >
          确认修改
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {instance} from "@/util/request";
import moment from "moment";
import * as XLSX from "xlsx";

export default {
  data() {
    return {
      // 原始数据
      attendanceData: [],

      // 筛选条件
      filters: {
        status: '',
        taskType: '',
        keyword: ''
      },

      // 分页
      pagination: {
        currentPage: 1,
        pageSize: 10
      },

      // 状态修改对话框
      statusDialog: {
        id: '',
        visible: false,
        currentTask: null,
        form: {
          newStatus: '',
          completionTime: null,
          remark: '',
          newPriority: ''
        }
      },

      // 操作日志
      operationLogs: []
    };
  },

  computed: {
    // 过滤后的数据
    filteredData() {
      let data = [...this.attendanceData];

      // 状态筛选
      if (this.filters.status) {
        data = data.filter(item => item.status === this.filters.status);
      }

      // 任务类型筛选
      if (this.filters.taskType) {
        data = data.filter(item => item.task === this.filters.taskType);
      }

      // 关键词搜索
      if (this.filters.keyword) {
        const keyword = this.filters.keyword.toLowerCase();
        data = data.filter(item =>
            item.name.toLowerCase().includes(keyword) ||
            item.data.toLowerCase().includes(keyword)
        );
      }

      console.log(data);
      return data;
    },

    // 分页后的数据
    paginatedData() {
      const start = (this.pagination.currentPage - 1) * this.pagination.pageSize;
      const end = start + this.pagination.pageSize;
      return this.filteredData.slice(start, end);
    },

    // 状态统计
    statusStats() {
      const stats = {已完成: 0, 待维修: 0, 维修中: 0, 未定义: 0};
      this.attendanceData.forEach(item => {
        if (stats.hasOwnProperty(item.status)) {
          stats[item.status] += 1;
        } else {
          stats.未定义 += 1;
        }
      });
      return stats;
    },

    // 最近操作记录
    recentLogs() {
      return this.operationLogs
          .sort((a, b) => new Date(b.operationTime) - new Date(a.operationTime))
          .slice(0, 10);
    }
  },

  methods: {
    // 获取检修数据
    fetchAttendanceData() {
      this.$setToken();

      instance.get(`/user/getAllAttendanceInfo`)
          .then((response) => {
            if (response.data.success) {
              this.attendanceData = response.data.data.map((item) => ({
                id: item.attendanceInfoId,
                name: item.employeeDTO?.realName || '',
                data: item.data,
                task: item.task,
                startTime: item.clockInStartTime || '',
                endTime: item.clockInEndTime || '未完成',
                status: item.clockInStatus || "未定义",
                originalData: item,
                priority: item.priority || "普通"
              }));
            } else {
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch((error) => {
            this.$message.error("请求失败，请稍后重试"+error);
          });
    },

    // 刷新数据
    refreshData() {
      this.fetchAttendanceData();
      this.$message.success('数据已刷新');
    },

    // 筛选处理
    handleFilter() {
      this.pagination.currentPage = 1;
    },

    // 分页处理
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.pagination.currentPage = 1;
    },

    handleCurrentChange(val) {
      this.pagination.currentPage = val;
    },

    // 行点击
    handleRowClick(row) {
      this.openStatusDialog(row);
    },

    getPriorityType(priority) {
      const typeMap = {
        '紧急': 'danger',
        '高': 'warning',
        '普通': 'info',
        '低': 'success'
      };
      return typeMap[priority] || 'info';
    },

    // 获取优先级图标
    getPriorityIcon(priority) {
      const iconMap = {
        '紧急': 'el-icon-warning-outline',
        '高': 'el-icon-arrow-up',
        '普通': 'el-icon-minus',
        '低': 'el-icon-arrow-down'
      };
      return iconMap[priority] || 'el-icon-info';
    },

    // 获取优先级样式类
    getPriorityClass(priority) {
      const classMap = {
        '紧急': 'priority-urgent',
        '高': 'priority-high',
        '普通': 'priority-normal',
        '低': 'priority-low'
      };
      return classMap[priority] || 'priority-normal';
    },

    // 打开状态修改对话框
    openStatusDialog(task) {
      this.statusDialog.currentTask = task;
      this.statusDialog.id = task.id;
      this.statusDialog.form = {
        newStatus: task.status,
        completionTime: task.endTime !== '未完成' ? new Date(task.endTime) : null,
        remark: '',
        newPriority: task.priority,
      };
      this.statusDialog.visible = true;
    },

    // 关闭状态修改对话框
    closeStatusDialog() {
      this.statusDialog.visible = false;
      this.statusDialog.currentTask = null;
      this.statusDialog.form = {
        newStatus: '',
        completionTime: null,
        remark: '',
        newPriority: '',
      };
    },

    // 确认状态修改
    confirmStatusChange() {
      const form = this.statusDialog.form;
      console.log(form);
      this.attendanceData.forEach(task => {
        if (task.id === this.statusDialog.currentTask.id) {
          task.status = form.newStatus;
          task.completionTime = form.completionTime;
          task.remark = form.remark;
          task.priority=form.newPriority
          console.log('修改后的任务状态：', task.status);
          console.log('修改后的任务优先级：', task.priority);
        }
      });

      if (!form.newStatus) {
        this.$message.warning('请选择新状态');
        return;
      }
      if(form.newStatus!='已完成'){
        form.completionTime=null;
      }
      // 返回id为this.statusDialog.currentTask.id的那一条数据
      const task1 = this.attendanceData.find(task => task.id === this.statusDialog.currentTask.id);
      const update = {
        employeeDTO: task1.originalData.employeeDTO,
        priority: task1.priority,
        data: task1.data,
        task:task1.originalData.task,
        clockInStatus: task1.status,
        clockInStartTime: task1.originalData.clockInStartTime,
        clockInEndTime: form.completionTime,
        attendanceInfoId: task1.originalData.attendanceInfoId,
      }
      this.updateTaskStatus(update);
    },

    // 更新任务状态
    updateTaskStatus(updateData) {
      // 这里应该调用实际的API
      this.$setToken()
      instance.post(`/user/updateTaskStatus`, updateData).then(response => {
        if(response.data.success){
          this.$message.success("更新成功")
          // 关闭弹窗
          this.statusDialog.visible = false;
        }else {
          this.$message.error(response.data.errorMsg)
        }
      })

      // 模拟更新
      const taskIndex = this.attendanceData.findIndex(item => item.id === updateData.id);
      if (taskIndex !== -1) {
        const oldStatus = this.attendanceData[taskIndex].status;

        // 更新状态
        this.attendanceData[taskIndex].status = updateData.status;

        // 如果状态是已完成，更新完成时间
        if (updateData.status === '已完成' && updateData.completionTime) {
          this.attendanceData[taskIndex].endTime = updateData.completionTime;
        }

        // 记录操作日志
        this.addOperationLog({
          taskId: updateData.id,
          taskName: `${this.attendanceData[taskIndex].name} - ${this.attendanceData[taskIndex].task}`,
          oldStatus: oldStatus,
          newStatus: updateData.status,
          remark: updateData.remark,
          operationTime: new Date()
        });

        this.$message.success('状态修改成功');
        this.closeStatusDialog();
      }
    },

    // 添加操作日志
    addOperationLog(log) {
      this.operationLogs.unshift({
        id: Date.now(),
        ...log
      });

      // 只保留最近100条记录
      if (this.operationLogs.length > 100) {
        this.operationLogs = this.operationLogs.slice(0, 100);
      }
    },

    // 导出操作日志
    exportOperationLog() {
      if (this.operationLogs.length === 0) {
        this.$message.warning('暂无操作记录');
        return;
      }

      const data = this.operationLogs.map(log => ({
        '操作时间': moment(log.operationTime).format('YYYY-MM-DD HH:mm:ss'),
        '任务名称': log.taskName,
        '原状态': log.oldStatus,
        '新状态': log.newStatus,
        '备注': log.remark || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "操作日志");

      const fileName = `检修任务状态修改日志_${moment().format('YYYY-MM-DD')}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      this.$message.success('导出成功！');
    },

    // 时间格式化
    formatDateTime(dateTime) {
      if (!dateTime || dateTime === '未完成') {
        return dateTime === '未完成' ? '未完成' : '--';
      }

      const now = moment();
      const time = moment(dateTime);

      if (time.isSame(now, 'day')) {
        return `今天 ${time.format('HH:mm')}`;
      }

      if (time.isSame(now.subtract(1, 'day'), 'day')) {
        return `昨天 ${time.format('HH:mm')}`;
      }

      if (time.isSame(now, 'year')) {
        return time.format('MM-DD HH:mm');
      }

      return time.format('YYYY-MM-DD HH:mm');
    },

    // 获取任务类型标签颜色
    getTaskType(task) {
      const typeMap = {
        '预防性维护': 'info',
        '故障维修': 'danger',
        '定期检查': 'warning',
        '升级改造': 'success',
        '应急维修': 'danger'
      };
      return typeMap[task] || 'info';
    },

    // 获取状态标签类型
    getStatusType(status) {
      const typeMap = {
        '已完成': 'success',
        '待维修': 'danger',
        '维修中': 'warning',
        '未定义': 'info'
      };
      return typeMap[status] || 'info';
    },

    // 获取状态图标
    getStatusIcon(status) {
      const iconMap = {
        '已完成': 'el-icon-success',
        '待维修': 'el-icon-warning',
        '维修中': 'el-icon-loading',
        '未定义': 'el-icon-question'
      };
      return iconMap[status] || 'el-icon-info';
    }
  },

  mounted() {
    this.fetchAttendanceData();
  }
};
</script>

<style scoped>
.status-management {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  height: 83vh;
  overflow-y: hidden;
}

/* 顶部区域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 10px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.title-section .page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-section .page-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #909399;
}

.action-section {
  display: flex;
  gap: 12px;
}

.refresh-btn, .export-btn {
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.refresh-btn {
  background: linear-gradient(135deg, #67C23A 0%, #5CBB2A 100%);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.export-btn {
  background: linear-gradient(135deg, #409EFF 0%, #3A8BFF 100%);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.refresh-btn:hover, .export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* 筛选区域 */
.filter-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.filter-container {
  padding: 20px;
}

/* 卡片样式 */
.table-card, .stats-card, .log-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.table-card:hover, .stats-card:hover, .log-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e4e7ed;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-count {
  font-size: 12px;
  color: #909399;
  background: #f0f2f5;
  padding: 4px 8px;
  border-radius: 12px;
}

/* 表格样式 */
.table-container {
  padding: 20px;
}

.maintenance-table {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.maintenance-table ::v-deep .el-table__body tr:hover > td {
  background-color: #f8f9ff !important;
}

.name-cell, .time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.name-cell i {
  color: #409EFF;
}

.time-cell i {
  color: #67C23A;
}

.content-cell {
  line-height: 1.4;
}

.status-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

/* 分页 */
.pagination-container {
  margin-top: 20px;
  text-align: center;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.stat-item.completed .stat-number {
  color: #67C23A;
}

.stat-item.pending .stat-number {
  color: #F56C6C;
}

.stat-item.processing .stat-number {
  color: #E6A23C;
}

.stat-item.undefined .stat-number {
  color: #909399;
}

/* 日志卡片 */
.log-container {
  padding: 16px;
  max-height: 280px;
  overflow-y: auto;
}

.log-item {
  padding: 12px;
  margin-bottom: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
  transition: all 0.3s ease;
}

.log-item:hover {
  background: #e8f4ff;
  transform: translateX(4px);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-time {
  font-size: 12px;
  color: #909399;
}

.log-content {
  color: #303133;
}

.log-task {
  font-weight: 500;
  display: block;
  margin-bottom: 4px;
}

.log-detail {
  font-size: 12px;
  color: #666;
}

.no-logs {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 40px 0;
}

/* 对话框样式 */
.dialog-content {
  padding: 20px;
}

.task-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.task-info h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
}

.task-info p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.status-change h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
}

.dialog-footer {
  text-align: right;
  padding: 16px 0 0 0;
}
.el-card {
  padding: 0px;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1200px) {
  .status-management {
    padding: 16px;
  }

  .header-section {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .action-section {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .el-col {
    margin-bottom: 16px;
  }

  .filter-container .el-col {
    margin-bottom: 12px;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .stat-item {
    padding: 12px 8px;
  }

  .stat-number {
    font-size: 20px;
  }

  .log-container {
    max-height: 300px;
  }

  .dialog-content {
    padding: 16px;
  }

  .priority-urgent {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%) !important;
    color: white !important;
    border: none !important;
    font-weight: 600 !important;
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3) !important;
    animation: pulse 2s infinite;
  }

  .priority-high {
    background: linear-gradient(135deg, #ffa726 0%, #ff9800 100%) !important;
    color: white !important;
    border: none !important;
    font-weight: 500 !important;
    box-shadow: 0 2px 8px rgba(255, 167, 38, 0.3) !important;
  }

  .priority-normal {
    background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%) !important;
    color: white !important;
    border: none !important;
    font-weight: 400 !important;
    box-shadow: 0 2px 8px rgba(102, 187, 106, 0.3) !important;
  }

  .priority-low {
    background: linear-gradient(135deg, #42a5f5 0%, #2196f3 100%) !important;
    color: white !important;
    border: none !important;
    font-weight: 400 !important;
    box-shadow: 0 2px 8px rgba(66, 165, 245, 0.3) !important;
  }

  /* 紧急优先级的脉冲动画 */
  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 4px 16px rgba(255, 107, 107, 0.5);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
    }
  }

  /* 优先级标签内图标样式 */
  .priority-urgent i,
  .priority-high i,
  .priority-normal i,
  .priority-low i {
    margin-right: 4px;
    font-size: 12px;
  }

  /* 悬停效果 */
  .priority-urgent:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4) !important;
  }

  .priority-high:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 167, 38, 0.4) !important;
  }

  .priority-normal:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 187, 106, 0.4) !important;
  }

  .priority-low:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(66, 165, 245, 0.4) !important;
  }



}

</style>