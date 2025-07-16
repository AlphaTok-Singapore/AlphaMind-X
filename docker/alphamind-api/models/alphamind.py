from models.user import db
from datetime import datetime
import json

class Conversation(db.Model):
    __tablename__ = 'conversations'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False, default='New Conversation')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    messages = db.relationship('Message', backref='conversation', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'message_count': len(self.messages)
        }

class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'user' or 'assistant'
    content = db.Column(db.Text, nullable=False)
    message_metadata = db.Column(db.Text)  # JSON string for additional data
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'role': self.role,
            'content': self.content,
            'metadata': json.loads(self.message_metadata) if self.message_metadata else {},
            'created_at': self.created_at.isoformat()
        }

class Agent(db.Model):
    __tablename__ = 'agents'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    avatar = db.Column(db.String(10), default='🤖')
    category = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='draft')  # 'active', 'inactive', 'draft'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Configuration
    skills = db.Column(db.Text)  # JSON array of skills
    mcp_tools = db.Column(db.Text)  # JSON array of MCP tools
    system_prompt = db.Column(db.Text)
    model_config = db.Column(db.Text)  # JSON object for model configuration

    # Statistics
    usage_count = db.Column(db.Integer, default=0)
    success_rate = db.Column(db.Float, default=0.0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_used = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'avatar': self.avatar,
            'category': self.category,
            'status': self.status,
            'user_id': self.user_id,
            'skills': json.loads(self.skills) if self.skills else [],
            'mcp_tools': json.loads(self.mcp_tools) if self.mcp_tools else [],
            'system_prompt': self.system_prompt,
            'model_config': json.loads(self.model_config) if self.model_config else {},
            'usage_count': self.usage_count,
            'success_rate': self.success_rate,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'last_used': self.last_used.isoformat() if self.last_used else None
        }

class Dataset(db.Model):
    __tablename__ = 'datasets'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(20), nullable=False)  # 'text', 'image', 'video', 'structured'
    size = db.Column(db.String(20))  # Human readable size
    record_count = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='uploading')  # 'ready', 'processing', 'error'
    file_path = db.Column(db.String(500))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_processed = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'size': self.size,
            'record_count': self.record_count,
            'status': self.status,
            'file_path': self.file_path,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat(),
            'last_processed': self.last_processed.isoformat() if self.last_processed else None
        }

class KnowledgeBase(db.Model):
    __tablename__ = 'knowledge_bases'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    embedding_model = db.Column(db.String(100), default='text-embedding-ada-002')
    vector_store = db.Column(db.String(50), default='Pinecone')
    document_count = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='building')  # 'active', 'building', 'error'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Configuration
    datasets = db.Column(db.Text)  # JSON array of dataset IDs

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'embedding_model': self.embedding_model,
            'vector_store': self.vector_store,
            'document_count': self.document_count,
            'status': self.status,
            'user_id': self.user_id,
            'datasets': json.loads(self.datasets) if self.datasets else [],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

