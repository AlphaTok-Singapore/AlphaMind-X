from flask import Blueprint, jsonify

account_bp = Blueprint('account', __name__, url_prefix='/v1/console/account')

@account_bp.route('/init', methods=['GET'])
def account_init():
    return jsonify({
        "is_initialized": True,
        "email": "admin@example.com",
        "name": "admin"
    })
