-- AlphaMind 数据库初始化脚本
-- 创建 AlphaMind 相关的数据库表和 n8n 数据库

-- 创建 n8n 数据库
CREATE DATABASE n8n;

-- 切换到 dify 数据库添加 AlphaMind 表
\c dify;

-- 创建 AlphaMind 智能体表
CREATE TABLE IF NOT EXISTS alphamind_agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'assistant',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    model VARCHAR(100) NOT NULL DEFAULT 'gpt-3.5-turbo',
    config JSONB DEFAULT '{}',
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建智能体配置索引
CREATE INDEX IF NOT EXISTS idx_alphamind_agents_user_id ON alphamind_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_alphamind_agents_status ON alphamind_agents(status);
CREATE INDEX IF NOT EXISTS idx_alphamind_agents_type ON alphamind_agents(type);

-- 创建 AlphaMind 对话表
CREATE TABLE IF NOT EXISTS alphamind_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    agent_id INTEGER REFERENCES alphamind_agents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建对话索引
CREATE INDEX IF NOT EXISTS idx_alphamind_conversations_user_id ON alphamind_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_alphamind_conversations_agent_id ON alphamind_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_alphamind_conversations_status ON alphamind_conversations(status);

-- 创建 AlphaMind 消息表
CREATE TABLE IF NOT EXISTS alphamind_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES alphamind_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    agent_id INTEGER REFERENCES alphamind_agents(id) ON DELETE SET NULL,
    workflow_triggered BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建消息索引
CREATE INDEX IF NOT EXISTS idx_alphamind_messages_conversation_id ON alphamind_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_alphamind_messages_agent_id ON alphamind_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_alphamind_messages_created_at ON alphamind_messages(created_at);

-- 创建 AlphaMind 数据集表
CREATE TABLE IF NOT EXISTS alphamind_datasets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'text',
    status VARCHAR(50) NOT NULL DEFAULT 'uploading',
    file_count INTEGER DEFAULT 0,
    size_bytes BIGINT DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建数据集索引
CREATE INDEX IF NOT EXISTS idx_alphamind_datasets_user_id ON alphamind_datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_alphamind_datasets_type ON alphamind_datasets(type);
CREATE INDEX IF NOT EXISTS idx_alphamind_datasets_status ON alphamind_datasets(status);

-- 创建 AlphaMind 工作流执行记录表
CREATE TABLE IF NOT EXISTS alphamind_workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR(255) NOT NULL,
    n8n_execution_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'running',
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    user_id UUID NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE
);

-- 创建工作流执行索引
CREATE INDEX IF NOT EXISTS idx_alphamind_workflow_executions_user_id ON alphamind_workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_alphamind_workflow_executions_workflow_id ON alphamind_workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_alphamind_workflow_executions_status ON alphamind_workflow_executions(status);

-- 创建 AlphaMind MCP 工具表
CREATE TABLE IF NOT EXISTS alphamind_mcp_tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    config JSONB DEFAULT '{}',
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建 MCP 工具索引
CREATE INDEX IF NOT EXISTS idx_alphamind_mcp_tools_user_id ON alphamind_mcp_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_alphamind_mcp_tools_category ON alphamind_mcp_tools(category);
CREATE INDEX IF NOT EXISTS idx_alphamind_mcp_tools_status ON alphamind_mcp_tools(status);

-- 创建 AlphaMind 用户设置表
CREATE TABLE IF NOT EXISTS alphamind_user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    theme VARCHAR(20) DEFAULT 'system',
    language VARCHAR(10) DEFAULT 'zh',
    default_model VARCHAR(100) DEFAULT 'gpt-3.5-turbo',
    api_keys JSONB DEFAULT '{}',
    notifications JSONB DEFAULT '{}',
    security_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户设置索引
