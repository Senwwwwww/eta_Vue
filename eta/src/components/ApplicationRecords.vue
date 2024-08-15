<template>
  <div class="application-records">
    <el-row :gutter="20">
      <!-- 申请记录表格 -->
      <el-col :span="24">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span>申请记录</span>
          </div>
          <el-table :data="records" border style="width: 100%">
            <el-table-column prop="type" label="申请类型" width="180"></el-table-column>
            <el-table-column prop="reason" label="申请原因" width="240"></el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="200"></el-table-column>
            <el-table-column prop="endTime" label="结束时间" width="200"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag
                    :type="scope.row.status === '通过' ? 'success' : 'warning'"
                >
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template slot-scope="scope">
                <el-button size="mini" @click="handleView(scope.row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 查看申请记录详情的弹窗 -->
    <el-dialog :title="selectedRecord.type + ' 详情'" :visible.sync="dialogVisible">
      <p>申请类型: {{ selectedRecord.type }}</p>
      <p>申请原因: {{ selectedRecord.reason }}</p>
      <p>开始时间: {{ selectedRecord.startTime }}</p>
      <p>结束时间: {{ selectedRecord.endTime }}</p>
      <p>状态: {{ selectedRecord.status }}</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name : "ApplicationRecords",
  data() {
    return {
      records: [
        {
          type: '请假申请',
          reason: '家庭原因',
          startTime: '2024-08-01 09:00',
          endTime: '2024-08-02 18:00',
          status: '通过',
        },
        {
          type: '加班申请',
          reason: '项目需求',
          startTime: '2024-08-05 19:00',
          endTime: '2024-08-05 22:00',
          status: '待审批',
        },
        // 更多示例数据...
      ],
      dialogVisible: false,
      selectedRecord: {},
    };
  },
  methods: {
    handleView(record) {
      this.selectedRecord = record;
      this.dialogVisible = true;
    },
  },
};
</script>

<style scoped>
.application-records {
  padding: 20px;
  background-color: #f9fafc;
}

.el-card {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}
</style>
