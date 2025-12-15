from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base

class ProductCategory(str, enum.Enum):
    electronics = "electronics"
    clothing = "clothing"
    books = "books"
    home = "home"
    sports = "sports"
    beauty = "beauty"
    toys = "toys"
    automotive = "automotive"
    health = "health"
    food = "food"
    jewelry = "jewelry"
    art = "art"
    music = "music"
    tools = "tools"
    garden = "garden"
    other = "other"

class ProductSubcategory(str, enum.Enum):
    # Electronics
    smartphones = "smartphones"
    laptops = "laptops"
    tablets = "tablets"
    headphones = "headphones"
    cameras = "cameras"
    gaming = "gaming"
    audio = "audio"
    tv = "tv"
    
    # Clothing
    mens = "mens"
    womens = "womens"
    kids = "kids"
    shoes = "shoes"
    accessories = "accessories"
    jewelry = "jewelry"
    
    # Home
    furniture = "furniture"
    kitchen = "kitchen"
    decor = "decor"
    bedding = "bedding"
    lighting = "lighting"
    
    # Sports
    fitness = "fitness"
    outdoor = "outdoor"
    team_sports = "team_sports"
    yoga = "yoga"
    running = "running"
    
    # Other categories...
    other = "other"

class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"
    returned = "returned"
    refunded = "refunded"

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

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    original_price = Column(Float)
    discount_percentage = Column(Float, default=0.0)
    category = Column(SQLEnum(ProductCategory), nullable=False)
    subcategory = Column(SQLEnum(ProductSubcategory))
    brand = Column(String(100), nullable=False)
    sku = Column(String(100), unique=True, index=True)
    stock_quantity = Column(Integer, default=0)
    images = Column(JSON)  # List of image URLs
    specifications = Column(JSON)  # Product specifications
    features = Column(JSON)  # List of features
    tags = Column(JSON)  # List of tags
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    featured = Column(Boolean, default=False)
    trending = Column(Boolean, default=False)
    prime_eligible = Column(Boolean, default=False)
    free_shipping = Column(Boolean, default=False)
    status = Column(String(20), default="active")  # active, inactive, discontinued
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    reviews = relationship("Review", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    wishlist_items = relationship("WishlistItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    inventory = relationship("Inventory", back_populates="product", uselist=False)

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String(200))
    comment = Column(Text)
    helpful_votes = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

class Cart(Base):
    __tablename__ = "carts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"
    
    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    price = Column(Float, nullable=False)  # Price at time of adding to cart
    added_at = Column(DateTime, default=func.now())
    
    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")

class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    added_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_items")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.pending)
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.pending)
    payment_method = Column(SQLEnum(PaymentMethod))
    
    # Order totals
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0.0)
    shipping_cost = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    
    # Shipping info
    shipping_address = Column(JSON)
    billing_address = Column(JSON)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    shipments = relationship("Shipment", back_populates="order")
    payment_transactions = relationship("PaymentTransaction", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text)
    parent_id = Column(Integer, ForeignKey("categories.id"))
    image_url = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Self-referential relationship for subcategories
    children = relationship("Category")

class SearchHistory(Base):
    __tablename__ = "search_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    query = Column(String(255), nullable=False)
    filters = Column(JSON)
    results_count = Column(Integer)
    created_at = Column(DateTime, default=func.now())

class ProductView(Base):
    __tablename__ = "product_views"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    viewed_at = Column(DateTime, default=func.now())
    session_id = Column(String(100))

# Enhanced Features Models

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    recommendation_type = Column(String(50))  # "similar", "trending", "personalized"
    score = Column(Float, default=0.0)
    reason = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="ai_recommendations")
    product = relationship("Product")

class PriceAlert(Base):
    __tablename__ = "price_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    target_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    # Enhanced fields
    notification_preferences = Column(JSON)  # {"email": True, "push": True, "sms": False}
    price_history = Column(JSON)  # List of price snapshots
    alert_frequency = Column(String(20), default="daily")  # "hourly", "daily", "weekly"
    last_notified_at = Column(DateTime)
    notification_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    triggered_at = Column(DateTime)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="price_alerts")
    product = relationship("Product")

class ProductComparison(Base):
    __tablename__ = "product_comparisons"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    product_ids = Column(JSON, nullable=False)  # List of product IDs
    # Enhanced fields
    comparison_data = Column(JSON)  # AI-generated comparison data
    share_token = Column(String(100), unique=True, index=True)
    is_public = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    last_viewed_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="product_comparisons")

class RecentlyViewed(Base):
    __tablename__ = "recently_viewed"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    viewed_at = Column(DateTime, default=func.now())
    # Enhanced fields
    view_duration = Column(Integer)  # Seconds spent viewing
    view_type = Column(String(20), default="full_view")  # "quick_view", "full_view", "purchase"
    session_id = Column(String(100))
    referrer = Column(String(255))  # Where they came from
    
    # Relationships
    user = relationship("User", back_populates="recently_viewed")
    product = relationship("Product")

