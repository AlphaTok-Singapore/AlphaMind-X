#!/bin/bash

# AlphaMind 快速部署脚本
# 这是一个简化的部署脚本，调用统一的 setup.sh

echo "🚀 AlphaMind 快速部署"
echo ""

# 检查 setup.sh 是否存在
if [ ! -f "./setup.sh" ]; then
    echo "❌ 错误: setup.sh 文件不存在"
    echo "请确保在项目根目录下运行此脚本"
    exit 1
fi

# 给 setup.sh 执行权限
chmod +x setup.sh

# 调用统一的设置脚本
echo "📋 执行统一设置脚本..."
./setup.sh "$@"

echo ""
echo "✅ 部署完成！"
echo ""
echo "📖 更多信息请查看: docs/QUICK_START.md"
