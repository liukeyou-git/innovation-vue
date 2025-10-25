<template>
  <div class="project-apply-container">
    <header>
      <h1>项目申报</h1>
      <div class="user-info">
        <span>欢迎您，{{ userStore.userInfo?.realName }}（学生）</span>
        <button @click="handleLogout">退出登录</button>
      </div>
    </header>
    <main>
      <form @submit.prevent="handleSubmit" class="apply-form">
        <div class="form-section">
          <h2>项目基本信息</h2>
          
          <div class="form-item">
            <label>项目名称 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="form.projectName" 
              placeholder="请输入项目名称" 
              required
              maxlength="100"
            >
          </div>
          
          <div class="form-item">
            <label>项目描述</label>
            <textarea 
              v-model="form.description" 
              placeholder="请输入项目描述" 
              rows="5"
            ></textarea>
          </div>
          
          <div class="form-item">
            <label>指导教师 <span class="required">*</span></label>
            <select v-model="form.teacherId" required>
              <option value="">请选择指导教师</option>
              <option v-for="teacher in teachers" :key="teacher.userId" :value="teacher.userId">
                {{ teacher.realName }}
              </option>
            </select>
          </div>
          
          <div class="form-item">
            <label>计划开始时间</label>
            <input 
              type="date" 
              v-model="form.startTime" 
            >
          </div>
          
          <div class="form-item">
            <label>计划结束时间</label>
            <input 
              type="date" 
              v-model="form.endTime" 
            >
          </div>
        </div>
        
        <div class="form-section">
          <h2>项目成员信息</h2>
          <p class="section-desc">至少包含一名负责人（您自己）</p>
          
          <div class="members-list">
            <div class="member-item" v-for="(member, index) in form.members" :key="index">
              <div class="form-item inline">
                <label>学号 <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="member.studentId" 
                  placeholder="请输入学号" 
                  required
                  @blur="searchStudent(index)"
                >
              </div>
              
              <div class="form-item inline">
                <label>姓名</label>
                <input 
                  type="text" 
                  v-model="member.realName" 
                  readonly
                  placeholder="自动填充"
                >
              </div>
              
              <div class="form-item inline">
                <label>角色 <span class="required">*</span></label>
                <select v-model="member.roleInProject" required>
                  <option value="0">负责人</option>
                  <option value="1">成员</option>
                </select>
              </div>
              
              <div class="form-item inline contribution">
                <label>贡献描述</label>
                <textarea 
                  v-model="member.contribution" 
                  placeholder="请输入该成员的贡献描述" 
                  rows="2"
                ></textarea>
              </div>
              
              <button 
                type="button" 
                class="remove-btn" 
                @click="removeMember(index)"
                :disabled="form.members.length <= 1"
              >
                删除
              </button>
            </div>
          </div>
          
          <button type="button" class="add-btn" @click="addMember">
            + 添加成员
          </button>
        </div>
        
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="router.back()">取消</button>
          <button type="submit" class="submit-btn">提交申报</button>
        </div>
        
        <div v-if="message" class="msg" :class="{ success: isSuccess, error: !isSuccess }">
          {{ message }}
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store'
import { userLogout } from '../api/user'
import { getTeachersList, searchStudentByUserId, createProject } from '../api/project'

const userStore = useUserStore()
const router = useRouter()

// 表单数据
const form = ref({
  projectName: '',
  description: '',
  teacherId: '',
  startTime: '',
  endTime: '',
  members: [
    {
      studentId: userStore.userInfo?.studentId || '',
      userId: userStore.userInfo?.userId || '',
      realName: userStore.userInfo?.realName || '',
      roleInProject: '0', // 默认第一个是负责人
      contribution: ''
    }
  ]
})

// 页面状态
const teachers = ref([])
const message = ref('')
const isSuccess = ref(false)
const loading = ref(false)

// 初始化页面
onMounted(async () => {
  try {
    // 获取教师列表
    const res = await getTeachersList()
    if (res.code === 0) {
      teachers.value = res.data
    } else {
      message.value = '获取教师列表失败: ' + res.message
      isSuccess.value = false
    }
  } catch (err) {
    console.error('初始化失败', err)
    message.value = '页面初始化失败，请刷新重试'
    isSuccess.value = false
  }
})

