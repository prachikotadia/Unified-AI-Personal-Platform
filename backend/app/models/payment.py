from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base

class PaymentMethodType(str, enum.Enum):
    credit_card = "credit_card"
    debit_card = "debit_card"
    paypal = "paypal"
    apple_pay = "apple_pay"
    google_pay = "google_pay"
    bank_transfer = "bank_transfer"
    crypto = "crypto"

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"
    refunded = "refunded"
    partially_refunded = "partially_refunded"

class PaymentProvider(str, enum.Enum):
    stripe = "stripe"
    paypal = "paypal"
    square = "square"
    braintree = "braintree"

class PaymentMethod(Base):
    __tablename__ = "payment_methods"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(SQLEnum(PaymentMethodType), nullable=False)
    provider = Column(SQLEnum(PaymentProvider), nullable=False)
    name = Column(String(100), nullable=False)  # e.g., "Visa ending in 4242"
    last4 = Column(String(4))
    brand = Column(String(20))  # e.g., "visa", "mastercard"
    expiry_month = Column(Integer)
    expiry_year = Column(Integer)
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Encrypted payment data (in production, use proper encryption)
    payment_data = Column(JSON)  # Store provider-specific data
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="payment_methods")
    transactions = relationship("PaymentTransaction", back_populates="payment_method")

class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id"), nullable=False)
    
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.pending)
    provider = Column(SQLEnum(PaymentProvider), nullable=False)
    
    # Provider-specific data
    provider_transaction_id = Column(String(255))  # External transaction ID
    provider_response = Column(JSON)  # Store provider response
    
    # Transaction details
    description = Column(Text)
    transaction_metadata = Column(JSON)  # Additional transaction data (renamed from metadata)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    processed_at = Column(DateTime)
    
    # Relationships
    order = relationship("Order", back_populates="payment_transactions")
    user = relationship("User")
    payment_method = relationship("PaymentMethod", back_populates="transactions")

class PaymentRefund(Base):
    __tablename__ = "payment_refunds"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("payment_transactions.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    reason = Column(String(255))
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.pending)
    
    # Provider-specific data
    provider_refund_id = Column(String(255))
    provider_response = Column(JSON)
    
    created_at = Column(DateTime, default=func.now())
    processed_at = Column(DateTime)
    
    # Relationships
    transaction = relationship("PaymentTransaction")

class PaymentWebhook(Base):
    __tablename__ = "payment_webhooks"
    
    id = Column(Integer, primary_key=True, index=True)
    provider = Column(SQLEnum(PaymentProvider), nullable=False)
    event_type = Column(String(100), nullable=False)
    event_id = Column(String(255), unique=True)
    payload = Column(JSON, nullable=False)
    processed = Column(Boolean, default=False)
    processed_at = Column(DateTime)
    
    created_at = Column(DateTime, default=func.now())
