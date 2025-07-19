# AlphaMind 部署包清单

## 📦 部署包内容

这个部署包包含了完整的 AlphaMind 项目，可以在任何支持 Docker 的机器上快速部署。

### 🎯 核心文件

#### 主要脚本 (项目根目录)
- ✅ `setup.sh` - 统一设置脚本（主要部署工具）
- ✅ `deploy.sh` - 兼容性部署脚本
- ✅ `docker-compose.yml` - Docker 服务配置
- ✅ `.env.example` - 环境变量示例

#### 文档文件 (docs/)
- ✅ `README.md` - 项目主文档
- ✅ `QUICK_START.md` - 快速开始指南
- ✅ `INSTALL.md` - 安装指南
- ✅ `DEPLOYMENT_PACKAGE.md` - 部署包清单
- ✅ `troubleshooting.md` - 故障排除指南

#### 配置文件
- ✅ `web/next.config.js` - Next.js 配置（已优化）
- ✅ `web/package.json` - 前端依赖（已更新）
- ✅ `api/` - 后端 API 代码
- ✅ `web/` - 前端 Web 代码

### 🚀 快速部署步骤

#### 1. 下载部署包
```bash
# 从 GitHub 克隆
git clone <your-repo-url>
cd AlphaMind
```

#### 2. 一键部署
```bash
# 给脚本执行权限
chmod +x setup.sh

# 一键部署
./setup.sh dev
```

#### 3. 验证部署
```bash
# 运行测试验证
./setup.sh test

# 查看服务状态
./setup.sh status
```

### 🔐 默认账户

- **邮箱**: `test@example.com`
- **密码**: `test123456`

### 🌐 访问地址

- **前端界面**: http://localhost:3000
- **API 服务**: http://localhost:5001
- **登录页面**: http://localhost:3000/signin
- **AlphaMind**: http://localhost:3000/alphamind

## 📋 管理命令

### 基本操作
```bash
# 开发环境部署
./setup.sh dev

# 生产环境部署
./setup.sh prod

# 重置数据库
./setup.sh reset

# 清理所有数据
./setup.sh clean
```

### 监控命令
```bash
# 查看服务状态
./setup.sh status

# 查看服务日志
./setup.sh logs

# 运行测试验证
./setup.sh test

# 显示帮助信息
./setup.sh help
```

## 🔧 环境要求

### 最低要求
- **CPU**: 2 核心
- **内存**: 4GB RAM
- **存储**: 10GB 可用空间
- **系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

### 推荐配置
- **CPU**: 4+ 核心
- **内存**: 8GB+ RAM
- **存储**: 20GB+ 可用空间
- **Docker**: 20.10+
- **Docker Compose**: 2.0+

### 软件要求
- ✅ Docker Desktop (Windows/macOS)
- ✅ Docker Engine (Linux)
- ✅ Docker Compose
- ✅ Git

## 🧪 验证清单

### 部署前检查
- [ ] Docker 已安装并运行
- [ ] Docker Compose 已安装
- [ ] 端口 3000, 5001 未被占用
- [ ] 有足够的磁盘空间

### 部署后验证
- [ ] 所有服务正常启动
- [ ] 数据库迁移成功
- [ ] 默认测试账户可用
- [ ] 前端界面可访问
- [ ] API 服务正常响应
- [ ] 登录功能正常

### 性能验证
- [ ] 页面加载时间 < 5秒
- [ ] API 响应时间 < 2秒
- [ ] 内存使用率 < 80%
- [ ] CPU 使用率 < 70%

## 🔄 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 检查端口占用
netstat -an | findstr :3000
netstat -an | findstr :5001

# 解决方案
# Windows: 使用任务管理器停止占用进程
# Linux: kill -9 <PID>
```

#### 2. Docker 环境问题
```bash
# 检查 Docker 状态
docker info

# 重启 Docker
# Windows: 重启 Docker Desktop
# Linux: sudo systemctl restart docker
```

#### 3. 内存不足
```bash
# 检查内存使用
docker stats

