<template>
  <div class="score-management-container">
    <header>
      <h1>成绩管理</h1>
      <div class="user-info">
        <span>欢迎您，{{ userStore.userInfo?.realName }}（教师）</span>
        <button @click="handleLogout">退出登录</button>
      </div>
    </header>
    <main>
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      
      <div v-if="!loading && achievements.length === 0 && !errorMsg" class="empty-state">
        暂无成绩数据
      </div>
      
      <div class="scores-table" v-if="achievements.length > 0">
      <table>
        <thead>
          <tr>
            <th>项目名称</th>
            <th>学生姓名</th>
            <th>分数</th>
            <th>等级</th>
            <th>评定时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in achievements" :key="item.achievement.achievementId">
            <td>{{ item.project?.projectName }}</td>
            <!-- 从members数组中提取学生姓名，用逗号拼接 -->
            <td>
              {{ item.members?.map(member => member.realName).join(', ') || '无学生' }}
            </td>
            <td>{{ item.achievement?.score }}</td>
            <td>{{ item.achievement?.grade }}</td>
            <td>{{ formatDate(item.achievement?.evaluationTime) }}</td>
            <td>
              <router-link :to="`/teacher/score-input/${item.project?.projectId}`" class="edit-btn">
                编辑
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store'
import { userLogout } from '../api/user'
import { getTeacherAchievements } from '../api/project'

const userStore = useUserStore()
const router = useRouter()

// 数据
const achievements = ref([])
const loading = ref(false)
const errorMsg = ref('')

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 页面加载时获取数据
onMounted(async () => {
  try {
    loading.value = true
    const res = await getTeacherAchievements()
    if (res.code === 0) {
      achievements.value = res.data
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
/* 基础样式与其他页面保持一致 */
.scores-table {
  margin-top: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
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

.edit-btn {
  color: #3498db;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: #f0f7ff;
}

.edit-btn:hover {
  background-color: #e0efff;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>