from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime, date, timedelta
import structlog
import uuid
import json

from app.models.finance import (
    Transaction, BankAccount, CreditScore, FinancialOffer, Budget, FinancialGoal,
    MonthlySpending, SpendingAnalytics, RecurringTransaction, FinancialInsight,
    DebtTracker, Investment,
    TransactionType, ExpenseCategory, IncomeCategory, AccountType, TransactionStatus,
    OfferType, CreditScoreRange
)

logger = structlog.get_logger()
router = APIRouter()

# Mock user for now - in real app, this would come from authentication
def get_mock_user():
    return {"id": "user_123", "username": "testuser"}

# Request/Response models
class TransactionCreate(BaseModel):
    account_id: str
    type: TransactionType
    category: str
    subcategory: Optional[str] = None
    amount: float
    currency: str = "USD"
    description: str
    merchant: Optional[str] = None
    location: Optional[Dict[str, Any]] = None
    date: date
    tags: List[str] = []
    notes: Optional[str] = None
    recurring: bool = False

class BankAccountCreate(BaseModel):
    account_name: str
    account_type: AccountType
    account_number: Optional[str] = None
    routing_number: Optional[str] = None
    bank_name: str
    balance: float
    currency: str = "USD"
    credit_limit: Optional[float] = None
    interest_rate: Optional[float] = None
    is_primary: bool = False

class BudgetCreate(BaseModel):
    name: str
    category: str
    amount: float
    currency: str = "USD"
    period: str = "monthly"
    start_date: date
    end_date: Optional[date] = None
    alerts: Dict[str, Any] = {}

class FinancialGoalCreate(BaseModel):
    name: str
    description: Optional[str] = None
    target_amount: float
    currency: str = "USD"
    target_date: Optional[date] = None
    category: str
    priority: str = "medium"

class DebtTrackerCreate(BaseModel):
    name: str
    type: str
    original_amount: float
    current_balance: float
    interest_rate: float
    minimum_payment: float
    due_date: int

class InvestmentCreate(BaseModel):
    name: str
    type: str
    symbol: Optional[str] = None
    quantity: float
    purchase_price: float
    current_price: float
    account: str
    purchase_date: date

# Mock data storage
transactions = []
bank_accounts = []
credit_scores = []
financial_offers = []
budgets = []
financial_goals = []
monthly_spending = []
spending_analytics = []
recurring_transactions = []
financial_insights = []
debt_trackers = []
investments = []

# Transaction Management
@router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction_data: TransactionCreate):
    """Create a new transaction"""
    user = get_mock_user()
    
    transaction = Transaction(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        **transaction_data.dict()
    )
    
    transactions.append(transaction.dict())
    logger.info(f"Created transaction for user {user['id']}")
    
    return transaction

@router.get("/transactions", response_model=List[Transaction])
async def get_transactions(
    account_id: Optional[str] = None,
    type: Optional[TransactionType] = None,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """Get user's transactions"""
    user = get_mock_user()
    
    user_transactions = [t for t in transactions if t["user_id"] == user["id"]]
    
    if account_id:
        user_transactions = [t for t in user_transactions if t["account_id"] == account_id]
    
    if type:
        user_transactions = [t for t in user_transactions if t["type"] == type]
    
    if category:
        user_transactions = [t for t in user_transactions if t["category"] == category]
    
    if start_date:
        user_transactions = [t for t in user_transactions if t["date"] >= start_date]
    
    if end_date:
        user_transactions = [t for t in user_transactions if t["date"] <= end_date]
    
    user_transactions.sort(key=lambda x: x["date"], reverse=True)
    return user_transactions[offset:offset + limit]

@router.get("/transactions/{transaction_id}", response_model=Transaction)
async def get_transaction(transaction_id: str):
    """Get a specific transaction"""
    user = get_mock_user()
    
    for transaction in transactions:
        if transaction["id"] == transaction_id and transaction["user_id"] == user["id"]:
            return transaction
    
    raise HTTPException(status_code=404, detail="Transaction not found")

@router.put("/transactions/{transaction_id}")
async def update_transaction(transaction_id: str, transaction_data: Dict[str, Any]):
    """Update a transaction"""
    user = get_mock_user()
    
    for transaction in transactions:
        if transaction["id"] == transaction_id and transaction["user_id"] == user["id"]:
            transaction.update(transaction_data)
            transaction["updated_at"] = datetime.utcnow().isoformat()
            return {"message": "Transaction updated successfully"}
    
    raise HTTPException(status_code=404, detail="Transaction not found")

@router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str):
    """Delete a transaction"""
    user = get_mock_user()
    
    for i, transaction in enumerate(transactions):
        if transaction["id"] == transaction_id and transaction["user_id"] == user["id"]:
            del transactions[i]
            logger.info(f"Deleted transaction {transaction_id}")
            return {"message": "Transaction deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Transaction not found")

