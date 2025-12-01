<template>
  <div class="user-management-container">
    <header>
      <h1>用户管理</h1>
      <div class="user-info">
        <span>欢迎您，{{ userStore.userInfo?.realName }}（管理员）</span>
        <button @click="handleLogout">退出登录</button>
      </div>
    </header>
    <main>
      <div class="action-bar">
        <button @click="router.push('/admin/user-import')" class="import-btn">
          批量导入用户
        </button>
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchKeyword" 
            placeholder="搜索用户名/真实姓名"
            @keyup.enter="fetchUsersList"
          >
          <button @click="fetchUsersList">搜索</button>
        </div>
      </div>

      <div class="user-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>真实姓名</th>
              <th>角色</th>
              <th>学号/工号</th>
              <th>班级/部门</th>
              <th>邮箱</th>
              <th>电话</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.userId">
              <td>{{ user.userId }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.realName }}</td>
              <td>{{ user.role === 0 ? '管理员' : user.role === 1 ? '教师' : '学生' }}</td>
              <td>{{ user.studentId || user.teacherId || '-' }}</td>
              <td>{{ user.className || user.department || '-' }}</td>
              <td>{{ user.email || '-' }}</td>
              <td>{{ user.phone || '-' }}</td>
              <td class="actions">
                <button @click="editUser(user)" class="edit-btn">编辑</button>
                <button @click="handleDeleteUser(user.userId)" class="delete-btn">删除</button>
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
import { useUserStore } from '../../store'
import { userLogout } from '../../api/user'
import { getUsersList, deleteUser } from '../../api/admin'

const userStore = useUserStore()
const router = useRouter()
const users = ref([])
const searchKeyword = ref('')

// 页面加载时获取用户列表
onMounted(() => {
  getUsersList()
})

// 获取用户列表
const fetchUsersList = async () => {
  try {
    const res = await getUsersList({ keyword: searchKeyword.value })
    if (res.code === 0) {
      users.value = res.data
    }
  } catch (err) {
    console.error('获取用户列表失败', err)
  }
}

// 编辑用户
const editUser = (user) => {
  // 编辑用户逻辑，可跳转到编辑页面
  console.log('编辑用户', user)
}

// 删除用户
const handleDeleteUser  = async (userId) => {
  if (confirm('确定要删除该用户吗？')) {
    try {
      const res = await deleteUser(userId)
      if (res.code === 0) {
        alert('删除成功')
        getUsersList() // 重新获取列表
      } else {
        alert('删除失败: ' + res.message)
      }
    } catch (err) {
      console.error('删除用户失败', err)
      alert('删除失败')
    }
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
.user-management-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

/* 头部样式 */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #e74c3c;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.95rem;
}

.user-info button {
  padding: 0.5rem 1rem;
  background-color: white;
  color: #e74c3c;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-info button:hover {
  background-color: #f8f9fa;
}

/* 主内容区 */
main {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* 操作栏样式 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem 0;
}

.import-btn {
  padding: 0.6rem 1.2rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.import-btn:hover {
  background-color: #2980b9;
}

.search-box {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.search-box input {
  padding: 0.6rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 280px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #3498db;
}

.search-box button {
  padding: 0.6rem 1.2rem;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-box button:hover {
  background-color: #27ae60;
}

/* 表格样式 */
.user-table {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px; /* 确保表格在小屏幕有滚动空间 */
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f1f1f1;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 10;
}

tbody tr:hover {
  background-color: #f9f9f9;
  transition: background-color 0.1s;
}

/* 操作按钮样式 */
.actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn {
  padding: 0.4rem 0.8rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.2s;
}

.edit-btn:hover {
  background-color: #2980b9;
}

.delete-btn {
  padding: 0.4rem 0.8rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background-color: #c0392b;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .search-box {
    width: 100%;
  }

  .search-box input {
    width: 100%;
  }

  header {
    padding: 1rem;
  }

  main {
    padding: 1rem;
  }
}
</style>