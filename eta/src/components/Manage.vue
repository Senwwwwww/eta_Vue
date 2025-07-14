<template>
  <!-- 使el-card居中 -->
  <el-card class="box-card" style="width: 800px; margin: 0 auto;">
    <el-button @click="dialog = true" type="primary" style="margin-right: 16px;">
      添加部门
    </el-button>
    <el-drawer
        title="添加/编辑职务"
        :before-close="handleClose"
        :visible.sync="dialog"
        direction="rtl"
        custom-class="demo-drawer"
        ref="drawer"
    >
      <div class="demo-drawer__content">
        <el-form :model="form">
          <el-form-item label="职务ID" prop="departmentId" :label-width="formLabelWidth">
            <el-input v-model="form.departmentId" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="职务名称" prop="departmentName" :label-width="formLabelWidth">
            <el-input v-model="form.departmentName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="职务描述" prop="departmentContent" :label-width="formLabelWidth">
            <el-input v-model="form.departmentContent" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div class="demo-drawer__footer">
          <el-button @click="cancelForm">取消</el-button>
          <el-button type="primary" @click="saveDepartment()" :loading="loading">{{ loading ? '提交中 ...' : '确定' }}</el-button>
        </div>
      </div>
    </el-drawer>
    <el-table
        :data="tableData"
        style="width:100%"
        :default-sort="{ prop: 'departmentId', order: 'descending' }"
        max-height="550"
        height="500"
    >
      <el-table-column prop="departmentId" label="职务ID" sortable width="180"></el-table-column>
      <el-table-column prop="departmentName" label="职务名称" sortable width="180"></el-table-column>
      <el-table-column prop="departmentContent" label="职务描述" sortable width="180"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
import { instance } from "@/util/request";

export default {
  name: "DepartmentManage",
  data() {
    return {
      dialog: false,
      loading: false,
      form: {
        departmentId: '',
        departmentName: '',
        departmentContent: '',
      },
      formLabelWidth: '80px',
      timer: null,
      tableData: []
    };
  },
  mounted() {
    this.fetchDepartments();
  },
  methods: {
    fetchDepartments() {
      this.$setToken();
      instance.get('/user/admin/getAllDepartmentInfo')
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
      this.$confirm('确定要删除该职务吗？')
          .then(() => {
            this.$setToken();
            instance.delete(`/user/admin/deleteDepartmentInfo?departmentId=${row.departmentId}`)
                .then(response => {
                  if (response.data.success) {
                    this.tableData.splice(index, 1);
                    this.$message.success('删除成功');
                  } else {
                    this.$message.error(response.data.errorMsg);
                  }
                })
                .catch(error => {
                  this.$message.error("请求失败");
                });
          })
          .catch(() => {
            this.$message.error('删除失败')
          });
    },
    saveDepartment() {
      this.$setToken();
      instance.post('/user/admin/addAndUpdateNewDepartmentInfo', this.form)
          .then(response => {
            if (response.data.success) {
              this.$message.success('操作成功');
              this.fetchDepartments();
              this.dialog = false;
            } else {
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch(error => {
            this.$message.error("请求失败");
          });
    },
    handleClose(done) {
      if (this.loading) return;
      this.$confirm('确定要关闭表单吗？')
          .then(_ => {
            this.loading = true;
            this.timer = setTimeout(() => {
              done();
              setTimeout(() => {
                this.loading = false;
              }, 4);
            }, 2);
          })
          .catch(_ => {});
    },
    cancelForm() {
      this.dialog = false;
      clearTimeout(this.timer);
    }
  }
};
</script>

<style scoped>
.demo-drawer__content {
  padding: 20px;
}

.demo-drawer__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
