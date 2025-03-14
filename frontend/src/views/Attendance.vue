<template>
  <div class="attendance-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>考勤管理</span>
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
            
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="date-picker"
            />
            
            <el-button
              type="primary"
              :disabled="!selectedCourseId || !selectedDate"
              @click="handleBatchAttendance"
              style="margin-left: 15px;"
            >
              <el-icon><Plus /></el-icon>
              记录考勤
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 学生视图：我的考勤 -->
      <div v-if="isStudent">
        <el-table
          v-loading="loading"
          :data="attendanceRecords"
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
          <el-table-column prop="date" label="日期" min-width="120" sortable />
          <el-table-column label="状态" min-width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        </el-table>
      </div>
      
      <!-- 教师/管理员视图：课程考勤管理 -->
      <div v-else>
        <div v-if="!selectedCourseId" class="empty-state">
          <el-empty description="请选择一个课程查看考勤记录" />
        </div>
        
        <div v-else>
          <el-table
            v-loading="loading"
            :data="filteredAttendanceRecords"
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
            <el-table-column prop="date" label="日期" min-width="120" sortable />
            <el-table-column label="状态" min-width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
            <el-table-column label="操作" fixed="right" width="100">
              <template #default="scope">
                <el-button
                  type="warning"
                  size="small"
                  @click="handleEditAttendance(scope.row)"
                >
                  编辑
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
    
    <!-- 单个考勤编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑考勤记录"
      width="500px"
    >
      <el-form
        ref="attendanceFormRef"
        :model="attendanceForm"
        label-width="100px"
      >
        <el-form-item label="学生">
          <el-input :value="selectedStudentName" disabled />
        </el-form-item>
        
        <el-form-item label="日期">
          <el-input :value="attendanceForm.date" disabled />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="attendanceForm.status">
            <el-radio label="present">出勤</el-radio>
            <el-radio label="absent">缺勤</el-radio>
            <el-radio label="late">迟到</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="attendanceForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleUpdateAttendance">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 批量考勤对话框 -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批量记录考勤"
      width="700px"
    >
      <div class="batch-header">
        <div class="batch-info">
          <div><strong>课程：</strong>{{ selectedCourseName }}</div>
          <div><strong>日期：</strong>{{ selectedDate }}</div>
        </div>
        <div class="batch-actions">
          <el-button size="small" @click="setAllStatus('present')">全部出勤</el-button>
          <el-button size="small" @click="setAllStatus('absent')">全部缺勤</el-button>
        </div>
      </div>
      
      <el-table
        :data="batchStudents"
        style="width: 100%"
        border
        max-height="400px"
      >
        <el-table-column label="学生" min-width="120">
          <template #default="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column label="学号" min-width="120" prop="username" />
        <el-table-column label="状态" min-width="180">
          <template #default="scope">
            <el-radio-group v-model="scope.row.status">
              <el-radio label="present">出勤</el-radio>
              <el-radio label="absent">缺勤</el-radio>
              <el-radio label="late">迟到</el-radio>
            </el-radio-group>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="200">
          <template #default="scope">
            <el-input
              v-model="scope.row.remark"
              placeholder="备注"
              size="small"
            />
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="batchSubmitLoading" @click="handleSubmitBatchAttendance">
            提交
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { attendanceService } from '@/services/attendanceService'
import { courseService } from '@/services/courseService'
import { userService } from '@/services/userService'

const authStore = useAuthStore()
const loading = ref(false)
const submitLoading = ref(false)
const batchSubmitLoading = ref(false)

// 用户角色
const isAdmin = computed(() => authStore.isAdmin)
const isTeacher = computed(() => authStore.isTeacher)
const isStudent = computed(() => authStore.isStudent)
const isAdminOrTeacher = computed(() => isAdmin.value || isTeacher.value)

// 课程和考勤数据
const courses = ref([])
const selectedCourseId = ref('')
const selectedCourseName = computed(() => {
  const course = courses.value.find(c => c.id === selectedCourseId.value)
  return course ? course.name : ''
})
const selectedDate = ref('')
const attendanceRecords = ref([])

// 筛选后的考勤记录（按日期筛选）
const filteredAttendanceRecords = computed(() => {
  if (!selectedDate.value) return attendanceRecords.value
  
  return attendanceRecords.value.filter(record => 
    record.date === selectedDate.value
  )
})

// 单个考勤编辑
const editDialogVisible = ref(false)
const attendanceFormRef = ref(null)
const attendanceForm = reactive({
  id: '',
  studentId: '',
  courseId: '',
  date: '',
  status: '',
  remark: ''
})

// 选中的学生名称
const selectedStudentName = computed(() => {
  const record = attendanceRecords.value.find(r => r.id === attendanceForm.id)
  return record?.student?.name || ''
})

// 批量考勤
const batchDialogVisible = ref(false)
const batchStudents = ref([])

