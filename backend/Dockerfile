FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# 安装所有依赖，包括 Swagger 相关的依赖
RUN npm install && \
    npm install koa2-swagger-ui js-yaml swagger-jsdoc

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"] 