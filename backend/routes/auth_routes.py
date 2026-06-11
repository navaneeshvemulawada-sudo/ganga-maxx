from flask import Blueprint, request, jsonify, g
from backend.services.auth_service import AuthService, token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user endpoint."""
    data = request.get_json() or {}
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "user")
    
    response, status_code = AuthService.register(username, email, password, role)
    return jsonify(response), status_code

@auth_bp.route("/login", methods=["POST"])
def login():
    """Login endpoint, returns JWT access token."""
    data = request.get_json() or {}
    username_or_email = data.get("username") or data.get("email")
    password = data.get("password")
    
    response, status_code = AuthService.login(username_or_email, password)
    return jsonify(response), status_code

@auth_bp.route("/profile", methods=["GET"])
@token_required
def profile():
    """Get profile of current logged-in user."""
    return jsonify({
        "user": g.current_user.to_dict()
    }), 200
