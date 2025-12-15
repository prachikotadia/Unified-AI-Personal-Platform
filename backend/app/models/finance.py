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
    subcategory: Optional[str] = None
    amount: float
    currency: str = "USD"
    description: str
    merchant: Optional[str] = None
    frequency: str  # daily, weekly, monthly, yearly, custom
    start_date: date
    end_date: Optional[date] = None
    next_due_date: date
    last_occurrence: Optional[date] = None
    occurrence_count: int = 0
    total_occurrences: Optional[int] = None  # None for infinite
    day_of_month: Optional[int] = None  # For monthly on specific day
    day_of_week: Optional[int] = None  # 0-6 for weekly
    auto_create: bool = True  # Automatically create transactions
    notification_days_before: int = 0  # Days before to send notification
    tags: List[str] = []
    notes: Optional[str] = None
    is_active: bool = True
    # Enhanced fields
    skip_holidays: bool = False  # Skip on holidays
    skip_weekends: bool = False  # Skip on weekends
    amount_variation: Optional[float] = None  # Allow amount to vary
    category_auto_update: bool = False  # Auto-update category based on merchant
    linked_budget_id: Optional[str] = None  # Link to budget
    reminder_sent: bool = False  # Track if reminder was sent
    last_reminder_date: Optional[date] = None
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

# Missing Models

class Receipt(BaseModel):
    id: Optional[str] = None
    transaction_id: str
    user_id: str
    receipt_data: str  # Base64 encoded image or file path
    receipt_type: str = "image/jpeg"  # MIME type
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    ocr_text: Optional[str] = None  # Extracted text from OCR
    ocr_data: Optional[Dict[str, Any]] = None  # Structured OCR data
    merchant_name: Optional[str] = None
    total_amount: Optional[float] = None
    receipt_date: Optional[date] = None
    items: List[Dict[str, Any]] = []  # Extracted line items
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None

class FinancialReport(BaseModel):
    id: Optional[str] = None
    user_id: str
    report_type: str  # summary, detailed, budget, custom
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    format: str = "pdf"  # pdf, csv, excel, json
    include_charts: bool = True
    status: str = "pending"  # pending, processing, completed, failed
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    data: Dict[str, Any] = {}  # Report data
    generated_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BankConnection(BaseModel):
    id: Optional[str] = None
    user_id: str
    bank_name: str
    account_type: str
    provider: str = "plaid"  # plaid, yodlee, manual, etc.
    connection_status: str = "connected"  # connected, disconnected, error, pending
    oauth_token: Optional[str] = None  # Encrypted OAuth token
    access_token: Optional[str] = None  # Encrypted access token
    item_id: Optional[str] = None  # Provider item ID
    institution_id: Optional[str] = None
    accounts: List[str] = []  # List of connected account IDs
    last_sync: Optional[datetime] = None
    next_sync: Optional[datetime] = None
    sync_frequency: str = "6 hours"  # 1 hour, 6 hours, daily, etc.
    error_message: Optional[str] = None
    error_code: Optional[str] = None
    # Enhanced fields
    sync_enabled: bool = True  # Enable/disable automatic syncing
    sync_history: List[Dict[str, Any]] = []  # History of sync operations
    last_successful_sync: Optional[datetime] = None
    sync_count: int = 0  # Total number of successful syncs
    failed_sync_count: int = 0  # Total number of failed syncs
    requires_reauth: bool = False  # Whether re-authentication is needed
    consent_expires_at: Optional[datetime] = None  # OAuth consent expiration
    metadata: Dict[str, Any] = {}  # Additional provider-specific metadata
    connected_at: datetime = Field(default_factory=datetime.utcnow)
    disconnected_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class LiveTransaction(BaseModel):
    id: Optional[str] = None
    user_id: str
    connection_id: str
    account_id: str
    transaction_id: Optional[str] = None  # Link to main transaction if matched
    provider_transaction_id: str  # Transaction ID from bank provider
    type: TransactionType
    amount: float
    currency: str = "USD"
    description: str
    merchant: Optional[str] = None
    category: Optional[str] = None
    date: date
    pending: bool = True
    location: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = {}
    is_duplicate: bool = False
    matched_transaction_id: Optional[str] = None
    synced_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class InvestmentTransaction(BaseModel):
    id: Optional[str] = None
    investment_id: str
    user_id: str
    type: str  # buy, sell, dividend, split, reinvestment, fee
    quantity: float
    price: float
    fees: float = 0.0
    total_amount: float
    currency: str = "USD"
    date: date
    notes: Optional[str] = None
    broker: Optional[str] = None
    transaction_reference: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DebtPayment(BaseModel):
    id: Optional[str] = None
    debt_id: str
    user_id: str
    amount: float
    payment_date: date
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None  # Link to transaction record
    principal_paid: float
    interest_paid: float
    fees: float = 0.0
    notes: Optional[str] = None
    is_extra_payment: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GoalProgress(BaseModel):
    id: Optional[str] = None
    goal_id: str
    user_id: str
    amount: float
    date: date
    source: Optional[str] = None  # manual, transaction, automatic
    transaction_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FinancialNotification(BaseModel):
    id: Optional[str] = None
    user_id: str
    type: str  # budget_alert, goal_milestone, bill_reminder, low_balance, etc.
    title: str
    message: str
    severity: str = "info"  # info, warning, critical
    category: Optional[str] = None
    related_id: Optional[str] = None  # ID of related entity (budget, goal, etc.)
    action_url: Optional[str] = None
    read: bool = False
    read_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ExportJob(BaseModel):
    id: Optional[str] = None
    user_id: str
    data_type: str  # transactions, budgets, goals, all
    format: str  # csv, json, excel, pdf
    status: str = "pending"  # pending, processing, completed, failed
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    filters: Dict[str, Any] = {}
    error_message: Optional[str] = None
    progress: float = 0.0  # 0-100
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Enhanced RecurringTransaction model
# Note: RecurringTransaction already exists above, but we can enhance it
# The existing model is at line 222-237, we'll keep it as is but note enhancements needed
