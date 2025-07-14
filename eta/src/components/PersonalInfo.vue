<template>
  <div class="personal-info">

    <!-- 弹窗 -->
    <el-dialog title="修改个人信息" :visible.sync="dialogVisible" width="30%">
      <el-form :model="form">
        <el-form-item label="生日" :label-width="formLabelWidth">
          <div class="block">
            <span class="demonstration"></span>
            <el-date-picker
                v-model="form.birthDay"
                type="date"
                format="yyyy 年 MM 月 dd 日"
                placeholder="选择日期">
            </el-date-picker>
          </div>
        </el-form-item>
        <!-- 性别 -->
        <el-form-item label="性别" :label-width="formLabelWidth">
          <el-radio-group v-model="form.sex">
            <el-radio label="男"></el-radio>
            <el-radio label="女"></el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </div>
    </el-dialog>

    <el-row :gutter="20">
      <!-- Left side: Personal Information -->
      <el-col :span="12">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
            <el-link class="view-link" @click="viewDetails">修改</el-link>
          </div>
          <div class="info-content">
            <div class="avatar-container">
              <!-- 头像显示和上传 -->
              <el-upload
                  class="avatar-uploader"
                  :show-file-list="false"
                  :auto-upload="false"
                  :on-change="handleFileChange"
                  :headers="uploadHeaders"
                  accept="image/jpeg,image/png,image/jpg">
                <img v-if="avatarUrl" :src="avatarUrl" class="avatar" alt="头像">
                <div v-else class="avatar-uploader-icon">
                  <i class="el-icon-plus"></i>
                  <p>点击上传头像</p>
                </div>
              </el-upload>
              <p class="avatar-tips">支持 JPG/PNG 格式，大小不超过 2MB</p>
            </div>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户ID" >{{ userID }}</el-descriptions-item>
              <el-descriptions-item label="员工ID" v-if="ygID !=null">{{ ygID }}</el-descriptions-item>
              <el-descriptions-item label="职务" v-if="bumeng !=null">{{ bumeng }}</el-descriptions-item>
              <el-descriptions-item label="姓名" v-if="name !=null">{{ name }}</el-descriptions-item>
              <el-descriptions-item label="性别" v-if="sex !=null">{{ sex }}</el-descriptions-item>
              <el-descriptions-item label="联系方式" v-if="email !=null">{{ email }}</el-descriptions-item>
              <el-descriptions-item label="出生日期" v-if="birthDay !=null">{{ birthDay }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <!-- Right side -->
      <el-col :span="12">
        <el-row :gutter="20">
          <!-- Recent Activity -->
          <el-col :span="12">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-card class="box-card" shadow="hover">
                  <div slot="header" class="clearfix">
                    <span>最近活动</span>
                  </div>
                  <div class="activity-content scrollable-content">
                    <el-timeline>
                      <el-timeline-item
                          v-for="(activity, index) in recentActivities"
                          :key="index"
                          :timestamp="formatTimestamp(activity.timestamp)"
                          placement="top">
                        {{ activity.content }}
                      </el-timeline-item>
                    </el-timeline>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </el-col>

          <!-- Unread Reminders -->
          <el-col :span="24" v-if="$store.state.admin && $store.state.admin.admin && $store.state.admin.admin.data && $store.state.admin.admin.data.data && $store.state.admin.admin.data.data.role && $store.state.admin.admin.data.data.role.roleLevel <= 100">
            <el-card class="box-card" shadow="hover">
              <div slot="header" class="clearfix">
                <span>未读提醒</span>
                <el-link class="view-link" @click="viewMessages">查看</el-link>
              </div>
              <div class="reminder-content">
                <p>您有{{ unreadMessagesCount }}条未读消息。</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getUserInfo } from "@/api/user";
import dayjs from 'dayjs';
import {instance} from "@/util/request";

