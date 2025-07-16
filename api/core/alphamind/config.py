"""
Configuration for AlphaMind
"""

import os
from typing import Any


class AlphaMindConfig:
    """Configuration class for AlphaMind"""
    
    def __init__(self):
        self.config = {
            'ai_engine': {
                'model_type': 'gpt-3.5-turbo',
                'max_tokens': 2000,
                'temperature': 0.7
            },
            'database': {
                'url': os.getenv('DATABASE_URL', 'sqlite:///alphamind.db'),
                'pool_size': 10
            },
            'redis': {
                'url': os.getenv('REDIS_URL', 'redis://localhost:6379/0')
            },
            'n8n': {
                'api_url': os.getenv('N8N_API_URL', 'http://localhost:5678/api'),
                'webhook_url': os.getenv('N8N_WEBHOOK_URL', 'http://localhost:5678/webhook')
            },
            'security': {
                'secret_key': os.getenv('SECRET_KEY', 'dev-secret-key'),
                'jwt_expiry': 3600
            }
        }
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value"""
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def set(self, key: str, value: Any):
        """Set configuration value"""
        keys = key.split('.')
        config = self.config
        
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        config[keys[-1]] = value

