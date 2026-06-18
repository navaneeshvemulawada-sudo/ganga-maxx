import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure parent directory is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from backend.app import create_app
from backend.models import db
from backend.models.user import User
from backend.models.customer import Customer
from backend.models.inventory import Product
from backend.models.quotation import Quotation, QuotationItem
from backend.models.order import Order, OrderItem

def seed_db():
    app = create_app()
    with app.app_context():
        print("Recreating database tables...")
        db.drop_all()
        db.create_all()
        
        print("Seeding users...")
        users_to_seed = [
            {"username": "client", "email": "client@cleanbundle.ai", "role": "client", "password": "Demo@1234"},
            {"username": "operations", "email": "operations@cleanbundle.ai", "role": "operations", "password": "Demo@1234"},
            {"username": "supervisor", "email": "supervisor@cleanbundle.ai", "role": "supervisor", "password": "Demo@1234"},
            {"username": "distributor", "email": "distributor@cleanbundle.ai", "role": "distributor", "password": "Demo@1234"},
            {"username": "admin", "email": "demo@cleanbundle.ai", "role": "admin", "password": "Demo@1234"},
        ]
        
        saved_users = {}
        for u_data in users_to_seed:
            user = User(username=u_data["username"], email=u_data["email"], role=u_data["role"], is_approved=True)
            user.set_password(u_data["password"])
            db.session.add(user)
            db.session.flush()
            saved_users[user.username] = user.id
            
        print("Seeding inventory products...")
        products_to_seed = [
            {"sku": "TR-005", "name": "Toilet Bowl Cleaner 1L", "category": "Chemicals", "stock": 15, "min_stock": 10, "unit": "L", "unit_price": 120.0, "location": "Aisle A1"},
            {"sku": "FL-012", "name": "Floor Cleaner Disinfectant 5L", "category": "Chemicals", "stock": 5, "min_stock": 8, "unit": "L", "unit_price": 450.0, "location": "Aisle A2"},
            {"sku": "GL-002", "name": "Glass & Multi-Surface Cleaner 500ml", "category": "Chemicals", "stock": 35, "min_stock": 15, "unit": "pcs", "unit_price": 80.0, "location": "Aisle A3"},
            {"sku": "MC-022", "name": "Microfiber Cloths 4-Pack", "category": "Accessories", "stock": 50, "min_stock": 20, "unit": "pack", "unit_price": 250.0, "location": "Aisle B1"},
            {"sku": "TB-105", "name": "Heavy Duty Trash Bags (Large)", "category": "Consumables", "stock": 65, "min_stock": 25, "unit": "pack", "unit_price": 180.0, "location": "Aisle C1"},
            {"sku": "HS-045", "name": "Liquid Hand Soap 5L", "category": "Consumables", "stock": 12, "min_stock": 10, "unit": "L", "unit_price": 380.0, "location": "Aisle A4"},
            {"sku": "MP-088", "name": "Multi-Purpose Cleaner 5L", "category": "Chemicals", "stock": 18, "min_stock": 10, "unit": "L", "unit_price": 420.0, "location": "Aisle A5"},
            {"sku": "AF-011", "name": "Air Freshener Spray 300ml", "category": "Consumables", "stock": 40, "min_stock": 15, "unit": "pcs", "unit_price": 150.0, "location": "Aisle A6"},
            {"sku": "NG-099", "name": "Nitrile Disposable Gloves (Box of 100)", "category": "Consumables", "stock": 28, "min_stock": 15, "unit": "box", "unit_price": 600.0, "location": "Aisle C2"},
            {"sku": "WM-033", "name": "Wet Mop Refill (Cotton)", "category": "Accessories", "stock": 22, "min_stock": 10, "unit": "pcs", "unit_price": 160.0, "location": "Aisle B2"},
            {"sku": "SB-009", "name": "Scrubbing Brushes", "category": "Accessories", "stock": 30, "min_stock": 10, "unit": "pcs", "unit_price": 95.0, "location": "Aisle B3"},
            {"sku": "BS-077", "name": "Biohazard Trash Bags (Pack of 50)", "category": "Consumables", "stock": 25, "min_stock": 10, "unit": "pack", "unit_price": 320.0, "location": "Aisle C3"},
        ]
        
        for p_data in products_to_seed:
            prod = Product(
                sku=p_data["sku"],
                name=p_data["name"],
                category=p_data["category"],
                stock=p_data["stock"],
                min_stock=p_data["min_stock"],
                unit=p_data["unit"],
                unit_price=p_data["unit_price"],
                location=p_data["location"]
            )
            db.session.add(prod)
            
        print("Seeding CRM customers...")
        customers_to_seed = [
            {
                "name": "Test UniversityTest University",
                "email": "facilities1@testuniv.edu",
                "phone": "+91 99887 76655",
                "company": "Test Educational Trust",
                "address": "Building A, Room 101",
                "facility_type": "Hospitality",
                "floors": 43,
                "staff": 10050,
                "area": 1500010000,
                "health_score": 75,
                "tags": "",
                "compliance": ""
            },
            {
                "name": "Test University",
                "email": "facilities2@testuniv.edu",
                "phone": "+91 99887 76656",
                "company": "Test Educational Trust",
                "address": "Hospitality",
                "facility_type": "Hospitality",
                "floors": 45,
                "staff": 100120,
                "area": 1500025000,
                "health_score": 75,
                "tags": "",
                "compliance": ""
            },
            {
                "name": "aurora deemed university",
                "email": "procurement@aurora.edu.in",
                "phone": "+91 88776 65544",
                "company": "Aurora Educational Group",
                "address": "Bhongir",
                "facility_type": "Education",
                "floors": 4,
                "staff": 100,
                "area": 15000,
                "health_score": 75,
                "tags": "",
                "compliance": ""
            },
            {
                "name": "MetroMart Retail Chain",
                "email": "stores@metromart.co.in",
                "phone": "+91 55443 32211",
                "company": "Metro Retail Ltd",
                "address": "Chennai",
                "facility_type": "Retail",
                "floors": 2,
                "staff": 90,
                "area": 45000,
                "health_score": 64,
                "tags": "Retail",
                "compliance": ""
            },
            {
                "name": "Sunrise Hotel & Suites",
                "email": "housekeeping@sunrisehotels.com",
                "phone": "+91 77665 54433",
                "company": "Sunrise Hospitality Group",
                "address": "Goa",
                "facility_type": "Hospitality",
                "floors": 8,
                "staff": 240,
                "area": 120000,
                "health_score": 71,
                "tags": "Hospitality",
                "compliance": ""
            },
            {
                "name": "Skyline Tech Park",
                "email": "operations@skylinetech.com",
                "phone": "+91 88776 65544",
                "company": "Skyline Developers Ltd",
                "address": "Bengaluru",
                "facility_type": "Corporate Office",
                "floors": 12,
                "staff": 1200,
                "area": 220000,
                "health_score": 88,
                "tags": "Enterprise, VIP",
                "compliance": ""
            },
            {
                "name": "Greenwood International School",
                "email": "admin@greenwoodschool.in",
                "phone": "+91 66554 43322",
                "company": "Greenwood Education Foundation",
                "address": "Pune",
                "facility_type": "Education",
                "floors": 4,
                "staff": 180,
                "area": 60000,
                "health_score": 78,
                "tags": "Education",
                "compliance": ""
            },
            {
                "name": "St. Mary's Hospital",
                "email": "procurement@stmarys.org",
                "phone": "+91 98765 43210",
                "company": "St. Mary's Healthcare Group",
                "address": "Mumbai",
                "facility_type": "Healthcare",
                "floors": 6,
                "staff": 420,
                "area": 85000,
                "health_score": 92,
                "tags": "VIP, Healthcare",
                "compliance": ""
            }
        ]
        
        saved_customers = {}
        for c_data in customers_to_seed:
            cust = Customer(
                name=c_data["name"],
                email=c_data["email"],
                phone=c_data["phone"],
                company=c_data["company"],
                address=c_data["address"],
                facility_type=c_data["facility_type"],
                floors=c_data["floors"],
                staff=c_data["staff"],
                area=c_data["area"],
                health_score=c_data["health_score"],
                tags=c_data["tags"],
                compliance=c_data["compliance"],
                cleaning_frequency=c_data.get("cleaning_frequency", "Daily"),
                num_washrooms=c_data.get("num_washrooms", 12),
                daily_visitors=c_data.get("daily_visitors", 300),
                preferred_schedule=c_data.get("preferred_schedule", "Morning"),
                current_supplier=c_data.get("current_supplier", "CleanCo Ltd"),
                monthly_budget=c_data.get("monthly_budget", 25000.0)
            )
            db.session.add(cust)
            db.session.flush()  # get ID
            saved_customers[cust.name] = cust.id
            
        print("Seeding Quotations...")
        
        # Quotation 1 (Approved QTN-2026-1002)
        q1 = Quotation(
            quotation_number="QTN-2026-1002",
            customer_id=saved_customers["Test University"],
            user_id=saved_users["client"],
            subtotal=85654.37,
            tax_rate=18.0,
            tax_amount=15417.793,
            discount=0.0,
            total_amount=101072.163,
            status="approved",
            valid_until=datetime.now(timezone.utc) + timedelta(days=20),
            notes="AI-generated recommendation suite custom-designed for Test University. Factors in floors and weekly cleaning schedule.",
            created_at=datetime.now(timezone.utc) - timedelta(days=10)
        )
        db.session.add(q1)
        db.session.flush()
        
        q1_items = [
            QuotationItem(quotation_id=q1.id, product_name="Nitrile Disposable Gloves (Box of 100)", quantity=10, unit_price=600.0, total_price=6000.0),
            QuotationItem(quotation_id=q1.id, product_name="Biohazard Trash Bags (Pack of 50)", quantity=5, unit_price=320.0, total_price=1600.0),
            QuotationItem(quotation_id=q1.id, product_name="Floor Cleaner Disinfectant 5L", quantity=12, unit_price=450.0, total_price=5400.0),
            QuotationItem(quotation_id=q1.id, product_name="Toilet Bowl Cleaner 1L", quantity=20, unit_price=120.0, total_price=2460.0),
            QuotationItem(quotation_id=q1.id, product_name="Microfiber Cloths 4-Pack", quantity=20, unit_price=250.0, total_price=5000.0),
            QuotationItem(quotation_id=q1.id, product_name="Heavy Duty Trash Bags (Large)", quantity=20, unit_price=180.0, total_price=3600.0),
            QuotationItem(quotation_id=q1.id, product_name="Liquid Hand Soap 5L", quantity=20, unit_price=380.0, total_price=7600.0),
            QuotationItem(quotation_id=q1.id, product_name="Multi-Purpose Cleaner 5L", quantity=20, unit_price=420.0, total_price=8400.0),
        ]
        for item in q1_items:
            db.session.add(item)
            
        # Quotation 2 (Pending Approval QTN-2026-1001)
        q2 = Quotation(
            quotation_number="QTN-2026-1001",
            customer_id=saved_customers["aurora deemed university"],
            user_id=saved_users["client"],
            subtotal=2876.125,
            tax_rate=18.0,
            tax_amount=517.703,
            discount=0.0,
            total_amount=3393.828,
            status="pending approval",
            valid_until=datetime.now(timezone.utc) + timedelta(days=28),
            notes="AI-generated recommendation suite custom-designed for Aurora Deemed University.",
            created_at=datetime.now(timezone.utc) - timedelta(days=2)
        )
        db.session.add(q2)
        db.session.flush()
        
        q2_items = [
            QuotationItem(quotation_id=q2.id, product_name="Floor Cleaner Disinfectant 5L", quantity=2, unit_price=450.0, total_price=900.0),
            QuotationItem(quotation_id=q2.id, product_name="Glass & Multi-Surface Cleaner 500ml", quantity=1, unit_price=80.0, total_price=80.0),
            QuotationItem(quotation_id=q2.id, product_name="Microfiber Cloths 4-Pack", quantity=1, unit_price=250.0, total_price=250.0),
            QuotationItem(quotation_id=q2.id, product_name="Heavy Duty Trash Bags (Large)", quantity=2, unit_price=180.0, total_price=360.0),
            QuotationItem(quotation_id=q2.id, product_name="Liquid Hand Soap 5L", quantity=1, unit_price=380.0, total_price=380.0),
            QuotationItem(quotation_id=q2.id, product_name="Multi-Purpose Cleaner 5L", quantity=1, unit_price=420.0, total_price=420.0),
            QuotationItem(quotation_id=q2.id, product_name="Air Freshener Spray 300ml", quantity=1, unit_price=150.0, total_price=150.0),
            QuotationItem(quotation_id=q2.id, product_name="Toilet Bowl Cleaner 1L", quantity=1, unit_price=120.0, total_price=120.0),
        ]
        for item in q2_items:
            db.session.add(item)

        # Quotation 3 (Draft QTN-2026-1003)
        q3 = Quotation(
            quotation_number="QTN-2026-1003",
            customer_id=saved_customers["Test UniversityTest University"],
            user_id=saved_users["client"],
            subtotal=36221.6,
            tax_rate=18.0,
            tax_amount=6519.888,
            discount=0.0,
            total_amount=42741.488,
            status="draft",
            valid_until=datetime.now(timezone.utc) + timedelta(days=29),
            notes="AI-generated recommendation suite custom-designed for Test University VIP facilities.",
            created_at=datetime.now(timezone.utc) - timedelta(days=1)
        )
        db.session.add(q3)
        db.session.flush()
        
        q3_items = [
            QuotationItem(quotation_id=q3.id, product_name="Floor Cleaner Disinfectant 5L", quantity=20, unit_price=450.0, total_price=9000.0),
            QuotationItem(quotation_id=q3.id, product_name="Heavy Duty Trash Bags (Large)", quantity=20, unit_price=180.0, total_price=3600.0),
            QuotationItem(quotation_id=q3.id, product_name="Liquid Hand Soap 5L", quantity=10, unit_price=380.0, total_price=3800.0),
            QuotationItem(quotation_id=q3.id, product_name="Glass & Multi-Surface Cleaner 500ml", quantity=10, unit_price=80.0, total_price=800.0),
            QuotationItem(quotation_id=q3.id, product_name="Microfiber Cloths 4-Pack", quantity=10, unit_price=250.0, total_price=2500.0),
            QuotationItem(quotation_id=q3.id, product_name="Multi-Purpose Cleaner 5L", quantity=10, unit_price=420.0, total_price=4200.0),
            QuotationItem(quotation_id=q3.id, product_name="Nitrile Disposable Gloves (Box of 100)", quantity=10, unit_price=600.0, total_price=6000.0),
            QuotationItem(quotation_id=q3.id, product_name="Toilet Bowl Cleaner 1L", quantity=10, unit_price=120.0, total_price=1200.0),
        ]
        for item in q3_items:
            db.session.add(item)
            
        # Seed a Distributor Bulk Order
        print("Seeding Distributor Bulk Order...")
        dist_order = Order(
            order_number="ORD-2026-2001",
            user_id=saved_users["distributor"],
            subtotal=24000.0,
            discount_rate=0.15,
            discount_amount=3600.0,
            total_amount=20400.0,
            status="In Transit",
            carrier="CleanBundle Express Logistics",
            est_arrival=(datetime.now(timezone.utc) + timedelta(days=2)).strftime("%B %d, %Y"),
            created_at=datetime.now(timezone.utc) - timedelta(days=1)
        )
        db.session.add(dist_order)
        db.session.flush()
        
        dist_order_items = [
            OrderItem(order_id=dist_order.id, product_name="Floor Cleaner Disinfectant 5L", quantity=40, unit_price=450.0, total_price=18000.0),
            OrderItem(order_id=dist_order.id, product_name="Nitrile Disposable Gloves (Box of 100)", quantity=10, unit_price=600.0, total_price=6000.0)
        ]
        for item in dist_order_items:
            db.session.add(item)
            
        db.session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_db()
