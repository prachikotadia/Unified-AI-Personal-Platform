from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from app.database_postgres import get_db
from app.services.database_service import DatabaseService
from app.models_postgres import (
    User, FinanceAccount, FinanceTransaction, FitnessGoal,
    AIInsight, TravelPlan, MarketplaceProduct, UserSession
)

router = APIRouter(prefix="/admin", tags=["Database Admin"])

# ==================================================
# USERS MANAGEMENT
# ==================================================

@router.post("/users")
async def create_user(user_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new user"""
    try:
        db_service = DatabaseService(db)
        user = db_service.create_user(user_data)
        return {
            "success": True,
            "message": f"User {user.email} created successfully",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "full_name": user.full_name,
                "status": user.status
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/users")
async def get_all_users(db: Session = Depends(get_db)):
    """Get all users"""
    try:
        users = db.query(User).all()
        return {
            "success": True,
            "users": [
                {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "full_name": user.full_name,
                    "status": user.status,
                    "created_at": user.created_at.isoformat() if user.created_at else None
                }
                for user in users
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{user_id}")
async def update_user(user_id: int, update_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Update a user"""
    try:
        db_service = DatabaseService(db)
        user = db_service.update_user(user_id, update_data)
        if user:
            return {
                "success": True,
                "message": f"User {user.email} updated successfully",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "full_name": user.full_name,
                    "status": user.status
                }
            }
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete a user"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            db.delete(user)
            db.commit()
            return {
                "success": True,
                "message": f"User {user.email} deleted successfully"
            }
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==================================================
# FINANCE ACCOUNTS MANAGEMENT
# ==================================================

