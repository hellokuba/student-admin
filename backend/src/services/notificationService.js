const Notification = require('../models/notification');

/**
 * 通知服务
 * 提供创建不同类型通知的方法
 */
const notificationService = {
  /**
   * 创建系统通知
   * @param {string} userId - 用户ID
   * @param {string} title - 通知标题
   * @param {string} message - 通知内容
   * @returns {Promise<Object>} 创建的通知对象
   */
  async createSystemNotification(userId, title, message) {
    return await Notification.create({
      userId,
      title,
      message,
      type: 'system'
    });
  },

  /**
   * 创建课程相关通知
   * @param {string} userId - 用户ID
   * @param {string} title - 通知标题
   * @param {string} message - 通知内容
   * @returns {Promise<Object>} 创建的通知对象
   */
  async createCourseNotification(userId, title, message) {
    return await Notification.create({
      userId,
      title,
      message,
      type: 'course'
    });
  },

  /**
   * 创建选课相关通知
   * @param {string} userId - 用户ID
   * @param {string} title - 通知标题
   * @param {string} message - 通知内容
   * @returns {Promise<Object>} 创建的通知对象
   */
  async createEnrollmentNotification(userId, title, message) {
    return await Notification.create({
      userId,
      title,
      message,
      type: 'enrollment'
    });
  },

  /**
   * 创建成绩相关通知
   * @param {string} userId - 用户ID
   * @param {string} title - 通知标题
   * @param {string} message - 通知内容
   * @returns {Promise<Object>} 创建的通知对象
   */
  async createGradeNotification(userId, title, message) {
    return await Notification.create({
      userId,
      title,
      message,
      type: 'grade'
    });
  },

  /**
   * 创建考勤相关通知
   * @param {string} userId - 用户ID
   * @param {string} title - 通知标题
   * @param {string} message - 通知内容
   * @returns {Promise<Object>} 创建的通知对象
   */
  async createAttendanceNotification(userId, title, message) {
    return await Notification.create({
      userId,
      title,
      message,
      type: 'attendance'
    });
  },

  /**
   * 批量创建通知
   * @param {Array<Object>} notifications - 通知对象数组
   * @returns {Promise<Array<Object>>} 创建的通知对象数组
   */
  async createBatchNotifications(notifications) {
    return await Notification.insertMany(notifications);
  }
};

module.exports = notificationService; 