# Bank Account Management
@router.post("/accounts", response_model=BankAccount)
async def create_bank_account(account_data: BankAccountCreate):
    """Add a new bank account"""
    user = get_mock_user()
    
    bank_account = BankAccount(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        **account_data.dict()
    )
    
    bank_accounts.append(bank_account.dict())
    logger.info(f"Added bank account for user {user['id']}")
    
    return bank_account

@router.get("/accounts", response_model=List[BankAccount])
async def get_bank_accounts():
    """Get user's bank accounts"""
    user = get_mock_user()
    
    user_accounts = [acc for acc in bank_accounts if acc["user_id"] == user["id"]]
    return user_accounts

@router.get("/accounts/{account_id}", response_model=BankAccount)
async def get_bank_account(account_id: str):
    """Get a specific bank account"""
    user = get_mock_user()
    
    for account in bank_accounts:
        if account["id"] == account_id and account["user_id"] == user["id"]:
            return account
    
    raise HTTPException(status_code=404, detail="Bank account not found")

@router.put("/accounts/{account_id}")
async def update_bank_account(account_id: str, account_data: Dict[str, Any]):
    """Update a bank account"""
    user = get_mock_user()
    
    for account in bank_accounts:
        if account["id"] == account_id and account["user_id"] == user["id"]:
            account.update(account_data)
            account["updated_at"] = datetime.utcnow().isoformat()
            return {"message": "Bank account updated successfully"}
    
    raise HTTPException(status_code=404, detail="Bank account not found")

@router.delete("/accounts/{account_id}")
async def delete_bank_account(account_id: str):
    """Delete a bank account"""
    user = get_mock_user()
    
    for i, account in enumerate(bank_accounts):
        if account["id"] == account_id and account["user_id"] == user["id"]:
            del bank_accounts[i]
            logger.info(f"Deleted bank account {account_id}")
            return {"message": "Bank account deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Bank account not found")

# Credit Score
@router.get("/credit-score", response_model=CreditScore)
async def get_credit_score():
    """Get user's credit score"""
    user = get_mock_user()
    
    # Find existing credit score or create mock one
    for score in credit_scores:
        if score["user_id"] == user["id"]:
            return score
    
    # Create mock credit score
    mock_score = CreditScore(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        score=745,
        range=CreditScoreRange.very_good,
        provider="FICO",
        factors_impact={
            "payment_history": "positive",
            "credit_utilization": "positive",
            "credit_history_length": "neutral",
            "credit_mix": "positive",
            "new_credit": "negative"
        },
        trend="improving",
        next_update=datetime.utcnow() + timedelta(days=30)
    )
    
    credit_scores.append(mock_score.dict())
    return mock_score

