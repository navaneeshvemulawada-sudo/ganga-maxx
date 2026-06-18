from datetime import datetime, timezone
from . import db

class Quotation(db.Model):
    """Quotation schema configuration."""
    __tablename__ = "quotations"
    
    id = db.Column(db.Integer, primary_key=True)
    quotation_number = db.Column(db.String(50), unique=True, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    
    subtotal = db.Column(db.Float, default=0.0, nullable=False)
    tax_rate = db.Column(db.Float, default=0.0, nullable=False)  # as percentage, e.g., 18.0
    tax_amount = db.Column(db.Float, default=0.0, nullable=False)
    discount = db.Column(db.Float, default=0.0, nullable=False)   # flat discount amount
    total_amount = db.Column(db.Float, default=0.0, nullable=False)
    
    status = db.Column(db.String(20), default="draft", nullable=False)  # draft, sent, accepted, rejected, expired
    valid_until = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    
    # Establish relationship to items (one-to-many)
    items = db.relationship("QuotationItem", backref="quotation", cascade="all, delete-orphan", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "quotation_number": self.quotation_number,
            "user_id": self.user_id,
            "customer_id": self.customer_id,
            "customer_name": self.customer.name if self.customer else None,
            "customer_facility_type": self.customer.facility_type if self.customer else None,
            "subtotal": self.subtotal,
            "tax_rate": self.tax_rate,
            "tax_amount": self.tax_amount,
            "discount": self.discount,
            "total_amount": self.total_amount,
            "status": self.status,
            "valid_until": self.valid_until.isoformat() if self.valid_until else None,
            "notes": self.notes,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "items": [item.to_dict() for item in self.items]
        }

class QuotationItem(db.Model):
    """Line item in a Quotation."""
    __tablename__ = "quotation_items"
    
    id = db.Column(db.Integer, primary_key=True)
    quotation_id = db.Column(db.Integer, db.ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False)
    product_name = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)  # qty * unit_price

    def to_dict(self):
        return {
            "id": self.id,
            "quotation_id": self.quotation_id,
            "product_name": self.product_name,
            "quantity": self.quantity,
            "unit_price": self.unit_price,
            "total_price": self.total_price
        }
