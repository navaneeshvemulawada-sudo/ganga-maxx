from flask import Blueprint, jsonify, request, g
from backend.models import db
from backend.models.inventory import Product
from backend.services.auth_service import token_required
from backend.services.requisition_service import RequisitionService

requisition_bp = Blueprint("requisitions", __name__, url_prefix="/api/requisitions")

@requisition_bp.route("", methods=["GET"])
@token_required
def get_requisitions():
    """Retrieve restock requests."""
    requisitions, status_code = RequisitionService.get_all()
    # Filter for supervisor role to only see their own requests
    if g.current_user.role == "supervisor":
        requisitions = [r for r in requisitions if r["supervisor"] == g.current_user.username]
    return jsonify(requisitions), status_code

@requisition_bp.route("", methods=["POST"])
@token_required
def create_requisition():
    """Create a new restock requisition request."""
    data = request.get_json() or {}
    product_sku = data.get("product_sku")
    product_name = data.get("product_name")
    qty = data.get("qty")
    
    if not product_sku or not product_name or qty is None:
        return jsonify({"error": "Missing required fields"}), 400
        
    supervisor = g.current_user.username
    new_req, status_code = RequisitionService.create(supervisor, product_sku, product_name, qty)
    return jsonify(new_req), status_code

@requisition_bp.route("/<string:req_id>/status", methods=["PUT"])
@token_required
def update_requisition_status(req_id):
    """Approve or reject a restock requisition."""
    data = request.get_json() or {}
    status = data.get("status")
    if not status:
        return jsonify({"error": "Status is required"}), 400
        
    # Only operations and admin can approve restock requests
    if g.current_user.role not in ["operations", "admin"]:
        return jsonify({"error": "Unauthorized to approve restock requests"}), 403
        
    updated_req, status_code = RequisitionService.update_status(req_id, status)
    
    if status_code == 200 and status == "approved":
        # Increment stock in the database
        product = Product.query.filter_by(sku=updated_req["product_sku"]).first()
        if product:
            product.stock += updated_req["qty"]
            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                # Log error but don't fail the request since requisition table has been written
                print("Failed to auto-increment stock on requisition approval:", e)
                
    return jsonify(updated_req), status_code
