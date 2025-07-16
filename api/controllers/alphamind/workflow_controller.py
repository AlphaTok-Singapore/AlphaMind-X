"""
Workflow Controller for AlphaMind

Handles all workflow-related HTTP requests including:
- Creating and managing workflows
- Workflow execution and monitoring
- n8n integration
- Workflow templates and automation
"""

import logging

from flask import Blueprint, jsonify, request
from flask_cors import cross_origin

from services.alphamind.workflow_service import WorkflowService

# Create blueprint
workflow_bp = Blueprint('alphamind_workflow', __name__, url_prefix='/api/alphamind/workflows')

# Initialize service
workflow_service = WorkflowService()

logger = logging.getLogger(__name__)


class WorkflowController:
    """Workflow Controller Class"""

    @staticmethod
    @workflow_bp.route('', methods=['GET'])
    @cross_origin()
    def get_workflows():
        """Get all workflows for the current user"""
        try:
            user_id = request.args.get('user_id', 'default_user')
            status = request.args.get('status')  # active, inactive, draft
            category = request.args.get('category')  # automation, data_processing, etc.
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 20))

            workflows = workflow_service.get_user_workflows(
                user_id=user_id,
                status=status,
                category=category,
                page=page,
                limit=limit
            )

            return jsonify({
                'success': True,
                'data': workflows,
                'message': 'Workflows retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting workflows: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve workflows'
            }), 500

    @staticmethod
    @workflow_bp.route('', methods=['POST'])
    @cross_origin()
    def create_workflow():
        """Create a new workflow"""
        try:
            data = request.get_json()

            if not data:
                return jsonify({
                    'success': False,
                    'message': 'Request body is required'
                }), 400

            required_fields = ['name', 'description']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({
                        'success': False,
                        'message': f'{field} is required'
                    }), 400

            workflow = workflow_service.create_workflow(
                user_id=data.get('user_id', 'default_user'),
                name=data.get('name'),
                description=data.get('description'),
                category=data.get('category', 'general'),
                config=data.get('config', {}),
                nodes=data.get('nodes', []),
                connections=data.get('connections', [])
            )

            return jsonify({
                'success': True,
                'data': workflow,
                'message': 'Workflow created successfully'
            }), 201

        except Exception as e:
            logger.exception("Error creating workflow: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to create workflow'
            }), 500

    @staticmethod
    @workflow_bp.route('/<workflow_id>', methods=['GET'])
    @cross_origin()
    def get_workflow(workflow_id):
        """Get a specific workflow with details"""
        try:
            workflow = workflow_service.get_workflow_details(workflow_id)

            if not workflow:
                return jsonify({
                    'success': False,
                    'message': 'Workflow not found'
                }), 404

            return jsonify({
                'success': True,
                'data': workflow,
                'message': 'Workflow retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting workflow: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve workflow'
            }), 500

    @staticmethod
    @workflow_bp.route('/<workflow_id>', methods=['PUT'])
    @cross_origin()
    def update_workflow(workflow_id):
        """Update an existing workflow"""
        try:
            data = request.get_json()

            if not data:
                return jsonify({
                    'success': False,
                    'message': 'Request body is required'
                }), 400

            workflow = workflow_service.update_workflow(workflow_id, data)

            if not workflow:
                return jsonify({
                    'success': False,
                    'message': 'Workflow not found'
                }), 404

            return jsonify({
                'success': True,
                'data': workflow,
                'message': 'Workflow updated successfully'
            }), 200

        except Exception as e:
            logger.exception("Error updating workflow: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to update workflow'
            }), 500

    @staticmethod
    @workflow_bp.route('/<workflow_id>', methods=['DELETE'])
    @cross_origin()
    def delete_workflow(workflow_id):
        """Delete a workflow"""
        try:
            success = workflow_service.delete_workflow(workflow_id)

            if not success:
                return jsonify({
                    'success': False,
                    'message': 'Workflow not found'
                }), 404

            return jsonify({
                'success': True,
                'message': 'Workflow deleted successfully'
            }), 200

        except Exception as e:
            logger.exception("Error deleting workflow: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to delete workflow'
            }), 500

    @staticmethod
    @workflow_bp.route('/<workflow_id>/execute', methods=['POST'])
    @cross_origin()
    def execute_workflow(workflow_id):
        """Execute a workflow"""
        try:
            data = request.get_json() or {}
            input_data = data.get('input_data', {})

            execution = workflow_service.execute_workflow(workflow_id, input_data)

            return jsonify({
                'success': True,
                'data': execution,
                'message': 'Workflow execution started'
            }), 200

        except Exception as e:
            logger.exception("Error executing workflow: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to execute workflow'
            }), 500

    @staticmethod
    @workflow_bp.route('/<workflow_id>/executions', methods=['GET'])
    @cross_origin()
    def get_workflow_executions(workflow_id):
        """Get execution history for a workflow"""
        try:
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 20))
            status = request.args.get('status')  # running, completed, failed

            executions = workflow_service.get_workflow_executions(
                workflow_id=workflow_id,
                status=status,
                page=page,
                limit=limit
            )

            return jsonify({
                'success': True,
                'data': executions,
                'message': 'Workflow executions retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting workflow executions: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve workflow executions'
            }), 500

    @staticmethod
    @workflow_bp.route('/executions/<execution_id>', methods=['GET'])
    @cross_origin()
    def get_execution_details(execution_id):
        """Get details of a specific workflow execution"""
        try:
            execution = workflow_service.get_execution_details(execution_id)

            if not execution:
                return jsonify({
                    'success': False,
                    'message': 'Execution not found'
                }), 404

            return jsonify({
                'success': True,
                'data': execution,
                'message': 'Execution details retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting execution details: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve execution details'
            }), 500

    @staticmethod
    @workflow_bp.route('/executions/<execution_id>/stop', methods=['POST'])
    @cross_origin()
    def stop_execution(execution_id):
        """Stop a running workflow execution"""
        try:
            success = workflow_service.stop_execution(execution_id)

            if not success:
                return jsonify({
                    'success': False,
                    'message': 'Execution not found or already stopped'
                }), 404

            return jsonify({
                'success': True,
                'message': 'Execution stopped successfully'
            }), 200

        except Exception as e:
            logger.exception("Error stopping execution: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to stop execution'
            }), 500

    @staticmethod
    @workflow_bp.route('/<workflow_id>/activate', methods=['POST'])
    @cross_origin()
    def activate_workflow(workflow_id):
        """Activate a workflow for automatic execution"""
        try:
            success = workflow_service.activate_workflow(workflow_id)

            if not success:
                return jsonify({
                    'success': False,
                    'message': 'Workflow not found or already active'
                }), 404

            return jsonify({
                'success': True,
                'message': 'Workflow activated successfully'
            }), 200

        except Exception as e:
            logger.exception("Error activating workflow: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to activate workflow'
            }), 500

    @staticmethod
    @workflow_bp.route('/<workflow_id>/deactivate', methods=['POST'])
    @cross_origin()
    def deactivate_workflow(workflow_id):
        """Deactivate a workflow"""
        try:
            success = workflow_service.deactivate_workflow(workflow_id)

            if not success:
                return jsonify({
                    'success': False,
                    'message': 'Workflow not found or already inactive'
                }), 404

            return jsonify({
                'success': True,
                'message': 'Workflow deactivated successfully'
            }), 200

        except Exception as e:
            logger.exception("Error deactivating workflow: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to deactivate workflow'
            }), 500

    # Template endpoints
    @staticmethod
    @workflow_bp.route('/templates', methods=['GET'])
    @cross_origin()
    def get_workflow_templates():
        """Get available workflow templates"""
        try:
            category = request.args.get('category')

            templates = workflow_service.get_workflow_templates(category)

            return jsonify({
                'success': True,
                'data': templates,
                'message': 'Workflow templates retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting workflow templates: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve workflow templates'
            }), 500

    @staticmethod
    @workflow_bp.route('/templates/<template_id>/create', methods=['POST'])
    @cross_origin()
    def create_from_template(template_id):
        """Create a workflow from a template"""
        try:
            data = request.get_json()

            if not data:
                return jsonify({
                    'success': False,
                    'message': 'Request body is required'
                }), 400

            user_id = data.get('user_id', 'default_user')
            name = data.get('name', 'Workflow from Template')
            customizations = data.get('customizations', {})

            workflow = workflow_service.create_workflow_from_template(
                template_id, user_id, name, customizations
            )

            return jsonify({
                'success': True,
                'data': workflow,
                'message': 'Workflow created from template successfully'
            }), 201

        except Exception as e:
            logger.exception("Error creating workflow from template: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to create workflow from template'
            }), 500

    # n8n Integration endpoints
    @staticmethod
    @workflow_bp.route('/<workflow_id>/sync-n8n', methods=['POST'])
    @cross_origin()
    def sync_with_n8n(workflow_id):
        """Sync workflow with n8n"""
        try:
            result = workflow_service.sync_workflow_with_n8n(workflow_id)

            return jsonify({
                'success': True,
                'data': result,
                'message': 'Workflow synced with n8n successfully'
            }), 200

        except Exception as e:
            logger.exception("Error syncing workflow with n8n: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to sync workflow with n8n'
            }), 500

    @staticmethod
    @workflow_bp.route('/n8n/webhooks/<webhook_id>', methods=['POST'])
    @cross_origin()
    def handle_n8n_webhook(webhook_id):
        """Handle webhook from n8n"""
        try:
            data = request.get_json() or {}

            result = workflow_service.handle_n8n_webhook(webhook_id, data)

            return jsonify({
                'success': True,
                'data': result,
                'message': 'Webhook handled successfully'
            }), 200

        except Exception as e:
            logger.exception("Error handling n8n webhook: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to handle webhook'
            }), 500


# Register error handlers
@workflow_bp.errorhandler(400)
def bad_request(error):
    return jsonify({
        'success': False,
        'message': 'Bad request',
        'error': str(error)
    }), 400


@workflow_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Resource not found',
        'error': str(error)
    }), 404


@workflow_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error',
        'error': str(error)
    }), 500