@router.get("/credit-score/history")
async def get_credit_score_history():
    """Get credit score history"""
    user = get_mock_user()
    
    # Mock credit score history
    history = [
        {"date": "2024-01-01", "score": 720, "provider": "FICO"},
        {"date": "2024-02-01", "score": 725, "provider": "FICO"},
        {"date": "2024-03-01", "score": 730, "provider": "FICO"},
        {"date": "2024-04-01", "score": 735, "provider": "FICO"},
        {"date": "2024-05-01", "score": 740, "provider": "FICO"},
        {"date": "2024-06-01", "score": 745, "provider": "FICO"}
    ]
    
    return {"history": history, "trend": "improving"}

# Financial Offers
@router.get("/offers", response_model=List[FinancialOffer])
async def get_financial_offers():
    """Get personalized financial offers"""
    user = get_mock_user()
    
    # Mock offers based on user profile
    mock_offers = [
        {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "type": OfferType.credit_card,
            "title": "Chase Freedom Unlimited",
            "description": "Earn 1.5% cash back on all purchases with no annual fee",
            "provider": "Chase Bank",
            "terms": {"annual_fee": 0, "apr": "16.99%"},
            "benefits": ["1.5% cash back", "No annual fee", "Sign-up bonus"],
            "requirements": ["Good credit score", "Income verification"],
            "interest_rate": 16.99,
            "credit_limit": 10000,
            "annual_fee": 0,
            "cashback_rate": 1.5,
            "is_pre_approved": True,
            "approval_chance": 0.85,
            "expiration_date": date.today() + timedelta(days=30),
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "type": OfferType.loan,
            "title": "Personal Loan - Low APR",
            "description": "Consolidate debt with our low-interest personal loan",
            "provider": "Wells Fargo",
            "terms": {"loan_amount": "5000-50000", "term": "24-84 months"},
            "benefits": ["Low APR", "No prepayment penalty", "Fast approval"],
            "requirements": ["Good credit score", "Stable income"],
            "interest_rate": 7.99,
            "is_pre_approved": False,
            "approval_chance": 0.70,
            "expiration_date": date.today() + timedelta(days=60),
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "type": OfferType.investment,
            "title": "High-Yield Savings Account",
            "description": "Earn 4.5% APY on your savings with no minimum balance",
            "provider": "Ally Bank",
            "terms": {"apy": "4.5%", "minimum_balance": 0},
            "benefits": ["High APY", "No minimum balance", "FDIC insured"],
            "requirements": ["US resident", "Valid SSN"],
            "interest_rate": 4.5,
            "is_pre_approved": True,
            "approval_chance": 0.95,
            "expiration_date": date.today() + timedelta(days=90),
            "is_active": True
        }
    ]
    
    return mock_offers

# Budget Management
@router.post("/budgets", response_model=Budget)
async def create_budget(budget_data: BudgetCreate):
    """Create a new budget"""
    user = get_mock_user()
    
    budget = Budget(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        remaining=budget_data.amount,
        **budget_data.dict()
    )
    
    budgets.append(budget.dict())
    logger.info(f"Created budget for user {user['id']}")
    
    return budget

@router.get("/budgets", response_model=List[Budget])
async def get_budgets():
    """Get user's budgets"""
    user = get_mock_user()
    
    user_budgets = [b for b in budgets if b["user_id"] == user["id"]]
    return user_budgets

@router.put("/budgets/{budget_id}")
async def update_budget(budget_id: str, budget_data: Dict[str, Any]):
    """Update a budget"""
    user = get_mock_user()
    
    for budget in budgets:
        if budget["id"] == budget_id and budget["user_id"] == user["id"]:
            budget.update(budget_data)
            budget["updated_at"] = datetime.utcnow().isoformat()
            return {"message": "Budget updated successfully"}
    
    raise HTTPException(status_code=404, detail="Budget not found")

# Financial Goals
@router.post("/goals", response_model=FinancialGoal)
async def create_financial_goal(goal_data: FinancialGoalCreate):
    """Create a new financial goal"""
    user = get_mock_user()
    
    goal = FinancialGoal(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        **goal_data.dict()
    )
    
    financial_goals.append(goal.dict())
    logger.info(f"Created financial goal for user {user['id']}")
    
    return goal

