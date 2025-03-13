const User = require('../models/user');
const Notification = require('../models/notification');
const notificationService = require('../services/notificationService');

/**
 * 初始化系统通知
 * 为每个用户创建一些示例通知
 */
async function initNotifications() {
  try {
    // 检查是否已经有通知
    const notificationCount = await Notification.countDocuments();
    if (notificationCount > 0) {
      console.log('通知已存在，跳过初始化');
      return;
    }

    // 获取所有用户
    const users = await User.find();
    
    // 为每个用户创建欢迎通知
    for (const user of users) {
      // 创建欢迎通知
      await notificationService.createSystemNotification(
        user._id,
        '欢迎使用学生管理系统',
        `尊敬的${user.name}，欢迎使用学生管理系统！您可以在这里管理您的课程、成绩和考勤信息。`
      );
      
      // 根据用户角色创建不同的通知
      if (user.role === 'student') {
        await notificationService.createSystemNotification(
          user._id,
          '选课已开始',
          '新学期选课已经开始，请尽快登录系统选择您想要学习的课程。'
        );
        
        await notificationService.createSystemNotification(
          user._id,
          '系统使用指南',
          '您可以在"我的课程"页面查看已选课程，在"我的成绩"页面查看成绩，在"我的考勤"页面查看考勤记录。'
        );
      } else if (user.role === 'teacher') {
        await notificationService.createSystemNotification(
          user._id,
          '课程管理',
          '您可以在"我的课程"页面管理您的课程，查看选课学生，记录考勤和发布成绩。'
        );
        
        await notificationService.createSystemNotification(
          user._id,
          '新功能上线',
          '现在您可以批量导入学生成绩和考勤记录，提高工作效率。'
        );
      } else if (user.role === 'admin') {
        await notificationService.createSystemNotification(
          user._id,
          '系统管理',
          '您可以管理所有用户、课程、成绩和考勤记录。'
        );
        
        await notificationService.createSystemNotification(
          user._id,
          '系统更新',
          '系统已更新到最新版本，新增了通知功能和数据导出功能。'
        );
      }
    }
    
    console.log('通知初始化完成');
  } catch (error) {
    console.error('初始化通知失败:', error);
  }
}

module.exports = initNotifications; 