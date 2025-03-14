const Router = require('koa-router');
const router = new Router({ prefix: '/grades' });
const { auth, checkRole } = require('../middlewares/auth');
const Grade = require('../models/grade');
const Course = require('../models/course');
const User = require('../models/user');
const notificationService = require('../services/notificationService');

// Get all grades (admin and teacher only)
router.get('/', auth, checkRole(['admin', 'teacher']), async (ctx) => {
  try {
    let grades;
    
    // If teacher, only show grades for courses they teach
    if (ctx.state.user.role === 'teacher') {
      // First find courses taught by this teacher
      const teacherCourses = await Course.find({ teacherId: ctx.state.user.id }).select('_id');
      const courseIds = teacherCourses.map(course => course._id);
      
      // Then find grades for those courses
      grades = await Grade.find({ courseId: { $in: courseIds } })
        .populate('studentId', 'name username')
        .populate('courseId', 'name code')
        .sort({ createdAt: -1 });
    } else {
      // Admin can see all grades
      grades = await Grade.find({})
        .populate('studentId', 'name username')
        .populate('courseId', 'name code')
        .sort({ createdAt: -1 });
    }

    ctx.body = {
      success: true,
      data: grades
    };
  } catch (error) {
    console.error('Error fetching all grades:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Failed to fetch grades',
      error: error.message
    };
  }
});

// Get student's grades
router.get('/my-grades', auth, checkRole(['student']), async (ctx) => {
  const grades = await Grade.find({ studentId: ctx.state.user.id })
    .populate('courseId', 'name code')
    .sort({ createdAt: -1 });

  ctx.body = {
    success: true,
    data: grades
  };
});

// Get course grades (teacher only)
router.get('/course/:courseId', auth, checkRole(['admin', 'teacher']), async (ctx) => {
  const grades = await Grade.find({ courseId: ctx.params.courseId })
    .populate('studentId', 'name username')
    .sort({ createdAt: -1 });

  ctx.body = {
    success: true,
    data: grades
  };
});

// Add/Update grade (teacher only)
router.post('/', auth, checkRole(['admin', 'teacher']), async (ctx) => {
  const gradeData = ctx.request.body;

  // 查找课程信息
  const course = await Course.findById(gradeData.courseId);
  if (!course) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '课程不存在'
    };
    return;
  }

  // 查找学生信息
  const student = await User.findById(gradeData.studentId);
  if (!student) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: '学生不存在'
    };
    return;
  }

  // 检查是否为更新或新增
  const existingGrade = await Grade.findOne({
    studentId: gradeData.studentId,
    courseId: gradeData.courseId,
    type: gradeData.type
  });

  const grade = await Grade.findOneAndUpdate(
    {
      studentId: gradeData.studentId,
      courseId: gradeData.courseId,
      type: gradeData.type
    },
    gradeData,
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  );

  // 发送成绩通知给学生
  const gradeTypeMap = {
    'assignment': '作业',
    'quiz': '测验',
    'midterm': '期中考试',
    'final': '期末考试',
    'project': '项目',
    'participation': '课堂参与',
    '期中考试': '期中考试',
    '期末考试': '期末考试',
    '平时成绩': '平时成绩',
    '实验': '实验',
    '作业': '作业',
    '其他': '其他'
  };

  const gradeTypeName = gradeTypeMap[gradeData.type] || gradeData.type;
  
  if (existingGrade) {
    // 更新成绩通知
    await notificationService.createGradeNotification(
      gradeData.studentId,
      '成绩已更新',
      `您在课程 ${course.name}（${course.code}）的${gradeTypeName}成绩已更新为 ${gradeData.score}`
    );
  } else {
    // 新增成绩通知
    await notificationService.createGradeNotification(
      gradeData.studentId,
      '新成绩已发布',
      `您在课程 ${course.name}（${course.code}）的${gradeTypeName}成绩已发布：${gradeData.score}`
    );
  }

  ctx.status = 201;
  ctx.body = {
    success: true,
    data: grade
  };
});

// Delete grade (admin only)
router.delete('/:id', auth, checkRole(['admin']), async (ctx) => {
  const grade = await Grade.findById(ctx.params.id)
    .populate('courseId', 'name code')
    .populate('studentId', 'name');
  
  if (!grade) {
    ctx.throw(404, 'Grade not found');
  }

  // 发送成绩删除通知给学生
  await notificationService.createGradeNotification(
    grade.studentId._id,
    '成绩已删除',
    `您在课程 ${grade.courseId.name}（${grade.courseId.code}）的成绩记录已被删除`
  );

  await grade.deleteOne();

  ctx.body = {
    success: true,
    message: 'Grade deleted successfully'
  };
});

module.exports = router; 