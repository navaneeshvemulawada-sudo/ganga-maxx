import base64
import json
import hmac
import hashlib
import time
from functools import wraps
from flask import request, jsonify, g, current_app
from backend.models import db
from backend.models.user import User

def base64url_encode(data: bytes) -> str:
    """Encode bytes to a base64url string."""
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def base64url_decode(data: str) -> bytes:
    """Decode a base64url string to bytes."""
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

def encode_token(payload: dict, secret: str) -> str:
    """Generate a signed JWT token."""
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64url_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = base64url_encode(json.dumps(payload).encode('utf-8'))
    
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(secret.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_b64 = base64url_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def decode_token(token: str, secret: str) -> dict:
    """Verify and decode a signed JWT token."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        header_b64, payload_b64, signature_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        
        expected_signature = hmac.new(secret.encode('utf-8'), signing_input, hashlib.sha256).digest()
        expected_signature_b64 = base64url_encode(expected_signature)
        
        if not hmac.compare_digest(signature_b64, expected_signature_b64):
            return None
            
        payload = json.loads(base64url_decode(payload_b64).decode('utf-8'))
        
        # Check expiration
        if "exp" in payload and payload["exp"] < time.time():
            return None
            
        return payload
    except Exception:
        return None

class AuthService:
    @staticmethod
    def register(username, email, password, role="user"):
        """Register a new user in the system."""
        if not username or not email or not password:
            return {"error": "Missing required fields"}, 400
            
        # Check existing username or email
        if User.query.filter_by(username=username).first():
            return {"error": "Username already exists"}, 400
        if User.query.filter_by(email=email).first():
            return {"error": "Email already exists"}, 400
            
        # Client role is auto-approved, other staff roles require admin approval
        is_approved = True
        if role in ["operations", "supervisor", "distributor"]:
            is_approved = False
            
        user = User(username=username, email=email, role=role, is_approved=is_approved)
        user.set_password(password)
        
        try:
            db.session.add(user)
            db.session.commit()
            return {"message": "User registered successfully", "user": user.to_dict()}, 201
        except Exception as e:
            db.session.rollback()
            return {"error": f"Database error: {str(e)}"}, 500

    @staticmethod
    def login(username_or_email, password):
        """Authenticate user and issue a JWT token."""
        if not username_or_email or not password:
            return {"error": "Missing credentials"}, 400
            
        # Check by username or email
        user = User.query.filter((User.username == username_or_email) | (User.email == username_or_email)).first()
        
        if not user or not user.check_password(password):
            return {"error": "Invalid username/email or password"}, 401
            
        # Enforce approval gate
        if not user.is_approved:
            return {"error": "Your account is pending administrator approval."}, 403
            
        # Generate token payload
        secret = current_app.config.get("JWT_SECRET_KEY")
        expires_in = current_app.config.get("JWT_ACCESS_TOKEN_EXPIRES", 86400)
        
        payload = {
            "sub": user.id,
            "username": user.username,
            "role": user.role,
            "exp": time.time() + expires_in
        }
        
        token = encode_token(payload, secret)
        return {
            "message": "Login successful",
            "token": token,
            "user": user.to_dict()
        }, 200

def token_required(f):
    """Decorator to require JWT authentication on routes."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check Authorization header
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                
        if not token:
            return jsonify({"error": "Token is missing"}), 401
            
        secret = current_app.config.get("JWT_SECRET_KEY")
        payload = decode_token(token, secret)
        
        if not payload:
            return jsonify({"error": "Token is invalid or expired"}), 401
            
        # Query user and assign to Flask application context g
        user = User.query.get(payload["sub"])
        if not user:
            return jsonify({"error": "User not found"}), 401
            
        g.current_user = user
        return f(*args, **kwargs)
        
    return decorated
