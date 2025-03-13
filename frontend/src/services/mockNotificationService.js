/**
 * 模拟通知服务 - 用于前端开发和测试
 * 在实际项目中，应该使用真实的API接口
 */

// 模拟通知数据
const mockNotifications = [
  {
    id: '1',
    title: '课程通知',
    message: '您的《高等数学》课程已更新教学大纲，请查看最新内容。',
    type: 'course',
    read: false,
    link: '/courses',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30分钟前
  },
  {
    id: '2',
    title: '成绩发布',
    message: '您的《数据结构》课程期末考试成绩已公布，请查看。',
    type: 'grade',
    read: false,
    link: '/grades',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2小时前
  },
  {
    id: '3',
    title: '考勤提醒',
    message: '您有一节《计算机网络》课程的考勤记录缺失，请联系任课教师。',
    type: 'attendance',
    read: true,
    link: '/attendance',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1天前
  },
  {
    id: '4',
    title: '系统通知',
    message: '系统将于本周日凌晨2:00-4:00进行维护，请提前做好准备。',
    type: 'system',
    read: false,
    link: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3天前
  },
  {
    id: '5',
    title: '课程通知',
    message: '《Java程序设计》课程将于下周一调整上课时间，请留意。',
    type: 'course',
    read: true,
    link: '/courses',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5天前
  }
];

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockNotificationService = {
  /**
   * 获取用户的所有通知
   * @returns {Promise} 包含通知数据的Promise
   */
  async getNotifications() {
    await delay(800); // 模拟网络延迟
    return {
      success: true,
      data: [...mockNotifications]
    };
  },
  
  /**
   * 获取用户的未读通知数量
   * @returns {Promise} 包含未读通知数量的Promise
   */
  async getUnreadCount() {
    await delay(300); // 模拟网络延迟
    const unreadCount = mockNotifications.filter(n => !n.read).length;
    return {
      success: true,
      data: { count: unreadCount }
    };
  },
  
  /**
   * 将通知标记为已读
   * @param {string} id - 通知ID
   * @returns {Promise} 操作结果的Promise
   */
  async markAsRead(id) {
    await delay(500); // 模拟网络延迟
    const notification = mockNotifications.find(n => n.id === id);
    
    if (notification) {
      notification.read = true;
      return { success: true };
    }
    
    return {
      success: false,
      error: { message: '通知不存在' }
    };
  },
  
  /**
   * 将所有通知标记为已读
   * @returns {Promise} 操作结果的Promise
   */
  async markAllAsRead() {
    await delay(700); // 模拟网络延迟
    mockNotifications.forEach(notification => {
      notification.read = true;
    });
    
    return { success: true };
  },
  
  /**
   * 删除通知
   * @param {string} id - 通知ID
   * @returns {Promise} 操作结果的Promise
   */
  async deleteNotification(id) {
    await delay(600); // 模拟网络延迟
    const index = mockNotifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
      mockNotifications.splice(index, 1);
      return { success: true };
    }
    
    return {
      success: false,
      error: { message: '通知不存在' }
    };
  }
}; 