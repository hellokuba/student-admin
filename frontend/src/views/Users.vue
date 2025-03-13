<template>
  <div class="users-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索用户"
              clearable
              class="search-input"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-select
              v-model="roleFilter"
              placeholder="角色筛选"
              clearable
              @change="handleRoleFilterChange"
              class="role-select"
            >
              <el-option label="管理员" value="admin" />
              <el-option label="教师" value="teacher" />
              <el-option label="学生" value="student" />
            </el-select>
          </div>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="filteredUsers"
        style="width: 100%"
        border
      >
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="email" label="电子邮箱" min-width="180" />
        <el-table-column prop="phone" label="电话号码" min-width="120" />
        <el-table-column label="角色" min-width="100">
          <template #default="scope">
            <el-tag :type="getRoleType(scope.row.role)">
              {{ getRoleText(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="true"
              :inactive-value="false"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="注册时间" min-width="150" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleViewUser(scope.row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户详情"
      width="600px"
    >
      <div v-if="selectedUser" class="user-detail">
        <div class="user-header">
          <el-avatar :size="80" :src="getUserAvatar(selectedUser)" />
          <h2>{{ selectedUser.name }}</h2>
          <el-tag :type="getRoleType(selectedUser.role)">
            {{ getRoleText(selectedUser.role) }}
          </el-tag>
        </div>
        
        <div class="detail-item">
          <span class="label">用户名：</span>
          <span>{{ selectedUser.username }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">电子邮箱：</span>
          <span>{{ selectedUser.email }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">电话号码：</span>
          <span>{{ selectedUser.phone || '未设置' }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">账户状态：</span>
          <el-tag :type="selectedUser.status ? 'success' : 'danger'">
            {{ selectedUser.status ? '正常' : '禁用' }}
          </el-tag>
        </div>
        
        <div class="detail-item">
          <span class="label">注册时间：</span>
          <span>{{ formatDate(selectedUser.createdAt) }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">最后更新：</span>
          <span>{{ formatDate(selectedUser.updatedAt) }}</span>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button
            type="primary"
            @click="handleToggleUserStatus"
          >
            {{ selectedUser?.status ? '禁用账户' : '启用账户' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userService } from '@/services/userService'
import { avatarService } from '@/services/avatarService'

const loading = ref(false)

// 用户列表
const users = ref([])
const searchQuery = ref('')
const roleFilter = ref('')

// 筛选后的用户列表
const filteredUsers = computed(() => {
  let result = users.value
  
  // 角色筛选
  if (roleFilter.value) {
    result = result.filter(user => user.role === roleFilter.value)
  }
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone && user.phone.includes(query))
    )
  }
  
  return result
})

// 用户详情
const detailDialogVisible = ref(false)
const selectedUser = ref(null)

// 获取角色类型（用于标签颜色）
const getRoleType = (role) => {
  switch (role) {
    case 'admin':
      return 'danger'
    case 'teacher':
      return 'warning'
    case 'student':
      return 'success'
    default:
      return 'info'
  }
}

// 获取角色文本
const getRoleText = (role) => {
  switch (role) {
    case 'admin':
      return '管理员'
    case 'teacher':
      return '教师'
    case 'student':
      return '学生'
    default:
      return '未知'
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  
  try {
    const response = await userService.getUsers()
    users.value = response.data
  } catch (error) {
    ElMessage.error('获取用户列表失败')
    console.error('Failed to fetch users:', error)
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

// 处理角色筛选变化
const handleRoleFilterChange = () => {
  // 筛选逻辑已通过计算属性实现
}

// 处理查看用户详情
const handleViewUser = (user) => {
  selectedUser.value = { ...user }
  detailDialogVisible.value = true
}

// 处理用户状态变更
const handleStatusChange = (user) => {
  // 这里应该调用API更新用户状态
  // 由于API文档中没有提供此接口，这里只是模拟
  ElMessage.success(`用户 ${user.name} 状态已${user.status ? '启用' : '禁用'}`)
}

// 处理切换用户状态
const handleToggleUserStatus = () => {
  if (!selectedUser.value) return
  
  const action = selectedUser.value.status ? '禁用' : '启用'
  
  ElMessageBox.confirm(
    `确定要${action}用户 "${selectedUser.value.name}" 的账户吗？`,
    `${action}确认`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API更新用户状态
    // 由于API文档中没有提供此接口，这里只是模拟
    selectedUser.value.status = !selectedUser.value.status
    
    // 更新列表中对应用户的状态
    const userIndex = users.value.findIndex(u => u.id === selectedUser.value.id)
    if (userIndex !== -1) {
      users.value[userIndex].status = selectedUser.value.status
    }
    
    ElMessage.success(`用户账户已${action}`)
  }).catch(() => {
    // 用户取消操作
  })
}

// 获取用户头像
const getUserAvatar = (user) => {
  return avatarService.getUserAvatar(user)
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-container {
  padding: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.search-input {
  width: 250px;
  margin-right: 15px;
}

.role-select {
  width: 150px;
}

.user-detail {
  padding: 20px 0;
}

.user-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.user-header h2 {
  margin: 15px 0 10px;
  font-size: 20px;
  color: #303133;
}

.detail-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.detail-item .label {
  font-weight: bold;
  color: #606266;
  width: 100px;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-input, .role-select {
    margin-bottom: 10px;
    width: 100%;
  }
}
</style> 