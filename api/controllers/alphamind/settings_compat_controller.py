from flask import Blueprint, jsonify

settings_compat_bp = Blueprint('settings_compat', __name__)

@settings_compat_bp.route('/v1/console/settings', methods=['GET'])
def v1_console_settings():
    return jsonify({
        "allow_register": True,
        "site_name": "Dify",
        "license_status": "active"
    })

@settings_compat_bp.route('/api/v1/console/settings', methods=['GET'])
def api_v1_console_settings():
    return v1_console_settings()
