from datetime import datetime, timezone
from . import db

class Order(db.Model):
    """Bulk Order placed by Distributors."""
    __tablename__ = "orders"
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    subtotal = db.Column(db.Float, default=0.0, nullable=False)
    discount_rate = db.Column(db.Float, default=0.0, nullable=False)
    discount_amount = db.Column(db.Float, default=0.0, nullable=False)
    total_amount = db.Column(db.Float, default=0.0, nullable=False)
    
    status = db.Column(db.String(50), default="Processing", nullable=False) # Processing, In Transit, Delivered
    carrier = db.Column(db.String(100), default="CleanBundle Express Logistics", nullable=False)
    est_arrival = db.Column(db.String(50), nullable=True)
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationship to user
    user = db.relationship("User", backref="orders", lazy=True)
    
    # Establish relationship to items
    items = db.relationship("OrderItem", backref="order", cascade="all, delete-orphan", lazy=True)
    
    def to_dict(self):
        return {
            "id": self.id,
            "order_number": self.order_number,
            "user_id": self.user_id,
            "username": self.user.username if self.user else None,
            "subtotal": self.subtotal,
            "discount_rate": self.discount_rate,
            "discount_amount": self.discount_amount,
            "total_amount": self.total_amount,
            "status": self.status,
            "carrier": self.carrier,
            "est_arrival": self.est_arrival,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "items": [item.to_dict() for item in self.items]
        }

class OrderItem(db.Model):
    """Line item in a Bulk Order."""
    __tablename__ = "order_items"
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_name = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)  # qty * unit_price
    
    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "product_name": self.product_name,
            "quantity": self.quantity,
            "unit_price": self.unit_price,
            "total_price": self.total_price
        }
