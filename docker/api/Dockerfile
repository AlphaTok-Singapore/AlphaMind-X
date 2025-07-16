# Dify API Dockerfile
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    libpq-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# 复制应用代码
COPY api/ /app/
COPY docker/api/entrypoint.sh /app/entrypoint.sh

# 设置执行权限
RUN chmod +x /app/entrypoint.sh

# 创建存储目录
RUN mkdir -p /app/storage

# 暴露端口
EXPOSE 5001

# 设置入口点
ENTRYPOINT ["/app/entrypoint.sh"]

