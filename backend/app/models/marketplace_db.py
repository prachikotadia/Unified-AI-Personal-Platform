from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class ProductCategory(str, enum.Enum):
    electronics = "electronics"
    fashion = "fashion"
    home_garden = "home_garden"
    sports_outdoors = "sports_outdoors"
    books = "books"
    beauty_personal_care = "beauty_personal_care"

class ProductSubcategory(str, enum.Enum):
    smartphones = "smartphones"
    laptops = "laptops"
    headphones = "headphones"
    clothing = "clothing"
    shoes = "shoes"
    accessories = "accessories"
    furniture = "furniture"
    kitchen = "kitchen"
    fitness = "fitness"
    outdoor = "outdoor"
    fiction = "fiction"
    non_fiction = "non_fiction"
    skincare = "skincare"
    makeup = "makeup"

class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"
    returned = "returned"

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"
    partially_refunded = "partially_refunded"

class PaymentMethod(str, enum.Enum):
    credit_card = "credit_card"
    debit_card = "debit_card"
    paypal = "paypal"
    apple_pay = "apple_pay"
    google_pay = "google_pay"
    bank_transfer = "bank_transfer"
    crypto = "crypto"

class ShippingMethod(str, enum.Enum):
    standard = "standard"
    express = "express"
    overnight = "overnight"
    same_day = "same_day"
    international = "international"

class ReturnStatus(str, enum.Enum):
    requested = "requested"
    approved = "approved"
    rejected = "rejected"
    in_transit = "in_transit"
    received = "received"
    refunded = "refunded"

class InventoryStatus(str, enum.Enum):
    in_stock = "in_stock"
    low_stock = "low_stock"
    out_of_stock = "out_of_stock"
    discontinued = "discontinued"
    pre_order = "pre_order"

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    icon = Column(String(50))
    color = Column(String(7))  # Hex color
    sort_order = Column(Integer, default=0)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subcategories = relationship("Category", backref="parent")
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    original_price = Column(Float)
    discount_percentage = Column(Float, default=0)
    category_id = Column(Integer, ForeignKey("categories.id"))
    subcategory = Column(Enum(ProductSubcategory))
    brand = Column(String(100))
    sku = Column(String(100), unique=True)
    stock_quantity = Column(Integer, default=0)
    min_stock_threshold = Column(Integer, default=5)
    weight = Column(Float)  # in kg
    dimensions = Column(JSON)  # {"length": 10, "width": 5, "height": 2}
    images = Column(JSON)  # Array of image URLs
    specifications = Column(JSON)
    features = Column(JSON)  # Array of features
    tags = Column(JSON)  # Array of tags
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_deal = Column(Boolean, default=False)
    is_trending = Column(Boolean, default=False)
    rating = Column(Float, default=0)
    review_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = relationship("Category", back_populates="products")
    reviews = relationship("Review", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    wishlist_items = relationship("WishlistItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    inventory_logs = relationship("InventoryLog", back_populates="product")
    price_alerts = relationship("PriceAlert", back_populates="product")
    questions = relationship("ProductQuestion", back_populates="product")
    recently_viewed = relationship("RecentlyViewed", back_populates="product")

class InventoryLog(Base):
    __tablename__ = "inventory_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    user_id = Column(String(50))
    action = Column(String(50))  # "stock_in", "stock_out", "adjustment", "reserved"
    quantity = Column(Integer)
    previous_quantity = Column(Integer)
    new_quantity = Column(Integer)
    reason = Column(String(200))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="inventory_logs")

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    user_id = Column(String(50))
    user_name = Column(String(100))
    user_avatar = Column(String(200))
    rating = Column(Integer, nullable=False)  # 1-5
    title = Column(String(200))
    comment = Column(Text)
    helpful_votes = Column(Integer, default=0)
    verified_purchase = Column(Boolean, default=False)
    images = Column(JSON)  # Array of image URLs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="reviews")

class CartItem(Base):
    __tablename__ = "cart_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="cart_items")

class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"))
    added_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="wishlist_items")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), nullable=False)
    order_number = Column(String(50), unique=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    payment_method = Column(Enum(PaymentMethod))
    subtotal = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0)
    shipping_amount = Column(Float, default=0)
    discount_amount = Column(Float, default=0)
    total_amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    shipping_address = Column(JSON)
    billing_address = Column(JSON)
    shipping_method = Column(Enum(ShippingMethod))
    tracking_number = Column(String(100))
    estimated_delivery = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = relationship("OrderItem", back_populates="order")
    returns = relationship("Return", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    product_name = Column(String(200))
    product_sku = Column(String(100))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class Return(Base):
    __tablename__ = "returns"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    user_id = Column(String(50))
    return_number = Column(String(50), unique=True)
    status = Column(Enum(ReturnStatus), default=ReturnStatus.requested)
    reason = Column(String(200))
    description = Column(Text)
    return_method = Column(String(50))  # "shipping", "drop_off"
    tracking_number = Column(String(100))
    refund_amount = Column(Float)
    refund_method = Column(Enum(PaymentMethod))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order = relationship("Order", back_populates="returns")

class ShippingZone(Base):
    __tablename__ = "shipping_zones"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    countries = Column(JSON)  # Array of country codes
    states = Column(JSON)  # Array of state codes
    zip_codes = Column(JSON)  # Array of zip code patterns
    shipping_methods = Column(JSON)  # Array of available shipping methods

class ShippingRate(Base):
    __tablename__ = "shipping_rates"
    
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("shipping_zones.id"))
    shipping_method = Column(Enum(ShippingMethod))
    min_weight = Column(Float)
    max_weight = Column(Float)
    base_rate = Column(Float)
    per_kg_rate = Column(Float)
    estimated_days = Column(Integer)

