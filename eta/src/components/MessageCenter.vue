<template>
  <div class="message-center">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>消息中心</span>
      </div>
      <div class="card-content">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-table :data="messages" style="width: 100%">
              <el-table-column prop="date" label="日期" width="180"></el-table-column>
              <el-table-column prop="title" label="标题" width="300"></el-table-column>
              <el-table-column prop="status" label="状态">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.status === '未读' ? 'danger' : 'success'">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button @click="handleView(scope.row)" type="text" size="small">查看</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messages: [
        { date: '2024-08-10', title: '新消息1', status: '未读' },
        { date: '2024-08-09', title: '新消息2', status: '已读' },
        // 添加更多消息数据
      ]
    };
  },
  methods: {
    handleView(row) {
      this.$message({
        message: `查看消息: ${row.title}`,
        type: 'info'
      });
    }
  }
};
</script>

<style scoped>
.message-center {
  padding: 20px;
  background-color: #f9fafc;
}

.card-content {
  margin-top: 20px;
}
</style>
