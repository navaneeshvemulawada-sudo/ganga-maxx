from datetime import datetime, timezone
from . import db

class Product(db.Model):
    """Product representation in warehouse inventory."""
    __tablename__ = "products"
    
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    stock = db.Column(db.Integer, default=0, nullable=False)
    min_stock = db.Column(db.Integer, default=0, nullable=False)
    unit = db.Column(db.String(20), default="pcs", nullable=False)
    unit_price = db.Column(db.Float, default=0.0, nullable=False)
    location = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    def to_dict(self):
        return {
            "id": self.id,
            "sku": self.sku,
            "name": self.name,
            "category": self.category,
            "stock": self.stock,
            "min_stock": self.min_stock,
            "unit": self.unit,
            "unit_price": self.unit_price,
            "location": self.location,
            "status": "Reorder" if self.stock <= self.min_stock else "Healthy",
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
