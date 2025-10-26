<template>
  <div class="project-detail-container">
    <header>
      <h1>项目详情</h1>
      <div class="user-info">
        <span>欢迎您，{{ userStore.userInfo?.realName }}（学生）</span>
        <button @click="handleLogout">退出登录</button>
      </div>
    </header>
    <main>
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      
      <div v-if="project" class="project-detail-card">
        <div class="project-header">
          <h2>{{ project.projectName }}</h2>
          <span class="status" :class="getStatusClass(project.status)">
            {{ getStatusText(project.status) }}
          </span>
        </div>
        
        <div class="project-info-section">
          <h3>项目基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">指导教师：</span>
              <span class="value">{{ project.teacherName }}</span>
            </div>
            <div class="info-item">
              <span class="label">开始时间：</span>
              <span class="value">{{ formatDate(project.startTime) }}</span>
            </div>
            <div class="info-item">
              <span class="label">结束时间：</span>
              <span class="value">{{ formatDate(project.endTime) }}</span>
            </div>
          </div>
          
          <div class="info-item full-width">
            <span class="label">项目描述：</span>
            <div class="value">{{ project.description || '无' }}</div>
          </div>
        </div>
        
        <div class="project-members-section">
          <h3>项目成员</h3>
          <table class="members-table">
            <thead>
              <tr>
                <th>学号</th>
                <th>姓名</th>
                <th>角色</th>
                <th>贡献描述</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in project.members" :key="member.userId">
                <td>{{ member.studentId }}</td>
                <td>{{ member.realName }}</td>
                <td>{{ member.roleInProject === '0' ? '负责人' : '成员' }}</td>
                <td>{{ member.contribution || '无' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="project-actions">
          <button type="button" class="back-btn" @click="router.back()">返回</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store'
import { userLogout } from '../api/user'
import { getProjectDetail } from '../api/project'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 项目数据
const project = ref(null)
const loading = ref(false)
const errorMsg = ref('')

// 页面加载时获取项目详情
onMounted(async () => {
  try {
    loading.value = true
    const projectId = route.params.id
    const res = await getProjectDetail(projectId)
    if (res.code === 0) {
      project.value = res.data
    } else {
      errorMsg.value = res.message || '获取项目详情失败'
    }
  } catch (err) {
    console.error('获取项目详情失败', err)
    errorMsg.value = '获取项目详情失败，请稍后重试'
  } finally {
    loading.value = false
  }
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未设置'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// 项目状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '已通过',
    2: '已驳回'
  }
  return statusMap[status] || '未知状态'
}

// 项目状态样式
const getStatusClass = (status) => {
  const classMap = {
    0: 'pending',
    1: 'approved',
    2: 'rejected'
  }
  return classMap[status] || ''
}

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
.project-detail-container {
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

.project-detail-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.status {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: white;
}

.status.pending {
  background-color: #f39c12;
}

.status.approved {
  background-color: #2ecc71;
}

.status.rejected {
  background-color: #e74c3c;
}

.project-info-section, .project-members-section {
  margin-bottom: 2rem;
}

h3 {
  margin-bottom: 1rem;
  color: #333;
  border-left: 4px solid #2ecc71;
  padding-left: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  margin-bottom: 0.5rem;
}

.label {
  display: inline-block;
  width: 100px;
  color: #666;
  font-weight: 500;
}

.full-width {
  width: 100%;
}

.full-width .value {
  display: block;
  margin-top: 0.5rem;
  line-height: 1.6;
}

.members-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.members-table th, .members-table td {
  padding: 0.8rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.members-table th {
  background-color: #f8f9fa;
  color: #666;
}

.project-actions {
  margin-top: 2rem;
  text-align: right;
}

.back-btn {
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

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error-msg {
  color: #e74c3c;
  text-align: center;
  padding: 1rem;
}
</style>