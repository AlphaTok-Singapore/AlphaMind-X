from configs import dify_config
from dify_app import DifyApp


def init_app(app: DifyApp):
    # register blueprint routers

    from flask_cors import CORS  # type: ignore

    from controllers.alphamind.account_controller import account_bp
    from controllers.alphamind.api_compat_controller import api_bp as api_compat_bp
    from controllers.alphamind.api_compat_controller import console_api_bp
    from controllers.alphamind.auth_settings_controller import auth_bp as alphamind_auth_bp
    from controllers.alphamind.features_controller import console_features_bp, features_bp
    from controllers.alphamind.settings_compat_controller import settings_compat_bp
    from controllers.console import bp as console_app_bp
    from controllers.files import bp as files_bp
    from controllers.inner_api import bp as inner_api_bp
    from controllers.service_api import bp as service_api_bp
    from controllers.web import bp as web_bp

    CORS(
        service_api_bp,
        allow_headers=["Content-Type", "Authorization", "X-App-Code"],
        methods=["GET", "PUT", "POST", "DELETE", "OPTIONS", "PATCH"],
    )
    app.register_blueprint(service_api_bp)

    CORS(
        web_bp,
        resources={r"/*": {"origins": dify_config.WEB_API_CORS_ALLOW_ORIGINS}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-App-Code"],
        methods=["GET", "PUT", "POST", "DELETE", "OPTIONS", "PATCH"],
        expose_headers=["X-Version", "X-Env"],
    )

    app.register_blueprint(web_bp)

    CORS(
        console_app_bp,
        resources={r"/*": {"origins": dify_config.CONSOLE_CORS_ALLOW_ORIGINS}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "PUT", "POST", "DELETE", "OPTIONS", "PATCH"],
        expose_headers=["X-Version", "X-Env"],
    )

    app.register_blueprint(console_app_bp)

    CORS(files_bp, allow_headers=["Content-Type"], methods=["GET", "PUT", "POST", "DELETE", "OPTIONS", "PATCH"])
    app.register_blueprint(files_bp)

    app.register_blueprint(inner_api_bp)

    # Comment out AlphaMind custom blueprints to use standard Dify API
    # app.register_blueprint(alphamind_auth_bp)

    # app.register_blueprint(features_bp)
    # app.register_blueprint(console_features_bp)

    # app.register_blueprint(account_bp)

    # app.register_blueprint(api_compat_bp)

    # app.register_blueprint(console_api_bp)

    # app.register_blueprint(settings_compat_bp)
