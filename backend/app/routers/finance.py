from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime, date, timedelta
import structlog
import uuid
import json
import csv
import io
import base64
import os
import asyncio
from pathlib import Path

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
receipts = {}  # Store receipts by transaction ID
bank_connections = []  # Store bank OAuth connections
notifications = []  # Store finance notifications
reports = []  # Store generated reports

# Additional request models
class BulkTransactionCreate(BaseModel):
    transactions: List[TransactionCreate]

class ReceiptUpload(BaseModel):
    transaction_id: str
    receipt_data: str  # Base64 encoded image
    receipt_type: str = "image/jpeg"

class BankConnectionCreate(BaseModel):
    bank_name: str
    account_type: str
    oauth_token: Optional[str] = None

class InvestmentTransactionCreate(BaseModel):
    investment_id: str
    type: str  # 'buy', 'sell', 'dividend', 'split'
    quantity: float
    price: float
    date: date
    fees: Optional[float] = 0.0
    notes: Optional[str] = None

class DebtPaymentCreate(BaseModel):
    debt_id: str
    amount: float
    payment_date: date
    notes: Optional[str] = None

class GoalProgressUpdate(BaseModel):
    current_amount: float
    notes: Optional[str] = None

class RecurringTransactionCreate(BaseModel):
    account_id: str
    type: TransactionType
    category: str
    amount: float
    description: str
    frequency: str  # 'daily', 'weekly', 'monthly', 'yearly'
    start_date: date
    end_date: Optional[date] = None
    next_occurrence: date

class ReportGenerateRequest(BaseModel):
    report_type: str
    start_date: date
    end_date: date
    include_charts: bool = True
    format: str = "pdf"  # 'pdf', 'csv', 'excel', 'json'

class ExportRequest(BaseModel):
    data_type: str  # 'transactions', 'budgets', 'goals', 'all'
    format: str = "csv"  # 'csv', 'json', 'excel'
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ShareRequest(BaseModel):
    share_type: str  # 'dashboard', 'budget', 'report'
    resource_id: Optional[str] = None
    recipients: List[str]  # List of email addresses
    message: Optional[str] = None
    expires_in_days: Optional[int] = 30

class AICategorizeRequest(BaseModel):
    transaction_ids: List[str]

class AICategorizeResponse(BaseModel):
    transaction_id: str
    suggested_category: str
    confidence: float
    reasoning: str

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
            # Also delete associated receipt if exists
            if transaction_id in receipts:
                del receipts[transaction_id]
            logger.info(f"Deleted transaction {transaction_id}")
            return {"message": "Transaction deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Transaction not found")

# Bulk Transaction Operations
@router.post("/transactions/bulk", response_model=Dict[str, Any])
async def bulk_create_transactions(bulk_data: BulkTransactionCreate):
    """Bulk import transactions"""
    user = get_mock_user()
    
    created = []
    failed = []
    
    for transaction_data in bulk_data.transactions:
        try:
            transaction = Transaction(
                id=str(uuid.uuid4()),
                user_id=user["id"],
                **transaction_data.dict()
            )
            transactions.append(transaction.dict())
            created.append(transaction.id)
        except Exception as e:
            failed.append({"data": transaction_data.dict(), "error": str(e)})
    
    logger.info(f"Bulk imported {len(created)} transactions for user {user['id']}")
    
    return {
        "created": len(created),
        "failed": len(failed),
        "created_ids": created,
        "failed_items": failed
    }