CREATE INDEX IF NOT EXISTS idx_alphamind_user_settings_user_id ON alphamind_user_settings(user_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加更新时间触发器
CREATE TRIGGER update_alphamind_agents_updated_at 
    BEFORE UPDATE ON alphamind_agents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alphamind_conversations_updated_at 
    BEFORE UPDATE ON alphamind_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alphamind_datasets_updated_at 
    BEFORE UPDATE ON alphamind_datasets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alphamind_mcp_tools_updated_at 
    BEFORE UPDATE ON alphamind_mcp_tools 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alphamind_user_settings_updated_at 
    BEFORE UPDATE ON alphamind_user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO alphamind_agents (name, description, type, status, model, config, user_id) VALUES
('通用助手', '帮助用户处理各种日常任务和问题', 'assistant', 'active', 'gpt-3.5-turbo', 
 '{"temperature": 0.7, "max_tokens": 2048, "system_prompt": "你是一个有用的AI助手。"}', 
 '00000000-0000-0000-0000-000000000001'),
('数据分析师', '专业的数据分析和可视化智能体', 'analyst', 'active', 'gpt-4', 
 '{"temperature": 0.3, "max_tokens": 4096, "system_prompt": "你是一个专业的数据分析师。"}', 
 '00000000-0000-0000-0000-000000000001'),
('内容创作者', '创意写作和内容生成专家', 'creator', 'inactive', 'gpt-3.5-turbo', 
 '{"temperature": 0.9, "max_tokens": 2048, "system_prompt": "你是一个创意写作专家。"}', 
 '00000000-0000-0000-0000-000000000001'),
('工作流执行器', '自动化任务执行和流程管理', 'workflow', 'training', 'gpt-4', 
 '{"temperature": 0.5, "max_tokens": 4096, "system_prompt": "你是一个工作流自动化专家。"}', 
 '00000000-0000-0000-0000-000000000001');

-- 插入示例数据集
INSERT INTO alphamind_datasets (name, description, type, status, file_count, size_bytes, user_id) VALUES
('客户反馈数据', '收集的客户反馈和评价数据', 'text', 'completed', 1250, 47185920, '00000000-0000-0000-0000-000000000001'),
('产品图片库', '产品展示图片和宣传素材', 'image', 'completed', 890, 2254857830, '00000000-0000-0000-0000-000000000001'),
('培训视频', '员工培训和教学视频资料', 'video', 'processing', 45, 9328025600, '00000000-0000-0000-0000-000000000001'),
('会议录音', '重要会议的录音文件', 'audio', 'completed', 156, 1288490188, '00000000-0000-0000-0000-000000000001');

-- 插入示例 MCP 工具
INSERT INTO alphamind_mcp_tools (name, description, category, version, status, user_id) VALUES
('文件处理器', '处理各种文件格式的工具', 'file', '1.0.0', 'installed', '00000000-0000-0000-0000-000000000001'),
('数据可视化', '生成图表和可视化的工具', 'visualization', '2.1.0', 'installed', '00000000-0000-0000-0000-000000000001'),
('API 连接器', '连接外部 API 的工具', 'integration', '1.5.0', 'available', '00000000-0000-0000-0000-000000000001'),
('代码执行器', '执行代码片段的工具', 'development', '3.0.0', 'installed', '00000000-0000-0000-0000-000000000001');

-- 插入示例用户设置
INSERT INTO alphamind_user_settings (user_id, theme, language, default_model, notifications) VALUES
('00000000-0000-0000-0000-000000000001', 'system', 'zh', 'gpt-3.5-turbo', 
 '{"email": true, "browser": true, "workflow_completion": true, "agent_errors": true, "system_updates": false}');

-- 创建视图：智能体统计
CREATE OR REPLACE VIEW alphamind_agent_stats AS
SELECT 
    a.id,
    a.name,
    a.type,
    a.status,
    COUNT(DISTINCT c.id) as conversation_count,
    COUNT(m.id) as message_count,
    COALESCE(AVG(CASE WHEN m.role = 'assistant' THEN 1.0 ELSE 0.0 END) * 100, 0) as success_rate,
    MAX(m.created_at) as last_used
FROM alphamind_agents a
LEFT JOIN alphamind_conversations c ON a.id = c.agent_id
LEFT JOIN alphamind_messages m ON c.id = m.conversation_id
GROUP BY a.id, a.name, a.type, a.status;

-- 创建视图：用户活动统计
CREATE OR REPLACE VIEW alphamind_user_activity AS
SELECT 
    user_id,
    COUNT(DISTINCT agent_id) as active_agents,
    COUNT(DISTINCT id) as total_conversations,
    MAX(updated_at) as last_activity
FROM alphamind_conversations
WHERE status = 'active'
GROUP BY user_id;

-- 授权
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- 完成初始化
SELECT 'AlphaMind database initialization completed successfully!' as status;

