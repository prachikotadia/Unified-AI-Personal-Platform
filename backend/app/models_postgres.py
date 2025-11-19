from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from app.database_postgres import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255))
    hashed_password = Column(String(255), nullable=False)
    status = Column(String(50), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    finance_accounts = relationship("FinanceAccount", back_populates="user")
    fitness_goals = relationship("FitnessGoal", back_populates="user")
    ai_insights = relationship("AIInsight", back_populates="user")

class FinanceAccount(Base):
    __tablename__ = "finance_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    account_type = Column(String(100), nullable=False)  # savings, checking, credit, investment
    balance = Column(Float, default=0.0)
    currency = Column(String(10), default="USD")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="finance_accounts")
    transactions = relationship("FinanceTransaction", back_populates="account")

class FinanceTransaction(Base):
    __tablename__ = "finance_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("finance_accounts.id"), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(50), nullable=False)  # income, expense, transfer
    category = Column(String(100))
    description = Column(Text)
    date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    account = relationship("FinanceAccount", back_populates="transactions")

class FitnessGoal(Base):
    __tablename__ = "fitness_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    goal_type = Column(String(100), nullable=False)  # weight, steps, workout, nutrition
    target_value = Column(Float)
    current_value = Column(Float, default=0.0)
    unit = Column(String(50))  # kg, steps, minutes, calories
    deadline = Column(DateTime(timezone=True))
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="fitness_goals")

class AIInsight(Base):
    __tablename__ = "ai_insights"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    insight_type = Column(String(100), nullable=False)  # finance, fitness, travel, marketplace
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(50), default="medium")  # high, medium, low
    confidence = Column(Float, default=0.0)
    category = Column(String(100))
    action_text = Column(String(255))
    action_type = Column(String(100))
    insight_metadata = Column(JSON)  # Store additional data
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="ai_insights")

class TravelPlan(Base):
    __tablename__ = "travel_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    destination = Column(String(255), nullable=False)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    budget = Column(Float)
    status = Column(String(50), default="planning")  # planning, booked, completed, cancelled
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class MarketplaceProduct(Base):
    __tablename__ = "marketplace_products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String(100))
    image_url = Column(String(500))
    stock_quantity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