class TaxRate(Base):
    __tablename__ = "tax_rates"
    
    id = Column(Integer, primary_key=True, index=True)
    country = Column(String(2))  # Country code
    state = Column(String(10))  # State code
    city = Column(String(100))
    zip_code = Column(String(20))
    rate = Column(Float, nullable=False)  # Tax rate as decimal (0.08 for 8%)
    tax_name = Column(String(100))  # "Sales Tax", "VAT", etc.
    is_active = Column(Boolean, default=True)

class LoyaltyProgram(Base):
    __tablename__ = "loyalty_program"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), unique=True)
    points_balance = Column(Integer, default=0)
    total_points_earned = Column(Integer, default=0)
    total_points_redeemed = Column(Integer, default=0)
    tier = Column(String(20), default="bronze")  # bronze, silver, gold, platinum
    tier_points = Column(Integer, default=0)
    next_tier_points = Column(Integer, default=1000)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class LoyaltyTransaction(Base):
    __tablename__ = "loyalty_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50))
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    transaction_type = Column(String(20))  # "earned", "redeemed", "expired", "bonus"
    points = Column(Integer)
    description = Column(String(200))
    created_at = Column(DateTime, default=datetime.utcnow)

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50))
    product_id = Column(Integer, ForeignKey("products.id"))
    recommended_product_id = Column(Integer, ForeignKey("products.id"))
    score = Column(Float)
    reason = Column(String(200))
    algorithm = Column(String(50))  # "collaborative", "content_based", "hybrid"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", foreign_keys=[product_id])
    recommended_product = relationship("Product", foreign_keys=[recommended_product_id])

class PriceAlert(Base):
    __tablename__ = "price_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50))
    product_id = Column(Integer, ForeignKey("products.id"))
    target_price = Column(Float, nullable=False)
    current_price = Column(Float)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    triggered_at = Column(DateTime, nullable=True)
    
    # Relationships
    product = relationship("Product", back_populates="price_alerts")

class ProductComparison(Base):
    __tablename__ = "product_comparisons"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50))
    name = Column(String(100))
    product_ids = Column(JSON)  # Array of product IDs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RecentlyViewed(Base):
    __tablename__ = "recently_viewed"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50))
    product_id = Column(Integer, ForeignKey("products.id"))
    viewed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="recently_viewed")

class ProductQuestion(Base):
    __tablename__ = "product_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    user_id = Column(String(50))
    user_name = Column(String(100))
    question = Column(Text, nullable=False)
    helpful_votes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="questions")
    answers = relationship("ProductAnswer", back_populates="question")

class ProductAnswer(Base):
    __tablename__ = "product_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("product_questions.id"))
    user_id = Column(String(50))
    user_name = Column(String(100))
    user_type = Column(String(20))  # "customer", "seller", "admin"
    answer = Column(Text, nullable=False)
    helpful_votes = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    question = relationship("ProductQuestion", back_populates="answers")
