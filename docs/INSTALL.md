# AlphaMind 安装指南

## 🚀 快速安装

### 步骤 1: 准备环境

确保您的系统已安装：
- ✅ Docker Desktop (Windows/macOS) 或 Docker Engine (Linux)
- ✅ Git

### 步骤 2: 下载项目

```bash
# 克隆项目
git clone <your-repo-url>
cd AlphaMind
```

### 步骤 3: 一键部署

```bash
# 给脚本执行权限
chmod +x docs/scripts/setup.sh

# 开发环境部署（推荐）
./docs/scripts/setup.sh dev

# 或生产环境部署
./docs/scripts/setup.sh prod
```

### 步骤 4: 验证安装

```bash
# 运行测试验证
./docs/scripts/setup.sh test
```

## 🔐 登录系统

部署完成后，访问：
- **地址**: http://localhost:3000/signin
- **邮箱**: `test@example.com`
- **密码**: `test123456`

## 📋 常用命令

```bash
# 查看服务状态
./docs/scripts/setup.sh status

# 查看服务日志
./docs/scripts/setup.sh logs

# 重置数据库（会删除所有数据）
./docs/scripts/setup.sh reset

# 清理所有数据
./docs/scripts/setup.sh clean

# 显示帮助
./docs/scripts/setup.sh help
```

## 🔧 故障排除

### 如果遇到数据库问题
```bash
# 使用统一部署（推荐，保留数据）
./docs/scripts/setup.sh dev

# 或完全重置（会删除所有数据）
./docs/scripts/setup.sh reset
```

### 如果遇到其他问题
1. 运行 `./docs/scripts/setup.sh test` 进行诊断
2. 查看 [快速开始指南](QUICK_START.md)
3. 检查 [部署包清单](DEPLOYMENT_PACKAGE.md)

## 🎯 部署说明

### 统一数据库初始化
新的部署系统会自动处理：
- ✅ 标准数据库迁移
- ✅ upload_files 表结构修复
- ✅ tenants 表结构修复
- ✅ 重复 sequence 清理
- ✅ 数据库完整性验证

### 环境选择
- **`dev`**: 开发环境部署（推荐）
- **`prod`**: 生产环境部署
- **`reset`**: 重置数据库（会删除所有数据）

---

**安装完成！** 🎉 
