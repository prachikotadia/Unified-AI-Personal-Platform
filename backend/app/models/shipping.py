from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base

class ShippingMethod(str, enum.Enum):
    standard = "standard"
    express = "express"
    overnight = "overnight"
    same_day = "same_day"
    pickup = "pickup"

class ShippingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    in_transit = "in_transit"
    out_for_delivery = "out_for_delivery"
    delivered = "delivered"
    failed = "failed"
    returned = "returned"
    cancelled = "cancelled"

class Carrier(str, enum.Enum):
    fedex = "fedex"
    ups = "ups"
    usps = "usps"
    dhl = "dhl"
    amazon_logistics = "amazon_logistics"
    local_courier = "local_courier"

class Address(Base):
    __tablename__ = "addresses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Address details
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    company = Column(String(100))
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255))
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), nullable=False)
    
    # Contact info
    phone = Column(String(20))
    email = Column(String(100))
    
    # Address type
    address_type = Column(String(20), default="shipping")  # shipping, billing, both
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Validation
    is_validated = Column(Boolean, default=False)
    validation_data = Column(JSON)  # Store validation response
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="addresses")
    shipments = relationship("Shipment", foreign_keys="Shipment.shipping_address_id")

class ShippingZone(Base):
    __tablename__ = "shipping_zones"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Zone configuration
    countries = Column(JSON)  # List of country codes
    states = Column(JSON)  # List of state codes
    postal_codes = Column(JSON)  # List of postal code patterns
    
    # Shipping methods available
    available_methods = Column(JSON)  # List of available shipping methods
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

class ShippingRate(Base):
    __tablename__ = "shipping_rates"
    
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("shipping_zones.id"), nullable=False)
    method = Column(SQLEnum(ShippingMethod), nullable=False)
    
    # Rate configuration
    base_rate = Column(Float, nullable=False)
    per_item_rate = Column(Float, default=0.0)
    weight_rate = Column(Float, default=0.0)  # Rate per kg/lb
    
    # Conditions
    min_order_value = Column(Float, default=0.0)
    max_order_value = Column(Float)
    min_weight = Column(Float, default=0.0)
    max_weight = Column(Float)
    
    # Delivery time
    estimated_days_min = Column(Integer, default=3)
    estimated_days_max = Column(Integer, default=7)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    zone = relationship("ShippingZone")

class Shipment(Base):
    __tablename__ = "shipments"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    shipping_address_id = Column(Integer, ForeignKey("addresses.id"), nullable=False)
    
    # Shipping details
    method = Column(SQLEnum(ShippingMethod), nullable=False)
    carrier = Column(SQLEnum(Carrier), nullable=False)
    status = Column(SQLEnum(ShippingStatus), default=ShippingStatus.pending)
    
    # Tracking
    tracking_number = Column(String(100), unique=True)
    tracking_url = Column(String(255))
    carrier_tracking_id = Column(String(100))
    
    # Cost and weight
    shipping_cost = Column(Float, nullable=False)
    insurance_cost = Column(Float, default=0.0)
    total_cost = Column(Float, nullable=False)
    weight = Column(Float)  # in kg
    dimensions = Column(JSON)  # length, width, height
    
    # Dates
    shipped_at = Column(DateTime)
    estimated_delivery = Column(DateTime)
    actual_delivery = Column(DateTime)
    
    # Additional info
    notes = Column(Text)
    shipment_metadata = Column(JSON)  # Additional shipment data (renamed from metadata)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="shipments")
    shipping_address = relationship("Address")
    tracking_events = relationship("ShipmentTrackingEvent", back_populates="shipment")

class ShipmentTrackingEvent(Base):
    __tablename__ = "shipment_tracking_events"
    
    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=False)
    
    # Event details
    event_type = Column(String(100), nullable=False)
    status = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    
    # Location
    location = Column(String(255))
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100))
    
    # Timestamp
    event_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Additional data
    event_metadata = Column(JSON)  # Additional event data (renamed from metadata)
    
    # Relationships
    shipment = relationship("Shipment", back_populates="tracking_events")

class DeliveryAttempt(Base):
    __tablename__ = "delivery_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=False)
    
    # Attempt details
    attempt_number = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False)  # successful, failed, rescheduled
    
    # Attempt info
    attempted_at = Column(DateTime, nullable=False)
    delivery_notes = Column(Text)
    
    # Failure reason (if failed)
    failure_reason = Column(String(255))
    failure_code = Column(String(50))
    
    # Next attempt
    next_attempt_date = Column(DateTime)
    
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    shipment = relationship("Shipment")

class ReturnShipment(Base):
    __tablename__ = "return_shipments"
    
    id = Column(Integer, primary_key=True, index=True)
    original_shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=False)
    
    # Return details
    return_reason = Column(String(255), nullable=False)
    return_type = Column(String(50), default="refund")  # refund, exchange, repair
    
    # Return shipping
    return_tracking_number = Column(String(100))
    return_carrier = Column(SQLEnum(Carrier))
    return_shipping_cost = Column(Float, default=0.0)
    
    # Status
    status = Column(String(50), default="pending")  # pending, in_transit, received, processed
    
    # Dates
    return_requested_at = Column(DateTime, default=func.now())
    return_shipped_at = Column(DateTime)
    return_received_at = Column(DateTime)
    processed_at = Column(DateTime)
    
    # Additional info
    notes = Column(Text)
    refund_amount = Column(Float)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    original_shipment = relationship("Shipment")

class ShippingLabel(Base):
    __tablename__ = "shipping_labels"
    
    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=False)
    
    # Label details
    label_type = Column(String(50), default="pdf")  # pdf, png, zpl
    label_url = Column(String(255))
    label_data = Column(Text)  # Base64 encoded label data
    
    # Label info
    label_number = Column(String(100), unique=True)
    barcode = Column(String(100))
    
    # Expiration
    expires_at = Column(DateTime)
    
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    shipment = relationship("Shipment")
