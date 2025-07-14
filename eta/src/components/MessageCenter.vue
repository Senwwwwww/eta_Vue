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
              <el-table-column label="日期" width="180">
                <template slot-scope="scope">
                  <span>{{ formatDate(scope.row.messageTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="messageContent" label="内容" width="500"></el-table-column>
              <el-table-column prop="messageStatus" label="状态" width="120">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.messageStatus === '未读' ? 'danger' : 'success'">
                    {{ scope.row.messageStatus }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
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
import { instance } from "@/util/request";
import moment from "moment";

export default {
  data() {
    return {
      messages: [
        // 添加更多消息数据
      ]
    };
  },
  created() {
    // 加载message
   this.crea();
  },

  methods: {
    crea(){
      this.$setToken();
      instance.get('/user/getAllUserMessageInfo/'+this.$store.state.admin.admin.data.data.userId)
          .then(response => {
            if (response.data.success) {
              this.messages = response.data.data;


              // 获取未读消息的数量
              const unreadMessagesCount = this.messages.filter(message => message.messageStatus === '未读').length;
              sessionStorage.setItem('unreadMessagesCount', unreadMessagesCount)

              // 将未读消息数量存入 Vuex
              this.$store.commit('setMessagenum', unreadMessagesCount);
              console.log(unreadMessagesCount);


            } else {
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch(error => {
            this.$message.error("请求失败");
          });
    },
    formatDate(date) {
      return moment(date).format("YYYY-MM-DD HH:mm:ss");
    },
    handleView(row) {
      this.$message({
        message: `查看消息: ${row.messageContent}`,
        type: 'info'
      });
      row.messageStatus = '已读';
      instance.put('/user/updateMessageStatus', row)
          .then(response => {
            if (response.data.success) {
              this.$message.success("更新成功");
              this.crea(); // 重新加载消息列表以更新未读消息数量
            } else {
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch(error => {
            this.$message.error("请求失败");
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
