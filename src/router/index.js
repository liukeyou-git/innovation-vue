import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AdminView from '../views/AdminView.vue'
import TeacherView from '../views/TeacherView.vue'
import StudentView from '../views/StudentView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { requiresAuth: false }
  },
  // 管理员路由（仅role=0可访问）
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { 
      requiresAuth: true,
      roles: [0] // 允许访问的角色（0=管理员）
    }
  },
  // 教师路由（仅role=1可访问）
  {
    path: '/teacher',
    name: 'Teacher',
    component: TeacherView,
    meta: { 
      requiresAuth: true,
      roles: [1] // 允许访问的角色（1=教师）
    }
  },
  // 学生路由（仅role=2可访问）
  {
    path: '/student',
    name: 'Student',
    component: StudentView,
    meta: { 
      requiresAuth: true,
      roles: [2] // 允许访问的角色（2=学生）
    }
  },
  {
  path: '/student/project-apply',
  name: 'StudentProjectApply',
  component: () => import('../views/StudentProjectApplyView.vue'),
  meta: { 
    requiresAuth: true,
    roles: [2] // 仅学生可访问
  }
  },
  // 重定向：未匹配路径跳转到登录页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：验证登录状态和角色权限
router.beforeEach((to, from, next) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
  
  // 1. 未登录用户只能访问登录/注册页
  if (to.meta.requiresAuth && !userInfo) {
    next('/login')
    return
  }
  
  // 2. 已登录用户验证角色权限
  if (to.meta.requiresAuth && userInfo) {
    const userRole = userInfo.role
    // 检查当前角色是否在路由允许的角色列表中
    if (to.meta.roles.includes(userRole)) {
      next()
    } else {
      // 角色不匹配：跳转到对应角色的首页（或提示无权限）
      switch(userRole) {
        case 0:
          next('/admin')
          break
        case 1:
          next('/teacher')
          break
        case 2:
          next('/student')
          break
        default:
          next('/login')
      }
    }
    return
  }
  
  // 3. 无需登录的页面直接放行
  next()
})

export default router