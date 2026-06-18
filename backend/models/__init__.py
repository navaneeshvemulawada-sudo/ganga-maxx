# pyrefly: ignore [missing-import]
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import models to register them with SQLAlchemy
from .user import User
from .customer import Customer
from .quotation import Quotation, QuotationItem
from .inventory import Product
from .order import Order, OrderItem

