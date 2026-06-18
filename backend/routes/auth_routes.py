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

@auth_bp.route("/users", methods=["GET"])
@token_required
def get_all_users():
    """List all registered users (Admin only)."""
    if g.current_user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403
    from backend.models.user import User
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

@auth_bp.route("/users/<int:user_id>/approve", methods=["PUT"])
@token_required
def approve_user(user_id):
    """Approve a user registration (Admin only)."""
    if g.current_user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403
        
    from backend.models.user import User
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    user.is_approved = True
    try:
        from backend.models import db
        db.session.commit()
        return jsonify({"message": f"User {user.username} approved successfully", "user": user.to_dict()}), 200
    except Exception as e:
        from backend.models import db
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
