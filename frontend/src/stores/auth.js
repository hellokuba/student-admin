import { defineStore } from 'pinia'
import axios from 'axios'

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
          
          // 设置 axios 默认请求头
          axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
          
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
        if (error.response?.status === 401) {
          this.logout()
        }
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
    
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },
    
    initializeAuth() {
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        this.fetchUserProfile()
      }
    }
  }
}) 