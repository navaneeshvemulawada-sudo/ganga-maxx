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

@inventory_bp.route("", methods=["POST"])
@token_required
def create_product():
    """Create a new product SKU in inventory."""
    data = request.get_json() or {}
    name = data.get("name")
    
    if not name:
        return jsonify({"error": "Product name is required"}), 400
        
    sku = data.get("sku")
    if not sku or not sku.strip():
        # Auto-generate a unique SKU based on category
        import random
        cat_prefixes = {
            "Chemicals": "CH",
            "Accessories": "AC",
            "Consumables": "CO"
        }
        category = data.get("category", "General")
        prefix = cat_prefixes.get(category, "GN")
        
        while True:
            rand_num = random.randint(100, 999)
            sku = f"{prefix}-{rand_num}"
            if not Product.query.filter_by(sku=sku).first():
                break
    else:
        sku = sku.strip().upper()
        # Check if SKU already exists
        if Product.query.filter_by(sku=sku).first():
            return jsonify({"error": f"Product SKU '{sku}' already exists"}), 400
        
    product = Product(
        sku=sku,
        name=name,
        category=data.get("category", "General"),
        stock=int(data.get("stock", 0)),
        min_stock=int(data.get("min_stock", 0)),
        unit=data.get("unit", "pcs"),
        unit_price=float(data.get("unit_price", 0.0)),
        location=data.get("location", "N/A")
    )
    
    try:
        db.session.add(product)
        db.session.commit()
        return jsonify(product.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500

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
