"""
Skill Model for AlphaMind

Defines the structure and behavior of skill entities.
Skills represent specific capabilities that can be assigned to AI agents.
"""

import uuid
from datetime import datetime


class Skill:
    """
    Skill model representing a specific AI capability
    """
    
    def __init__(
        self,
        id: str | None = None,
        name: str = "",
        description: str = "",
        category: str = "general",
        skill_type: str = "built_in",  # built_in, custom, third_party
        config: dict | None = None,
        requirements: list[str] | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
        metadata: dict | None = None
    ):
        self.id = id or str(uuid.uuid4())
        self.name = name
        self.description = description
        self.category = category
        self.skill_type = skill_type
        self.config = config or {}
        self.requirements = requirements or []
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
        self.metadata = metadata or {}
        
    def to_dict(self) -> dict:
        """Convert skill to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'skill_type': self.skill_type,
            'config': self.config,
            'requirements': self.requirements,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'metadata': self.metadata
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Skill':
        """Create skill from dictionary"""
        return cls(
            id=data.get('id'),
            name=data.get('name', ''),
            description=data.get('description', ''),
            category=data.get('category', 'general'),
            skill_type=data.get('skill_type', 'built_in'),
            config=data.get('config', {}),
            requirements=data.get('requirements', []),
            created_at=datetime.fromisoformat(data['created_at']) if data.get('created_at') else None,
            updated_at=datetime.fromisoformat(data['updated_at']) if data.get('updated_at') else None,
            metadata=data.get('metadata', {})
        )
    
    def __repr__(self):
        return f"<Skill(id='{self.id}', name='{self.name}', category='{self.category}')>"

