// src/api/users.js
import request from '../utils/request'

// 登录
export const userLogin = (data) => {
  return request.post('/user/login', data)
}

// 注册
export const userRegister = (data) => {
  return request.post('/user/register', data)
}

// 退出登录
export const userLogout = () => {
  return request.post('/user/logout') // 调用后端退出接口
}