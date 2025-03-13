const Router = require('koa-router');
const router = new Router();
const Notification = require('../models/notification');
const { auth } = require('../middlewares/auth');
const { handleError } = require('../middlewares/errorHandler');

/**
 * @route GET /api/notifications
 * @desc 获取用户的所有通知
 * @access Private
 */
router.get('/', auth, async (ctx) => {
  try {
    const notifications = await Notification.find({ userId: ctx.state.user._id })
      .sort({ createdAt: -1 });
    
    ctx.body = {
      success: true,
      data: notifications
    };
  } catch (error) {
    handleError(ctx, error);
  }
});

/**
 * @route GET /api/notifications/unread-count
 * @desc 获取用户的未读通知数量
 * @access Private
 */
router.get('/unread-count', auth, async (ctx) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: ctx.state.user._id,
      read: false
    });
    
    ctx.body = {
      success: true,
      data: { count }
    };
  } catch (error) {
    handleError(ctx, error);
  }
});

/**
 * @route PUT /api/notifications/:id/read
 * @desc 将通知标记为已读
 * @access Private
 */
router.put('/:id/read', auth, async (ctx) => {
  try {
    const notification = await Notification.findOne({
      _id: ctx.params.id,
      userId: ctx.state.user._id
    });
    
    if (!notification) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '通知不存在'
      };
      return;
    }
    
    notification.read = true;
    await notification.save();
    
    ctx.body = {
      success: true
    };
  } catch (error) {
    handleError(ctx, error);
  }
});

/**
 * @route PUT /api/notifications/read-all
 * @desc 将所有通知标记为已读
 * @access Private
 */
router.put('/read-all', auth, async (ctx) => {
  try {
    await Notification.updateMany(
      { userId: ctx.state.user._id, read: false },
      { $set: { read: true } }
    );
    
    ctx.body = {
      success: true
    };
  } catch (error) {
    handleError(ctx, error);
  }
});

/**
 * @route DELETE /api/notifications/:id
 * @desc 删除通知
 * @access Private
 */
router.delete('/:id', auth, async (ctx) => {
  try {
    const notification = await Notification.findOne({
      _id: ctx.params.id,
      userId: ctx.state.user._id
    });
    
    if (!notification) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '通知不存在'
      };
      return;
    }
    
    await notification.deleteOne();
    
    ctx.body = {
      success: true
    };
  } catch (error) {
    handleError(ctx, error);
  }
});

module.exports = router; 