import math
from backend.models.inventory import Product

class RecommendationService:
    @staticmethod
    def get_recommendations(profile_data):
        """
        Calculates recommended items, quantities, and pricing based on facility specs.
        """
        facility_type = profile_data.get("facility_type", "Other")
        floors = int(profile_data.get("floors", 1))
        staff_count = int(profile_data.get("staff_count", 0))
        area = int(profile_data.get("area", 0))
        cleaning_frequency = profile_data.get("cleaning_frequency", "Daily")
        compliance_list = profile_data.get("compliance", [])
        if isinstance(compliance_list, str):
            compliance_list = [c.strip() for c in compliance_list.split(",") if c.strip()]

        # Define default products if database is not queried
        # In a real app, we fetch products from database to ensure matching IDs/prices
        db_products = {p.sku: p for p in Product.query.all()}
        
        # Helper to get product info safely
        def get_product(sku, default_name, default_price, default_unit):
            if sku in db_products:
                return {
                    "sku": sku,
                    "name": db_products[sku].name,
                    "unit_price": db_products[sku].unit_price,
                    "unit": db_products[sku].unit,
                    "stock": db_products[sku].stock,
                    "min_stock": db_products[sku].min_stock
                }
            return {
                "sku": sku,
                "name": default_name,
                "unit_price": default_price,
                "unit": default_unit,
                "stock": 15,
                "min_stock": 5
            }

        # Multipliers based on cleaning frequency
        freq_multipliers = {
            "Daily": 1.0,
            "Twice Daily": 1.8,
            "Weekly": 0.3,
            "Bi-weekly": 0.2,
            "Monthly": 0.1
        }
        freq_mult = freq_multipliers.get(cleaning_frequency, 1.0)

        recommendations = []

        # 1. Floor Cleaner Disinfectant 5L (FL-012)
        floor_cleaner_qty = math.ceil((area / 4000) * freq_mult)
        if floor_cleaner_qty > 0:
            prod_info = get_product("FL-012", "Floor Cleaner Disinfectant 5L", 450.0, "L")
            prod_info["quantity"] = floor_cleaner_qty
            prod_info["subtotal"] = floor_cleaner_qty * prod_info["unit_price"]
            prod_info["eco_friendly"] = True
            recommendations.append(prod_info)

        # 2. Toilet Bowl Cleaner 1L (TR-005)
        toilet_multiplier = 1.5 if facility_type == "Healthcare" else 1.0
        toilet_cleaner_qty = math.ceil(floors * 2 * toilet_multiplier * freq_mult)
        if toilet_cleaner_qty > 0:
            prod_info = get_product("TR-005", "Toilet Bowl Cleaner 1L", 120.0, "L")
            prod_info["quantity"] = toilet_cleaner_qty
            prod_info["subtotal"] = toilet_cleaner_qty * prod_info["unit_price"]
            prod_info["eco_friendly"] = False
            recommendations.append(prod_info)

        # 3. Glass & Multi-Surface Cleaner 500ml (GL-002)
        glass_cleaner_qty = math.ceil(floors * 1.5 * freq_mult)
        if glass_cleaner_qty > 0:
            prod_info = get_product("GL-002", "Glass & Multi-Surface Cleaner 500ml", 80.0, "pcs")
            prod_info["quantity"] = glass_cleaner_qty
            prod_info["subtotal"] = glass_cleaner_qty * prod_info["unit_price"]
            prod_info["eco_friendly"] = True
            recommendations.append(prod_info)

        # 4. Multi-Purpose Cleaner 5L (MP-088)
        mp_cleaner_qty = math.ceil((area / 12000) * freq_mult)
        if mp_cleaner_qty > 0:
            prod_info = get_product("MP-088", "Multi-Purpose Cleaner 5L", 420.0, "L")
            prod_info["quantity"] = mp_cleaner_qty
            prod_info["subtotal"] = mp_cleaner_qty * prod_info["unit_price"]
            prod_info["eco_friendly"] = True
            recommendations.append(prod_info)

        # 5. Heavy Duty Trash Bags (TB-105)
        trash_bag_qty = math.ceil((staff_count / 12) * freq_mult)
        if trash_bag_qty > 0:
            prod_info = get_product("TB-105", "Heavy Duty Trash Bags (Large)", 180.0, "pack")
            prod_info["quantity"] = trash_bag_qty
            prod_info["subtotal"] = trash_bag_qty * prod_info["unit_price"]
            prod_info["eco_friendly"] = True
            recommendations.append(prod_info)

        # 6. Liquid Hand Soap 5L (HS-045)
        soap_qty = math.ceil(staff_count / 40)
        if soap_qty > 0:
            prod_info = get_product("HS-045", "Liquid Hand Soap 5L", 380.0, "L")
            prod_info["quantity"] = soap_qty
            prod_info["subtotal"] = soap_qty * prod_info["unit_price"]
            prod_info["eco_friendly"] = True
            recommendations.append(prod_info)

        # 7. Nitrile Disposable Gloves Box of 100 (NG-099)
        gloves_mult = 3.0 if (facility_type == "Healthcare" or "NABH" in compliance_list) else 1.0
        gloves_qty = math.ceil((staff_count / 15) * gloves_mult)
        if gloves_qty > 0:
            prod_info = get_product("NG-099", "Nitrile Disposable Gloves (Box of 100)", 600.0, "box")
            prod_info["quantity"] = gloves_qty
            prod_info["subtotal"] = gloves_qty * prod_info["unit_price"]
            prod_info["eco_friendly"] = False
            recommendations.append(prod_info)

        # 8. Biohazard Trash Bags Pack of 50 (BS-077) - Compliance item
        if "NABH" in compliance_list or "HACCP" in compliance_list or facility_type == "Healthcare":
            bio_qty = math.ceil(staff_count / 20)
            if bio_qty > 0:
                prod_info = get_product("BS-077", "Biohazard Trash Bags (Pack of 50)", 320.0, "pack")
                prod_info["quantity"] = bio_qty
                prod_info["subtotal"] = bio_qty * prod_info["unit_price"]
                prod_info["eco_friendly"] = False
                recommendations.append(prod_info)

        # 9. Microfiber Cloths 4-Pack (MC-022)
        cloths_qty = math.ceil(floors * 2)
        if cloths_qty > 0:
            prod_info = get_product("MC-022", "Microfiber Cloths 4-Pack", 250.0, "pack")
            prod_info["quantity"] = cloths_qty
            prod_info["subtotal"] = cloths_qty * prod_info["unit_price"]
            prod_info["eco_friendly"] = True
            recommendations.append(prod_info)

        # 10. Wet Mop Refill (Cotton) (WM-033)
        mops_qty = math.ceil(floors * 0.8)
        if mops_qty > 0:
            prod_info = get_product("WM-033", "Wet Mop Refill (Cotton)", 160.0, "pcs")
            prod_info["quantity"] = mops_qty
            prod_info["subtotal"] = mops_qty * prod_info["unit_price"]
            prod_info["eco_friendly"] = True
            recommendations.append(prod_info)

        # Calculate summaries
        estimated_subtotal = sum(item["subtotal"] for item in recommendations)
        eco_items = sum(1 for item in recommendations if item["eco_friendly"])
        eco_percentage = int((eco_items / len(recommendations)) * 100) if recommendations else 0
        
        # Calculate heuristics scores
        confidence_score = 92
        if area > 10000 and staff_count > 100:
            confidence_score = 96
        if not compliance_list:
            confidence_score -= 5

        return {
            "estimated_subtotal": estimated_subtotal,
            "eco_percentage": eco_percentage,
            "confidence_score": confidence_score,
            "items": recommendations,
            "summary_text": f"Recommended cleaning bundle tailored for a {facility_type} facility spanning {area:,} sqft across {floors} floor(s) with {staff_count} personnel. Compliance configuration checks applied: {', '.join(compliance_list) if compliance_list else 'None'}."
        }
