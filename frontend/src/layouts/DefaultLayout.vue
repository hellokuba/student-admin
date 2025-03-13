<template>
  <div class="app-container">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside width="220px" class="aside">
        <div class="logo">
          <h2>学生管理系统</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          :router="true"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          
          <el-menu-item index="/profile">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </el-menu-item>
          
          <el-menu-item index="/courses">
            <el-icon><Reading /></el-icon>
            <span>课程管理</span>
          </el-menu-item>
          
          <el-menu-item index="/grades">
            <el-icon><DocumentChecked /></el-icon>
            <span>成绩管理</span>
          </el-menu-item>
          
          <el-menu-item index="/attendance">
            <el-icon><Calendar /></el-icon>
            <span>考勤管理</span>
          </el-menu-item>
          
          <el-menu-item index="/notifications" class="notification-menu-item">
            <el-icon><Bell /></el-icon>
            <span>消息通知</span>
          </el-menu-item>
          
          <el-menu-item v-if="isAdmin" index="/users">
            <el-icon><UserFilled /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 主要内容区域 -->
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="$route.meta.title">{{ $route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <div class="header-notification">
              <NotificationPopover />
            </div>
            <el-dropdown trigger="click" @command="handleCommand" >
              <div class="user-profile">
                <el-avatar :size="32" :src="userAvatar">{{ userName.charAt(0) }}</el-avatar>
                <span class="username">{{ userName }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown >
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>个人信息
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <el-main class="main">
          <router-view />
        </el-main>
        
        <el-footer class="footer">
          <div>© {{ currentYear }} 学生管理系统 - 版权所有</div>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { avatarService } from '@/services/avatarService'
import NotificationPopover from '@/components/NotificationPopover.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// 计算当前年份
const currentYear = new Date().getFullYear()

// 计算当前激活的菜单项
const activeMenu = computed(() => route.path)

// 用户信息
const userName = computed(() => authStore.user?.name || '用户')
const userAvatar = computed(() => avatarService.getUserAvatar(authStore.user))
const isAdmin = computed(() => authStore.isAdmin)

// 通知相关
const hasUnread = computed(() => notificationStore.hasUnread)
const unreadCount = computed(() => notificationStore.unreadCount)

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'logout') {
    authStore.logout()
    router.push('/auth/login')
  } else if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'notifications') {
    router.push('/notifications')
  }
}

// 组件挂载时初始化认证状态
onMounted(() => {
  authStore.initializeAuth()
  notificationStore.fetchUnreadCount()
})
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.layout-container {
  height: 100%;
}

.aside {
  background-color: #304156;
  color: #fff;
  height: 100%;
  overflow-x: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  border-bottom: 1px solid #1f2d3d;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-notification {
  margin-right: 16px;
  display: flex;
  align-items: center;
}

.notification-menu-item {
  position: relative;
}

.menu-item-with-badge {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.menu-badge {
  margin-left: 8px;
}

/* Add specific styles for the sidebar notification badge */
:deep(.el-menu-item .el-badge__content) {
  height: 16px;
  line-height: 16px;
  padding: 0 4px;
  font-size: 12px;
  border: none;
  transform: scale(0.9);
  right: -5px !important;
}

.dropdown-badge {
  margin-left: 8px;
}

:deep(.dropdown-badge .el-badge__content) {
  height: 16px;
  line-height: 16px;
  padding: 0 4px;
  font-size: 12px;
  border: none;
  transform: scale(0.9);
  position: static !important;
  transform: none !important;
  margin-left: 4px;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
  height: 40px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-profile:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.username {
  margin: 0 8px;
  font-size: 14px;
  color: #303133;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.footer {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  color: #666;
  border-top: 1px solid #e6e6e6;
}
</style>

<style>
/* Global styles for badges */
.el-badge__content.is-fixed {
  position: absolute;
  top: 0;
  right: 10px;
  transform: translateY(-50%) translateX(100%);
}

.notification-popover .el-badge__content {
  height: 16px;
  line-height: 16px;
  padding: 0 4px;
  font-size: 12px;
}

/* Fix for menu badge in dark background */
.el-menu--vertical .el-badge__content.is-fixed {
  background-color: #f56c6c !important;
  color: white !important;
}
</style> 