<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 欢迎卡片 -->
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-card class="welcome-card">
          <template #header>
            <div class="card-header">
              <span>欢迎使用学生管理系统</span>
            </div>
          </template>
          <div class="welcome-content">
            <el-avatar :size="64" :src="userAvatar" />
            <div class="welcome-text">
              <h2>{{ welcomeMessage }}</h2>
              <p>今天是 {{ currentDate }}，祝您使用愉快！</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 统计卡片 -->
      <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
        <el-card class="stat-card">
          <div class="stat-icon">
            <el-icon :size="40"><Reading /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">我的课程</div>
            <div class="stat-value">{{ isLoading ? '加载中...' : courseCount }}</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
        <el-card class="stat-card">
          <div class="stat-icon">
            <el-icon :size="40"><DocumentChecked /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">{{ isStudent ? '我的成绩' : '成绩管理' }}</div>
            <div class="stat-value">{{ isLoading ? '加载中...' : gradeCount }}</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
        <el-card class="stat-card">
          <div class="stat-icon">
            <el-icon :size="40"><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">{{ isStudent ? '我的考勤' : '考勤管理' }}</div>
            <div class="stat-value">{{ isLoading ? '加载中...' : attendanceCount }}</div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 快捷入口 -->
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-card class="shortcut-card">
          <template #header>
            <div class="card-header">
              <span>快捷入口</span>
            </div>
          </template>
          <div class="shortcut-list">
            <el-button type="primary" @click="$router.push('/courses')">
              <el-icon><Reading /></el-icon>
              <span>课程管理</span>
            </el-button>
            
            <el-button type="success" @click="$router.push('/grades')">
              <el-icon><DocumentChecked /></el-icon>
              <span>成绩管理</span>
            </el-button>
            
            <el-button type="warning" @click="$router.push('/attendance')">
              <el-icon><Calendar /></el-icon>
              <span>考勤管理</span>
            </el-button>
            
            <el-button type="info" @click="$router.push('/profile')">
              <el-icon><User /></el-icon>
              <span>个人资料</span>
            </el-button>
            
            <el-button v-if="isAdmin" type="danger" @click="$router.push('/users')">
              <el-icon><UserFilled /></el-icon>
              <span>用户管理</span>
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { courseService } from '@/services/courseService'
import { gradeService } from '@/services/gradeService'
import { attendanceService } from '@/services/attendanceService'
import { avatarService } from '@/services/avatarService'

const authStore = useAuthStore()

// 用户信息
const userAvatar = computed(() => avatarService.getUserAvatar(authStore.user))
const isAdmin = computed(() => authStore.isAdmin)
const isStudent = computed(() => authStore.isStudent)
const isTeacher = computed(() => authStore.isTeacher)

// 欢迎信息
const welcomeMessage = computed(() => {
  const name = authStore.user?.name || '用户'
  const role = authStore.user?.role
  
  if (role === 'admin') {
    return `${name}，管理员`
  } else if (role === 'teacher') {
    return `${name}，教师`
  } else if (role === 'student') {
    return `${name}，同学`
  } else {
    return `${name}，您好`
  }
})

// 当前日期
const currentDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 统计数据
const isLoading = ref(true)
const courseCount = ref(0)
const gradeCount = ref(0)
const attendanceCount = ref(0)

// 获取统计数据
const fetchStats = async () => {
  isLoading.value = true
  
  try {
    // 获取课程数据
    const coursesResponse = await courseService.getCourses()
    courseCount.value = coursesResponse.data.length
    
    // 获取成绩数据
    if (isStudent.value) {
      const gradesResponse = await gradeService.getMyGrades()
      gradeCount.value = gradesResponse.data.length
    } else {
      // 对于教师和管理员，这里只是一个示例值
      gradeCount.value = '管理'
    }
    
    // 获取考勤数据
    if (isStudent.value) {
      const attendanceResponse = await attendanceService.getMyAttendance()
      attendanceCount.value = attendanceResponse.data.length
    } else {
      // 对于教师和管理员，这里只是一个示例值
      attendanceCount.value = '管理'
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px 0;
}

.welcome-card {
  margin-bottom: 20px;
}

.welcome-content {
  display: flex;
  align-items: center;
}

.welcome-text {
  margin-left: 20px;
}

.welcome-text h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #303133;
}

.welcome-text p {
  margin: 0;
  color: #606266;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card {
  height: 120px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  padding: 20px;
  box-sizing: content-box;
}

.stat-icon {
  color: #409EFF;
  margin-right: 20px;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.shortcut-card {
  margin-bottom: 20px;
}

.shortcut-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.shortcut-list .el-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  width: 120px;
}

.shortcut-list .el-button .el-icon {
  margin-right: 5px;
}

@media (max-width: 768px) {
  .shortcut-list .el-button {
    width: 100%;
  }
}
</style> 