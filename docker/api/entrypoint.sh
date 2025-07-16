#!/bin/bash
set -e

# 等待数据库启动
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is ready!"

# 等待 Redis 启动
echo "Waiting for Redis..."
while ! nc -z redis 6379; do
  sleep 1
done
echo "Redis is ready!"

# 运行数据库迁移
echo "Running database migrations..."
flask db upgrade || echo "Migration failed or not needed"

# 根据 MODE 环境变量启动不同服务
if [ "$MODE" = "worker" ]; then
    echo "Starting Celery worker..."
    exec celery -A app.celery worker --loglevel=info
elif [ "$MODE" = "api" ]; then
    echo "Starting Dify API server..."
    exec gunicorn --bind 0.0.0.0:5001 --workers 4 --timeout 120 app:app
else
    echo "Unknown MODE: $MODE"
    exit 1
fi

