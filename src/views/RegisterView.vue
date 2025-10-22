<template>
  <div class="register-container">
    <div class="register-box">
      <h2>用户注册</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-item">
          <label>用户名</label>
          <input 
            type="text" 
            v-model="form.username" 
            placeholder="请输入用户名" 
            required
          >
        </div>
        <div class="form-item">
          <label>密码</label>
          <input 
            type="password" 
            v-model="form.password" 
            placeholder="请输入密码" 
            required
          >
        </div>
        <div class="form-item">
          <label>真实姓名</label>
          <input 
            type="text" 
            v-model="form.realName" 
            placeholder="请输入真实姓名" 
            required
          >
        </div>
        <div class="form-item">
          <label>角色</label>
          <select v-model="form.role" @change="handleRoleChange" required>
            <option value="">请选择角色</option>
            <option value="0">管理员</option>
            <option value="1">教师</option>
            <option value="2">学生</option>
          </select>
        </div>

        <!-- 学生特有字段 -->
        <div v-if="form.role === 2" class="form-item">
          <label>学号</label>
          <input 
            type="text" 
            v-model="form.studentId" 
            placeholder="请输入学号"
          >
        </div>
        <div v-if="form.role === 2" class="form-item">
          <label>班级</label>
          <input 
            type="text" 
            v-model="form.className" 
            placeholder="请输入班级"
          >
        </div>

        <!-- 教师特有字段 -->
        <div v-if="form.role === 1" class="form-item">
          <label>工号</label>
          <input 
            type="text" 
            v-model="form.teacherId" 
            placeholder="请输入工号"
          >
        </div>
        <div v-if="form.role === 1" class="form-item">
          <label>院系</label>
          <input 
            type="text" 
            v-model="form.department" 
            placeholder="请输入院系"
          >
        </div>

        <div class="form-item">
          <label>邮箱（可选）</label>
          <input 
            type="email" 
            v-model="form.email" 
            placeholder="请输入邮箱"
          >
        </div>
        <div class="form-item">
          <label>手机号（可选）</label>
          <input 
            type="tel" 
            v-model="form.phone" 
            placeholder="请输入手机号"
          >
        </div>

        <button type="submit" class="register-btn">注册</button>
        <div class="login-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </div>
        <div v-if="message" class="msg" :class="{ success: isSuccess, error: !isSuccess }">
          {{ message }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userRegister } from '../api/user'

const form = ref({
  username: '',
  password: '',
  role: '',
  realName: '',
  studentId: '',
  className: '',
  teacherId: '',
  department: '',
  email: '',
  phone: ''
})
const message = ref('')
const isSuccess = ref(false)
const router = useRouter()

const handleRoleChange = () => {
  // 切换角色时清空其他角色的字段
  if (form.value.role !== 2) {
    form.value.studentId = ''
    form.value.className = ''
  }
  if (form.value.role !== 1) {
    form.value.teacherId = ''
    form.value.department = ''
  }
}

const handleRegister = async () => {
  try {
    // 基础验证
    if (!form.value.username || !form.value.password || !form.value.role || !form.value.realName) {
      message.value = '带*的字段为必填项'
      isSuccess.value = false
      return
    }

    const res = await userRegister(form.value)
    if (res.code === 0) {
      message.value = '注册成功，即将跳转到登录页'
      isSuccess.value = true
      // 2秒后跳转到登录页
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      message.value = res.message
      isSuccess.value = false
    }
  } catch (err) {
    message.value = '注册失败，请稍后重试'
    isSuccess.value = false
    console.error(err)
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem 0;
  background-color: #f5f5f5;
}

.register-box {
  width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-item {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

input, select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.register-btn {
  width: 100%;
  padding: 0.8rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

.register-btn:hover {
  background-color: #359e75;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.login-link a {
  color: #42b983;
  text-decoration: none;
}

.msg {
  text-align: center;
  margin-top: 1rem;
  padding: 0.5rem;
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
</style>