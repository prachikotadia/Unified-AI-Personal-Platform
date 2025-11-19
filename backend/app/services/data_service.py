from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict, Any
import random

from app.models import data_models
from app.schemas import data_schemas

def get_user_fitness_data(db: Session, user_id: int) -> Dict[str, Any]:
    """Get user-specific fitness data"""
    # Get user's fitness goals
    goals = db.query(data_models.FitnessGoal).filter(
        data_models.FitnessGoal.user_id == user_id
    ).all()
    
    # Get recent workouts
    workouts = db.query(data_models.FitnessWorkout).filter(
        data_models.FitnessWorkout.user_id == user_id
    ).order_by(data_models.FitnessWorkout.date.desc()).limit(5).all()
    
    # Calculate today's summary
    today = datetime.now().date()
    today_workouts = [w for w in workouts if w.date.date() == today]
    
    today_summary = {
        "id": f"summary_{user_id}",
        "user_id": user_id,
        "date": today.isoformat(),
        "steps": random.randint(3000, 8000),
        "calories_burned": sum(w.calories_burned or 0 for w in today_workouts),
        "calories_consumed": random.randint(1500, 2000),
        "water_intake": random.randint(1500, 2500),
        "sleep_hours": random.uniform(6.0, 9.0),
        "workouts": len(today_workouts),
        "mood": random.choice(["excellent", "good", "moderate", "poor"]),
        "energy": random.choice(["high", "medium", "low"]),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    
    # Calculate weekly stats
    week_ago = today - timedelta(days=7)
    weekly_workouts = [w for w in workouts if w.date.date() >= week_ago]
    
    weekly_stats = {
        "steps": random.randint(40000, 60000),
        "calories_burned": sum(w.calories_burned or 0 for w in weekly_workouts),
        "workouts": len(weekly_workouts),
        "active_days": len(set(w.date.date() for w in weekly_workouts)),
    }
    
    return {
        "today_summary": today_summary,
        "weekly_stats": weekly_stats,
        "current_goals": [data_schemas.FitnessGoal.model_validate(goal) for goal in goals],
        "recent_achievements": [],
        "streaks": [],
        "insights": [],
        "recommendations": [],
    }

def get_guest_fitness_data() -> Dict[str, Any]:
    """Get demo fitness data for guest users"""
    return {
        "today_summary": {
            "id": "demo_summary",
            "user_id": "demo",
            "date": datetime.now().date().isoformat(),
            "steps": 8420,
            "calories_burned": 420,
            "calories_consumed": 1850,
            "water_intake": 2000,
            "sleep_hours": 7.5,
            "workouts": 1,
            "mood": "good",
            "energy": "medium",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        },
        "weekly_stats": {
            "steps": 58000,
            "calories_burned": 2800,
            "workouts": 5,
            "active_days": 6,
        },
        "current_goals": [
            {
                "id": 1,
                "user_id": "demo",
                "name": "Lose 5kg",
                "description": "Weight loss goal",
                "type": "weight_loss",
                "target_value": 65,
                "current_value": 70.5,
                "unit": "kg",
                "deadline": (datetime.now() + timedelta(days=30)).isoformat(),
                "status": "active",
                "progress_percentage": 70,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }
        ],
        "recent_achievements": [
            {
                "id": 1,
                "user_id": "demo",
                "name": "First Workout",
                "description": "Complete your first workout",
                "type": "workout",
                "icon": "🏃‍♂️",
                "unlocked": True,
                "unlocked_at": datetime.utcnow().isoformat(),
                "progress": 100,
                "target": 1,
                "created_at": datetime.utcnow().isoformat(),
            }
        ],
        "streaks": [
            {
                "id": 1,
                "user_id": "demo",
                "type": "workout",
                "current_streak": 7,
                "longest_streak": 15,
                "start_date": (datetime.now() - timedelta(days=7)).isoformat(),
                "last_activity": datetime.utcnow().isoformat(),
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }
        ],
        "insights": [
            {
                "id": 1,
                "user_id": "demo",
                "type": "performance",
                "title": "Improving Cardio Performance",
                "description": "Your cardio sessions are getting stronger. Consider increasing intensity.",
                "data": {"improvement": 15},
                "priority": "medium",
                "created_at": datetime.utcnow().isoformat(),
            }
        ],
        "recommendations": [
            {
                "id": 1,
                "user_id": "demo",
                "type": "workout",
                "title": "Try HIIT Training",
                "description": "High-intensity interval training can boost your metabolism",
                "action_items": ["Start with 20-minute sessions", "Include 30-second sprints", "Rest for 1 minute between intervals"],
                "priority": "high",
                "created_at": datetime.utcnow().isoformat(),
            }
        ],
    }

def get_user_finance_data(db: Session, user_id: int) -> Dict[str, Any]:
    """Get user-specific finance data"""
    # Get user's accounts
    accounts = db.query(data_models.FinanceAccount).filter(
        data_models.FinanceAccount.user_id == user_id,
        data_models.FinanceAccount.is_active == True
    ).all()
    
    # Get recent transactions
    transactions = db.query(data_models.FinanceTransaction).filter(
        data_models.FinanceTransaction.user_id == user_id
    ).order_by(data_models.FinanceTransaction.date.desc()).limit(10).all()
    
    # Get budgets
    budgets = db.query(data_models.FinanceBudget).filter(
        data_models.FinanceBudget.user_id == user_id,
        data_models.FinanceBudget.status == "active"
    ).all()
    
    # Get goals
    goals = db.query(data_models.FinanceGoal).filter(
        data_models.FinanceGoal.user_id == user_id,
        data_models.FinanceGoal.status == "active"
    ).all()
    
    # Calculate analytics
    total_balance = sum(account.balance for account in accounts)
    monthly_income = sum(t.amount for t in transactions if t.type == "income" and t.date >= datetime.now() - timedelta(days=30))
    monthly_expenses = abs(sum(t.amount for t in transactions if t.type == "expense" and t.date >= datetime.now() - timedelta(days=30)))
    
    analytics = {
        "total_balance": total_balance,
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "savings_rate": ((monthly_income - monthly_expenses) / monthly_income * 100) if monthly_income > 0 else 0,
        "net_worth": total_balance,
        "active_accounts": len(accounts),
        "active_budgets": len(budgets),
        "active_goals": len(goals),
        "active_debts": 0,
        "active_investments": 0,
    }
    
    return {
        "accounts": [data_schemas.FinanceAccount.model_validate(account) for account in accounts],
        "recent_transactions": [data_schemas.FinanceTransaction.model_validate(t) for t in transactions],
        "budgets": [data_schemas.FinanceBudget.model_validate(budget) for budget in budgets],
        "goals": [data_schemas.FinanceGoal.model_validate(goal) for goal in goals],
        "analytics": analytics,
    }

def get_guest_finance_data() -> Dict[str, Any]:
    """Get demo finance data for guest users"""
    return {
        "accounts": [
            {
                "id": 1,
                "user_id": "demo",
                "name": "Main Checking",
                "type": "checking",
                "balance": 2500.00,
                "currency": "USD",
                "is_active": True,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            },
            {
                "id": 2,
                "user_id": "demo",
                "name": "Savings",
                "type": "savings",
                "balance": 8500.00,
                "currency": "USD",
                "is_active": True,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }
        ],
        "recent_transactions": [
            {
                "id": 1,
                "user_id": "demo",
                "account_id": 1,
                "amount": -45.50,
                "description": "Grocery Store",
                "category": "Food & Dining",
                "type": "expense",
                "date": datetime.now().isoformat(),
                "created_at": datetime.utcnow().isoformat(),
            },
            {
                "id": 2,
                "user_id": "demo",
                "account_id": 1,
                "amount": 2500.00,
                "description": "Salary Deposit",
                "category": "Income",
                "type": "income",
                "date": datetime.now().isoformat(),
                "created_at": datetime.utcnow().isoformat(),
            }
        ],
        "budgets": [
            {
                "id": 1,
                "user_id": "demo",
                "name": "Monthly Budget",
                "amount": 3000,
                "spent": 1850,
                "category": "General",
                "period": "monthly",
                "status": "active",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }
        ],
        "goals": [
            {
                "id": 1,
                "user_id": "demo",
                "name": "Emergency Fund",
                "description": "Save 6 months of expenses",
                "target_amount": 10000,
                "current_amount": 8500,
                "currency": "USD",
                "category": "savings",
                "priority": "high",
                "deadline": (datetime.now() + timedelta(days=180)).isoformat(),
                "status": "active",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }
        ],
        "analytics": {
            "total_balance": 11000,
            "monthly_income": 2500,
            "monthly_expenses": 1850,
            "savings_rate": 26,
            "net_worth": 11000,
            "active_accounts": 2,
            "active_budgets": 1,
            "active_goals": 1,
            "active_debts": 0,
            "active_investments": 0,
        }
    }

def create_fitness_goal(db: Session, user_id: int, goal_data: data_schemas.FitnessGoalCreate) -> data_schemas.FitnessGoal:
    """Create a new fitness goal for authenticated user"""
    db_goal = data_models.FitnessGoal(
        user_id=user_id,
        **goal_data.dict()
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return data_schemas.FitnessGoal.model_validate(db_goal)

def get_user_fitness_goals(db: Session, user_id: int) -> List[data_schemas.FitnessGoal]:
    """Get user's fitness goals"""
    goals = db.query(data_models.FitnessGoal).filter(
        data_models.FitnessGoal.user_id == user_id
    ).all()
    return [data_schemas.FitnessGoal.model_validate(goal) for goal in goals]

def get_guest_fitness_goals() -> List[Dict[str, Any]]:
    """Get demo fitness goals for guest users"""
    return [
        {
            "id": 1,
            "user_id": "demo",
            "name": "Lose 5kg",
            "description": "Weight loss goal",
            "type": "weight_loss",
            "target_value": 65,
            "current_value": 70.5,
            "unit": "kg",
            "deadline": (datetime.now() + timedelta(days=30)).isoformat(),
            "status": "active",
            "progress_percentage": 70,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
    ]

def create_finance_account(db: Session, user_id: int, account_data: data_schemas.FinanceAccountCreate) -> data_schemas.FinanceAccount:
    """Create a new finance account for authenticated user"""
    db_account = data_models.FinanceAccount(
        user_id=user_id,
        **account_data.dict()
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return data_schemas.FinanceAccount.model_validate(db_account)

def get_user_finance_accounts(db: Session, user_id: int) -> List[data_schemas.FinanceAccount]:
    """Get user's finance accounts"""
    accounts = db.query(data_models.FinanceAccount).filter(
        data_models.FinanceAccount.user_id == user_id,
        data_models.FinanceAccount.is_active == True
    ).all()
    return [data_schemas.FinanceAccount.model_validate(account) for account in accounts]

def get_guest_finance_accounts() -> List[Dict[str, Any]]:
    """Get demo finance accounts for guest users"""
    return [
        {
            "id": 1,
            "user_id": "demo",
            "name": "Main Checking",
            "type": "checking",
            "balance": 2500.00,
            "currency": "USD",
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        },
        {
            "id": 2,
            "user_id": "demo",
            "name": "Savings",
            "type": "savings",
            "balance": 8500.00,
            "currency": "USD",
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
    ]
