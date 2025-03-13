<template>
  <div class="register-container">
    <el-form
      ref="registerFormRef"
      :model="registerForm"
      :rules="registerRules"
      label-position="top"
      @submit.prevent="handleRegister"
    >
      <h2 class="form-title">用户注册</h2>
      
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="registerForm.username"
          placeholder="请输入用户名"
          prefix-icon="User"
        />
      </el-form-item>
      
      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="registerForm.name"
          placeholder="请输入姓名"
          prefix-icon="UserFilled"
        />
      </el-form-item>
      
      <el-form-item label="电子邮箱" prop="email">
        <el-input
          v-model="registerForm.email"
          placeholder="请输入电子邮箱"
          prefix-icon="Message"
        />
      </el-form-item>
      
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          placeholder="请输入密码"
          prefix-icon="Lock"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          prefix-icon="Lock"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="角色" prop="role">
        <el-radio-group v-model="registerForm.role">
          <el-radio label="student">学生</el-radio>
          <el-radio label="teacher">教师</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="电话号码" prop="phone">
        <el-input
          v-model="registerForm.phone"
          placeholder="请输入电话号码（选填）"
          prefix-icon="Phone"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          class="register-button"
          @click="handleRegister"
        >
          注册
        </el-button>
      </el-form-item>
      
      <div class="form-footer">
        <span>已有账号？</span>
        <router-link to="/auth/login">立即登录</router-link>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

// 注册表单引用
const registerFormRef = ref(null)

// 注册表单
const registerForm = reactive({
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student',
  phone: ''
})

// 密码验证函数
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (registerForm.confirmPassword !== '') {
      registerFormRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

// 确认密码验证函数
const validateConfirmPass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的电子邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPass, trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ]
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        // 构建注册数据，移除确认密码字段
        const registerData = {
          username: registerForm.username,
          password: registerForm.password,
          name: registerForm.name,
          email: registerForm.email,
          role: registerForm.role,
          phone: registerForm.phone || undefined
        }
        
        const result = await authStore.register(registerData)
        
        if (result.success) {
          ElMessage.success('注册成功，请登录')
          router.push('/auth/login')
        } else {
          ElMessage.error(result.message || '注册失败')
        }
      } catch (error) {
        ElMessage.error('注册失败，请稍后再试')
        console.error('Register error:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-container {
  width: 100%;
}

.form-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #303133;
}

.register-button {
  width: 100%;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.form-footer a {
  color: #409EFF;
  text-decoration: none;
  margin-left: 5px;
}
</style> 