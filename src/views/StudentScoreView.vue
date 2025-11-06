<!-- src/views/StudentScoreView.vue -->
<template>
  <div class="score-query-container">
    <header>
      <h1>我的成绩查询</h1>
      <div class="user-info">
        <span>欢迎您，{{ userStore.userInfo?.realName }}（学生）</span>
        <button @click="handleLogout">退出登录</button>
      </div>
    </header>
    <main>
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      
      <div v-if="!loading && scores.length === 0 && !errorMsg" class="empty-state">
        暂无成绩数据
      </div>
      
      <div class="scores-table" v-if="scores.length > 0">
        <table>
          <thead>
            <tr>
              <th>项目名称</th>
              <th>分数</th>
              <th>等级</th>
              <th>评语</th>
              <th>评定时间</th>
            </tr>
          </thead>
          <tbody>
            <!-- 1. 修改循环key为项目ID（避免依赖可能为null的achievementId） -->
            <tr v-for="item in scores" :key="item.projectId">
              <td>{{ item.projectName }}</td>
              <!-- 2. 所有achievement属性访问添加可选链判断 -->
              <td>{{ item.achievement?.score || '无' }}</td>
              <td>{{ item.achievement?.grade || '无' }}</td>
              <td>{{ item.achievement?.teacherComment || '无' }}</td>
              <td>{{ formatDate(item.achievement?.evaluationTime) || '未知时间' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="project-actions">
        <button type="button" class="back-btn" @click="router.back()">返回</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store'
import { userLogout } from '../api/user'
import { getStudentAchievements } from '../api/project' // 我们将在下一步添加这个API

const userStore = useUserStore()
const router = useRouter()

// 数据
const scores = ref([])
const loading = ref(false)
const errorMsg = ref('')

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 页面加载时获取成绩数据
onMounted(async () => {
  try {
    loading.value = true
    const res = await getStudentAchievements()
    if (res.code === 0) {
      scores.value = res.data
    } else {
      errorMsg.value = res.message || '获取成绩列表失败'
    }
  } catch (err) {
    console.error('获取成绩列表失败', err)
    errorMsg.value = '获取成绩列表失败，请稍后重试'
  } finally {
    loading.value = false
  }
})

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
.score-query-container {
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
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.scores-table {
  margin-top: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  background-color: #f8f9fa;
  color: #666;
  font-weight: 600;
}

.back-btn {
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  background-color: #999;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.back-btn:hover {
  background-color: #777;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error-msg {
  color: #e74c3c;
  text-align: center;
  padding: 1rem;
  background-color: #fef0f0;
  border-radius: 4px;
}
</style>