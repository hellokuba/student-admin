const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

const auth = async (ctx, next) => {
  try {
    logger.info(`Auth middleware - Headers: ${JSON.stringify(ctx.headers)}`);
    
    const authHeader = ctx.header.authorization;
    logger.info(`Auth middleware - Authorization header: ${authHeader}`);
    
    if (!authHeader) {
      logger.warn('Auth middleware - No authorization header');
      ctx.throw(401, 'Authentication token required');
    }
    
    const token = authHeader.split(' ')[1];
    logger.info(`Auth middleware - Token: ${token}`);
    
    if (!token) {
      logger.warn('Auth middleware - No token in authorization header');
      ctx.throw(401, 'Authentication token required');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      logger.info(`Auth middleware - Decoded token: ${JSON.stringify(decoded)}`);
      ctx.state.user = decoded;
    } catch (jwtError) {
      logger.error(`Auth middleware - JWT verification error: ${jwtError.message}`);
      ctx.throw(401, `Invalid authentication token: ${jwtError.message}`);
    }
    
    await next();
  } catch (error) {
    logger.error(`Auth middleware - Error: ${error.message}`);
    ctx.throw(401, `Invalid authentication token: ${error.message}`);
  }
};

const checkRole = (roles) => {
  return async (ctx, next) => {
    if (!ctx.state.user) {
      logger.warn('CheckRole middleware - No user in context state');
      ctx.throw(401, 'Authentication required');
    }

    logger.info(`CheckRole middleware - User role: ${ctx.state.user.role}, Required roles: ${roles.join(', ')}`);
    
    if (!roles.includes(ctx.state.user.role)) {
      logger.warn(`CheckRole middleware - Access denied for role ${ctx.state.user.role}`);
      ctx.throw(403, 'Access denied');
    }

    await next();
  };
};

module.exports = {
  auth,
  checkRole
}; 