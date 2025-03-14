import axios from '@/utils/axios'

export const attendanceService = {
  // 获取学生的所有考勤记录
  async getMyAttendance() {
    try {
      const response = await axios.get('/api/attendance/my-attendance')
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  // 获取所有考勤记录
  async getAllAttendance() {
    try {
      const response = await axios.get('/api/attendance')
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  // 获取指定课程的所有学生考勤记录
  async getCourseAttendance(courseId) {
    try {
      const response = await axios.get(`/api/attendance/course/${courseId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  // 记录考勤
  async recordAttendance(attendanceData) {
    try {
      const response = await axios.post('/api/attendance', attendanceData)
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  // 批量记录考勤
  async recordBatchAttendance(attendanceDataArray) {
    try {
      const response = await axios.post('/api/attendance', attendanceDataArray)
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  // 更新考勤记录
  async updateAttendance(id, attendanceData) {
    try {
      const response = await axios.put(`/api/attendance/${id}`, attendanceData)
      return response.data
    } catch (error) {
      throw error
    }
  }
} 