const Router = require('koa-router');
const router = new Router({ prefix: '/attendance' });
const { auth, checkRole } = require('../middlewares/auth');
const Attendance = require('../models/attendance');

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

  ctx.body = {
    success: true,
    data: attendance
  };
});

module.exports = router; 