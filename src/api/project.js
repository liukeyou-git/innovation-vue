import request from '../utils/request'

// 获取教师列表（供学生选择指导教师）
export const getTeachersList = () => {
  return request.get('/teachers')
}

// 根据学号搜索学生信息
export const searchStudentByUserId = (studentId) => {
  return request.get(`/students/search?studentId=${studentId}`)
}

// 创建项目申报
export const createProject = (data) => {
  return request.post('/projects', data)
}

// 获取学生已申报的项目列表
export const getStudentProjects = () => {
  return request.get('/student/projects')
}

// 获取项目详情
export const getProjectDetail = (projectId) => {
  return request.get(`/projects/${projectId}`)
}

// 教师获取待审核项目列表
export const getTeacherPendingProjects = () => {
  return request.get('/teacher/projects/pending')
}

// 教师获取已审核项目列表
export const getTeacherApprovedProjects = () => {
  return request.get('/teacher/projects/approved')
}

// 教师审核项目
export const reviewProject = (projectId, data) => {
  return request.put(`/teacher/projects/${projectId}/review`, data)
}

// 教师对项目进行结题操作
export const completeProject = (projectId, data) => {
  return request.put(`/teacher/projects/${projectId}/complete`, data)
}

// 获取已结题项目列表
export const getTeacherCompletedProjects = () => {
  return request.get('/teacher/projects/completed')
}

// 获取未录入成绩的已结题项目列表（供教师录入成绩）
export const getUnscoredCompletedProjects = () => {
  return request.get('/teacher/projects/completed/unscored')
}

// 添加成绩相关接口
// 获取项目成绩
export const getProjectAchievement = (projectId) => {
  return request.get(`/achievements/project/${projectId}`)
}

// 录入/更新项目成绩
export const saveProjectAchievement = (data) => {
  return request.post('/teacher/achievements', data,{
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取教师评定的所有成绩
export const getTeacherAchievements = () => {
  return request.get('/teacher/achievements')
}

// src/api/project.js 中添加以下内容
// 获取学生的所有成绩
export const getStudentAchievements = () => {
  return request.get('/student/achievements')
}