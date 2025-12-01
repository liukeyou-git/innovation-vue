<template>
  <div class="import-container">
    <header>
      <h1>用户批量导入</h1>
      <div class="user-info">
        <span>欢迎您，{{ userStore.userInfo?.realName }}（管理员）</span>
        <button @click="handleLogout">退出登录</button>
      </div>
    </header>
    <main>
      <div class="import-box">
        <div class="upload-area" @click="triggerFileSelect" :class="{ dragging: isDragging }">
          <input 
            type="file" 
            ref="fileInput" 
            accept=".csv,.xlsx,.xls" 
            @change="handleFileChange"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
          >
          <div class="upload-hint">
            <icon name="upload" size="48"></icon>
            <p>点击或拖拽文件到此处上传</p>
            <p class="file-format">支持 CSV、Excel 格式</p>
            <p class="template-link">
              <a @click.prevent="downloadTemplate">下载导入模板</a>
            </p>
          </div>
        </div>

        <div v-if="previewData.length > 0" class="preview-section">
          <h3>数据预览</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>用户名</th>
                  <th>密码</th>
                  <th>角色</th>
                  <th>真实姓名</th>
                  <th>学号/工号</th>
                  <th>班级/部门</th>
                  <th>邮箱</th>
                  <th>电话</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in previewData" :key="index" :class="{ invalid: item.invalid }">
                  <td>{{ item.username }}</td>
                  <td>{{ item.password }}</td>
                  <td>{{ item.role === '0' ? '管理员' : item.role === '1' ? '教师' : '学生' }}</td>
                  <td>{{ item.realName }}</td>
                  <td>{{ item.studentId || item.teacherId }}</td>
                  <td>{{ item.className || item.department }}</td>
                  <td>{{ item.email }}</td>
                  <td>{{ item.phone }}</td>
                  <td>
                    <span v-if="item.invalid" class="invalid-msg">{{ item.errorMsg }}</span>
                    <span v-else class="valid-msg">有效</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="action-buttons">
            <button @click="resetImport">重新选择</button>
            <button @click="confirmImport" :disabled="hasInvalidData">确认导入</button>
          </div>
        </div>

        <div v-if="importResult.show" class="result-modal">
          <div class="modal-content">
            <h3>{{ importResult.success ? '导入成功' : '导入失败' }}</h3>
            <p>{{ importResult.message }}</p>
            <div v-if="importResult.success && importResult.details">
              <p>成功导入: {{ importResult.details.successCount }} 条</p>
              <p>失败: {{ importResult.details.failureCount }} 条</p>
            </div>
            <button @click="closeResult">确定</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store'
import { userLogout } from '../../api/user'
import { batchImportUsers } from '../../api/admin' // 后面会实现这个接口
import { parseCSV } from '../../utils/csvParser' // 需要实现CSV解析工具

const userStore = useUserStore()
const router = useRouter()
const fileInput = ref(null)
const isDragging = ref(false)
const previewData = ref([])
const importResult = ref({
  show: false,
  success: false,
  message: '',
  details: null
})

// 触发文件选择
const triggerFileSelect = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    processFile(file)
  }
}

// 处理拖拽文件
const handleFileDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

// 处理文件内容
const processFile = async (file) => {
  if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
    alert('请上传CSV或Excel格式的文件')
    return
  }

  try {
    // 这里简化处理，实际项目中可能需要处理Excel文件
    const text = await readFileAsText(file)
    const data = parseCSV(text)
    validateData(data)
  } catch (err) {
    console.error('文件处理错误:', err)
    alert('文件解析失败: ' + err.message)
  }
}

// 读取文件为文本
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

// 验证数据有效性
const validateData = (data) => {
  const validated = data.map(item => {
    const errors = []
    
    // 基础验证
    if (!item.username) errors.push('用户名为必填项')
    if (!item.password) errors.push('密码为必填项')
    if (!['0', '1', '2'].includes(item.role)) errors.push('角色必须为0(管理员)、1(教师)或2(学生)')
    if (!item.realName) errors.push('真实姓名为必填项')

    // 角色特定验证
    if (item.role === '2') { // 学生
      if (!item.studentId) errors.push('学生必须填写学号')
      if (!item.className) errors.push('学生必须填写班级')
    } else if (item.role === '1') { // 教师
      if (!item.teacherId) errors.push('教师必须填写工号')
      if (!item.department) errors.push('教师必须填写部门')
    }

    return {
      ...item,
      invalid: errors.length > 0,
      errorMsg: errors.join('; ')
    }
  })
  
  previewData.value = validated
}

// 计算属性：是否有无效数据
const hasInvalidData = computed(() => {
  return previewData.value.some(item => item.invalid)
})

// 确认导入
const confirmImport = async () => {
  const validData = previewData.value
    .filter(item => !item.invalid)
    .map(item => ({
      username: item.username,
      password: item.password,
      role: parseInt(item.role),
      realName: item.realName,
      studentId: item.studentId || '',
      className: item.className || '',
      teacherId: item.teacherId || '',
      department: item.department || '',
      email: item.email || '',
      phone: item.phone || ''
    }))

  try {
    const res = await batchImportUsers(validData)
    importResult.value = {
      show: true,
      success: res.code === 0,
      message: res.code === 0 ? '用户批量导入成功' : res.message,
      details: res.data
    }
  } catch (err) {
    importResult.value = {
      show: true,
      success: false,
      message: '导入失败：' + (err.message || '网络错误')
    }
  }
}

// 重置导入
const resetImport = () => {
  fileInput.value.value = ''
  previewData.value = []
}

// 关闭结果弹窗
const closeResult = () => {
  importResult.value = { show: false, success: false, message: '' }
  resetImport()
}

// 下载模板
const downloadTemplate = () => {
  // 这里可以实现模板文件下载逻辑
  const templateContent = `用户名,密码,角色(0-管理员1-教师2-学生),真实姓名,学号(学生),班级(学生),工号(教师),部门(教师),邮箱,电话
zhangsan,123456,2,张三,2023001,软件1班,,,zhangsan@example.com,13800138000
lisi,123456,1,李四,,,T001,计算机学院,lisi@example.com,13900139000
`
  const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', '用户导入模板.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
.import-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

header {
  background-color: #e74c3c;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info button {
  padding: 0.5rem 1rem;
  background-color: white;
  color: #e74c3c;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

main {
  flex: 1;
  padding: 2rem;
}

.import-box {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  padding: 2rem;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area.dragging {
  border-color: #3498db;
  background-color: #f0f8ff;
}

.upload-area input {
  display: none;
}

.file-format {
  color: #666;
  margin: 0.5rem 0;
}

.template-link a {
  color: #3498db;
  cursor: pointer;
}

.preview-section {
  margin-top: 2rem;
}

.table-container {
  overflow-x: auto;
  margin: 1rem 0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 0.8rem;
  text-align: left;
}

th {
  background-color: #f8f9fa;
}

.invalid {
  background-color: #fff5f5;
}

.invalid-msg {
  color: #e74c3c;
}

.valid-msg {
  color: #2ecc71;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.action-buttons button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-buttons button:first-child {
  background-color: #999;
  color: white;
}

.action-buttons button:last-child {
  background-color: #3498db;
  color: white;
}

.action-buttons button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  min-width: 300px;
}

.modal-content button {
  margin-top: 1.5rem;
  padding: 0.8rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>