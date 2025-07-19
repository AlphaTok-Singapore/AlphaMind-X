# AlphaMind 故障排除指南

## 常见问题及解决方案

### 1. Docker Compose 日志 API 错误

**问题描述**：
```bash
docker-compose logs
# 返回 500 Internal Server Error
```

**解决方案**：
使用 `--no-log-prefix` 参数：
```bash
docker-compose logs --no-log-prefix
```

**原因**：Docker Desktop API 版本兼容性问题。

### 2. Next.js ChunkLoadError

**问题描述**：
```
Unhandled Runtime Error
ChunkLoadError: Loading chunk app/(commonLayout)/plugins/page failed.
```

**解决方案**：

1. **清除浏览器缓存**：
   - 按 `Ctrl+Shift+Delete`
   - 选择"所有时间"和"所有数据"
   - 点击"清除数据"

2. **重建前端容器**：
   ```bash
   docker-compose build web --no-cache
   docker-compose up -d web
   ```

3. **清除 Next.js 缓存**：
   ```bash
   docker exec alphamind-web-1 rm -rf .next
   docker-compose restart web
   ```

### 3. API 代理 404 错误

**问题描述**：
```
GET http://localhost:3000/console/api/workspaces/current/tool-provider/builtin/webscraper/icon 404 (Not Found)
```

**解决方案**：

1. **检查 Next.js 代理配置**：
   确保 `web/next.config.js` 和 `docker/alphamind-web/next.config.js` 中的代理规则正确：

   ```js
   async rewrites() {
     return [
       {
         source: '/api/alphamind/:path*',
         destination: 'http://alphamind-alphamind-api-1:8000/api/:path*',
       },
       {
         source: '/console/api/:path*',
         destination: 'http://alphamind-api-1:5001/console/api/:path*',
       },
       {
         source: '/api/:path*',
         destination: 'http://alphamind-api-1:5001/api/:path*',
       },
     ]
   }
   ```

2. **重新构建前端服务**：
   ```bash
   docker-compose build web
   docker-compose up -d web
   ```

### 4. API 代理 500 错误

**问题描述**：
```
GET http://localhost:3000/console/api/workspaces/current/tool-provider/builtin/webscraper/icon 500 (Internal Server Error)
```

**根本原因**：Next.js 代理配置中使用了 `localhost:5001`，但在 Docker 容器环境中应该使用容器名称。

**解决方案**：

1. **修复代理配置**：
   - 将 `localhost:5001` 改为 `alphamind-api-1:5001`
   - 将 `localhost:5100` 改为 `alphamind-alphamind-api-1:8000`

2. **更新环境变量**：
   ```js
   env: {
     NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://alphamind-api-1:5001',
     NEXT_PUBLIC_DIFY_API_URL: process.env.NEXT_PUBLIC_DIFY_API_URL || 'http://alphamind-api-1:5001',
   }
   ```

3. **清除缓存并重启**：
   ```bash
   docker exec alphamind-redis-1 redis-cli -a dify123456 FLUSHDB
   docker-compose build web
   docker-compose up -d web
   ```

4. **验证修复**：
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/console/api/workspaces/current/tool-provider/builtin/webscraper/icon
   # 应该返回 200
   ```

### 5. n8n Ollama 连接超时错误

**问题描述**：
```
Error: The connection timed out, consider setting the 'Retry on Fail' option in the node settings
Error code: rejected
Full message: read ETIMEDOUT
```

**根本原因**：n8n HTTP 请求节点的超时设置过短，或者 Ollama 模型加载时间较长。

**解决方案**：

1. **调整 n8n 节点设置**：
   - 在 HTTP 请求节点中启用 "Retry on Fail" 选项
   - 将超时时间从默认值增加到 30-60 秒
   - 建议设置为 60 秒

2. **验证 Ollama 服务状态**：
   ```bash
   # 检查 Ollama 服务
   netstat -an | findstr :11434
   
   # 检查可用模型
   curl -s http://localhost:11434/api/tags
   
   # 测试 API 连接
   curl -X POST http://localhost:11434/api/generate \
     -H "Content-Type: application/json" \
     -d '{"model":"qwen3:8b","prompt":"Hello","stream":false}'
   ```

3. **从 n8n 容器测试连接**：
   ```bash
   docker exec n8n wget --timeout=30 --post-data='{"model":"qwen3:8b","prompt":"Hello","stream":false}' --header='Content-Type:application/json' -O - http://host.docker.internal:11434/api/generate
   ```

4. **优化请求配置**：
   ```json
   {
     "model": "qwen3:8b",
     "prompt": "{{ $json.seoPrompt }}",
     "stream": false,
     "options": {
       "temperature": 0.7,
       "top_p": 0.9
     }
   }
   ```

### 6. 用户认证和工作空间问题

**问题描述**：API 返回 401 或 500 错误，可能是用户未正确关联到工作空间。

**解决方案**：

1. **检查用户状态**：
   ```bash
   docker exec alphamind-db-1 psql -U dify -d dify -c "
   SELECT a.id, a.email, a.created_at, taj.tenant_id, taj.role 
   FROM accounts a 
   LEFT JOIN tenant_account_joins taj ON a.id = taj.account_id 
   ORDER BY a.created_at DESC;"
   ```

2. **创建默认工作空间**：
   ```bash
   docker exec alphamind-db-1 psql -U dify -d dify -c "
   INSERT INTO tenants (id, name, created_at, updated_at) 
   VALUES ('00000000-0000-0000-0000-000000000001', 'Default Workspace', NOW(), NOW())
   ON CONFLICT (id) DO NOTHING;"
   ```

3. **关联所有用户到工作空间**：
   ```bash
   docker exec alphamind-db-1 psql -U dify -d dify -c "
   INSERT INTO tenant_account_joins (id, tenant_id, account_id, role, created_at, updated_at, current)
   SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001', id, 'owner', NOW(), NOW(), true
   FROM accounts
   WHERE id NOT IN (
       SELECT account_id FROM tenant_account_joins 
       WHERE tenant_id = '00000000-0000-0000-0000-000000000001' 
       AND account_id IS NOT NULL
   );"
   ```

## 诊断工具

### 1. 服务状态检查
```bash
# 检查所有服务状态
docker-compose ps

# 检查特定服务日志
docker logs alphamind-api-1 --tail 50
docker logs alphamind-web-1 --tail 50
```

### 2. 网络连接测试
```bash
# 测试容器间网络
docker exec alphamind-web-1 curl -v http://alphamind-api-1:5001/health

# 测试 DNS 解析
docker exec alphamind-web-1 nslookup alphamind-api-1

# 测试 Ollama 连接
docker exec n8n wget --timeout=10 -O - http://host.docker.internal:11434/api/generate
```

### 3. API 端点测试
```bash
# 测试直接 API 访问
curl http://localhost:5001/console/api/workspaces/current/tool-provider/builtin/webscraper/icon

# 测试前端代理
curl http://localhost:3000/console/api/workspaces/current/tool-provider/builtin/webscraper/icon

# 测试 Ollama API
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen3:8b","prompt":"Hello","stream":false}'
```

## 预防措施

1. **定期检查服务健康状态**
2. **监控错误日志**
3. **定期清理缓存**
4. **备份重要数据**
5. **使用版本控制管理配置**
6. **监控 Ollama 服务状态和性能**

## 联系支持

如果以上解决方案无法解决问题，请：
1. 收集完整的错误日志
2. 记录问题复现步骤
3. 提供系统环境信息
4. 联系开发团队

---

**最后更新**：2025-07-19  
**版本**：v2.1  
**维护者**：AlphaMind 开发团队
