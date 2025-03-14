import axios from '@/utils/axios'

export const userService = {
  // 获取所有用户
  async getUsers() {
    try {
      const response = await axios.get('/api/users')
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  // 获取用户个人资料
  async getUserProfile() {
    try {
      const response = await axios.get('/api/users/profile')
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  // 更新用户个人资料
  async updateUserProfile(profileData) {
    try {
      const response = await axios.put('/api/users/profile', profileData)
      return response.data
    } catch (error) {
      throw error
    }
  }
} 