@router.post("/transactions/import")
async def import_transactions_from_file(
    file: UploadFile = File(...),
    format: str = Form("csv")
):
    """Import transactions from file (CSV, JSON, Excel)"""
    user = get_mock_user()
    
    try:
        contents = await file.read()
        
        if format == "csv":
            # Parse CSV
            csv_content = contents.decode('utf-8')
            csv_reader = csv.DictReader(io.StringIO(csv_content))
            imported = []
            
            for row in csv_reader:
                try:
                    transaction = Transaction(
                        id=str(uuid.uuid4()),
                        user_id=user["id"],
                        account_id=row.get("account_id", ""),
                        type=TransactionType(row.get("type", "expense")),
                        category=row.get("category", "other"),
                        amount=float(row.get("amount", 0)),
                        description=row.get("description", ""),
                        date=datetime.strptime(row.get("date", date.today().isoformat()), "%Y-%m-%d").date()
                    )
                    transactions.append(transaction.dict())
                    imported.append(transaction.id)
                except Exception as e:
                    logger.error(f"Failed to import row: {e}")
            
            return {"imported": len(imported), "transaction_ids": imported}
        
        elif format == "json":
            # Parse JSON
            json_data = json.loads(contents.decode('utf-8'))
            imported = []
            
            for item in json_data if isinstance(json_data, list) else [json_data]:
                try:
                    transaction = Transaction(
                        id=str(uuid.uuid4()),
                        user_id=user["id"],
                        **item
                    )
                    transactions.append(transaction.dict())
                    imported.append(transaction.id)
                except Exception as e:
                    logger.error(f"Failed to import item: {e}")
            
            return {"imported": len(imported), "transaction_ids": imported}
        
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")
    
    except Exception as e:
        logger.error(f"Failed to import transactions: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to import transactions: {str(e)}")

# Receipt Management
@router.post("/transactions/{transaction_id}/receipt")
async def upload_receipt(
    transaction_id: str,
    file: UploadFile = File(...)
):
    """Upload receipt for a transaction"""
    user = get_mock_user()
    
    # Verify transaction exists and belongs to user
    transaction = None
    for t in transactions:
        if t["id"] == transaction_id and t["user_id"] == user["id"]:
            transaction = t
            break
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    try:
        # Read file content
        contents = await file.read()
        receipt_data = base64.b64encode(contents).decode('utf-8')
        
        # Store receipt
        receipts[transaction_id] = {
            "transaction_id": transaction_id,
            "user_id": user["id"],
            "receipt_data": receipt_data,
            "receipt_type": file.content_type or "image/jpeg",
            "uploaded_at": datetime.utcnow().isoformat(),
            "file_name": file.filename
        }
        
        logger.info(f"Uploaded receipt for transaction {transaction_id}")
        return {"message": "Receipt uploaded successfully", "transaction_id": transaction_id}
    
    except Exception as e:
        logger.error(f"Failed to upload receipt: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload receipt: {str(e)}")

