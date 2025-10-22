import { createRouter, createWebHistory } from 'vue-router'
// 注意：这里的组件名要和你实际修改后的文件名一致（比如之前改成的LoginView等）
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

// 定义路由规则
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
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
  }
]

// 创建路由实例（关键：使用createRouter和createWebHistory）
const router = createRouter({
  history: createWebHistory(), // 使用createWebHistory
  routes // 使用routes变量
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isLogin = localStorage.getItem('userInfo')
  if (to.meta.requiresAuth && !isLogin) {
    next('/login')
  } else {
    next()
  }
})

// 导出路由实例（关键：确保导出后被main.js使用）
export default router