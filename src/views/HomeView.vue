<template>
  <div class="home-container">
    <header>
      <h1>创新创业成绩管理系统</h1>
      <div class="user-info">
        <span>欢迎您，{{ userStore.userInfo.realName }}</span>
        <button @click="handleLogout">退出登录</button>
      </div>
    </header>
    <main>
      <p>当前角色：{{ getRoleName() }}</p>
      <p>系统功能即将上线，敬请期待...</p>
    </main>
  </div>
</template>

<script setup>
import { useUserStore } from '../store'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

// 获取角色名称
const getRoleName = () => {
  const roleMap = {
    0: '管理员',
    1: '教师',
    2: '学生'
  }
  return roleMap[userStore.userInfo.role] || '未知角色'
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #42b983;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info button {
  padding: 0.5rem 1rem;
  background-color: #ffffff;
  color: #42b983;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.user-info button:hover {
  background-color: #f0f0f0;
}

main {
  flex: 1;
  padding: 2rem;
}
</style>