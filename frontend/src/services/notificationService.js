import axios from 'axios'
import { mockNotificationService } from './mockNotificationService'

// 判断是否使用模拟数据（开发环境使用模拟数据，生产环境使用真实API）
const useMockData = process.env.NODE_ENV === 'development'

export const notificationService = {
  /**
   * 获取用户的所有通知
   * @returns {Promise} 包含通知数据的Promise
   */
  async getNotifications() {
    if (useMockData) {
      return mockNotificationService.getNotifications()
    }
    
    try {
      const response = await axios.get('/api/notifications')
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  /**
   * 获取用户的未读通知数量
   * @returns {Promise} 包含未读通知数量的Promise
   */
  async getUnreadCount() {
    if (useMockData) {
      return mockNotificationService.getUnreadCount()
    }
    
    try {
      const response = await axios.get('/api/notifications/unread-count')
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  /**
   * 将通知标记为已读
   * @param {string} id - 通知ID
   * @returns {Promise} 操作结果的Promise
   */
  async markAsRead(id) {
    if (useMockData) {
      return mockNotificationService.markAsRead(id)
    }
    
    try {
      const response = await axios.put(`/api/notifications/${id}/read`)
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  /**
   * 将所有通知标记为已读
   * @returns {Promise} 操作结果的Promise
   */
  async markAllAsRead() {
    if (useMockData) {
      return mockNotificationService.markAllAsRead()
    }
    
    try {
      const response = await axios.put('/api/notifications/read-all')
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  /**
   * 删除通知
   * @param {string} id - 通知ID
   * @returns {Promise} 操作结果的Promise
   */
  async deleteNotification(id) {
    if (useMockData) {
      return mockNotificationService.deleteNotification(id)
    }
    
    try {
      const response = await axios.delete(`/api/notifications/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  }
} 