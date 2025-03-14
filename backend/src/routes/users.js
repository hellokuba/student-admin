const Router = require('koa-router');
const router = new Router({ prefix: '/users' });
const { auth, checkRole } = require('../middlewares/auth');
const User = require('../models/user');

// Get all users (admin and teacher)
router.get('/', auth, checkRole(['admin', 'teacher']), async (ctx) => {
  const users = await User.find({}, '-password');
  ctx.body = {
    success: true,
    data: users
  };
});

// Get user profile
router.get('/profile', auth, async (ctx) => {
  const user = await User.findById(ctx.state.user.id, '-password');
  ctx.body = {
    success: true,
    data: user
  };
});

// Update user profile
router.put('/profile', auth, async (ctx) => {
  const updates = ctx.request.body;
  delete updates.password; // Prevent password update through this route
  delete updates.role; // Prevent role update through this route

  const user = await User.findByIdAndUpdate(
    ctx.state.user.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password');

  ctx.body = {
    success: true,
    data: user
  };
});

module.exports = router; 