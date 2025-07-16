from flask import Blueprint, jsonify

features_bp = Blueprint('features', __name__, url_prefix='/v1')

@features_bp.route('/features', methods=['GET'])
def features():
    return jsonify({
        "enable_email_password_login": True,
        "enable_email_code_login": True,
        "enable_social_oauth_login": False,
        "sso_enforced_for_signin": False,
        "allow_register": True,
        "allow_create_workspace": True,
        "license_status": "active",
        "webapp_auth": {
            "enabled": False,
        },
    })

console_features_bp = Blueprint('console_features', __name__, url_prefix='/v1/console')

@console_features_bp.route('/features', methods=['GET'])
def console_features():
    return jsonify({
        "enable_email_password_login": True,
        "enable_email_code_login": True,
        "enable_social_oauth_login": False,
        "sso_enforced_for_signin": False,
    })
