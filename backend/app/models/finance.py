from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum
import uuid

class TransactionType(str, Enum):
    income = "income"
    expense = "expense"
    transfer = "transfer"
    investment = "investment"
    loan = "loan"
    refund = "refund"

class ExpenseCategory(str, Enum):
    food_dining = "food_dining"
    transportation = "transportation"
    housing = "housing"
    utilities = "utilities"
    entertainment = "entertainment"
    shopping = "shopping"
    healthcare = "healthcare"
    education = "education"
    travel = "travel"
    insurance = "insurance"
    taxes = "taxes"
    debt_payment = "debt_payment"
    savings = "savings"
    investment = "investment"
    other = "other"

class IncomeCategory(str, Enum):
    salary = "salary"
    freelance = "freelance"
    business = "business"
    investment = "investment"
    rental = "rental"
    interest = "interest"
    dividend = "dividend"
    gift = "gift"
    refund = "refund"
    other = "other"

class AccountType(str, Enum):
    checking = "checking"
    savings = "savings"
    credit_card = "credit_card"
    investment = "investment"
    loan = "loan"
    mortgage = "mortgage"
    business = "business"

class TransactionStatus(str, Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"

class OfferType(str, Enum):
    credit_card = "credit_card"
    loan = "loan"
    investment = "investment"
    insurance = "insurance"
    savings = "savings"

class CreditScoreRange(str, Enum):
    excellent = "excellent"  # 800-850
    very_good = "very_good"  # 740-799
    good = "good"  # 670-739
    fair = "fair"  # 580-669
    poor = "poor"  # 300-579

class Transaction(BaseModel):
    id: Optional[str] = None
    user_id: str
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
    status: TransactionStatus = TransactionStatus.completed
    tags: List[str] = []
    receipt_url: Optional[str] = None
    notes: Optional[str] = None
    recurring: bool = False
    recurring_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BankAccount(BaseModel):
    id: Optional[str] = None
    user_id: str
    account_name: str
    account_type: AccountType
    account_number: Optional[str] = None
    routing_number: Optional[str] = None
    bank_name: str
    balance: float
    currency: str = "USD"
    credit_limit: Optional[float] = None
    available_credit: Optional[float] = None
    interest_rate: Optional[float] = None
    last_sync: Optional[datetime] = None
    is_active: bool = True
    is_primary: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CreditScore(BaseModel):
    id: Optional[str] = None
    user_id: str
    score: int = Field(..., ge=300, le=850)
    range: CreditScoreRange
    provider: str  # FICO, VantageScore, etc.
    factors: Dict[str, Any] = {
        "payment_history": 0.35,
        "credit_utilization": 0.30,
        "credit_history_length": 0.15,
        "credit_mix": 0.10,
        "new_credit": 0.10
    }
    factors_impact: Dict[str, str] = {}  # positive, negative, neutral
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    trend: str = "stable"  # improving, declining, stable
    next_update: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FinancialOffer(BaseModel):
    id: Optional[str] = None
    user_id: str
    type: OfferType
    title: str
    description: str
    provider: str
    terms: Dict[str, Any] = {}
    benefits: List[str] = []
    requirements: List[str] = []
    interest_rate: Optional[float] = None
    credit_limit: Optional[float] = None
    annual_fee: Optional[float] = None
    cashback_rate: Optional[float] = None
    rewards_points: Optional[int] = None
    is_pre_approved: bool = False
    approval_chance: float = Field(..., ge=0, le=1)
    expiration_date: Optional[date] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Budget(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    category: str
    amount: float
    currency: str = "USD"
    period: str = "monthly"  # weekly, monthly, yearly
    start_date: date
    end_date: Optional[date] = None
    spent: float = 0
    remaining: float = 0
    is_active: bool = True
    alerts: Dict[str, Any] = {
        "warning_threshold": 0.8,  # 80% of budget
        "critical_threshold": 0.95  # 95% of budget
    }
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FinancialGoal(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    description: Optional[str] = None
    target_amount: float
    current_amount: float = 0
    currency: str = "USD"
    target_date: Optional[date] = None
    category: str  # emergency_fund, vacation, house, car, etc.
    priority: str = "medium"  # low, medium, high
    is_active: bool = True
    progress_percentage: float = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MonthlySpending(BaseModel):
    id: Optional[str] = None
    user_id: str
    month: int
    year: int
    total_income: float = 0
    total_expenses: float = 0
    net_savings: float = 0
    category_breakdown: Dict[str, float] = {}
    top_expenses: List[Dict[str, Any]] = []
    spending_trend: str = "stable"  # increasing, decreasing, stable
    budget_violations: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SpendingAnalytics(BaseModel):
    id: Optional[str] = None
    user_id: str
    period: str  # daily, weekly, monthly, yearly
    start_date: date
    end_date: date
    total_spending: float
    total_income: float
    net_flow: float
    category_spending: Dict[str, float] = {}
    spending_by_day: Dict[str, float] = {}
    average_daily_spending: float
    largest_expense: Optional[Dict[str, Any]] = None
    most_frequent_merchant: Optional[str] = None
    spending_patterns: List[str] = []
    insights: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RecurringTransaction(BaseModel):
    id: Optional[str] = None
    user_id: str
    account_id: str
    type: TransactionType
    category: str
    amount: float
    currency: str = "USD"
    description: str
    frequency: str  # daily, weekly, monthly, yearly
    start_date: date
    end_date: Optional[date] = None
    next_due_date: date
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FinancialInsight(BaseModel):
    id: Optional[str] = None
    user_id: str
    type: str  # spending_pattern, saving_opportunity, budget_alert, etc.
    title: str
    description: str
    severity: str = "info"  # info, warning, critical
    actionable: bool = True
    action_items: List[str] = []
    data: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DebtTracker(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    type: str  # credit_card, loan, mortgage, etc.
    original_amount: float
    current_balance: float
    interest_rate: float
    minimum_payment: float
    due_date: int  # day of month
    payment_history: List[Dict[str, Any]] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Investment(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    type: str  # stocks, bonds, etf, mutual_fund, crypto, etc.
    symbol: Optional[str] = None
    quantity: float
    purchase_price: float
    current_price: float
    total_value: float
    gain_loss: float
    gain_loss_percentage: float
    account: str
    purchase_date: date
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
