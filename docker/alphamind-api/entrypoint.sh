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

# 初始化数据库表（如果需要）
echo "Initializing AlphaMind database tables..."
python -c "
import sys
sys.path.append('/app')
from main import create_app, db
app = create_app()
with app.app_context():
    db.create_all()
    print('Database tables created successfully!')
" || echo "Database initialization failed or not needed"

echo "Starting AlphaMind API server..."
exec gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 120 main:app

