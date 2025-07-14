import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/layout',
    name: 'layout',
    component: () => import('../views/layout.vue'),
    children:[
      {
        path: "addJian",
        component:()=>import('../components/addJian.vue')
      },
      {
        path:"appre",
        component:()=>import('../components/ApplicationRecords.vue')
      },{
      path:"app",
        component:()=>import('../components/ApplyPage.vue')
      },{
      path:"AttRe",
        component:()=>import('../components/AttendanceRecords.vue')
      },{
      path:"feed",
        component:()=>import('../components/Feedback.vue')
      },{
      path:"feedre",
        component:()=>import('../components/FeedbackRecords.vue')
      },{
      path: "home",
        component:()=>import('../components/home.vue')
      },{
      path: "message",
        component:()=>import('../components/MessageCenter.vue')
      },{
      path: "person",
        component:()=>import('../components/PersonalInfo.vue')
      },
      {
        path:"AttUser",
        component:()=>import('../components/AttUser.vue')
      },
      {
        path:"change",
        component:()=>import('../components/ChangePassword.vue')
      },
      {
        path:"help",
        component:()=>import('../components/Help.vue')
      },
      {
        path:"yuanID",
        component:()=>import('../components/YuangongID.vue')
      },
      {
      path:"AttReGui",
        component:()=>import('../components/AttendanceRecordsGui.vue')
      },
      {
        path:"manage",
        component:()=>import('../components/Manage.vue')
      },
      {
        path:"attendanceManage",
        component:()=>import('../components/AttendanceManage.vue')
      },{
      path:'feedManage',
        component:()=>import('../components/FeedbackManage.vue')
      },
      {
        path:"usermanage",
        component:()=>import('../components/Usermanage.vue')
      },{
      path:"AttReAll",
        component:()=>import('../components/Attendance.vue')
      },{
      path: "manageEmployee",
        component:()=>import('../components/ManageEmployee.vue')
      },
      {
        path:"attenGui",
        component:()=>import('../components/AttendanceGui.vue')
      },
        {
          path:"Jianxiu",
          component:()=>import('../components/jianxiu.vue')
        },
      {
        path:"attendanceChange",
        component:()=>import('../components/attendanceChange.vue')
      },
        {
          path:"qr",
          component:()=>import('../views/qrcode.vue')
        },
      {
        path:"qrcreate",
        component:()=>import('../components/qrcreate.vue')
      },
        {
          path:"instrumentChange",
          component:()=>import('../components/instrumentChange.vue')
        },
    ]
  },
  {
    path:'/register',
    name: 'register',
    component: () => import('../views/Register.vue')
  },
    {
      path: '/',
      name: 'login',
      component: () => import('../views/login.vue')
    },
  {
    path: '/layout',
    name: 'layout',
    component: ()=>import('../views/layout.vue')
  },
  {
    path: '/relogin',
    name: 'relogin',
    component: () => import('../views/reLogin.vue')
  },
  {
    path:"/relogin2",
    name:"relogin2",
    component:()=>import('../views/reLogin2.vue')
  },
  {
    path:"/reloginok",
    name:"reloginok",
    component:()=>import('../views/reLoginok.vue')
  },
  {
    path:"/login",
    component:()=>import('../views/login.vue')
  },
  {
    path:"/bind",
    component:()=>import('../components/BindEmail.vue')
  },
  {
    path:"/items",
    component:()=>import('../views/items.vue')
  },
    {
      path:"/monitor",
      component:()=>import('../components/kongzhi.vue')
    },






  {
    path: "*",
    component:()=>import('../components/NotFound.vue')
  }





]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
