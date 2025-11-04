<template>
  <div class="role-container">
    <header>
      <h1>学生中心</h1>
      <div class="user-info">
        <span>欢迎您，{{ userStore.userInfo?.realName }}（学生）</span>
        <button @click="handleLogout">退出登录</button>
      </div>
    </header>
    <main>
      <h2>学生功能模块</h2>
      <ul>
        <li>
          <router-link to="/student/score-query" class="project-link">
            我的成绩查询
          </router-link>
        </li>
        <li><router-link to="/student/project-apply" class="project-link">
            创新创业项目申报
          </router-link>
        </li>
        <li><router-link to="/student/profile" class="project-link">
            个人中心
          </router-link>
        </li>
      </ul>
    </main>
  </div>
</template>

<script setup>
import { useUserStore } from '../store'
import { useRouter } from 'vue-router'
import { userLogout } from '../api/user'

const userStore = useUserStore()
const router = useRouter()

// 退出登录
const handleLogout = async () => {
  try {
    await userLogout()
  } catch (err) {
    console.error('退出登录失败', err)
  } finally {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.project-link {
  color: #3498db;
  text-decoration: none;
  display: block;
  width: 100%;
  height: 100%;
}

.project-link:hover {
  text-decoration: underline;
}

.role-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2ecc71;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info button {
  padding: 0.5rem 1rem;
  background-color: white;
  color: #2ecc71;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

main {
  flex: 1;
  padding: 2rem;
}

ul {
  margin-top: 1rem;
  list-style: none;
}

li {
  padding: 0.8rem;
  margin: 0.5rem 0;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style>