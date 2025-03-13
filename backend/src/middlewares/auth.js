const jwt = require('jsonwebtoken');

const auth = async (ctx, next) => {
  try {
    const token = ctx.header.authorization?.split(' ')[1];
    
    if (!token) {
      ctx.throw(401, 'Authentication token required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ctx.state.user = decoded;
    
    await next();
  } catch (error) {
    ctx.throw(401, 'Invalid authentication token');
  }
};

const checkRole = (roles) => {
  return async (ctx, next) => {
    if (!ctx.state.user) {
      ctx.throw(401, 'Authentication required');
    }

    if (!roles.includes(ctx.state.user.role)) {
      ctx.throw(403, 'Access denied');
    }

    await next();
  };
};

module.exports = {
  auth,
  checkRole
}; 