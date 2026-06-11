from flask import Blueprint, request, jsonify
from backend.services.customer_service import CustomerService
from backend.services.auth_service import token_required

customer_bp = Blueprint("customers", __name__, url_prefix="/api/customers")

@customer_bp.route("", methods=["GET"])
@token_required
def get_all_customers():
    """Retrieve all customers."""
    response, status_code = CustomerService.get_all()
    return jsonify(response), status_code

@customer_bp.route("/<int:customer_id>", methods=["GET"])
@token_required
def get_customer(customer_id):
    """Retrieve a single customer."""
    response, status_code = CustomerService.get_by_id(customer_id)
    return jsonify(response), status_code

@customer_bp.route("", methods=["POST"])
@token_required
def create_customer():
    """Create a new customer."""
    data = request.get_json() or {}
    response, status_code = CustomerService.create(data)
    return jsonify(response), status_code

@customer_bp.route("/<int:customer_id>", methods=["PUT"])
@token_required
def update_customer(customer_id):
    """Update a customer."""
    data = request.get_json() or {}
    response, status_code = CustomerService.update(customer_id, data)
    return jsonify(response), status_code

@customer_bp.route("/<int:customer_id>", methods=["DELETE"])
@token_required
def delete_customer(customer_id):
    """Delete a customer."""
    response, status_code = CustomerService.delete(customer_id)
    return jsonify(response), status_code
