# AlphaMind - AI 智能体工作流平台

AlphaMind 是一个基于 Dify 的 AI 智能体工作流平台，集成了 n8n 工作流引擎，提供可视化的 AI 应用构建和管理功能。

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

### 验证部署

```bash
# 运行测试验证
./setup.sh test
```

## 🔐 登录系统

部署完成后，需要先完成系统初始化：

### 首次使用初始化

Dify 系统首次部署需要创建管理员账户：

1. **访问初始化页面**: http://localhost:3000/install
2. **创建管理员账户**: 按照页面提示创建第一个管理员账户
3. **完成初始化**: 系统会自动完成初始化设置
4. **使用管理员账户登录**: 初始化完成后使用创建的管理员账户登录

### 访问地址
- **登录页面**: http://localhost:3000/signin
- **初始化页面**: http://localhost:3000/install

### 重要说明
- ⚠️ **首次部署必须创建管理员账户**，不能直接使用测试账户
- 🔧 **测试账户仅用于开发测试**，生产环境请使用管理员账户
- 📝 **管理员账户信息请妥善保存**，这是系统的主要管理账户

## 🌐 访问地址

### 主要界面
- 🏠 **主界面**: http://localhost:3000
- 🤖 **AlphaMind**: http://localhost:3000/alphamind
- 🔄 **n8n 工作流**: http://localhost:5678 (admin/admin123)
- 📊 **API 文档**: http://localhost:5001/docs

### AlphaMind 功能页面
- 💬 **智能对话**: http://localhost:3000/alphamind/chat
- 🤖 **智能体管理**: http://localhost:3000/alphamind/agents
- 📊 **数据管理**: http://localhost:3000/alphamind/data
- ⚙️ **系统设置**: http://localhost:3000/alphamind/settings

## 📋 管理命令

```bash
# 进入脚本目录
cd docs/scripts

# 基本操作
./setup.sh dev      # 开发环境部署
./setup.sh prod     # 生产环境部署
./setup.sh reset    # 重置数据库
./setup.sh clean    # 清理所有数据

# 监控命令
./setup.sh status   # 查看服务状态
./setup.sh logs     # 查看服务日志
./setup.sh test     # 运行测试验证
./setup.sh help     # 显示帮助信息
```

## 🎯 主要功能

### AlphaMind 功能
- **智能对话**: 与 AI 智能体进行自然语言对话
- **智能体管理**: 创建、配置和管理 AI 智能体
- **数据处理**: 上传、处理和管理训练数据
- **工作流集成**: 与 n8n 工作流引擎集成
- **系统设置**: 配置集成和系统参数

### Dify 功能
- **应用构建**: 创建和管理 AI 应用
- **知识库**: 管理文档和知识库
- **API 管理**: 提供 RESTful API 接口
- **用户管理**: 用户认证和权限管理

### n8n 功能
- **工作流设计**: 可视化工作流编辑器
- **自动化**: 定时任务和事件触发
- **集成**: 连接各种第三方服务
- **Webhook**: 接收和处理 HTTP 请求

## 🔧 服务配置

### 端口分配
- **3000**: Dify Web 前端
- **5001**: Dify API 后端
- **5678**: n8n 工作流引擎
- **5432**: PostgreSQL 数据库
- **6379**: Redis 缓存
- **8080**: Weaviate 向量数据库

## 🔍 故障排除

如果遇到问题，请：
1. 运行 `./setup.sh test` 进行诊断
2. 查看 [快速开始指南](QUICK_START.md)
3. 查看 [故障排除指南](troubleshooting.md)

## 📚 详细文档

- [📖 安装指南](INSTALL.md) - 完整的安装步骤
- [📦 部署包清单](DEPLOYMENT_PACKAGE.md) - 详细的部署包说明
- [🚀 快速开始](QUICK_START.md) - 快速开始指南
- [🔧 故障排除](troubleshooting.md) - 常见问题解决

---

**部署完成！** 🎉

**最后更新**: 2025-07-19  
**版本**: v2.1  
**维护者**: AlphaMind 开发团队

