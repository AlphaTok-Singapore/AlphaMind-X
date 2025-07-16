from flask import Blueprint, jsonify

auth_bp = Blueprint('auth', __name__, url_prefix='/v1/auth')

@auth_bp.route('/settings', methods=['GET'])
def auth_settings():
    return jsonify({
        "email_enabled": True,
        "oauth_enabled": True,
        "providers": [
            {
                "name": "dummy",
                "display_name": "Dummy OAuth",
                "auth_url": "https://example.com/oauth",
                "icon": "",
            }
        ],
    })
