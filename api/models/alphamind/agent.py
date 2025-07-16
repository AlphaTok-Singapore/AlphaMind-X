"""
Agent Model for AlphaMind

Defines the structure and behavior of AI agent entities.
Agents represent AI assistants with specific capabilities and configurations.
"""

import uuid
from datetime import datetime


class Agent:
    """
    Agent model representing an AI assistant
    """
    
    def __init__(
        self,
        id: str | None = None,
        user_id: str | None = None,
        name: str = "AI Assistant",
        description: str = "",
        agent_type: str = "general",  # customer_support, sales, technical, general
        status: str = "inactive",  # active, inactive, training
        config: dict | None = None,
        skills: list[str] | None = None,
        knowledge_bases: list[str] | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
        metadata: dict | None = None
    ):
        self.id = id or str(uuid.uuid4())
        self.user_id = user_id
        self.name = name
        self.description = description
        self.agent_type = agent_type
        self.status = status
        self.config = config or {}
        self.skills = skills or []
        self.knowledge_bases = knowledge_bases or []
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
        self.metadata = metadata or {}
        
        # Performance metrics
        self.conversations_count = 0
        self.messages_count = 0
        self.accuracy_score = 0.0
        self.last_active_at = None
        
    def to_dict(self) -> dict:
        """Convert agent to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'agent_type': self.agent_type,
            'status': self.status,
            'config': self.config,
            'skills': self.skills,
            'knowledge_bases': self.knowledge_bases,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_active_at': self.last_active_at.isoformat() if self.last_active_at else None,
            'metadata': self.metadata,
            'performance': {
                'conversations_count': self.conversations_count,
                'messages_count': self.messages_count,
                'accuracy_score': self.accuracy_score
            }
        }
    
    def activate(self):
        """Activate the agent"""
        self.status = "active"
        self.updated_at = datetime.utcnow()
    
    def deactivate(self):
        """Deactivate the agent"""
        self.status = "inactive"
        self.updated_at = datetime.utcnow()
    
    def start_training(self):
        """Start training the agent"""
        self.status = "training"
        self.updated_at = datetime.utcnow()
    
    def add_skill(self, skill_id: str):
        """Add a skill to the agent"""
        if skill_id not in self.skills:
            self.skills.append(skill_id)
            self.updated_at = datetime.utcnow()
    
    def remove_skill(self, skill_id: str):
        """Remove a skill from the agent"""
        if skill_id in self.skills:
            self.skills.remove(skill_id)
            self.updated_at = datetime.utcnow()
    
    def add_knowledge_base(self, kb_id: str):
        """Add a knowledge base to the agent"""
        if kb_id not in self.knowledge_bases:
            self.knowledge_bases.append(kb_id)
            self.updated_at = datetime.utcnow()
    
    def remove_knowledge_base(self, kb_id: str):
        """Remove a knowledge base from the agent"""
        if kb_id in self.knowledge_bases:
            self.knowledge_bases.remove(kb_id)
            self.updated_at = datetime.utcnow()
    
    def update_config(self, key: str, value):
        """Update agent configuration"""
        self.config[key] = value
        self.updated_at = datetime.utcnow()
    
    def update_metadata(self, key: str, value):
        """Update metadata"""
        self.metadata[key] = value
        self.updated_at = datetime.utcnow()
    
    def update_performance(
        self,
        conversations: int | None = None,
        messages: int | None = None,
        accuracy: float | None = None
    ):
        """Update performance metrics"""
        if conversations is not None:
            self.conversations_count = conversations
        if messages is not None:
            self.messages_count = messages
        if accuracy is not None:
            self.accuracy_score = accuracy
        self.updated_at = datetime.utcnow()
    
    def record_activity(self):
        """Record agent activity"""
        self.last_active_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def is_active(self) -> bool:
        """Check if agent is active"""
        return self.status == "active"
    
    def is_training(self) -> bool:
        """Check if agent is in training"""
        return self.status == "training"
    
    def get_skill_count(self) -> int:
        """Get number of skills"""
        return len(self.skills)
    
    def get_knowledge_base_count(self) -> int:
        """Get number of knowledge bases"""
        return len(self.knowledge_bases)
    
    def get_summary(self) -> dict:
        """Get agent summary"""
        return {
            'id': self.id,
            'name': self.name,
            'agent_type': self.agent_type,
            'status': self.status,
            'skill_count': self.get_skill_count(),
            'knowledge_base_count': self.get_knowledge_base_count(),
            'conversations_count': self.conversations_count,
            'accuracy_score': self.accuracy_score,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_active_at': self.last_active_at.isoformat() if self.last_active_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Agent':
        """Create agent from dictionary"""
        agent = cls(
            id=data.get('id'),
            user_id=data.get('user_id'),
            name=data.get('name', 'AI Assistant'),
            description=data.get('description', ''),
            agent_type=data.get('agent_type', 'general'),
            status=data.get('status', 'inactive'),
            config=data.get('config', {}),
            skills=data.get('skills', []),
            knowledge_bases=data.get('knowledge_bases', []),
            created_at=datetime.fromisoformat(data['created_at']) if data.get('created_at') else None,
            updated_at=datetime.fromisoformat(data['updated_at']) if data.get('updated_at') else None,
            metadata=data.get('metadata', {})
        )
        
        # Set performance metrics
        performance = data.get('performance', {})
        agent.conversations_count = performance.get('conversations_count', 0)
        agent.messages_count = performance.get('messages_count', 0)
        agent.accuracy_score = performance.get('accuracy_score', 0.0)
        
        if data.get('last_active_at'):
            agent.last_active_at = datetime.fromisoformat(data['last_active_at'])
            
        return agent
    
    def __repr__(self):
        return f"<Agent(id='{self.id}', name='{self.name}', type='{self.agent_type}', status='{self.status}')>"
    
    def __str__(self):
        return f"Agent: {self.name} ({self.agent_type}) - {self.status}"

