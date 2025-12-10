<template>
  <div class="score-management-container">
    <header>
      <div class="header-left">
        <!-- 添加返回按钮 -->
        <button class="back-btn" @click="handleBack">
          <span>← 返回</span>
        </button>
        <h1>成绩管理</h1>
      </div>
      <div class="user-info">
        <span>欢迎您，{{ userStore.userInfo?.realName }}（教师）</span>
        <button @click="handleLogout">退出登录</button>
      </div>
    </header>
    <main>
      <!-- Tab切换区域 -->
      <div class="tab-container">
        <div class="tab-item" :class="{ active: activeTab === 'projectScores' }" @click="activeTab = 'projectScores'">
          项目成绩
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'scoreEntry' }" @click="activeTab = 'scoreEntry'">
          成绩录入
        </div>

        <!-- 批量导入 -->
        <button v-if="activeTab === 'projectScores'" class="import-btn" @click="showImportDialog = true">
          批量导入
        </button>

        <!-- 批量导入对话框 -->
        <div v-if="showImportDialog" class="import-dialog-mask">
          <div class="import-dialog">
            <div class="dialog-header">
              <h3>批量导入成绩</h3>
              <button class="close-btn" @click="showImportDialog = false">×</button>
            </div>
            <div class="dialog-body">
              <div class="import-hint">
                <p>请按照模板格式填写成绩数据，支持.xlsx格式文件</p>
                <button class="download-template-btn" @click="downloadTemplate">下载模板</button>
              </div>

              <div class="file-upload-area">
                <label class="file-label">
                  <input type="file" accept=".xlsx" @change="handleFileUpload" ref="fileInput">
                  <div class="upload-placeholder">
                    <span>点击或拖拽文件到此处上传</span>
                  </div>
                </label>

                <div v-if="uploadedFileName" class="file-info">
                  已选择文件: {{ uploadedFileName }}
                  <button class="remove-file" @click="removeFile">移除</button>
                </div>
              </div>

              <div v-if="previewData.length > 0" class="preview-section">
                <h4>数据预览</h4>
                <table class="preview-table">
                  <thead>
                    <tr>
                      <th>行号</th>
                      <th>项目名称</th>
                      <th>成员姓名</th>
                      <th>成员学号</th>
                      <th>分数</th>
                      <th>等级</th>
                      <th>教师评语</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in previewData" :key="index" :class="{ invalid: item.invalid }">
                      <td>{{ item.rowIndex }}</td>
                      <td>{{ item.projectName }}</td>
                      <td>{{ item.memberName }}</td>
                      <td>{{ item.studentId }}</td>
                      <td>{{ item.score }}</td>
                      <td>{{ item.grade }}</td>
                      <td>{{ item.teacherComment || '-' }}</td>
                      <td>
                        <span v-if="item.invalid" class="invalid-msg">{{ item.errorMsg }}</span>
                        <span v-else class="valid-msg">有效</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="dialog-footer">
              <button class="cancel-btn" @click="showImportDialog = false">取消</button>
              <button class="confirm-btn" @click="confirmImport" :disabled="!uploadedFileName || hasInvalidData">
                确认导入
              </button>
            </div>
          </div>
        </div>

        <!-- 只在项目成绩标签显示导出按钮 -->
        <button v-if="activeTab === 'projectScores' && filteredScores.length > 0" class="export-btn"
          @click="exportScores">
          导出成绩
        </button>

        <!-- 搜索框 -->
        <div class="search-container">
          <input type="text" v-model="searchKeyword" placeholder="请输入项目名称搜索" @input="handleSearch">
        </div>
      </div>

      <div v-if="loading" class="loading">加载中...</div>

      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

      <!-- 项目成绩Tab内容 -->
      <div v-if="activeTab === 'projectScores' && !loading && !errorMsg">
        <div v-if="filteredScores.length === 0" class="empty-state">
          暂无成绩数据
        </div>

        <div class="scores-table" v-if="filteredScores.length > 0">
          <table>
            <thead>
              <tr>
                <th>项目名称</th>
                <th>学生姓名</th>
                <th>分数</th>
                <th>等级</th>
                <th>评定时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredScores" :key="item.achievement.achievementId">
                <td>{{ item.project?.projectName }}</td>
                <td>
                  {{item.members?.map(member => member.realName).join(', ') || '无学生'}}
                </td>
                <td>{{ item.achievement?.score }}</td>
                <td>{{ item.achievement?.grade }}</td>
                <td>{{ formatDate(item.achievement?.evaluationTime) }}</td>
                <td>
                  <router-link :to="`/teacher/score-input/${item.project?.projectId}`" class="edit-btn">
                    编辑
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 成绩录入Tab内容 -->
      <div v-if="activeTab === 'scoreEntry' && !loading && !errorMsg">
        <div v-if="filteredProjects.length === 0" class="empty-state">
          暂无已结题项目
        </div>

        <div class="scores-table" v-if="filteredProjects.length > 0">
          <table>
            <thead>
              <tr>
                <th>项目名称</th>
                <th>申报学生</th>
                <th>结题时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="project in filteredProjects" :key="project.projectId">
                <td>{{ project.projectName }}</td>
                <td>
                  {{ project.studentName || '无学生' }}
                </td>
                <td>{{ formatDate(project.completeTime) }}</td>
                <td>
                  <router-link :to="`/teacher/score-input/${project.id}`" class="edit-btn">
                    录入成绩
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store'
import { userLogout } from '../api/user'
import { getTeacherAchievements, getUnscoredCompletedProjects } from '../api/project'
import request from '../utils/request' // 导入封装的axios实例

