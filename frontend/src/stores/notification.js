import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationService } from '@/services/notificationService'

export const useNotificationStore = defineStore('notification', () => {
  // 状态
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)

  // 计算属性
  const hasUnread = computed(() => unreadCount.value > 0)
  
  // 按时间排序的通知列表（最新的在前面）
  const sortedNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  })
  
  // 获取未读通知
  const unreadNotifications = computed(() => {
    return notifications.value.filter(notification => !notification.read)
  })

  // 获取通知列表
  const fetchNotifications = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await notificationService.getNotifications()
      
      if (response.success) {
        notifications.value = response.data
        updateUnreadCount()
        lastUpdated.value = new Date()
        return { success: true, data: response.data }
      } else {
        error.value = response.message || '获取通知失败'
        return { success: false, message: error.value }
      }
    } catch (err) {
      error.value = err.message || '获取通知时发生错误'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  // 获取未读通知数量
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount()
      
      if (response.success) {
        unreadCount.value = response.data
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message }
      }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  // 标记通知为已读
  const markAsRead = async (id) => {
    try {
      const response = await notificationService.markAsRead(id)
      
      if (response.success) {
        // 更新本地通知状态
        const notification = notifications.value.find(n => n.id === id)
        if (notification) {
          notification.read = true
          updateUnreadCount()
        }
        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  // 标记所有通知为已读
  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead()
      
      if (response.success) {
        // 更新所有本地通知状态
        notifications.value.forEach(notification => {
          notification.read = true
        })
        unreadCount.value = 0
        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  // 删除通知
  const deleteNotification = async (id) => {
    try {
      const response = await notificationService.deleteNotification(id)
      
      if (response.success) {
        // 从本地状态中移除通知
        const index = notifications.value.findIndex(n => n.id === id)
        if (index !== -1) {
          const wasUnread = !notifications.value[index].read
          notifications.value.splice(index, 1)
          
          // 如果删除的是未读通知，更新未读计数
          if (wasUnread) {
            updateUnreadCount()
          }
        }
        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }
  
  // 添加新通知（用于实时通知）
  const addNotification = (notification) => {
    notifications.value.unshift(notification)
    if (!notification.read) {
      unreadCount.value++
    }
  }
  
  // 更新未读计数
  const updateUnreadCount = () => {
    unreadCount.value = notifications.value.filter(n => !n.read).length
  }
  
  // 重置状态
  const resetState = () => {
    notifications.value = []
    unreadCount.value = 0
    loading.value = false
    error.value = null
    lastUpdated.value = null
  }

  return {
    // 状态
    notifications,
    unreadCount,
    loading,
    error,
    lastUpdated,
    
    // 计算属性
    hasUnread,
    sortedNotifications,
    unreadNotifications,
    
    // 方法
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    updateUnreadCount,
    resetState
  }
}) 