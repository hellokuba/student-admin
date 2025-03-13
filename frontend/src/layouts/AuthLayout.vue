<template>
  <div class="auth-container">
    <div class="auth-content">
      <div class="auth-header">
        <h1>学生管理系统</h1>
      </div>
      <div class="auth-form">
        <router-view />
      </div>
      <div class="auth-footer">
        <p>© {{ currentYear }} 学生管理系统 - 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// 计算当前年份
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.auth-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: url('@/assets/images/auth-bg.jpg');
  background-size: cover;
  background-position: center;
}

.auth-content {
  width: 400px;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  font-size: 24px;
  color: #303133;
  margin: 0;
}

.auth-form {
  margin-bottom: 30px;
}

.auth-footer {
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style> 