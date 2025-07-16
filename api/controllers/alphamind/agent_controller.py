"""
Agent Controller for AlphaMind

Handles all agent-related HTTP requests including:
- Creating and managing AI agents
- Agent configuration and settings
- Agent performance monitoring
- Agent deployment and activation
"""

import logging

from flask import Blueprint, jsonify, request
from flask_cors import cross_origin

from services.alphamind.agent_service import AgentService

# Create blueprint
agent_bp = Blueprint('alphamind_agent', __name__, url_prefix='/api/alphamind/agents')

# Initialize service
agent_service = AgentService()

logger = logging.getLogger(__name__)

AGENT_NOT_FOUND_MSG = 'Agent not found'


class AgentController:
    """Agent Controller Class"""

    @staticmethod
    @agent_bp.route('', methods=['GET'])
    @cross_origin()
    def get_agents():
        """Get all agents for the current user"""
        try:
            user_id = request.args.get('user_id', 'default_user')
            status = request.args.get('status')  # active, inactive, training
            agent_type = request.args.get('type')  # customer_support, sales, etc.
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 20))

            agents = agent_service.get_user_agents(
                user_id=user_id,
                status=status,
                agent_type=agent_type,
                page=page,
                limit=limit
            )

            return jsonify({
                'success': True,
                'data': agents,
                'message': 'Agents retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting agents: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve agents'
            }), 500

    @staticmethod
    @agent_bp.route('', methods=['POST'])
    @cross_origin()
    def create_agent():
        """Create a new AI agent"""
        try:
            data = request.get_json()

            if not data:
                return jsonify({
                    'success': False,
                    'message': 'Request body is required'
                }), 400

            required_fields = ['name', 'description', 'type']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({
                        'success': False,
                        'message': f'{field} is required'
                    }), 400

            agent = agent_service.create_agent(
                user_id=data.get('user_id', 'default_user'),
                name=data.get('name'),
                description=data.get('description'),
                agent_type=data.get('type'),
                config=data.get('config', {}),
                skills=data.get('skills', []),
                knowledge_bases=data.get('knowledge_bases', [])
            )

            return jsonify({
                'success': True,
                'data': agent,
                'message': 'Agent created successfully'
            }), 201

        except Exception as e:
            logger.exception("Error creating agent: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to create agent'
            }), 500

    @staticmethod
    @agent_bp.route('/<agent_id>', methods=['GET'])
    @cross_origin()
    def get_agent(agent_id):
        """Get a specific agent with details"""
        try:
            agent = agent_service.get_agent_details(agent_id)

            if not agent:
                return jsonify({
                    'success': False,
                    'message': AGENT_NOT_FOUND_MSG
                }), 404

            return jsonify({
                'success': True,
                'data': agent,
                'message': 'Agent retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting agent: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve agent'
            }), 500

    @staticmethod
    @agent_bp.route('/<agent_id>', methods=['PUT'])
    @cross_origin()
    def update_agent(agent_id):
        """Update an existing agent"""
        try:
            data = request.get_json()

            if not data:
                return jsonify({
                    'success': False,
                    'message': 'Request body is required'
                }), 400

            agent = agent_service.update_agent(agent_id, data)

            if not agent:
                return jsonify({
                    'success': False,
                    'message': AGENT_NOT_FOUND_MSG
                }), 404

            return jsonify({
                'success': True,
                'data': agent,
                'message': 'Agent updated successfully'
            }), 200

        except Exception as e:
            logger.exception("Error updating agent: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to update agent'
            }), 500

    @staticmethod
    @agent_bp.route('/<agent_id>', methods=['DELETE'])
    @cross_origin()
    def delete_agent(agent_id):
        """Delete an agent"""
        try:
            success = agent_service.delete_agent(agent_id)

            if not success:
                return jsonify({
                    'success': False,
                    'message': AGENT_NOT_FOUND_MSG
                }), 404

            return jsonify({
                'success': True,
                'message': 'Agent deleted successfully'
            }), 200

        except Exception as e:
            logger.exception("Error deleting agent: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to delete agent'
            }), 500

    @staticmethod
    @agent_bp.route('/<agent_id>/activate', methods=['POST'])
    @cross_origin()
    def activate_agent(agent_id):
        """Activate an agent"""
        try:
            success = agent_service.activate_agent(agent_id)

            if not success:
                return jsonify({
                    'success': False,
                    'message': AGENT_NOT_FOUND_MSG
                }), 404

            return jsonify({
                'success': True,
                'message': 'Agent activated successfully'
            }), 200

        except Exception as e:
            logger.exception("Error activating agent: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to activate agent'
            }), 500

    @staticmethod
    @agent_bp.route('/<agent_id>/deactivate', methods=['POST'])
    @cross_origin()
    def deactivate_agent(agent_id):
        """Deactivate an agent"""
        try:
            success = agent_service.deactivate_agent(agent_id)

            if not success:
                return jsonify({
                    'success': False,
                    'message': AGENT_NOT_FOUND_MSG
                }), 404

            return jsonify({
                'success': True,
                'message': 'Agent deactivated successfully'
            }), 200

        except Exception as e:
            logger.exception("Error deactivating agent: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to deactivate agent'
            }), 500

    @staticmethod
    @agent_bp.route('/<agent_id>/train', methods=['POST'])
    @cross_origin()
    def train_agent(agent_id):
        """Start training an agent"""
        try:
            data = request.get_json() or {}
            training_data = data.get('training_data', [])

            success = agent_service.start_training(agent_id, training_data)

            if not success:
                return jsonify({
                    'success': False,
                    'message': AGENT_NOT_FOUND_MSG
                }), 404

            return jsonify({
                'success': True,
                'message': 'Agent training started successfully'
            }), 200

        except Exception as e:
            logger.exception("Error training agent: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to start agent training'
            }), 500

    @staticmethod
    @agent_bp.route('/<agent_id>/analytics', methods=['GET'])
    @cross_origin()
    def get_agent_analytics(agent_id):
        """Get agent performance analytics"""
        try:
            days = int(request.args.get('days', 30))

            analytics = agent_service.get_agent_analytics(agent_id, days)

            if not analytics:
                return jsonify({
                    'success': False,
                    'message': AGENT_NOT_FOUND_MSG
                }), 404

            return jsonify({
                'success': True,
                'data': analytics,
                'message': 'Agent analytics retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting agent analytics: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve agent analytics'
            }), 500

    @staticmethod
    @agent_bp.route('/<agent_id>/skills', methods=['GET'])
    @cross_origin()
    def get_agent_skills(agent_id):
        """Get agent skills"""
        try:
            skills = agent_service.get_agent_skills(agent_id)

            return jsonify({
                'success': True,
                'data': skills,
                'message': 'Agent skills retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting agent skills: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve agent skills'
            }), 500

    @staticmethod
    @agent_bp.route('/<agent_id>/skills', methods=['POST'])
    @cross_origin()
    def add_agent_skill(agent_id):
        """Add a skill to an agent"""
        try:
            data = request.get_json()

            if not data or not data.get('skill_id'):
                return jsonify({
                    'success': False,
                    'message': 'skill_id is required'
                }), 400

            success = agent_service.add_skill_to_agent(agent_id, data.get('skill_id'))

            if not success:
                return jsonify({
                    'success': False,
                    'message': 'Failed to add skill to agent'
                }), 400

            return jsonify({
                'success': True,
                'message': 'Skill added to agent successfully'
            }), 200

        except Exception as e:
            logger.exception("Error adding skill to agent: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to add skill to agent'
            }), 500


# Register error handlers
@agent_bp.errorhandler(400)
def bad_request(error):
    return jsonify({
        'success': False,
        'message': 'Bad request',
        'error': str(error)
    }), 400


@agent_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Resource not found',
        'error': str(error)
    }), 404


@agent_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error',
        'error': str(error)
    }), 500

