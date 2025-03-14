import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例
const instance = axios.create({
  baseURL: '/',
  timeout: 10000
})

// 请求拦截器
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  response => {
    return response
  },
  error => {
    console.error('Response error:', error)
    
    // 处理401错误
    if (error.response && error.response.status === 401) {
      // 获取Pinia store
      const authStore = useAuthStore()
      
      // 清除用户信息和token
      authStore.logout()
      
      // 显示提示信息
      ElMessage.error('登录已过期，请重新登录')
      
      // 跳转到登录页
      if (router.currentRoute.value.path !== '/auth/login') {
        router.push('/auth/login')
      }
    }
    
    return Promise.reject(error)
  }
)

// 替换全局axios
export default instance 