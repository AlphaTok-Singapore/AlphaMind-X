"""
Conversation Model for AlphaMind

Defines the structure and behavior of conversation entities.
Conversations represent chat sessions between users and AI agents.
"""

import uuid
from datetime import datetime
from typing import Optional


class Conversation:
    """
    Conversation model representing a chat session
    """
    
    def __init__(
        self,
        id: str | None = None,
        user_id: str | None = None,
        agent_id: str | None = None,
        title: str = "New Conversation",
        status: str = "active",
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
        metadata: dict | None = None
    ):
        self.id = id or str(uuid.uuid4())
        self.user_id = user_id
        self.agent_id = agent_id
        self.title = title
        self.status = status  # active, archived, deleted
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
        self.metadata = metadata or {}
        self.messages = []  # Will be populated separately
        
    def to_dict(self) -> dict:
        """Convert conversation to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'agent_id': self.agent_id,
            'title': self.title,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'metadata': self.metadata,
            'message_count': len(self.messages),
            'last_message_at': self.get_last_message_time()
        }
    
    def get_last_message_time(self) -> Optional[str]:
        """Get the timestamp of the last message"""
        if self.messages:
            last_message = max(self.messages, key=lambda m: m.created_at)
            return last_message.created_at.isoformat()
        return None
    
    def add_message(self, message):
        """Add a message to the conversation"""
        self.messages.append(message)
        self.updated_at = datetime.utcnow()
    
    def get_message_count(self) -> int:
        """Get the total number of messages in the conversation"""
        return len(self.messages)
    
    def get_messages_by_sender(self, sender: str) -> list:
        """Get messages filtered by sender"""
        return [msg for msg in self.messages if msg.sender == sender]
    
    def update_title(self, new_title: str):
        """Update conversation title"""
        self.title = new_title
        self.updated_at = datetime.utcnow()
    
    def archive(self):
        """Archive the conversation"""
        self.status = "archived"
        self.updated_at = datetime.utcnow()
    
    def activate(self):
        """Activate the conversation"""
        self.status = "active"
        self.updated_at = datetime.utcnow()
    
    def delete(self):
        """Mark conversation as deleted"""
        self.status = "deleted"
        self.updated_at = datetime.utcnow()
    
    def update_metadata(self, key: str, value):
        """Update metadata"""
        self.metadata[key] = value
        self.updated_at = datetime.utcnow()
    
    def get_summary(self) -> dict:
        """Get conversation summary"""
        user_messages = len(self.get_messages_by_sender('user'))
        assistant_messages = len(self.get_messages_by_sender('assistant'))
        
        return {
            'id': self.id,
            'title': self.title,
            'status': self.status,
            'total_messages': self.get_message_count(),
            'user_messages': user_messages,
            'assistant_messages': assistant_messages,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_message_at': self.get_last_message_time(),
            'agent_id': self.agent_id
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Conversation':
        """Create conversation from dictionary"""
        return cls(
            id=data.get('id'),
            user_id=data.get('user_id'),
            agent_id=data.get('agent_id'),
            title=data.get('title', 'New Conversation'),
            status=data.get('status', 'active'),
            created_at=datetime.fromisoformat(data['created_at']) if data.get('created_at') else None,
            updated_at=datetime.fromisoformat(data['updated_at']) if data.get('updated_at') else None,
            metadata=data.get('metadata', {})
        )
    
    def __repr__(self):
        return f"<Conversation(id='{self.id}', title='{self.title}', status='{self.status}')>"
    
    def __str__(self):
        return f"Conversation: {self.title} ({self.get_message_count()} messages)"

