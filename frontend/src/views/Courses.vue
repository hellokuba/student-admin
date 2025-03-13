<template>
  <div class="courses-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课程管理</span>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索课程"
              clearable
              class="search-input"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-button
              v-if="isAdminOrTeacher"
              type="primary"
              @click="handleAddCourse"
            >
              <el-icon><Plus /></el-icon>
              添加课程
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="filteredCourses"
        style="width: 100%"
        border
      >
        <el-table-column prop="code" label="课程代码" min-width="120" />
        <el-table-column prop="name" label="课程名称" min-width="150" />
        <el-table-column prop="credits" label="学分" min-width="80" />
        <el-table-column label="任课教师" min-width="120">
          <template #default="scope">
            {{ scope.row.teacher?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="课程描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleViewCourse(scope.row)"
            >
              查看
            </el-button>
            
            <el-button
              v-if="isAdminOrCourseTeacher(scope.row)"
              type="warning"
              size="small"
              @click="handleEditCourse(scope.row)"
            >
              编辑
            </el-button>
            
            <el-button
              v-if="isAdmin"
              type="danger"
              size="small"
              @click="handleDeleteCourse(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 课程表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑课程' : '添加课程'"
      width="500px"
    >
      <el-form
        ref="courseFormRef"
        :model="courseForm"
        :rules="courseRules"
        label-width="100px"
      >
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="courseForm.name" placeholder="请输入课程名称" />
        </el-form-item>
        
        <el-form-item label="课程代码" prop="code">
          <el-input v-model="courseForm.code" placeholder="请输入课程代码" />
        </el-form-item>
        
        <el-form-item label="学分" prop="credits">
          <el-input-number v-model="courseForm.credits" :min="0" :max="10" :precision="1" />
        </el-form-item>
        
        <el-form-item v-if="isAdmin" label="任课教师" prop="teacherId">
          <el-select v-model="courseForm.teacherId" placeholder="请选择任课教师" filterable>
            <el-option
              v-for="teacher in teachers"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="课程描述" prop="description">
          <el-input
            v-model="courseForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入课程描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmitCourse">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 课程详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="课程详情"
      width="600px"
    >
      <div v-if="selectedCourse" class="course-detail">
        <h2>{{ selectedCourse.name }} ({{ selectedCourse.code }})</h2>
        
        <div class="detail-item">
          <span class="label">学分：</span>
          <span>{{ selectedCourse.credits }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">任课教师：</span>
          <span>{{ selectedCourse.teacher?.name || '-' }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">课程描述：</span>
          <p>{{ selectedCourse.description || '暂无描述' }}</p>
        </div>
        
        <div class="detail-item">
          <span class="label">创建时间：</span>
          <span>{{ formatDate(selectedCourse.createdAt) }}</span>
        </div>
        
        <div class="detail-item">
          <span class="label">更新时间：</span>
          <span>{{ formatDate(selectedCourse.updatedAt) }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { courseService } from '@/services/courseService'
import { userService } from '@/services/userService'

const authStore = useAuthStore()
const loading = ref(false)
const submitLoading = ref(false)

// 用户角色
const isAdmin = computed(() => authStore.isAdmin)
const isTeacher = computed(() => authStore.isTeacher)
const isAdminOrTeacher = computed(() => isAdmin.value || isTeacher.value)

// 课程列表
const courses = ref([])
const searchQuery = ref('')
const filteredCourses = computed(() => {
  if (!searchQuery.value) return courses.value
  
  const query = searchQuery.value.toLowerCase()
  return courses.value.filter(course => 
    course.name.toLowerCase().includes(query) ||
    course.code.toLowerCase().includes(query) ||
    course.description?.toLowerCase().includes(query) ||
    course.teacher?.name.toLowerCase().includes(query)
  )
})

// 教师列表（用于选择任课教师）
const teachers = ref([])

// 课程表单
const dialogVisible = ref(false)
const isEdit = ref(false)
const courseFormRef = ref(null)
const courseForm = reactive({
  name: '',
  code: '',
  credits: 3,
  teacherId: '',
  description: ''
})

// 表单验证规则
const courseRules = {
  name: [
    { required: true, message: '请输入课程名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入课程代码', trigger: 'blur' }
  ],
  credits: [
    { required: true, message: '请输入学分', trigger: 'blur' },
    { type: 'number', message: '学分必须为数字', trigger: 'blur' }
  ],
  teacherId: [
    { required: isAdmin, message: '请选择任课教师', trigger: 'change' }
  ]
}

// 课程详情
const detailDialogVisible = ref(false)
const selectedCourse = ref(null)

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

// 判断是否为课程的任课教师
const isAdminOrCourseTeacher = (course) => {
  if (isAdmin.value) return true
  if (isTeacher.value && authStore.user?.id === course.teacherId) return true
  return false
}

// 获取课程列表
const fetchCourses = async () => {
  loading.value = true
  
  try {
    const response = await courseService.getCourses()
    courses.value = response.data
  } catch (error) {
    ElMessage.error('获取课程列表失败')
    console.error('Failed to fetch courses:', error)
  } finally {
    loading.value = false
  }
}

// 获取教师列表
const fetchTeachers = async () => {
  try {
    const response = await userService.getUsers()
    teachers.value = response.data.filter(user => user.role === 'teacher')
  } catch (error) {
    console.error('Failed to fetch teachers:', error)
  }
}

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

// 处理添加课程
const handleAddCourse = () => {
  isEdit.value = false
  resetCourseForm()
  dialogVisible.value = true
}

// 处理编辑课程
const handleEditCourse = (course) => {
  isEdit.value = true
  resetCourseForm()
  
  // 填充表单数据
  courseForm.name = course.name
  courseForm.code = course.code
  courseForm.credits = course.credits
  courseForm.teacherId = course.teacherId
  courseForm.description = course.description
  
  // 保存当前编辑的课程ID
  courseForm.id = course.id
  
  dialogVisible.value = true
}

// 处理查看课程详情
const handleViewCourse = (course) => {
  selectedCourse.value = course
  detailDialogVisible.value = true
}

// 处理删除课程
const handleDeleteCourse = (course) => {
  ElMessageBox.confirm(
    `确定要删除课程 "${course.name}" 吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await courseService.deleteCourse(course.id)
      ElMessage.success('课程删除成功')
      fetchCourses()
    } catch (error) {
      ElMessage.error('删除课程失败')
      console.error('Failed to delete course:', error)
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 重置课程表单
const resetCourseForm = () => {
  if (courseFormRef.value) {
    courseFormRef.value.resetFields()
  }
  
  courseForm.name = ''
  courseForm.code = ''
  courseForm.credits = 3
  courseForm.teacherId = ''
  courseForm.description = ''
  courseForm.id = undefined
}

// 处理提交课程表单
const handleSubmitCourse = async () => {
  if (!courseFormRef.value) return
  
  await courseFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      
      try {
        if (isEdit.value) {
          // 更新课程
          await courseService.updateCourse(courseForm.id, courseForm)
          ElMessage.success('课程更新成功')
        } else {
          // 创建课程
          await courseService.createCourse(courseForm)
          ElMessage.success('课程创建成功')
        }
        
        dialogVisible.value = false
        fetchCourses()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新课程失败' : '创建课程失败')
        console.error('Failed to save course:', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

onMounted(() => {
  fetchCourses()
  if (isAdmin.value) {
    fetchTeachers()
  }
})
</script>

<style scoped>
.courses-container {
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

.course-detail h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-item .label {
  font-weight: bold;
  color: #606266;
}

.detail-item p {
  margin: 5px 0 0;
  white-space: pre-line;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-input {
    margin-bottom: 10px;
    width: 100%;
  }
}
</style> 