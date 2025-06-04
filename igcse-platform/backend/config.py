import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Add other general configurations here
    # For example, JWT_SECRET_KEY, MAIL_SERVER, etc.

class DevelopmentConfig(Config):
    DEBUG = True
    # Add development-specific configs

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:' # Use in-memory SQLite for tests
    # Add other test-specific configs, e.g., disable CSRF, set shorter timeouts

class ProductionConfig(Config):
    DEBUG = False
    # Add production-specific configs, e.g., more logging, different database URI from env

# Dictionary to access configurations by name
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig # Default configuration
}
