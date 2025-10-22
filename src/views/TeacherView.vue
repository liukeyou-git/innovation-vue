<template>
  <div class="role-container">
    <header>
      <h1>教师工作台</h1>
      <div class="user-info">
        <span>欢迎您，{{ userStore.userInfo.realName }}（教师）</span>
        <button @click="handleLogout">退出登录</button>
      </div>
    </header>
    <main>
      <h2>教师功能模块</h2>
      <ul>
        <li>学生成绩录入</li>
        <li>成绩查询</li>
        <li>创新创业项目管理</li>
      </ul>
    </main>
  </div>
</template>

<script setup>
import { useUserStore } from '../store'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
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
  background-color: #3498db;
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
  color: #3498db;
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