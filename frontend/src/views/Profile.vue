<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="6">
        <el-card class="profile-card">
          <div class="profile-header">
            <el-avatar :size="100" :src="userAvatar" />
            <h2>{{ user?.name || '用户' }}</h2>
            <p>{{ roleText }}</p>
          </div>
          <div class="profile-info">
            <div class="info-item">
              <el-icon><User /></el-icon>
              <span>{{ user?.username || '-' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Message /></el-icon>
              <span>{{ user?.email || '-' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Phone /></el-icon>
              <span>{{ user?.phone || '-' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Timer /></el-icon>
              <span>注册时间：{{ formatDate(user?.createdAt) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="18">
        <el-card class="edit-profile-card">
          <template #header>
            <div class="card-header">
              <span>编辑个人资料</span>
            </div>
          </template>
          
          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-position="top"
            @submit.prevent="handleUpdateProfile"
          >
            <el-form-item label="姓名" prop="name">
              <el-input v-model="profileForm.name" placeholder="请输入姓名" />
            </el-form-item>
            
            <el-form-item label="电子邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入电子邮箱" />
            </el-form-item>
            
            <el-form-item label="电话号码" prop="phone">
              <el-input v-model="profileForm.phone" placeholder="请输入电话号码" />
            </el-form-item>
            
            <el-form-item label="头像URL" prop="avatar">
              <el-input v-model="profileForm.avatar" placeholder="请输入头像URL" />
              <div class="avatar-preview">
                <span class="preview-label">头像预览：</span>
                <el-avatar :size="50" :src="previewAvatar" />
                <el-button type="text" @click="resetToDefaultAvatar">使用默认头像</el-button>
              </div>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                @click="handleUpdateProfile"
              >
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { avatarService } from '@/services/avatarService'

const authStore = useAuthStore()
const loading = ref(false)

// 用户信息
const user = computed(() => authStore.user)
const userAvatar = computed(() => avatarService.getUserAvatar(user.value))

// 角色文本
const roleText = computed(() => {
  const role = user.value?.role
  
  if (role === 'admin') {
    return '管理员'
  } else if (role === 'teacher') {
    return '教师'
  } else if (role === 'student') {
    return '学生'
  } else {
    return '用户'
  }
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 个人资料表单
const profileForm = reactive({
  name: '',
  email: '',
  phone: '',
  avatar: ''
})

// 头像预览
const previewAvatar = computed(() => {
  if (profileForm.avatar && profileForm.avatar.trim() !== '') {
    return profileForm.avatar
  }
  return avatarService.getDefaultAvatarByRole(user.value?.role)
})

// 重置为默认头像
const resetToDefaultAvatar = () => {
  profileForm.avatar = ''
}

// 表单验证规则
const profileRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的电子邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ]
}

// 个人资料表单引用
const profileFormRef = ref(null)

// 初始化表单数据
const initFormData = () => {
  if (user.value) {
    profileForm.name = user.value.name || ''
    profileForm.email = user.value.email || ''
    profileForm.phone = user.value.phone || ''
    profileForm.avatar = user.value.avatar || ''
  }
}

// 处理更新个人资料
const handleUpdateProfile = async () => {
  if (!profileFormRef.value) return
  
  await profileFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        const result = await authStore.updateProfile(profileForm)
        
        if (result.success) {
          ElMessage.success('个人资料更新成功')
        } else {
          ElMessage.error(result.message || '更新个人资料失败')
        }
      } catch (error) {
        ElMessage.error('更新个人资料失败，请稍后再试')
        console.error('Update profile error:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(() => {
  initFormData()
})
</script>

<style scoped>
.profile-container {
  padding: 20px 0;
}

.profile-card {
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}

.profile-header h2 {
  margin: 15px 0 5px;
  font-size: 20px;
  color: #303133;
}

.profile-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.profile-info {
  padding: 20px 0;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: #606266;
}

.info-item .el-icon {
  margin-right: 10px;
  color: #409EFF;
}

.edit-profile-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-preview {
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.preview-label {
  margin-right: 10px;
  color: #606266;
}
</style> 