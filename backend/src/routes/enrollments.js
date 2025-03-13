const Router = require('koa-router');
const router = new Router();
const Enrollment = require('../models/enrollment');
const Course = require('../models/course');
const { auth } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');
const mongoose = require('mongoose');
const notificationService = require('../services/notificationService');

// 获取学生的选课列表
router.get('/my-enrollments', auth, async (ctx) => {
  try {
    const enrollments = await Enrollment.find({ studentId: ctx.state.user.id })
      .populate({
        path: 'courseId',
        select: 'name code credits description',
        populate: {
          path: 'teacherId',
          select: 'name email'
        }
      });
    
    ctx.body = {
      success: true,
      data: enrollments.map(enrollment => ({
        id: enrollment._id,
        status: enrollment.status,
        enrollmentDate: enrollment.enrollmentDate,
        course: {
          id: enrollment.courseId._id,
          name: enrollment.courseId.name,
          code: enrollment.courseId.code,
          credits: enrollment.courseId.credits,
          description: enrollment.courseId.description,
          teacher: enrollment.courseId.teacherId
        }
      }))
    };
  } catch (error) {
    console.error('获取选课列表失败:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取选课列表失败'
    };
  }
});

// 获取课程的学生列表
router.get('/course/:courseId', auth, checkRole(['admin', 'teacher']), async (ctx) => {
  try {
    const { courseId } = ctx.params;
    
    // 验证课程ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '无效的课程ID'
      };
      return;
    }
    
    // 如果是教师，确保只能查看自己的课程
    if (ctx.state.user.role === 'teacher') {
      const course = await Course.findById(courseId);
      if (!course || course.teacherId.toString() !== ctx.state.user.id) {
        ctx.status = 403;
        ctx.body = {
          success: false,
          message: '您没有权限查看此课程的学生列表'
        };
        return;
      }
    }
    
    const enrollments = await Enrollment.find({ courseId, status: 'enrolled' })
      .populate({
        path: 'studentId',
        select: 'name username email'
      });
    
    ctx.body = {
      success: true,
      data: enrollments.map(enrollment => ({
        id: enrollment._id,
        enrollmentDate: enrollment.enrollmentDate,
        student: {
          id: enrollment.studentId._id,
          name: enrollment.studentId.name,
          username: enrollment.studentId.username,
          email: enrollment.studentId.email
        }
      }))
    };
  } catch (error) {
    console.error('获取课程学生列表失败:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取课程学生列表失败'
    };
  }
});

// 学生选课
router.post('/', auth, checkRole(['student']), async (ctx) => {
  try {
    const { courseId } = ctx.request.body;
    
    // 验证课程ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '无效的课程ID'
      };
      return;
    }
    
    // 检查课程是否存在
    const course = await Course.findById(courseId);
    if (!course) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '课程不存在'
      };
      return;
    }
    
    // 检查课程是否已满
    const enrolledCount = await Enrollment.countDocuments({
      courseId,
      status: 'enrolled'
    });
    
    if (enrolledCount >= course.capacity) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '课程已满'
      };
      return;
    }
    
    // 检查学生是否已经选择了该课程
    const existingEnrollment = await Enrollment.findOne({
      studentId: ctx.state.user.id,
      courseId
    });
    
    if (existingEnrollment) {
      if (existingEnrollment.status === 'enrolled') {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '您已经选择了该课程'
        };
        return;
      } else if (existingEnrollment.status === 'dropped') {
        // 如果之前退选了，现在重新选课
        existingEnrollment.status = 'enrolled';
        existingEnrollment.enrollmentDate = Date.now();
        await existingEnrollment.save();
        
        // 发送重新选课通知给学生
        await notificationService.createEnrollmentNotification(
          ctx.state.user.id,
          '课程重新选择成功',
          `您已成功重新选择课程：${course.name}（${course.code}）`
        );
        
        // 发送通知给教师
        await notificationService.createEnrollmentNotification(
          course.teacherId,
          '新学生加入课程',
          `学生 ${ctx.state.user.name} 已重新加入您的课程：${course.name}（${course.code}）`
        );
        
        ctx.status = 200;
        ctx.body = {
          success: true,
          message: '重新选课成功',
          data: {
            id: existingEnrollment._id,
            courseId: existingEnrollment.courseId,
            status: existingEnrollment.status,
            enrollmentDate: existingEnrollment.enrollmentDate
          }
        };
        return;
      }
    }
    
    // 创建新的选课记录
    const enrollment = new Enrollment({
      studentId: ctx.state.user.id,
      courseId,
      status: 'enrolled',
      enrollmentDate: Date.now()
    });
    
    await enrollment.save();
    
    // 发送选课成功通知给学生
    await notificationService.createEnrollmentNotification(
      ctx.state.user.id,
      '选课成功',
      `您已成功选择课程：${course.name}（${course.code}）`
    );
    
    // 发送通知给教师
    await notificationService.createEnrollmentNotification(
      course.teacherId,
      '新学生加入课程',
      `学生 ${ctx.state.user.name} 已加入您的课程：${course.name}（${course.code}）`
    );
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      message: '选课成功',
      data: {
        id: enrollment._id,
        courseId: enrollment.courseId,
        status: enrollment.status,
        enrollmentDate: enrollment.enrollmentDate
      }
    };
  } catch (error) {
    console.error('选课失败:', error);
    
    // 处理唯一索引冲突
    if (error.code === 11000) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '您已经选择了该课程'
      };
      return;
    }
    
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '选课失败'
    };
  }
});

// 学生退课
router.delete('/:courseId', auth, checkRole(['student']), async (ctx) => {
  try {
    const { courseId } = ctx.params;
    
    // 验证课程ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '无效的课程ID'
      };
      return;
    }
    
    // 查找选课记录
    const enrollment = await Enrollment.findOne({
      studentId: ctx.state.user.id,
      courseId,
      status: 'enrolled'
    });
    
    if (!enrollment) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '未找到选课记录'
      };
      return;
    }
    
    // 获取课程信息
    const course = await Course.findById(courseId);
    
    // 更新选课状态为退选
    enrollment.status = 'dropped';
    await enrollment.save();
    
    // 发送退课通知给学生
    await notificationService.createEnrollmentNotification(
      ctx.state.user.id,
      '退课成功',
      `您已成功退出课程：${course.name}（${course.code}）`
    );
    
    // 发送通知给教师
    await notificationService.createEnrollmentNotification(
      course.teacherId,
      '学生退出课程',
      `学生 ${ctx.state.user.name} 已退出您的课程：${course.name}（${course.code}）`
    );
    
    ctx.body = {
      success: true,
      message: '退课成功'
    };
  } catch (error) {
    console.error('退课失败:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '退课失败'
    };
  }
});

module.exports = router; 