// 添加成员
const addMember = () => {
  form.value.members.push({
    studentId: '',
    userId: '',
    realName: '',
    roleInProject: '1', // 新增默认为成员
    contribution: ''
  })
}

// 删除成员
const removeMember = (index) => {
  if (form.value.members.length <= 1) {
    message.value = '至少保留一名项目成员'
    isSuccess.value = false
    return
  }
  form.value.members.splice(index, 1)
}

// 搜索学生信息
const searchStudent = async (index) => {
  const studentId = form.value.members[index].studentId
  if (!studentId) return
  
  try {
    const res = await searchStudentByUserId(studentId)
    if (res.code === 0 && res.data) {
      form.value.members[index].userId = res.data.userId
      form.value.members[index].realName = res.data.realName
    } else {
      message.value = '未找到该学生信息'
      isSuccess.value = false
    }
  } catch (err) {
    console.error('搜索学生失败', err)
    message.value = '搜索学生信息失败'
    isSuccess.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  // 基础验证
  if (!form.value.projectName) {
    message.value = '请输入项目名称'
    isSuccess.value = false
    return
  }
  
  if (!form.value.teacherId) {
    message.value = '请选择指导教师'
    isSuccess.value = false
    return
  }
  
  // 验证成员信息
  const leaderCount = form.value.members.filter(m => m.roleInProject === '0').length
  if (leaderCount === 0) {
    message.value = '请至少设置一名负责人'
    isSuccess.value = false
    return
  }
  
  if (leaderCount > 1) {
    message.value = '只能设置一名负责人'
    isSuccess.value = false
    return
  }
  
  for (let i = 0; i < form.value.members.length; i++) {
    const member = form.value.members[i]
    if (!member.studentId || !member.userId) {
      message.value = `第${i+1}位成员信息不完整，请检查学号`
      isSuccess.value = false
      return
    }
  }
  
  // 构建提交数据
  const submitData = {
    projectName: form.value.projectName,
    description: form.value.description,
    teacherId: form.value.teacherId,
    startTime: form.value.startTime,
    endTime: form.value.endTime,
    members: form.value.members.map(m => ({
      userId: m.userId,
      roleInProject: m.roleInProject,
      contribution: m.contribution
    }))
  }
  
  try {
    loading.value = true
    const res = await createProject(submitData)
    if (res.code === 0) {
      message.value = '项目申报成功！'
      isSuccess.value = true
      // 3秒后返回学生中心
      setTimeout(() => {
        router.push('/student')
      }, 3000)
    } else {
      message.value = res.message || '项目申报失败'
      isSuccess.value = false
    }
  } catch (err) {
    console.error('提交项目失败', err)
    message.value = '提交失败，请稍后重试'
    isSuccess.value = false
  } finally {
    loading.value = false
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
.project-apply-container {
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

.apply-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.section-desc {
  color: #666;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.form-item {
  margin-bottom: 1rem;
}

.form-item.inline {
  display: inline-block;
  margin-right: 1rem;
  width: calc(25% - 1rem);
  vertical-align: top;
}

.form-item.contribution {
  width: calc(40% - 1rem);
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-weight: 500;
}

input, select, textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
}

textarea {
  resize: vertical;
}

.required {
  color: #ff4d4f;
}

.members-list {
  margin-bottom: 1rem;
}

.member-item {
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 1rem;
  position: relative;
}

.add-btn {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.remove-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.3rem 0.6rem;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.remove-btn:disabled {
  background-color: #ddd;
  cursor: not-allowed;
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

.submit-btn {
  padding: 0.8rem 1.5rem;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.msg {
  text-align: center;
  margin-top: 1rem;
  padding: 0.8rem;
  border-radius: 4px;
}

.success {
  background-color: #e6f7ed;
  color: #2a9d54;
}

.error {
  background-color: #fde2e2;
  color: #ff4d4f;
}

@media (max-width: 768px) {
  .form-item.inline {
    display: block;
    width: 100%;
    margin-right: 0;
  }
  
  .remove-btn {
    position: static;
    margin-top: 1rem;
  }
}
</style>