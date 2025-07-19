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
chmod +x setup.sh

# 一键部署
./setup.sh dev
```

### 步骤 4: 验证安装

```bash
# 运行测试验证
./setup.sh test
```

## 🔐 登录系统

部署完成后，访问：
- **地址**: http://localhost:3000/signin
- **邮箱**: `test@example.com`
- **密码**: `test123456`

## 📋 常用命令

```bash
# 查看服务状态
./setup.sh status

# 查看服务日志
./setup.sh logs

# 重置数据库
./setup.sh reset

# 清理所有数据
./setup.sh clean

# 显示帮助
./setup.sh help
```

## 🔧 故障排除

如果遇到问题，请：
1. 运行 `./setup.sh test` 进行诊断
2. 查看 [快速开始指南](QUICK_START.md)
3. 检查 [部署包清单](DEPLOYMENT_PACKAGE.md)

---

**安装完成！** 🎉 
