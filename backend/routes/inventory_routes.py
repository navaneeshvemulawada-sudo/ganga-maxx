from flask import Blueprint, jsonify, request
from backend.models import db
from backend.models.inventory import Product
from backend.services.auth_service import token_required

inventory_bp = Blueprint("inventory", __name__, url_prefix="/api/inventory")

@inventory_bp.route("", methods=["GET"])
@token_required
def get_inventory():
    """Retrieve all products in warehouse inventory."""
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products]), 200

@inventory_bp.route("/<int:product_id>", methods=["PUT"])
@token_required
def update_stock(product_id):
    """Update stock level or other parameters for a product SKU."""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product SKU not found"}), 404
        
    data = request.get_json() or {}
    if "stock" in data:
        product.stock = int(data["stock"])
    if "unit_price" in data:
        product.unit_price = float(data["unit_price"])
    if "min_stock" in data:
        product.min_stock = int(data["min_stock"])
        
    try:
        db.session.commit()
        return jsonify(product.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
