const { logger } = require('../utils/logger');

const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    logger.error('Error handling request:', err);

    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
  }
};

module.exports = errorHandler; 