const userStore = useUserStore()
const router = useRouter()

// 数据
const activeTab = ref('projectScores') // 当前激活的Tab，默认项目成绩
const achievements = ref([]) // 所有项目成绩数据
const completedProjects = ref([]) // 所有已结题项目
const filteredScores = ref([]) // 过滤后的成绩数据
const filteredProjects = ref([]) // 过滤后的项目数据
const searchKeyword = ref('') // 搜索关键词
const loading = ref(false)
const errorMsg = ref('')

// 批量导入相关状态
const showImportDialog = ref(false)
const fileInput = ref(null)
const uploadedFileName = ref('')
const previewData = ref([])
const importLoading = ref(false)

// 检查是否有无效数据
const hasInvalidData = computed(() => {
  return previewData.value.some(item => item.invalid)
})

// 下载模板
const downloadTemplate = async () => {
  try {
    const response = await request({
      url: '/teacher/achievements/template',
      method: 'get',
      responseType: 'blob'
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '成绩导入模板.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('下载模板失败:', err)
    errorMsg.value = '下载模板失败，请重试'
  }
}

// 处理文件上传
const handleFileUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 验证文件类型和大小
  if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
    !file.name.endsWith('.xlsx')) {
    errorMsg.value = '请上传.xlsx格式的文件'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    errorMsg.value = '文件大小不能超过5MB'
    return
  }

  uploadedFileName.value = file.name

  // 解析Excel文件
  try {
    importLoading.value = true
    const XLSX = await import('xlsx')
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // 映射Excel列到前端字段（匹配新模板）
        const parsedData = jsonData.map((row, index) => {
          const errors = [];
          // 验证项目名称（必须存在）
          if (!row['项目名称']) {
            errors.push('项目名称不能为空');
          }
          // 验证成员学号（必须存在）
          if (!row['成员学号']) {
            errors.push('成员学号不能为空');
          }
          // 验证分数（0-100之间）
          if (row['分数'] === undefined || isNaN(Number(row['分数'])) || Number(row['分数']) < 0 || Number(row['分数']) > 100) {
            errors.push('分数必须为0-100之间的数字');
          }
          // 验证等级（必须存在）
          if (!row['等级']) {
            errors.push('等级不能为空');
          }

          return {
            rowIndex: index + 2, // 行号（从2开始，因为表头是第1行）
            projectName: row['项目名称'] || '',
            memberName: row['成员姓名'] || '',
            studentId: row['成员学号'] || '',
            score: row['分数'],
            grade: row['等级'] || '',
            teacherComment: row['教师评语'] || '',
            invalid: errors.length > 0,
            errorMsg: errors.join('; ')
          };
        });

        previewData.value = parsedData;
        importLoading.value = false;
      } catch (err) {
        console.error('解析文件失败:', err)
        errorMsg.value = '解析文件失败，请检查文件格式'
        importLoading.value = false
      }
    }

    reader.readAsArrayBuffer(file)
  } catch (err) {
    console.error('处理文件失败:', err)
    errorMsg.value = '处理文件失败，请重试'
    importLoading.value = false
  }
}

// 移除已上传文件
const removeFile = () => {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  uploadedFileName.value = ''
  previewData.value = []
}

