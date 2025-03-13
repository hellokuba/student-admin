const Koa = require('koa');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const { logger } = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
const router = require('./routes');
const connectDB = require('./config/database');
const setupSwagger = require('./utils/swagger');
const initNotifications = require('./utils/initNotifications');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = new Koa();

// Middleware
app.use(cors());
app.use(bodyParser());
app.use(errorHandler);

// Logger middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// 配置 Swagger 文档
setupSwagger(app);

// Routes
app.use(router.routes());
app.use(router.allowedMethods());

// Error handling
app.on('error', (err, ctx) => {
  logger.error('Server Error', err, ctx);
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${server.address().port}`);
  logger.info(`API 文档地址: http://localhost:${server.address().port}/api/docs`);
  
  // 初始化通知
  initNotifications().catch(err => {
    logger.error('初始化通知失败:', err);
  });
});

// 处理端口占用错误
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.warn(`端口 ${PORT} 已被占用，尝试使用端口 ${PORT + 1}`);
    server.listen(PORT + 1);
  } else {
    logger.error('服务器启动错误:', err);
  }
});

// 测试 nodemon 重启

module.exports = app; 