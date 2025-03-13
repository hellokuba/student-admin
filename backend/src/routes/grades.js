const Router = require('koa-router');
const router = new Router({ prefix: '/grades' });
const { auth, checkRole } = require('../middlewares/auth');
const Grade = require('../models/grade');

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

  ctx.status = 201;
  ctx.body = {
    success: true,
    data: grade
  };
});

// Delete grade (admin only)
router.delete('/:id', auth, checkRole(['admin']), async (ctx) => {
  const grade = await Grade.findByIdAndDelete(ctx.params.id);
  
  if (!grade) {
    ctx.throw(404, 'Grade not found');
  }

  ctx.body = {
    success: true,
    message: 'Grade deleted successfully'
  };
});

module.exports = router; 