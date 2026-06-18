import os
import json
import time

class MessageService:
    DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "instance", "messages.json")

    @classmethod
    def _load_messages(cls):
        os.makedirs(os.path.dirname(cls.DATA_FILE), exist_ok=True)
        if not os.path.exists(cls.DATA_FILE):
            # Seed initial messages matching frontend mockup
            initial_msgs = [
                {
                    "sender": "procurement",
                    "text": "Hello, when can we expect delivery of the TR-005 Toilet Cleaner batch? We are running low on stock in Block B.",
                    "time": "10:02 AM",
                    "timestamp": time.time() - 7200
                },
                {
                    "sender": "system",
                    "text": "CleanBundle AI system check: Product TR-005 has been marked as low stock in the Warehouse. Order generated.",
                    "time": "10:03 AM",
                    "timestamp": time.time() - 7100
                },
                {
                    "sender": "me",
                    "text": "Hello! I have created draft Quotation QTN-2026-1003 for the refills. Once you approve it, we will ship immediately.",
                    "time": "11:15 AM",
                    "timestamp": time.time() - 1200
                },
                {
                    "sender": "procurement",
                    "text": "Perfect. Let me review the draft quote and submit it for facilities approval now.",
                    "time": "11:17 AM",
                    "timestamp": time.time() - 1100
                }
            ]
            with open(cls.DATA_FILE, "w") as f:
                json.dump(initial_msgs, f, indent=2)
            return initial_msgs
            
        try:
            with open(cls.DATA_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return []

    @classmethod
    def _save_messages(cls, messages):
        os.makedirs(os.path.dirname(cls.DATA_FILE), exist_ok=True)
        with open(cls.DATA_FILE, "w") as f:
            json.dump(messages, f, indent=2)

    @classmethod
    def get_all(cls):
        return cls._load_messages(), 200

    @classmethod
    def create(cls, sender, text):
        if not text or not text.strip():
            return {"error": "Message text cannot be empty"}, 400
            
        messages = cls._load_messages()
        current_time = time.strftime("%I:%M %p")
        new_msg = {
            "sender": sender,
            "text": text.strip(),
            "time": current_time,
            "timestamp": time.time()
        }
        messages.append(new_msg)
        cls._save_messages(messages)
        return new_msg, 201
