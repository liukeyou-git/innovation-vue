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
              <th>状态</th>
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
              <td>
                <span :class="user.status === 1 ? 'status-active' : 'status-disabled'">
                  {{ user.status === 1 ? '启用' : '禁用' }}
                </span>
              </td>
              <td>
              <button 
                @click="handleStatusChange(user.userId, user.status)"
                :class="user.status === 1 ? 'btn-disable' : 'btn-enable'"
              >
                {{ user.status === 1 ? '禁用' : '启用' }}
              </button>
              </td>
              <td class="actions">
                <button @click="editUser(user)" class="edit-btn">编辑</button>
                <button @click="handleDeleteUser(user.userId)" class="delete-btn">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="isEditDialogVisible" class="edit-dialog-mask">
        <div class="edit-dialog">
          <div class="dialog-header">
            <h3>编辑用户</h3>
            <button @click="closeEditDialog" class="close-btn">×</button>
          </div>
          
          <div class="dialog-body">
            <form @submit.prevent="handleUpdateUser">
              <div class="form-group">
                <label>用户名</label>
                <input type="text" v-model="editForm.username" disabled>
                <span class="hint">用户名不可修改</span>
              </div>
              
              <div class="form-group">
                <label>真实姓名 <span class="required">*</span></label>
                <input type="text" v-model="editForm.realName" required>
              </div>
              
              <div class="form-group">
                <label>角色 <span class="required">*</span></label>
                <select v-model="editForm.role" required>
                  <option value="0">管理员</option>
                  <option value="1">教师</option>
                  <option value="2">学生</option>
                </select>
              </div>
              
              <div class="form-group" v-if="editForm.role === '2'">
                <label>学号 <span class="required">*</span></label>
                <input type="text" v-model="editForm.studentId" required>
              </div>
              
              <div class="form-group" v-if="editForm.role === '1'">
                <label>工号 <span class="required">*</span></label>
                <input type="text" v-model="editForm.teacherId" required>
              </div>
              
              <div class="form-group" v-if="editForm.role === '2'">
                <label>班级 <span class="required">*</span></label>
                <input type="text" v-model="editForm.className" required>
              </div>
              
              <div class="form-group" v-if="editForm.role === '1'">
                <label>部门 <span class="required">*</span></label>
                <input type="text" v-model="editForm.department" required>
              </div>
              
              <div class="form-group">
                <label>邮箱</label>
                <input type="email" v-model="editForm.email">
              </div>
              
              <div class="form-group">
                <label>电话</label>
                <input type="text" v-model="editForm.phone">
              </div>
              
              <div class="form-group">
                <label>密码（不填则不修改）</label>
                <input type="password" v-model="editForm.password" placeholder="请输入新密码">
              </div>
              
              <div class="form-actions">
                <button type="button" @click="closeEditDialog" class="cancel-btn">取消</button>
                <button type="submit" class="confirm-btn">确认更新</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store'
import { userLogout } from '../../api/user'
import { getUsersList, deleteUser, updateUser, updateUserStatus } from '../../api/admin'

const userStore = useUserStore()
const router = useRouter()
const users = ref([])
const searchKeyword = ref('')

// 编辑相关变量
const isEditDialogVisible = ref(false)
const currentUserId = ref('')
const editForm = ref({
  username: '',
  realName: '',
  role: '2',
  studentId: '',
  teacherId: '',
  className: '',
  department: '',
  email: '',
  phone: '',
  password: ''
})

// 页面加载时获取用户列表
onMounted(() => {
  getUsersList()
})

// 处理状态变更
const handleStatusChange = async (userId, currentStatus) => {
  const newStatus = currentStatus === 1 ? 0 : 1
  try {
    const res = await updateUserStatus(userId, newStatus)
    if (res.code === 0) {
      // 刷新列表
      fetchUsersList()
    } else {
      alert(res.message || '操作失败')
    }
  } catch (err) {
    console.error('状态更新失败', err)
    alert('操作失败，请重试')
  }
}

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
// 编辑用户 - 打开弹窗并填充数据
const editUser = (user) => {
  currentUserId.value = user.userId
  // 填充表单数据
  editForm.value = {
    username: user.username,
    realName: user.realName,
    role: user.role.toString(),
    studentId: user.studentId || '',
    teacherId: user.teacherId || '',
    className: user.className || '',
    department: user.department || '',
    email: user.email || '',
    phone: user.phone || '',
    password: ''  // 密码默认空，不修改
  }
  isEditDialogVisible.value = true
}

// 关闭编辑弹窗
const closeEditDialog = () => {
  isEditDialogVisible.value = false
  editForm.value.password = ''  // 清空密码
}

// 提交更新用户信息
const handleUpdateUser = async () => {
  try {
    // 构建提交数据（排除空密码）
    const submitData = {
      ...editForm.value,
      role: parseInt(editForm.value.role)
    }
    // 如果密码为空则删除该字段，避免覆盖原有密码
    if (!submitData.password) {
      delete submitData.password
    }
    // 移除不可修改的字段
    delete submitData.username

    const res = await updateUser(currentUserId.value, submitData)
    if (res.code === 0) {
      alert('更新成功')
      closeEditDialog()
      fetchUsersList()  // 刷新列表
    } else {
      alert('更新失败: ' + res.message)
    }
  } catch (err) {
    console.error('更新用户失败', err)
    alert('更新失败，请稍后重试')
  }
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
.status-active {
  color: #2ecc71;
}
.status-disabled {
  color: #e74c3c;
}
.btn-disable {
  background-color: #fef0f0;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}
.btn-enable {
  background-color: #f0f9f0;
  color: #2ecc71;
  border: 1px solid #2ecc71;
}
button {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
}

.edit-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.edit-dialog {
  background-color: white;
  width: 500px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dialog-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f1f1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.dialog-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.required {
  color: #e74c3c;
}

.hint {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.3rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-btn {
  padding: 0.6rem 1.2rem;
  background-color: #999;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-btn {
  padding: 0.6rem 1.2rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

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