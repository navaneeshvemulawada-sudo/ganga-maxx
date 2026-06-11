from datetime import datetime, timezone, timedelta
from backend.models import db
from backend.models.quotation import Quotation, QuotationItem
from backend.models.customer import Customer

class QuotationService:
    @staticmethod
    def _generate_quotation_number():
        """Generates a quotation number in the format QTN-YYYY-XXXX."""
        year = datetime.now(timezone.utc).year
        count = Quotation.query.count()
        return f"QTN-{year}-{(1001 + count)}"


    @staticmethod
    def _calculate_totals(items_data, tax_rate, discount):
        """Calculates subtotal, tax, and final amount for list of items."""
        subtotal = 0.0
        parsed_items = []
        
        for item in items_data:
            qty = int(item.get("quantity", 1))
            unit_price = float(item.get("unit_price", 0.0))
            total_price = qty * unit_price
            subtotal += total_price
            
            parsed_items.append({
                "product_name": item.get("product_name"),
                "quantity": qty,
                "unit_price": unit_price,
                "total_price": total_price
            })
            
        tax_amount = subtotal * (float(tax_rate) / 100.0)
        total_amount = subtotal + tax_amount - float(discount)
        if total_amount < 0:
            total_amount = 0.0
            
        return subtotal, tax_amount, total_amount, parsed_items

    @staticmethod
    def get_all():
        """Retrieve all quotations."""
        quotations = Quotation.query.all()
        return [q.to_dict() for q in quotations], 200

    @staticmethod
    def get_by_id(quote_id):
        """Retrieve a specific quotation by ID."""
        quote = Quotation.query.get(quote_id)
        if not quote:
            return {"error": "Quotation not found"}, 404
        return quote.to_dict(), 200

    @staticmethod
    def create(data):
        """Create a new quotation with associated line items."""
        customer_id = data.get("customer_id")
        if not customer_id:
            return {"error": "Customer ID is required"}, 400
            
        # Verify customer exists
        customer = Customer.query.get(customer_id)
        if not customer:
            return {"error": "Customer not found"}, 400
            
        items_data = data.get("items", [])
        if not items_data:
            return {"error": "Quotation must have at least one item"}, 400
            
        tax_rate = float(data.get("tax_rate", 0.0))
        discount = float(data.get("discount", 0.0))
        
        subtotal, tax_amount, total_amount, parsed_items = QuotationService._calculate_totals(items_data, tax_rate, discount)
        
        # Determine valid_until (default 30 days)
        valid_days = int(data.get("valid_days", 30))
        valid_until = datetime.now(timezone.utc) + timedelta(days=valid_days)
        
        quote = Quotation(
            quotation_number=QuotationService._generate_quotation_number(),
            customer_id=customer_id,
            subtotal=subtotal,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            discount=discount,
            total_amount=total_amount,
            status=data.get("status", "draft"),
            valid_until=valid_until,
            notes=data.get("notes")
        )
        
        try:
            db.session.add(quote)
            db.session.flush()  # Fetch quote.id before committing
            
            # Create quotation items
            for item in parsed_items:
                q_item = QuotationItem(
                    quotation_id=quote.id,
                    product_name=item["product_name"],
                    quantity=item["quantity"],
                    unit_price=item["unit_price"],
                    total_price=item["total_price"]
                )
                db.session.add(q_item)
                
            db.session.commit()
            return quote.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {"error": f"Database error: {str(e)}"}, 500

    @staticmethod
    def update(quote_id, data):
        """Update an existing quotation and recalculate totals."""
        quote = Quotation.query.get(quote_id)
        if not quote:
            return {"error": "Quotation not found"}, 404
            
        if "status" in data:
            quote.status = data["status"]
            
        if "notes" in data:
            quote.notes = data["notes"]
            
        if "valid_until" in data:
            try:
                quote.valid_until = datetime.fromisoformat(data["valid_until"])
            except ValueError:
                return {"error": "Invalid date format, use ISO 8601"}, 400
                
        # If updating items, tax, or discount, recalculate everything
        if "items" in data or "tax_rate" in data or "discount" in data:
            tax_rate = float(data.get("tax_rate", quote.tax_rate))
            discount = float(data.get("discount", quote.discount))
            
            # If items are specified, replace existing ones
            if "items" in data:
                items_data = data["items"]
                if not items_data:
                    return {"error": "Quotation must have at least one item"}, 400
                    
                subtotal, tax_amount, total_amount, parsed_items = QuotationService._calculate_totals(items_data, tax_rate, discount)
                
                # Delete existing items
                QuotationItem.query.filter_by(quotation_id=quote.id).delete()
                
                # Add new items
                for item in parsed_items:
                    q_item = QuotationItem(
                        quotation_id=quote.id,
                        product_name=item["product_name"],
                        quantity=item["quantity"],
                        unit_price=item["unit_price"],
                        total_price=item["total_price"]
                    )
                    db.session.add(q_item)
            else:
                # Re-calculate with existing items and new tax/discount settings
                existing_items_data = [
                    {"product_name": item.product_name, "quantity": item.quantity, "unit_price": item.unit_price}
                    for item in quote.items
                ]
                subtotal, tax_amount, total_amount, _ = QuotationService._calculate_totals(existing_items_data, tax_rate, discount)
                
            quote.subtotal = subtotal
            quote.tax_rate = tax_rate
            quote.tax_amount = tax_amount
            quote.discount = discount
            quote.total_amount = total_amount
            
        try:
            db.session.commit()
            return quote.to_dict(), 200
        except Exception as e:
            db.session.rollback()
            return {"error": f"Database error: {str(e)}"}, 500

    @staticmethod
    def delete(quote_id):
        """Delete a quotation record."""
        quote = Quotation.query.get(quote_id)
        if not quote:
            return {"error": "Quotation not found"}, 404
            
        try:
            db.session.delete(quote)
            db.session.commit()
            return {"message": "Quotation deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": f"Database error: {str(e)}"}, 500
