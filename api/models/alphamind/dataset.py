"""
Dataset Model for AlphaMind
"""

import uuid
from datetime import datetime


class Dataset:
    def __init__(
        self,
        id: str | None = None,
        user_id: str | None = None,
        name: str = "",
        description: str = "",
        data_type: str = "text",
        status: str = "draft",
        config: dict | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
        metadata: dict | None = None
    ):
        self.id = id or str(uuid.uuid4())
        self.user_id = user_id
        self.name = name
        self.description = description
        self.data_type = data_type
        self.status = status
        self.config = config or {}
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
        self.metadata = metadata or {}
        
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'data_type': self.data_type,
            'status': self.status,
            'config': self.config,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'metadata': self.metadata
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Dataset':
        return cls(
            id=data.get('id'),
            user_id=data.get('user_id'),
            name=data.get('name', ''),
            description=data.get('description', ''),
            data_type=data.get('data_type', 'text'),
            status=data.get('status', 'draft'),
            config=data.get('config', {}),
            created_at=datetime.fromisoformat(data['created_at']) if data.get('created_at') else None,
            updated_at=datetime.fromisoformat(data['updated_at']) if data.get('updated_at') else None,
            metadata=data.get('metadata', {})
        )

