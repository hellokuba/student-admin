const Router = require('koa-router');
const router = new Router({ prefix: '/auth' });
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Login route
router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body;

  if (!username || !password) {
    ctx.throw(400, 'Username and password are required');
  }

  const user = await User.findOne({ username });
  if (!user || !await user.comparePassword(password)) {
    ctx.throw(401, 'Invalid username or password');
  }

  if (!user.status) {
    ctx.throw(403, 'Account is disabled');
  }

  const token = jwt.sign(
    { 
      id: user._id,
      username: user.username,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  ctx.body = {
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email
      }
    }
  };
});

// Register route (only for admin)
router.post('/register', async (ctx) => {
  const userData = ctx.request.body;

  try {
    const user = new User(userData);
    await user.save();

    ctx.status = 201;
    ctx.body = {
      success: true,
      data: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email
      }
    };
  } catch (error) {
    if (error.code === 11000) {
      ctx.throw(400, 'Username or email already exists');
    }
    throw error;
  }
});

module.exports = router; 