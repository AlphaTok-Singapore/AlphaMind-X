FROM node:22-alpine

WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache git curl

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package 文件和锁文件
COPY package*.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install

# 复制应用代码
COPY ./ ./

# 增加 Node 构建内存限制
ENV NODE_OPTIONS="--max-old-space-size=4096"

EXPOSE 3000

# 启动 Next.js 开发服务器并绑定所有接口
CMD ["pnpm", "dev", "--", "-H", "0.0.0.0"]
