<template>
<!--  使el-card居中-->
  <el-card class="box-card" style="width: 800px; margin: 0 auto;">
    <div style="margin-bottom: 16px; display: flex; gap: 12px;">
      <el-button @click="dialog = true" type="primary">
        添加员工
      </el-button>
      <el-upload
          action=""
          :show-file-list="false"
          :before-upload="handleExcelUpload"
          accept=".xlsx"
      >
        <el-button type="success">批量导入</el-button>
      </el-upload>
    </div>



    <el-drawer
      title="添加/编辑员工"
      :before-close="handleClose"
      :visible.sync="dialog"
      direction="rtl"
      custom-class="demo-drawer"
      ref="drawer"
    >
      <div class="demo-drawer__content">
        <el-form :model="form">
          <el-form-item label="员工id" prop="employeeId" :label-width="formLabelWidth">
            <el-input v-model="form.employeeId" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="姓名" prop="realName" :label-width="formLabelWidth">
            <el-input v-model="form.realName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="职务" prop="task" :label-width="formLabelWidth">
            <el-select v-model="form.task" placeholder="请选择职务">
              <el-option
                  v-for="item in taskOptions"
                  :key="item"
                  :label="item"
                  :value="item"
              ></el-option>
            </el-select>
          </el-form-item>

        </el-form>
        <div class="demo-drawer__footer">
          <el-button @click="cancelForm">取消</el-button>
          <el-button type="primary" @click="saveEmployee()" :loading="loading">{{ loading ? '提交中 ...' : '确定' }}</el-button>
        </div>
      </div>
    </el-drawer>
    <el-table
      :data="tableData"
      style="width :900px"
      :default-sort="{ prop: 'employeeId', order: 'descending' }"
      max-height="1000"
      height="700"

    >
      <el-table-column prop="employeeId" label="员工id" sortable width="180"></el-table-column>
      <el-table-column prop="realName" label="姓名" sortable width="180"></el-table-column>
      <el-table-column prop="task" label="职务" sortable width="180"></el-table-column>

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
import * as XLSX from 'xlsx';

export default {
  name: "EmployeeManage",
  data() {
    return {
      dialog: false,
      loading: false,
      form: {
        employeeId: '',
        realName: '',
        task: '',
      },
      formLabelWidth: '80px',
      timer: null,
      tableData: [],
      taskOptions: [],
    };
  },
  mounted() {
    this.fetchEmployees();
    this.fetchTaskOptions();
  },
  methods: {
    fetchEmployees() {
      this.$setToken();
      instance.get('/user/admin/getAllEmployeeInfo')
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
    fetchTaskOptions() {
      this.$setToken();
      instance.get('/user/admin/getAllDepartmentInfo')
          .then(response => {
            if (response.data.success) {
              const departmentList = response.data.data || [];
              // 提取每个部门的 task 字段作为选项
              this.taskOptions = departmentList.map(dept => dept.departmentName).filter(Boolean);
            } else {
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch(() => {
            this.$message.error("获取职务列表失败");
          });
    },
    handleEdit(index, row) {
      this.dialog = true;
      this.form = { ...row };
    },
    handleDelete(index, row) {
      this.$confirm('确定要删除该员工吗？')
        .then(() => {
          this.$setToken();
          instance.delete(`/user/admin/deleteEmployeeInfo?employeeId=${row.employeeId}`)
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
        .catch(() => {});
    },
    saveEmployee() {
      this.$setToken();
      instance.post('/user/addAndUpdateNewUserEmployeeInfo', this.form)
        .then(response => {
          if (response.data.success) {
            this.$message.success('操作成功');
            this.fetchEmployees();
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
  },
  async handleExcelUpload(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (rows.length < 2) {
        this.$message.warning("表格数据为空或格式不正确");
        return;
      }

      // 跳过表头，从第2行开始处理
      const employeeList = rows.slice(1).filter(row => row[0] && row[1]);

      let successCount = 0;
      for (let i = 0; i < employeeList.length; i++) {
        const [employeeId, realName,task] = employeeList[i];
        try {
          this.$setToken();
          await instance.post('/user/addAndUpdateNewUserEmployeeInfo', {
            employeeId,
            realName,
            task
          });
          successCount++;
        } catch (error) {
          console.error(`第 ${i + 2} 行导入失败：`, error);
        }
      }

      this.$message.success(`共导入成功 ${successCount} 条员工记录`);
      this.fetchEmployees(); // 刷新表格
    };

    reader.readAsBinaryString(file);
    return false; // 阻止默认上传行为
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
