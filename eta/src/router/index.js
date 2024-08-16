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
      }
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
    path: "*",
    component:()=>import('../components/NotFound.vue')
  }
    // {
    //   path:"/",
    //   name:"fish",
    //   component:()=>import('../components/Fish.vue')
    // }
  // {
  //   path:"/",
  //   name:"message",
  //   component:()=>import('../components/PersonalInfo.vue')
  // }
  // {
  //   path:"/",
  //   name:"index",
  //   component:()=>import('../views/index.vue')
  // }




]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
