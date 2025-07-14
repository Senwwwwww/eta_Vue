<template>
  <div class="feedback-records">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="card-header">
            <span class="header-title">
              <i class="el-icon-chat-dot-square"></i>
              反馈记录
            </span>
            <div class="header-actions">
              <el-button
                  size="small"
                  type="primary"
                  @click="refreshData"
                  :loading="loading"
                  icon="el-icon-refresh"
              >
                刷新
              </el-button>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="stats-section">
            <div class="stat-item">
              <span class="stat-label">总数</span>
              <span class="stat-value">{{ records.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">未处理</span>
              <span class="stat-value danger">{{ getStatusCount('未处理') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">处理中</span>
              <span class="stat-value warning">{{ getStatusCount('处理中') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">已解决</span>
              <span class="stat-value success">{{ getStatusCount('已解决') }}</span>
            </div>
          </div>

          <el-table
              :data="records"
              border
              style="width: 100%"
              height="500"
              v-loading="loading"
              empty-text="暂无反馈记录"
              :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          >
            <el-table-column
                prop="type"
                label="反馈类型"
                width="120"
                align="center"
            >
              <template slot-scope="scope">
                <el-tag size="small" :type="getTypeColor(scope.row.type)">
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column
                prop="content"
                label="反馈内容"
                min-width="300"
                show-overflow-tooltip
            >
              <template slot-scope="scope">
                <div class="content-cell">
                  {{ scope.row.content }}
                </div>
              </template>
            </el-table-column>

            <el-table-column
                prop="feedbackTime"
                label="反馈时间"
                width="180"
                align="center"
                sortable
            >
              <template slot-scope="scope">
                <div class="time-cell">
                  <i class="el-icon-time"></i>
                  {{ formatDate(scope.row.feedbackTime) }}
                </div>
              </template>
            </el-table-column>

            <el-table-column
                prop="feedbackStatus"
                label="状态"
                width="100"
                align="center"
            >
              <template slot-scope="scope">
                <el-tag
                    :type="getStatusType(scope.row.feedbackStatus)"
                    size="small"
                >
                  {{ scope.row.feedbackStatus }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column
                label="操作"
                width="120"
                align="center"
                fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                    size="mini"
                    type="text"
                    @click="viewDetail(scope.row)"
                    icon="el-icon-view"
                >
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详情对话框 -->
    <el-dialog
        title="反馈详情"
        :visible.sync="dialogVisible"
        width="600px"
        :before-close="handleClose"
    >
      <div v-if="currentRecord" class="detail-content">
        <div class="detail-row">
          <label>反馈类型：</label>
          <el-tag :type="getTypeColor(currentRecord.type)">
            {{ currentRecord.type }}
          </el-tag>
        </div>
        <div class="detail-row">
          <label>反馈时间：</label>
          <span>{{ formatDate(currentRecord.feedbackTime) }}</span>
        </div>
        <div class="detail-row">
          <label>当前状态：</label>
          <el-tag :type="getStatusType(currentRecord.feedbackStatus)">
            {{ currentRecord.feedbackStatus }}
          </el-tag>
        </div>
        <div class="detail-row">
          <label>反馈内容：</label>
          <div class="content-detail">
            {{ currentRecord.content }}
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {instance} from "@/util/request";
import moment from "moment/moment";

export default {
  name: "FeedbackRecords",
  data() {
    return {
      records: [],
      loading: false,
      dialogVisible: false,
      currentRecord: null,
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        this.$setToken();
        const response = await instance.get('/user/getAllUserFeedbackInfo/' + this.$store.state.admin.admin.data.data.userId);

        if (response.data.success) {
          // 对数据进行处理和排序
          this.records = response.data.data
              .map(record => ({
                ...record,
                // 标准化时间格式
                feedbackTime: this.standardizeTime(record.feedbackTime)
              }))
              .sort((a, b) => new Date(b.feedbackTime) - new Date(a.feedbackTime)); // 按时间倒序排列
        } else {
          this.$message.error(response.data.errorMsg);
        }
      } catch (error) {
        console.error('加载反馈记录失败:', error);
        this.$message.error("请求失败，请稍后重试");
      } finally {
        this.loading = false;
      }
    },

    refreshData() {
      this.loadData();
    },

    // 标准化时间处理
    standardizeTime(time) {
      if (!time) return '';

      // 处理各种可能的时间格式
      let standardTime;

      if (typeof time === 'string') {
        // 处理字符串格式的时间
        standardTime = moment(time);
      } else if (typeof time === 'number') {
        // 处理时间戳（支持秒和毫秒）
        standardTime = time.toString().length === 10 ?
            moment.unix(time) : moment(time);
      } else if (time instanceof Date) {
        // 处理Date对象
        standardTime = moment(time);
      } else {
        // 其他情况直接使用moment处理
        standardTime = moment(time);
      }

      // 验证时间是否有效
      if (!standardTime.isValid()) {
        console.warn('无效的时间格式:', time);
        return '无效时间';
      }

      return standardTime;
    },

    // 格式化显示时间
    formatDate(time) {
      const standardTime = this.standardizeTime(time);
      if (standardTime === '无效时间') return standardTime;

      const now = moment();
      const timeMoment = moment(standardTime);

      // 相对时间显示逻辑
      if (now.diff(timeMoment, 'minutes') < 1) {
        return '刚刚';
      } else if (now.diff(timeMoment, 'hours') < 1) {
        return timeMoment.fromNow();
      } else if (now.diff(timeMoment, 'days') < 1) {
        return timeMoment.format('今天 HH:mm');
      } else if (now.diff(timeMoment, 'days') < 2) {
        return timeMoment.format('昨天 HH:mm');
      } else if (now.diff(timeMoment, 'days') < 7) {
        return timeMoment.format('dddd HH:mm');
      } else if (now.year() === timeMoment.year()) {
        return timeMoment.format('MM-DD HH:mm');
      } else {
        return timeMoment.format('YYYY-MM-DD HH:mm');
      }
    },

    getStatusType(feedbackStatus) {
      const statusMap = {
        '未处理': 'danger',
        '处理中': 'warning',
        '已解决': 'success',
        '已关闭': 'info'
      };
      return statusMap[feedbackStatus] || '';
    },

    getTypeColor(type) {
      const typeMap = {
        'Bug反馈': 'danger',
        '功能建议': 'primary',
        '使用问题': 'warning',
        '其他': 'info'
      };
      return typeMap[type] || 'info';
    },

    getStatusCount(status) {
      return this.records.filter(record => record.feedbackStatus === status).length;
    },

    viewDetail(record) {
        this.currentRecord = record;
        this.dialogVisible = true;

    },

    handleClose() {
      this.dialogVisible = false;
      this.currentRecord = null;
    }
  },
};
</script>

<style scoped>
.feedback-records {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 83vh;
}

.box-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-title i {
  margin-right: 8px;
  color: #409eff;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stats-section {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.stat-value.danger {
  color: #f56c6c;
}

.stat-value.warning {
  color: #e6a23c;
}

.stat-value.success {
  color: #67c23a;
}

.content-cell {
  line-height: 1.5;
  word-break: break-word;
}

.time-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 13px;
  color: #606266;
}

.time-cell i {
  color: #909399;
}

.detail-content {
  padding: 10px 0;
}

.detail-row {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.detail-row label {
  min-width: 80px;
  font-weight: 600;
  color: #606266;
  margin-right: 12px;
}

.content-detail {
  flex: 1;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  line-height: 1.6;
  word-break: break-word;
  border-left: 3px solid #409eff;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .feedback-records {
    padding: 10px;
  }

  .stats-section {
    flex-wrap: wrap;
    gap: 15px;
  }

  .stat-item {
    min-width: 60px;
  }

  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}

/* 表格优化 */
.el-table {
  margin-top: 20px;
}

.el-table .el-table__row:hover {
  background-color: #f5f7fa;
}

.el-table .el-button--text {
  color: #409eff;
}

.el-table .el-button--text:hover {
  color: #66b1ff;
}
</style>