"""
工作流执行记录数据模型
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class WorkflowExecution(db.Model):
    """工作流执行记录模型"""
    __tablename__ = 'alphamind_workflow_executions'
    
    id = db.Column(db.Integer, primary_key=True)
    workflow_id = db.Column(db.String(255), nullable=False)
    workflow_name = db.Column(db.String(255))
    agent_id = db.Column(db.Integer, db.ForeignKey('alphamind_agents.id'), index=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('alphamind_conversations.id'))
    status = db.Column(db.String(50), nullable=False, default='pending', index=True)  # pending, running, completed, failed
    input_data = db.Column(db.JSON)
    output_data = db.Column(db.JSON)
    error_message = db.Column(db.Text)
    execution_time = db.Column(db.Integer)  # 执行时间（毫秒）
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'workflow_id': self.workflow_id,
            'workflow_name': self.workflow_name,
            'agent_id': self.agent_id,
            'conversation_id': self.conversation_id,
            'status': self.status,
            'input_data': self.input_data,
            'output_data': self.output_data,
            'error_message': self.error_message,
            'execution_time': self.execution_time,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
    
    def __repr__(self):
        return f'<WorkflowExecution {self.workflow_id} - {self.status}>'

