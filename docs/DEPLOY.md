# AlphaMind 快速部署

## 🚀 一键部署

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd AlphaMind

# 2. 一键部署
chmod +x setup.sh
./setup.sh dev
```

## 🔐 登录信息

- **地址**: http://localhost:3000/signin
- **邮箱**: `test@example.com`
- **密码**: `test123456`

## 📚 详细文档

- [📖 安装指南](INSTALL.md) - 完整的安装步骤
- [📦 部署包清单](DEPLOYMENT_PACKAGE.md) - 详细的部署包说明
- [🚀 快速开始](QUICK_START.md) - 快速开始指南
- [🔧 故障排除](troubleshooting.md) - 常见问题解决

## 📋 常用命令

```bash
# 查看服务状态
./setup.sh status

# 查看服务日志
./setup.sh logs

# 重置数据库
./setup.sh reset

# 运行测试
./setup.sh test

# 显示帮助
./setup.sh help
```

---

**部署完成！** 🎉 
