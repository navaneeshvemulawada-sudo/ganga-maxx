import os
import sys

# Ensure parent directory is in sys.path to enable absolute imports with 'backend' prefix
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import config_by_name
from backend.models import db
from backend.routes import auth_bp, customer_bp, quotation_bp, recommend_bp, inventory_bp

def create_app(config_name=None):
    if not config_name:
        config_name = os.getenv("FLASK_ENV", "development")
        
    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name["default"]))
    
    # Initialize CORS
    CORS(app)
    
    # Initialize database
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(quotation_bp)
    app.register_blueprint(recommend_bp)
    app.register_blueprint(inventory_bp)

    
    # Root Health Check Route
    @app.route("/")
    def health_check():
        return jsonify({
            "status": "online",
            "message": "Ganga Maxx API backend is active",
            "environment": config_name
        }), 200
        
    # Auto-create SQLite database tables if they do not exist
    with app.app_context():
        db.create_all()
        
    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=app.config.get("DEBUG", True))
