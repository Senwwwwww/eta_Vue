
<template>
  <div class="application-records">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="el-icon-document"></i>
          申请记录管理
        </h1>
        <p class="page-subtitle">查看与管理用户提交的申请信息</p>
      </div>
    </div>

    <!-- 主卡片 -->
    <el-card class="main-content-card">
      <el-table :data="records" border style="width: 100%" height="500" empty-text="暂无申请记录">
        <el-table-column prop="type" label="申请类型" width="180"></el-table-column>
        <el-table-column prop="reason" label="申请原因" width="240"></el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="200">
          <template slot-scope="scope">
            {{ formatTime(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="200">
          <template slot-scope="scope">
            {{ formatTime(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="applicationStatus" label="状态" width="120">
          <template slot-scope="scope">
            <el-tag :type="scope.row.applicationStatus === '通过' ? 'success' : 'warning'">
              {{ scope.row.applicationStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-view" @click="handleView(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 弹窗 -->
    <el-dialog
        title="申请详情"
        :visible.sync="dialogVisible"
        width="600px"
        :close-on-click-modal="false"
        custom-class="record-dialog"
    >
      <div class="dialog-content">
        <div class="detail-grid">
          <div class="detail-item">
            <label>申请类型</label>
            <div>{{ selectedRecord.type }}</div>
          </div>
          <div class="detail-item">
            <label>申请原因</label>
            <div>{{ selectedRecord.reason }}</div>
          </div>
          <div class="detail-item">
            <label>开始时间</label>
            <div>{{ formatTime(selectedRecord.startTime) }}</div>
          </div>
          <div class="detail-item">
            <label>结束时间</label>
            <div>{{ formatTime(selectedRecord.endTime) }}</div>
          </div>
          <div class="detail-item">
            <label>状态</label>
            <el-tag :type="selectedRecord.applicationStatus === '通过' ? 'success' : 'warning'">
              {{ selectedRecord.applicationStatus }}
            </el-tag>
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
import { instance } from "@/util/request";
import moment from "moment";

export default {
  name: "ApplicationRecords",
  data() {
    return {
      records: [],
      dialogVisible: false,
      selectedRecord: {},
    };
  },
  created() {
    this.$setToken();
    instance
        .get("/user/getAllUserApplicationInfo/" + this.$store.state.admin.admin.data.data.userId)
        .then((response) => {
          if (response.data.success) {
            this.records = response.data.data;
          } else {
            this.$message.error(response.data.errorMsg);
          }
        })
        .catch(() => {});
  },
  methods: {
    handleView(record) {
      this.selectedRecord = record;
      this.dialogVisible = true;
    },
    formatTime(time) {
      return moment(time).format("YYYY-MM-DD HH:mm:ss");
    },
  },
};
</script>


<style scoped>
.application-records {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%);
  height: 84vh;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 页面头部 */
.page-header {
  background: white;
  padding: 20px;
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
  margin: 4px 0 0;
}

/* 主内容卡片 */
.main-content-card {
  flex: 1;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
}

/* 弹窗 */
.record-dialog {
  border-radius: 15px;
}

.dialog-content {
  padding: 10px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

.detail-item label {
  font-weight: 600;
  color: #2c3e50;
}

.dialog-footer {
  text-align: right;
}

/* 表格按钮样式 */
.el-button--mini {
  font-size: 12px;
}

</style>