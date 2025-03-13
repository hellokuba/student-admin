# 学生管理系统 Docker 部署指南

本项目使用 Docker Compose 进行前后端一体化部署，包含以下服务：

- 前端服务 (基于 Nginx)
- 后端服务 (Node.js)
- MongoDB 数据库

## 系统要求

- Docker 20.10.0 或更高版本
- Docker Compose 2.0.0 或更高版本
- 至少 2GB 可用内存
- 至少 5GB 可用磁盘空间

## 快速开始

### 1. 克隆仓库

```bash
git clone <repository-url>
cd student-admin
```

### 2. 配置环境变量（可选）

如需自定义配置，可以修改 `docker-compose.yml` 文件中的环境变量。

### 3. 启动服务

```bash
docker-compose up -d
```

这将在后台启动所有服务。首次启动时，Docker 会构建镜像，这可能需要几分钟时间。

### 4. 查看服务状态

```bash
docker-compose ps
```

### 5. 访问应用

- 前端界面和API: http://localhost:8080
- API路径: http://localhost:8080/api

## 服务说明

### 前端服务 (frontend)

- 端口: 8080
- 基于 Nginx 提供静态文件服务
- 通过 Nginx 代理将 API 请求转发到后端服务

### 后端服务 (backend)

- 内部端口: 3000 (不对外暴露)
- 提供 RESTful API
- 连接到 MongoDB 数据库

### MongoDB 数据库 (mongodb)

- 内部端口: 27017 (不对外暴露)
- 数据持久化存储在 Docker 卷中

## 架构说明

本项目采用了以下架构设计：

1. 所有服务通过 Docker 网络 `app-network` 相互通信
2. 只有前端服务的端口 (8080) 对外暴露
3. 后端和数据库服务仅在内部网络中可访问，提高安全性
4. 前端 Nginx 服务器配置为代理 API 请求到后端服务
5. 所有服务都配置了健康检查，确保服务可用性

## 常用命令

### 启动所有服务

```bash
docker-compose up -d
```

### 查看日志

```bash
# 查看所有服务的日志
docker-compose logs

# 查看特定服务的日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# 实时查看日志
docker-compose logs -f
```

### 重启服务

```bash
docker-compose restart
```

### 停止服务

```bash
docker-compose down
```

### 停止服务并删除数据卷（慎用！）

```bash
docker-compose down -v
```

## 故障排除

### 服务无法启动

1. 检查端口冲突：确保 8080 端口未被其他应用占用
2. 检查 Docker 日志：`docker-compose logs`
3. 检查磁盘空间：`df -h`

### 前端无法连接后端

1. 检查后端服务是否正常运行：`docker-compose ps`
2. 检查后端日志：`docker-compose logs backend`
3. 检查 Nginx 配置是否正确代理 API 请求

### 数据库连接问题

1. 检查 MongoDB 服务是否正常运行：`docker-compose ps`
2. 检查 MongoDB 日志：`docker-compose logs mongodb`
3. 确认后端环境变量 `MONGO_URI` 设置正确

## 生产环境部署注意事项

1. 修改 `JWT_SECRET` 为强密码
2. 配置 HTTPS (可通过在前端 Nginx 中添加 SSL 证书实现)
3. 限制 MongoDB 只接受内部网络连接 (已在当前配置中实现)
4. 配置适当的日志记录和监控
5. 设置数据库备份策略 