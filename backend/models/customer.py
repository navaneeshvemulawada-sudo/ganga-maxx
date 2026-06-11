from datetime import datetime, timezone
from . import db

class Customer(db.Model):
    """Customer representation in the system."""
    __tablename__ = "customers"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(120), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    company = db.Column(db.String(150), nullable=True)
    address = db.Column(db.Text, nullable=True)
    
    # Facility and CRM additions
    facility_type = db.Column(db.String(50), nullable=True)
    floors = db.Column(db.Integer, nullable=True)
    staff = db.Column(db.Integer, nullable=True)
    area = db.Column(db.Integer, nullable=True)
    health_score = db.Column(db.Integer, default=75, nullable=False)
    tags = db.Column(db.String(200), nullable=True)
    compliance = db.Column(db.String(200), nullable=True)
    
    # New business fields
    cleaning_frequency = db.Column(db.String(50), nullable=True)
    num_washrooms = db.Column(db.Integer, nullable=True)
    daily_visitors = db.Column(db.Integer, nullable=True)
    preferred_schedule = db.Column(db.String(50), nullable=True)
    current_supplier = db.Column(db.String(150), nullable=True)
    monthly_budget = db.Column(db.Float, nullable=True)
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Establish a relationship with Quotations (cascade delete so if a customer is deleted, their quotations are handled)
    quotations = db.relationship("Quotation", backref="customer", cascade="all, delete-orphan", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "company": self.company,
            "address": self.address,
            "facility_type": self.facility_type,
            "floors": self.floors,
            "staff": self.staff,
            "area": self.area,
            "health_score": self.health_score,
            "tags": self.tags,
            "compliance": self.compliance,
            "cleaning_frequency": self.cleaning_frequency,
            "num_washrooms": self.num_washrooms,
            "daily_visitors": self.daily_visitors,
            "preferred_schedule": self.preferred_schedule,
            "current_supplier": self.current_supplier,
            "monthly_budget": self.monthly_budget,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

