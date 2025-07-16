-- n8n 数据库初始化脚本
-- 文件路径: docker/db/init/02-n8n-init.sql

-- 创建 n8n 数据库
CREATE DATABASE n8n;

-- 授予权限
GRANT ALL PRIVILEGES ON DATABASE n8n TO dify;

-- 连接到 n8n 数据库并创建必要的扩展
\c n8n;

-- 创建 UUID 扩展 (n8n 需要)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建 pg_trgm 扩展 (用于文本搜索)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 设置默认权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dify;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dify;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO dify;

-- 输出确认信息
SELECT 'n8n database initialized successfully' AS status;

