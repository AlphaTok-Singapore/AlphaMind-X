# AlphaMind Web Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache \
    git \
    curl

# 复制 package 文件
COPY package*.json ./

# 安装依赖 (开发模式，安装全部依赖)
RUN npm install

# 复制应用代码
COPY . ./

# 暴露端口
EXPOSE 3000

# 启动应用（开发模式）
CMD ["npm", "run", "dev"]

