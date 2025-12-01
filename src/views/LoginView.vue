<template>
  <div class="login-container">
    <div class="login-box">
      <h2>创新创业成绩管理系统</h2>
      <form @submit.prevent="handleLogin">
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
        <button type="submit" class="login-btn">登录</button>
        <div class="register-link">
          还没有账号？<router-link to="/register">立即注册</router-link>
        </div>
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store'
import { userLogin } from '../api/user'

const form = ref({
  username: '',
  password: ''
})
const errorMsg = ref('')
const router = useRouter()
const userStore = useUserStore()

const handleLogin = async () => {
  try {
    const res = await userLogin({
      username: form.value.username,
      password: form.value.password
    })
    
    if (res.code === 0) {
      // 检查账号状态
      if (res.data.status === 0) {
        errorMsg.value = '账号已被禁用，请联系管理员'
        return
      }
      
      // 现有登录成功逻辑
      localStorage.setItem('token', res.data.token);
      userStore.setUserInfo(res.data);
      
      // 角色跳转
      const role = res.data.role
      switch(role) {
        case 0:
          router.push('/admin') 
          break
        case 1:
          router.push('/teacher') 
          break
        case 2:
          router.push('/student') 
          break
      }
    } else {
      errorMsg.value = res.message
    }
  } catch (err) {
    errorMsg.value = '登录失败，请稍后重试'
    console.error(err)
  }
}
</script>


<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  width: 350px;
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

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.login-btn {
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

.login-btn:hover {
  background-color: #359e75;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.register-link a {
  color: #42b983;
  text-decoration: none;
}

.error-msg {
  color: #ff4d4f;
  text-align: center;
  margin-top: 1rem;
}
</style>