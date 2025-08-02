import logging
import traceback
from flask import Flask
from extensions.ext_database import db
from models.model import Base # Assuming Base is imported from models.model


def is_enabled():
    return True


def init_app(app: Flask):
    @app.before_request
    def before_request():
        pass

    @app.teardown_request
    def teardown_request(exception):
        pass

    with app.app_context():
        # 设置索引创建日志追踪
        setup_logging_on_startup(app)

        # 强制重新加载模型元数据
        Base.metadata.reflect(bind=db.engine)

        # 注释掉 create_all 调用，因为数据库结构已经通过迁移文件正确创建
        # 这样可以避免 SQLAlchemy 尝试重新创建已存在的索引
        logging.info("跳过 create_all 调用，数据库结构已通过迁移文件创建")

        # 如果需要，可以在这里添加其他验证逻辑
        # 但不要调用 create_all，因为它会尝试创建所有模型定义的索引

        # 验证关键表结构
        inspector = db.engine.dialect.inspector(db.engine)
        if 'upload_files' in inspector.get_table_names():
            columns = {col['name']: col for col in inspector.get_columns('upload_files')}
            required_columns = ['id', 'tenant_id', 'type', 'storage_type', 'key', 'name', 'size', 'extension', 'mime_type']
            missing_columns = [col for col in required_columns if col not in columns]

            if missing_columns:
                logging.warning(f"upload_files 表缺少列: {missing_columns}")
            else:
                logging.info("✅ upload_files 表结构验证通过")

        logging.info("✅ SQLAlchemy 模型缓存已刷新")

# 添加全局事件监听器来追踪索引创建
def setup_index_creation_logging():
    """设置索引创建日志追踪"""
    from sqlalchemy import event

    @event.listens_for(db.engine, 'before_cursor_execute')
    def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        if 'CREATE INDEX' in statement.upper() or 'CREATE INDEX IF NOT EXISTS' in statement.upper():
            # 获取调用栈信息
            stack_trace = traceback.extract_stack()
            caller_info = []

            # 找到调用者信息
            for frame in stack_trace[-10:]:  # 只取最后10帧
                if 'sqlalchemy' not in frame.filename.lower() and 'site-packages' not in frame.filename:
                    caller_info.append(f"{frame.filename}:{frame.lineno} in {frame.name}")

            logging.warning(f"🚨 检测到索引创建操作: {statement}")
            logging.warning(f"📞 调用者信息: {' -> '.join(caller_info)}")

            # 如果是 created_at_idx，特别标记
            if 'created_at_idx' in statement:
                logging.error(f"❌ 发现 created_at_idx 索引创建尝试！")
                logging.error(f"🔍 完整调用栈:")
                for frame in stack_trace[-15:]:
                    logging.error(f"   {frame.filename}:{frame.lineno} in {frame.name}")

# 在应用启动时设置事件监听器
def setup_logging_on_startup(app):
    """在应用启动时设置日志监听器"""
    with app.app_context():
        setup_index_creation_logging()
        logging.info("✅ 索引创建日志追踪已设置")
