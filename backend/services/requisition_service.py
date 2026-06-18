import os
import json
import time
import uuid

class RequisitionService:
    DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "instance", "requisitions.json")

    @classmethod
    def _load_requisitions(cls):
        os.makedirs(os.path.dirname(cls.DATA_FILE), exist_ok=True)
        if not os.path.exists(cls.DATA_FILE):
            # Seed initial requisitions matching frontend mockup
            initial_reqs = [
                {
                    "id": "REQ-20260615-0001",
                    "product_sku": "FL-012",
                    "product_name": "Floor Cleaner Disinfectant 5L",
                    "qty": 15,
                    "status": "pending",
                    "supervisor": "supervisor_john",
                    "created_at": time.time() - 3600
                }
            ]
            with open(cls.DATA_FILE, "w") as f:
                json.dump(initial_reqs, f, indent=2)
            return initial_reqs
            
        try:
            with open(cls.DATA_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return []

    @classmethod
    def _save_requisitions(cls, requisitions):
        os.makedirs(os.path.dirname(cls.DATA_FILE), exist_ok=True)
        with open(cls.DATA_FILE, "w") as f:
            json.dump(requisitions, f, indent=2)

    @classmethod
    def get_all(cls):
        return cls._load_requisitions(), 200

    @classmethod
    def create(cls, supervisor, product_sku, product_name, qty):
        try:
            qty = int(qty)
        except (ValueError, TypeError):
            return {"error": "Invalid quantity"}, 400

        if qty <= 0:
            return {"error": "Quantity must be greater than zero"}, 400

        requisitions = cls._load_requisitions()
        req_id = f"REQ-{time.strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
        new_req = {
            "id": req_id,
            "product_sku": product_sku,
            "product_name": product_name,
            "qty": qty,
            "status": "pending",
            "supervisor": supervisor,
            "created_at": time.time()
        }
        requisitions.append(new_req)
        cls._save_requisitions(requisitions)
        return new_req, 201

    @classmethod
    def update_status(cls, req_id, status):
        if status not in ["approved", "rejected"]:
            return {"error": "Invalid status value"}, 400

        requisitions = cls._load_requisitions()
        found = False
        updated_req = None
        for req in requisitions:
            if req["id"] == req_id:
                req["status"] = status
                req["updated_at"] = time.time()
                updated_req = req
                found = True
                break

        if not found:
            return {"error": "Requisition not found"}, 404

        cls._save_requisitions(requisitions)
        return updated_req, 200