// 获取状态类型（用于标签颜色）
const getStatusType = (status) => {
  switch (status) {
    case 'present':
      return 'success'
    case 'absent':
      return 'danger'
    case 'late':
      return 'warning'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'present':
      return '出勤'
    case 'absent':
      return '缺勤'
    case 'late':
      return '迟到'
    default:
      return '未知'
  }
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

// 获取学生考勤记录
const fetchStudentAttendance = async () => {
  loading.value = true
  
  try {
    const response = await attendanceService.getMyAttendance()
    attendanceRecords.value = response.data
  } catch (error) {
    ElMessage.error('获取考勤记录失败')
    console.error('Failed to fetch attendance:', error)
  } finally {
    loading.value = false
  }
}

// 获取课程考勤记录
const fetchCourseAttendance = async (courseId) => {
  if (!courseId) {
    attendanceRecords.value = []
    return
  }
  
  loading.value = true
  
  try {
    const response = await attendanceService.getCourseAttendance(courseId)
    attendanceRecords.value = response.data
  } catch (error) {
    ElMessage.error('获取课程考勤记录失败')
    console.error('Failed to fetch course attendance:', error)
  } finally {
    loading.value = false
  }
}

// 获取课程学生列表（用于批量考勤）
const fetchCourseStudents = async () => {
  try {
    // 这里假设我们可以从用户列表中筛选出学生
    // 实际应用中可能需要一个专门的API来获取课程的学生
    const response = await userService.getUsers()
    const students = response.data.filter(user => user.role === 'student')
    
    // 初始化批量考勤数据
    batchStudents.value = students.map(student => ({
      id: student.id,
      name: student.name,
      username: student.username,
      status: 'present', // 默认出勤
      remark: ''
    }))
  } catch (error) {
    ElMessage.error('获取学生列表失败')
    console.error('Failed to fetch students:', error)
  }
}

// 处理课程选择变化
const handleCourseChange = (courseId) => {
  if (courseId) {
    fetchCourseAttendance(courseId)
  } else {
    attendanceRecords.value = []
  }
}

// 处理编辑考勤
const handleEditAttendance = (record) => {
  // 填充表单数据
  attendanceForm.id = record.id
  attendanceForm.studentId = record.studentId
  attendanceForm.courseId = record.courseId
  attendanceForm.date = record.date
  attendanceForm.status = record.status
  attendanceForm.remark = record.remark
  
  editDialogVisible.value = true
}

// 处理更新考勤
const handleUpdateAttendance = async () => {
  submitLoading.value = true
  
  try {
    await attendanceService.updateAttendance(attendanceForm.id, {
      status: attendanceForm.status,
      remark: attendanceForm.remark
    })
    
    ElMessage.success('考勤记录更新成功')
    editDialogVisible.value = false
    
    // 刷新考勤列表
    fetchCourseAttendance(selectedCourseId.value)
  } catch (error) {
    ElMessage.error('更新考勤记录失败')
    console.error('Failed to update attendance:', error)
  } finally {
    submitLoading.value = false
  }
}

// 处理批量考勤
const handleBatchAttendance = () => {
  if (!selectedCourseId.value || !selectedDate.value) {
    ElMessage.warning('请选择课程和日期')
    return
  }
  
  fetchCourseStudents()
  batchDialogVisible.value = true
}

// 设置所有学生的考勤状态
const setAllStatus = (status) => {
  batchStudents.value.forEach(student => {
    student.status = status
  })
}

// 处理提交批量考勤
const handleSubmitBatchAttendance = async () => {
  batchSubmitLoading.value = true
  
  try {
    // 构建批量考勤数据
    const attendanceData = batchStudents.value.map(student => ({
      studentId: student.id,
      courseId: selectedCourseId.value,
      date: selectedDate.value,
      status: student.status,
      remark: student.remark
    }))
    
    await attendanceService.recordBatchAttendance(attendanceData)
    
    ElMessage.success('批量考勤记录成功')
    batchDialogVisible.value = false
    
    // 刷新考勤列表
    fetchCourseAttendance(selectedCourseId.value)
  } catch (error) {
    ElMessage.error('批量考勤记录失败')
    console.error('Failed to record batch attendance:', error)
  } finally {
    batchSubmitLoading.value = false
  }
}

// 初始化数据
onMounted(() => {
  if (isStudent.value) {
    fetchStudentAttendance()
  } else {
    fetchCourses()
  }
})

// 监听课程选择变化
watch(selectedCourseId, (newVal) => {
  if (newVal && isAdminOrTeacher.value) {
    fetchCourseAttendance(newVal)
  }
})
</script>

<style scoped>
.attendance-container {
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

.course-select, .date-picker {
  margin-right: 15px;
}

.empty-state {
  padding: 40px 0;
}

.batch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.batch-info {
  line-height: 1.6;
}

.batch-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .course-select, .date-picker {
    margin-bottom: 10px;
    width: 100%;
  }
  
  .batch-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .batch-actions {
    margin-top: 10px;
  }
}
</style> 