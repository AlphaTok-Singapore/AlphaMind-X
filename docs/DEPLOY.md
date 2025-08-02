# AlphaMind 快速部署

## 🚀 一键部署

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd AlphaMind

# 2. 一键部署
chmod +x docs/scripts/setup.sh
./docs/scripts/setup.sh dev
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
./docs/scripts/setup.sh status

# 查看服务日志
./docs/scripts/setup.sh logs

# 重置数据库（会删除所有数据）
./docs/scripts/setup.sh reset

# 运行测试
./docs/scripts/setup.sh test

# 显示帮助
./docs/scripts/setup.sh help
```

## 🎯 部署选项

### 开发环境（推荐）
```bash
./docs/scripts/setup.sh dev
```
- ✅ 保留现有数据
- ✅ 增量更新
- ✅ 安全操作

### 生产环境
```bash
./docs/scripts/setup.sh prod
```
- ✅ 生产环境配置
- ✅ 性能优化
- ✅ 安全设置

### 重置数据库
```bash
./docs/scripts/setup.sh reset
```
- ⚠️ 删除所有数据
- ⚠️ 完全重新开始
- ⚠️ 仅用于开发环境

## 🔧 统一数据库初始化

新的部署系统会自动处理所有已知的数据库问题：
- ✅ 标准数据库迁移
- ✅ upload_files 表结构修复
- ✅ tenants 表结构修复
- ✅ 重复 sequence 清理
- ✅ 数据库完整性验证

---

**部署完成！** 🎉 