// 确认导入
// 替换原有的confirmImport函数
const confirmImport = async () => {
  if (!confirm('确定要导入这些成绩数据吗？')) return;

  // 1. 获取用户上传的原始文件
  const file = fileInput.value?.files[0];
  if (!file) {
    errorMsg.value = '未找到上传的文件，请重新选择';
    return;
  }

  // 2. 验证是否有无效数据（保持前端预览验证）
  const hasInvalid = previewData.value.some(item => item.invalid);
  if (hasInvalid) {
    errorMsg.value = '存在无效数据，请检查后重新上传';
    return;
  }

  try {
    importLoading.value = true;
    // 3. 创建FormData，用于文件上传（必须用此格式）
    const formData = new FormData();
    formData.append('file', file); // 键名"file"需与后端@RequestParam("file")一致

    // 4. 发送文件上传请求
    const res = await request({
      url: '/teacher/achievements/batch/import', // 与后端接口路径一致
      method: 'post',
      data: formData, // 直接传递FormData
      // 不要手动设置Content-Type，浏览器会自动添加正确的multipart/form-data
    });

    if (res.code === 0) {
      showImportDialog.value = false;
      fetchData(); // 重新加载数据
      removeFile(); // 重置上传状态
    } else {
      errorMsg.value = res.message || '批量导入失败';
    }
  } catch (err) {
    console.error('批量导入失败:', err);
    errorMsg.value = err.response?.data?.message || '网络异常，导入失败';
  } finally {
    importLoading.value = false;
  }
};
// 重新获取数据的函数（整合现有逻辑）
const fetchData = async () => {
  try {
    loading.value = true
    const [achievementsRes, projectsRes] = await Promise.all([
      getTeacherAchievements(),
      getUnscoredCompletedProjects()
    ])

    if (achievementsRes.code === 0) {
      achievements.value = achievementsRes.data
      filteredScores.value = [...achievements.value]
    } else {
      errorMsg.value = achievementsRes.message || '获取成绩列表失败'
    }

    if (projectsRes.code === 0) {
      completedProjects.value = projectsRes.data
      filteredProjects.value = [...completedProjects.value]
    } else {
      errorMsg.value = projectsRes.message || '获取已结题项目失败'
    }
  } catch (err) {
    console.error('数据获取失败', err)
    errorMsg.value = '数据获取失败，请稍后重试'
  } finally {
    loading.value = false
  }
}


// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 导出成绩为CSV文件
// const exportScores = () => {
//   // 准备CSV表头
//   const headers = [
//     '项目名称',
//     '学生姓名',
//     '分数',
//     '等级',
//     '评定时间'
//   ]

//   // 准备CSV数据行（确保所有字段先转为字符串）
//   const rows = filteredScores.value.map(item => [
//     // 每个字段先转为字符串，避免非字符串类型导致的错误
//     String(item.project?.projectName || ''),
//     String(item.members?.map(member => member.realName).join(', ') || '无学生'),
//     String(item.achievement?.score || ''),
//     String(item.achievement?.grade || ''),
//     String(formatDate(item.achievement?.evaluationTime) || '')
//   ])

//   // 组合CSV内容（带BOM头解决中文乱码问题）
//   const csvContent = '\ufeff' + [
//     headers.join(','),
//     ...rows.map(row => row.map(field => {
//       // 先确保field是字符串（再次转换，双重保险）
//       const strField = String(field);
//       // 处理包含逗号或引号的字段
//       if (strField.includes(',') || strField.includes('"')) {
//         return `"${strField.replace(/"/g, '""')}"`;
//       }
//       return strField;
//     }).join(','))
//   ].join('\n')

//   // 创建Blob对象
//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

//   // 创建下载链接
//   const link = document.createElement('a')
//   const url = URL.createObjectURL(blob)
//   link.setAttribute('href', url)

//   // 生成包含当前日期的文件名
//   const date = new Date()
//   const fileName = `成绩列表_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}.csv`
//   link.setAttribute('download', fileName)

//   // 触发下载
//   link.style.visibility = 'hidden'
//   document.body.appendChild(link)
//   link.click()
//   document.body.removeChild(link)
// }
// 调用后端导出接口的前端代码（无需前端拼接文件）
const exportScores = async () => {
  try {
    loading.value = true;
    const response = await request({
      url: '/teacher/achievements/export',
      method: 'get',
      responseType: 'blob',
      timeout: 10000
    });

    if (!response) {
      throw new Error('导出请求失败，未收到响应');
    }

    // 关键：先检查response.data是否存在
    if (!response.data) {
      throw new Error('后端未返回任何文件数据');
    }

    // 检查是否为Blob类型
    if (!(response.data instanceof Blob)) {
      // 尝试解析为文本错误信息
      const errorText = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsText(response.data);
      });
      throw new Error(`导出数据格式错误：${errorText || '未知错误'}`);
    }

    // 检查文件大小（至少应有表头，约1KB以上）
    if (response.data.size < 1024) {
      const content = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsText(response.data);
      });
      throw new Error(`导出文件可能损坏（大小：${response.data.size}B）：${content}`);
    }

    // 解析文件名并下载（原有逻辑）
    let fileName = '成绩列表.xlsx';
    const contentDisposition = response.headers?.['content-disposition'];
    if (contentDisposition) {
      const match = contentDisposition.match(/filename\*?=UTF-8''(.+)/);
      if (match && match[1]) {
        fileName = decodeURIComponent(match[1]);
      }
    }

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

  } catch (err) {
    console.error('导出失败:', err);
    errorMsg.value = err.message || '导出失败，请重试';
  } finally {
    loading.value = false;
  }
};