@router.get("/goals", response_model=List[FinancialGoal])
async def get_financial_goals():
    """Get user's financial goals"""
    user = get_mock_user()
    
    user_goals = [g for g in financial_goals if g["user_id"] == user["id"]]
    return user_goals

@router.put("/goals/{goal_id}/progress")
async def update_goal_progress(goal_id: str, current_amount: float):
    """Update goal progress"""
    user = get_mock_user()
    
    for goal in financial_goals:
        if goal["id"] == goal_id and goal["user_id"] == user["id"]:
            goal["current_amount"] = current_amount
            goal["progress_percentage"] = (current_amount / goal["target_amount"]) * 100
            goal["updated_at"] = datetime.utcnow().isoformat()
            return {"message": "Goal progress updated"}
    
    raise HTTPException(status_code=404, detail="Financial goal not found")

# Monthly Spending Analytics
@router.get("/analytics/monthly/{year}/{month}")
async def get_monthly_spending(year: int, month: int):
    """Get monthly spending analytics"""
    user = get_mock_user()
    
    # Mock monthly spending data
    monthly_data = {
        "month": month,
        "year": year,
        "total_income": 8500.00,
        "total_expenses": 6200.00,
        "net_savings": 2300.00,
        "category_breakdown": {
            "housing": 1800.00,
            "food_dining": 800.00,
            "transportation": 400.00,
            "utilities": 300.00,
            "entertainment": 500.00,
            "shopping": 600.00,
            "healthcare": 200.00,
            "education": 0.00,
            "travel": 0.00,
            "insurance": 300.00,
            "taxes": 500.00,
            "debt_payment": 800.00,
            "savings": 0.00,
            "investment": 0.00,
            "other": 0.00
        },
        "top_expenses": [
            {"description": "Rent", "amount": 1500.00, "category": "housing"},
            {"description": "Car Payment", "amount": 400.00, "category": "debt_payment"},
            {"description": "Grocery Shopping", "amount": 300.00, "category": "food_dining"},
            {"description": "Electric Bill", "amount": 150.00, "category": "utilities"},
            {"description": "Netflix Subscription", "amount": 15.00, "category": "entertainment"}
        ],
        "spending_trend": "decreasing",
        "budget_violations": ["entertainment"],
        "daily_spending": {
            "1": 150.00, "2": 75.00, "3": 200.00, "4": 50.00, "5": 300.00,
            "6": 100.00, "7": 0.00, "8": 250.00, "9": 80.00, "10": 120.00,
            "11": 0.00, "12": 180.00, "13": 90.00, "14": 0.00, "15": 220.00,
            "16": 60.00, "17": 0.00, "18": 140.00, "19": 110.00, "20": 0.00,
            "21": 95.00, "22": 180.00, "23": 0.00, "24": 75.00, "25": 130.00,
            "26": 0.00, "27": 200.00, "28": 85.00, "29": 0.00, "30": 150.00
        }
    }
    
    return monthly_data

