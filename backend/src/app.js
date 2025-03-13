const Koa = require('koa');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const { logger } = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
const router = require('./routes');
const connectDB = require('./config/database');
const setupSwagger = require('./utils/swagger');

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

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API 文档地址: http://localhost:${PORT}/api/docs`);
});

module.exports = app; 