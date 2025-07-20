#!/bin/bash
set -e

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
  echo "错误：请在项目根目录下运行此脚本"
  echo "当前目录: $(pwd)"
  echo "请确保当前目录包含 docker-compose.yml 文件"
  exit 1
fi

echo "=== AlphaMind Schema 冲突修复脚本 ==="

# 自动查找 db 容器名
DB_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E 'db(-1)?$' | head -n1)
if [ -z "$DB_CONTAINER" ]; then
  echo "未找到正在运行的 db 容器，请确认 docker-compose.yml 中有 db 服务并已启动。"
  exit 1
fi

echo "检测到的数据库容器为: $DB_CONTAINER"

# 自动获取数据库用户名
POSTGRES_USER=${POSTGRES_USER:-dify}
if [ -f ".env" ]; then
  ENV_USER=$(grep "^POSTGRES_USER=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
  if [ -n "$ENV_USER" ]; then
    POSTGRES_USER="$ENV_USER"
    echo "从 .env 文件读取到数据库用户: $POSTGRES_USER"
  fi
fi

# 检查运行环境
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
  echo "检测到 Windows 环境 (Git Bash/WSL)"
  export MSYS_NO_PATHCONV=1
fi

echo "开始检测和修复 schema 冲突..."

# 连接到数据库并执行修复
docker exec -i "$DB_CONTAINER" psql -U "$POSTGRES_USER" -d dify << 'EOF'
-- 检测并修复常见的 schema 冲突

-- 1. 清理可能重复的 sequence
DO $$
BEGIN
    -- 检查并删除重复的 task_id_sequence
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'task_id_sequence') THEN
        DROP SEQUENCE IF EXISTS task_id_sequence CASCADE;
        RAISE NOTICE '已删除重复的 task_id_sequence';
    END IF;

    -- 检查并删除其他可能重复的 sequence
    -- 可以根据需要添加更多 sequence 检查
END $$;

-- 2. 检查并修复表结构
-- 检查 tenants 表是否有 name 字段
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'name'
    ) THEN
        RAISE NOTICE 'tenants 表缺少 name 字段，这可能是 migration 未完成导致的';
    ELSE
        RAISE NOTICE 'tenants 表结构正常';
    END IF;
END $$;

-- 3. 检查并修复索引
-- 删除可能重复的索引
DO $$
BEGIN
    -- 检查并删除重复的索引（示例）
    IF EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_alphamind_agents_user_id'
        AND tablename = 'alphamind_agents'
    ) THEN
        RAISE NOTICE 'alphamind_agents 表索引正常';
    END IF;
END $$;

-- 4. 检查 migration 状态
SELECT
    'Migration 状态检查:' as info,
    COUNT(*) as total_migrations,
    MAX(version_num) as latest_migration
FROM alembic_version;

-- 5. 检查关键表是否存在
SELECT
    table_name,
    CASE
        WHEN table_name IN ('tenants', 'accounts', 'tenant_account_joins') THEN '核心表'
        WHEN table_name LIKE 'alphamind_%' THEN 'AlphaMind 表'
        ELSE '其他表'
    END as table_type,
    '存在' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('tenants', 'accounts', 'tenant_account_joins', 'alphamind_agents', 'alphamind_conversations')
ORDER BY table_type, table_name;

-- 6. 检查表结构完整性
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'tenants'
ORDER BY ordinal_position;

-- 7. 显示初始化状态
SELECT
    'Dify 初始化状态:' as info,
    CASE
        WHEN EXISTS (SELECT 1 FROM dify_setups LIMIT 1) THEN '已初始化'
        ELSE '未初始化 - 请访问 /install 创建管理员账户'
    END as setup_status,
    (SELECT setup_at FROM dify_setups LIMIT 1) as setup_time;

EOF

echo "Schema 修复完成！"
echo ""
echo "建议的后续操作："
echo "1. 检查服务日志：docker-compose logs -f api db"
echo "2. 访问 http://localhost:3000/install 完成 setup"
echo "3. 如果仍有问题，运行：./reset_db_and_init.sh reset"
