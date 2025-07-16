"""
Custom exceptions for AlphaMind
"""


class AlphaMindError(Exception):
    """Base exception for AlphaMind"""
    pass


class AgentNotFoundError(AlphaMindError):
    """Raised when agent is not found"""
    pass


class ConversationNotFoundError(AlphaMindError):
    """Raised when conversation is not found"""
    pass


class InvalidConfigurationError(AlphaMindError):
    """Raised when configuration is invalid"""
    pass


class AIEngineError(AlphaMindError):
    """Raised when AI engine encounters an error"""
    pass


class IntegrationError(AlphaMindError):
    """Raised when integration fails"""
    pass

