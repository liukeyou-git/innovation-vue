<template>
  <div class="score-input-container">
    <header>
      <h1>成绩录入</h1>
      <div class="user-info">
        <span>欢迎您，{{ userStore.userInfo?.realName }}（教师）</span>
        <button @click="handleLogout">退出登录</button>
      </div>
    </header>
    <main>
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      
      <div v-if="project && !loading && !errorMsg" class="score-form-card">
        <h2>项目：{{ project.project?.projectName }}</h2>
        <p>申报学生：{{ project.studentName }}</p>
        
        <form @submit.prevent="handleSubmit" class="score-form">
          <div class="form-item">
            <label>分数 <span class="required">*</span></label>
            <input 
              type="number" 
              v-model="form.score" 
              min="0" 
              max="100" 
              step="0.5"
              placeholder="请输入分数(0-100)"
              required
            >
            <span class="form-hint">请输入0-100之间的数字，可保留一位小数</span>
          </div>
          
          <div class="form-item">
            <label>等级 <span class="required">*</span></label>
            <select v-model="form.grade" required>
              <option value="">请选择等级</option>
              <option value="优秀">优秀</option>
              <option value="良好">良好</option>
              <option value="中等">中等</option>
              <option value="及格">及格</option>
              <option value="不及格">不及格</option>
            </select>
          </div>
          
          <div class="form-item">
            <label>评语</label>
            <textarea 
              v-model="form.teacherComment"
              placeholder="请输入评语（可选）"
              rows="4"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="handleCancel">取消</button>
            <button type="submit" class="submit-btn" :disabled="submitting">
              <span v-if="submitting">提交中...</span>
              <span v-else>提交成绩</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store'
import { userLogout } from '../api/user'
import { getProjectDetail, saveProjectAchievement } from '../api/project'

// 状态管理
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

// 数据
const project = ref(null)
const loading = ref(true)
const submitting = ref(false)
const errorMsg = ref('')
const form = ref({
  score: null,           // 分数（数字类型）
  grade: '',             // 等级（字符串类型）
  teacherComment: ''     // 评语（与后端teacherComment字段匹配）
})

// 获取项目详情
const fetchProjectDetail = async () => {
  try {
    const projectId = route.params.id
    const res = await getProjectDetail(projectId)
    if (res.code === 0) {
      project.value = res.data
      // 如果已有成绩，回显数据（注意字段名匹配）
      if (project.value.achievement) {
        form.value.score = project.value.achievement.score
        form.value.grade = project.value.achievement.grade
        form.value.teacherComment = project.value.achievement.teacherComment || ''
      }
    } else {
      errorMsg.value = res.message || '获取项目信息失败'
    }
  } catch (err) {
    console.error('获取项目详情失败', err)
    errorMsg.value = '获取项目信息失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchProjectDetail()
})

// 表单提交
const handleSubmit = async () => {
  // 基础验证
  if (form.value.score === null || form.value.score < 0 || form.value.score > 100) {
    errorMsg.value = '请输入有效的分数（0-100）'
    return
  }
  
  if (!form.value.grade) {
    errorMsg.value = '请选择等级'
    return
  }
  
  try {
    submitting.value = true
    errorMsg.value = ''

    // 构造完整数据对象，包含projectId（整数类型）和表单数据
    const submitData = {
      projectId: parseInt(route.params.id),  // 转换为整数，与后端Integer类型匹配
      score: Number(form.value.score),       // 确保为数字类型
      grade: form.value.grade,
      teacherComment: form.value.teacherComment
    }

    // 调用API时仅传递一个数据对象（符合后端@RequestBody接收格式）
    const res = await saveProjectAchievement(submitData)
    
    if (res.code === 0) {
      alert('成绩录入成功')
      router.push('/teacher/score-management')
    } else {
      errorMsg.value = res.message || '成绩录入失败'
    }
  } catch (err) {
    console.error('提交成绩失败', err)
    errorMsg.value = '提交成绩失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

// 取消操作
const handleCancel = () => {
  // 方案1：简单返回上一页
  // router.back()
  
  // 方案2：带安全检查的返回（推荐）
  if (window.history.length > 1) {
    router.back()
  } else {
    // 如果是直接打开页面或没有历史记录，跳转到默认页面
    router.push('/teacher/score-management')
  }
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
/* 样式保持不变 */
.score-input-container {
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
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.score-form-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.form-item {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

input, select, textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

textarea {
  resize: vertical;
}

.required {
  color: #e74c3c;
}

.form-hint {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.9rem;
  color: #666;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  padding: 0.8rem 1.5rem;
  background-color: #999;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #777;
}

.submit-btn {
  padding: 0.8rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:hover:enabled {
  background-color: #2980b9;
}

.submit-btn:disabled {
  background-color: #95c5f8;
  cursor: not-allowed;
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