import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// 创建axios实例
const apiService = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiService.interceptors.request.use(
  config => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers['Authorization'] = `Bearer ${authStore.token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
apiService.interceptors.response.use(
  response => {
    // 如果响应成功，直接返回数据
    return response.data
  },
  error => {
    console.error('响应错误:', error)
    
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = '/auth/login'
    }
    
    // 返回格式化的错误信息
    return Promise.reject({
      message: error.response?.data?.message || '服务器错误，请稍后再试',
      status: error.response?.status || 500,
      data: error.response?.data || null
    })
  }
)

export default apiService 