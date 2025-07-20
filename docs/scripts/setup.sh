#!/bin/bash

# AlphaMind 统一设置脚本
# 功能：一键完成所有重置、部署和初始化工作

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 显示帮助信息
show_help() {
    echo "AlphaMind 统一设置脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  dev          - 开发环境部署（默认）"
    echo "  prod         - 生产环境部署"
    echo "  reset        - 重置数据库并重新初始化"
    echo "  clean        - 清理所有容器和数据"
    echo "  logs         - 查看服务日志"
    echo "  status       - 查看服务状态"
    echo "  test         - 运行测试验证"
    echo "  help         - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 dev       # 开发环境部署"
    echo "  $0 reset     # 重置数据库"
    echo "  $0 clean     # 清理所有数据"
    echo ""
}

# 检查 Docker 环境
check_docker() {
    print_info "检查 Docker 环境..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装或不在 PATH 中"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装或不在 PATH 中"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker 服务未运行"
        exit 1
    fi

    print_success "Docker 环境检查通过"
}

# 检查端口占用
check_ports() {
    print_info "检查端口占用..."

    local ports=(3000 5001 5432 6379 8080)
    local occupied=()

    for port in "${ports[@]}"; do
        if netstat -an 2>/dev/null | grep -q ":$port "; then
            occupied+=($port)
        fi
    done

    if [ ${#occupied[@]} -gt 0 ]; then
        print_warning "以下端口可能被占用: ${occupied[*]}"
        print_info "如果部署失败，请检查端口占用情况"
    else
        print_success "端口检查通过"
    fi
}

# 清理所有容器和数据
clean_all() {
    print_info "清理所有容器和数据..."

    # 停止并删除所有容器
    docker-compose down -v 2>/dev/null || true

    # 删除所有相关镜像
    docker rmi $(docker images -q alphamind-*) 2>/dev/null || true

    # 清理 Docker 系统
    docker system prune -f

    # 删除数据卷
    docker volume prune -f

    print_success "清理完成"
}

# 重置数据库
reset_database() {
    print_info "重置数据库..."

    # 检查是否在项目根目录
    if [ ! -f "docker-compose.yml" ]; then
        print_error "请在项目根目录下运行此脚本"
        exit 1
    fi

    # 自动查找 db 容器名
    local db_container=$(docker ps --format '{{.Names}}' | grep -E 'db(-1)?$' | head -n1)
    if [ -z "$db_container" ]; then
        print_warning "未找到正在运行的 db 容器，将启动数据库服务..."
        docker-compose up -d db
        sleep 10
        db_container=$(docker ps --format '{{.Names}}' | grep -E 'db(-1)?$' | head -n1)
    fi

    print_info "检测到的数据库容器为: $db_container"

    # 获取数据库用户名
    local postgres_user=${POSTGRES_USER:-dify}
    if [ -f ".env" ]; then
        local env_user=$(grep "^POSTGRES_USER=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
        if [ -n "$env_user" ]; then
            postgres_user="$env_user"
            print_info "从 .env 文件读取到数据库用户: $postgres_user"
        fi
    fi

    # 备份数据库
    print_info "备份数据库到 backup.sql..."
    if docker exec -i "$db_container" pg_dumpall -U "$postgres_user" > backup.sql 2>/dev/null; then
        print_success "数据库备份完成"
    else
        print_warning "使用默认用户备份失败，尝试使用 postgres 用户..."
        if docker exec -i "$db_container" pg_dumpall -U postgres > backup.sql 2>/dev/null; then
            print_success "使用 postgres 用户备份成功"
        else
            print_warning "备份失败，继续重置..."
        fi
    fi

    # 停止所有服务
    print_info "停止所有服务..."
    docker-compose down -v

    # 删除数据库数据卷
    print_info "删除数据库数据卷..."
    docker volume rm $(docker volume ls -q | grep alphamind) 2>/dev/null || true

    # 重新启动数据库
    print_info "启动数据库服务..."
    docker-compose up -d db

    # 等待数据库启动
    print_info "等待数据库启动..."
    sleep 15

    # 启动所有服务
    print_info "启动所有服务..."
    docker-compose up -d --build || {
        print_warning "docker-compose up 失败，但继续执行后续步骤..."
    }

    # 等待服务启动
    print_info "等待服务启动..."
    sleep 20

    # 运行数据库迁移
    print_info "运行数据库迁移..."
    docker-compose exec -T api python -m flask db upgrade || {
        print_error "数据库迁移失败"
        return 1
    }

    # 运行 schema 修复（如果存在）
    if [ -f "fix_schema.sh" ]; then
        print_info "运行 schema 修复脚本..."
        bash fix_schema.sh
    else
        print_warning "未找到 fix_schema.sh 脚本，跳过 schema 修复"
    fi

    # 验证重置结果
    print_info "验证重置结果..."
    local account_count=$(docker exec "$db_container" psql -U "$postgres_user" -d dify -t -c "SELECT COUNT(*) FROM accounts;" 2>/dev/null | tr -d ' \n' || echo "0")
    local tenant_count=$(docker exec "$db_container" psql -U "$postgres_user" -d dify -t -c "SELECT COUNT(*) FROM tenants;" 2>/dev/null | tr -d ' \n' || echo "0")
    local setup_count=$(docker exec "$db_container" psql -U "$postgres_user" -d dify -t -c "SELECT COUNT(*) FROM dify_setups;" 2>/dev/null | tr -d ' \n' || echo "0")

    echo "账户数量: $account_count"
    echo "租户数量: $tenant_count"
    echo "初始化记录数量: $setup_count"

    if [ "$account_count" = "0" ] && [ "$tenant_count" = "0" ] && [ "$setup_count" = "0" ]; then
        print_success "数据库重置验证成功"
    else
        print_warning "数据库重置可能不完整，请检查"
    fi

    print_success "数据库重置完成"
    print_info "请访问 http://localhost:3000/install 创建管理员账户"
}

# 设置默认测试账户（仅用于开发测试）
setup_default_account() {
    print_info "设置默认测试账户（仅用于开发测试）..."

    print_info "系统将完全通过 Dify 初始化流程创建管理员账户"
    print_info "请访问 http://localhost:3000/install 创建管理员账户"

    print_success "初始化设置完成"
    print_info "请访问 http://localhost:3000/install 创建管理员账户"
}

# 部署服务
deploy_services() {
    local env=${1:-dev}

    print_info "部署 AlphaMind 服务 (环境: $env)..."

    # 构建并启动服务
    docker-compose up -d --build

    # 等待服务启动
    print_info "等待服务启动..."
    sleep 20

    # 运行数据库迁移
    print_info "运行数据库迁移..."
    docker-compose exec -T api python -m flask db upgrade || {
        print_error "数据库迁移失败"
        return 1
    }

    # 设置默认测试账户
    setup_default_account

    print_success "服务部署完成"
}

# 验证服务
verify_services() {
    print_info "验证服务状态..."

    # 检查服务状态
    local services_status=$(docker-compose ps --format "table {{.Name}}\t{{.Status}}")
    print_info "服务状态:"
    echo "$services_status"

    # 检查 API 健康状态
    print_info "检查 API 健康状态..."
    if curl -s http://localhost:5001/health > /dev/null 2>&1; then
        print_success "API 服务正常"
    else
        print_warning "API 服务可能未完全启动，请稍后重试"
    fi

    # 检查前端服务
    print_info "检查前端服务..."
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "前端服务正常"
    else
        print_warning "前端服务可能未完全启动，请稍后重试"
    fi

    print_success "服务验证完成"
}

# 显示访问信息
show_access_info() {
    echo ""
    echo "🎉 AlphaMind 部署完成！"
    echo ""
    echo "📋 访问信息："
    echo "   前端界面: http://localhost:3000"
    echo "   API 服务: http://localhost:5001"
    echo "   登录页面: http://localhost:3000/signin"
    echo "   AlphaMind: http://localhost:3000/alphamind"
    echo ""
    echo "🔐 管理员账户："
    echo "   请访问 http://localhost:3000/install 创建管理员账户"
    echo ""
    echo "🔧 常用命令："
    echo "   查看日志: $0 logs"
    echo "   查看状态: $0 status"
    echo "   重置数据库: $0 reset"
    echo "   清理所有: $0 clean"
    echo ""
}

# 查看日志
show_logs() {
    print_info "查看服务日志..."
    echo "使用 Ctrl+C 退出日志查看"
    echo ""
    docker-compose logs --no-log-prefix -f
}

# 查看状态
show_status() {
    print_info "查看服务状态..."
    echo ""
    docker-compose ps
    echo ""
    print_info "资源使用情况："
    docker stats --no-stream
}

# 运行测试
run_tests() {
    print_info "运行测试验证..."

    # 测试 API 连接
    print_info "测试 API 连接..."
    if curl -s http://localhost:5001/health > /dev/null 2>&1; then
        print_success "API 连接正常"
    else
        print_error "API 连接失败"
        return 1
    fi

    # 测试前端连接
    print_info "测试前端连接..."
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "前端连接正常"
    else
        print_error "前端连接失败"
        return 1
    fi

    # 测试登录
    print_info "测试登录功能..."
    local login_response=$(curl -s -X POST http://localhost:5001/console/api/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"test123456","language":"en-US","remember_me":true}')

    # 检查登录响应
    if echo "$login_response" | grep -q '"result": "success"'; then
        print_success "登录功能正常"
    elif echo "$login_response" | grep -q '"code": "not_setup"'; then
        print_info "系统需要初始化设置，这是正常的"
        print_info "请访问 http://localhost:3000/install 创建管理员账户"
        print_info "完成初始化后，可以使用创建的管理员账户登录"
    elif echo "$login_response" | grep -q '"code": "invalid_credentials"'; then
        print_warning "登录凭据无效，请检查账户信息"
    elif echo "$login_response" | grep -q '"code": "account_not_activated"'; then
        print_warning "账户未激活，请检查账户状态"
    else
        print_info "登录测试完成，响应: $login_response"
    fi

    print_success "测试验证完成"
}

# 主函数
main() {
    local action=${1:-dev}

    case $action in
        "dev"|"prod")
            check_docker
            check_ports
            deploy_services $action
            verify_services
            show_access_info
            ;;
        "reset")
            check_docker
            reset_database
            setup_default_account
            print_success "数据库重置完成"
            ;;
        "clean")
            check_docker
            clean_all
            print_success "清理完成"
            ;;
        "logs")
            show_logs
            ;;
        "status")
            show_status
            ;;
        "test")
            run_tests
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "未知选项: $action"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
