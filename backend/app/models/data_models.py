from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

# Fitness Models
class FitnessGoal(Base):
    __tablename__ = "fitness_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    type = Column(String(50))  # weight_loss, muscle_gain, endurance, etc.
    target_value = Column(Float)
    current_value = Column(Float, default=0)
    unit = Column(String(20))  # kg, lbs, km, etc.
    deadline = Column(DateTime)
    status = Column(String(20), default="active")  # active, completed, paused
    progress_percentage = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class FitnessWorkout(Base):
    __tablename__ = "fitness_workouts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    type = Column(String(50))  # cardio, strength, yoga, etc.
    duration = Column(Integer)  # minutes
    calories_burned = Column(Float)
    date = Column(DateTime, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FitnessMeasurement(Base):
    __tablename__ = "fitness_measurements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50))  # weight, body_fat, muscle_mass, etc.
    value = Column(Float, nullable=False)
    unit = Column(String(20))
    date = Column(DateTime, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Finance Models
class FinanceAccount(Base):
    __tablename__ = "finance_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    type = Column(String(50))  # checking, savings, credit, investment
    balance = Column(Float, default=0)
    currency = Column(String(10), default="USD")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class FinanceTransaction(Base):
    __tablename__ = "finance_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("finance_accounts.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(255))
    category = Column(String(100))
    type = Column(String(20))  # income, expense, transfer
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FinanceBudget(Base):
    __tablename__ = "finance_budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    spent = Column(Float, default=0)
    category = Column(String(100))
    period = Column(String(20))  # monthly, weekly, yearly
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class FinanceGoal(Base):
    __tablename__ = "finance_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0)
    currency = Column(String(10), default="USD")
    category = Column(String(100))
    priority = Column(String(20))  # low, medium, high
    deadline = Column(DateTime)
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
