<template>
  <div class="feedback-records">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>反馈记录</span>
          </div>
          <el-table :data="records" border style="width: 100%">
            <el-table-column prop="type" label="反馈类型" width="180"></el-table-column>
            <el-table-column prop="content" label="反馈内容" width="360"></el-table-column>
            <el-table-column prop="date" label="反馈时间" width="200"></el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name:"FeedbackRecords",
  data() {
    return {
      records: [
        {
          type: '功能问题',
          content: '系统偶尔会卡顿。',
          date: '2024-08-10 14:23',
        },
        {
          type: 'UI问题',
          content: '按钮颜色太暗了。',
          date: '2024-08-09 10:15',
        },
        // 更多示例数据...
      ],
    };
  },
};
</script>

<style scoped>
.feedback-records {
  padding: 20px;
  background-color: #f9fafc;
}

.el-card {
  margin-bottom: 20px;
}

.el-table {
  margin-top: 20px;
}
</style>
