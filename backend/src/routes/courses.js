const Router = require('koa-router');
const router = new Router({ prefix: '/courses' });
const { auth, checkRole } = require('../middlewares/auth');
const Course = require('../models/course');

// Get all courses
router.get('/', auth, async (ctx) => {
  const courses = await Course.find()
    .populate('teacherId', 'name email');
  
  ctx.body = {
    success: true,
    data: courses
  };
});

// Create course (admin and teacher only)
router.post('/', auth, checkRole(['admin', 'teacher']), async (ctx) => {
  const courseData = ctx.request.body;
  
  if (ctx.state.user.role === 'teacher') {
    courseData.teacherId = ctx.state.user.id;
  }

  const course = new Course(courseData);
  await course.save();

  ctx.status = 201;
  ctx.body = {
    success: true,
    data: course
  };
});

// Update course
router.put('/:id', auth, checkRole(['admin', 'teacher']), async (ctx) => {
  const course = await Course.findById(ctx.params.id);
  
  if (!course) {
    ctx.throw(404, 'Course not found');
  }

  if (ctx.state.user.role === 'teacher' && 
      course.teacherId.toString() !== ctx.state.user.id) {
    ctx.throw(403, 'Not authorized to update this course');
  }

  Object.assign(course, ctx.request.body);
  await course.save();

  ctx.body = {
    success: true,
    data: course
  };
});

// Delete course (admin only)
router.delete('/:id', auth, checkRole(['admin']), async (ctx) => {
  const course = await Course.findByIdAndDelete(ctx.params.id);
  
  if (!course) {
    ctx.throw(404, 'Course not found');
  }

  ctx.body = {
    success: true,
    message: 'Course deleted successfully'
  };
});

module.exports = router; 