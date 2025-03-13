const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const { koaSwagger } = require('koa2-swagger-ui');

/**
 * 配置 Swagger 文档
 * @param {Object} app - Koa 应用实例
 */
function setupSwagger(app) {
  // 读取 Swagger YAML 文件
  const swaggerYamlPath = path.join(__dirname, '../../swagger.yaml');
  const swaggerSpec = yaml.load(fs.readFileSync(swaggerYamlPath, 'utf8'));

  // 配置 Swagger UI
  app.use(
    koaSwagger({
      routePrefix: '/api/docs', // Swagger UI 的访问路径
      swaggerOptions: {
        spec: swaggerSpec,
      },
      hideTopbar: false, // 显示顶部栏
      title: '学生管理系统 API 文档',
    })
  );

  console.log('Swagger 文档已配置，访问路径: /api/docs');
}

module.exports = setupSwagger; 