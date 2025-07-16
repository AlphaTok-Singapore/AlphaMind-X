"""
Message Model for AlphaMind

Defines the structure and behavior of message entities.
Messages represent individual chat messages within conversations.
"""

import uuid
from datetime import datetime


class Message:
    """
    Message model representing a single chat message
    """
    
    def __init__(
        self,
        id: str | None = None,
        conversation_id: str | None = None,
        sender: str = "user",  # user, assistant, system
        content: str = "",
        message_type: str = "text",  # text, image, file, system
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
        metadata: dict | None = None,
        attachments: list | None = None
    ):
        self.id = id or str(uuid.uuid4())
        self.conversation_id = conversation_id
        self.sender = sender
        self.content = content
        self.message_type = message_type
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
        self.metadata = metadata or {}
        self.attachments = attachments or []
        
    def to_dict(self) -> dict:
        """Convert message to dictionary"""
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'sender': self.sender,
            'content': self.content,
            'message_type': self.message_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'metadata': self.metadata,
            'attachments': self.attachments,
            'word_count': self.get_word_count(),
            'character_count': len(self.content)
        }
    
    def get_word_count(self) -> int:
        """Get word count of the message content"""
        if not self.content:
            return 0
        return len(self.content.split())
    
    def get_character_count(self) -> int:
        """Get character count of the message content"""
        return len(self.content)
    
    def add_attachment(self, attachment: dict):
        """Add an attachment to the message"""
        self.attachments.append(attachment)
        self.updated_at = datetime.utcnow()
    
    def remove_attachment(self, attachment_id: str):
        """Remove an attachment from the message"""
        self.attachments = [att for att in self.attachments if att.get('id') != attachment_id]
        self.updated_at = datetime.utcnow()
    
    def update_content(self, new_content: str):
        """Update message content"""
        self.content = new_content
        self.updated_at = datetime.utcnow()
    
    def update_metadata(self, key: str, value):
        """Update metadata"""
        self.metadata[key] = value
        self.updated_at = datetime.utcnow()
    
    def is_from_user(self) -> bool:
        """Check if message is from user"""
        return self.sender == "user"
    
    def is_from_assistant(self) -> bool:
        """Check if message is from assistant"""
        return self.sender == "assistant"
    
    def is_system_message(self) -> bool:
        """Check if message is a system message"""
        return self.sender == "system"
    
    def has_attachments(self) -> bool:
        """Check if message has attachments"""
        return len(self.attachments) > 0
    
    def get_attachment_count(self) -> int:
        """Get number of attachments"""
        return len(self.attachments)
    
    def get_attachments_by_type(self, attachment_type: str) -> list[dict]:
        """Get attachments filtered by type"""
        return [att for att in self.attachments if att.get('type') == attachment_type]
    
    def get_summary(self) -> dict:
        """Get message summary"""
        return {
            'id': self.id,
            'sender': self.sender,
            'message_type': self.message_type,
            'content_preview': self.content[:100] + "..." if len(self.content) > 100 else self.content,
            'word_count': self.get_word_count(),
            'character_count': self.get_character_count(),
            'attachment_count': self.get_attachment_count(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Message':
        """Create message from dictionary"""
        return cls(
            id=data.get('id'),
            conversation_id=data.get('conversation_id'),
            sender=data.get('sender', 'user'),
            content=data.get('content', ''),
            message_type=data.get('message_type', 'text'),
            created_at=datetime.fromisoformat(data['created_at']) if data.get('created_at') else None,
            updated_at=datetime.fromisoformat(data['updated_at']) if data.get('updated_at') else None,
            metadata=data.get('metadata', {}),
            attachments=data.get('attachments', [])
        )
    
    @classmethod
    def create_user_message(cls, conversation_id: str, content: str, message_type: str = "text") -> 'Message':
        """Create a user message"""
        return cls(
            conversation_id=conversation_id,
            sender="user",
            content=content,
            message_type=message_type
        )
    
    @classmethod
    def create_assistant_message(cls, conversation_id: str, content: str, message_type: str = "text") -> 'Message':
        """Create an assistant message"""
        return cls(
            conversation_id=conversation_id,
            sender="assistant",
            content=content,
            message_type=message_type
        )
    
    @classmethod
    def create_system_message(cls, conversation_id: str, content: str) -> 'Message':
        """Create a system message"""
        return cls(
            conversation_id=conversation_id,
            sender="system",
            content=content,
            message_type="system"
        )
    
    def __repr__(self):
        return f"<Message(id='{self.id}', sender='{self.sender}', type='{self.message_type}')>"
    
    def __str__(self):
        content_preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"Message from {self.sender}: {content_preview}"

