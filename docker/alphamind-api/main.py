#!/usr/bin/env python3
"""
AlphaMind API 主应用
"""

import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_jwt_extended import JWTManager
from datetime import timedelta

# 初始化扩展
db = SQLAlchemy()
login_manager = LoginManager()
jwt = JWTManager()

def create_app():
    """创建 Flask 应用"""
    app = Flask(__name__)
    
    # 配置
    app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'alphamind-secret-key-2024')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:difyai123456@db:5432/dify')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'alphamind-secret-key-2024')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    
    # 初始化扩展
    db.init_app(app)
    login_manager.init_app(app)
    jwt.init_app(app)
    
    # 配置 CORS
    CORS(app, origins="*", supports_credentials=True)
    
    # 配置日志
    logging.basicConfig(level=logging.INFO)
    
    # 注册蓝图
    from routes.agents import agents_bp
    from routes.chat import chat_bp
    from routes.data import data_bp
    from routes.workflows import workflows_bp
    
    app.register_blueprint(agents_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(data_bp)
    app.register_blueprint(workflows_bp)
    
    # 健康检查端点
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'alphamind-api',
            'version': '1.0.0'
        })
    
    # 根路径
    @app.route('/')
    def index():
        return jsonify({
            'message': 'AlphaMind API Server',
            'version': '1.0.0',
            'status': 'running'
        })
    
    # 错误处理
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'API endpoint not found'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500
    
    return app

# 创建应用实例
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)

