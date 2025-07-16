"""
Chat Controller for AlphaMind

Handles all chat-related HTTP requests including:
- Creating new conversations
- Sending messages
- Retrieving conversation history
- Managing chat sessions
"""

import logging

from flask import Blueprint, jsonify, request
from flask_cors import cross_origin

from services.alphamind.chat_service import ChatService

# Create blueprint
chat_bp = Blueprint('alphamind_chat', __name__, url_prefix='/api/alphamind/chat')

# Initialize service
chat_service = ChatService()

logger = logging.getLogger(__name__)


class ChatController:
    """Chat Controller Class"""

    @staticmethod
    @chat_bp.route('/conversations', methods=['GET'])
    @cross_origin()
    def get_conversations():
        """Get all conversations for the current user"""
        try:
            user_id = request.args.get('user_id', 'default_user')
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 20))

            conversations = chat_service.get_user_conversations(
                user_id=user_id,
                page=page,
                limit=limit
            )

            return jsonify({
                'success': True,
                'data': conversations,
                'message': 'Conversations retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting conversations: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve conversations'
            }), 500

    @staticmethod
    @chat_bp.route('/conversations', methods=['POST'])
    @cross_origin()
    def create_conversation():
        """Create a new conversation"""
        try:
            data = request.get_json()

            if not data:
                return jsonify({
                    'success': False,
                    'message': 'Request body is required'
                }), 400

            user_id = data.get('user_id', 'default_user')
            title = data.get('title', 'New Conversation')
            agent_id = data.get('agent_id')

            conversation = chat_service.create_conversation(
                user_id=user_id,
                title=title,
                agent_id=agent_id
            )

            return jsonify({
                'success': True,
                'data': conversation,
                'message': 'Conversation created successfully'
            }), 201

        except Exception as e:
            logger.exception("Error creating conversation: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to create conversation'
            }), 500

    @staticmethod
    @chat_bp.route('/conversations/<conversation_id>', methods=['GET'])
    @cross_origin()
    def get_conversation(conversation_id):
        """Get a specific conversation with messages"""
        try:
            conversation = chat_service.get_conversation_with_messages(conversation_id)

            if not conversation:
                return jsonify({
                    'success': False,
                    'message': 'Conversation not found'
                }), 404

            return jsonify({
                'success': True,
                'data': conversation,
                'message': 'Conversation retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting conversation: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve conversation'
            }), 500

    @staticmethod
    @chat_bp.route('/conversations/<conversation_id>/messages', methods=['POST'])
    @cross_origin()
    def send_message(conversation_id):
        """Send a message in a conversation"""
        try:
            data = request.get_json()

            if not data or not data.get('content'):
                return jsonify({
                    'success': False,
                    'message': 'Message content is required'
                }), 400

            user_id = data.get('user_id', 'default_user')
            content = data.get('content')
            message_type = data.get('type', 'text')

            # Send user message
            user_message = chat_service.send_message(
                conversation_id=conversation_id,
                user_id=user_id,
                content=content,
                sender='user',
                message_type=message_type
            )

            # Generate AI response
            ai_response = chat_service.generate_ai_response(
                conversation_id=conversation_id,
                user_message=content
            )

            # Send AI message
            ai_message = chat_service.send_message(
                conversation_id=conversation_id,
                user_id=user_id,
                content=ai_response,
                sender='assistant',
                message_type='text'
            )

            return jsonify({
                'success': True,
                'data': {
                    'user_message': user_message,
                    'ai_message': ai_message
                },
                'message': 'Message sent successfully'
            }), 201

        except Exception as e:
            logger.exception("Error sending message: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to send message'
            }), 500

    @staticmethod
    @chat_bp.route('/conversations/<conversation_id>', methods=['DELETE'])
    @cross_origin()
    def delete_conversation(conversation_id):
        """Delete a conversation"""
        try:
            success = chat_service.delete_conversation(conversation_id)

            if not success:
                return jsonify({
                    'success': False,
                    'message': 'Conversation not found'
                }), 404

            return jsonify({
                'success': True,
                'message': 'Conversation deleted successfully'
            }), 200

        except Exception as e:
            logger.exception("Error deleting conversation: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to delete conversation'
            }), 500

    @staticmethod
    @chat_bp.route('/conversations/<conversation_id>/title', methods=['PUT'])
    @cross_origin()
    def update_conversation_title(conversation_id):
        """Update conversation title"""
        try:
            data = request.get_json()

            if not data or not data.get('title'):
                return jsonify({
                    'success': False,
                    'message': 'Title is required'
                }), 400

            title = data.get('title')

            success = chat_service.update_conversation_title(conversation_id, title)

            if not success:
                return jsonify({
                    'success': False,
                    'message': 'Conversation not found'
                }), 404

            return jsonify({
                'success': True,
                'message': 'Conversation title updated successfully'
            }), 200

        except Exception as e:
            logger.exception("Error updating conversation title: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to update conversation title'
            }), 500


# Register error handlers
@chat_bp.errorhandler(400)
def bad_request(error):
    return jsonify({
        'success': False,
        'message': 'Bad request',
        'error': str(error)
    }), 400


@chat_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Resource not found',
        'error': str(error)
    }), 404


@chat_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error',
        'error': str(error)
    }), 500

