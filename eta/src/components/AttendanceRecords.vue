<template>
  <div class="maintenance-records">
    <!-- 顶部操作栏 -->
    <div class="header-section">
      <div class="title-section">
        <h2 class="page-title">
          <i class="el-icon-setting"></i>
          检修记录管理
        </h2>
        <p class="page-subtitle">系统设备检修记录与状态监控</p>
      </div>
      <div class="action-section">
        <el-button
            size="medium"
            type="primary"
            icon="el-icon-download"
            @click="exportExcel"
            class="export-btn"
        >
          导出记录
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧的检修记录表格 -->
      <el-col :span="18">
        <el-card class="table-card" shadow="hover">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-document"></i>
              检修记录列表
            </span>
            <span class="record-count">共 {{ attendanceData.length }} 条记录</span>
          </div>

          <div class="table-container">
            <el-table
                :data="attendanceData"
                border
                stripe
                height="450"
                id="el-table"
                class="maintenance-table"
                :header-cell-style="{ background: '#f8f9fa', color: '#333' }"
            >
              <el-table-column
                  prop="name"
                  label="检修负责人"
                  width="130"
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
                  label="检修类型"
                  width="120"
                  sortable
                  show-overflow-tooltip
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
                  prop="data"
                  label="检修内容"
                  width="400"
                  sortable
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
                  width="160"
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
                  prop="endTime"
                  label="完成时间"
                  width="160"
                  sortable
              >
                <template slot-scope="scope">
                  <div class="time-cell">
                    <i :class="scope.row.endTime === '未完成' ? 'el-icon-close' : 'el-icon-check'"></i>
                    <span :class="{ 'incomplete': scope.row.endTime === '未完成' }">
                      {{ formatDateTime(scope.row.endTime) }}
                    </span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column
                  prop="status"
                  label="状态"
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
            </el-table>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧的检修情况统计图 -->
      <el-col :span="6">
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-pie-chart"></i>
              检修状态统计
            </span>
          </div>
          <div ref="attendanceChart" class="chart-container"></div>

          <!-- 统计数据展示 -->
          <div class="stats-summary">
            <div class="stat-item completed">
              <div class="stat-number">{{ attendanceStats.已完成 || 0 }}</div>
              <div class="stat-label">已完成</div>
            </div>
            <div class="stat-item pending">
              <div class="stat-number">{{ attendanceStats.待维修 || 0 }}</div>
              <div class="stat-label">待维修</div>
            </div>
            <div class="stat-item processing">
              <div class="stat-number">{{ attendanceStats.维修中 || 0 }}</div>
              <div class="stat-label">维修中</div>
            </div>
            <div class="stat-item undefined">
              <div class="stat-number">{{ attendanceStats.未定义 || 0 }}</div>
              <div class="stat-label">未定义</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {instance} from "@/util/request";
import moment from "moment";
import * as echarts from "echarts";
import * as XLSX from "xlsx";

