"""
AlphaMind 智能体控制器
"""

import logging
from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_login import login_required

agents_bp = Blueprint('alphamind_agents', __name__, url_prefix='/api/alphamind/agents')
logger = logging.getLogger(__name__)

@agents_bp.route('', methods=['GET'])
@login_required
def get_agents():
    """获取智能体列表"""
    try:
        # 模拟智能体数据
        agents = [
            {
                'id': 1,
                'name': '通用助手',
                'description': '帮助用户处理各种日常任务和问题',
                'type': 'assistant',
                'status': 'active',
                'model': 'gpt-3.5-turbo',
                'conversations': 156,
                'successRate': 94.5,
                'lastUsed': '2小时前',
                'createdAt': '2024-01-15',
                'config': {
                    'temperature': 0.7,
                    'maxTokens': 2048,
                    'systemPrompt': '你是一个有用的AI助手。'
                }
            },
            {
                'id': 2,
                'name': '数据分析师',
                'description': '专业的数据分析和可视化智能体',
                'type': 'analyst',
                'status': 'active',
                'model': 'gpt-4',
                'conversations': 89,
                'successRate': 97.2,
                'lastUsed': '30分钟前',
                'createdAt': '2024-01-10',
                'config': {
                    'temperature': 0.3,
                    'maxTokens': 4096,
                    'systemPrompt': '你是一个专业的数据分析师。'
                }
            }
        ]

        return jsonify({
            'success': True,
            'data': agents
        })

    except Exception as e:
        logger.exception("Failed to get agents")
        return jsonify({
            'success': False,
            'error': '获取智能体列表失败'
        }), 500

@agents_bp.route('', methods=['POST'])
@login_required
def create_agent():
    """创建智能体"""
    try:
        data = request.get_json()

        # 验证必需字段
        required_fields = ['name', 'description', 'type', 'model']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'{field} 不能为空'
                }), 400

        # 创建新智能体
        agent = {
            'id': int(datetime.now().timestamp()),
            'name': data['name'],
            'description': data['description'],
            'type': data['type'],
            'status': 'active',
            'model': data['model'],
            'conversations': 0,
            'successRate': 0,
            'lastUsed': '从未使用',
            'createdAt': datetime.now().strftime('%Y-%m-%d'),
            'config': data.get('config', {})
        }

        return jsonify({
            'success': True,
            'data': agent
        })

    except Exception as e:
        logger.exception("Failed to create agent")
        return jsonify({
            'success': False,
            'error': '创建智能体失败'
        }), 500

@agents_bp.route('/<int:agent_id>', methods=['PUT'])
@login_required
def update_agent(agent_id):
    """更新智能体"""
    try:
        data = request.get_json()

        # 模拟更新操作
        updated_agent = {
            'id': agent_id,
            'name': data.get('name', '更新的智能体'),
            'description': data.get('description', '更新的描述'),
            'type': data.get('type', 'assistant'),
            'status': data.get('status', 'active'),
            'model': data.get('model', 'gpt-3.5-turbo'),
            'conversations': 0,
            'successRate': 0,
            'lastUsed': '刚刚更新',
            'createdAt': '2024-01-15',
            'config': data.get('config', {})
        }

        return jsonify({
            'success': True,
            'data': updated_agent
        })

    except Exception as e:
        logger.exception("Failed to update agent")
        return jsonify({
            'success': False,
            'error': '更新智能体失败'
        }), 500

@agents_bp.route('/<int:agent_id>', methods=['DELETE'])
@login_required
def delete_agent(agent_id):
    """删除智能体"""
    try:
        return jsonify({
            'success': True,
            'message': '智能体已删除'
        })

    except Exception as e:
        logger.exception("Failed to delete agent")
        return jsonify({
            'success': False,
            'error': '删除智能体失败'
        }), 500

