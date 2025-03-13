<template>
  <div class="notifications-page">
    <div class="notifications-header">
      <h1>消息通知</h1>
      <div class="notifications-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索通知"
          prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-select v-model="filterType" placeholder="全部类型" clearable class="filter-select">
          <el-option label="全部类型" value="" />
          <el-option label="课程通知" value="course" />
          <el-option label="成绩通知" value="grade" />
          <el-option label="考勤通知" value="attendance" />
          <el-option label="系统通知" value="system" />
        </el-select>
        <el-button type="primary" @click="handleMarkAllAsRead" :disabled="!hasUnread">
          全部标为已读
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="notifications-tabs">
      <el-tab-pane label="全部通知" name="all" />
      <el-tab-pane label="未读通知" name="unread">
        <template #label>
          未读通知
          <el-badge v-if="hasUnread" :value="unreadCount" type="danger" :max="99" />
        </template>
      </el-tab-pane>
    </el-tabs>

    <div v-if="loading" class="notifications-loading">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <div v-else-if="filteredNotifications.length === 0" class="notifications-empty">
      <el-empty description="暂无通知" :image-size="150">
        <template #description>
          <p>{{ getEmptyMessage() }}</p>
        </template>
      </el-empty>
    </div>

    <div v-else class="notifications-list">
      <el-card v-for="notification in filteredNotifications" 
               :key="notification.id" 
               class="notification-card"
               :class="{ 'is-unread': !notification.read }">
        <div class="notification-card-content">
          <div class="notification-icon">
            <el-icon :size="24" :color="getIconColor(notification.type)">
              <component :is="getIconName(notification.type)" />
            </el-icon>
          </div>
          <div class="notification-details" @click="handleNotificationClick(notification)">
            <div class="notification-header-row">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
            <div class="notification-meta">
              <el-tag size="small" :type="getTagType(notification.type)">
                {{ getTypeName(notification.type) }}
              </el-tag>
              <span v-if="!notification.read" class="unread-indicator">未读</span>
            </div>
          </div>
          <div class="notification-actions">
            <el-button
              v-if="!notification.read"
              type="primary"
              plain
              size="small"
              @click.stop="handleMarkAsRead(notification)"
            >
              标为已读
            </el-button>
            <el-button
              type="danger"
              plain
              size="small"
              @click.stop="handleDeleteNotification(notification)"
            >
              删除
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <div v-if="filteredNotifications.length > 0" class="notifications-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        layout="prev, pager, next, total"
        :total="totalNotifications"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { ElMessage, ElMessageBox } from 'element-plus'

const notificationStore = useNotificationStore()

// 状态
const searchQuery = ref('')
const filterType = ref('')
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)

// 计算属性
const loading = computed(() => notificationStore.loading)
const notifications = computed(() => notificationStore.notifications)
const unreadCount = computed(() => notificationStore.unreadCount)
const hasUnread = computed(() => notificationStore.hasUnread)

// 过滤通知
const filteredNotifications = computed(() => {
  let result = [...notifications.value]
  
  // 按标签过滤
  if (activeTab.value === 'unread') {
    result = result.filter(notification => !notification.read)
  }
  
  // 按类型过滤
  if (filterType.value) {
    result = result.filter(notification => notification.type === filterType.value)
  }
  
  // 按搜索词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(notification => 
      notification.title.toLowerCase().includes(query) || 
      notification.message.toLowerCase().includes(query)
    )
  }
  
  // 按时间排序（最新的在前面）
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
  return result
})

// 计算总通知数
const totalNotifications = computed(() => filteredNotifications.value.length)

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

// 获取通知类型标签类型
const getTagType = (type) => {
  switch (type) {
    case 'course':
      return 'info'
    case 'grade':
      return 'success'
    case 'attendance':
      return 'warning'
    case 'system':
      return 'danger'
    default:
      return ''
  }
}

// 获取通知类型名称
const getTypeName = (type) => {
  switch (type) {
    case 'course':
      return '课程通知'
    case 'grade':
      return '成绩通知'
    case 'attendance':
      return '考勤通知'
    case 'system':
      return '系统通知'
    default:
      return '通知'
  }
}

// 获取空状态消息
const getEmptyMessage = () => {
  if (searchQuery.value || filterType.value) {
    return '没有找到符合条件的通知'
  }
  
  if (activeTab.value === 'unread') {
    return '没有未读通知'
  }
  
  return '暂无通知'
}

// 格式化时间
const formatTime = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  
  // 格式化为年月日时分
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 处理页面变化
const handlePageChange = (page) => {
  currentPage.value = page
  window.scrollTo(0, 0)
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
  if (!hasUnread.value) return
  
  try {
    await ElMessageBox.confirm(
      '确定要将所有通知标记为已读吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    const result = await notificationStore.markAllAsRead()
    
    if (result.success) {
      ElMessage.success('已将所有通知标记为已读')
    } else {
      ElMessage.error(result.message || '标记所有通知已读失败')
    }
  } catch {
    // 用户取消操作
  }
}

// 处理删除通知
const handleDeleteNotification = async (notification) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条通知吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const result = await notificationStore.deleteNotification(notification.id)
    
    if (result.success) {
      ElMessage.success('通知已删除')
    } else {
      ElMessage.error(result.message || '删除通知失败')
    }
  } catch {
    // 用户取消操作
  }
}

// 监听标签变化，重置页码
watch(activeTab, () => {
  currentPage.value = 1
})

// 监听筛选条件变化，重置页码
watch([searchQuery, filterType], () => {
  currentPage.value = 1
})

// 组件挂载时获取通知
onMounted(async () => {
  await notificationStore.fetchNotifications()
})
</script>

<style scoped>
.notifications-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.notifications-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.notifications-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  width: 220px;
}

.filter-select {
  width: 140px;
}

.notifications-tabs {
  margin-bottom: 20px;
}

.notifications-loading,
.notifications-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;
}

.notifications-loading .el-icon {
  margin-bottom: 16px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-card {
  transition: all 0.3s;
  border-left: 4px solid transparent;
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.notification-card.is-unread {
  border-left-color: #409EFF;
  background-color: #ecf5ff;
}

.notification-card-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.notification-icon {
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-details {
  flex: 1;
  cursor: pointer;
}

.notification-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notification-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.notification-time {
  font-size: 13px;
  color: #909399;
}

.notification-message {
  margin: 0 0 12px;
  color: #606266;
  line-height: 1.5;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unread-indicator {
  font-size: 12px;
  color: #409EFF;
  font-weight: 500;
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notifications-pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .notifications-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .notification-card-content {
    flex-direction: column;
  }
  
  .notification-actions {
    flex-direction: row;
    margin-top: 12px;
  }
}

:deep(.el-tabs__item .el-badge) {
  margin-left: 6px;
}

:deep(.el-tabs__item .el-badge__content) {
  height: 16px;
  line-height: 16px;
  padding: 0 4px;
  font-size: 12px;
  border: none;
  transform: scale(0.9);
  position: static;
  transform: none;
}
</style> 