export default {
  data() {
    return {
      attendanceData: [], // 存储检修数据
      attendanceStats: {}, // 存储统计数据
    };
  },
  methods: {
    // 格式化时间显示
    formatDateTime(dateTime) {
      if (!dateTime || dateTime === '未完成') {
        return dateTime === '未完成' ? '未完成' : '--';
      }

      const now = moment();
      const time = moment(dateTime);

      // 如果是今天，显示"今天 HH:mm"
      if (time.isSame(now, 'day')) {
        return `今天 ${time.format('HH:mm')}`;
      }

      // 如果是昨天，显示"昨天 HH:mm"
      if (time.isSame(now.subtract(1, 'day'), 'day')) {
        return `昨天 ${time.format('HH:mm')}`;
      }

      // 如果是本年，显示"MM-DD HH:mm"
      if (time.isSame(now, 'year')) {
        return time.format('MM-DD HH:mm');
      }

      // 否则显示完整日期
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
    },

    // 导出Excel
    exportExcel() {
      const data = this.attendanceData.map(row => ({
        '检修负责人': row.name,
        '检修类型': row.task,
        '检修内容': row.data,
        '检修发布时间': row.startTime,
        '检修完成时间': row.endTime,
        '状态': row.status
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "检修记录");

      const fileName = `检修记录_${moment().format('YYYY-MM-DD')}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      this.$message.success('导出成功！');
    },

    // 获取检修数据
    fetchAttendanceData() {
      this.$setToken();

      instance
          .get(`/user/getAllAttendanceInfo`)
          .then((response) => {
            if (response.data.success) {
              this.attendanceData = response.data.data.map((item) => ({
                name: item.employeeDTO?.realName,
                data: item.data,
                task: item.task,
                startTime: item.clockInStartTime || '',
                endTime: item.clockInEndTime || '未完成',
                status: item.clockInStatus || "未定义",
              }));

              this.attendanceStats = this.calculateAttendanceStats(this.attendanceData);
              this.renderAttendanceChart();
            } else {
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch((error) => {
            this.$message.error("请求失败，请稍后重试");
          });
    },

    // 计算统计数据
    calculateAttendanceStats(data) {
      const stats = {已完成: 0, 待维修: 0, 未定义: 0, 维修中: 0};
      data.forEach((item) => {
        if (stats.hasOwnProperty(item.status)) {
          stats[item.status] += 1;
        } else {
          stats.未定义 += 1;
        }
      });
      return stats;
    },

    // 渲染饼图
    renderAttendanceChart() {
      const chart = echarts.init(this.$refs.attendanceChart);
      const option = {
        title: {
          text: "检修状态分布",
          left: "center",
          textStyle: {
            fontSize: 14,
            fontWeight: 'bold',
            color: '#333'
          }
        },
        tooltip: {
          trigger: "item",
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          bottom: "5",
          left: "center",
          itemWidth: 12,
          itemHeight: 12,
          textStyle: {
            fontSize: 12
          }
        },
        series: [
          {
            name: "检修状态",
            type: "pie",
            radius: ["35%", "60%"],
            center: ["50%", "40%"],
            data: [
              {
                value: this.attendanceStats.已完成,
                name: "已完成",
                itemStyle: {color: "#67C23A"}
              },
              {
                value: this.attendanceStats.待维修,
                name: "待维修",
                itemStyle: {color: "#F56C6C"}
              },
              {
                value: this.attendanceStats.维修中,
                name: "维修中",
                itemStyle: {color: "#E6A23C"}
              },
              {
                value: this.attendanceStats.未定义,
                name: "未定义",
                itemStyle: {color: "#909399"}
              }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
            label: {
              show: true,
              formatter: '{b}\n{c}项',
              fontSize: 11
            }
          },
        ],
      };
      chart.setOption(option);

      // 响应式调整
      window.addEventListener('resize', () => {
        chart.resize();
      });
    },
  },
  mounted() {
    this.fetchAttendanceData();
  },
};
</script>

<style scoped>
.maintenance-records {
  padding: 10px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 83vh;
}

/* 顶部区域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow-y: hidden;
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

.export-btn {
  background: linear-gradient(135deg, #409EFF 0%, #3A8BFF 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

/* 卡片样式 */
.table-card, .chart-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.table-card:hover, .chart-card:hover {
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
  padding: 0px;
}

.maintenance-table {
  border-radius: 8px;
  overflow: hidden;
}

.maintenance-table ::v-deep .el-table__header-wrapper {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.maintenance-table ::v-deep .el-table__body tr:hover > td {
  background-color: #f8f9ff !important;
}

/* 表格单元格内容 */
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

.time-cell .el-icon-close {
  color: #F56C6C !important;
}

.time-cell .incomplete {
  color: #F56C6C;
  font-style: italic;
}

.content-cell {
  line-height: 1.4;
  max-height: 40px;
  overflow: hidden;
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

/* 图表容器 */
.chart-container {
  width: 100%;
  height: 280px;
  margin-top: 10px;
}

/* 统计数据展示 */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
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
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .maintenance-records {
    padding: 16px;
  }

  .header-section {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .el-col {
    margin-bottom: 16px;
  }

  .stats-summary {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .stat-item {
    padding: 8px;
  }

  .stat-number {
    font-size: 18px;
  }
}
</style>