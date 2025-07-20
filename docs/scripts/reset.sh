#!/bin/bash

# AlphaMind 数据库重置脚本
# 用于清理所有用户和租户数据，让系统回到初始状态

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 是否运行
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker 未运行，请启动 Docker"
        exit 1
    fi
}

# 检查服务是否运行
check_services() {
    if ! docker-compose ps | grep -q "alphamind-db-1"; then
        print_error "数据库服务未运行，请先启动服务"
        exit 1
    fi
}

# 重置数据库
reset_database() {
    print_info "开始重置数据库..."

    # 清理用户相关数据
    print_info "清理用户数据..."
    docker exec alphamind-db-1 psql -U dify -d dify -c "DELETE FROM tenant_account_joins;" 2>/dev/null || true
    docker exec alphamind-db-1 psql -U dify -d dify -c "DELETE FROM accounts;" 2>/dev/null || true

    # 清理租户数据
    print_info "清理租户数据..."
    docker exec alphamind-db-1 psql -U dify -d dify -c "DELETE FROM tenants;" 2>/dev/null || true

    # 清理初始化记录
    print_info "清理初始化记录..."
    docker exec alphamind-db-1 psql -U dify -d dify -c "DELETE FROM dify_setups;" 2>/dev/null || true

    print_success "数据库重置完成"
}

# 验证重置结果
verify_reset() {
    print_info "验证重置结果..."

    # 检查 API 状态
    print_info "检查 API 状态..."
    local setup_status=$(curl -s http://localhost:5001/console/api/setup 2>/dev/null || echo "API 不可用")
    echo "Setup API 响应: $setup_status"

    # 检查数据库表
    print_info "检查数据库表状态..."
    local account_count=$(docker exec alphamind-db-1 psql -U dify -d dify -t -c "SELECT COUNT(*) FROM accounts;" 2>/dev/null | tr -d ' \n' || echo "0")
    local tenant_count=$(docker exec alphamind-db-1 psql -U dify -d dify -t -c "SELECT COUNT(*) FROM tenants;" 2>/dev/null | tr -d ' \n' || echo "0")
    local setup_count=$(docker exec alphamind-db-1 psql -U dify -d dify -t -c "SELECT COUNT(*) FROM dify_setups;" 2>/dev/null | tr -d ' \n' || echo "0")

    echo "账户数量: $account_count"
    echo "租户数量: $tenant_count"
    echo "初始化记录数量: $setup_count"

    if [ "$account_count" = "0" ] && [ "$tenant_count" = "0" ] && [ "$setup_count" = "0" ]; then
        print_success "数据库重置验证成功"
    else
        print_warning "数据库重置可能不完整，请检查"
    fi
}

# 显示使用说明
show_usage() {
    echo ""
    echo "🎯 AlphaMind 数据库重置脚本"
    echo ""
    echo "📋 功能："
    echo "   清理所有用户、租户和初始化数据"
    echo "   让系统回到初始状态"
    echo ""
    echo "🔧 使用方法："
    echo "   $0          # 执行重置"
    echo "   $0 verify   # 验证重置结果"
    echo ""
    echo "⚠️  注意："
    echo "   此操作会删除所有用户数据！"
    echo "   重置后需要重新创建管理员账户"
    echo ""
}

# 主函数
main() {
    local action=${1:-reset}

    case $action in
        "reset")
            check_docker
            check_services
            reset_database
            verify_reset
            print_success "重置完成！"
            print_info "请访问 http://localhost:3000/install 创建管理员账户"
            ;;
        "verify")
            check_docker
            check_services
            verify_reset
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            print_error "未知参数: $action"
            show_usage
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
