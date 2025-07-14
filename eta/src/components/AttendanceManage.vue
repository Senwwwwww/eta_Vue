<template>
  <div class="approval-records">
    <el-row :gutter="20">
      <!-- 审批记录表格 -->
      <el-col :span="24">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span>审批申请</span>
          </div>
          <el-table :data="records" border style="width: 100%" height="500">
            <el-table-column prop="userDTO.employeeDTO.realName" label="姓名" width="120"  sortable></el-table-column>
            <el-table-column prop="type" label="申请类型" width="120"  sortable></el-table-column>
            <el-table-column prop="reason" label="申请原因" width="200"  sortable></el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="165"  sortable>
              <template slot-scope="scope">
                {{ formatTime(scope.row.startTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="endTime" label="结束时间" width="165" sortable>
              <template slot-scope="scope">
                {{ formatTime(scope.row.endTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="applicationStatus" label="状态" width="100" sortable>
              <template slot-scope="scope">
                <el-tag :type="scope.row.applicationStatus === '通过' ? 'success' : 'warning'">
                  {{ scope.row.applicationStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220">
              <template slot-scope="scope">
                <el-button size="mini" type="success" @click="handleApprove(scope.row)" :disabled="scope.row.applicationStatus === '通过'">通过</el-button>
                <el-button size="mini" type="danger" @click="handleReject(scope.row)" :disabled="scope.row.applicationStatus === '拒绝'">拒绝</el-button>
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
      <p>开始时间: {{ formatTime(selectedRecord.startTime) }}</p>
      <p>结束时间: {{ formatTime(selectedRecord.endTime) }}</p>
      <p>状态: {{ selectedRecord.applicationStatus }}</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { instance } from "@/util/request";
import moment from "moment";
import {notifyStatusChange} from "@/api/email";

export default {
  name: "ApprovalRecords",
  data() {
    return {
      records: [],
      dialogVisible: false,
      selectedRecord: {},
    };
  },
  mounted() {
    this.$setToken();
    instance.get('/user/admin/getAllApplicationInfo')
        .then(response => {
          if (response.data.success) {
            this.records = response.data.data;
          } else {
            this.$message.error(response.data.errorMsg);
          }
        })
        .catch(error => {
          this.$message.error("请求失败");
        });
  },
  methods: {
    handleView(record) {
      this.selectedRecord = record;
      this.dialogVisible = true;
    },
    handleApprove(record) {
      record.applicationStatus = '通过';
      this.$setToken();
      instance.put('/user/admin/updateApplicationStatus' , record)
          .then(response => {
            if (response.data.success) {
              this.$message.success("审批通过");
              notifyStatusChange( response.data.data.userDTO.email, response.data.data.userDTO.username, record.applicationStatus,record.type, record.startTime,"申请" )
                  .then(response => {
                    if (response.data.success) {
                      this.$message.success("审批状态已发送到用户邮箱");
                    } else {
                      this.$message.error(response.data.errorMsg);
                    }
                  })
                  .catch(error => {
                    this.$message.error("审批状态发送失败");
                  })
              // 给用户发信息
              // 给用户发信息
              instance.post('/user/addNewMessageInfo/'+response.data.data.userDTO.userId,
                  {messageContent: "您的关于"+record.type+"的申请已经通过！",
                    userId:response.data.data.userDTO.userId
                  }).then(response => {
                if (response.data.success) {
                  this.$message.success("消息发送成功");
                } else {
                  this.$message.error(response.data.errorMsg);
                }
              })
                  .catch(error => {
                    this.$message.error("消息发送失败");
                  })



            } else {
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch(error => {
            this.$message.error("审批失败");
          });
    },
    handleReject(record) {
      record.applicationStatus = '拒绝';
      this.$setToken();
      instance.put('/user/admin/updateApplicationStatus', record)
          .then(response => {
            if (response.data.success) {
              this.$message.success("审批拒绝");
              // 给用户发邮件
              console.log("===========:"+response)
              notifyStatusChange( response.data.data.userDTO.email, response.data.data.userDTO.username, record.applicationStatus,record.type, record.startTime,"申请" )
                  .then(response => {
                    if (response.data.success) {
                      this.$message.success("审批状态已发送到用户邮箱");
                    } else {
                      this.$message.error(response.data.errorMsg);
                    }
                  })
                  .catch(error => {
                    this.$message.error("审批状态发送失败");
                  })
              // ===========
              // 给用户发信息
              instance.post('/user/addNewMessageInfo/'+response.data.data.userDTO.userId,
                  {messageContent: "您的关于"+record.type+"的申请已被拒绝，请重新申请！",
                    userId:response.data.data.userDTO.userId
              }).then(response => {
                if (response.data.success) {
                  this.$message.success("消息发送成功");
                } else {
                  this.$message.error(response.data.errorMsg);
                }
              })
                  .catch(error => {
                    this.$message.error("消息发送失败");
                  })
              // ===========

            } else {
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch(error => {
            this.$message.error("审批失败");
          });
    },
    formatTime(time) {
      return moment(time).format("YYYY-MM-DD HH:mm:ss");
    },
  },
};
</script>

<style scoped>
.approval-records {
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
