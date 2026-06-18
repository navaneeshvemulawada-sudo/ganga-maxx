from datetime import datetime, timezone, timedelta
from backend.models import db
from backend.models.order import Order, OrderItem

class OrderService:
    @staticmethod
    def _generate_order_number():
        """Generates an order number in the format ORD-YYYY-XXXX."""
        year = datetime.now(timezone.utc).year
        count = Order.query.count()
        return f"ORD-{year}-{(2001 + count)}"

    @staticmethod
    def get_all(user_id=None, role=None):
        """Retrieve orders. Admin sees all, others see their own."""
        if role == "admin":
            orders = Order.query.all()
        elif user_id:
            orders = Order.query.filter_by(user_id=user_id).all()
        else:
            orders = Order.query.all()
        return [o.to_dict() for o in orders], 200

    @staticmethod
    def get_by_id(order_id):
        order = Order.query.get(order_id)
        if not order:
            return {"error": "Order not found"}, 404
        return order.to_dict(), 200

    @staticmethod
    def create(data, user_id):
        items_data = data.get("items", [])
        if not items_data:
            return {"error": "Order must have at least one item"}, 400
            
        subtotal = float(data.get("subtotal", 0.0))
        discount_rate = float(data.get("discount_rate", 0.0))
        discount_amount = float(data.get("discount_amount", 0.0))
        total_amount = float(data.get("total_amount", 0.0))
        
        # Calculate estimated arrival (e.g., 3 days from now)
        est_date = datetime.now(timezone.utc) + timedelta(days=3)
        est_arrival = est_date.strftime("%B %d, %Y")
        
        order = Order(
            order_number=OrderService._generate_order_number(),
            user_id=user_id,
            subtotal=subtotal,
            discount_rate=discount_rate,
            discount_amount=discount_amount,
            total_amount=total_amount,
            status="Processing",
            carrier="CleanBundle Express Logistics",
            est_arrival=est_arrival
        )
        
        try:
            db.session.add(order)
            db.session.flush()
            
            for item in items_data:
                o_item = OrderItem(
                    order_id=order.id,
                    product_name=item["product_name"],
                    quantity=int(item["quantity"]),
                    unit_price=float(item["unit_price"]),
                    total_price=float(item["total_price"])
                )
                db.session.add(o_item)
                
            db.session.commit()
            return order.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {"error": f"Database error: {str(e)}"}, 500
