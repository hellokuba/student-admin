import axios from 'axios'

export const gradeService = {
  // 获取学生的所有成绩
  async getMyGrades() {
    try {
      const response = await axios.get('/api/grades/my-grades')
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  // 获取指定课程的所有学生成绩
  async getCourseGrades(courseId) {
    try {
      const response = await axios.get(`/api/grades/course/${courseId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  // 添加/更新成绩
  async saveGrade(gradeData) {
    try {
      const response = await axios.post('/api/grades', gradeData)
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  // 删除成绩
  async deleteGrade(id) {
    try {
      const response = await axios.delete(`/api/grades/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  }
} 