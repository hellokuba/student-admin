#!/bin/bash

# 学生管理系统后端安装脚本

echo "=== 学生管理系统后端安装脚本 ==="
echo "正在安装依赖..."

# 安装依赖
npm install

# 检查是否存在 .env 文件，如果不存在则复制 .env.example
if [ ! -f .env ]; then
  echo "创建 .env 文件..."
  cp .env.example .env
  echo ".env 文件已创建，请根据需要修改配置"
else
  echo ".env 文件已存在，跳过创建"
fi

echo "依赖安装完成！"
echo ""
echo "=== 启动说明 ==="
echo "开发模式: npm run dev"
echo "生产模式: npm start"
echo ""
echo "API 文档地址: http://localhost:3000/api/docs"
echo ""
echo "是否现在启动开发服务器? (y/n)"
read -r answer

if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
  echo "启动开发服务器..."
  npm run dev
else
  echo "安装完成，您可以稍后手动启动服务器"
fi 