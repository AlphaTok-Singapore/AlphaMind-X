"""
Agent Service for AlphaMind

Business logic for agent management including:
- Agent creation and configuration
- Agent performance monitoring
- Agent training and deployment
"""

import logging
from datetime import datetime
from typing import Optional

from models.alphamind.agent import Agent

logger = logging.getLogger(__name__)


class AgentService:
    """Service class for agent operations"""

    def __init__(self):
        self.agents = {}  # In-memory storage for demo

    def get_user_agents(self, user_id: str, status: str | None = None, agent_type: str | None = None,
                       page: int = 1, limit: int = 20) -> list[dict]:
        """Get agents for a user"""
        try:
            user_agents = [
                agent for agent in self.agents.values()
                if agent.user_id == user_id
            ]

            # Apply filters
            if status:
                user_agents = [agent for agent in user_agents if agent.status == status]
            if agent_type:
                user_agents = [agent for agent in user_agents if agent.agent_type == agent_type]

            # Sort by updated_at desc
            user_agents.sort(key=lambda x: x.updated_at, reverse=True)

            # Pagination
            start = (page - 1) * limit
            end = start + limit
            paginated = user_agents[start:end]

            return [agent.to_dict() for agent in paginated]

        except Exception as e:
            logger.exception("Error getting user agents: ")
            raise

    def create_agent(self, user_id: str, name: str, description: str, agent_type: str,
                    config: dict | None = None, skills: list[str] | None = None,
                    knowledge_bases: list[str] | None = None) -> dict:
        """Create a new agent"""
        try:
            agent = Agent(
                user_id=user_id,
                name=name,
                description=description,
                agent_type=agent_type,
                config=config or {},
                skills=skills or [],
                knowledge_bases=knowledge_bases or []
            )

            self.agents[agent.id] = agent

            return agent.to_dict()

        except Exception as e:
            logger.exception("Error creating agent: ")
            raise

    def get_agent_details(self, agent_id: str) -> Optional[dict]:
        """Get agent details"""
        try:
            agent = self.agents.get(agent_id)
            if not agent:
                return None

            return agent.to_dict()

        except Exception as e:
            logger.exception("Error getting agent details: ")
            raise

    def update_agent(self, agent_id: str, updates: dict) -> Optional[dict]:
        """Update an agent"""
        try:
            agent = self.agents.get(agent_id)
            if not agent:
                return None

            # Update fields
            if 'name' in updates:
                agent.name = updates['name']
            if 'description' in updates:
                agent.description = updates['description']
            if 'config' in updates:
                agent.config.update(updates['config'])
            if 'skills' in updates:
                agent.skills = updates['skills']
            if 'knowledge_bases' in updates:
                agent.knowledge_bases = updates['knowledge_bases']

            agent.updated_at = datetime.utcnow()

            return agent.to_dict()

        except Exception as e:
            logger.exception("Error updating agent: ")
            raise

    def delete_agent(self, agent_id: str) -> bool:
        """Delete an agent"""
        try:
            if agent_id in self.agents:
                del self.agents[agent_id]
                return True
            return False

        except Exception as e:
            logger.exception("Error deleting agent: ")
            raise

    def activate_agent(self, agent_id: str) -> bool:
        """Activate an agent"""
        try:
            agent = self.agents.get(agent_id)
            if not agent:
                return False

            agent.activate()
            return True

        except Exception as e:
            logger.exception("Error activating agent: ")
            raise

    def deactivate_agent(self, agent_id: str) -> bool:
        """Deactivate an agent"""
        try:
            agent = self.agents.get(agent_id)
            if not agent:
                return False

            agent.deactivate()
            return True

        except Exception as e:
            logger.exception("Error deactivating agent: ")
            raise

    def start_training(self, agent_id: str, training_data: list | None = None) -> bool:
        """Start training an agent"""
        try:
            agent = self.agents.get(agent_id)
            if not agent:
                return False

            agent.start_training()
            # Here you would implement actual training logic

            return True

        except Exception as e:
            logger.exception("Error starting agent training: ")
            raise

    def get_agent_analytics(self, agent_id: str, days: int = 30) -> Optional[dict]:
        """Get agent performance analytics"""
        try:
            agent = self.agents.get(agent_id)
            if not agent:
                return None

            # Mock analytics data
            return {
                'agent_id': agent_id,
                'period_days': days,
                'conversations': agent.conversations_count,
                'messages': agent.messages_count,
                'accuracy': agent.accuracy_score,
                'response_time_avg': 1.2,
                'satisfaction_score': 4.5,
                'usage_trend': [10, 15, 12, 18, 20, 25, 22]
            }

        except Exception as e:
            logger.exception("Error getting agent analytics: ")
            raise

    def get_agent_skills(self, agent_id: str) -> list[str]:
        """Get agent skills"""
        try:
            agent = self.agents.get(agent_id)
            if not agent:
                return []

            return agent.skills

        except Exception as e:
            logger.exception("Error getting agent skills: ")
            raise

    def add_skill_to_agent(self, agent_id: str, skill_id: str) -> bool:
        """Add a skill to an agent"""
        try:
            agent = self.agents.get(agent_id)
            if not agent:
                return False

            agent.add_skill(skill_id)
            return True

        except Exception as e:
            logger.exception("Error adding skill to agent: ")
            raise

