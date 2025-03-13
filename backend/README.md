# Student Administration System Backend

基于 Node.js、Koa2 和 MongoDB 的学生管理系统后端服务。

## 功能特性

- 用户管理（管理员、教师、学生）
- 课程管理
- 成绩管理
- 考勤记录
- 通知系统

## 技术栈

- Node.js
- Koa2
- MongoDB
- Docker & Docker Compose
- JWT 认证
- Winston 日志
- Swagger API 文档

## 快速开始

### 使用 Docker Compose（推荐）

1. 克隆项目
```bash
git clone <repository-url>
cd student-admin-backend
```

2. 复制环境变量文件
```bash
cp .env.example .env
```

3. 启动服务
```bash
docker-compose up
```

服务将在 http://localhost:3000 启动

### 本地开发

1. 确保已安装 Node.js (v16+) 和 MongoDB

2. 安装依赖
```bash
npm install
```

3. 复制环境变量文件并修改配置
```bash
cp .env.example .env
```

4. 启动开发服务器
```bash
npm run dev
```

## API 文档

API 文档使用 Swagger 提供，启动服务后可在以下地址访问：

http://localhost:3000/api/docs

详细的 API 文档说明请参考 [API_DOCS.md](./API_DOCS.md)

## 项目结构

```
src/
  ├── config/         # 配置文件
  ├── controllers/    # 控制器
  ├── middlewares/    # 中间件
  ├── models/        # 数据模型
  ├── routes/        # 路由
  ├── services/      # 业务逻辑
  ├── utils/         # 工具函数
  └── app.js         # 应用入口
```

## 测试

运行测试：
```bash
npm test
```

## License

MIT 