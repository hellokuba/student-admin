import { defineStore } from 'pinia'
import axios from '@/utils/axios'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isTeacher: (state) => state.user?.role === 'teacher',
    isStudent: (state) => state.user?.role === 'student'
  },
  
  actions: {
    async login(username, password) {
      try {
        const response = await axios.post('/api/auth/login', { username, password })
        
        if (response.data.success) {
          this.token = response.data.data.token
          this.user = response.data.data.user
          
          localStorage.setItem('token', this.token)
          
          return { success: true }
        }
        
        return { success: false, message: '登录失败' }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.error?.message || '登录失败，请稍后再试' 
        }
      }
    },
    
    async register(userData) {
      try {
        const response = await axios.post('/api/auth/register', userData)
        
        if (response.data.success) {
          return { success: true }
        }
        
        return { success: false, message: '注册失败' }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.error?.message || '注册失败，请稍后再试' 
        }
      }
    },
    
    async fetchUserProfile() {
      try {
        const response = await axios.get('/api/users/profile')
        
        if (response.data.success) {
          this.user = response.data.data
          return { success: true }
        }
        
        return { success: false, message: '获取用户信息失败' }
      } catch (error) {
        // 401错误已在axios拦截器中处理
        return { 
          success: false, 
          message: error.response?.data?.error?.message || '获取用户信息失败' 
        }
      }
    },
    
    async updateProfile(profileData) {
      try {
        const response = await axios.put('/api/users/profile', profileData)
        
        if (response.data.success) {
          this.user = response.data.data
          return { success: true }
        }
        
        return { success: false, message: '更新个人资料失败' }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.error?.message || '更新个人资料失败' 
        }
      }
    },
    
    logout(redirectToLogin = false) {
      // 清除状态
      this.user = null
      this.token = null
      
      // 清除本地存储
      localStorage.removeItem('token')
      
      // 如果需要重定向到登录页
      if (redirectToLogin && router.currentRoute.value.path !== '/auth/login') {
        router.push('/auth/login')
      }
    },
    
    initializeAuth() {
      if (this.token) {
        this.fetchUserProfile().catch(() => {
          // 如果获取用户信息失败，清除token
          this.logout()
        })
      }
    }
  }
}) 