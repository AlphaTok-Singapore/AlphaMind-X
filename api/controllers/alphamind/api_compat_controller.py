import datetime
import logging
import os

import jwt
from flask import Blueprint, jsonify, request

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api_bp = Blueprint('api_compat', __name__, url_prefix='/api')

@api_bp.route('/v1/features', methods=['GET'])
def api_features():
    logger.info("--- api_features in api_compat_controller.py called ---")
    enable_email_password_login = os.getenv('ENABLE_EMAIL_PASSWORD_LOGIN', 'false').lower() == 'true'
    enable_email_code_login = os.getenv('ENABLE_EMAIL_CODE_LOGIN', 'false').lower() == 'true'
    enable_social_oauth_login = os.getenv('ENABLE_SOCIAL_OAUTH_LOGIN', 'false').lower() == 'true'
    
    # Enable webapp_auth if any authentication method is enabled
    webapp_auth_enabled = enable_email_password_login or enable_email_code_login or enable_social_oauth_login

    response_data = {
        "enable_email_password_login": enable_email_password_login,
        "enable_email_code_login": enable_email_code_login,
        "enable_social_oauth_login": enable_social_oauth_login,
        "sso_enforced_for_signin": False,
        "allow_register": True,
        "allow_create_workspace": True,
        "license_status": "active",
        "webapp_auth": {"enabled": webapp_auth_enabled},
    }
    logger.info(f"--- Returning feature flags: {response_data} ---")
    return jsonify(response_data)

@api_bp.route('/v1/console/features', methods=['GET'])
def api_console_features():
    return api_features()

@api_bp.route('/v1/console/account/init', methods=['GET'])
def api_account_init():
    return jsonify({
        "is_initialized": True,
        "email": "admin@example.com",
        "name": "admin"
    })

@api_bp.route('/v1/console/workspaces/current', methods=['GET'])
def api_current_workspace():
    return jsonify({
        "id": "572f50f6-17f7-4add-9d95-69d0955366f6",
        "name": "Feng Shaomin's Workspace",
        "plan": "sandbox",
        "status": "normal",
        "created_at": 1719678807,
        "role": "owner",
        "in_trial": False,
        "trial_end_reason": None,
        "custom_config": {}
    })

@api_bp.route('/v1/console/workspaces', methods=['GET'])
def api_workspaces_list():
    return jsonify([{
        "id": "572f50f6-17f7-4add-9d95-69d0955366f6",
        "name": "Feng Shaomin's Workspace",
        "plan": "sandbox",
        "status": "normal",
        "created_at": 1719678807,
        "role": "owner",
        "in_trial": False,
        "trial_end_reason": None,
        "custom_config": {}
    }])

@api_bp.route('/v1/console/apps', methods=['GET'])
def api_apps_list():
    return jsonify({
        "data": [],
        "has_more": False,
        "limit": 20,
        "total": 0
    })

@api_bp.route('/v1/console/current-user', methods=['GET'])
def api_current_user():
    return jsonify({
        "id": "82ef00dd-50cd-41f4-a6fb-81facfb4c3e4",
        "email": "smfeng7319@gmail.com",
        "name": "admin",
        "avatar": None,
        "last_login_at": 1719678807,
        "created_at": 1719678807,
        "is_password_set": True,
        "interface_language": "en-US",
        "interface_theme": "light",
        "timezone": "Asia/Singapore"
    })

# Add the login POST endpoint to handle email/password authentication
@api_bp.route('/login', methods=['POST'])
def api_login():
    logger.info("--- Login POST endpoint called ---")
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        language = data.get('language', 'en-US')
        remember_me = data.get('remember_me', False)
        
        logger.info(f"Login attempt - email: {email}, language: {language}, remember_me: {remember_me}")
        
        # For now, allow any email/password combination
        # In a real implementation, you would validate against database
        if not email or not password:
            return jsonify({
                "result": "fail",
                "code": "invalid_credentials",
                "message": "Email and password are required",
                "data": "Invalid email or password"
            }), 400
            
        # Generate dummy JWT tokens
        secret_key = os.getenv('SECRET_KEY', 'alphamind-default-secret-key')
        
        # Access token payload
        now = datetime.datetime.now(datetime.UTC)
        access_payload = {
            'user_id': '82ef00dd-50cd-41f4-a6fb-81facfb4c3e4',
            'email': email,
            'exp': now + datetime.timedelta(hours=24),
            'iat': now
        }
        
        # Refresh token payload  
        refresh_payload = {
            'user_id': '82ef00dd-50cd-41f4-a6fb-81facfb4c3e4',
            'email': email,
            'exp': now + datetime.timedelta(days=30),
            'iat': now,
            'type': 'refresh'
        }
        
        access_token = jwt.encode(access_payload, secret_key, algorithm='HS256')
        refresh_token = jwt.encode(refresh_payload, secret_key, algorithm='HS256')
        
        logger.info(f"Generated tokens for user: {email}")
        
        return jsonify({
            "result": "success",
            "data": {
                "access_token": access_token,
                "refresh_token": refresh_token
            }
        })
        
    except Exception as e:
        logger.exception("Login error")
        return jsonify({
            "result": "fail",
            "code": "internal_error",
            "message": "Internal server error",
            "data": str(e)
        }), 500

# Register console API blueprint for /console/api endpoints
console_api_bp = Blueprint('console_api', __name__, url_prefix='/console/api')

@console_api_bp.route('/login', methods=['POST'])
def console_api_login():
    logger.info("--- Console API Login POST endpoint called ---")
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        language = data.get('language', 'en-US')
        remember_me = data.get('remember_me', False)
        
        logger.info(f"Console login attempt - email: {email}, language: {language}, remember_me: {remember_me}")
        
        # For now, allow any email/password combination
        # In a real implementation, you would validate against database
        if not email or not password:
            return jsonify({
                "result": "fail",
                "code": "invalid_credentials",
                "message": "Email and password are required",
                "data": "Invalid email or password"
            }), 400
            
        # Generate dummy JWT tokens
        secret_key = os.getenv('SECRET_KEY', 'alphamind-default-secret-key')
        
        # Access token payload
        now = datetime.datetime.now(datetime.UTC)
        access_payload = {
            'user_id': '82ef00dd-50cd-41f4-a6fb-81facfb4c3e4',
            'email': email,
            'exp': now + datetime.timedelta(hours=24),
            'iat': now
        }
        
        # Refresh token payload  
        refresh_payload = {
            'user_id': '82ef00dd-50cd-41f4-a6fb-81facfb4c3e4',
            'email': email,
            'exp': now + datetime.timedelta(days=30),
            'iat': now,
            'type': 'refresh'
        }
        
        access_token = jwt.encode(access_payload, secret_key, algorithm='HS256')
        refresh_token = jwt.encode(refresh_payload, secret_key, algorithm='HS256')
        
        logger.info(f"Generated console tokens for user: {email}")
        
        return jsonify({
            "result": "success",
            "data": {
                "access_token": access_token,
                "refresh_token": refresh_token
            }
        })
        
    except Exception as e:
        logger.exception("Console login error")
        return jsonify({
            "result": "fail",
            "code": "internal_error",
            "message": "Internal server error",
            "data": str(e)
        }), 500
