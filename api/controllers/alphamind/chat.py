"""
AlphaMind 聊天控制器
集成到 Dify API 中的 AlphaMind 聊天功能
"""

import logging
from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

# 创建蓝图
chat_bp = Blueprint('alphamind_chat', __name__, url_prefix='/api/alphamind/chat')

logger = logging.getLogger(__name__)

@chat_bp.route('/conversations', methods=['GET'])
@login_required
def get_conversations():
    """获取用户的对话列表"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)

        # 模拟数据 - 实际应该从数据库获取
        conversations = [
            {
                'id': 'conv_1',
                'title': '与通用助手的对话',
                'agent_id': 1,
                'user_id': current_user.id,
                'status': 'active',
                'created_at': '2024-01-20T10:00:00Z',
                'updated_at': '2024-01-20T10:30:00Z',
                'message_count': 15
            },
            {
                'id': 'conv_2',
                'title': '数据分析任务',
                'agent_id': 2,
                'user_id': current_user.id,
                'status': 'active',
                'created_at': '2024-01-19T14:00:00Z',
                'updated_at': '2024-01-19T15:45:00Z',
                'message_count': 8
            }
        ]

        return jsonify({
            'success': True,
            'data': conversations,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': len(conversations),
                'pages': 1
            }
        })

    except Exception as e:
        logger.exception("Failed to get conversations")
        return jsonify({
            'success': False,
            'error': '获取对话列表失败'
        }), 500

@chat_bp.route('/conversations', methods=['POST'])
@login_required
def create_conversation():
    """创建新对话"""
    try:
        data = request.get_json()
        agent_id = data.get('agent_id')
        title = data.get('title', '新对话')

        if not agent_id:
            return jsonify({
                'success': False,
                'error': '智能体ID不能为空'
            }), 400

        # 创建新对话
        conversation = {
            'id': f'conv_{datetime.now().timestamp()}',
            'title': title,
            'agent_id': agent_id,
            'user_id': current_user.id,
            'status': 'active',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'message_count': 0
        }

        return jsonify({
            'success': True,
            'data': conversation
        })

    except Exception as e:
        logger.exception("Failed to create conversation")
        return jsonify({
            'success': False,
            'error': '创建对话失败'
        }), 500

@chat_bp.route('/conversations/<conversation_id>/messages', methods=['GET'])
@login_required
def get_messages(conversation_id):
    """获取对话消息"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 50, type=int)

        # 模拟消息数据
        messages = [
            {
                'id': 'msg_1',
                'conversation_id': conversation_id,
                'role': 'user',
                'content': '你好，请帮我分析一下这个数据集',
                'agent_id': None,
                'created_at': '2024-01-20T10:00:00Z',
                'metadata': {}
            },
            {
                'id': 'msg_2',
                'conversation_id': conversation_id,
                'role': 'assistant',
                'content': (
                    '您好！我很乐意帮您分析数据集。请您提供数据集的详细信息，'
                    '包括数据类型、大小和您希望进行的分析类型。'
                ),
                'agent_id': 1,
                'created_at': '2024-01-20T10:00:30Z',
                'metadata': {}
            }
        ]

        return jsonify({
            'success': True,
            'data': messages,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': len(messages),
                'pages': 1
            }
        })

    except Exception as e:
        logger.exception("Failed to get messages")
        return jsonify({
            'success': False,
            'error': '获取消息失败'
        }), 500

@chat_bp.route('/conversations/<conversation_id>/messages', methods=['POST'])
@login_required
def send_message(conversation_id):
    """发送消息"""
    try:
        data = request.get_json()
        content = data.get('content', '').strip()
        agent_id = data.get('agent_id')

        if not content:
            return jsonify({
                'success': False,
                'error': '消息内容不能为空'
            }), 400

        if not agent_id:
            return jsonify({
                'success': False,
                'error': '智能体ID不能为空'
            }), 400

        # 创建用户消息
        user_message = {
            'id': f'msg_user_{datetime.now().timestamp()}',
            'conversation_id': conversation_id,
            'role': 'user',
            'content': content,
            'agent_id': None,
            'created_at': datetime.now().isoformat(),
            'metadata': {}
        }

        # 模拟智能体响应
        assistant_response = generate_mock_response(content, agent_id)
        assistant_message = {
            'id': f'msg_assistant_{datetime.now().timestamp()}',
            'conversation_id': conversation_id,
            'role': 'assistant',
            'content': assistant_response,
            'agent_id': agent_id,
            'created_at': datetime.now().isoformat(),
            'metadata': {}
        }

        return jsonify({
            'success': True,
            'data': {
                'user_message': user_message,
                'assistant_message': assistant_message
            }
        })

    except Exception as e:
        logger.exception("Failed to send message")
        return jsonify({
            'success': False,
            'error': '发送消息失败'
        }), 500

@chat_bp.route('/conversations/<conversation_id>', methods=['DELETE'])
@login_required
def delete_conversation(conversation_id):
    """删除对话"""
    try:
        # 这里应该实际删除数据库中的对话
        return jsonify({
            'success': True,
            'message': '对话已删除'
        })

    except Exception as e:
        logger.exception("Failed to delete conversation")
        return jsonify({
            'success': False,
            'error': '删除对话失败'
        }), 500

def generate_mock_response(user_input: str, agent_id: int) -> str:
    """生成模拟的智能体响应"""
    responses = {
        1: [  # 通用助手
            "我很乐意帮助您！请告诉我您需要什么帮助。",
            "这是一个很好的问题。让我为您详细解答。",
            "根据您的描述，我建议您可以尝试以下方法..."
        ],
        2: [  # 数据分析师
            "让我为您分析这些数据。根据初步观察，我发现了以下趋势...",
            "这个数据集很有趣。我建议我们从以下几个维度进行分析...",
            "基于统计分析，我可以为您生成相应的图表和报告。"
        ],
        3: [  # 内容创作者
            "这是一个很棒的创意！让我为您展开这个想法...",
            "我可以帮您创作高质量的内容。您希望什么风格和语调？",
            "让我为您创作一些引人入胜的内容..."
        ],
        4: [  # 工作流执行器
            "我已经为您设计了一个自动化工作流程...",
            "这个任务可以通过工作流自动化完成。让我为您配置...",
            "工作流已经启动，我会实时为您更新执行状态。"
        ]
    }

    agent_responses = responses.get(agent_id, responses[1])
    import secrets
    return secrets.choice(agent_responses)

# 错误处理
@chat_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': '接口不存在'
    }), 404

@chat_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': '服务器内部错误'
    }), 500

