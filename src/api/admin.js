import request from '../utils/request'

// 批量导入用户
export const batchImportUsers = (userList) => {
  return request.post('/admin/users/batch-import', userList)
}

// 获取用户列表（用于用户管理页面）
export const getUsersList = (params) => {
  return request.get('/admin/users', { params })
}

// 删除用户
export const deleteUser = (userId) => {
  return request.delete(`/admin/users/${userId}`)
}

// 更新用户信息
export const updateUser = (userId, data) => {
  return request.put(`/admin/users/${userId}`, data)
}

// 更新用户状态（禁用/启用）
export const updateUserStatus = (userId, status) => {
  return request.put(`/admin/users/${userId}/status`, { status })
}