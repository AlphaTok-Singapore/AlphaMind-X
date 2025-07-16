from flask import Blueprint, jsonify

workflows_bp = Blueprint('workflows', __name__)

@workflows_bp.route('/workflows/health', methods=['GET'])
def health_check():
    return jsonify({'success': True, 'message': 'Workflows route is healthy.'})