@router.get("/transactions/{transaction_id}/receipt")
async def get_receipt(transaction_id: str):
    """Get receipt for a transaction"""
    user = get_mock_user()
    
    # Verify transaction exists and belongs to user
    transaction = None
    for t in transactions:
        if t["id"] == transaction_id and t["user_id"] == user["id"]:
            transaction = t
            break
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction_id not in receipts:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    receipt = receipts[transaction_id]
    if receipt["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return receipt

# AI Transaction Categorization
@router.post("/transactions/ai/categorize", response_model=List[AICategorizeResponse])
async def ai_categorize_transactions(request: AICategorizeRequest):
    """AI-powered transaction categorization"""
    user = get_mock_user()
    
    results = []
    
    for transaction_id in request.transaction_ids:
        # Find transaction
        transaction = None
        for t in transactions:
            if t["id"] == transaction_id and t["user_id"] == user["id"]:
                transaction = t
                break
        
        if not transaction:
            continue
        
        # Mock AI categorization (in real app, this would call AI service)
        # Simple rule-based categorization for demo
        description_lower = transaction.get("description", "").lower()
        
        suggested_category = "other"
        confidence = 0.7
        reasoning = "Based on transaction description"
        
        if any(word in description_lower for word in ["grocery", "food", "restaurant", "cafe", "dining"]):
            suggested_category = "food_dining"
            confidence = 0.9
            reasoning = "Transaction description contains food-related keywords"
        elif any(word in description_lower for word in ["gas", "fuel", "uber", "lyft", "parking", "toll"]):
            suggested_category = "transportation"
            confidence = 0.85
            reasoning = "Transaction description contains transportation-related keywords"
        elif any(word in description_lower for word in ["rent", "mortgage", "utilities", "electric", "water"]):
            suggested_category = "housing"
            confidence = 0.9
            reasoning = "Transaction description contains housing-related keywords"
        
        results.append(AICategorizeResponse(
            transaction_id=transaction_id,
            suggested_category=suggested_category,
            confidence=confidence,
            reasoning=reasoning
        ))
    
    return results

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

# Account Sync Operations
@router.get("/accounts/{account_id}/sync")
async def get_account_sync_status(account_id: str):
    """Get bank account sync status"""
    user = get_mock_user()
    
    # Verify account exists
    account = None
    for acc in bank_accounts:
        if acc["id"] == account_id and acc["user_id"] == user["id"]:
            account = acc
            break
    
    if not account:
        raise HTTPException(status_code=404, detail="Bank account not found")
    
    # Mock sync status
    return {
        "account_id": account_id,
        "sync_status": "synced",
        "last_sync": datetime.utcnow().isoformat(),
        "next_sync": (datetime.utcnow() + timedelta(hours=6)).isoformat(),
        "sync_frequency": "6 hours",
        "transactions_synced": len([t for t in transactions if t.get("account_id") == account_id])
    }

@router.post("/accounts/{account_id}/sync")
async def manual_sync_account(account_id: str):
    """Manually sync bank account"""
    user = get_mock_user()
    
    # Verify account exists
    account = None
    for acc in bank_accounts:
        if acc["id"] == account_id and acc["user_id"] == user["id"]:
            account = acc
            break
    
    if not account:
        raise HTTPException(status_code=404, detail="Bank account not found")
    
    # Mock sync operation
    logger.info(f"Manual sync initiated for account {account_id}")
    
    # Simulate sync delay
    await asyncio.sleep(1)
    
    return {
        "message": "Account sync completed",
        "account_id": account_id,
        "synced_at": datetime.utcnow().isoformat(),
        "transactions_added": 0,  # Mock value
        "transactions_updated": 0  # Mock value
    }

@router.get("/accounts/{account_id}/transactions", response_model=List[Transaction])
async def get_account_transactions(
    account_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """Get transactions for a specific account"""
    user = get_mock_user()
    
    # Verify account exists
    account = None
    for acc in bank_accounts:
        if acc["id"] == account_id and acc["user_id"] == user["id"]:
            account = acc
            break
    
    if not account:
        raise HTTPException(status_code=404, detail="Bank account not found")
    
    # Filter transactions
    account_transactions = [
        t for t in transactions 
        if t.get("account_id") == account_id and t["user_id"] == user["id"]
    ]
    
    if start_date:
        account_transactions = [t for t in account_transactions if t["date"] >= start_date]
    
    if end_date:
        account_transactions = [t for t in account_transactions if t["date"] <= end_date]
    
    account_transactions.sort(key=lambda x: x["date"], reverse=True)
    return account_transactions[offset:offset + limit]

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
# Bank Connection Management
@router.post("/bank/connect")
async def connect_bank(connection_data: BankConnectionCreate):
    """Connect bank account via OAuth flow"""
    user = get_mock_user()
    
    # Mock OAuth connection
    connection = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "bank_name": connection_data.bank_name,
        "account_type": connection_data.account_type,
        "status": "connected",
        "connected_at": datetime.utcnow().isoformat(),
        "last_sync": datetime.utcnow().isoformat(),
        "oauth_token": connection_data.oauth_token  # In real app, this would be encrypted
    }
    
    bank_connections.append(connection)
    logger.info(f"Connected bank {connection_data.bank_name} for user {user['id']}")
    
    return connection

@router.get("/bank/connections")
async def get_bank_connections():
    """List all bank connections"""
    user = get_mock_user()
    
    user_connections = [
        {**conn, "oauth_token": None}  # Don't expose OAuth token
        for conn in bank_connections 
        if conn["user_id"] == user["id"]
    ]
    
    return user_connections

@router.delete("/bank/connections/{connection_id}")
async def disconnect_bank(connection_id: str):
    """Disconnect a bank connection"""
    user = get_mock_user()
    
    for i, connection in enumerate(bank_connections):
        if connection["id"] == connection_id and connection["user_id"] == user["id"]:
            del bank_connections[i]
            logger.info(f"Disconnected bank connection {connection_id}")
            return {"message": "Bank connection disconnected successfully"}
    
    raise HTTPException(status_code=404, detail="Bank connection not found")

@router.get("/bank/live-transactions")
async def get_live_transactions(
    connection_id: Optional[str] = None,
    limit: int = Query(50, le=100)
):
    """Get live transactions from connected banks"""
    user = get_mock_user()
    
    # Filter by connection if provided
    if connection_id:
        connection = None
        for conn in bank_connections:
            if conn["id"] == connection_id and conn["user_id"] == user["id"]:
                connection = conn
                break
        
        if not connection:
            raise HTTPException(status_code=404, detail="Bank connection not found")
    
    # Mock live transactions (in real app, this would fetch from bank API)
    live_transactions = [
        t for t in transactions 
        if t["user_id"] == user["id"] and t.get("is_live", False)
    ][:limit]
    
    return {
        "transactions": live_transactions,
        "count": len(live_transactions),
        "last_updated": datetime.utcnow().isoformat()
    }

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

@router.get("/offers/{offer_id}")
async def get_offer_details(offer_id: str):
    """Get details of a specific financial offer"""
    user = get_mock_user()
    
    for offer in financial_offers:
        if offer["id"] == offer_id and offer["user_id"] == user["id"]:
            return offer
    
    raise HTTPException(status_code=404, detail="Financial offer not found")

@router.post("/offers/{offer_id}/apply")
async def apply_for_offer(offer_id: str):
    """Apply for a financial offer"""
    user = get_mock_user()
    
    offer = None
    for o in financial_offers:
        if o["id"] == offer_id and o["user_id"] == user["id"]:
            offer = o
            break
    
    if not offer:
        raise HTTPException(status_code=404, detail="Financial offer not found")
    
    if not offer.get("is_active", True):
        raise HTTPException(status_code=400, detail="Offer is no longer active")
    
    # Mock application process
    application = {
        "application_id": str(uuid.uuid4()),
        "offer_id": offer_id,
        "user_id": user["id"],
        "status": "pending",
        "applied_at": datetime.utcnow().isoformat(),
        "estimated_decision_date": (datetime.utcnow() + timedelta(days=7)).isoformat()
    }
    
    logger.info(f"User {user['id']} applied for offer {offer_id}")
    
    return application

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

@router.get("/goals/{goal_id}/progress")
async def get_goal_progress(goal_id: str):
    """Get goal progress details"""
    user = get_mock_user()
    
    goal = None
    for g in financial_goals:
        if g["id"] == goal_id and g["user_id"] == user["id"]:
            goal = g
            break
    
    if not goal:
        raise HTTPException(status_code=404, detail="Financial goal not found")
    
    current_amount = goal.get("current_amount", 0)
    target_amount = goal["target_amount"]
    progress_percentage = (current_amount / target_amount * 100) if target_amount > 0 else 0
    remaining = max(0, target_amount - current_amount)
    
    # Calculate time remaining if target date exists
    time_remaining = None
    if goal.get("target_date"):
        target_date = datetime.strptime(goal["target_date"], "%Y-%m-%d").date() if isinstance(goal["target_date"], str) else goal["target_date"]
        days_remaining = (target_date - date.today()).days
        time_remaining = {
            "days": days_remaining,
            "months": round(days_remaining / 30, 1),
            "on_track": True  # Simplified calculation
        }
    
    return {
        "goal_id": goal_id,
        "goal_name": goal["name"],
        "current_amount": current_amount,
        "target_amount": target_amount,
        "progress_percentage": round(progress_percentage, 2),
        "remaining": remaining,
        "time_remaining": time_remaining,
        "last_updated": goal.get("updated_at", goal.get("created_at"))
    }

@router.post("/goals/{goal_id}/progress")
async def update_goal_progress(goal_id: str, progress_data: GoalProgressUpdate):
    """Update goal progress"""
    user = get_mock_user()
    
    goal = None
    for g in financial_goals:
        if g["id"] == goal_id and g["user_id"] == user["id"]:
            goal = g
            break
    
    if not goal:
        raise HTTPException(status_code=404, detail="Financial goal not found")
    
    goal["current_amount"] = progress_data.current_amount
    goal["progress_percentage"] = (progress_data.current_amount / goal["target_amount"] * 100) if goal["target_amount"] > 0 else 0
    goal["updated_at"] = datetime.utcnow().isoformat()
    
    if progress_data.notes:
        if "progress_notes" not in goal:
            goal["progress_notes"] = []
        goal["progress_notes"].append({
            "date": datetime.utcnow().isoformat(),
            "amount": progress_data.current_amount,
            "notes": progress_data.notes
        })
    
    logger.info(f"Updated progress for goal {goal_id}")
    
    return {
        "message": "Goal progress updated",
        "goal_id": goal_id,
        "current_amount": progress_data.current_amount,
        "progress_percentage": round(goal["progress_percentage"], 2)
    }

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

# Recurring Transactions
@router.get("/recurring", response_model=List[RecurringTransaction])
async def get_recurring_transactions():
    """Get recurring transactions"""
    user = get_mock_user()
    
    user_recurring = [r for r in recurring_transactions if r["user_id"] == user["id"]]
    return user_recurring

@router.post("/recurring", response_model=RecurringTransaction)
async def create_recurring_transaction(recurring_data: RecurringTransactionCreate):
    """Create a recurring transaction"""
    user = get_mock_user()
    
    recurring = RecurringTransaction(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        is_active=True,
        **recurring_data.dict()
    )
    
    recurring_transactions.append(recurring.dict())
    logger.info(f"Created recurring transaction for user {user['id']}")
    
    return recurring

# Analytics Endpoints
@router.get("/analytics/trends")
async def get_trend_analysis(
    period: str = Query("6m", regex="^(1m|3m|6m|1y|all)$"),
    category: Optional[str] = None
):
    """Get trend analysis"""
    user = get_mock_user()
    
    user_transactions = [t for t in transactions if t["user_id"] == user["id"]]
    
    # Filter by category if provided
    if category:
        user_transactions = [t for t in user_transactions if t.get("category") == category]
    
    # Mock trend data
    trends = {
        "period": period,
        "category": category,
        "income_trend": "increasing",
        "expense_trend": "stable",
        "savings_trend": "improving",
        "monthly_data": [
            {"month": "Jan", "income": 8000, "expenses": 6000, "savings": 2000},
            {"month": "Feb", "income": 8200, "expenses": 6100, "savings": 2100},
            {"month": "Mar", "income": 8500, "expenses": 6200, "savings": 2300},
            {"month": "Apr", "income": 8500, "expenses": 6000, "savings": 2500},
            {"month": "May", "income": 8800, "expenses": 6300, "savings": 2500},
            {"month": "Jun", "income": 9000, "expenses": 6200, "savings": 2800}
        ],
        "predictions": {
            "next_month_income": 9200,
            "next_month_expenses": 6400,
            "next_month_savings": 2800
        }
    }
    
    return trends

@router.get("/analytics/categories")
async def get_category_breakdown(
    period: str = Query("1m", regex="^(1m|3m|6m|1y|all)$"),
    transaction_type: Optional[str] = None
):
    """Get category breakdown"""
    user = get_mock_user()
    
    user_transactions = [t for t in transactions if t["user_id"] == user["id"]]
    
    # Filter by type if provided
    if transaction_type:
        user_transactions = [t for t in user_transactions if t.get("type") == transaction_type]
    
    # Calculate category totals
    category_totals = {}
    for t in user_transactions:
        cat = t.get("category", "other")
        if cat not in category_totals:
            category_totals[cat] = {"amount": 0, "count": 0}
        category_totals[cat]["amount"] += abs(t.get("amount", 0))
        category_totals[cat]["count"] += 1
    
    total = sum(cat["amount"] for cat in category_totals.values())
    
    # Calculate percentages
    category_breakdown = [
        {
            "category": cat,
            "amount": data["amount"],
            "count": data["count"],
            "percentage": round((data["amount"] / total * 100) if total > 0 else 0, 2)
        }
        for cat, data in category_totals.items()
    ]
    
    category_breakdown.sort(key=lambda x: x["amount"], reverse=True)
    
    return {
        "period": period,
        "total": total,
        "category_breakdown": category_breakdown,
        "top_category": category_breakdown[0] if category_breakdown else None
    }

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

# Debt Payment Operations
@router.post("/debt/{debt_id}/payment")
async def make_debt_payment(
    debt_id: str,
    payment_data: DebtPaymentCreate
):
    """Make a payment towards a debt"""
    user = get_mock_user()
    
    # Find debt
    debt = None
    for d in debt_trackers:
        if d["id"] == debt_id and d["user_id"] == user["id"]:
            debt = d
            break
    
    if not debt:
        raise HTTPException(status_code=404, detail="Debt tracker not found")
    
    # Update debt balance
    old_balance = debt["current_balance"]
    debt["current_balance"] = max(0, debt["current_balance"] - payment_data.amount)
    debt["updated_at"] = datetime.utcnow().isoformat()
    
    # Create transaction record
    payment_transaction = Transaction(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        account_id="",  # Could link to payment account
        type=TransactionType.expense,
        category="debt_payment",
        amount=-payment_data.amount,
        description=f"Payment for {debt['name']}",
        date=payment_data.payment_date,
        notes=payment_data.notes
    )
    transactions.append(payment_transaction.dict())
    
    logger.info(f"Payment of {payment_data.amount} made towards debt {debt_id}")
    
    return {
        "message": "Payment recorded successfully",
        "debt_id": debt_id,
        "previous_balance": old_balance,
        "new_balance": debt["current_balance"],
        "payment_amount": payment_data.amount
    }

@router.get("/debt/payoff-strategies")
async def get_payoff_strategies():
    """Get debt payoff strategies"""
    user = get_mock_user()
    
    user_debts = [d for d in debt_trackers if d["user_id"] == user["id"] and d.get("is_active", True)]
    
    if not user_debts:
        return {"strategies": []}
    
    # Calculate strategies
    total_debt = sum(d["current_balance"] for d in user_debts)
    total_minimum_payments = sum(d["minimum_payment"] for d in user_debts)
    
    # Avalanche strategy (highest interest first)
    avalanche_debts = sorted(user_debts, key=lambda x: x["interest_rate"], reverse=True)
    avalanche_strategy = {
        "name": "Debt Avalanche",
        "description": "Pay off debts with highest interest rates first",
        "order": [{"name": d["name"], "interest_rate": d["interest_rate"]} for d in avalanche_debts],
        "estimated_savings": 500.0,  # Mock value
        "estimated_time_months": 24  # Mock value
    }
    
    # Snowball strategy (lowest balance first)
    snowball_debts = sorted(user_debts, key=lambda x: x["current_balance"])
    snowball_strategy = {
        "name": "Debt Snowball",
        "description": "Pay off smallest debts first for quick wins",
        "order": [{"name": d["name"], "balance": d["current_balance"]} for d in snowball_debts],
        "estimated_savings": 300.0,  # Mock value
        "estimated_time_months": 28  # Mock value
    }
    
    return {
        "total_debt": total_debt,
        "total_minimum_payments": total_minimum_payments,
        "strategies": [avalanche_strategy, snowball_strategy]
    }

@router.post("/debt/calculate-payoff")
async def calculate_payoff(
    debt_id: str,
    monthly_payment: float = Form(...),
    strategy: str = Form("avalanche")
):
    """Calculate debt payoff timeline"""
    user = get_mock_user()
    
    # Find debt
    debt = None
    for d in debt_trackers:
        if d["id"] == debt_id and d["user_id"] == user["id"]:
            debt = d
            break
    
    if not debt:
        raise HTTPException(status_code=404, detail="Debt tracker not found")
    
    # Calculate payoff (simplified calculation)
    balance = debt["current_balance"]
    interest_rate = debt["interest_rate"] / 100 / 12  # Monthly interest rate
    monthly_interest = balance * interest_rate
    principal_payment = monthly_payment - monthly_interest
    
    if principal_payment <= 0:
        raise HTTPException(status_code=400, detail="Monthly payment must be greater than interest")
    
    # Calculate months to payoff
    months = 0
    remaining_balance = balance
    payment_schedule = []
    
    while remaining_balance > 0.01 and months < 600:  # Max 50 years
        monthly_interest_payment = remaining_balance * interest_rate
        principal_payment_amount = min(monthly_payment - monthly_interest_payment, remaining_balance)
        remaining_balance -= principal_payment_amount
        months += 1
        
        if months <= 12 or remaining_balance < 0.01:  # Include first year and last payment
            payment_schedule.append({
                "month": months,
                "balance": round(remaining_balance, 2),
                "interest_paid": round(monthly_interest_payment, 2),
                "principal_paid": round(principal_payment_amount, 2)
            })
    
    total_interest = (monthly_payment * months) - balance
    
    return {
        "debt_id": debt_id,
        "debt_name": debt["name"],
        "current_balance": balance,
        "monthly_payment": monthly_payment,
        "months_to_payoff": months,
        "years_to_payoff": round(months / 12, 1),
        "total_interest": round(total_interest, 2),
        "total_paid": round(monthly_payment * months, 2),
        "payment_schedule": payment_schedule
    }

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

# Investment Transaction Management
@router.post("/investments/{investment_id}/transaction")
async def add_investment_transaction(
    investment_id: str,
    transaction_data: InvestmentTransactionCreate
):
    """Add a transaction to an investment (buy, sell, dividend, etc.)"""
    user = get_mock_user()
    
    # Verify investment exists
    investment = None
    for inv in investments:
        if inv["id"] == investment_id and inv["user_id"] == user["id"]:
            investment = inv
            break
    
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    
    # Update investment based on transaction type
    if transaction_data.type == "buy":
        new_quantity = investment["quantity"] + transaction_data.quantity
        # Recalculate average purchase price
        total_cost = (investment["quantity"] * investment["purchase_price"]) + (transaction_data.quantity * transaction_data.price)
        new_purchase_price = total_cost / new_quantity
        investment["quantity"] = new_quantity
        investment["purchase_price"] = new_purchase_price
    elif transaction_data.type == "sell":
        if investment["quantity"] < transaction_data.quantity:
            raise HTTPException(status_code=400, detail="Insufficient quantity to sell")
        investment["quantity"] -= transaction_data.quantity
    elif transaction_data.type == "dividend":
        # Dividends don't change quantity, just add to income
        pass
    
    # Update current value
    investment["total_value"] = investment["quantity"] * investment["current_price"]
    investment["gain_loss"] = investment["total_value"] - (investment["quantity"] * investment["purchase_price"])
    investment["gain_loss_percentage"] = (investment["gain_loss"] / (investment["quantity"] * investment["purchase_price"])) * 100
    
    logger.info(f"Added {transaction_data.type} transaction to investment {investment_id}")
    
    return {
        "message": "Investment transaction added successfully",
        "investment": investment
    }

@router.get("/investments/portfolio")
async def get_portfolio_view():
    """Get portfolio view with all investments"""
    user = get_mock_user()
    
    user_investments = [i for i in investments if i["user_id"] == user["id"]]
    
    total_value = sum(i["total_value"] for i in user_investments)
    total_cost = sum(i["quantity"] * i["purchase_price"] for i in user_investments)
    total_gain_loss = sum(i["gain_loss"] for i in user_investments)
    total_gain_loss_percentage = (total_gain_loss / total_cost * 100) if total_cost > 0 else 0
    
    # Group by type
    by_type = {}
    for inv in user_investments:
        inv_type = inv.get("type", "other")
        if inv_type not in by_type:
            by_type[inv_type] = {"count": 0, "value": 0, "gain_loss": 0}
        by_type[inv_type]["count"] += 1
        by_type[inv_type]["value"] += inv["total_value"]
        by_type[inv_type]["gain_loss"] += inv["gain_loss"]
    
    return {
        "total_value": total_value,
        "total_cost": total_cost,
        "total_gain_loss": total_gain_loss,
        "total_gain_loss_percentage": total_gain_loss_percentage,
        "investment_count": len(user_investments),
        "by_type": by_type,
        "investments": user_investments
    }

@router.get("/investments/performance")
async def get_investment_performance(
    period: str = Query("1y", regex="^(1m|3m|6m|1y|all)$")
):
    """Get investment performance data"""
    user = get_mock_user()
    
    user_investments = [i for i in investments if i["user_id"] == user["id"]]
    
    # Mock performance data
    performance_data = {
        "period": period,
        "total_return": 12.5,  # Percentage
        "total_return_amount": sum(i["gain_loss"] for i in user_investments),
        "best_performer": {
            "name": user_investments[0]["name"] if user_investments else None,
            "return": 25.3,
            "gain_loss": user_investments[0]["gain_loss"] if user_investments else 0
        } if user_investments else None,
        "worst_performer": {
            "name": user_investments[-1]["name"] if len(user_investments) > 1 else None,
            "return": -5.2,
            "gain_loss": user_investments[-1]["gain_loss"] if len(user_investments) > 1 else 0
        } if len(user_investments) > 1 else None,
        "monthly_returns": [
            {"month": "Jan", "return": 2.1},
            {"month": "Feb", "return": -1.5},
            {"month": "Mar", "return": 3.2},
            {"month": "Apr", "return": 1.8},
            {"month": "May", "return": 2.5},
            {"month": "Jun", "return": 4.2}
        ],
        "asset_allocation": {
            "stocks": 60.0,
            "bonds": 30.0,
            "cash": 10.0
        }
    }
    
    return performance_data

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
