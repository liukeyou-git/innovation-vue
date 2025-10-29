<template>
  <div class="project-management-container">
    <header>
      <h1>项目管理</h1>
      <div class="user-info">
        <span>欢迎您，{{ userStore.userInfo?.realName }}（教师）</span>
        <button @click="handleLogout">退出登录</button>
      </div>
    </header>
    <main>
      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'pending' }" 
          @click="activeTab = 'pending'"
        >
          待审核项目
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'approved' }" 
          @click="activeTab = 'approved'"
        >
          已审核项目
        </button>

        <!-- 新增：已结题项目标签 -->
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'completed' }" 
          @click="activeTab = 'completed'"
        >
          已结题项目
        </button>
      </div>
      
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      
      <div v-if="!loading && projects.length === 0 && !errorMsg" class="empty-state">
        暂无{{ activeTab === 'pending' ? '待审核' : '已审核' }}项目
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
            <p><span class="info-label">申报学生：</span>{{ project.studentName }}</p>
            <p><span class="info-label">学号：</span>{{ project.studentId }}</p>
            <p><span class="info-label">提交时间：</span>{{ formatDate(project.submitTime) }}</p>
            <!-- 新增：已结题项目显示结题时间 -->
            <p v-if="project.status === 3 && project.completeTime" class="info-item">
              <span class="info-label">结题时间：</span>{{ formatDate(project.completeTime) }}
            </p>
            <p><span class="info-label">项目简述：</span>{{ truncate(project.description || '无', 50) }}</p>
          </div>
          <div class="project-actions">
            <router-link :to="`/teacher/projects-detail/${project.id}`" class="detail-btn">
              查看详情
            </router-link>
            
            <div v-if="activeTab === 'pending'" class="review-buttons">
              <button class="approve-btn" @click="handleReview(project.id, 1)">通过</button>
              <button class="reject-btn" @click="handleReview(project.id, 2)">驳回</button>
            </div>
            <div v-if="activeTab === 'approved' && project.status === 1" class="complete-action">
              <button class="complete-btn" @click="handleComplete(project.id)">结题</button>
            </div>
          </div>
        </div>
      </div>
      <div class="project-actions">
          <button type="button" class="back-btn" @click="router.back()">返回列表</button>
        </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store'
import { userLogout } from '../api/user'
import { getTeacherPendingProjects, getTeacherApprovedProjects, getTeacherCompletedProjects, reviewProject,completeProject } from '../api/project'

const userStore = useUserStore()
const router = useRouter()

// 状态管理
const activeTab = ref('pending')
const projects = ref([])
const loading = ref(false)
const errorMsg = ref('')

// 加载项目列表
const loadProjects = async () => {
  try {
    loading.value = true
    let res
    if (activeTab.value === 'pending') {
      res = await getTeacherPendingProjects()
    } else if (activeTab.value === 'approved') {
      res = await getTeacherApprovedProjects()
    } else {
      res = await getTeacherCompletedProjects() // 新增：已结题
    }
    
    if (res.code === 0) {
      projects.value = res.data
      errorMsg.value = ''
    } else {
      errorMsg.value = res.message || '获取项目列表失败'
    }
  } catch (err) {
    console.error('获取项目失败', err)
    errorMsg.value = '获取项目列表失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 页面加载和标签切换时加载数据
onMounted(loadProjects)
watch(activeTab, loadProjects)

// 处理项目审核
const handleReview = async (projectId, status) => {
  if (!confirm(`确定要${status === 1 ? '通过' : '驳回'}该项目吗？`)) {
    return
  }
  
  try {
    const res = await reviewProject(projectId, { 
      status
    })
    
    if (res.code === 0) {
      // 重新加载列表
      loadProjects()
    } else {
      alert(res.message || '审核操作失败')
    }
  } catch (err) {
    console.error('审核项目失败', err)
    alert('审核操作失败，请稍后重试')
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 项目状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '已通过',
    2: '已驳回',
    3: '已结题'  // 新增状态
  }
  return statusMap[status] || '未知状态'
}

// 项目状态样式
const getStatusClass = (status) => {
  const classMap = {
    0: 'pending',
    1: 'approved',
    2: 'rejected',
    3: 'completed'  // 新增状态
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

// 结题处理函数
const handleComplete = async (projectId) => {
  if (!confirm('确定要将该项目标记为已结题吗？')) {
    return
  }
  
  try {
    const res = await completeProject(projectId, { 
      status: 3,
      completeTime: new Date().toISOString()
    })
    
    if (res.code === 0) {
      // 重新加载列表
      loadProjects()
    } else {
      alert(res.message || '结题操作失败')
    }
  } catch (err) {
    console.error('项目结题失败', err)
    alert('结题操作失败，请稍后重试')
  }
}

// 在现有的 script 部分添加以下方法
const truncate = (str, length) => {
  if (str.length <= length) {
    return str;
  }
  return str.substring(0, length) + '...';
}
</script>

<style scoped>
.complete-btn {
  padding: 0.5rem 1rem;
  background-color: #165DFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.status.completed {
  background-color: #165DFF;
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

.project-management-container {
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
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.tabs {
  display: flex;
  margin-bottom: 2rem;
  gap: 1rem;
}

.tab-btn {
  padding: 0.8rem 1.5rem;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.tab-btn.active {
  background-color: #3498db;
  color: white;
}

.projects-list {
  margin-top: 1rem;
}

.project-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
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
  margin-bottom: 1.5rem;
  color: #555;
  line-height: 1.6;
}

.info-label {
  color: #666;
  font-weight: 500;
  display: inline-block;
  width: 90px;
}

.project-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.detail-btn {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
}

.review-buttons {
  display: flex;
  gap: 0.5rem;
}

.approve-btn {
  padding: 0.5rem 1rem;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reject-btn {
  padding: 0.5rem 1rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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
  background-color: #f9f9f9;
  border-radius: 8px;
}
</style>