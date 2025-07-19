# Dify Web Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache \
    git \
    curl

RUN npm install -g pnpm

# 复制 package 文件
COPY package*.json pnpm-lock.yaml ./
ENV NODE_ENV=development
RUN pnpm install

# 复制应用代码
COPY ./ ./

# 关键：加大 Node 构建内存限制
ENV NODE_OPTIONS="--max-old-space-size=4096"

# 构建应用
# 暴露端口
EXPOSE 3000

# 启动开发服务器，绑定到 0.0.0.0 以便主机访问
CMD ["pnpm", "dev", "--", "--hostname", "0.0.0.0"]

