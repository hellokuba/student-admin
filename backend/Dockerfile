FROM node:18-alpine

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装所有依赖
RUN npm install && \
    npm install koa2-swagger-ui js-yaml swagger-jsdoc

# 复制项目文件
COPY . .

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "run", "start"] 