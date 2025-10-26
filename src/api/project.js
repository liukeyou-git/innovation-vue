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