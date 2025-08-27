from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base

class InventoryOperationType(str, enum.Enum):
    stock_in = "stock_in"
    stock_out = "stock_out"
    adjustment = "adjustment"
    return_stock = "return_stock"
    damage = "damage"
    transfer = "transfer"

class AlertType(str, enum.Enum):
    low_stock = "low_stock"
    out_of_stock = "out_of_stock"
    overstock = "overstock"
    expiry_warning = "expiry_warning"
    theft_suspicion = "theft_suspicion"

class AlertStatus(str, enum.Enum):
    active = "active"
    acknowledged = "acknowledged"
    resolved = "resolved"
    dismissed = "dismissed"

class Inventory(Base):
    __tablename__ = "inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    # Stock levels
    current_stock = Column(Integer, default=0, nullable=False)
    reserved_stock = Column(Integer, default=0, nullable=False)  # Stock in carts/orders
    available_stock = Column(Integer, default=0, nullable=False)  # current_stock - reserved_stock
    
    # Thresholds
    low_stock_threshold = Column(Integer, default=10)
    reorder_point = Column(Integer, default=5)
    max_stock = Column(Integer, default=1000)
    
    # Tracking
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())
    last_stock_in = Column(DateTime)
    last_stock_out = Column(DateTime)
    
    # Relationships
    product = relationship("Product", back_populates="inventory")
    operations = relationship("InventoryOperation", back_populates="inventory")
    alerts = relationship("InventoryAlert", back_populates="inventory")

class InventoryOperation(Base):
    __tablename__ = "inventory_operations"
    
    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id"), nullable=False)
    operation_type = Column(SQLEnum(InventoryOperationType), nullable=False)
    
    # Operation details
    quantity = Column(Integer, nullable=False)
    previous_stock = Column(Integer, nullable=False)
    new_stock = Column(Integer, nullable=False)
    
    # Reference information
    order_id = Column(Integer, ForeignKey("orders.id"))  # For order-related operations
    user_id = Column(Integer, ForeignKey("users.id"))  # Who performed the operation
    reference_number = Column(String(50))  # External reference
    
    # Additional data
    notes = Column(Text)
    operation_metadata = Column(JSON)  # Additional operation data (renamed from metadata)
    
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    inventory = relationship("Inventory", back_populates="operations")
    order = relationship("Order")
    user = relationship("User")

class InventoryAlert(Base):
    __tablename__ = "inventory_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id"), nullable=False)
    alert_type = Column(SQLEnum(AlertType), nullable=False)
    status = Column(SQLEnum(AlertStatus), default=AlertStatus.active)
    
    # Alert details
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="medium")  # low, medium, high, critical
    
    # Resolution
    acknowledged_by = Column(Integer, ForeignKey("users.id"))
    acknowledged_at = Column(DateTime)
    resolved_by = Column(Integer, ForeignKey("users.id"))
    resolved_at = Column(DateTime)
    resolution_notes = Column(Text)
    
    # Alert data
    alert_data = Column(JSON)  # Additional alert information
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    inventory = relationship("Inventory", back_populates="alerts")
    acknowledged_user = relationship("User", foreign_keys=[acknowledged_by])
    resolved_user = relationship("User", foreign_keys=[resolved_by])

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    contact_person = Column(String(100))
    email = Column(String(100))
    phone = Column(String(20))
    address = Column(JSON)
    
    # Supplier details
    website = Column(String(255))
    payment_terms = Column(String(100))
    lead_time_days = Column(Integer, default=7)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    order_number = Column(String(50), unique=True, nullable=False)
    
    # Order details
    status = Column(String(20), default="pending")  # pending, confirmed, shipped, received, cancelled
    total_amount = Column(Float, default=0.0)
    currency = Column(String(3), default="USD")
    
    # Dates
    order_date = Column(DateTime, default=func.now())
    expected_delivery = Column(DateTime)
    actual_delivery = Column(DateTime)
    
    # Additional info
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    supplier = relationship("Supplier")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order")
    creator = relationship("User")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    # Item details
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Received quantity
    received_quantity = Column(Integer, default=0)
    
    # Additional info
    notes = Column(Text)
    
    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product")

class StockTransfer(Base):
    __tablename__ = "stock_transfers"
    
    id = Column(Integer, primary_key=True, index=True)
    transfer_number = Column(String(50), unique=True, nullable=False)
    
    # Transfer details
    from_location = Column(String(100), nullable=False)
    to_location = Column(String(100), nullable=False)
    status = Column(String(20), default="pending")  # pending, in_transit, completed, cancelled
    
    # Dates
    transfer_date = Column(DateTime, default=func.now())
    expected_arrival = Column(DateTime)
    actual_arrival = Column(DateTime)
    
    # Additional info
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    items = relationship("StockTransferItem", back_populates="transfer")
    creator = relationship("User")

class StockTransferItem(Base):
    __tablename__ = "stock_transfer_items"
    
    id = Column(Integer, primary_key=True, index=True)
    transfer_id = Column(Integer, ForeignKey("stock_transfers.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    # Item details
    quantity = Column(Integer, nullable=False)
    transferred_quantity = Column(Integer, default=0)
    
    # Relationships
    transfer = relationship("StockTransfer", back_populates="items")
    product = relationship("Product")
