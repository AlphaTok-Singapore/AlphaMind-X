# AlphaMind 超简单部署指南

> 🚀 **已验证**：部署脚本完全正常工作，一键部署即可！

## 快速开始

### 环境要求
- Docker 20.10+
- Docker Compose 2.0+
- Git

### 一键部署

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd AlphaMind

# 2. 一键部署（就是这么简单！）
./setup.sh dev
```

### 访问服务
- **前端**：http://localhost:3000
- **API**：http://localhost:5001
- **数据库**：localhost:5432

---

## 验证结果

✅ **最新验证**：2025-07-19 09:23  
✅ **验证环境**：Windows 10 + Git Bash  
✅ **验证结果**：完全成功

### 验证项目
- ✅ Docker 环境检查
- ✅ 服务启动（15个服务全部正常）
- ✅ 数据库迁移
- ✅ API 服务验证
- ✅ 前端服务验证
- ✅ 数据库结构检查
- ✅ 日志查看功能

---

## 常见问题

### 1. alembic.ini 文件不存在

**问题**：部署时出现 `[ERROR] alembic.ini 文件不存在`

**解决方案**：
```bash
# 重新构建 API 容器
docker-compose build api

# 重启 API 服务
docker-compose up -d api

# 重新部署
./deploy.sh dev
```

### 2. 端口被占用

**问题**：`Bind for 0.0.0.0:3000 failed: port is already allocated`

**解决方案**：
```bash
# 检查端口占用
netstat -an | findstr :3000
netstat -an | findstr :5001

# 停止占用端口的进程
# Windows: 使用任务管理器或命令行
# Linux: kill -9 <PID>
```

### 3. Docker Compose 日志错误

**问题**：`docker-compose logs` 返回 500 Internal Server Error

**错误信息**：
```
request returned 500 Internal Server Error for API route and version http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/containers/json
```

**解决方案**：
```bash
# 推荐方法：使用 --no-log-prefix 参数
docker-compose logs --no-log-prefix

# 替代方法：直接使用 docker logs
docker logs alphamind-api-1 --tail 20
docker logs alphamind-web-1 --tail 20
docker logs alphamind-db-1 --tail 10

# 实时跟踪日志
docker logs -f alphamind-api-1
```

### 4. 数据库连接问题

**问题**：数据库连接失败或迁移错误

**解决方案**：
```bash
# 检查数据库状态
docker-compose ps db

# 查看数据库日志
docker logs alphamind-db-1

# 重置数据库
./reset_db_and_init.sh
```

---

## 日志查看

### 推荐方法（避免 API 错误）
```bash
# 查看所有服务日志
docker-compose logs --no-log-prefix

# 查看特定服务日志
docker logs alphamind-api-1 --tail 20
docker logs alphamind-web-1 --tail 20
docker logs alphamind-db-1 --tail 10

# 实时跟踪日志
docker logs -f alphamind-api-1
```

### 传统方法（可能遇到 API 错误）
```bash
# 查看所有日志
docker-compose logs

# 查看特定服务日志
docker-compose logs api
docker-compose logs web
docker-compose logs db

# 实时跟踪
docker-compose logs -f
```

---

## 服务管理

### 启动服务
```bash
# 启动所有服务
docker-compose up -d

# 启动特定服务
docker-compose up -d api
docker-compose up -d web
```

### 停止服务
```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart api
docker-compose restart web
```

### 查看服务状态
```bash
# 查看所有服务状态
docker-compose ps

# 查看资源使用情况
docker stats
```

---

## 故障排除

### 1. 服务无法启动
```bash
# 检查服务状态
docker-compose ps

# 查看错误日志
docker logs alphamind-api-1
docker logs alphamind-web-1

# 重新构建并启动
docker-compose build
docker-compose up -d
```

### 2. 数据库问题
```bash
# 检查数据库状态
docker-compose ps db

# 查看数据库日志
docker logs alphamind-db-1

# 重置数据库
./reset_db_and_init.sh
```

### 3. 前端无法访问
```bash
# 检查前端服务
docker-compose ps web

# 查看前端日志
docker logs alphamind-web-1

# 重新构建前端
docker-compose build web
docker-compose up -d web
```

### 4. API 调用失败
```bash
# 检查 API 服务
docker-compose ps api

# 查看 API 日志
docker logs alphamind-api-1

# 测试 API 连接
curl http://localhost:5001/health
```

---

## 性能监控

### 资源使用
```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
docker system df
```

### 健康检查
```bash
# API 健康检查
curl http://localhost:5001/health

# 前端健康检查
curl http://localhost:3000
```

---

## 最佳实践

1. **部署前检查**：
   - 确保 Docker Desktop 正在运行
   - 检查端口占用情况
   - 验证 .env 文件配置

2. **日志管理**：
   - 使用 `--no-log-prefix` 参数避免 API 错误
   - 定期清理日志文件
   - 监控关键服务的日志

3. **故障排除**：
   - 先检查服务状态
   - 查看相关服务日志
   - 使用故障排除脚本

4. **备份策略**：
   - 生产环境自动备份
   - 定期手动备份
   - 测试恢复流程

---

## 总结

**部署真的就是这么简单！**

```bash
# 进入脚本目录
cd docs/scripts

# 一键部署
./setup.sh dev

# 查看日志
./setup.sh logs

# 查看状态
cd docs/scripts
./setup.sh status

# 重置数据库
cd docs/scripts
./setup.sh reset

# 清理所有
cd docs/scripts
./setup.sh clean

# 运行测试
cd docs/scripts
./setup.sh test
```

所有问题都已经在文档中提供了解决方案，团队可以放心使用！

---

**最后更新**：2025-07-19  
**版本**：v2.1  
**维护者**：AlphaMind 开发团队 
