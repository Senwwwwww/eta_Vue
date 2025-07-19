<template>
  <div class="feedback-records">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="el-icon-chat-line-square"></i>
          用户反馈管理
        </h1>
        <p class="page-subtitle">管理和处理用户反馈信息</p>
      </div>
      <div class="header-stats">
        <div class="stat-card total-card">
          <div class="stat-number">{{ getTotalCount() }}</div>
          <div class="stat-label">总反馈</div>
        </div>
        <div class="stat-card unprocessed-card">
          <div class="stat-number">{{ getUnprocessedCount() }}</div>
          <div class="stat-label">未处理</div>
        </div>
        <div class="stat-card processing-card">
          <div class="stat-number">{{ getProcessingCount() }}</div>
          <div class="stat-label">处理中</div>
        </div>
        <div class="stat-card resolved-card">
          <div class="stat-number">{{ getResolvedCount() }}</div>
          <div class="stat-label">已解决</div>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card" style ="padding-top: 0px;" >
      <div class="filter-section">
        <div class="filter-item">
          <label>反馈类型</label>
          <el-select v-model="filterType" placeholder="请选择类型" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="功能问题" value="功能问题"></el-option>
            <el-option label="UI问题" value="UI问题"></el-option>
             <el-option label="性能问题" value="性能问题"></el-option>
            <el-option label="检修问题" value="检修问题"></el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <label>处理状态</label>
          <el-select v-model="filterStatus" placeholder="请选择状态" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="未处理" value="未处理"></el-option>
            <el-option label="处理中" value="处理中"></el-option>
            <el-option label="已解决" value="已解决"></el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <label>搜索</label>
          <el-input
              v-model="searchKeyword"
              placeholder="搜索反馈内容或用户ID"
              prefix-icon="el-icon-search"
              clearable
          ></el-input>
        </div>
      </div>
    </el-card>

    <!-- 主要内容区域 -->
    <el-card class="main-content-card">


      <el-table
          :data="filteredRecords"
          border
          style="width: 100%"
          height="500"
          :row-class-name="tableRowClassName"
          empty-text="暂无反馈数据"
      >
        <el-table-column prop="userDTO.userId" label="用户ID" width="180" sortable>
          <template slot-scope="scope">
            <div class="user-info">
              <el-avatar :size="30" :src="scope.row.userDTO.avatar" icon="el-icon-user-solid"></el-avatar>
              <span class="user-id">{{ scope.row.userDTO.userId }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="反馈类型" width="120" sortable>
          <template slot-scope="scope">
            <el-tag :type="getTypeColor(scope.row.type)" size="small">
              <i :class="getTypeIcon(scope.row.type)"></i>
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="反馈内容" width="300" sortable>
          <template slot-scope="scope">
            <div class="content-cell">
              <p class="content-text">{{ truncateText(scope.row.content, 50) }}</p>
              <el-button
                  v-if="scope.row.content.length > 50"
                  @click="viewDetails(scope.row)"
                  type="text"
                  size="mini"
              >
                查看全部
              </el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="反馈时间" width="180" sortable>
          <template slot-scope="scope">
            <div class="time-cell">
              <i class="el-icon-time"></i>
              <span>{{ formatDate(scope.row.feedbackTime) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="feedbackStatus" label="处理状态" width="140" sortable>
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.feedbackStatus)" size="medium">
              <i :class="getStatusIcon(scope.row.feedbackStatus)"></i>
              {{ scope.row.feedbackStatus }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="350" fixed="right">
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-button @click="viewDetails(scope.row)" type="primary" size="mini" icon="el-icon-view">
                详情
              </el-button>
              <el-button
                  @click="markAsResolved(scope.row)"
                  type="success"
                  size="mini"
                  icon="el-icon-check"
                  v-if="scope.row.feedbackStatus !== '已解决'"
              >
                已解决
              </el-button>
              <el-button
                  @click="markAsProcessing(scope.row)"
                  type="warning"
                  size="mini"
                  icon="el-icon-loading"
                  v-if="scope.row.feedbackStatus === '未处理'"
              >
                处理中
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredRecords.length"
        >
        </el-pagination>
      </div>
    </el-card>

    <!-- 反馈详情对话框 -->
    <el-dialog
        title="反馈详情"
        :visible.sync="dialogVisible"
        width="600px"
        :close-on-click-modal="false"
        custom-class="feedback-dialog"
    >
      <div class="dialog-content">
        <div class="detail-section">
          <div class="detail-header">
            <el-avatar :size="40" :src="selectedRecord.userDTO?.avatar" icon="el-icon-user-solid"></el-avatar>
            <div class="user-detail">
              <h4>{{ selectedRecord.userDTO?.username || '未知用户' }}</h4>
              <p>用户ID: {{ selectedRecord.userDTO?.userId }}</p>
            </div>
          </div>
        </div>

        <el-divider></el-divider>

        <div class="detail-grid">
          <div class="detail-item">
            <label>反馈类型</label>
            <el-tag :type="getTypeColor(selectedRecord.type)" size="medium">
              <i :class="getTypeIcon(selectedRecord.type)"></i>
              {{ selectedRecord.type }}
            </el-tag>
          </div>

          <div class="detail-item">
            <label>处理状态</label>
            <el-tag :type="getStatusType(selectedRecord.feedbackStatus)" size="medium">
              <i :class="getStatusIcon(selectedRecord.feedbackStatus)"></i>
              {{ selectedRecord.feedbackStatus }}
            </el-tag>
          </div>

          <div class="detail-item">
            <label>反馈时间</label>
            <div class="time-display">
              <i class="el-icon-time"></i>
              {{ formatDate(selectedRecord.feedbackTime) }}
            </div>
          </div>
        </div>

        <div class="detail-item full-width">
          <label>反馈内容</label>
          <div class="content-display">
            {{ selectedRecord.content }}
          </div>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button
            @click="markAsResolved(selectedRecord); dialogVisible = false"
            type="success"
            v-if="selectedRecord.feedbackStatus !== '已解决'"
        >
          标记为已解决
        </el-button>
        <el-button
            @click="markAsProcessing(selectedRecord); dialogVisible = false"
            type="warning"
            v-if="selectedRecord.feedbackStatus === '未处理'"
        >
          标记为处理中
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {instance} from "@/util/request";
import moment from "moment";
import {notifyStatusChange} from "@/api/email";

export default {
  name: "FeedbackRecords",
  data() {
    return {
      dialogVisible: false,
      selectedRecord: {},
      records: [],
      currentPage: 1,
      pageSize: 20,
      filterType: '',
      filterStatus: '',
      searchKeyword: '',
      message: {}
    };
  },
  computed: {
    filteredRecords() {
      let filtered = this.records;

      if (this.filterType) {
        filtered = filtered.filter(record => record.type === this.filterType);
      }

      if (this.filterStatus) {
        filtered = filtered.filter(record => record.feedbackStatus === this.filterStatus);
      }

      if (this.searchKeyword) {
        filtered = filtered.filter(record =>
            record.content.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
            record.userDTO.userId.toString().includes(this.searchKeyword)
        );
      }

      return filtered;
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.$setToken();
      instance
          .get("/user/admin/getAllFeedbackInfo")
          .then((response) => {
            if (response.data.success) {
              this.records = response.data.data;
            } else {
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch((error) => {
            this.$message.error("请求失败");
          });
    },

    refreshData() {
      this.loadData();
      this.$message.success("数据已刷新");
    },

    exportData() {
      this.$message.info("导出功能开发中...");
    },

    formatDate(date) {
      return moment(date).format("YYYY-MM-DD HH:mm:ss");
    },

    getStatusType(feedbackStatus) {
      switch (feedbackStatus) {
        case "未处理":
          return "danger";
        case "处理中":
          return "warning";
        case "已解决":
          return "success";
        default:
          return "";
      }
    },

    getStatusIcon(feedbackStatus) {
      switch (feedbackStatus) {
        case "未处理":
          return "el-icon-warning";
        case "处理中":
          return "el-icon-loading";
        case "已解决":
          return "el-icon-check";
        default:
          return "";
      }
    },

    getTypeColor(type) {
      switch (type) {
        case "功能建议":
          return "primary";
        case "Bug报告":
          return "danger";
        case "其他":
          return "info";
        default:
          return "";
      }
    },

    getTypeIcon(type) {
      switch (type) {
        case "功能建议":
          return "el-icon-light-bulb";
        case "Bug报告":
          return "el-icon-warning";
        case "其他":
          return "el-icon-chat-line-square";
        default:
          return "el-icon-chat-line-square";
      }
    },

    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },

    tableRowClassName({row}) {
      if (row.feedbackStatus === '未处理') {
        return 'warning-row';
      } else if (row.feedbackStatus === '已解决') {
        return 'success-row';
      }
      return '';
    },

    getTotalCount() {
      return this.records.length;
    },

    getUnprocessedCount() {
      return this.records.filter(record => record.feedbackStatus === '未处理').length;
    },

    getProcessingCount() {
      return this.records.filter(record => record.feedbackStatus === '处理中').length;
    },

    getResolvedCount() {
      return this.records.filter(record => record.feedbackStatus === '已解决').length;
    },

    handleSizeChange(val) {
      this.pageSize = val;
    },

    handleCurrentChange(val) {
      this.currentPage = val;
    },

    viewDetails(record) {
      this.selectedRecord = record;
      this.dialogVisible = true;
      
    },

    markAsResolved(record) {
      record.feedbackStatus = "已解决";
      this.updateFeedbackStatus(record, "已标记为已解决");
    },

    markAsProcessing(record) {
      record.feedbackStatus = "处理中";
      this.updateFeedbackStatus(record, "已标记为处理中");
    },

    updateFeedbackStatus(record, successMessage) {
      this.$setToken();
      instance
          .put("/user/admin/updateFeedbackStatus/" + record.userDTO.userId, record)
          .then((response) => {
            if (response.data.success) {
              this.$message.success(successMessage);

              // 给用户发邮件
              notifyStatusChange(
                  response.data.data.userDTO.email,
                  response.data.data.userDTO.username,
                  record.feedbackStatus,
                  record.type,
                  record.feedbackTime,
                  "反馈"
              )
                  .then((emailResponse) => {
                    if (emailResponse.data.success) {
                      this.$message.success("已发送邮件通知");
                    } else {
                      this.$message.error(emailResponse.data.errorMsg);
                    }
                  });
            } else {
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch((error) => {
            this.$message.error("请求失败");
          });
    }
  }
};
</script>

<style scoped>
.feedback-records {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  height: 84vh;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 页面头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title i {
  color: #409eff;
  font-size: 32px;
}

.page-subtitle {
  color: #7f8c8d;
  font-size: 16px;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px;
  border-radius: 12px;
  text-align: center;
  min-width: 70px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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

/* 筛选区域样式 */
.filter-card {
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
  padding: 0px;
}

.filter-section {
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.filter-item label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

/* 主要内容区域 */
.main-content-card {
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.table-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.table-actions {
  display: flex;
  gap: 10px;
}

/* 表格样式 */
.el-table {
  border-radius: 10px;
  overflow: hidden;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-id {
  font-weight: 600;
  color: #2c3e50;
}

.content-cell {
  max-width: 280px;
}

.content-text {
  margin: 0;
  line-height: 1.5;
  color: #34495e;
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7f8c8d;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 表格行样式 */
.el-table .warning-row {
  background: #fef9e7;
}

.el-table .success-row {
  background: #f0f9ff;
}

/* 分页样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

/* 对话框样式 */
.feedback-dialog {
  border-radius: 15px;
}

.dialog-content {
  padding: 10px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.user-detail h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.user-detail p {
  margin: 5px 0 0 0;
  color: #7f8c8d;
  font-size: 14px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.content-display {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  line-height: 1.6;
  color: #34495e;
  border-left: 4px solid #409eff;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7f8c8d;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
  }

  .header-stats {
    width: 100%;
    justify-content: space-around;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item {
    min-width: auto;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}

/* 动画效果 */
.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.el-card {
  transition: all 0.3s ease;
}

.el-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.total-card {
  background: linear-gradient(135deg, #42a5f5, #478ed1);
}

.unprocessed-card {
  background: linear-gradient(135deg, #ef5350, #e53935);
}

.processing-card {
  background: linear-gradient(135deg, #ffa726, #fb8c00);
}

.resolved-card {
  background: linear-gradient(135deg, #66bb6a, #43a047);
}

</style>