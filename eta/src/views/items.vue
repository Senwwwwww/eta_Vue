<template>
  <div class="container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span style="font-size: 18px; font-weight: bold;">器械详情</span>
      </div>

      <div v-if="instrumentInfo" class="instrument-info">
        <h3>器械信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="器械ID">{{ instrumentInfo.instrumentId }}</el-descriptions-item>
          <el-descriptions-item label="器械名称">{{ instrumentInfo.name }}</el-descriptions-item>
          <el-descriptions-item label="详细信息" :span="2">{{ instrumentInfo.detail }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusTagType(instrumentInfo.status)" class="status-tag">
              {{ getStatusText(instrumentInfo.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 20px;" >
          <h4>修改状态</h4>
          <el-select v-model="newStatus" placeholder="请选择新状态" style="width: 200px;">
            <el-option label="正常" value="normal"></el-option>
            <el-option label="维修中" value="repairing"></el-option>
            <el-option label="故障" value="broken"></el-option>
            <el-option label="停用" value="disabled"></el-option>
          </el-select>
          <el-button type="primary" @click="updateInstrumentStatus" :loading="updating" style="margin-left: 10px;">
            更新状态
          </el-button>
        </div>
      </div>

      <div v-if="!instrumentInfo && !loading" class="no-data">
        <el-alert title="未找到器械信息" type="warning" :closable="false"></el-alert>
      </div>

      <div v-if="loading" class="loading">
        <el-loading element-loading-text="正在加载器械信息..."></el-loading>
      </div>
    </el-card>
  </div>
</template>

<script>
import {instance} from "@/util/request";

export default {
  name: 'InstrumentDetail',
  data() {
    return {
      instrumentInfo: null,
      newStatus: '',
      updating: false,
      loading: false
    };
  },
  mounted() {
    this.loadInstrumentInfo();

    if(localStorage.getItem("loginID")) {
      this.$setToken()
      // 获取用户ID
      instance.get("user/name/" + localStorage.getItem('loginID'),this.username).then(res => {
        this.$store.commit("setAdmin", res)
        // 获取用户名称
        this.$setToken()
        instance.get("user/id/" + this.$store.state.admin.admin.data.data.userId,this.$store.state.admin.admin.data.data.userId).then(res1 => {
          if (res1.data.data.name != null) {
            this.$store.commit("setAdmin", res1)
            console.log(res1)
            this.$setToken()
            instance.get("user/personalInfo/id/" + this.$store.state.admin.admin.data.data.userId,this.$store.state.admin.admin.data.data.userId).then(res2 => {
              this.$store.commit("setAdmin", res2)
              console.log(res2)
              sessionStorage.setItem("flag","true")
              this.$store.commit("setAdmin", res2)
              this.$store.commit("setRole",res2.data.data.role)
              this.$store.commit("setName",res2.data.data.name)
              if(res2.data.data.department!=null) {
                this.$store.commit("setDepartment", res2.data.data.department)
              }
              this.$store.commit("setBioinformatics",res2.data.data.bioinformatics)
              this.$store.commit("setEmployeeDTO",res2.data.data.employeeDTO)
              this.$store.commit("setPersonalInfo",res2.data.data.personalInformationDTO)

            })
                .catch(err => {
                  // this.$message.error("请稍后再试")
                  sessionStorage.setItem("flag","false")
                })

          }else{
            this.$refs.setUsernameDialog.open()
          }
        })
            .catch(async err => {
              // sessionStorage.getItem("loginID")
            })
      })
          .catch(err => {
            // this.$router.push('/login')
          })
      //设置等待时间
      // 获取用户信息

    }else{
      this.$message.error("请先登录再访问管理页面")
      this.$router.push('/login')
    }

  },
  methods: {
    userDepartmentId() {
      return this.$store.state.admin?.admin?.data?.data?.department?.departmentId || null
    },
    loadInstrumentInfo() {
      // 从URL参数获取器械ID
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');

      if (id) {
        this.fetchInstrumentInfo(id);
      } else {
        this.$message.error('未找到器械ID参数');
      }
    },

    async fetchInstrumentInfo(id) {
      this.loading = true;
      try {
        this.$setToken()
        const response = await instance.get(`/api/instruments/${id}`);

        if (response) {
          this.instrumentInfo = response.data;
          this.newStatus = this.instrumentInfo.status;
          this.$message.success('器械信息获取成功');
        } else {
          this.$message.error('获取器械信息失败');
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.$message.error('器械不存在，请检查ID是否正确');
        } else {
          this.$message.error('网络错误，请重试');
        }
      } finally {
        this.loading = false;
      }
    },

    async updateInstrumentStatus() {
      if (!this.newStatus) {
        this.$message.warning('请选择新状态');
        return;
      }

      if (this.newStatus === this.instrumentInfo.status) {
        this.$message.info('状态未发生变化');
        return;
      }

      this.updating = true;
      try {
        this.$setToken()
        const response = await instance.put(`/api/instruments/${this.instrumentInfo.instrumentId}/status`, {
          status: this.newStatus
        });

        if (response.data && response.data.success ) {
          this.instrumentInfo.status = this.newStatus;
          this.$message.success('状态更新成功');
        } else {
          this.$message.error(response.data.message || '状态更新失败');
        }
      } catch (error) {
        console.error('更新状态错误:', error);
        if (error.response && error.response.data && error.response.data.message) {
          this.$message.error(error.response.data.message);
        } else {
          this.$message.error('网络错误，请重试');
        }
      } finally {
        this.updating = false;
      }
    },

    getStatusTagType(status) {
      const statusMap = {
        normal: 'success',
        repairing: 'warning',
        broken: 'danger',
        disabled: 'info'
      };
      console.log(this.userDepartmentId())
      return statusMap[status] || 'info';
    },

    getStatusText(status) {
      const statusMap = {
        normal: '正常',
        repairing: '维修中',
        broken: '故障',
        disabled: '停用'
      };
      return statusMap[status] || status;
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.instrument-info {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.status-tag {
  margin-left: 10px;
}

.no-data {
  text-align: center;
  padding: 40px;
}

.loading {
  text-align: center;
  padding: 40px;
}
</style>