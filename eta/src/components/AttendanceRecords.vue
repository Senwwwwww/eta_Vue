<template>
  <div class="attendance-records">
    <el-row :gutter="20">
      <!-- 考勤记录 -->
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>考勤记录</span>
            <el-date-picker
                v-model="selectedDate"
                type="month"
                placeholder="选择月份"
                format="yyyy-MM"
                @change="fetchAttendanceData"
                class="month-picker"
            ></el-date-picker>
          </div>
          <div class="attendance-grid">
            <el-row :gutter="10">
              <el-col v-for="(day, index) in weekdays" :key="index" :span="3" class="day-label">
                {{ day }}
              </el-col>
            </el-row>
            <el-row :gutter="10" v-for="(week, index) in weeks" :key="index">
              <el-col
                  v-for="(day, index) in week"
                  :key="index"
                  :span="3"
                  class="day-cell"
                  :class="{'is-today': day.isToday, 'is-holiday': day.isHoliday}"
              >
                <div v-if="day.date" class="day-content">
                  <div class="day-header">
                    <span>{{ day.date }}</span>
                    <span v-if="day.isHoliday" class="holiday-label">假</span>
                  </div>
                  <div class="attendance-status">
                    <el-tag
                        :type="day.status === '出勤' ? 'success' : day.status === '缺勤' ? 'danger' : 'warning'"
                        effect="dark"
                    >
                      {{ day.status }}
                    </el-tag>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedDate: '', // 用户选择的年和月
      weeks: [], // 存储按周排列的考勤数据
      weekdays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], // 星期的显示顺序
    };
  },
  methods: {
    fetchAttendanceData() {
      if (!this.selectedDate) return;

      const [year, month] = this.selectedDate.split('-');
      const daysInMonth = new Date(year, month, 0).getDate();
      const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 获取月份第一天是星期几

      // 模拟数据获取，这里应该调用API获取指定月份的考勤数据
      const mockData = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const date = `${this.selectedDate}-${i.toString().padStart(2, '0')}`;
        mockData.push({
          date: i,
          status: i % 2 === 0 ? '出勤' : '缺勤', // 假设偶数日为出勤，奇数日为缺勤
          isHoliday: [0, 6].includes(new Date(date).getDay()), // 判断是否为周末
          isToday: date === new Date().toISOString().split('T')[0],
        });
      }

      this.weeks = this.formatWeeks(mockData, firstDayOfWeek);
    },
    formatWeeks(data, firstDayOfWeek) {
      // 将考勤数据格式化为按周显示的二维数组，且第一天对齐星期
      const weeks = [];
      let week = new Array(firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1).fill({}); // 填充空白日

      data.forEach(day => {
        week.push(day);
        if (week.length === 7) {
          weeks.push(week);
          week = [];
        }
      });

      if (week.length > 0) {
        weeks.push(week.concat(new Array(7 - week.length).fill({}))); // 补齐最后一周的空白
      }

      return weeks;
    }
  },
  mounted() {
    const today = new Date();
    this.selectedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    this.fetchAttendanceData(); // 初始化页面时加载当月数据
  }
};
</script>

<style scoped>
.attendance-records {
  padding: 20px;
  background-color: #f9fafc;
}

.el-card {
  margin-bottom: 20px;
}

.month-picker {
  float: right;
}

.attendance-grid {
  margin-top: 20px;
}

.day-label {
  text-align: center;
  font-weight: bold;
}

.day-cell {
  text-align: center;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ebeef5;
}

.day-content {
  height: 80px; /* 设置单元格高度 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.day-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.holiday-label {
  color: red;
}

.is-today {
  background-color: #f0f9eb;
}

.is-holiday {
  background-color: #fcf3f2;
}

.attendance-status {
  margin-top: 10px;
}
</style>