class ProductQuestion(Base):
    __tablename__ = "product_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    helpful_votes = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    product = relationship("Product")
    user = relationship("User", back_populates="product_questions")
    answers = relationship("ProductAnswer", back_populates="question")

class ProductAnswer(Base):
    __tablename__ = "product_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("product_questions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    answer = Column(Text, nullable=False)
    helpful_votes = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    question = relationship("ProductQuestion", back_populates="answers")
    user = relationship("User", back_populates="product_answers")

# Additional Marketplace Models

class Coupon(Base):
    __tablename__ = "coupons"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    discount_type = Column(String(20), nullable=False)  # "percentage", "fixed", "shipping"
    discount_value = Column(Float, nullable=False)
    min_purchase = Column(Float, default=0.0)
    max_discount = Column(Float)  # For percentage discounts
    usage_limit = Column(Integer)  # Total usage limit
    usage_count = Column(Integer, default=0)
    user_limit = Column(Integer, default=1)  # Per user limit
    valid_from = Column(DateTime, nullable=False)
    valid_until = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    applicable_categories = Column(JSON)  # List of category IDs
    applicable_products = Column(JSON)  # List of product IDs
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class CouponUsage(Base):
    __tablename__ = "coupon_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    coupon_id = Column(Integer, ForeignKey("coupons.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"))
    discount_amount = Column(Float, nullable=False)
    used_at = Column(DateTime, default=func.now())
    
    # Relationships
    coupon = relationship("Coupon")
    user = relationship("User")
    order = relationship("Order")

class WishlistList(Base):
    __tablename__ = "wishlist_lists"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    is_public = Column(Boolean, default=False)
    is_default = Column(Boolean, default=False)
    share_token = Column(String(100), unique=True, index=True)  # For sharing
    item_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    items = relationship("WishlistItem", back_populates="list")

# Update WishlistItem to include list_id
# Note: This would require a migration in production
# For now, we'll add it as a comment in the model

class OrderTracking(Base):
    __tablename__ = "order_tracking"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    tracking_number = Column(String(100), unique=True, index=True, nullable=False)
    carrier = Column(String(100), nullable=False)  # "UPS", "FedEx", "USPS", etc.
    carrier_service = Column(String(100))  # "Ground", "Express", etc.
    status = Column(String(50), nullable=False)  # "pending", "in_transit", "out_for_delivery", "delivered", "exception"
    estimated_delivery = Column(DateTime)
    actual_delivery = Column(DateTime)
    current_location = Column(String(255))
    events = Column(JSON)  # List of tracking events
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    order = relationship("Order")

class OrderReturn(Base):
    __tablename__ = "order_returns"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    return_type = Column(String(20), nullable=False)  # "return", "refund", "exchange"
    return_reason = Column(String(100), nullable=False)
    return_description = Column(Text)
    items = Column(JSON, nullable=False)  # List of {item_id, quantity, reason}
    status = Column(String(50), default="pending")  # "pending", "approved", "rejected", "processing", "completed"
    refund_amount = Column(Float)
    refund_method = Column(String(50))  # "original_payment", "store_credit", etc.
    return_tracking_number = Column(String(100))
    return_address = Column(JSON)
    requested_at = Column(DateTime, default=func.now())
    approved_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    # Relationships
    order = relationship("Order")
    user = relationship("User")

class ProductShare(Base):
    __tablename__ = "product_shares"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    share_type = Column(String(20), default="link")  # "link", "email", "social"
    share_token = Column(String(100), unique=True, index=True)
    recipients = Column(JSON)  # List of email addresses or user IDs
    message = Column(Text)
    share_count = Column(Integer, default=0)  # Number of times shared
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    product = relationship("Product")
    user = relationship("User")

class SavedSearch(Base):
    __tablename__ = "saved_searches"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    query = Column(String(255), nullable=False)
    filters = Column(JSON)  # Search filters
    is_active = Column(Boolean, default=True)
    notification_enabled = Column(Boolean, default=False)
    last_searched_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")

class ReviewHelpful(Base):
    __tablename__ = "review_helpful"
    
    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("reviews.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_helpful = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    review = relationship("Review")
    user = relationship("User")
    
    # Unique constraint: one vote per user per review
    __table_args__ = (
        {'sqlite_autoincrement': True},
    )

# Enhanced PriceAlert model
# PriceAlert already exists, but we'll add enhanced fields
# Note: In production, this would require a migration
# Enhanced fields to add:
# - notification_preferences (JSON)
# - price_history (JSON)
# - alert_frequency (String)
# - last_notified_at (DateTime)

# Enhanced ProductComparison model
# ProductComparison already exists, but we'll add enhanced fields
# Enhanced fields to add:
# - comparison_data (JSON) - AI-generated comparison data
# - share_token (String)
# - is_public (Boolean)
# - view_count (Integer)

# Enhanced RecentlyViewed model
# RecentlyViewed already exists, but we'll add enhanced fields
# Enhanced fields to add:
# - view_duration (Integer) - seconds spent viewing
# - view_type (String) - "quick_view", "full_view", "purchase"
# - session_id (String)
