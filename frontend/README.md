# 学生管理系统前端

这是一个基于 Vue 3 和 Element Plus 的学生管理系统前端项目。

## 功能特性

- 用户认证（登录/注册）
- 个人资料管理
- 课程管理
- 成绩管理
- 考勤管理
- 用户管理（仅管理员）
- 响应式设计，适配移动端和桌面端

## 技术栈

- Vue 3 - 渐进式 JavaScript 框架
- Vue Router - 官方路由管理器
- Pinia - 状态管理库
- Element Plus - 基于 Vue 3 的组件库
- Axios - HTTP 客户端
- Vite - 前端构建工具
- SCSS - CSS 预处理器

## 开发环境设置

### 前提条件

- Node.js (>= 14.x)
- npm 或 yarn

### 安装

```bash
# 克隆仓库
git clone <repository-url>

# 进入项目目录
cd student-admin-frontend

# 安装依赖
npm install
# 或
yarn install
```

### 开发

```bash
# 启动开发服务器
npm run dev
# 或
yarn dev
```

### 构建

```bash
# 构建生产版本
npm run build
# 或
yarn build
```

## Docker 部署

本项目支持使用 Docker 进行部署，提供了 Dockerfile 和 docker-compose.yml 配置文件。

### 使用 Docker Compose 部署

```bash
# 构建并启动容器
docker-compose up -d

# 查看容器状态
docker-compose ps

# 查看容器日志
docker-compose logs -f
```

### 手动构建 Docker 镜像

```bash
# 构建镜像
docker build -t student-admin-frontend .

# 运行容器
docker run -d -p 80:80 --name student-admin-frontend student-admin-frontend
```

### 配置环境变量

如需配置环境变量，可以在 docker-compose.yml 文件中的 environment 部分进行修改。

## 项目结构

```
student-admin-frontend/
├── public/                 # 静态资源
├── src/                    # 源代码
│   ├── assets/             # 资源文件（图片、样式等）
│   ├── components/         # 通用组件
│   ├── layouts/            # 布局组件
│   ├── router/             # 路由配置
│   ├── services/           # API 服务
│   ├── stores/             # Pinia 状态管理
│   ├── views/              # 页面视图
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── .dockerignore           # Docker 忽略文件
├── .gitignore              # Git 忽略文件
├── docker-compose.yml      # Docker Compose 配置
├── Dockerfile              # Docker 构建文件
├── index.html              # HTML 模板
├── nginx.conf              # Nginx 配置
├── package.json            # 项目依赖
├── README.md               # 项目说明
└── vite.config.js          # Vite 配置
```

## API 接口

本项目后端 API 接口基于 Node.js、Koa2 和 MongoDB 实现，详细 API 文档请参考 `swagger.yaml` 文件。

## 浏览器兼容性

- Chrome
- Firefox
- Safari
- Edge

## 许可证

[MIT](LICENSE) 