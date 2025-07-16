"""
Settings Controller for AlphaMind

Handles all settings-related HTTP requests including:
- General system settings
- Integration configurations
- Social media management
- User preferences
"""

import logging

from flask import Blueprint, jsonify, request
from flask_cors import cross_origin

from services.alphamind.integration_service import IntegrationService

# Create blueprint
settings_bp = Blueprint('alphamind_settings', __name__, url_prefix='/api/alphamind/settings')

# Initialize service
integration_service = IntegrationService()

logger = logging.getLogger(__name__)


class SettingsController:
    """Settings Controller Class"""

    # General Settings
    @staticmethod
    @settings_bp.route('/general', methods=['GET'])
    @cross_origin()
    def get_general_settings():
        """Get general system settings"""
        try:
            user_id = request.args.get('user_id', 'default_user')

            settings = integration_service.get_general_settings(user_id)

            return jsonify({
                'success': True,
                'data': settings,
                'message': 'General settings retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting general settings: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve general settings'
            }), 500

    @staticmethod
    @settings_bp.route('/general', methods=['PUT'])
    @cross_origin()
    def update_general_settings():
        """Update general system settings"""
        try:
            data = request.get_json()

            if not data:
                return jsonify({
                    'success': False,
                    'message': 'Request body is required'
                }), 400

            user_id = data.get('user_id', 'default_user')
            settings = integration_service.update_general_settings(user_id, data)

            return jsonify({
                'success': True,
                'data': settings,
                'message': 'General settings updated successfully'
            }), 200

        except Exception as e:
            logger.exception("Error updating general settings: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to update general settings'
            }), 500

    # Integration Settings
    @staticmethod
    @settings_bp.route('/integrations', methods=['GET'])
    @cross_origin()
    def get_integrations():
        """Get all available integrations"""
        try:
            user_id = request.args.get('user_id', 'default_user')

            integrations = integration_service.get_user_integrations(user_id)

            return jsonify({
                'success': True,
                'data': integrations,
                'message': 'Integrations retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting integrations: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve integrations'
            }), 500

    @staticmethod
    @settings_bp.route('/integrations/<integration_type>', methods=['GET'])
    @cross_origin()
    def get_integration_config(integration_type):
        """Get configuration for a specific integration"""
        try:
            user_id = request.args.get('user_id', 'default_user')

            config = integration_service.get_integration_config(user_id, integration_type)

            return jsonify({
                'success': True,
                'data': config,
                'message': f'{integration_type} integration config retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting integration config: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': f'Failed to retrieve {integration_type} integration config'
            }), 500

    @staticmethod
    @settings_bp.route('/integrations/<integration_type>', methods=['PUT'])
    @cross_origin()
    def update_integration_config(integration_type):
        """Update configuration for a specific integration"""
        try:
            data = request.get_json()

            if not data:
                return jsonify({
                    'success': False,
                    'message': 'Request body is required'
                }), 400

            user_id = data.get('user_id', 'default_user')
            config = integration_service.update_integration_config(
                user_id, integration_type, data.get('config', {})
            )

            return jsonify({
                'success': True,
                'data': config,
                'message': f'{integration_type} integration updated successfully'
            }), 200

        except Exception as e:
            logger.exception("Error updating integration config: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': f'Failed to update {integration_type} integration'
            }), 500

    @staticmethod
    @settings_bp.route('/integrations/<integration_type>/enable', methods=['POST'])
    @cross_origin()
    def enable_integration(integration_type):
        """Enable a specific integration"""
        try:
            data = request.get_json() or {}
            user_id = data.get('user_id', 'default_user')

            success = integration_service.enable_integration(user_id, integration_type)

            if not success:
                return jsonify({
                    'success': False,
                    'message': f'Failed to enable {integration_type} integration'
                }), 400

            return jsonify({
                'success': True,
                'message': f'{integration_type} integration enabled successfully'
            }), 200

        except Exception as e:
            logger.exception("Error enabling integration: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': f'Failed to enable {integration_type} integration'
            }), 500

    @staticmethod
    @settings_bp.route('/integrations/<integration_type>/disable', methods=['POST'])
    @cross_origin()
    def disable_integration(integration_type):
        """Disable a specific integration"""
        try:
            data = request.get_json() or {}
            user_id = data.get('user_id', 'default_user')

            success = integration_service.disable_integration(user_id, integration_type)

            if not success:
                return jsonify({
                    'success': False,
                    'message': f'Failed to disable {integration_type} integration'
                }), 400

            return jsonify({
                'success': True,
                'message': f'{integration_type} integration disabled successfully'
            }), 200

        except Exception as e:
            logger.exception("Error disabling integration: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': f'Failed to disable {integration_type} integration'
            }), 500

    @staticmethod
    @settings_bp.route('/integrations/<integration_type>/test', methods=['POST'])
    @cross_origin()
    def test_integration(integration_type):
        """Test a specific integration connection"""
        try:
            data = request.get_json() or {}
            user_id = data.get('user_id', 'default_user')

            result = integration_service.test_integration(user_id, integration_type)

            return jsonify({
                'success': True,
                'data': result,
                'message': f'{integration_type} integration test completed'
            }), 200

        except Exception as e:
            logger.exception("Error testing integration: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': f'Failed to test {integration_type} integration'
            }), 500

    # Social Media Settings
    @staticmethod
    @settings_bp.route('/social', methods=['GET'])
    @cross_origin()
    def get_social_media_settings():
        """Get social media management settings"""
        try:
            user_id = request.args.get('user_id', 'default_user')

            settings = integration_service.get_social_media_settings(user_id)

            return jsonify({
                'success': True,
                'data': settings,
                'message': 'Social media settings retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting social media settings: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve social media settings'
            }), 500

    @staticmethod
    @settings_bp.route('/social', methods=['PUT'])
    @cross_origin()
    def update_social_media_settings():
        """Update social media management settings"""
        try:
            data = request.get_json()

            if not data:
                return jsonify({
                    'success': False,
                    'message': 'Request body is required'
                }), 400

            user_id = data.get('user_id', 'default_user')
            settings = integration_service.update_social_media_settings(user_id, data)

            return jsonify({
                'success': True,
                'data': settings,
                'message': 'Social media settings updated successfully'
            }), 200

        except Exception as e:
            logger.exception("Error updating social media settings: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to update social media settings'
            }), 500

    @staticmethod
    @settings_bp.route('/social/accounts', methods=['GET'])
    @cross_origin()
    def get_social_accounts():
        """Get connected social media accounts"""
        try:
            user_id = request.args.get('user_id', 'default_user')

            accounts = integration_service.get_connected_social_accounts(user_id)

            return jsonify({
                'success': True,
                'data': accounts,
                'message': 'Social accounts retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting social accounts: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve social accounts'
            }), 500

    @staticmethod
    @settings_bp.route('/social/accounts/<platform>/connect', methods=['POST'])
    @cross_origin()
    def connect_social_account(platform):
        """Connect a social media account"""
        try:
            data = request.get_json()

            if not data:
                return jsonify({
                    'success': False,
                    'message': 'Request body is required'
                }), 400

            user_id = data.get('user_id', 'default_user')
            credentials = data.get('credentials', {})

            result = integration_service.connect_social_account(
                user_id, platform, credentials
            )

            return jsonify({
                'success': True,
                'data': result,
                'message': f'{platform} account connected successfully'
            }), 200

        except Exception as e:
            logger.exception("Error connecting social account: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': f'Failed to connect {platform} account'
            }), 500

    @staticmethod
    @settings_bp.route('/social/accounts/<platform>/disconnect', methods=['POST'])
    @cross_origin()
    def disconnect_social_account(platform):
        """Disconnect a social media account"""
        try:
            data = request.get_json() or {}
            user_id = data.get('user_id', 'default_user')

            success = integration_service.disconnect_social_account(user_id, platform)

            if not success:
                return jsonify({
                    'success': False,
                    'message': f'Failed to disconnect {platform} account'
                }), 400

            return jsonify({
                'success': True,
                'message': f'{platform} account disconnected successfully'
            }), 200

        except Exception as e:
            logger.exception("Error disconnecting social account: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': f'Failed to disconnect {platform} account'
            }), 500

    # API Keys and Security
    @staticmethod
    @settings_bp.route('/api-keys', methods=['GET'])
    @cross_origin()
    def get_api_keys():
        """Get user API keys"""
        try:
            user_id = request.args.get('user_id', 'default_user')

            api_keys = integration_service.get_user_api_keys(user_id)

            return jsonify({
                'success': True,
                'data': api_keys,
                'message': 'API keys retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting API keys: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve API keys'
            }), 500

    @staticmethod
    @settings_bp.route('/api-keys', methods=['POST'])
    @cross_origin()
    def create_api_key():
        """Create a new API key"""
        try:
            data = request.get_json()

            if not data:
                return jsonify({
                    'success': False,
                    'message': 'Request body is required'
                }), 400

            user_id = data.get('user_id', 'default_user')
            name = data.get('name', 'Unnamed Key')
            permissions = data.get('permissions', [])

            api_key = integration_service.create_api_key(user_id, name, permissions)

            return jsonify({
                'success': True,
                'data': api_key,
                'message': 'API key created successfully'
            }), 201

        except Exception as e:
            logger.exception("Error creating API key: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to create API key'
            }), 500

    @staticmethod
    @settings_bp.route('/api-keys/<key_id>', methods=['DELETE'])
    @cross_origin()
    def delete_api_key(key_id):
        """Delete an API key"""
        try:
            success = integration_service.delete_api_key(key_id)

            if not success:
                return jsonify({
                    'success': False,
                    'message': 'API key not found'
                }), 404

            return jsonify({
                'success': True,
                'message': 'API key deleted successfully'
            }), 200

        except Exception as e:
            logger.exception("Error deleting API key: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to delete API key'
            }), 500


# Register error handlers
@settings_bp.errorhandler(400)
def bad_request(error):
    return jsonify({
        'success': False,
        'message': 'Bad request',
        'error': str(error)
    }), 400


@settings_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Resource not found',
        'error': str(error)
    }), 404


@settings_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error',
        'error': str(error)
    }), 500

