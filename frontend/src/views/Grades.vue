<template>
  <div class="grades-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>成绩管理</span>
          <div class="header-actions" v-if="isAdminOrTeacher">
            <el-select
              v-model="selectedCourseId"
              placeholder="选择课程"
              clearable
              @change="handleCourseChange"
              class="course-select"
            >
              <el-option
                v-for="course in courses"
                :key="course.id"
                :label="course.name"
                :value="course.id"
              />
            </el-select>
            
            <el-button
              type="primary"
              :disabled="!selectedCourseId"
              @click="handleAddGrade"
            >
              <el-icon><Plus /></el-icon>
              添加成绩
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 学生视图：我的成绩 -->
      <div v-if="isStudent">
        <el-table
          v-loading="loading"
          :data="grades"
          style="width: 100%"
          border
        >
          <el-table-column label="课程" min-width="150">
            <template #default="scope">
              {{ scope.row.course?.name || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="课程代码" min-width="120">
            <template #default="scope">
              {{ scope.row.course?.code || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="score" label="分数" min-width="80" sortable />
          <el-table-column prop="type" label="类型" min-width="100" />
          <el-table-column prop="comment" label="评语" min-width="200" show-overflow-tooltip />
          <el-table-column label="日期" min-width="150" sortable>
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 教师/管理员视图：课程成绩管理 -->
      <div v-else>
        <div v-if="!selectedCourseId" class="empty-state">
          <el-empty description="请选择一个课程查看成绩" />
        </div>
        
        <div v-else>
          <el-table
            v-loading="loading"
            :data="grades"
            style="width: 100%"
            border
          >
            <el-table-column label="学生" min-width="120">
              <template #default="scope">
                {{ scope.row.student?.name || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="学号" min-width="120">
              <template #default="scope">
                {{ scope.row.student?.username || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="score" label="分数" min-width="80" sortable />
            <el-table-column prop="type" label="类型" min-width="100" />
            <el-table-column prop="comment" label="评语" min-width="200" show-overflow-tooltip />
            <el-table-column label="日期" min-width="150" sortable>
              <template #default="scope">
                {{ formatDate(scope.row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="150">
              <template #default="scope">
                <el-button
                  type="warning"
                  size="small"
                  @click="handleEditGrade(scope.row)"
                >
                  编辑
                </el-button>
                
                <el-button
                  v-if="isAdmin"
                  type="danger"
                  size="small"
                  @click="handleDeleteGrade(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
    
    <!-- 成绩表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑成绩' : '添加成绩'"
      width="500px"
    >
      <el-form
        ref="gradeFormRef"
        :model="gradeForm"
        :rules="gradeRules"
        label-width="100px"
      >
        <el-form-item v-if="!isEdit" label="学生" prop="studentId">
          <el-select v-model="gradeForm.studentId" placeholder="请选择学生" filterable>
            <el-option
              v-for="student in students"
              :key="student.id"
              :label="student.name"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="分数" prop="score">
          <el-input-number v-model="gradeForm.score" :min="0" :max="100" :precision="1" />
        </el-form-item>
        
        <el-form-item label="类型" prop="type">
          <el-select v-model="gradeForm.type" placeholder="请选择成绩类型">
            <el-option label="期中考试" value="期中考试" />
            <el-option label="期末考试" value="期末考试" />
            <el-option label="平时成绩" value="平时成绩" />
            <el-option label="实验" value="实验" />
            <el-option label="作业" value="作业" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="评语" prop="comment">
          <el-input
            v-model="gradeForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入评语"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmitGrade">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { gradeService } from '@/services/gradeService'
import { courseService } from '@/services/courseService'
import { userService } from '@/services/userService'

const authStore = useAuthStore()
const loading = ref(false)
const submitLoading = ref(false)

// 用户角色
const isAdmin = computed(() => authStore.isAdmin)
const isTeacher = computed(() => authStore.isTeacher)
const isStudent = computed(() => authStore.isStudent)
const isAdminOrTeacher = computed(() => isAdmin.value || isTeacher.value)

// 课程和成绩数据
const courses = ref([])
const selectedCourseId = ref('')
const grades = ref([])

// 学生列表（用于选择学生）
const students = ref([])

// 成绩表单
const dialogVisible = ref(false)
const isEdit = ref(false)
const gradeFormRef = ref(null)
const gradeForm = reactive({
  studentId: '',
  courseId: '',
  score: 0,
  type: '',
  comment: ''
})

// 表单验证规则
const gradeRules = {
  studentId: [
    { required: true, message: '请选择学生', trigger: 'change' }
  ],
  score: [
    { required: true, message: '请输入分数', trigger: 'blur' },
    { type: 'number', message: '分数必须为数字', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择成绩类型', trigger: 'change' }
  ]
}

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

// 获取课程列表
const fetchCourses = async () => {
  try {
    const response = await courseService.getCourses()
    courses.value = response.data
  } catch (error) {
    ElMessage.error('获取课程列表失败')
    console.error('Failed to fetch courses:', error)
  }
}

// 获取学生列表
const fetchStudents = async () => {
  try {
    const response = await userService.getUsers()
    students.value = response.data.filter(user => user.role === 'student')
  } catch (error) {
    console.error('Failed to fetch students:', error)
  }
}

// 获取学生成绩
const fetchStudentGrades = async () => {
  loading.value = true
  
  try {
    const response = await gradeService.getMyGrades()
    grades.value = response.data
  } catch (error) {
    ElMessage.error('获取成绩失败')
    console.error('Failed to fetch grades:', error)
  } finally {
    loading.value = false
  }
}

// 获取课程成绩
const fetchCourseGrades = async (courseId) => {
  if (!courseId) {
    grades.value = []
    return
  }
  
  loading.value = true
  
  try {
    const response = await gradeService.getCourseGrades(courseId)
    grades.value = response.data
  } catch (error) {
    ElMessage.error('获取课程成绩失败')
    console.error('Failed to fetch course grades:', error)
  } finally {
    loading.value = false
  }
}

// 处理课程选择变化
const handleCourseChange = (courseId) => {
  if (courseId) {
    fetchCourseGrades(courseId)
  } else {
    grades.value = []
  }
}

// 处理添加成绩
const handleAddGrade = () => {
  if (!selectedCourseId.value) {
    ElMessage.warning('请先选择一个课程')
    return
  }
  
  isEdit.value = false
  resetGradeForm()
  gradeForm.courseId = selectedCourseId.value
  dialogVisible.value = true
}

// 处理编辑成绩
const handleEditGrade = (grade) => {
  isEdit.value = true
  resetGradeForm()
  
  // 填充表单数据
  gradeForm.studentId = grade.studentId
  gradeForm.courseId = grade.courseId
  gradeForm.score = grade.score
  gradeForm.type = grade.type
  gradeForm.comment = grade.comment
  
  // 保存当前编辑的成绩ID
  gradeForm.id = grade.id
  
  dialogVisible.value = true
}

// 处理删除成绩
const handleDeleteGrade = (grade) => {
  ElMessageBox.confirm(
    '确定要删除该成绩记录吗？此操作不可恢复。',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await gradeService.deleteGrade(grade.id)
      ElMessage.success('成绩删除成功')
      fetchCourseGrades(selectedCourseId.value)
    } catch (error) {
      ElMessage.error('删除成绩失败')
      console.error('Failed to delete grade:', error)
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 重置成绩表单
const resetGradeForm = () => {
  if (gradeFormRef.value) {
    gradeFormRef.value.resetFields()
  }
  
  gradeForm.studentId = ''
  gradeForm.courseId = selectedCourseId.value
  gradeForm.score = 0
  gradeForm.type = ''
  gradeForm.comment = ''
  gradeForm.id = undefined
}

// 处理提交成绩表单
const handleSubmitGrade = async () => {
  if (!gradeFormRef.value) return
  
  await gradeFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      
      try {
        await gradeService.saveGrade(gradeForm)
        
        ElMessage.success(isEdit.value ? '成绩更新成功' : '成绩添加成功')
        dialogVisible.value = false
        
        // 刷新成绩列表
        if (isAdminOrTeacher.value) {
          fetchCourseGrades(selectedCourseId.value)
        } else {
          fetchStudentGrades()
        }
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新成绩失败' : '添加成绩失败')
        console.error('Failed to save grade:', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 初始化数据
onMounted(() => {
  if (isStudent.value) {
    fetchStudentGrades()
  } else {
    fetchCourses()
    fetchStudents()
  }
})

// 监听课程选择变化
watch(selectedCourseId, (newVal) => {
  if (newVal && isAdminOrTeacher.value) {
    fetchCourseGrades(newVal)
  }
})
</script>

<style scoped>
.grades-container {
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

.course-select {
  width: 250px;
  margin-right: 15px;
}

.empty-state {
  padding: 40px 0;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .course-select {
    margin-bottom: 10px;
    width: 100%;
  }
}
</style> 