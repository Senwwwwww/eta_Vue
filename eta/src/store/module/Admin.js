// 当前登录账号模块
export default {
  // 设为私有命名空间
  namespace:true,
  state: {
      // 登录用户信息
    admin:{},
    // 将以下信息写入
  //    userID:this.$store.state.admin.admin.data.data.userId,
    //       ygID:this.$store.state.admin.admin.data.data.employeeDTO.employeeId,
    //       bumeng:null,
    //       name:this.$store.state.admin.admin.data.data.employeeDTO.realName,
    //       sex: this.$store.state.admin.admin.data.data.personalInformationDTO.sex,
    //       email:this.$store.state.admin.admin.data.data.email,
    //       birthDay:this.$store.state.admin.admin.data.data.personalInformationDTO.birthDay,
    employeeDTO:{},
    department:{},
    name:{},
    role:{},
    personalInfo:{},
    bioinformatics:{},
      messagenum:'',
      recentActivities: [], // 用于存储用户活动的数组






  },
    actions: {
        logActivity({ commit }, content) {
            const timestamp = new Date().toLocaleString();
            const activity = { timestamp, content };
            commit('ADD_ACTIVITY', activity);
        }
    },
    getters: {
        getRecentActivities: state => state.recentActivities,
    },
  mutations: {
    setAdmin(state,admin){
      state.admin=admin
   },
    setEmployeeDTO(state,employeeDTO){
      state.employeeDTO=employeeDTO
    },
    setDepartment(state,department){
      state.department=department
    },
    setName(state,name){
      state.name=name
    },
    setRole(state,role){
      state.role=role
    },
    setPersonalInfo(state,personalInfo){
      state.personalInfo=personalInfo
    },
    setBioinformatics(state,bioinformatics){
      state.bioinformatics=bioinformatics
    },
      setMessagenum(state,messagenum){
          state.messagenum=messagenum
      },
      ADD_ACTIVITY(state, activity) {
          state.recentActivities.unshift(activity);
          if (state.recentActivities.length > 10) {
              state.recentActivities.pop(); // 只保留最近10条记录
          }
      },



  }
}