@router.post("/finance-accounts")
async def create_finance_account(account_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new finance account"""
    try:
        db_service = DatabaseService(db)
        account = db_service.create_finance_account(account_data)
        return {
            "success": True,
            "message": f"Account {account.name} created successfully",
            "account": {
                "id": account.id,
                "user_id": account.user_id,
                "name": account.name,
                "account_type": account.account_type,
                "balance": account.balance,
                "currency": account.currency
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/finance-accounts")
async def get_all_finance_accounts(db: Session = Depends(get_db)):
    """Get all finance accounts"""
    try:
        accounts = db.query(FinanceAccount).all()
        return {
            "success": True,
            "accounts": [
                {
                    "id": account.id,
                    "user_id": account.user_id,
                    "name": account.name,
                    "account_type": account.account_type,
                    "balance": account.balance,
                    "currency": account.currency,
                    "is_active": account.is_active
                }
                for account in accounts
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/finance-accounts/{account_id}")
async def update_finance_account(account_id: int, update_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Update a finance account"""
    try:
        account = db.query(FinanceAccount).filter(FinanceAccount.id == account_id).first()
        if account:
            for key, value in update_data.items():
                setattr(account, key, value)
            account.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(account)
            return {
                "success": True,
                "message": f"Account {account.name} updated successfully",
                "account": {
                    "id": account.id,
                    "name": account.name,
                    "balance": account.balance,
                    "currency": account.currency
                }
            }
        else:
            raise HTTPException(status_code=404, detail="Account not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==================================================
# FITNESS GOALS MANAGEMENT
# ==================================================

@router.post("/fitness-goals")
async def create_fitness_goal(goal_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new fitness goal"""
    try:
        db_service = DatabaseService(db)
        goal = db_service.create_fitness_goal(goal_data)
        return {
            "success": True,
            "message": f"Goal {goal.title} created successfully",
            "goal": {
                "id": goal.id,
                "user_id": goal.user_id,
                "title": goal.title,
                "goal_type": goal.goal_type,
                "target_value": goal.target_value,
                "current_value": goal.current_value,
                "unit": goal.unit
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/fitness-goals")
async def get_all_fitness_goals(db: Session = Depends(get_db)):
    """Get all fitness goals"""
    try:
        goals = db.query(FitnessGoal).all()
        return {
            "success": True,
            "goals": [
                {
                    "id": goal.id,
                    "user_id": goal.user_id,
                    "title": goal.title,
                    "goal_type": goal.goal_type,
                    "target_value": goal.target_value,
                    "current_value": goal.current_value,
                    "unit": goal.unit,
                    "is_completed": goal.is_completed
                }
                for goal in goals
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/fitness-goals/{goal_id}/progress")
async def update_fitness_goal_progress(goal_id: int, current_value: float, db: Session = Depends(get_db)):
    """Update fitness goal progress"""
    try:
        db_service = DatabaseService(db)
        goal = db_service.update_fitness_goal_progress(goal_id, current_value)
        if goal:
            return {
                "success": True,
                "message": f"Goal {goal.title} progress updated",
                "goal": {
                    "id": goal.id,
                    "title": goal.title,
                    "current_value": goal.current_value,
                    "target_value": goal.target_value,
                    "unit": goal.unit,
                    "is_completed": goal.is_completed
                }
            }
        else:
            raise HTTPException(status_code=404, detail="Goal not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==================================================
# MARKETPLACE PRODUCTS MANAGEMENT
# ==================================================

@router.post("/marketplace-products")
async def create_marketplace_product(product_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new marketplace product"""
    try:
        db_service = DatabaseService(db)
        product = db_service.create_marketplace_product(product_data)
        return {
            "success": True,
            "message": f"Product {product.name} created successfully",
            "product": {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": product.price,
                "category": product.category,
                "stock_quantity": product.stock_quantity
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/marketplace-products")
async def get_all_marketplace_products(db: Session = Depends(get_db)):
    """Get all marketplace products"""
    try:
        products = db.query(MarketplaceProduct).all()
        return {
            "success": True,
            "products": [
                {
                    "id": product.id,
                    "name": product.name,
                    "description": product.description,
                    "price": product.price,
                    "category": product.category,
                    "stock_quantity": product.stock_quantity,
                    "is_active": product.is_active
                }
                for product in products
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/marketplace-products/{product_id}")
async def update_marketplace_product(product_id: int, update_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Update a marketplace product"""
    try:
        product = db.query(MarketplaceProduct).filter(MarketplaceProduct.id == product_id).first()
        if product:
            for key, value in update_data.items():
                setattr(product, key, value)
            product.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(product)
            return {
                "success": True,
                "message": f"Product {product.name} updated successfully",
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "stock_quantity": product.stock_quantity
                }
            }
        else:
            raise HTTPException(status_code=404, detail="Product not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==================================================
# AI INSIGHTS MANAGEMENT
# ==================================================

@router.post("/ai-insights")
async def create_ai_insight(insight_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new AI insight"""
    try:
        db_service = DatabaseService(db)
        insight = db_service.create_ai_insight(insight_data)
        return {
            "success": True,
            "message": f"AI Insight '{insight.title}' created successfully",
            "insight": {
                "id": insight.id,
                "user_id": insight.user_id,
                "insight_type": insight.insight_type,
                "title": insight.title,
                "description": insight.description,
                "priority": insight.priority,
                "confidence": insight.confidence,
                "category": insight.category
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/ai-insights")
async def get_all_ai_insights(db: Session = Depends(get_db)):
    """Get all AI insights"""
    try:
        insights = db.query(AIInsight).all()
        return {
            "success": True,
            "insights": [
                {
                    "id": insight.id,
                    "user_id": insight.user_id,
                    "insight_type": insight.insight_type,
                    "title": insight.title,
                    "description": insight.description,
                    "priority": insight.priority,
                    "confidence": insight.confidence,
                    "category": insight.category,
                    "is_read": insight.is_read,
                    "created_at": insight.created_at.isoformat() if insight.created_at else None
                }
                for insight in insights
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================================================
# TRAVEL PLANS MANAGEMENT
# ==================================================

@router.post("/travel-plans")
async def create_travel_plan(plan_data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new travel plan"""
    try:
        db_service = DatabaseService(db)
        plan = db_service.create_travel_plan(plan_data)
        return {
            "success": True,
            "message": f"Travel plan to {plan.destination} created successfully",
            "plan": {
                "id": plan.id,
                "user_id": plan.user_id,
                "destination": plan.destination,
                "start_date": plan.start_date.isoformat() if plan.start_date else None,
                "end_date": plan.end_date.isoformat() if plan.end_date else None,
                "budget": plan.budget,
                "status": plan.status
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/travel-plans")
async def get_all_travel_plans(db: Session = Depends(get_db)):
    """Get all travel plans"""
    try:
        plans = db.query(TravelPlan).all()
        return {
            "success": True,
            "plans": [
                {
                    "id": plan.id,
                    "user_id": plan.user_id,
                    "destination": plan.destination,
                    "start_date": plan.start_date.isoformat() if plan.start_date else None,
                    "end_date": plan.end_date.isoformat() if plan.end_date else None,
                    "budget": plan.budget,
                    "status": plan.status
                }
                for plan in plans
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================================================
# DATABASE OVERVIEW
# ==================================================

@router.get("/overview")
async def get_database_overview(db: Session = Depends(get_db)):
    """Get database overview with counts"""
    try:
        users_count = db.query(User).count()
        accounts_count = db.query(FinanceAccount).count()
        goals_count = db.query(FitnessGoal).count()
        products_count = db.query(MarketplaceProduct).count()
        insights_count = db.query(AIInsight).count()
        plans_count = db.query(TravelPlan).count()
        
        return {
            "success": True,
            "overview": {
                "users": users_count,
                "finance_accounts": accounts_count,
                "fitness_goals": goals_count,
                "marketplace_products": products_count,
                "ai_insights": insights_count,
                "travel_plans": plans_count
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