// 返回上一页功能
const handleBack = () => {
  // 方案1：简单返回上一页
  // router.back()

  // 方案2：带安全检查的返回（推荐）
  if (window.history.length > 1) {
    router.back()
  } else {
    // 如果没有历史记录，跳转到教师主页或登录页
    router.push('/teacher')
  }
}

// 处理搜索
const handleSearch = () => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  // 过滤项目成绩
  filteredScores.value = achievements.value.filter(item =>
    item.project?.projectName?.toLowerCase().includes(keyword)
  )

  // 过滤已结题项目
  filteredProjects.value = completedProjects.value.filter(project =>
    project.projectName?.toLowerCase().includes(keyword)
  )
}

// 页面加载时获取数据
onMounted(async () => {
  try {
    loading.value = true
    // 并行获取两个接口数据
    const [achievementsRes, projectsRes] = await Promise.all([
      getTeacherAchievements(),
      getUnscoredCompletedProjects()
    ])

    if (achievementsRes.code === 0) {
      achievements.value = achievementsRes.data
      filteredScores.value = [...achievements.value]
    } else {
      errorMsg.value = achievementsRes.message || '获取成绩列表失败'
    }

    if (projectsRes.code === 0) {
      completedProjects.value = projectsRes.data
      filteredProjects.value = [...completedProjects.value]
    } else {
      errorMsg.value = projectsRes.message || '获取已结题项目失败'
    }
  } catch (err) {
    console.error('数据获取失败', err)
    errorMsg.value = '数据获取失败，请稍后重试'
  } finally {
    loading.value = false
  }
})

// 监听Tab切换，触发搜索过滤
watch(activeTab, () => {
  handleSearch()
})

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
/* 批量导入按钮 */
.import-btn {
  padding: 0.6rem 1.2rem;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 0.5rem;
}

.import-btn:hover {
  background-color: #27ae60;
}

/* 导入对话框样式 */
.import-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.import-dialog {
  width: 90%;
  max-width: 900px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.dialog-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
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
  max-height: 60vh;
  overflow-y: auto;
}

.import-hint {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.download-template-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.file-upload-area {
  margin-bottom: 1.5rem;
}

.file-label {
  display: block;
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.file-label:hover {
  border-color: #3498db;
}

.file-label input {
  display: none;
}

.upload-placeholder {
  color: #666;
}

.file-info {
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remove-file {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
}

.preview-section {
  margin-top: 1.5rem;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.preview-table th,
.preview-table td {
  padding: 0.5rem;
  border: 1px solid #ddd;
  text-align: left;
  font-size: 0.9rem;
}

.preview-table .invalid {
  background-color: #fef0f0;
}

.invalid-msg {
  color: #e74c3c;
  font-size: 0.8rem;
}

.valid-msg {
  color: #2ecc71;
  font-size: 0.8rem;
}

.dialog-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.dialog-footer .cancel-btn {
  padding: 0.6rem 1.2rem;
  background-color: #999;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.dialog-footer .confirm-btn {
  padding: 0.6rem 1.2rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.dialog-footer .confirm-btn:disabled {
  background-color: #95c5f8;
  cursor: not-allowed;
}

.score-management-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 修改header布局 */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #3498db;
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* 返回按钮样式 */
.back-btn {
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.back-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateX(-2px);
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

/* Tab样式 */
.tab-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.tab-item {
  padding: 0.8rem 1.5rem;
  background-color: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.tab-item.active {
  background-color: #3498db;
  color: white;
}

.tab-item:hover:not(.active) {
  background-color: #e0e0e0;
}

/* 搜索框样式 */
.search-container {
  margin-left: auto;
  flex: 0 0 300px;
}

.search-container input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.scores-table {
  margin-top: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  background-color: #f8f9fa;
  color: #666;
  font-weight: 600;
}

.edit-btn {
  color: #3498db;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: #f0f7ff;
}

.edit-btn:hover {
  background-color: #e0efff;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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

/* 在style部分添加 */
.export-btn {
  padding: 0.8rem 1.5rem;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.export-btn:hover {
  background-color: #27ae60;
}
</style>