from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
import os

app = FastAPI(title="Finance API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class BankAccountBase(BaseModel):
    account_name: str
    bank_name: str
    account_number: str
    account_type: str
    balance: float
    currency: str
    interest_rate: Optional[float] = None
    credit_limit: Optional[float] = None
    is_active: bool = True
    is_primary: bool = False

class BankAccount(BankAccountBase):
    id: str
    user_id: str
    last_updated: str
    created_at: str

class TransactionBase(BaseModel):
    description: str
    amount: float
    type: str
    category: str
    date: str
    account_id: Optional[str] = None
    notes: Optional[str] = None
    receipt_url: Optional[str] = None

class Transaction(TransactionBase):
    id: str
    user_id: str
    created_at: str

class BudgetBase(BaseModel):
    name: str
    category: str
    amount: float
    currency: str
    period: str
    start_date: str
    end_date: Optional[str] = None
    budget_type: str
    goal_amount: Optional[float] = None
    goal_deadline: Optional[str] = None
    alerts: dict
    notes: Optional[str] = None
    is_active: bool = True

class Budget(BudgetBase):
    id: str
    user_id: str
    spent: float
    remaining: float
    created_at: str
    updated_at: str

class FinancialGoalBase(BaseModel):
    name: str
    description: str
    target_amount: float
    current_amount: float
    currency: str
    category: str
    priority: str
    deadline: str
    status: str
    notes: Optional[str] = None

class FinancialGoal(FinancialGoalBase):
    id: str
    user_id: str
    created_at: str
    updated_at: str

class DebtTrackerBase(BaseModel):
    name: str
    description: str
    original_amount: float
    current_amount: float
    interest_rate: float
    minimum_payment: float
    due_date: str
    creditor: str
    account_number: Optional[str] = None
    status: str
    priority: str
    notes: Optional[str] = None

class DebtTracker(DebtTrackerBase):
    id: str
    user_id: str
    created_at: str
    updated_at: str

class InvestmentBase(BaseModel):
    name: str
    type: str
    amount: float
    currency: str
    purchase_date: str
    current_value: float
    return_rate: float
    risk_level: str
    institution: str
    account_number: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True

class Investment(InvestmentBase):
    id: str
    user_id: str
    created_at: str
    updated_at: str

# In-memory storage (replace with database in production)
bank_accounts = []
transactions = []
budgets = []
financial_goals = []
debt_trackers = []
investments = []

# Helper function to get current user (mock for now)
def get_current_user():
    return {"id": "user_123"}

# Health check
@app.get("/api/health/status")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Bank Account endpoints
@app.get("/api/finance/accounts", response_model=List[BankAccount])
async def get_bank_accounts():
    return bank_accounts

@app.post("/api/finance/accounts", response_model=BankAccount)
async def create_bank_account(account: BankAccountBase):
    new_account = BankAccount(
        id=f"acc_{len(bank_accounts) + 1}",
        user_id="user_123",
        **account.dict(),
        last_updated=datetime.now().isoformat(),
        created_at=datetime.now().isoformat()
    )
    bank_accounts.append(new_account)
    return new_account

@app.get("/api/finance/accounts/{account_id}", response_model=BankAccount)
async def get_bank_account(account_id: str):
    for account in bank_accounts:
        if account.id == account_id:
            return account
    raise HTTPException(status_code=404, detail="Bank account not found")

@app.put("/api/finance/accounts/{account_id}", response_model=BankAccount)
async def update_bank_account(account_id: str, account_update: BankAccountBase):
    for i, account in enumerate(bank_accounts):
        if account.id == account_id:
            updated_account = BankAccount(
                id=account_id,
                user_id=account.user_id,
                **account_update.dict(),
                last_updated=datetime.now().isoformat(),
                created_at=account.created_at
            )
            bank_accounts[i] = updated_account
            return updated_account
    raise HTTPException(status_code=404, detail="Bank account not found")

@app.delete("/api/finance/accounts/{account_id}")
async def delete_bank_account(account_id: str):
    for i, account in enumerate(bank_accounts):
        if account.id == account_id:
            del bank_accounts[i]
            return {"message": "Bank account deleted"}
    raise HTTPException(status_code=404, detail="Bank account not found")

# Transaction endpoints
@app.get("/api/finance/transactions", response_model=List[Transaction])
async def get_transactions(limit: int = 100, offset: int = 0):
    return transactions[offset:offset + limit]

@app.post("/api/finance/transactions", response_model=Transaction)
async def create_transaction(transaction: TransactionBase):
    new_transaction = Transaction(
        id=f"txn_{len(transactions) + 1}",
        user_id="user_123",
        **transaction.dict(),
        created_at=datetime.now().isoformat()
    )
    transactions.append(new_transaction)
    return new_transaction

@app.get("/api/finance/transactions/{transaction_id}", response_model=Transaction)
async def get_transaction(transaction_id: str):
    for transaction in transactions:
        if transaction.id == transaction_id:
            return transaction
    raise HTTPException(status_code=404, detail="Transaction not found")

@app.put("/api/finance/transactions/{transaction_id}", response_model=Transaction)
async def update_transaction(transaction_id: str, transaction_update: TransactionBase):
    for i, transaction in enumerate(transactions):
        if transaction.id == transaction_id:
            updated_transaction = Transaction(
                id=transaction_id,
                user_id=transaction.user_id,
                **transaction_update.dict(),
                created_at=transaction.created_at
            )
            transactions[i] = updated_transaction
            return updated_transaction
    raise HTTPException(status_code=404, detail="Transaction not found")

@app.delete("/api/finance/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str):
    for i, transaction in enumerate(transactions):
        if transaction.id == transaction_id:
            del transactions[i]
            return {"message": "Transaction deleted"}
    raise HTTPException(status_code=404, detail="Transaction not found")

# Budget endpoints
@app.get("/api/finance/budgets", response_model=List[Budget])
async def get_budgets():
    return budgets

@app.post("/api/finance/budgets", response_model=Budget)
async def create_budget(budget: BudgetBase):
    new_budget = Budget(
        id=f"budget_{len(budgets) + 1}",
        user_id="user_123",
        **budget.dict(),
        spent=0.0,
        remaining=budget.amount,
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat()
    )
    budgets.append(new_budget)
    return new_budget

@app.get("/api/finance/budgets/{budget_id}", response_model=Budget)
async def get_budget(budget_id: str):
    for budget in budgets:
        if budget.id == budget_id:
            return budget
    raise HTTPException(status_code=404, detail="Budget not found")

@app.put("/api/finance/budgets/{budget_id}", response_model=Budget)
async def update_budget(budget_id: str, budget_update: BudgetBase):
    for i, budget in enumerate(budgets):
        if budget.id == budget_id:
            updated_budget = Budget(
                id=budget_id,
                user_id=budget.user_id,
                **budget_update.dict(),
                spent=budget.spent,
                remaining=budget.remaining,
                created_at=budget.created_at,
                updated_at=datetime.now().isoformat()
            )
            budgets[i] = updated_budget
            return updated_budget
    raise HTTPException(status_code=404, detail="Budget not found")

@app.delete("/api/finance/budgets/{budget_id}")
async def delete_budget(budget_id: str):
    for i, budget in enumerate(budgets):
        if budget.id == budget_id:
            del budgets[i]
            return {"message": "Budget deleted"}
    raise HTTPException(status_code=404, detail="Budget not found")

# Financial Goal endpoints
@app.get("/api/finance/goals", response_model=List[FinancialGoal])
async def get_financial_goals():
    return financial_goals

@app.post("/api/finance/goals", response_model=FinancialGoal)
async def create_financial_goal(goal: FinancialGoalBase):
    new_goal = FinancialGoal(
        id=f"goal_{len(financial_goals) + 1}",
        user_id="user_123",
        **goal.dict(),
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat()
    )
    financial_goals.append(new_goal)
    return new_goal

@app.get("/api/finance/goals/{goal_id}", response_model=FinancialGoal)
async def get_financial_goal(goal_id: str):
    for goal in financial_goals:
        if goal.id == goal_id:
            return goal
    raise HTTPException(status_code=404, detail="Financial goal not found")

@app.put("/api/finance/goals/{goal_id}", response_model=FinancialGoal)
async def update_financial_goal(goal_id: str, goal_update: FinancialGoalBase):
    for i, goal in enumerate(financial_goals):
        if goal.id == goal_id:
            updated_goal = FinancialGoal(
                id=goal_id,
                user_id=goal.user_id,
                **goal_update.dict(),
                created_at=goal.created_at,
                updated_at=datetime.now().isoformat()
            )
            financial_goals[i] = updated_goal
            return updated_goal
    raise HTTPException(status_code=404, detail="Financial goal not found")

@app.delete("/api/finance/goals/{goal_id}")
async def delete_financial_goal(goal_id: str):
    for i, goal in enumerate(financial_goals):
        if goal.id == goal_id:
            del financial_goals[i]
            return {"message": "Financial goal deleted"}
    raise HTTPException(status_code=404, detail="Financial goal not found")

# Debt Tracker endpoints
@app.get("/api/finance/debts", response_model=List[DebtTracker])
async def get_debt_trackers():
    return debt_trackers

@app.post("/api/finance/debts", response_model=DebtTracker)
async def create_debt_tracker(debt: DebtTrackerBase):
    new_debt = DebtTracker(
        id=f"debt_{len(debt_trackers) + 1}",
        user_id="user_123",
        **debt.dict(),
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat()
    )
    debt_trackers.append(new_debt)
    return new_debt

@app.get("/api/finance/debts/{debt_id}", response_model=DebtTracker)
async def get_debt_tracker(debt_id: str):
    for debt in debt_trackers:
        if debt.id == debt_id:
            return debt
    raise HTTPException(status_code=404, detail="Debt tracker not found")

@app.put("/api/finance/debts/{debt_id}", response_model=DebtTracker)
async def update_debt_tracker(debt_id: str, debt_update: DebtTrackerBase):
    for i, debt in enumerate(debt_trackers):
        if debt.id == debt_id:
            updated_debt = DebtTracker(
                id=debt_id,
                user_id=debt.user_id,
                **debt_update.dict(),
                created_at=debt.created_at,
                updated_at=datetime.now().isoformat()
            )
            debt_trackers[i] = updated_debt
            return updated_debt
    raise HTTPException(status_code=404, detail="Debt tracker not found")

@app.delete("/api/finance/debts/{debt_id}")
async def delete_debt_tracker(debt_id: str):
    for i, debt in enumerate(debt_trackers):
        if debt.id == debt_id:
            del debt_trackers[i]
            return {"message": "Debt tracker deleted"}
    raise HTTPException(status_code=404, detail="Debt tracker not found")

# Investment endpoints
@app.get("/api/finance/investments", response_model=List[Investment])
async def get_investments():
    return investments

@app.post("/api/finance/investments", response_model=Investment)
async def create_investment(investment: InvestmentBase):
    new_investment = Investment(
        id=f"inv_{len(investments) + 1}",
        user_id="user_123",
        **investment.dict(),
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat()
    )
    investments.append(new_investment)
    return new_investment

@app.get("/api/finance/investments/{investment_id}", response_model=Investment)
async def get_investment(investment_id: str):
    for investment in investments:
        if investment.id == investment_id:
            return investment
    raise HTTPException(status_code=404, detail="Investment not found")

@app.put("/api/finance/investments/{investment_id}", response_model=Investment)
async def update_investment(investment_id: str, investment_update: InvestmentBase):
    for i, investment in enumerate(investments):
        if investment.id == investment_id:
            updated_investment = Investment(
                id=investment_id,
                user_id=investment.user_id,
                **investment_update.dict(),
                created_at=investment.created_at,
                updated_at=datetime.now().isoformat()
            )
            investments[i] = updated_investment
            return updated_investment
    raise HTTPException(status_code=404, detail="Investment not found")

@app.delete("/api/finance/investments/{investment_id}")
async def delete_investment(investment_id: str):
    for i, investment in enumerate(investments):
        if investment.id == investment_id:
            del investments[i]
            return {"message": "Investment deleted"}
    raise HTTPException(status_code=404, detail="Investment not found")

# Analytics endpoints
@app.get("/api/finance/analytics")
async def get_financial_analytics():
    total_balance = sum(acc.balance for acc in bank_accounts)
    total_transactions = len(transactions)
    total_debt = sum(debt.current_amount for debt in debt_trackers)
    total_investments = sum(inv.current_value for inv in investments)
    
    spending_by_category = {}
    for transaction in transactions:
        if transaction.type == "expense":
            category = transaction.category
            spending_by_category[category] = spending_by_category.get(category, 0) + transaction.amount
    
    return {
        "total_balance": total_balance,
        "total_debt": total_debt,
        "total_investments": total_investments,
        "net_worth": total_balance - total_debt + total_investments,
        "spending_by_category": spending_by_category,
        "income_by_category": {},
        "monthly_spending": {},
        "budget_performance": [],
        "total_transactions": total_transactions,
        "period": {
            "start_date": datetime.now().isoformat(),
            "end_date": datetime.now().isoformat()
        }
    }

@app.get("/api/finance/reports")
async def get_financial_reports(report_type: str = "summary"):
    total_balance = sum(acc.balance for acc in bank_accounts)
    total_debt = sum(debt.current_amount for debt in debt_trackers)
    total_investments = sum(inv.current_value for inv in investments)
    
    return {
        "summary": {
            "total_balance": total_balance,
            "total_debt": total_debt,
            "total_investments": total_investments,
            "net_worth": total_balance - total_debt + total_investments,
            "active_accounts": len([acc for acc in bank_accounts if acc.is_active]),
            "active_budgets": len([b for b in budgets if b.is_active]),
            "active_goals": len([g for g in financial_goals if g.status == "active"]),
            "active_debts": len([d for d in debt_trackers if d.status == "active"]),
            "active_investments": len([i for i in investments if i.is_active])
        },
        "recent_transactions": transactions[-10:] if transactions else [],
        "analytics": await get_financial_analytics(),
        "budget_reports": [],
        "total_budgets": len(budgets),
        "active_budgets": len([b for b in budgets if b.is_active]),
        "generated_at": datetime.now().isoformat(),
        "report_type": report_type
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