export default {
  name: "PersonalInfo",
  data() {
    return {
      messages:[],
      formLabelWidth: '100px', // 表单标签宽度
      form:{
        birthDay:'',
        sex: '',
        userId: this.$store.state.admin?.admin?.data?.data?.userId || null,
      },
      userID:null,
      ygID:null,
      bumeng:null,
      name:null,
      sex: null,
      email:null,
      birthDay:null,
      avatarUrl: '', // 头像URL
      recentActivities:null,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      unreadMessagesCount: this.$store.state.admin?.messagenum || 0, // 未读消息数量
      dialogVisible: false, // 控制弹窗显示与隐藏
      uploadLoading: false, // 上传状态

      // 头像上传相关
      uploadHeaders: {
        'Authorization': 'Bearer ' + (this.$store.state.admin?.token || '')
      }
    }
  },

  // 监听vuex中的messagenum的值
  mounted() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setMessagenum') {
        this.unreadMessagesCount = state.admin.messagenum;
      }
    });
  },

  created(){
    this.$setToken();
    // 确保store数据已经加载后再获取个人信息
    if (this.$store.state.admin?.admin?.data?.data?.userId) {
      this.fetchPersonalInfo();
      this.fetchRecentActivities();
      this.loadUserAvatar();
    } else {
      // 如果store数据还未加载，等待一段时间后重试
      setTimeout(() => {
        if (this.$store.state.admin?.admin?.data?.data?.userId) {
          this.fetchPersonalInfo();
          this.fetchRecentActivities();
          this.loadUserAvatar();
        }
      }, 1000);
    }
  },

  methods: {
    // 获取个人信息
    fetchPersonalInfo() {
      const userId = this.$store.state.admin?.admin?.data?.data?.userId;
      if (!userId) {
        this.$message.error("用户信息获取失败");
        return;
      }

      instance.get('/user/personalInfo/id/' + userId)
          .then(response => {
            if (response.data.success) {
              this.userID = response.data.data.userId;
              this.email = response.data.data.email;
              if(response.data.data.employeeDTO) {
                this.ygID = response.data.data.employeeDTO.employeeId;
                this.name = response.data.data.employeeDTO.realName;
              }
              if(response.data.data.personalInformationDTO) {
                this.birthDay = response.data.data.personalInformationDTO.birthDay;
                this.sex = response.data.data.personalInformationDTO.sex;
              }
              if(response.data.data.department){
                this.bumeng = response.data.data.department.departmentName;
              }
            }else{
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch(error => {
            this.$message.error("请求失败");
          });
    },

    // 获取最近活动
    fetchRecentActivities() {
      const userId = this.$store.state.admin?.admin?.data?.data?.userId;
      if (!userId) {
        return;
      }

      instance.get('/user/behavior/top10/' + userId)
          .then(response => {
            if (response.data.success) {
              this.recentActivities = response.data.data;
              this.recentActivities.forEach(activity => {
                activity.timestamp = activity.behaviorTime;
                activity.content = activity.behaviorData;
              });
            } else {
              this.$message.error(response.data.errorMsg);
            }
          });
    },

    // 加载用户头像
    loadUserAvatar() {
      const userId = this.$store.state.admin?.admin?.data?.data?.userId;
      if (!userId) {
        return;
      }
      this.$setToken();
      instance.get(`/user/getBioinformatics/${userId}`)
          .then(response => {
            if (response.data.success && response.data.data) {
              // 使用后端返回的base64格式头像URL
              this.avatarUrl = response.data.data.avatarUrl;
            }
          })
          .catch(error => {
            console.log("加载头像失败，使用默认头像");
            // 如果加载失败，可以设置默认头像
            this.avatarUrl = require('@/assets/logo.png');
          });
    },

    // 文件选择变化时的处理方法
    handleFileChange(file, fileList) {
      if (file.raw) {
        // 执行上传前的校验
        if (this.beforeAvatarUpload(file.raw)) {
          this.uploadAvatar(file.raw);
        }
      }
    },

    // 使用FormData进行头像上传
    uploadAvatar(file) {
      const userId = this.$store.state.admin?.admin?.data?.data?.userId;
      if (!userId) {
        this.$message.error("用户信息获取失败");
        return;
      }

      // 显示上传进度
      this.uploadLoading = true;
      this.$message.info('正在上传头像...');

      // 创建FormData对象
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('bioinfoId', this.$store.state.admin?.admin?.data?.data?.bioinfoId || '');
      formData.append('face', file);

      // 使用instance进行上传
      this.$setToken();
      instance.post('/user/updateBioinformatics', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...this.uploadHeaders
        }
      })
          .then(response => {
            this.uploadLoading = false;
            if (response.data.success) {
              this.$message.success('头像上传成功');
              // 重新加载头像
              this.loadUserAvatar();
              // 可以选择刷新用户信息
              this.fetchPersonalInfo();
            } else {
              this.$message.error(response.data.errorMsg || '头像上传失败');
            }
          })
          .catch(error => {
            this.uploadLoading = false;
            console.error('头像上传失败:', error);
            this.$message.error('头像上传失败');
          });
    },

    // 头像上传前的校验
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isPNG = file.type === 'image/png';
      const isJPEG = file.type === 'image/jpg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG && !isPNG && !isJPEG) {
        this.$message.error('上传头像图片只能是 JPG 或 PNG 格式!');
        return false;
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
        return false;
      }

      return true;
    },

    viewDetails() {
      this.$message("查看个人信息详情");
      this.dialogVisible = true;
    },

    formatTimestamp(ts) {
      return dayjs(ts).format('YYYY-MM-DD HH:mm')
    },

    viewMessages() {
      this.$message("查看未读提醒");
      this.$router.push('/layout/message');
    },

    submitForm() {
      const userId = this.$store.state.admin?.admin?.data?.data?.userId;
      if (!userId) {
        this.$message.error("用户信息获取失败");
        return;
      }

      this.$setToken();
      // 更新form中的userId
      this.form.userId = userId;
      this.$setToken();
      instance.put("/user/addAndUpdatePersonalInfo/" + userId, this.form)
          .then(response => {
            if(response.data.success) {
              this.$message.success("设置成功");
              this.dialogVisible = false;
              this.sex = this.form.sex;
              this.birthDay = this.form.birthDay;
            }else{
              this.$message.error(response.data.errorMsg);
            }
          })
          .catch(error => {
            this.$message.error("设置失败");
          })
    }
  }
}
</script>

<style scoped>
.personal-info {
  padding: 20px;
  background-color: #f9fafc;
}

.el-card {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.avatar-uploader-icon i {
  font-size: 32px;
  margin-bottom: 8px;
}

.avatar-uploader-icon p {
  margin: 0;
  font-size: 14px;
  color: #8c939d;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
  border-radius: 6px;
  object-fit: cover;
}

.avatar-tips {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  text-align: center;
}

.info-content {
  height: 57vh;
}

.info-content p {
  margin: 5px 0;
  text-align: left;
}

.activity-content {
  padding: 10px;
}

.reminder-content p {
  margin: 5px 0;
}

.scrollable-content {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
  width: 100%;
  box-sizing: border-box;
}

.view-link {
  float: right;
}

/* 新增：上传时的加载状态 */
.avatar-uploader.loading {
  opacity: 0.6;
  pointer-events: none;
}
</style>