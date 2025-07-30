# AlphaMind 性能优化指南

## 🚀 概述

本文档提供了 AlphaMind 应用的性能优化策略和最佳实践，帮助解决页面加载慢的问题。

## 📊 性能指标

### 目标指标
- **首屏加载时间**: < 3秒
- **交互响应时间**: < 100ms
- **API 响应时间**: < 2秒
- **内存使用**: < 8GB
- **CPU 使用率**: < 70%

### 监控工具
```bash
# 检查性能指标
npm run performance:check

# 分析打包大小
npm run analyze

# 清理缓存
npm run performance:clean
```

## 🔧 优化策略

### 1. 前端优化

#### 代码分割和懒加载
```typescript
// 懒加载组件
const Select = dynamic(() => import('react-select'), {
  ssr: false,
  loading: () => <LoadingSpinner />
})

// 懒加载页面
const WorkflowsPage = dynamic(() => import('./workflows/page'), {
  loading: () => <PageLoading />
})
```

#### React 性能优化
```typescript
// 使用 useMemo 优化计算
const modelOptions = useMemo(() => 
  PROVIDER_MODEL_MAP[provider] || [], 
  [provider]
)

// 使用 useCallback 优化事件处理
const handleSubmit = useCallback(async (e: React.FormEvent) => {
  // 处理逻辑
}, [dependencies])

// 使用 React.memo 优化组件渲染
const OptimizedComponent = React.memo(({ data }) => {
  return <div>{data}</div>
})
```

#### 状态管理优化
```typescript
// 使用 useMemo 优化初始状态
const initialState = useMemo(() => ({
  url: '',
  provider: 'Ollama',
  // ... 其他状态
}), [])

// 避免不必要的重新渲染
const [state, setState] = useState(initialState)
```

### 2. Next.js 配置优化

#### next.config.js 优化
```javascript
const nextConfig = {
  // 启用压缩
  compress: true,
  
  // 图片优化
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Webpack 优化
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    return config
  },
}
```

### 3. Docker 性能优化

#### 资源配置
```yaml
services:
  web:
    deploy:
      resources:
        limits:
          memory: 12G
          cpus: '4.0'
        reservations:
          memory: 6G
          cpus: '2.0'
    environment:
      NODE_OPTIONS: "--max-old-space-size=8192"
```

#### 构建优化
```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
```

### 4. 数据库优化

#### PostgreSQL 优化
```sql
-- 创建索引
CREATE INDEX idx_workflows_created_at ON workflows(created_at);
CREATE INDEX idx_workflows_user_id ON workflows(user_id);

-- 优化查询
EXPLAIN ANALYZE SELECT * FROM workflows WHERE user_id = ?;
```

#### Redis 缓存优化
```yaml
redis:
  command: redis-server --maxmemory 1gb --maxmemory-policy allkeys-lru
  deploy:
    resources:
      limits:
        memory: 1G
```

### 5. API 优化

#### 异步处理
```python
# 使用异步处理
async def process_workflow(data):
    # 异步处理逻辑
    result = await ai_model.process(data)
    return result

# 使用缓存
@cache(ttl=300)
def get_cached_data(key):
    return expensive_operation(key)
```

#### 连接池优化
```python
# 数据库连接池
DATABASE_CONFIG = {
    'pool_size': 20,
    'max_overflow': 30,
    'pool_timeout': 30,
    'pool_recycle': 3600,
}
```

## 🛠️ 性能监控

### 1. 实时监控
```bash
# 监控容器资源使用
docker stats

# 监控应用性能
npm run performance:check

# 监控 API 响应时间
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:5001/health"
```

### 2. 日志分析
```bash
# 查看应用日志
docker logs alphamind-web-1

# 查看 API 日志
docker logs alphamind-api-1

# 查看数据库日志
docker logs alphamind-db-1
```

### 3. 性能测试
```bash
# 运行性能测试
npm run test:performance

# 运行负载测试
npm run test:load

# 运行 E2E 测试
npm run e2e
```

## 🔍 故障排除

### 常见问题

#### 1. 内存泄漏
```bash
# 检查内存使用
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# 重启服务
docker-compose restart web
```

#### 2. 慢查询
```sql
-- 查看慢查询
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- 优化查询
EXPLAIN ANALYZE SELECT * FROM workflows WHERE created_at > NOW() - INTERVAL '1 day';
```

#### 3. 网络延迟
```bash
# 检查网络连接
ping localhost

# 检查端口占用
netstat -tulpn | grep :3000
```

### 性能调优步骤

1. **识别瓶颈**
   ```bash
   npm run performance:check
   ```

2. **清理缓存**
   ```bash
   npm run performance:clean
   ```

3. **优化构建**
   ```bash
   npm run performance:optimize
   ```

4. **重启服务**
   ```bash
   docker-compose restart
   ```

5. **验证优化**
   ```bash
   npm run performance:check
   ```

## 📈 性能基准

### 开发环境
- **冷启动时间**: < 30秒
- **热重载时间**: < 5秒
- **内存使用**: < 4GB

### 生产环境
- **首屏加载**: < 3秒
- **API 响应**: < 2秒
- **并发用户**: > 100

## 🎯 最佳实践

### 1. 代码优化
- 使用 `useMemo` 和 `useCallback` 优化 React 组件
- 实现懒加载减少初始包大小
- 使用 TypeScript 提高代码质量

### 2. 构建优化
- 启用代码分割
- 使用 SWC 压缩
- 优化图片和静态资源

### 3. 部署优化
- 使用多阶段 Docker 构建
- 配置适当的资源限制
- 启用健康检查

### 4. 监控优化
- 实时监控性能指标
- 设置告警阈值
- 定期性能审计

## 📚 参考资料

- [Next.js 性能优化](https://nextjs.org/docs/advanced-features/performance)
- [React 性能优化](https://react.dev/learn/render-and-commit)
- [Docker 性能调优](https://docs.docker.com/config/containers/resource_constraints/)
- [PostgreSQL 性能优化](https://www.postgresql.org/docs/current/performance.html)

---

**注意**: 定期运行性能检查并根据实际使用情况调整配置参数。 