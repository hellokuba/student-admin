# 学生管理系统 API 文档

本项目使用 Swagger 提供 API 文档，方便前后端开发连调。

## 访问 API 文档

启动服务后，可以通过以下地址访问 API 文档：

```
http://localhost:3000/api/docs
```

## 安装依赖

在使用 Swagger 文档前，请确保已安装相关依赖：

```bash
npm install
```

## 主要 API 分类

API 文档按以下几个主要模块进行分类：

1. **认证** - 用户登录、注册等认证相关接口
2. **用户管理** - 用户信息管理相关接口
3. **课程管理** - 课程创建、查询、更新、删除等接口
4. **成绩管理** - 学生成绩录入、查询等接口
5. **考勤管理** - 学生考勤记录相关接口

## 认证方式

大部分 API 需要 JWT 认证，请在登录后获取 token，并在后续请求中添加到 Authorization 头：

```
Authorization: Bearer {your_token}
```

## 响应格式

所有 API 响应均使用统一的 JSON 格式：

### 成功响应

```json
{
  "success": true,
  "data": {
    // 响应数据
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述信息"
  }
}
```

## 常见错误代码

- `UNAUTHORIZED`: 未授权访问
- `FORBIDDEN`: 权限不足
- `NOT_FOUND`: 资源不存在
- `BAD_REQUEST`: 请求参数错误
- `INTERNAL_ERROR`: 服务器内部错误

## 使用 Swagger UI 进行 API 测试

1. 访问 API 文档页面
2. 点击需要测试的 API
3. 点击 "Try it out" 按钮
4. 填写必要的参数
5. 点击 "Execute" 按钮发送请求
6. 查看响应结果

## 本地开发

如果需要修改 API 文档，可以编辑项目根目录下的 `swagger.yaml` 文件。 