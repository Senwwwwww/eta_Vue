<template>
  <div class="attendance-calendar">
    <div class="calendar-header">
      <span>考勤日志</span>
      <el-date-picker
          v-model="selectedDate"
          type="month"
          placeholder="选择月份"
          format="yyyy-MM"
          @change="fetchAttendanceData"
          class="month-picker"
      ></el-date-picker>
    </div>
    <!-- 显示周几 -->
    <div class="weekdays">
      <el-row :gutter="10">
        <el-col v-for="(day, index) in weekdays" :key="index" :span="3" class="weekday">
          {{ day }}
        </el-col>
      </el-row>
    </div>
    <div class="calendar-grid">
      <el-row :gutter="10" class="calendar-row" v-for="(week, index) in calendarWeeks" :key="index">
        <el-col v-for="day in week" :key="day.date" :span="3" class="calendar-day">
          <div :class="['day-cell', day.statusClass]">
            <div class="date">{{ day.date }}</div>
            <div class="status">{{ day.status }}</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { instance } from "@/util/request";
import moment from "moment";

export default {
  data() {
    return {
      selectedDate: "", // 用户选择的年和月
      attendanceData: [], // 存储考勤数据
      calendarWeeks: [], // 存储日历视图的每周数据
      weekdays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"], // 星期几名称
    };
  },
  methods: {
    fetchAttendanceData() {
      this.$setToken(); // 确保请求中带有 token

      const year = moment(this.selectedDate).format("YYYY");
      const month = moment(this.selectedDate).format("MM");

      instance
          .get(
              `/user/getAttendance/${this.$store.state.admin.admin.data.data.userId}/${year}-${month}`
          )
          .then((response) => {
            if (response.data.success) {
              this.attendanceData = response.data.data.map((item) => ({
                date: item.clockInDate,
                status: item.clockInStatus ? item.clockInStatus : "未定义",
              }));
              this.generateCalendar();
            } else {
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch((error) => {
            this.$message.error("请求失败");
          });
    },
    generateCalendar() {
      const firstDay = moment(this.selectedDate).startOf("month").day(); // 获取月初的星期几
      const daysInMonth = moment(this.selectedDate).daysInMonth(); // 获取该月的天数

      const weeks = [];
      let week = [];

      for (let i = 0; i < firstDay; i++) {
        week.push({ date: "", status: "", statusClass: "" }); // 填充空白日期
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = moment(this.selectedDate).date(day).format("YYYY-MM-DD");
        const attendance = this.attendanceData.find((item) => item.date === currentDate);
        const status = attendance ? attendance.status : "未记录";
        const statusClass = this.getStatusClass(status);

        week.push({
          date: day,
          status,
          statusClass,
        });

        if (week.length === 7) {
          weeks.push(week);
          week = [];
        }
      }

      if (week.length > 0) {
        while (week.length < 7) {
          week.push({ date: "", status: "", statusClass: "" });
        }
        weeks.push(week);
      }

      this.calendarWeeks = weeks;
    },
    getStatusClass(status) {
      switch (status) {
        case "成功打卡":
          return "success";
        case "缺勤":
          return "danger";
        case "已打卡未签退":
          return "light-success"; // 使用淡绿色表示已打卡未签退
        case "迟到":
          return "danger";
        case "未记录":
          return "light-warning"; // 使用更淡的颜色表示未记录
        default:
          return "light-warning"; // 默认也是淡色
      }
    },
  },
  watch: {
    // 当 selectedDate 变化时，自动重新获取考勤数据
    selectedDate(newDate) {
      this.fetchAttendanceData();
    },
  },
  mounted() {
    const today = new Date();
    this.selectedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
    this.fetchAttendanceData(); // 初始化页面时加载当月数据
  },
};
</script>

<style scoped>
.attendance-calendar {
  padding: 20px;
  background-color: #f9fafc;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.month-picker {
  font-size: 16px;
}

.weekdays {
  margin-bottom: 10px;
}

.weekday {
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  color: #606266;
}

.calendar-grid {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.calendar-row {
  margin-bottom: 10px;
}

.calendar-day {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
}

.day-cell {
  text-align: center;
  padding: 15px;
  border-radius: 4px;
  width: 100%;
  height: 100%;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.day-cell.success {
  background-color: #67c23a;
  color: white;
}

.day-cell.danger {
  background-color: #f56c6c;
  color: white;
}

.day-cell.light-success {
  background-color: #e1f3d8; /* 淡绿色 */
  color: #67c23a;
}

.day-cell.light-warning {
  background-color: #faecd8;
  color: #e6a23c;
}

.date {
  font-size: 18px;
  font-weight: bold;
}

.status {
  margin-top: 5px;
  font-size: 14px;
}
</style>
