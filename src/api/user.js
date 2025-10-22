import request from '../utils/request'

export const userLogin = (data) => {
  return request.post('/user/login', data)
}

export const userRegister = (data) => {
  return request.post('/user/register', data)
}