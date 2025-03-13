<template>
  <el-popover
    placement="bottom"
    :width="320"
    trigger="click"
    popper-class="notification-popover"
  >
    <template #reference>
      <div class="notification-icon" @click="handleIconClick">
        <el-badge :value="unreadCount" :hidden="!hasUnread" :max="99" type="danger" class="header-badge">
          <el-icon :size="20"><Bell /></el-icon>
        </el-badge>
      </div>
    </template>
    
    <div class="notification-header">
      <h3>消息通知</h3>
      <el-button v-if="hasUnread" type="text" @click="handleMarkAllAsRead">
        全部已读
      </el-button>
    </div>
    
    <el-divider style="margin: 8px 0" />
    
    <div v-if="loading" class="notification-loading">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    
    <div v-else-if="sortedNotifications.length === 0" class="notification-empty">
      <el-empty description="暂无通知" :image-size="80" />
    </div>
    
    <el-scrollbar max-height="300px" v-else>
      <div v-for="notification in sortedNotifications" :key="notification.id" class="notification-item" :class="{ 'is-unread': !notification.read }">
        <div class="notification-content" @click="handleNotificationClick(notification)">
          <div class="notification-icon-wrapper">
            <el-icon :size="16" :color="getIconColor(notification.type)">
              <component :is="getIconName(notification.type)" />
            </el-icon>
          </div>
          <div class="notification-body">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
          </div>
        </div>
        <div class="notification-actions">
          <el-button
            type="text"
            size="small"
            @click.stop="handleMarkAsRead(notification)"
            v-if="!notification.read"
          >
            <el-icon><Check /></el-icon>
          </el-button>
          <el-button
            type="text"
            size="small"
            @click.stop="handleDeleteNotification(notification)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </el-scrollbar>
    
    <div class="notification-footer">
      <el-button type="primary" text @click="$router.push('/notifications')">
        查看全部
      </el-button>
    </div>
  </el-popover>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { ElMessage } from 'element-plus'

const notificationStore = useNotificationStore()

// 计算属性
const loading = computed(() => notificationStore.loading)
const unreadCount = computed(() => notificationStore.unreadCount)
const hasUnread = computed(() => notificationStore.hasUnread)
const sortedNotifications = computed(() => notificationStore.sortedNotifications)

// 获取通知图标
const getIconName = (type) => {
  switch (type) {
    case 'course':
      return 'Reading'
    case 'grade':
      return 'DocumentChecked'
    case 'attendance':
      return 'Calendar'
    case 'system':
      return 'InfoFilled'
    default:
      return 'Bell'
  }
}

// 获取通知图标颜色
const getIconColor = (type) => {
  switch (type) {
    case 'course':
      return '#2196F3'
    case 'grade':
      return '#4CAF50'
    case 'attendance':
      return '#FF9800'
    case 'system':
      return '#F44336'
    default:
      return '#909399'
  }
}

// 格式化时间
const formatTime = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  // 一天内显示相对时间
  if (diff < 24 * 60 * 60 * 1000) {
    // 一小时内
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000))
      return `${minutes} 分钟前`
    }
    
    // 一天内
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours} 小时前`
  }
  
  // 一周内显示星期几
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[date.getDay()]
  }
  
  // 其他情况显示日期
  return date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric'
  })
}

// 处理点击通知图标
const handleIconClick = async () => {
  if (sortedNotifications.value.length === 0) {
    await notificationStore.fetchNotifications()
  }
}

// 处理点击通知
const handleNotificationClick = async (notification) => {
  // 如果未读，则标记为已读
  if (!notification.read) {
    await notificationStore.markAsRead(notification.id)
  }
  
  // 根据通知类型和链接进行跳转
  if (notification.link) {
    window.location.href = notification.link
  }
}

// 处理标记为已读
const handleMarkAsRead = async (notification) => {
  if (!notification.read) {
    const result = await notificationStore.markAsRead(notification.id)
    
    if (!result.success) {
      ElMessage.error(result.message || '标记通知已读失败')
    }
  }
}

// 处理标记所有为已读
const handleMarkAllAsRead = async () => {
  const result = await notificationStore.markAllAsRead()
  
  if (result.success) {
    ElMessage.success('已将所有通知标记为已读')
  } else {
    ElMessage.error(result.message || '标记所有通知已读失败')
  }
}

// 处理删除通知
const handleDeleteNotification = async (notification) => {
  const result = await notificationStore.deleteNotification(notification.id)
  
  if (result.success) {
    ElMessage.success('通知已删除')
  } else {
    ElMessage.error(result.message || '删除通知失败')
  }
}

// 组件挂载时获取未读通知数量
onMounted(async () => {
  await notificationStore.fetchUnreadCount()
})
</script>

<style scoped>
.notification-icon {
  cursor: pointer;
  padding: 0 8px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
  border-radius: 4px;
}

.notification-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

:deep(.header-badge) {
  display: flex;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px 4px;
}

.notification-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.notification-loading,
.notification-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #909399;
}

.notification-loading .el-icon {
  margin-bottom: 10px;
}

.notification-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item.is-unread {
  background-color: #ecf5ff;
}

.notification-item.is-unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 70%;
  background-color: #409EFF;
  border-radius: 0 2px 2px 0;
}

.notification-content {
  flex: 1;
  display: flex;
  cursor: pointer;
  position: relative;
}

.notification-icon-wrapper {
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
  margin-right: 10px;
}

.notification-body {
  flex: 1;
}

.notification-title {
  font-weight: 500;
  margin-bottom: 5px;
  color: #303133;
}

.notification-message {
  color: #606266;
  font-size: 13px;
  margin-bottom: 5px;
  word-break: break-word;
  line-height: 1.4;
}

.notification-time {
  color: #909399;
  font-size: 12px;
}

.notification-actions {
  display: flex;
  align-items: center;
}

.notification-actions .el-button {
  padding: 4px;
}

.notification-actions .el-button:hover {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.notification-footer {
  display: flex;
  justify-content: center;
  padding: 10px 0;
  border-top: 1px solid #f0f0f0;
}
</style>

<style>
.notification-popover {
  padding: 0 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border-radius: 8px !important;
}

.notification-popover .el-popover__title {
  margin: 0;
  padding: 15px;
}

.notification-popover .el-scrollbar__wrap {
  overflow-x: hidden;
}
</style> 