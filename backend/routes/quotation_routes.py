from flask import Blueprint, request, jsonify
from backend.services.quotation_service import QuotationService
from backend.services.auth_service import token_required

quotation_bp = Blueprint("quotations", __name__, url_prefix="/api/quotations")

@quotation_bp.route("", methods=["GET"])
@token_required
def get_all_quotations():
    """Retrieve all quotations, filtered by user if not admin."""
    from flask import g
    response, status_code = QuotationService.get_all(user_id=g.current_user.id, role=g.current_user.role)
    return jsonify(response), status_code

@quotation_bp.route("/<int:quote_id>", methods=["GET"])
@token_required
def get_quotation(quote_id):
    """Retrieve a single quotation by ID."""
    from flask import g
    response, status_code = QuotationService.get_by_id(quote_id)
    if status_code == 200 and g.current_user.role != "admin":
        if response.get("user_id") == g.current_user.id:
            return jsonify(response), status_code
        if g.current_user.role == "operations" and response.get("status") in ["pending approval", "approved"]:
            return jsonify(response), status_code
        return jsonify({"error": "Unauthorized access to this quotation"}), 403
    return jsonify(response), status_code

@quotation_bp.route("", methods=["POST"])
@token_required
def create_quotation():
    """Create a new quotation."""
    from flask import g
    data = request.get_json() or {}
    data["user_id"] = g.current_user.id
    response, status_code = QuotationService.create(data)
    return jsonify(response), status_code

@quotation_bp.route("/<int:quote_id>", methods=["PUT"])
@token_required
def update_quotation(quote_id):
    """Update a quotation status or items."""
    data = request.get_json() or {}
    response, status_code = QuotationService.update(quote_id, data)
    return jsonify(response), status_code

@quotation_bp.route("/<int:quote_id>", methods=["DELETE"])
@token_required
def delete_quotation(quote_id):
    """Delete a quotation."""
    response, status_code = QuotationService.delete(quote_id)
    return jsonify(response), status_code
