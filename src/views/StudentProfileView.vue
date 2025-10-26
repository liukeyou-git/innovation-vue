<template>
  <div class="profile-container">
    <header>
      <h1>个人中心</h1>
      <div class="user-info">
        <span>欢迎您，{{ userStore.userInfo?.realName }}（学生）</span>
        <button @click="handleLogout">退出登录</button>
      </div>
    </header>
    <main>
      <div class="profile-card">
        <h2>个人信息</h2>
        <div class="info-item">
          <span class="label">用户名：</span>
          <span class="value">{{ userStore.userInfo?.username }}</span>
        </div>
        <div class="info-item">
          <span class="label">真实姓名：</span>
          <span class="value">{{ userStore.userInfo?.realName }}</span>
        </div>
        <div class="info-item">
          <span class="label">学号：</span>
          <span class="value">{{ userStore.userInfo?.studentId }}</span>
        </div>
        <div class="info-item">
          <span class="label">班级：</span>
          <span class="value">{{ userStore.userInfo?.className }}</span>
        </div>
        <div class="info-item">
          <span class="label">邮箱：</span>
          <span class="value">{{ userStore.userInfo?.email || '未填写' }}</span>
        </div>
        <div class="info-item">
          <span class="label">手机号：</span>
          <span class="value">{{ userStore.userInfo?.phone || '未填写' }}</span>
        </div>
      </div>

      <div class="projects-section">
        <h2>我的项目</h2>
        <div v-if="loading" class="loading">加载中...</div>
        
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        
        <div v-if="!loading && projects.length === 0 && !errorMsg" class="empty-state">
          您还没有申报项目，请<a href="/student/project-apply">点击申报</a>
        </div>
        
        <div class="projects-list" v-if="projects.length > 0">
          <div class="project-card" v-for="project in projects" :key="project.id">
            <div class="project-header">
              <h3>{{ project.projectName }}</h3>
              <span class="status" :class="getStatusClass(project.status)">
                {{ getStatusText(project.status) }}
              </span>
            </div>
            <div class="project-info">
              <p><span class="info-label">指导教师：</span>{{ project.teacherName }}</p>
              <p><span class="info-label">开始时间：</span>{{ formatDate(project.startTime) }}</p>
              <p><span class="info-label">结束时间：</span>{{ formatDate(project.endTime) }}</p>
              <p><span class="info-label">项目描述：</span>{{ project.description || '无' }}</p>
            </div>
            <div class="project-actions">
              <router-link :to="`/student/project-detail/${project.id}`" class="detail-btn">
                查看详情
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store'
import { userLogout, getCurrentUserProfile } from '../api/user'  // 新增：导入个人信息接口
import { getStudentProjects } from '../api/project'

const userStore = useUserStore()
const router = useRouter()

// 项目数据
const projects = ref([])
const loading = ref(false)
const errorMsg = ref('')
const profileLoading = ref(false)  // 新增：个人信息加载状态
const profileError = ref('')       // 新增：个人信息错误提示

// 页面加载时获取项目列表
onMounted(async () => {
  try {
    profileLoading.value = true
    const profileRes = await getCurrentUserProfile()
    if (profileRes.code === 0) {
      // 将获取到的个人信息更新到userStore
      userStore.setUserInfo(profileRes.data)
    } else {
      profileError.value = profileRes.message || '获取个人信息失败'
    }
  } catch (err) {
    console.error('获取个人信息失败', err)
    profileError.value = '获取个人信息失败，请刷新页面重试'
  } finally {
    profileLoading.value = false
  }  
  try {
    loading.value = true
    const res = await getStudentProjects()
    if (res.code === 0) {
      projects.value = res.data
    } else {
      errorMsg.value = res.message || '获取项目列表失败'
    }
  } catch (err) {
    console.error('获取项目失败', err)
    errorMsg.value = '获取项目列表失败，请稍后重试'
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
.profile-container {
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

.profile-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.info-item {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.label {
  display: inline-block;
  width: 100px;
  color: #666;
  font-weight: 500;
}

.projects-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.projects-list {
  margin-top: 1rem;
}

.project-card {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
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

.project-info {
  margin-bottom: 1rem;
  color: #555;
}

.info-label {
  color: #666;
  font-weight: 500;
}

.project-actions {
  text-align: right;
}

.detail-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
}

.detail-btn:hover {
  background-color: #2980b9;
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

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.empty-state a {
  color: #3498db;
  text-decoration: none;
}

.empty-state a:hover {
  text-decoration: underline;
}
</style>