const Router = require('koa-router');
const router = new Router({ prefix: '/attendance' });
const { auth, checkRole } = require('../middlewares/auth');
const Attendance = require('../models/attendance');
const Course = require('../models/course');
const User = require('../models/user');
const notificationService = require('../services/notificationService');

// Get all attendance records (admin and teacher only)
router.get('/', auth, checkRole(['admin', 'teacher']), async (ctx) => {
  try {
    let attendanceRecords;
    
    // If teacher, only show attendance for courses they teach
    if (ctx.state.user.role === 'teacher') {
      // First find courses taught by this teacher
      const teacherCourses = await Course.find({ teacherId: ctx.state.user.id }).select('_id');
      const courseIds = teacherCourses.map(course => course._id);
      
      // Then find attendance records for those courses
      attendanceRecords = await Attendance.find({ courseId: { $in: courseIds } })
        .populate('studentId', 'name username')
        .populate('courseId', 'name code')
        .sort({ date: -1 });
    } else {
      // Admin can see all attendance records
      attendanceRecords = await Attendance.find({})
        .populate('studentId', 'name username')
        .populate('courseId', 'name code')
        .sort({ date: -1 });
    }

    ctx.body = {
      success: true,
      data: attendanceRecords
    };
  } catch (error) {
    console.error('Error fetching all attendance records:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message
    };
  }
});

// Get student's attendance records
router.get('/my-attendance', auth, checkRole(['student']), async (ctx) => {
  const attendance = await Attendance.find({ studentId: ctx.state.user.id })
    .populate('courseId', 'name code')
    .sort({ date: -1 });

  ctx.body = {
    success: true,
    data: attendance
  };
});

// Get course attendance records (teacher only)
router.get('/course/:courseId', auth, checkRole(['admin', 'teacher']), async (ctx) => {
  const attendance = await Attendance.find({ courseId: ctx.params.courseId })
    .populate('studentId', 'name username')
    .sort({ date: -1 });

  ctx.body = {
    success: true,
    data: attendance
  };
});

// Record attendance (teacher only)
router.post('/', auth, checkRole(['admin', 'teacher']), async (ctx) => {
  const attendanceData = ctx.request.body;

  // Handle bulk attendance records
  if (Array.isArray(attendanceData)) {
    const attendance = await Attendance.insertMany(attendanceData);
    
    // 批量发送考勤通知
    for (const record of attendance) {
      await sendAttendanceNotification(record);
    }
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: attendance
    };
    return;
  }

  // Handle single attendance record
  const attendance = await Attendance.findOneAndUpdate(
    {
      studentId: attendanceData.studentId,
      courseId: attendanceData.courseId,
      date: attendanceData.date
    },
    attendanceData,
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  );

  // 发送考勤通知
  await sendAttendanceNotification(attendance);

  ctx.status = 201;
  ctx.body = {
    success: true,
    data: attendance
  };
});

// Update attendance record
router.put('/:id', auth, checkRole(['admin', 'teacher']), async (ctx) => {
  const attendance = await Attendance.findByIdAndUpdate(
    ctx.params.id,
    ctx.request.body,
    { new: true, runValidators: true }
  );

  if (!attendance) {
    ctx.throw(404, 'Attendance record not found');
  }

  // 发送考勤更新通知
  await sendAttendanceNotification(attendance, true);

  ctx.body = {
    success: true,
    data: attendance
  };
});

// 发送考勤通知的辅助函数
async function sendAttendanceNotification(attendanceRecord, isUpdate = false) {
  try {
    // 获取课程信息
    const course = await Course.findById(attendanceRecord.courseId);
    if (!course) return;

    // 获取学生信息
    const student = await User.findById(attendanceRecord.studentId);
    if (!student) return;

    // 格式化日期
    const date = new Date(attendanceRecord.date).toLocaleDateString('zh-CN');
    
    // 考勤状态映射
    const statusMap = {
      'present': '出席',
      'absent': '缺席',
      'late': '迟到',
      'excused': '请假'
    };
    
    const status = statusMap[attendanceRecord.status] || attendanceRecord.status;
    
    // 发送通知
    const title = isUpdate ? '考勤记录已更新' : '新考勤记录';
    const message = `您在 ${date} 的课程 ${course.name}（${course.code}）考勤状态为：${status}`;
    
    await notificationService.createAttendanceNotification(
      attendanceRecord.studentId,
      title,
      message
    );
  } catch (error) {
    console.error('发送考勤通知失败:', error);
  }
}

module.exports = router; 