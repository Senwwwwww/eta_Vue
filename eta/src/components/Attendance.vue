<template>
  <el-row gutter="20">
    <el-col :span="14">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>用户打卡情况表
          <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              format="yyyy-MM-dd"
              @change="fetchAttendanceData"
              class="month-picker"
          ></el-date-picker>
          </span>
        </div>
        <el-button size="small" type="primary" @click="exportExcel1">导出当前页</el-button>
        <el-table
            :data="tableData"
            style="width: 100%"
            :default-sort="{ prop: 'userDTO.userId', order: 'ascending' }"
            max-height="500"
            height="400"
        >
          <el-table-column
              prop="employeeDTO.employeeId"
              label="员工ID"
              sortable
              width="130"
          />
          <el-table-column
              prop="employeeDTO.realName"
              label="姓名"
              sortable
              width="130"
          />
          <el-table-column
              prop="clockInStatus"
              label="状态"
              sortable
              width="100"
          />
          <el-table-column
              prop="clockInStartTime"
              label="开始时间"
              sortable
              width="130"
          />
          <el-table-column
              prop="clockInEndTime"
              label="结束时间"
              sortable
              width="130"
          />
        </el-table>
      </el-card>
    </el-col>
    <el-col :span="10">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>用户打卡情况可视化</span>
        </div>
        <div ref="chart" style="height: 400px;"></div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import * as echarts from 'echarts';
import { instance } from "@/util/request";
import moment from "moment/moment";
import * as XLSX from "xlsx";
export default {
  data() {
    return {
      selectedDate: "",
      tableData: [],
      chartData: {
        success: 0,
        noSignOut: 0,
        late: 0,
        absent: 0,
      },
    };
  },
  mounted() {
    const today = new Date();
    this.selectedDate = today;
    this.fetchAttendanceData(); // 初始化页面时加载当日数据
  },
  methods: {

      exportExcel1() {
        // 获取表格数据
        const data = this.tableData.map(row => ({
          "员工ID": row.employeeDTO.employeeId,
          "姓名": row.employeeDTO.realName,
          "状态": row.clockInStatus,
          "开始时间": row.clockInStartTime,
          "结束时间": row.clockInEndTime
        }));

        // 创建一个工作簿
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "用户打卡情况");

        // 生成文件名
        const currentDate = moment(this.selectedDate).format('YYYY-MM-DD');
        const fileName = `用户打卡情况_${currentDate}.xlsx`;

        // 导出 Excel 文件并触发下载
        XLSX.writeFile(workbook, fileName);
    },
    fetchAttendanceData() {
      this.$setToken(); // 确保请求中带有 token

      const year = moment(this.selectedDate).format('YYYY');
      const month = moment(this.selectedDate).format('MM');
      const day = moment(this.selectedDate).format('DD');

      instance.get(`/user/getAttendanceOneDay/${year}-${month}-${day}`)
          .then(response => {
            if (response.data.success) {
              this.tableData = response.data.data;
              this.calculateChartData();
              this.initChart();
              this.$store.dispatch('logActivity', '查看打卡情况')
            } else {
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch(error => {
            this.$message.error("请求失败");
          });
    },
    calculateChartData() {
      this.chartData = {
        success: 0,
        noSignOut: 0,
        late: 0,
        absent: 0,
      };

      this.tableData.forEach(item => {
        switch (item.clockInStatus) {
          case '成功打卡':
            this.chartData.success++;
            break;
          case '已打卡未签退':
            this.chartData.noSignOut++;
            break;
          case '迟到':
            this.chartData.late++;
            break;
          case '缺勤':
            this.chartData.absent++;
            break;
        }
      });
    },
    initChart() {
      const chart = echarts.init(this.$refs.chart);
      const option = {
        title: {
          text: '打卡状态分布',
          left: 'center',
        },
        tooltip: {
          trigger: 'item',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        series: [
          {
            name: '打卡状态',
            type: 'pie',
            radius: '50%',
            data: [
              {value: this.chartData.success, name: '成功打卡', itemStyle: {color: '#67c23a'}}, // 绿色
              {value: this.chartData.noSignOut, name: '已打卡未签退', itemStyle: {color: '#e6a23c'}}, // 橙色
              {value: this.chartData.late, name: '迟到', itemStyle: {color: '#f56c6c'}}, // 红色
              {value: this.chartData.absent, name: '缺勤', itemStyle: {color: '#909399'}}, // 灰色
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      };
      chart.setOption(option);
    },
  },
};
</script>

<style scoped>
.box-card {
  margin-bottom: 20px;
}

.month-picker {
  float: right;
}
</style>
