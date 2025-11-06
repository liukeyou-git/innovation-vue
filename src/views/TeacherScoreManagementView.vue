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
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'projectScores' }"
          @click="activeTab = 'projectScores'"
        >
          项目成绩
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'scoreEntry' }"
          @click="activeTab = 'scoreEntry'"
        >
          成绩录入
        </div>
        
        <!-- 只在项目成绩标签显示导出按钮 -->
        <button 
          v-if="activeTab === 'projectScores' && filteredScores.length > 0"
          class="export-btn"
          @click="exportScores"
        >
          导出成绩
        </button>

        <!-- 搜索框 -->
        <div class="search-container">
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="请输入项目名称搜索"
            @input="handleSearch"
          >
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
                  {{ item.members?.map(member => member.realName).join(', ') || '无学生' }}
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
import { ref, onMounted, watch } from 'vue'
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
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

th, td {
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
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
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