/**
 * 角色检查中间件
 * @param {Array} roles - 允许访问的角色数组
 * @returns {Function} Koa 中间件
 */
const checkRole = (roles) => {
  return async (ctx, next) => {
    // 确保用户已经通过身份验证
    if (!ctx.state.user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '未授权'
      };
      return;
    }

    // 检查用户角色是否在允许的角色列表中
    if (!roles.includes(ctx.state.user.role)) {
      ctx.status = 403;
      ctx.body = {
        success: false,
        message: '权限不足'
      };
      return;
    }

    // 如果角色检查通过，继续下一个中间件
    await next();
  };
};

module.exports = { checkRole }; 