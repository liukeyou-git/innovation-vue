<template>
  <div class="role-container">
    <header>
      <h1>管理员控制台</h1>
      <div class="user-info">
        <span>欢迎您，{{ userStore.userInfo?.realName }}（管理员）</span>
        <button @click="handleLogout">退出登录</button>
      </div>
    </header>
    <main>
      <h2>管理员功能模块</h2>
      <ul>
        <li>
          <router-link to="/admin/user-management" class="project-link">
            用户管理
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

const handleLogout = async () => {
  try {
    // 调用后端退出接口
    await userLogout()
  } catch (err) {
    console.error('退出登录接口调用失败', err)
  } finally {
    // 无论后端是否成功，都清除本地用户信息并跳转登录页
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.project-link {
  color: #e74c3c;
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
  background-color: #e74c3c;
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
  color: #e74c3c;
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