# Spending Analytics
@router.get("/analytics/spending")
async def get_spending_analytics(
    period: str = "monthly",
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Get comprehensive spending analytics"""
    user = get_mock_user()
    
    # Mock spending analytics
    analytics = {
        "period": period,
        "start_date": start_date or date.today().replace(day=1),
        "end_date": end_date or date.today(),
        "total_spending": 6200.00,
        "total_income": 8500.00,
        "net_flow": 2300.00,
        "category_spending": {
            "housing": {"amount": 1800.00, "percentage": 29.0},
            "food_dining": {"amount": 800.00, "percentage": 12.9},
            "transportation": {"amount": 400.00, "percentage": 6.5},
            "utilities": {"amount": 300.00, "percentage": 4.8},
            "entertainment": {"amount": 500.00, "percentage": 8.1},
            "shopping": {"amount": 600.00, "percentage": 9.7},
            "healthcare": {"amount": 200.00, "percentage": 3.2},
            "insurance": {"amount": 300.00, "percentage": 4.8},
            "taxes": {"amount": 500.00, "percentage": 8.1},
            "debt_payment": {"amount": 800.00, "percentage": 12.9}
        },
        "spending_by_day": {
            "Monday": 450.00,
            "Tuesday": 380.00,
            "Wednesday": 520.00,
            "Thursday": 410.00,
            "Friday": 680.00,
            "Saturday": 890.00,
            "Sunday": 320.00
        },
        "average_daily_spending": 207.00,
        "largest_expense": {
            "description": "Rent Payment",
            "amount": 1500.00,
            "date": "2024-06-01",
            "category": "housing"
        },
        "most_frequent_merchant": "Walmart",
        "spending_patterns": [
            "Highest spending on weekends",
            "Rent is your largest monthly expense",
            "Food spending is consistent throughout the month",
            "Entertainment spending increased this month"
        ],
        "insights": [
            "You're spending 29% of your income on housing",
            "Your food spending is below average for your income level",
            "Consider setting up automatic savings transfers",
            "Your debt payments are 12.9% of total spending"
        ]
    }
    
    return analytics

# Debt Tracker
@router.post("/debt", response_model=DebtTracker)
async def create_debt_tracker(debt_data: DebtTrackerCreate):
    """Create a new debt tracker"""
    user = get_mock_user()
    
    debt = DebtTracker(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        **debt_data.dict()
    )
    
    debt_trackers.append(debt.dict())
    logger.info(f"Created debt tracker for user {user['id']}")
    
    return debt

@router.get("/debt", response_model=List[DebtTracker])
async def get_debt_trackers():
    """Get user's debt trackers"""
    user = get_mock_user()
    
    user_debts = [d for d in debt_trackers if d["user_id"] == user["id"]]
    return user_debts

# Investment Tracking
@router.post("/investments", response_model=Investment)
async def create_investment(investment_data: InvestmentCreate):
    """Create a new investment"""
    user = get_mock_user()
    
    total_value = investment_data.quantity * investment_data.current_price
    gain_loss = total_value - (investment_data.quantity * investment_data.purchase_price)
    gain_loss_percentage = (gain_loss / (investment_data.quantity * investment_data.purchase_price)) * 100
    
    investment = Investment(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        total_value=total_value,
        gain_loss=gain_loss,
        gain_loss_percentage=gain_loss_percentage,
        **investment_data.dict()
    )
    
    investments.append(investment.dict())
    logger.info(f"Created investment for user {user['id']}")
    
    return investment

@router.get("/investments", response_model=List[Investment])
async def get_investments():
    """Get user's investments"""
    user = get_mock_user()
    
    user_investments = [i for i in investments if i["user_id"] == user["id"]]
    return user_investments

# Financial Dashboard
@router.get("/dashboard")
async def get_finance_dashboard():
    """Get comprehensive finance dashboard"""
    user = get_mock_user()
    
    # Calculate totals
    total_balance = sum(acc["balance"] for acc in bank_accounts if acc["user_id"] == user["id"])
    total_credit_limit = sum(acc.get("credit_limit", 0) for acc in bank_accounts if acc["user_id"] == user["id"])
    total_available_credit = sum(acc.get("available_credit", 0) for acc in bank_accounts if acc["user_id"] == user["id"])
    
    # Get recent transactions
    recent_transactions = [t for t in transactions if t["user_id"] == user["id"]][:5]
    
    # Get active budgets
    active_budgets = [b for b in budgets if b["user_id"] == user["id"] and b["is_active"]]
    
    # Get active goals
    active_goals = [g for g in financial_goals if g["user_id"] == user["id"] and g["is_active"]]
    
    # Get active debts
    active_debts = [d for d in debt_trackers if d["user_id"] == user["id"] and d["is_active"]]
    
    # Get investments
    user_investments = [i for i in investments if i["user_id"] == user["id"]]
    total_investment_value = sum(i["total_value"] for i in user_investments)
    total_investment_gain_loss = sum(i["gain_loss"] for i in user_investments)
    
    return {
        "accounts_summary": {
            "total_balance": total_balance,
            "total_credit_limit": total_credit_limit,
            "total_available_credit": total_available_credit,
            "account_count": len([acc for acc in bank_accounts if acc["user_id"] == user["id"]])
        },
        "recent_transactions": recent_transactions,
        "active_budgets": active_budgets,
        "active_goals": active_goals,
        "active_debts": active_debts,
        "investments_summary": {
            "total_value": total_investment_value,
            "total_gain_loss": total_investment_gain_loss,
            "investment_count": len(user_investments)
        },
        "monthly_summary": {
            "income": 8500.00,
            "expenses": 6200.00,
            "savings": 2300.00,
            "savings_rate": 27.1
        },
        "quick_actions": [
            "Add Transaction",
            "Create Budget",
            "Set Financial Goal",
            "Track Debt",
            "Add Investment"
        ]
    }

# Expense Categories
@router.get("/categories/expenses")
async def get_expense_categories():
    """Get expense categories with icons and colors"""
    return [
        {"value": "food_dining", "label": "Food & Dining", "icon": "utensils", "color": "#FF6B6B"},
        {"value": "transportation", "label": "Transportation", "icon": "car", "color": "#4ECDC4"},
        {"value": "housing", "label": "Housing", "icon": "home", "color": "#45B7D1"},
        {"value": "utilities", "label": "Utilities", "icon": "zap", "color": "#96CEB4"},
        {"value": "entertainment", "label": "Entertainment", "icon": "film", "color": "#FFEAA7"},
        {"value": "shopping", "label": "Shopping", "icon": "shopping-bag", "color": "#DDA0DD"},
        {"value": "healthcare", "label": "Healthcare", "icon": "heart", "color": "#98D8C8"},
        {"value": "education", "label": "Education", "icon": "book-open", "color": "#F7DC6F"},
        {"value": "travel", "label": "Travel", "icon": "plane", "color": "#BB8FCE"},
        {"value": "insurance", "label": "Insurance", "icon": "shield", "color": "#85C1E9"},
        {"value": "taxes", "label": "Taxes", "icon": "coins", "color": "#F8C471"},
        {"value": "debt_payment", "label": "Debt Payment", "icon": "credit-card", "color": "#EC7063"},
        {"value": "savings", "label": "Savings", "icon": "gem", "color": "#52C3D2"},
        {"value": "investment", "label": "Investment", "icon": "trending-up", "color": "#58D68D"},
        {"value": "other", "label": "Other", "icon": "package", "color": "#BDC3C7"}
    ]

@router.get("/categories/income")
async def get_income_categories():
    """Get income categories with icons and colors"""
    return [
        {"value": "salary", "label": "Salary", "icon": "briefcase", "color": "#2ECC71"},
        {"value": "freelance", "label": "Freelance", "icon": "monitor", "color": "#3498DB"},
        {"value": "business", "label": "Business", "icon": "building", "color": "#9B59B6"},
        {"value": "investment", "label": "Investment", "icon": "trending-up", "color": "#F1C40F"},
        {"value": "rental", "label": "Rental", "icon": "home", "color": "#E67E22"},
        {"value": "interest", "label": "Interest", "icon": "banknote", "color": "#1ABC9C"},
        {"value": "dividend", "label": "Dividend", "icon": "bar-chart-3", "color": "#34495E"},
        {"value": "gift", "label": "Gift", "icon": "gift", "color": "#E74C3C"},
        {"value": "refund", "label": "Refund", "icon": "receipt", "color": "#95A5A6"},
        {"value": "other", "label": "Other", "icon": "package", "color": "#BDC3C7"}
    ]
