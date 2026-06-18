from flask import Blueprint, request, jsonify
from backend.services.order_service import OrderService
from backend.services.auth_service import token_required

order_bp = Blueprint("orders", __name__, url_prefix="/api/orders")

@order_bp.route("", methods=["GET"])
@token_required
def get_all_orders():
    from flask import g
    response, status_code = OrderService.get_all(user_id=g.current_user.id, role=g.current_user.role)
    return jsonify(response), status_code

@order_bp.route("/<int:order_id>", methods=["GET"])
@token_required
def get_order(order_id):
    from flask import g
    response, status_code = OrderService.get_by_id(order_id)
    if status_code == 200 and g.current_user.role != "admin":
        if response.get("user_id") != g.current_user.id:
            return jsonify({"error": "Unauthorized access to this order"}), 403
    return jsonify(response), status_code

@order_bp.route("", methods=["POST"])
@token_required
def create_order():
    from flask import g
    data = request.get_json() or {}
    response, status_code = OrderService.create(data, user_id=g.current_user.id)
    return jsonify(response), status_code
