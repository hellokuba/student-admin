const Router = require('koa-router');
const router = new Router({ prefix: '/api' });

// Health check endpoint
router.get('/health', (ctx) => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString()
  };
});

// Import and use other route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const courseRoutes = require('./courses');
const gradeRoutes = require('./grades');
const attendanceRoutes = require('./attendance');
const enrollmentRoutes = require('./enrollments');
const notificationRoutes = require('./notifications');

router.use(authRoutes.routes());
router.use(userRoutes.routes());
router.use(courseRoutes.routes());
router.use(gradeRoutes.routes());
router.use(attendanceRoutes.routes());
router.use('/enrollments', enrollmentRoutes.routes());
router.use('/notifications', notificationRoutes.routes(), notificationRoutes.allowedMethods());

module.exports = router; 