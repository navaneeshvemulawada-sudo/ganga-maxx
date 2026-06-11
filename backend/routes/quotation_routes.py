from flask import Blueprint, request, jsonify
from backend.services.quotation_service import QuotationService
from backend.services.auth_service import token_required

quotation_bp = Blueprint("quotations", __name__, url_prefix="/api/quotations")

@quotation_bp.route("", methods=["GET"])
@token_required
def get_all_quotations():
    """Retrieve all quotations."""
    response, status_code = QuotationService.get_all()
    return jsonify(response), status_code

@quotation_bp.route("/<int:quote_id>", methods=["GET"])
@token_required
def get_quotation(quote_id):
    """Retrieve a single quotation by ID."""
    response, status_code = QuotationService.get_by_id(quote_id)
    return jsonify(response), status_code

@quotation_bp.route("", methods=["POST"])
@token_required
def create_quotation():
    """Create a new quotation."""
    data = request.get_json() or {}
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
