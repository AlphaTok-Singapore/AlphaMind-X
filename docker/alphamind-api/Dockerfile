# AlphaMind API Dockerfile
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    libpq-dev \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# 复制 requirements 文件
COPY requirements.txt /app/requirements.txt

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get install -y netcat-openbsd

# 复制应用代码
COPY . /app/

# 设置执行权限
RUN chmod +x /app/entrypoint.sh

# 创建存储目录
RUN mkdir -p /app/storage

# 暴露端口
EXPOSE 8000

# 设置入口点
ENTRYPOINT ["/app/entrypoint.sh"]

