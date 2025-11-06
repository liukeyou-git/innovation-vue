import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器：添加Token到请求头
request.interceptors.request.use(
  config => {
    // 从localStorage获取Token（登录时存储）
    const token = localStorage.getItem('token')
    if (token) {
      // 按后端要求的格式添加（通常是Bearer + Token）
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
// 检查响应拦截器，确保不处理blob类型
request.interceptors.response.use(
    response => {
        // 关键：如果是blob类型，直接返回，不解析为JSON
        if (response.config.responseType === 'blob') {
            return response;
        }
        // 其他类型按正常逻辑处理（如JSON）
        return response.data;
    },
    error => {
        return Promise.reject(error);
    }
);

export default request