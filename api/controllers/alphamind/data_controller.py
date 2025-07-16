"""
Data Controller for AlphaMind

Handles all data-related HTTP requests including:
- Dataset management
- Knowledge base operations
- Data upload and processing
- Data analytics and insights
"""

import logging

from flask import Blueprint, jsonify, request
from flask_cors import cross_origin

from services.alphamind.data_service import DataService

# Create blueprint
data_bp = Blueprint('alphamind_data', __name__, url_prefix='/api/alphamind/data')

# Initialize service
data_service = DataService()

logger = logging.getLogger(__name__)


class DataController:
    """Data Controller Class"""

    # Dataset endpoints
    @staticmethod
    @data_bp.route('/datasets', methods=['GET'])
    @cross_origin()
    def get_datasets():
        """Get all datasets for the current user"""
        try:
            user_id = request.args.get('user_id', 'default_user')
            status = request.args.get('status')  # processing, ready, error
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 20))

            datasets = data_service.get_user_datasets(
                user_id=user_id,
                status=status,
                page=page,
                limit=limit
            )

            return jsonify({
                'success': True,
                'data': datasets,
                'message': 'Datasets retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting datasets: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve datasets'
            }), 500

    @staticmethod
    @data_bp.route('/datasets', methods=['POST'])
    @cross_origin()
    def create_dataset():
        """Create a new dataset"""
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

            dataset = data_service.create_dataset(
                user_id=data.get('user_id', 'default_user'),
                name=data.get('name'),
                description=data.get('description'),
                data_type=data.get('data_type', 'text'),
                config=data.get('config', {})
            )

            return jsonify({
                'success': True,
                'data': dataset,
                'message': 'Dataset created successfully'
            }), 201

        except Exception as e:
            logger.exception("Error creating dataset: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to create dataset'
            }), 500

    @staticmethod
    @data_bp.route('/datasets/<dataset_id>', methods=['GET'])
    @cross_origin()
    def get_dataset(dataset_id):
        """Get a specific dataset with details"""
        try:
            dataset = data_service.get_dataset_details(dataset_id)

            if not dataset:
                return jsonify({
                    'success': False,
                    'message': 'Dataset not found'
                }), 404

            return jsonify({
                'success': True,
                'data': dataset,
                'message': 'Dataset retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting dataset: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve dataset'
            }), 500

    @staticmethod
    @data_bp.route('/datasets/<dataset_id>/upload', methods=['POST'])
    @cross_origin()
    def upload_data(dataset_id):
        """Upload data to a dataset"""
        try:
            # Handle file upload
            if 'file' not in request.files:
                return jsonify({
                    'success': False,
                    'message': 'No file provided'
                }), 400

            file = request.files['file']
            if file.filename == '':
                return jsonify({
                    'success': False,
                    'message': 'No file selected'
                }), 400

            # Process the upload
            result = data_service.upload_file_to_dataset(dataset_id, file)

            return jsonify({
                'success': True,
                'data': result,
                'message': 'File uploaded successfully'
            }), 200

        except Exception as e:
            logger.exception("Error uploading data: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to upload data'
            }), 500

    @staticmethod
    @data_bp.route('/datasets/<dataset_id>/process', methods=['POST'])
    @cross_origin()
    def process_dataset(dataset_id):
        """Process a dataset"""
        try:
            data = request.get_json() or {}
            processing_config = data.get('config', {})

            result = data_service.process_dataset(dataset_id, processing_config)

            return jsonify({
                'success': True,
                'data': result,
                'message': 'Dataset processing started'
            }), 200

        except Exception as e:
            logger.exception("Error processing dataset: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to process dataset'
            }), 500

    # Knowledge Base endpoints
    @staticmethod
    @data_bp.route('/knowledge-bases', methods=['GET'])
    @cross_origin()
    def get_knowledge_bases():
        """Get all knowledge bases for the current user"""
        try:
            user_id = request.args.get('user_id', 'default_user')
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 20))

            knowledge_bases = data_service.get_user_knowledge_bases(
                user_id=user_id,
                page=page,
                limit=limit
            )

            return jsonify({
                'success': True,
                'data': knowledge_bases,
                'message': 'Knowledge bases retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting knowledge bases: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve knowledge bases'
            }), 500

    @staticmethod
    @data_bp.route('/knowledge-bases', methods=['POST'])
    @cross_origin()
    def create_knowledge_base():
        """Create a new knowledge base"""
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

            knowledge_base = data_service.create_knowledge_base(
                user_id=data.get('user_id', 'default_user'),
                name=data.get('name'),
                description=data.get('description'),
                config=data.get('config', {})
            )

            return jsonify({
                'success': True,
                'data': knowledge_base,
                'message': 'Knowledge base created successfully'
            }), 201

        except Exception as e:
            logger.exception("Error creating knowledge base: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to create knowledge base'
            }), 500

    @staticmethod
    @data_bp.route('/knowledge-bases/<kb_id>', methods=['GET'])
    @cross_origin()
    def get_knowledge_base(kb_id):
        """Get a specific knowledge base with details"""
        try:
            knowledge_base = data_service.get_knowledge_base_details(kb_id)

            if not knowledge_base:
                return jsonify({
                    'success': False,
                    'message': 'Knowledge base not found'
                }), 404

            return jsonify({
                'success': True,
                'data': knowledge_base,
                'message': 'Knowledge base retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting knowledge base: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve knowledge base'
            }), 500

    @staticmethod
    @data_bp.route('/knowledge-bases/<kb_id>/documents', methods=['POST'])
    @cross_origin()
    def add_document_to_kb(kb_id):
        """Add a document to a knowledge base"""
        try:
            data = request.get_json()

            if not data or not data.get('content'):
                return jsonify({
                    'success': False,
                    'message': 'Document content is required'
                }), 400

            result = data_service.add_document_to_knowledge_base(
                kb_id=kb_id,
                title=data.get('title', 'Untitled Document'),
                content=data.get('content'),
                metadata=data.get('metadata', {})
            )

            return jsonify({
                'success': True,
                'data': result,
                'message': 'Document added to knowledge base successfully'
            }), 201

        except Exception as e:
            logger.exception("Error adding document to knowledge base: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to add document to knowledge base'
            }), 500

    @staticmethod
    @data_bp.route('/knowledge-bases/<kb_id>/search', methods=['POST'])
    @cross_origin()
    def search_knowledge_base(kb_id):
        """Search within a knowledge base"""
        try:
            data = request.get_json()

            if not data or not data.get('query'):
                return jsonify({
                    'success': False,
                    'message': 'Search query is required'
                }), 400

            results = data_service.search_knowledge_base(
                kb_id=kb_id,
                query=data.get('query'),
                limit=data.get('limit', 10),
                threshold=data.get('threshold', 0.7)
            )

            return jsonify({
                'success': True,
                'data': results,
                'message': 'Search completed successfully'
            }), 200

        except Exception as e:
            logger.exception("Error searching knowledge base: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to search knowledge base'
            }), 500

    # Analytics endpoints
    @staticmethod
    @data_bp.route('/analytics/overview', methods=['GET'])
    @cross_origin()
    def get_data_overview():
        """Get data analytics overview"""
        try:
            user_id = request.args.get('user_id', 'default_user')

            overview = data_service.get_data_overview(user_id)

            return jsonify({
                'success': True,
                'data': overview,
                'message': 'Data overview retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting data overview: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve data overview'
            }), 500

    @staticmethod
    @data_bp.route('/analytics/usage', methods=['GET'])
    @cross_origin()
    def get_usage_analytics():
        """Get data usage analytics"""
        try:
            user_id = request.args.get('user_id', 'default_user')
            days = int(request.args.get('days', 30))

            usage = data_service.get_usage_analytics(user_id, days)

            return jsonify({
                'success': True,
                'data': usage,
                'message': 'Usage analytics retrieved successfully'
            }), 200

        except Exception as e:
            logger.exception("Error getting usage analytics: ")
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Failed to retrieve usage analytics'
            }), 500


# Register error handlers
@data_bp.errorhandler(400)
def bad_request(error):
    return jsonify({
        'success': False,
        'message': 'Bad request',
        'error': str(error)
    }), 400


@data_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Resource not found',
        'error': str(error)
    }), 404


@data_bp.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({
        'success': False,
        'message': 'File too large',
        'error': str(error)
    }), 413


@data_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error',
        'error': str(error)
    }), 500

