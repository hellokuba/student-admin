import axios from 'axios'

export const courseService = {
  // 获取所有课程
  async getCourses() {
    try {
      const response = await axios.get('/api/courses')
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  // 创建新课程
  async createCourse(courseData) {
    try {
      const response = await axios.post('/api/courses', courseData)
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  // 更新课程
  async updateCourse(id, courseData) {
    try {
      const response = await axios.put(`/api/courses/${id}`, courseData)
      return response.data
    } catch (error) {
      throw error
    }
  },
  
  // 删除课程
  async deleteCourse(id) {
    try {
      const response = await axios.delete(`/api/courses/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  }
} 