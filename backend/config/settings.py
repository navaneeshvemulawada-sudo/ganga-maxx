import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration class."""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_key_change_me_in_production")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev_jwt_secret_key_change_me_in_production")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 86400))
    
    # Database
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Always resolve database URI as absolute path inside backend/instance/ganga_maxx.db
    _base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    _default_db_path = os.path.join(_base_dir, "instance", "ganga_maxx.db")
    # Ensure instance directory exists
    os.makedirs(os.path.join(_base_dir, "instance"), exist_ok=True)
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", f"sqlite:///{_default_db_path}")



class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    ENV = "development"

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    ENV = "production"

config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig
}
