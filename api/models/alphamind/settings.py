"""
Settings Model for AlphaMind
"""

import uuid
from datetime import datetime


class Settings:
    def __init__(
        self,
        id: str | None = None,
        user_id: str | None = None,
        category: str = "general",
        settings_data: dict | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
        metadata: dict | None = None
    ):
        self.id = id or str(uuid.uuid4())
        self.user_id = user_id
        self.category = category
        self.settings_data = settings_data or {}
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
        self.metadata = metadata or {}
        
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'category': self.category,
            'settings_data': self.settings_data,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'metadata': self.metadata
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Settings':
        return cls(
            id=data.get('id'),
            user_id=data.get('user_id'),
            category=data.get('category', 'general'),
            settings_data=data.get('settings_data', {}),
            created_at=datetime.fromisoformat(data['created_at']) if data.get('created_at') else None,
            updated_at=datetime.fromisoformat(data['updated_at']) if data.get('updated_at') else None,
            metadata=data.get('metadata', {})
        )

