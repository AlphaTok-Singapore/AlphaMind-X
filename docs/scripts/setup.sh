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
    echo "  dev          - 开发环境部署（默认，保留数据）"
    echo "  deploy       - 开发环境部署（dev 的别名）"
    echo "  prod         - 生产环境部署（不设置默认账户）"
    echo "  reset        - 重置数据库并重新初始化（增强版，包含完整修复逻辑）"
    echo "  clean        - 清理所有容器和数据"
    echo "  logs         - 查看服务日志"
    echo "  status       - 查看服务状态"
    echo "  test         - 运行测试验证"
    echo "  help         - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 dev       # 开发环境部署"
    echo "  $0 deploy    # 开发环境部署（同 dev）"
    echo "  $0 prod      # 生产环境部署"
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

# 重置数据库（增强版 - 包含完整的修复逻辑）
reset_database() {
    print_info "重置数据库（增强版 - 包含完整的修复逻辑）..."

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

    # 启动所有服务以运行迁移
    print_info "启动所有服务以运行数据库迁移..."
    docker-compose up -d --build

    # 等待服务启动完成
    print_info "等待服务启动完成..."
    wait_for_services

    # 运行增强的数据库初始化（包含所有修复逻辑）
    print_info "运行增强的数据库初始化（包含所有修复逻辑）..."
    initialize_database_enhanced

    # 验证重置结果
    print_info "验证重置结果..."

    # 重新获取数据库容器信息（因为可能在初始化过程中容器被重启）
    local current_db_container=$(docker ps --format '{{.Names}}' | grep -E 'db(-1)?$' | head -n1)
    if [ -z "$current_db_container" ]; then
        print_warning "无法找到数据库容器，跳过验证"
        account_count="0"
        tenant_count="0"
        setup_count="0"
    else
        print_info "使用数据库容器: $current_db_container"
        local account_count=$(docker exec "$current_db_container" psql -U "$postgres_user" -d dify -t -c "SELECT COUNT(*) FROM accounts;" 2>/dev/null | tr -d ' \n' || echo "0")
        local tenant_count=$(docker exec "$current_db_container" psql -U "$postgres_user" -d dify -t -c "SELECT COUNT(*) FROM tenants;" 2>/dev/null | tr -d ' \n' || echo "0")
        local setup_count=$(docker exec "$current_db_container" psql -U "$postgres_user" -d dify -t -c "SELECT COUNT(*) FROM dify_setups;" 2>/dev/null | tr -d ' \n' || echo "0")

        echo "账户数量: $account_count"
        echo "租户数量: $tenant_count"
        echo "初始化记录数量: $setup_count"
    fi

    if [ "$account_count" = "0" ] && [ "$tenant_count" = "0" ] && [ "$setup_count" = "0" ]; then
        print_success "数据库重置验证成功"
    else
        print_warning "数据库重置可能不完整，请检查"
    fi

    print_success "数据库重置完成（增强版）"
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

    # 根据环境选择不同的配置
    if [ "$env" = "prod" ]; then
        print_info "生产环境配置..."
        # 生产环境：使用生产配置
        export NODE_ENV=production
        export FLASK_ENV=production
    else
        print_info "开发环境配置..."
        # 开发环境：使用开发配置
        export NODE_ENV=development
        export FLASK_ENV=development
    fi

    # 构建并启动服务
    docker-compose up -d --build

    # 等待服务启动完成
    print_info "等待服务启动完成..."
    wait_for_services

    # 运行统一的数据库初始化
    print_info "运行统一的数据库初始化..."
    initialize_database

    # 设置默认测试账户（仅开发环境）
    if [ "$env" = "dev" ]; then
        setup_default_account
    else
        print_info "生产环境：跳过默认账户设置"
    fi

    print_success "服务部署完成 (环境: $env)"
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

# 统一的数据库初始化函数
initialize_database() {
    print_info "开始统一的数据库初始化..."

    # 1. 检查并修复数据库密码（新增）
    print_info "检查并修复数据库密码..."
    fix_database_password

    # 2. 运行数据库迁移
    print_info "运行数据库迁移..."

    # 先尝试直接运行迁移
    if docker-compose exec -T api python -m flask db upgrade; then
        print_success "数据库迁移成功"
    else
        print_warning "数据库迁移失败，尝试修复..."

        # 重置迁移状态
        print_info "重置迁移状态..."
        reset_migration_state

        # 重新运行迁移
        print_info "重新运行数据库迁移..."
        if docker-compose exec -T api python -m flask db upgrade; then
            print_success "数据库迁移成功"
        else
            print_error "数据库迁移失败"
            return 1
        fi
    fi

    # 3. 修复 alembic_version（新增）
    fix_alembic_version

    # 4. 运行统一的 schema 修复
    print_info "运行统一的 schema 修复..."
    run_unified_schema_fix

                # 5. 自动升级到最新版本
            print_info "自动升级到最新版本..."
            if [ -f "./smart_migration.sh" ]; then
                ./smart_migration.sh auto_upgrade
            else
                print_warning "smart_migration.sh 不存在，跳过自动升级"
            fi

    # 6. 强制刷新 API 模型缓存
    print_info "强制刷新 API 模型缓存..."
    docker-compose restart api
    sleep 10

    # 等待 API 服务重新启动
    print_info "等待 API 服务重新启动..."
    local api_ready=false
    local api_attempts=0
    local max_api_attempts=30

    while [ "$api_ready" = false ] && [ $api_attempts -lt $max_api_attempts ]; do
        api_attempts=$((api_attempts + 1))

        if docker-compose ps | grep -q "api.*healthy"; then
            print_success "API 服务已重新启动"
            api_ready=true
        else
            print_info "等待 API 服务重新启动... ($api_attempts/$max_api_attempts)"
            sleep 2
        fi
    done

    if [ "$api_ready" = false ]; then
        print_warning "API 服务重启超时，但继续执行"
    fi

    # 7. 验证数据库完整性
    print_info "验证数据库完整性..."
    if [ -f "./smart_migration.sh" ]; then
        ./smart_migration.sh verify
    else
        verify_database_integrity
    fi

    print_success "数据库初始化完成"
}

# 自动检测和清理 alembic 版本
auto_cleanup_alembic_versions() {
    print_info "自动检测和清理 alembic 版本..."

    # 获取数据库容器信息
    local db_container=$(docker ps --format '{{.Names}}' | grep -E 'db(-1)?$' | head -n1)
    local postgres_user=$(grep "^POSTGRES_USER=" .env | cut -d'=' -f2)

    if [ -z "$db_container" ] || [ -z "$postgres_user" ]; then
        print_warning "无法获取数据库信息，跳过 alembic 版本清理"
        return 0
    fi

    print_info "使用数据库容器: $db_container"

    # 检查迁移文件目录，找到最新的迁移版本
    print_info "检测迁移文件目录..."
    local migrations_dir="api/migrations/versions"
    local latest_migration=""
    local latest_date=""

    if [ -d "$migrations_dir" ]; then
        # 遍历所有迁移文件，找到最新的
        for migration_file in "$migrations_dir"/*.py; do
            if [ -f "$migration_file" ]; then
                local filename=$(basename "$migration_file")
                local revision=$(echo "$filename" | cut -d'_' -f1)

                # 提取日期信息（如果文件名包含日期）
                local file_date=$(echo "$filename" | grep -o '[0-9]\{4\}_[0-9]\{2\}_[0-9]\{2\}' | head -n1)

                if [ -n "$file_date" ]; then
                    if [ -z "$latest_date" ] || [ "$file_date" \> "$latest_date" ]; then
                        latest_date="$file_date"
                        latest_migration="$revision"
                    fi
                else
                    # 如果没有日期，检查文件内容中的 revision
                    local file_revision=$(grep -E "^revision = " "$migration_file" | cut -d"'" -f2)
                    if [ -n "$file_revision" ]; then
                        latest_migration="$file_revision"
                    fi
                fi
            fi
        done
    fi

    # 检测分支链并自动处理
    print_info "检测分支链..."
    local branch_chains=()

          # 检查是否有基于 fecff1c3da27 的分支
      local branch_revisions=$(grep -r "Revises: fecff1c3da27" "$migrations_dir" | cut -d':' -f1 | xargs -I {} basename {} | cut -d'_' -f1)

      if [ -n "$branch_revisions" ]; then
          print_warning "发现分支链，自动标记为已应用..."
          for revision in $branch_revisions; do
              print_info "标记分支迁移为已应用: $revision"
              # 将分支迁移标记为已应用，避免重复执行
              docker exec "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('$revision') ON CONFLICT (version_num) DO NOTHING;" >/dev/null 2>&1

              # 递归处理分支的子迁移
              local child_revisions=$(grep -r "Revises: $revision" "$migrations_dir" | cut -d':' -f1 | xargs -I {} basename {} | cut -d'_' -f1)
              for child_revision in $child_revisions; do
                  print_info "标记分支子迁移为已应用: $child_revision"
                  docker exec "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('$child_revision') ON CONFLICT (version_num) DO NOTHING;" >/dev/null 2>&1
              done
          done
      fi

    # 如果找到了最新迁移，检查 alembic_version 表
    if [ -n "$latest_migration" ]; then
        print_info "检测到最新迁移版本: $latest_migration"

        # 检查当前 alembic_version 表中的版本
        local current_versions=$(docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT version_num FROM alembic_version ORDER BY version_num;" 2>/dev/null | grep -E '^ [a-f0-9]{12}$' | tr -d ' ')

        if [ -n "$current_versions" ]; then
            print_info "当前 alembic_version 表中的版本: $current_versions"

            # 检查是否有多个版本
            local version_count=$(echo "$current_versions" | wc -l)
            if [ "$version_count" -gt 1 ]; then
                print_warning "发现多个 alembic 版本，需要清理..."

                # 清理 alembic_version 表，只保留最新版本
                print_info "清理 alembic_version 表，只保留最新版本: $latest_migration"
                docker exec "$db_container" psql -U "$postgres_user" -d dify -c "DELETE FROM alembic_version; INSERT INTO alembic_version (version_num) VALUES ('$latest_migration');" >/dev/null 2>&1

                print_success "alembic_version 表已清理，只保留版本: $latest_migration"
            else
                print_info "alembic_version 表只有一个版本，无需清理"
            fi
        else
            print_warning "alembic_version 表为空，设置最新版本: $latest_migration"
            docker exec "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('$latest_migration') ON CONFLICT (version_num) DO NOTHING;" >/dev/null 2>&1
        fi
    else
        print_warning "无法检测到最新迁移版本"
    fi

    # 验证清理结果
    local final_version=$(docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT version_num FROM alembic_version ORDER BY version_num DESC LIMIT 1;" 2>/dev/null | grep -E '^ [a-f0-9]{12}$' | tr -d ' ')

    if [ -n "$final_version" ]; then
        print_success "✅ alembic_version 清理完成，当前版本: $final_version"
    else
        print_warning "⚠️  alembic_version 表可能为空"
    fi
}

# 清理重复对象函数
cleanup_duplicate_objects() {
    print_info "清理重复对象..."

    # 首先自动检测和清理 alembic 版本
    auto_cleanup_alembic_versions

    # 获取数据库容器信息
    local db_container=$(docker ps --format '{{.Names}}' | grep -E 'db(-1)?$' | head -n1)
    local postgres_user=$(grep "^POSTGRES_USER=" .env | cut -d'=' -f2)

    if [ -z "$db_container" ] || [ -z "$postgres_user" ]; then
        print_warning "无法获取数据库信息，跳过重复对象清理"
        return 0
    fi

    print_info "使用数据库容器: $db_container"

    # 清理已知的重复索引
    print_info "检查并清理重复索引..."

    # 检查 created_at_idx 索引
    if docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT indexname FROM pg_indexes WHERE indexname = 'created_at_idx';" 2>/dev/null | grep -q "created_at_idx"; then
        print_info "发现 created_at_idx 索引，确保迁移版本正确..."
        # 确保迁移版本正确
        docker exec "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('6e957a32015b') ON CONFLICT (version_num) DO NOTHING;" >/dev/null 2>&1
    fi

    # 检查其他已知的重复对象
    print_info "检查其他已知的重复对象..."

    # 检查 message_created_at_idx 索引
    if docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT indexname FROM pg_indexes WHERE indexname = 'message_created_at_idx';" 2>/dev/null | grep -q "message_created_at_idx"; then
        print_info "发现 message_created_at_idx 索引，确保迁移版本正确..."
        docker exec "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('01d6889832f7') ON CONFLICT (version_num) DO NOTHING;" >/dev/null 2>&1
    fi

    # 检查 workflow_conversation_variables_created_at_idx 索引
    if docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT indexname FROM pg_indexes WHERE indexname = 'workflow_conversation_variables_created_at_idx';" 2>/dev/null | grep -q "workflow_conversation_variables_created_at_idx"; then
        print_info "发现 workflow_conversation_variables_created_at_idx 索引，确保迁移版本正确..."
        docker exec "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('63a83fcf12ba') ON CONFLICT (version_num) DO NOTHING;" >/dev/null 2>&1
    fi

    # 检查 tidb_auth_bindings_created_at_idx 索引
    if docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT indexname FROM pg_indexes WHERE indexname = 'tidb_auth_bindings_created_at_idx';" 2>/dev/null | grep -q "tidb_auth_bindings_created_at_idx"; then
        print_info "发现 tidb_auth_bindings_created_at_idx 索引，确保迁移版本正确..."
        docker exec "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('0251a1c768cc') ON CONFLICT (version_num) DO NOTHING;" >/dev/null 2>&1
    fi

    # 确保只有一个版本记录
    print_info "确保 alembic_version 表只有一个版本记录..."
    local current_version=$(docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT version_num FROM alembic_version ORDER BY version_num DESC LIMIT 1;" 2>/dev/null | grep -E '^ [a-f0-9]{12}$' | tr -d ' ')

    if [ -n "$current_version" ]; then
        print_info "清理 alembic_version 表，只保留最新版本: $current_version"
        docker exec "$db_container" psql -U "$postgres_user" -d dify -c "DELETE FROM alembic_version; INSERT INTO alembic_version (version_num) VALUES ('$current_version');" >/dev/null 2>&1
    fi

    # 强制清理所有可能的重复对象（新增）
    print_info "强制清理所有可能的重复对象..."

    # 检查并清理所有已知的重复索引
    local known_indexes=(
        "created_at_idx:6e957a32015b"
        "message_created_at_idx:01d6889832f7"
        "workflow_conversation_variables_created_at_idx:63a83fcf12ba"
        "tidb_auth_bindings_created_at_idx:0251a1c768cc"
        "workflow__conversation_variables_created_at_idx:63a83fcf12ba"
    )

    for index_info in "${known_indexes[@]}"; do
        local index_name=$(echo "$index_info" | cut -d':' -f1)
        local migration_version=$(echo "$index_info" | cut -d':' -f2)

        if docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT indexname FROM pg_indexes WHERE indexname = '$index_name';" 2>/dev/null | grep -q "$index_name"; then
            print_info "发现 $index_name 索引，确保迁移版本 $migration_version 已应用..."
            docker exec "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('$migration_version') ON CONFLICT (version_num) DO NOTHING;" >/dev/null 2>&1
        fi
    done

        # 最终确保版本一致性
    print_info "最终确保版本一致性..."
    local final_version=$(docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT version_num FROM alembic_version ORDER BY version_num DESC LIMIT 1;" 2>/dev/null | grep -E '^ [a-f0-9]{12}$' | tr -d ' ')

    if [ -n "$final_version" ]; then
        print_info "设置最终版本: $final_version"
        docker exec "$db_container" psql -U "$postgres_user" -d dify -c "DELETE FROM alembic_version; INSERT INTO alembic_version (version_num) VALUES ('$final_version');" >/dev/null 2>&1
    fi

    # 强制清理所有已知的重复索引（新增）
    print_info "强制清理所有已知的重复索引..."

    # 删除可能存在的重复索引
    local indexes_to_drop=(
        "created_at_idx"
        "message_created_at_idx"
        "workflow_conversation_variables_created_at_idx"
        "tidb_auth_bindings_created_at_idx"
        "workflow__conversation_variables_created_at_idx"
    )

    for index_name in "${indexes_to_drop[@]}"; do
        print_info "检查索引: $index_name"
        if docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT indexname FROM pg_indexes WHERE indexname = '$index_name';" 2>/dev/null | grep -q "$index_name"; then
            print_info "发现重复索引 $index_name，尝试删除..."
            # 尝试删除索引，如果失败则忽略
            docker exec "$db_container" psql -U "$postgres_user" -d dify -c "DROP INDEX IF EXISTS $index_name;" >/dev/null 2>&1
            print_info "索引 $index_name 已处理"
        fi
    done

    # 重新创建必要的索引（确保API启动时不会尝试创建）
    print_info "重新创建必要的索引..."

    # 强制删除并重新创建所有已知的索引
    print_info "强制删除并重新创建 created_at_idx 索引..."
    docker exec "$db_container" psql -U "$postgres_user" -d dify -c "DROP INDEX IF EXISTS created_at_idx;" >/dev/null 2>&1
    docker exec "$db_container" psql -U "$postgres_user" -d dify -c "CREATE INDEX created_at_idx ON embeddings (created_at);" >/dev/null 2>&1

    print_info "强制删除并重新创建 message_created_at_idx 索引..."
    docker exec "$db_container" psql -U "$postgres_user" -d dify -c "DROP INDEX IF EXISTS message_created_at_idx;" >/dev/null 2>&1
    docker exec "$db_container" psql -U "$postgres_user" -d dify -c "CREATE INDEX message_created_at_idx ON messages (created_at);" >/dev/null 2>&1

    print_info "强制删除并重新创建 workflow_conversation_variables_created_at_idx 索引..."
    docker exec "$db_container" psql -U "$postgres_user" -d dify -c "DROP INDEX IF EXISTS workflow_conversation_variables_created_at_idx;" >/dev/null 2>&1
    docker exec "$db_container" psql -U "$postgres_user" -d dify -c "CREATE INDEX workflow_conversation_variables_created_at_idx ON workflow_conversation_variables (created_at);" >/dev/null 2>&1

    print_info "强制删除并重新创建 tidb_auth_bindings_created_at_idx 索引..."
    docker exec "$db_container" psql -U "$postgres_user" -d dify -c "DROP INDEX IF EXISTS tidb_auth_bindings_created_at_idx;" >/dev/null 2>&1
    docker exec "$db_container" psql -U "$postgres_user" -d dify -c "CREATE INDEX tidb_auth_bindings_created_at_idx ON tidb_auth_bindings (created_at);" >/dev/null 2>&1

    print_info "验证索引创建状态..."
    docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT indexname FROM pg_indexes WHERE indexname IN ('created_at_idx', 'message_created_at_idx', 'workflow_conversation_variables_created_at_idx', 'tidb_auth_bindings_created_at_idx');" >/dev/null 2>&1

    # 确保索引在 alembic_version 中标记为已应用
    print_info "确保索引在 alembic_version 中标记为已应用..."
    docker exec "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('6e957a32015b') ON CONFLICT (version_num) DO NOTHING;" >/dev/null 2>&1
    docker exec "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('01d6889832f7') ON CONFLICT (version_num) DO NOTHING;" >/dev/null 2>&1
    docker exec "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('63a83fcf12ba') ON CONFLICT (version_num) DO NOTHING;" >/dev/null 2>&1
    docker exec "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('0251a1c768cc') ON CONFLICT (version_num) DO NOTHING;" >/dev/null 2>&1

    # 确保只有一个版本记录（最新版本）
    print_info "确保只有一个版本记录（最新版本）..."

        # 强制确保索引存在且不会被重复创建
    print_info "强制确保索引存在且不会被重复创建..."

    # 检查并确保 created_at_idx 索引存在
    if ! docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT indexname FROM pg_indexes WHERE indexname = 'created_at_idx';" 2>/dev/null | grep -q "created_at_idx"; then
        print_info "创建 created_at_idx 索引..."
        docker exec "$db_container" psql -U "$postgres_user" -d dify -c "CREATE INDEX created_at_idx ON embeddings (created_at);" >/dev/null 2>&1
    else
        print_info "created_at_idx 索引已存在"
    fi

    # 检查并确保 message_created_at_idx 索引存在
    if ! docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT indexname FROM pg_indexes WHERE indexname = 'message_created_at_idx';" 2>/dev/null | grep -q "message_created_at_idx"; then
        print_info "创建 message_created_at_idx 索引..."
        docker exec "$db_container" psql -U "$postgres_user" -d dify -c "CREATE INDEX message_created_at_idx ON messages (created_at);" >/dev/null 2>&1
    else
        print_info "message_created_at_idx 索引已存在"
    fi

    # 检查并确保 workflow_conversation_variables_created_at_idx 索引存在
    if ! docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT indexname FROM pg_indexes WHERE indexname = 'workflow_conversation_variables_created_at_idx';" 2>/dev/null | grep -q "workflow_conversation_variables_created_at_idx"; then
        print_info "创建 workflow_conversation_variables_created_at_idx 索引..."
        docker exec "$db_container" psql -U "$postgres_user" -d dify -c "CREATE INDEX workflow_conversation_variables_created_at_idx ON workflow_conversation_variables (created_at);" >/dev/null 2>&1
    else
        print_info "workflow_conversation_variables_created_at_idx 索引已存在"
    fi

    # 检查并确保 tidb_auth_bindings_created_at_idx 索引存在
    if ! docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT indexname FROM pg_indexes WHERE indexname = 'tidb_auth_bindings_created_at_idx';" 2>/dev/null | grep -q "tidb_auth_bindings_created_at_idx"; then
        print_info "创建 tidb_auth_bindings_created_at_idx 索引..."
        docker exec "$db_container" psql -U "$postgres_user" -d dify -c "CREATE INDEX tidb_auth_bindings_created_at_idx ON tidb_auth_bindings (created_at);" >/dev/null 2>&1
    else
        print_info "tidb_auth_bindings_created_at_idx 索引已存在"
    fi

                            # 强制确保索引在 alembic_version 中标记为已应用（防止API启动时重新创建）
    print_info "强制确保索引在 alembic_version 中标记为已应用..."

    # 获取当前版本
    local current_version=$(docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT version_num FROM alembic_version ORDER BY version_num DESC LIMIT 1;" 2>/dev/null | grep -E '^ [a-f0-9]{12}$' | tr -d ' ')

    if [ -n "$current_version" ]; then
        print_info "当前版本: $current_version"

        # 确保所有相关的索引迁移版本都被标记为已应用
        local index_migrations=(
            "64b051264f32"  # message_created_at_idx (init)
            "6e957a32015b"  # created_at_idx (embeddings)
            "01d6889832f7"  # message_created_at_idx (messages)
            "63a83fcf12ba"  # workflow_conversation_variables_created_at_idx
            "0251a1c768cc"  # tidb_auth_bindings_created_at_idx
        )

        for migration in "${index_migrations[@]}"; do
            print_info "确保迁移版本 $migration 已应用..."
            docker exec "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('$migration') ON CONFLICT (version_num) DO NOTHING;" >/dev/null 2>&1
        done

        # 确保只有一个版本记录（最新版本）
        print_info "确保只有一个版本记录（最新版本）..."
        docker exec "$db_container" psql -U "$postgres_user" -d dify -c "DELETE FROM alembic_version; INSERT INTO alembic_version (version_num) VALUES ('$current_version');" >/dev/null 2>&1

        print_info "版本管理完成，当前版本: $current_version"
    else
        print_warning "无法获取当前版本，跳过版本管理"
    fi

    # 验证索引存在性
    print_info "验证索引存在性..."

    # 检查并确保 created_at_idx 索引存在
    if docker exec "$db_container" psql -U "$postgres_user" -d dify -c "SELECT indexname FROM pg_indexes WHERE indexname = 'created_at_idx';" 2>/dev/null | grep -q "created_at_idx"; then
        print_info "✅ created_at_idx 索引已存在"
    else
        print_warning "❌ created_at_idx 索引不存在，尝试创建..."
        docker exec "$db_container" psql -U "$postgres_user" -d dify -c "CREATE INDEX IF NOT EXISTS created_at_idx ON embeddings (created_at);" >/dev/null 2>&1
    fi

    print_success "重复对象清理完成"
}

# 增强版数据库初始化函数（专门用于reset操作）
initialize_database_enhanced() {
    print_info "开始增强版数据库初始化（专门用于reset操作）..."

    # 1. 强制重置迁移状态（确保完全干净）
    print_info "强制重置迁移状态（确保完全干净）..."
    reset_migration_state

    # 2. 检查并修复数据库密码
    print_info "检查并修复数据库密码..."
    fix_database_password

    # 3. 运行数据库迁移（强制重新运行）
    print_info "运行数据库迁移（强制重新运行）..."
    if docker-compose exec -T api python -m flask db upgrade; then
        print_success "数据库迁移成功"
    else
        print_error "数据库迁移失败"
        return 1
    fi

    # 4. 修复 alembic_version（已在 initialize_database 中处理）
    print_info "跳过重复的 alembic_version 修复（已在 initialize_database 中处理）..."

    # 5. 运行统一的 schema 修复
    print_info "运行统一的 schema 修复..."
    run_unified_schema_fix

    # 6. 清理重复对象（新增）
    print_info "清理重复对象..."
    cleanup_duplicate_objects

    # 7. 自动升级到最新版本
    print_info "自动升级到最新版本..."
    if [ -f "./smart_migration.sh" ]; then
        ./smart_migration.sh auto_upgrade
    else
        print_warning "smart_migration.sh 不存在，跳过自动升级"
    fi

    # 8. 最终清理重复对象（确保API启动前没有问题）
    print_info "最终清理重复对象..."
    cleanup_duplicate_objects

    # 9. 强制刷新 API 模型缓存
    print_info "强制刷新 API 模型缓存..."
    docker-compose restart api
    sleep 10

    # 等待 API 服务重新启动
    print_info "等待 API 服务重新启动..."
    local api_ready=false
    local api_attempts=0
    local max_api_attempts=30

    while [ "$api_ready" = false ] && [ $api_attempts -lt $max_api_attempts ]; do
        api_attempts=$((api_attempts + 1))

        if docker-compose ps | grep -q "api.*healthy"; then
            print_success "API 服务已重新启动"
            api_ready=true
        else
            print_info "等待 API 服务重新启动... ($api_attempts/$max_api_attempts)"
            sleep 2
        fi
    done

    if [ "$api_ready" = false ]; then
        print_warning "API 服务重启超时，但继续执行"
    fi

    # 10. 验证数据库完整性
    print_info "验证数据库完整性..."
    if [ -f "./smart_migration.sh" ]; then
        ./smart_migration.sh verify
    else
        verify_database_integrity
    fi

    print_success "增强版数据库初始化完成（专门用于reset操作）"
}

# 等待服务启动完成
wait_for_services() {
    print_info "等待服务启动完成..."

    # 等待数据库服务
    print_info "等待数据库服务..."
    local db_ready=false
    local db_attempts=0
    local max_db_attempts=30

    while [ "$db_ready" = false ] && [ $db_attempts -lt $max_db_attempts ]; do
        db_attempts=$((db_attempts + 1))

        if docker-compose ps | grep -q "db.*healthy"; then
            print_success "数据库服务已就绪"
            db_ready=true
        else
            print_info "等待数据库服务... ($db_attempts/$max_db_attempts)"
            sleep 2
        fi
    done

    if [ "$db_ready" = false ]; then
        print_error "数据库服务启动超时"
        return 1
    fi

    # 等待API服务
    print_info "等待API服务..."
    local api_ready=false
    local api_attempts=0
    local max_api_attempts=60

    while [ "$api_ready" = false ] && [ $api_attempts -lt $max_api_attempts ]; do
        api_attempts=$((api_attempts + 1))

        if docker-compose ps | grep -q "api.*healthy"; then
            print_success "API服务已就绪"
            api_ready=true
        else
            print_info "等待API服务... ($api_attempts/$max_api_attempts)"
            sleep 2
        fi
    done

    if [ "$api_ready" = false ]; then
        print_error "API服务启动超时"
        return 1
    fi

    # 额外等待以确保服务完全稳定
    print_info "等待服务稳定..."
    sleep 10

    print_success "所有服务已就绪"
}

# 重置迁移状态
reset_migration_state() {
    print_info "重置迁移状态..."

    # 获取数据库容器信息
    local db_container=$(docker ps --format '{{.Names}}' | grep -E 'alphamind-db|postgres|pg' | head -n1)
    local postgres_user=${POSTGRES_USER:-dify}

    if [ -f ".env" ]; then
        local env_user=$(grep "^POSTGRES_USER=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
        if [ -n "$env_user" ]; then
            postgres_user="$env_user"
        fi
    fi

    if [ -n "$db_container" ]; then
        print_info "彻底清理数据库状态..."

        # 删除整个数据库并重新创建
        docker exec -i "$db_container" psql -U "$postgres_user" -d postgres << 'EOF'
-- 断开所有到 dify 数据库的连接
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'dify' AND pid <> pg_backend_pid();

-- 删除数据库
DROP DATABASE IF EXISTS dify;

-- 重新创建数据库
CREATE DATABASE dify;
EOF

        print_success "已重置迁移状态"
    fi
}

# 修复数据库密码函数（新增）
fix_database_password() {
    print_info "检查并修复数据库密码..."

    # 获取数据库容器信息
    local db_container=$(docker ps --format '{{.Names}}' | grep -E 'alphamind-db|postgres|pg' | head -n1)
    local postgres_user=${POSTGRES_USER:-dify}
    local postgres_password=${POSTGRES_PASSWORD:-difyai123456}

    if [ -f ".env" ]; then
        local env_user=$(grep "^POSTGRES_USER=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
        local env_password=$(grep "^POSTGRES_PASSWORD=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
        if [ -n "$env_user" ]; then
            postgres_user="$env_user"
        fi
        if [ -n "$env_password" ]; then
            postgres_password="$env_password"
        fi
    fi

    if [ -z "$db_container" ]; then
        print_warning "未找到数据库容器，跳过密码检查"
        return 0
    fi

    # 测试数据库连接
    print_info "测试数据库连接..."
    if docker exec -i "$db_container" psql -U "$postgres_user" -d dify -c "SELECT 1;" >/dev/null 2>&1; then
        print_success "数据库连接正常"
        return 0
    fi

    print_warning "数据库连接失败，尝试修复密码..."

    # 尝试重置密码
    if docker exec -i "$db_container" psql -U "$postgres_user" -d dify -c "ALTER USER $postgres_user PASSWORD '$postgres_password';" >/dev/null 2>&1; then
        print_success "数据库密码已重置"

        # 再次测试连接
        if docker exec -i "$db_container" psql -U "$postgres_user" -d dify -c "SELECT 1;" >/dev/null 2>&1; then
            print_success "数据库连接修复成功"
            return 0
        else
            print_error "数据库连接仍然失败"
            return 1
        fi
    else
        print_error "无法重置数据库密码"
        return 1
    fi
}

# 修复 alembic_version 函数
fix_alembic_version() {
    print_info "检查并修复 alembic_version..."

    # 获取数据库容器信息
    local db_container=$(docker ps --format '{{.Names}}' | grep -E 'alphamind-db|postgres|pg' | head -n1)
    local postgres_user=${POSTGRES_USER:-dify}

    if [ -f ".env" ]; then
        local env_user=$(grep "^POSTGRES_USER=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
        if [ -n "$env_user" ]; then
            postgres_user="$env_user"
        fi
    fi

    # 检查 alembic_version 表是否存在
    local table_exists=$(docker exec -i "$db_container" psql -U "$postgres_user" -d dify -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'alembic_version');" | tr -d ' \n')

    if [ "$table_exists" != "t" ]; then
        print_warning "alembic_version 表不存在，跳过版本检查"
        return 0
    fi

    # 获取数据库中的当前版本
    local db_version=$(docker exec -i "$db_container" psql -U "$postgres_user" -d dify -c "SELECT version_num FROM alembic_version;" | grep -E '^ [a-f0-9]{12}$' | tr -d ' ')

    # 获取最新的迁移文件版本
    local latest_migration=""
    if [ -d "api/migrations/versions" ]; then
        latest_migration=$(ls api/migrations/versions/*.py 2>/dev/null | grep -o '[a-f0-9]\{12\}' | sort | tail -1)
    fi

    if [ -z "$latest_migration" ]; then
        print_warning "未找到迁移文件，跳过版本检查"
        return 0
    fi

    # 如果数据库版本为空，说明 alembic_version 表为空，需要初始化
    if [ -z "$db_version" ]; then
        print_warning "alembic_version 表为空，初始化为最新版本: $latest_migration"
        docker exec -i "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('$latest_migration');"
        if [ $? -eq 0 ]; then
            print_success "alembic_version 已初始化为: $latest_migration"
        else
            print_error "初始化 alembic_version 失败"
            return 1
        fi
        return 0
    fi

    if [ "$db_version" != "$latest_migration" ]; then
        print_warning "数据库版本 ($db_version) 与最新迁移版本 ($latest_migration) 不匹配"
        print_info "正在修复 alembic_version..."

        # 检查是否需要包含初始化迁移
        local init_migration="64b051264f32"
        local has_init_migration=$(docker exec -i "$db_container" psql -U "$postgres_user" -d dify -c "SELECT COUNT(*) FROM alembic_version WHERE version_num = '$init_migration';" | tr -d ' \n')

        if [ "$has_init_migration" = "0" ]; then
            print_info "添加初始化迁移 $init_migration..."
            docker exec -i "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('$init_migration') ON CONFLICT (version_num) DO NOTHING;"
        fi

        # 确保包含最新版本
        docker exec -i "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('$latest_migration') ON CONFLICT (version_num) DO NOTHING;"

        # 确保包含所有相关的索引迁移版本
        local index_migrations=(
            "6e957a32015b"  # created_at_idx
            "01d6889832f7"  # message_created_at_idx
            "63a83fcf12ba"  # workflow_conversation_variables_created_at_idx
            "0251a1c768cc"  # tidb_auth_bindings_created_at_idx
        )

        for migration in "${index_migrations[@]}"; do
            print_info "确保索引迁移版本 $migration 已应用..."
            docker exec -i "$db_container" psql -U "$postgres_user" -d dify -c "INSERT INTO alembic_version (version_num) VALUES ('$migration') ON CONFLICT (version_num) DO NOTHING;"
        done

        if [ $? -eq 0 ]; then
            print_success "alembic_version 已修复，包含初始化迁移和最新版本"
        else
            print_error "修复 alembic_version 失败"
            return 1
        fi
    else
        print_success "alembic_version 版本匹配: $db_version"
    fi
}

# 统一的 schema 修复函数
run_unified_schema_fix() {
    print_info "执行统一的 schema 修复..."

    # 获取数据库容器信息
    local db_container=$(docker ps --format '{{.Names}}' | grep -E 'alphamind-db|postgres|pg' | head -n1)
    local postgres_user=${POSTGRES_USER:-dify}

    if [ -f ".env" ]; then
        local env_user=$(grep "^POSTGRES_USER=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
        if [ -n "$env_user" ]; then
            postgres_user="$env_user"
        fi
    fi

    # 执行统一的修复脚本
    docker exec -i "$db_container" psql -U "$postgres_user" -d dify << 'EOF'
-- 统一的 Schema 修复脚本
-- 处理所有已知的数据库结构问题

-- 1. 修复 upload_files 表
DO $$
BEGIN
    -- 添加 storage_type 列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'upload_files' AND column_name = 'storage_type'
    ) THEN
        ALTER TABLE upload_files ADD COLUMN storage_type VARCHAR(255) DEFAULT 'local';
        RAISE NOTICE '已添加 upload_files.storage_type 列';
    END IF;

    -- 添加 used 列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'upload_files' AND column_name = 'used'
    ) THEN
        ALTER TABLE upload_files ADD COLUMN used BOOLEAN DEFAULT FALSE;
        RAISE NOTICE '已添加 upload_files.used 列';
    END IF;

    -- 添加 used_by 列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'upload_files' AND column_name = 'used_by'
    ) THEN
        ALTER TABLE upload_files ADD COLUMN used_by UUID;
        RAISE NOTICE '已添加 upload_files.used_by 列';
    END IF;

    -- 添加 used_at 列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'upload_files' AND column_name = 'used_at'
    ) THEN
        ALTER TABLE upload_files ADD COLUMN used_at TIMESTAMP;
        RAISE NOTICE '已添加 upload_files.used_at 列';
    END IF;

    -- 添加 hash 列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'upload_files' AND column_name = 'hash'
    ) THEN
        ALTER TABLE upload_files ADD COLUMN hash VARCHAR(255);
        RAISE NOTICE '已添加 upload_files.hash 列';
    END IF;

    -- 添加 created_by_role 列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'upload_files' AND column_name = 'created_by_role'
    ) THEN
        ALTER TABLE upload_files ADD COLUMN created_by_role VARCHAR(255) DEFAULT 'account';
        RAISE NOTICE '已添加 upload_files.created_by_role 列';
    END IF;

    -- 添加 mime_type 列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'upload_files' AND column_name = 'mime_type'
    ) THEN
        ALTER TABLE upload_files ADD COLUMN mime_type VARCHAR(255);
        RAISE NOTICE '已添加 upload_files.mime_type 列';
    END IF;
END $$;

-- 2. 修复 tenants 表
DO $$
BEGIN
    -- 添加 name 列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'name'
    ) THEN
        ALTER TABLE tenants ADD COLUMN name VARCHAR(255) DEFAULT 'Default Workspace';
        RAISE NOTICE '已添加 tenants.name 列';
    END IF;

    -- 添加 encrypt_public_key 列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'encrypt_public_key'
    ) THEN
        ALTER TABLE tenants ADD COLUMN encrypt_public_key TEXT;
        RAISE NOTICE '已添加 tenants.encrypt_public_key 列';
    END IF;

    -- 添加 plan 列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'plan'
    ) THEN
        ALTER TABLE tenants ADD COLUMN plan VARCHAR(255) DEFAULT 'basic';
        RAISE NOTICE '已添加 tenants.plan 列';
    END IF;
END $$;

-- 3. 清理可能重复的 sequence
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'task_id_sequence') THEN
        DROP SEQUENCE IF EXISTS task_id_sequence CASCADE;
        RAISE NOTICE '已删除重复的 task_id_sequence';
    END IF;
END $$;

-- 4. 显示修复结果
SELECT 'Schema 修复完成!' as status, '所有已知问题已处理' as details;

EOF

    print_success "统一的 schema 修复完成"
}

# 验证数据库完整性
verify_database_integrity() {
    print_info "验证数据库完整性..."

    local db_container=$(docker ps --format '{{.Names}}' | grep -E 'alphamind-db|postgres|pg' | head -n1)
    local postgres_user=${POSTGRES_USER:-dify}

    if [ -f ".env" ]; then
        local env_user=$(grep "^POSTGRES_USER=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
        if [ -n "$env_user" ]; then
            postgres_user="$env_user"
        fi
    fi

    # 验证关键表结构
    docker exec -i "$db_container" psql -U "$postgres_user" -d dify << 'EOF'
-- 验证关键表是否存在
SELECT
    table_name,
    CASE
        WHEN table_name IN ('tenants', 'accounts', 'tenant_account_joins') THEN '核心表'
        WHEN table_name LIKE 'alphamind_%' THEN 'AlphaMind 表'
        WHEN table_name = 'upload_files' THEN '文件表'
        ELSE '其他表'
    END as table_type,
    '存在' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('tenants', 'accounts', 'tenant_account_joins', 'upload_files', 'alphamind_agents', 'alphamind_conversations')
ORDER BY table_type, table_name;

-- 验证 upload_files 表结构
SELECT
    'upload_files 表结构验证:' as info,
    COUNT(*) as total_columns,
    COUNT(CASE WHEN column_name IN ('storage_type', 'used', 'used_by', 'used_at', 'hash', 'created_by_role') THEN 1 END) as required_columns
FROM information_schema.columns
WHERE table_name = 'upload_files';

EOF

    print_success "数据库完整性验证完成"
}

# 主函数
main() {
    local action=${1:-dev}

    case $action in
        "dev"|"prod"|"deploy")
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
