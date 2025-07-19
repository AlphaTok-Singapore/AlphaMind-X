#!/bin/sh
set -e

# 兼容 Windows (Git Bash/WSL) 和 Linux
if command -v winpty >/dev/null 2>&1; then
  # Windows Git Bash 下用 winpty
  PSQL_CMD="winpty pg_isready"
else
  PSQL_CMD="pg_isready"
fi

# 等待 PostgreSQL 主库 ready
until $PSQL_CMD -h db -p 5432 -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

# 如有 dify_plugin 也需等待
until $PSQL_CMD -h db -p 5432 -U "${POSTGRES_USER}" -d "dify_plugin"; do
  echo "Waiting for dify_plugin DB..."
  sleep 2
done

# 初始化表（如有）
if [ -f /app/init_db.py ]; then
  python /app/init_db.py
fi

# 启动主服务
exec gunicorn --bind 0.0.0.0:8000 main:app

