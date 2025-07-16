from flask import Blueprint, request, jsonify
from models.alphamind import db, Conversation, Message
from datetime import datetime

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/conversations', methods=['GET'])
def get_conversations():
    """获取用户的所有对话"""
    user_id = request.args.get('user_id', 1)  # 默认用户ID为1

    conversations = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.updated_at.desc()).all()

    return jsonify({
        'success': True,
        'data': [conv.to_dict() for conv in conversations]
    })

@chat_bp.route('/conversations', methods=['POST'])
def create_conversation():
    """创建新对话"""
    data = request.get_json()
    user_id = data.get('user_id', 1)
    title = data.get('title', 'New Conversation')

    conversation = Conversation(
        title=title,
        user_id=user_id
    )

    db.session.add(conversation)
    db.session.commit()

    # 添加初始消息
    initial_message = Message(
        conversation_id=conversation.id,
        role='assistant',
        content='Hello, I am your AI assistant. How can I help you today?'
    )

    db.session.add(initial_message)
    db.session.commit()

    return jsonify({
        'success': True,
        'data': conversation.to_dict()
    })

@chat_bp.route('/conversations/<int:conversation_id>/messages', methods=['GET'])
def get_messages(conversation_id):
    """获取对话中的所有消息"""
    messages = Message.query.filter_by(conversation_id=conversation_id).order_by(Message.created_at.asc()).all()

    return jsonify({
        'success': True,
        'data': [msg.to_dict() for msg in messages]
    })

@chat_bp.route('/conversations/<int:conversation_id>/messages', methods=['POST'])
def send_message(conversation_id):
    """发送消息"""
    data = request.get_json()
    content = data.get('content', '')
    role = data.get('role', 'user')

    if not content:
        return jsonify({
            'success': False,
            'error': 'Message content is required'
        }), 400

    # 添加用户消息
    user_message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content
    )

    db.session.add(user_message)

    # 更新对话的更新时间
    conversation = Conversation.query.get(conversation_id)
    if conversation:
        conversation.updated_at = datetime.utcnow()

    db.session.commit()

    # 模拟AI回复（在实际应用中，这里会调用AI模型）
    if role == 'user':
        ai_response = f"I understand you said: '{content}'. This is a simulated response from the AlphaMind backend. In a real implementation, this would connect to AI models and provide intelligent responses."

        ai_message = Message(
            conversation_id=conversation_id,
            role='assistant',
            content=ai_response
        )

        db.session.add(ai_message)
        db.session.commit()

        return jsonify({
            'success': True,
            'data': {
                'user_message': user_message.to_dict(),
                'ai_message': ai_message.to_dict()
            }
        })

    return jsonify({
        'success': True,
        'data': user_message.to_dict()
    })

@chat_bp.route('/conversations/<int:conversation_id>', methods=['PUT'])
def update_conversation(conversation_id):
    """更新对话信息"""
    data = request.get_json()

    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({
            'success': False,
            'error': 'Conversation not found'
        }), 404

    if 'title' in data:
        conversation.title = data['title']

    conversation.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'success': True,
        'data': conversation.to_dict()
    })

@chat_bp.route('/conversations/<int:conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    """删除对话"""
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({
            'success': False,
            'error': 'Conversation not found'
        }), 404

    db.session.delete(conversation)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Conversation deleted successfully'
    })

