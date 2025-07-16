FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache git curl

RUN npm install -g pnpm

COPY package*.json ./
RUN pnpm install

COPY . .

# 关键：加大 Node 构建内存限制
ENV NODE_OPTIONS="--max-old-space-size=4096"

EXPOSE 3000

CMD ["pnpm", "dev"]
