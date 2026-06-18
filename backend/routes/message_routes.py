from flask import Blueprint, jsonify, request, g
from backend.services.auth_service import token_required
from backend.services.message_service import MessageService

message_bp = Blueprint("messages", __name__, url_prefix="/api/messages")

@message_bp.route("", methods=["GET"])
@token_required
def get_messages():
    """Retrieve message history."""
    messages, status_code = MessageService.get_all()
    return jsonify(messages), status_code

@message_bp.route("", methods=["POST"])
@token_required
def send_message():
    """Send/append a new message."""
    data = request.get_json() or {}
    text = data.get("text")
    if not text:
        return jsonify({"error": "Message text is required"}), 400
        
    sender = g.current_user.username
    new_msg, status_code = MessageService.create(sender, text)
    return jsonify(new_msg), status_code
