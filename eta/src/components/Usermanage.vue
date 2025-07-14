<template>
  <el-card class="box-card"   style="width: 1150px; margin: 0 auto;">

    <!-- 用户列表 -->
    <el-table
        :data="tableData"
        style="width: 100%"
        :default-sort="{ prop: 'date', order: 'descending' }"
        max-height="600"
        stripe

    >
      <el-table-column prop="username" label="账号" sortable width="130">
        <template slot-scope="scope">
          <span>{{ scope.row.username || '' }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="userId" label="用户ID" sortable width="130">
        <template slot-scope="scope">
          <span>{{ scope.row.userId || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="role.roleName" label="角色" sortable width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.role?.roleName || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="employeeDTO.employeeId" label="员工ID" sortable width="130">
        <template slot-scope="scope">
          <span>{{ scope.row.employeeDTO?.employeeId || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="employeeDTO.realName" label="姓名" sortable width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.employeeDTO?.realName || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" sortable width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.email || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>

    </el-table>
  </el-card>
</template>

<script>
import { instance } from "@/util/request";

export default {
  name: "Manage",
  data() {
    return {
      dialog: false,
      loading: false,
      form: {
        username: '',
        roleName: '',
        departmentName: '',
        email: '',
      },
      formLabelWidth: '80px',
      timer: null,
      tableData: [],
    };
  },
  mounted() {
    this.$setToken();
    this.fetchUsers();
  },
  methods: {
    fetchUsers() {
      instance.get('/user/admin/getAllUserInfo')
          .then(response => {
            if (response.data.success) {
              this.tableData = response.data.data;
            } else {
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch(error => {
            this.$message.error("请求失败");
          });
    },
    handleEdit(index, row) {
      this.dialog = true;
      this.form = { ...row };
    },
    handleDelete(index, row) {
      this.$confirm(`确定要删除用户 ${row.username} 吗？`)
          .then(() => {
            this.$setToken();
            instance.delete('/user/admin/deleteUserInfo?userId='+row.userId)
                .then(response => {
                  if (response.data.success) {
                    this.tableData.splice(index, 1);
                    this.$message.success("删除成功");
                  } else {
                    this.$message.error(response.data.errorMsg);
                  }
                })
                .catch(error => {
                  this.$message.error("删除失败");
                });
          })
          .catch(() => {});
    },
    submitForm() {
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$setToken();
          instance.post('/user/addOrUpdateUser', this.form)
              .then(response => {
                if (response.data.success) {
                  this.fetchUsers();
                  this.$message.success("操作成功");
                  this.dialog = false;
                } else {
                  this.$message.error(response.data.errorMsg);
                }
                this.loading = false;
              })
              .catch(error => {
                this.$message.error("操作失败");
                this.loading = false;
              });
        } else {
          this.$message.error("请填写完整表单");
        }
      });
    },
    handleClose(done) {
      if (this.loading) return;
      this.$confirm('确定要关闭表单吗？')
          .then(() => {
            done();
          })
          .catch(() => {});
    },
    cancelForm() {
      this.dialog = false;
      this.loading = false;
      clearTimeout(this.timer);
      this.form = {
        username: '',
        roleName: '',
        departmentName: '',
        email: '',
      };
    },
  },
};
</script>

<style scoped>
.demo-drawer__footer {
  text-align: right;
  margin-top: 20px;
}
</style>
