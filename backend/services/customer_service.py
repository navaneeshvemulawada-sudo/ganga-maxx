from backend.models import db
from backend.models.customer import Customer

class CustomerService:
    @staticmethod
    def get_all():
        """Retrieve all customers."""
        customers = Customer.query.all()
        return [customer.to_dict() for customer in customers], 200

    @staticmethod
    def get_by_id(customer_id):
        """Retrieve a specific customer by ID."""
        customer = Customer.query.get(customer_id)
        if not customer:
            return {"error": "Customer not found"}, 404
        return customer.to_dict(), 200

    @staticmethod
    def create(data):
        """Create a new customer record."""
        name = data.get("name")
        if not name:
            return {"error": "Customer name is required"}, 400
            
        customer = Customer(
            name=name,
            email=data.get("email"),
            phone=data.get("phone"),
            company=data.get("company"),
            address=data.get("address"),
            facility_type=data.get("facility_type"),
            floors=data.get("floors"),
            staff=data.get("staff"),
            area=data.get("area"),
            health_score=data.get("health_score", 75),
            tags=data.get("tags"),
            compliance=data.get("compliance"),
            cleaning_frequency=data.get("cleaning_frequency"),
            num_washrooms=data.get("num_washrooms"),
            daily_visitors=data.get("daily_visitors"),
            preferred_schedule=data.get("preferred_schedule"),
            current_supplier=data.get("current_supplier"),
            monthly_budget=data.get("monthly_budget")
        )
        
        try:
            db.session.add(customer)
            db.session.commit()
            return customer.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {"error": f"Database error: {str(e)}"}, 500

    @staticmethod
    def update(customer_id, data):
        """Update an existing customer record."""
        customer = Customer.query.get(customer_id)
        if not customer:
            return {"error": "Customer not found"}, 404
            
        if "name" in data:
            customer.name = data["name"]
        if "email" in data:
            customer.email = data["email"]
        if "phone" in data:
            customer.phone = data["phone"]
        if "company" in data:
            customer.company = data["company"]
        if "address" in data:
            customer.address = data["address"]
        if "facility_type" in data:
            customer.facility_type = data["facility_type"]
        if "floors" in data:
            customer.floors = data["floors"]
        if "staff" in data:
            customer.staff = data["staff"]
        if "area" in data:
            customer.area = data["area"]
        if "health_score" in data:
            customer.health_score = data["health_score"]
        if "tags" in data:
            customer.tags = data["tags"]
        if "compliance" in data:
            customer.compliance = data["compliance"]
        if "cleaning_frequency" in data:
            customer.cleaning_frequency = data["cleaning_frequency"]
        if "num_washrooms" in data:
            customer.num_washrooms = data["num_washrooms"]
        if "daily_visitors" in data:
            customer.daily_visitors = data["daily_visitors"]
        if "preferred_schedule" in data:
            customer.preferred_schedule = data["preferred_schedule"]
        if "current_supplier" in data:
            customer.current_supplier = data["current_supplier"]
        if "monthly_budget" in data:
            customer.monthly_budget = data["monthly_budget"]
            
        try:
            db.session.commit()
            return customer.to_dict(), 200
        except Exception as e:
            db.session.rollback()
            return {"error": f"Database error: {str(e)}"}, 500

    @staticmethod
    def delete(customer_id):
        """Delete a customer record."""
        customer = Customer.query.get(customer_id)
        if not customer:
            return {"error": "Customer not found"}, 404
            
        try:
            db.session.delete(customer)
            db.session.commit()
            return {"message": "Customer deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": f"Database error: {str(e)}"}, 500
