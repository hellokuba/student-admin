#!/bin/bash

# 学生管理系统前端部署脚本

# 显示彩色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== 学生管理系统前端部署脚本 =====${NC}"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装. 请先安装 Docker.${NC}"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}错误: Docker Compose 未安装. 请先安装 Docker Compose.${NC}"
    exit 1
fi

# 停止并移除现有容器
echo -e "${YELLOW}停止并移除现有容器...${NC}"
docker-compose down

# 拉取最新代码（如果是从 Git 仓库部署）
if [ -d ".git" ]; then
    echo -e "${YELLOW}拉取最新代码...${NC}"
    git pull
fi

# 构建并启动容器
echo -e "${YELLOW}构建并启动容器...${NC}"
docker-compose up -d --build

# 检查容器状态
echo -e "${YELLOW}检查容器状态...${NC}"
docker-compose ps

echo -e "${GREEN}部署完成!${NC}"
echo -e "${GREEN}应用现已在 http://localhost 上运行${NC}" 