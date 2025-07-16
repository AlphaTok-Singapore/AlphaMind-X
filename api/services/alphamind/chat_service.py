"""
Chat Service for AlphaMind

Business logic for chat functionality including:
- Conversation management
- Message processing
- AI response generation
"""

import logging
from typing import Optional

from core.alphamind.ai_engine import AIEngine
from models.alphamind.conversation import Conversation
from models.alphamind.message import Message

logger = logging.getLogger(__name__)


class ChatService:
    """Service class for chat operations"""

    def __init__(self):
        self.ai_engine = AIEngine()
        self.conversations = {}  # In-memory storage for demo
        self.messages = {}

    def get_user_conversations(self, user_id: str, page: int = 1, limit: int = 20) -> list[dict]:
        """Get conversations for a user"""
        try:
            user_conversations = [
                conv for conv in self.conversations.values()
                if conv.user_id == user_id and conv.status != 'deleted'
            ]

            # Sort by updated_at desc
            user_conversations.sort(key=lambda x: x.updated_at, reverse=True)

            # Pagination
            start = (page - 1) * limit
            end = start + limit
            paginated = user_conversations[start:end]

            return [conv.to_dict() for conv in paginated]

        except Exception as e:
            logger.exception("Error getting user conversations: ")
            raise

    def create_conversation(self, user_id: str, title: str | None = None, agent_id: str | None = None) -> dict:
        """Create a new conversation"""
        try:
            conversation = Conversation(
                user_id=user_id,
                title=title or "New Conversation",
                agent_id=agent_id
            )

            self.conversations[conversation.id] = conversation

            return conversation.to_dict()

        except Exception as e:
            logger.exception("Error creating conversation: ")
            raise

    def get_conversation_with_messages(self, conversation_id: str) -> Optional[dict]:
        """Get conversation with its messages"""
        try:
            conversation = self.conversations.get(conversation_id)
            if not conversation:
                return None

            # Get messages for this conversation
            conv_messages = [
                msg for msg in self.messages.values()
                if msg.conversation_id == conversation_id
            ]

            # Sort by created_at
            conv_messages.sort(key=lambda x: x.created_at)
            conversation.messages = conv_messages

            result = conversation.to_dict()
            result['messages'] = [msg.to_dict() for msg in conv_messages]

            return result

        except Exception as e:
            logger.exception("Error getting conversation with messages: ")
            raise

    def send_message(self, conversation_id: str, user_id: str, content: str,
                    sender: str = 'user', message_type: str = 'text') -> dict:
        """Send a message in a conversation"""
        try:
            conversation = self.conversations.get(conversation_id)
            if not conversation:
                raise ValueError("Conversation not found")

            message = Message(
                conversation_id=conversation_id,
                sender=sender,
                content=content,
                message_type=message_type
            )

            self.messages[message.id] = message
            conversation.add_message(message)

            return message.to_dict()

        except Exception as e:
            logger.exception("Error sending message: ")
            raise

    def generate_ai_response(self, conversation_id: str, user_message: str) -> str:
        """Generate AI response to user message"""
        try:
            # Get conversation context
            conversation = self.conversations.get(conversation_id)
            if not conversation:
                raise ValueError("Conversation not found")

            # Get recent messages for context
            recent_messages = [
                msg for msg in self.messages.values()
                if msg.conversation_id == conversation_id
            ]
            recent_messages.sort(key=lambda x: x.created_at)
            recent_messages = recent_messages[-10:]  # Last 10 messages

            # Generate response using AI engine
            response = self.ai_engine.generate_response(
                user_message=user_message,
                conversation_history=recent_messages,
                agent_id=conversation.agent_id
            )

            return response

        except Exception as e:
            logger.exception("Error generating AI response: ")
            return "I apologize, but I'm having trouble generating a response right now. Please try again."

    def delete_conversation(self, conversation_id: str) -> bool:
        """Delete a conversation"""
        try:
            conversation = self.conversations.get(conversation_id)
            if not conversation:
                return False

            conversation.delete()
            return True

        except Exception as e:
            logger.exception("Error deleting conversation: ")
            raise

    def update_conversation_title(self, conversation_id: str, title: str) -> bool:
        """Update conversation title"""
        try:
            conversation = self.conversations.get(conversation_id)
            if not conversation:
                return False

            conversation.update_title(title)
            return True

        except Exception as e:
            logger.exception("Error updating conversation title: ")
            raise

