/**
 * 头像服务 - 处理用户头像相关功能
 */

// 导入默认头像
import adminAvatar from '@/assets/images/avatars/admin-avatar.svg'
import teacherAvatar from '@/assets/images/avatars/teacher-avatar.svg'
import studentAvatar from '@/assets/images/avatars/student-avatar.svg'
import defaultAvatar from '@/assets/images/avatars/default-avatar.svg'

export const avatarService = {
  /**
   * 根据用户角色获取默认头像
   * @param {string} role - 用户角色 ('admin', 'teacher', 'student')
   * @returns {string} - 头像URL
   */
  getDefaultAvatarByRole(role) {
    switch (role) {
      case 'admin':
        return adminAvatar
      case 'teacher':
        return teacherAvatar
      case 'student':
        return studentAvatar
      default:
        return defaultAvatar
    }
  },

  /**
   * 获取用户头像 - 如果用户没有设置头像，则返回默认头像
   * @param {Object} user - 用户对象
   * @returns {string} - 头像URL
   */
  getUserAvatar(user) {
    if (!user) return defaultAvatar
    
    // 如果用户有自定义头像，则使用自定义头像
    if (user.avatar && user.avatar.trim() !== '') {
      return user.avatar
    }
    
    // 否则返回基于角色的默认头像
    return this.getDefaultAvatarByRole(user.role)
  }
} 