# 增加 Docker 内存限制
# Windows: Docker Desktop 设置
# Linux: 修改 /etc/docker/daemon.json
```

#### 4. 数据库问题
```bash
# 重置数据库
./setup.sh reset

# 查看数据库日志
docker logs alphamind-db-1
```

## 📊 性能优化

### 资源配置（已优化）
- **Web 容器**: 12GB 内存，4 CPU 核心
- **Node.js**: 8GB 堆内存
- **数据库**: 2GB 内存
- **Redis**: 1GB 内存

### 监控命令
```bash
# 查看资源使用
./setup.sh status

# 实时监控
docker stats

# 查看日志
./setup.sh logs
```

## 📚 文档结构

```
AlphaMind/
├── README.md                           # 项目主文档（原始）
├── setup.sh                           # 统一设置脚本
├── deploy.sh                          # 兼容性部署脚本
├── docker-compose.yml                 # Docker 服务配置
├── .env.example                       # 环境变量示例
├── docs/
│   ├── DEPLOY.md                      # 快速部署指南
│   ├── INSTALL.md                     # 安装指南
│   ├── DEPLOYMENT_PACKAGE.md         # 部署包清单
│   ├── QUICK_START.md                # 快速开始指南
│   ├── troubleshooting.md            # 故障排除指南
│   └── README.md                     # 详细说明文档
├── api/                               # 后端 API 代码
├── web/                               # 前端 Web 代码
└── docker/                            # Docker 相关文件
```

## 🎯 部署包特点

### ✅ 已验证
- 在 Windows 10 + Git Bash 环境下完全测试
- 所有功能正常工作
- 性能优化已完成
- 故障排除方案完善

### ✅ 自动化程度高
- 一键部署
- 自动环境检查
- 自动数据库迁移
- 自动账户设置
- 自动服务验证

### ✅ 用户友好
- 彩色输出
- 详细状态信息
- 清晰错误提示
- 完整帮助信息

### ✅ 健壮性强
- 完善的错误处理
- 兼容多操作系统
- 支持多种部署环境
- 详细的故障排除指南

## 📞 支持信息

### 获取帮助
1. 查看 [快速开始指南](QUICK_START.md)
2. 运行 `./setup.sh test` 进行诊断
3. 查看 [故障排除指南](troubleshooting.md)

### 联系信息
- **项目地址**: GitHub 仓库
- **文档地址**: docs/ 目录
- **问题反馈**: GitHub Issues

---

**部署包版本**: v2.1  
**最后更新**: 2025-07-19  
**维护者**: AlphaMind 开发团队 

## ✅ 优化后的 `docs/scripts` 目录结构

### 📋 当前内容：
```
docs/scripts/
├── setup.sh              # 主部署脚本 (11,997 字节, 441 行)
└── deploy.sh             # 快速部署脚本 (566 字节, 26 行)
```

### 🎯 文件唯一性策略：

1. **配置文件保持唯一**：
   - `docker-compose.yml` → 只在项目根目录
   - `.env.example` → 只在项目根目录

2. **脚本文件在 docs/scripts**：
   - `setup.sh` → 部署脚本
   - `deploy.sh` → 快速部署包装器

### 🎯 用户使用指南：

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd AlphaMind

# 2. 复制配置文件（如果需要）
cp .env.example .env
# 编辑 .env 文件

# 3. 运行部署脚本
cd docs/scripts
chmod +x setup.sh deploy.sh
./setup.sh dev

# 或者使用快速部署
./deploy.sh dev
```

### 📝 文档更新建议：

在 `docs/README.md` 中可以这样说明：

```markdown
## 🚀 快速部署

### 一键部署（推荐）

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd AlphaMind

# 2. 配置环境变量（可选）
cp .env.example .env
# 编辑 .env 文件

# 3. 一键部署
cd docs/scripts
chmod +x setup.sh
./setup.sh dev
```
```

这样的结构更加清晰，避免了文件重复，用户也能清楚地知道配置文件在根目录，脚本在 `docs/scripts` 目录。 
