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

class CartItem(Base):
    __tablename__ = "cart_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    added_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="cart_items")
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
    created_at = Column(DateTime, default=func.now())
    triggered_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="price_alerts")
    product = relationship("Product")

class ProductComparison(Base):
    __tablename__ = "product_comparisons"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    product_ids = Column(JSON)  # List of product IDs
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
