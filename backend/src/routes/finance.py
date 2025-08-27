from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..services.finance_service import FinanceService
from ..schemas.finance_schemas import (
    BankAccount, BankAccountCreate, BankAccountUpdate,
    Transaction, TransactionCreate, TransactionUpdate,
    Budget, BudgetCreate, BudgetUpdate,
    FinancialGoal, FinancialGoalCreate, FinancialGoalUpdate,
    DebtTracker, DebtTrackerCreate, DebtTrackerUpdate,
    Investment, InvestmentCreate, InvestmentUpdate,
    FinancialAnalytics, FinancialReport
)
from ..utils.auth import get_current_user
from ..utils.rate_limiting import rate_limit
from ..utils.validation import validate_finance_data

router = APIRouter(prefix="/api/finance", tags=["finance"])

# Bank Account Routes
@router.get("/accounts", response_model=List[BankAccount])
@rate_limit(max_requests=100, window_seconds=60)
async def get_bank_accounts(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all bank accounts for the current user"""
    try:
        finance_service = FinanceService(db)
        accounts = finance_service.get_bank_accounts(current_user["id"])
        return accounts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch bank accounts: {str(e)}"
        )

@router.get("/accounts/{account_id}", response_model=BankAccount)
@rate_limit(max_requests=100, window_seconds=60)
async def get_bank_account(
    account_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific bank account"""
    try:
        finance_service = FinanceService(db)
        account = finance_service.get_bank_account(account_id, current_user["id"])
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank account not found"
            )
        return account
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch bank account: {str(e)}"
        )

@router.post("/accounts", response_model=BankAccount, status_code=status.HTTP_201_CREATED)
@rate_limit(max_requests=20, window_seconds=60)
async def create_bank_account(
    account_data: BankAccountCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new bank account"""
    try:
        # Validate account data
        validate_finance_data(account_data.dict())
        
        finance_service = FinanceService(db)
        account = finance_service.create_bank_account(account_data, current_user["id"])
        return account
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create bank account: {str(e)}"
        )

@router.put("/accounts/{account_id}", response_model=BankAccount)
@rate_limit(max_requests=20, window_seconds=60)
async def update_bank_account(
    account_id: str,
    account_data: BankAccountUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a bank account"""
    try:
        # Validate account data
        validate_finance_data(account_data.dict(exclude_unset=True))
        
        finance_service = FinanceService(db)
        account = finance_service.update_bank_account(account_id, account_data, current_user["id"])
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank account not found"
            )
        return account
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update bank account: {str(e)}"
        )

@router.delete("/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
@rate_limit(max_requests=10, window_seconds=60)
async def delete_bank_account(
    account_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a bank account"""
    try:
        finance_service = FinanceService(db)
        success = finance_service.delete_bank_account(account_id, current_user["id"])
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank account not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete bank account: {str(e)}"
        )

# Transaction Routes
@router.get("/transactions", response_model=List[Transaction])
@rate_limit(max_requests=100, window_seconds=60)
async def get_transactions(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get transactions for the current user"""
    try:
        finance_service = FinanceService(db)
        transactions = finance_service.get_transactions(current_user["id"], limit, offset)
        return transactions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch transactions: {str(e)}"
        )

@router.get("/transactions/{transaction_id}", response_model=Transaction)
@rate_limit(max_requests=100, window_seconds=60)
async def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific transaction"""
    try:
        finance_service = FinanceService(db)
        transaction = finance_service.get_transaction(transaction_id, current_user["id"])
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        return transaction
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch transaction: {str(e)}"
        )

@router.post("/transactions", response_model=Transaction, status_code=status.HTTP_201_CREATED)
@rate_limit(max_requests=50, window_seconds=60)
async def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new transaction"""
    try:
        # Validate transaction data
        validate_finance_data(transaction_data.dict())
        
        finance_service = FinanceService(db)
        transaction = finance_service.create_transaction(transaction_data, current_user["id"])
        return transaction
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create transaction: {str(e)}"
        )

@router.put("/transactions/{transaction_id}", response_model=Transaction)
@rate_limit(max_requests=50, window_seconds=60)
async def update_transaction(
    transaction_id: str,
    transaction_data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a transaction"""
    try:
        # Validate transaction data
        validate_finance_data(transaction_data.dict(exclude_unset=True))
        
        finance_service = FinanceService(db)
        transaction = finance_service.update_transaction(transaction_id, transaction_data, current_user["id"])
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        return transaction
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update transaction: {str(e)}"
        )

@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
@rate_limit(max_requests=20, window_seconds=60)
async def delete_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a transaction"""
    try:
        finance_service = FinanceService(db)
        success = finance_service.delete_transaction(transaction_id, current_user["id"])
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete transaction: {str(e)}"
        )

# Budget Routes
@router.get("/budgets", response_model=List[Budget])
@rate_limit(max_requests=100, window_seconds=60)
async def get_budgets(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all budgets for the current user"""
    try:
        finance_service = FinanceService(db)
        budgets = finance_service.get_budgets(current_user["id"])
        return budgets
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch budgets: {str(e)}"
        )

@router.get("/budgets/{budget_id}", response_model=Budget)
@rate_limit(max_requests=100, window_seconds=60)
async def get_budget(
    budget_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific budget"""
    try:
        finance_service = FinanceService(db)
        budget = finance_service.get_budget(budget_id, current_user["id"])
        if not budget:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Budget not found"
            )
        return budget
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch budget: {str(e)}"
        )

@router.post("/budgets", response_model=Budget, status_code=status.HTTP_201_CREATED)
@rate_limit(max_requests=20, window_seconds=60)
async def create_budget(
    budget_data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new budget"""
    try:
        # Validate budget data
        validate_finance_data(budget_data.dict())
        
        finance_service = FinanceService(db)
        budget = finance_service.create_budget(budget_data, current_user["id"])
        return budget
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create budget: {str(e)}"
        )

@router.put("/budgets/{budget_id}", response_model=Budget)
@rate_limit(max_requests=20, window_seconds=60)
async def update_budget(
    budget_id: str,
    budget_data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a budget"""
    try:
        # Validate budget data
        validate_finance_data(budget_data.dict(exclude_unset=True))
        
        finance_service = FinanceService(db)
        budget = finance_service.update_budget(budget_id, budget_data, current_user["id"])
        if not budget:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Budget not found"
            )
        return budget
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update budget: {str(e)}"
        )

@router.delete("/budgets/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
@rate_limit(max_requests=10, window_seconds=60)
async def delete_budget(
    budget_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a budget"""
    try:
        finance_service = FinanceService(db)
        success = finance_service.delete_budget(budget_id, current_user["id"])
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Budget not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete budget: {str(e)}"
        )

# Financial Goals Routes
@router.get("/goals", response_model=List[FinancialGoal])
@rate_limit(max_requests=100, window_seconds=60)
async def get_financial_goals(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all financial goals for the current user"""
    try:
        finance_service = FinanceService(db)
        goals = finance_service.get_financial_goals(current_user["id"])
        return goals
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch financial goals: {str(e)}"
        )

@router.get("/goals/{goal_id}", response_model=FinancialGoal)
@rate_limit(max_requests=100, window_seconds=60)
async def get_financial_goal(
    goal_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific financial goal"""
    try:
        finance_service = FinanceService(db)
        goal = finance_service.get_financial_goal(goal_id, current_user["id"])
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Financial goal not found"
            )
        return goal
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch financial goal: {str(e)}"
        )

@router.post("/goals", response_model=FinancialGoal, status_code=status.HTTP_201_CREATED)
@rate_limit(max_requests=20, window_seconds=60)
async def create_financial_goal(
    goal_data: FinancialGoalCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new financial goal"""
    try:
        # Validate goal data
        validate_finance_data(goal_data.dict())
        
        finance_service = FinanceService(db)
        goal = finance_service.create_financial_goal(goal_data, current_user["id"])
        return goal
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create financial goal: {str(e)}"
        )

@router.put("/goals/{goal_id}", response_model=FinancialGoal)
@rate_limit(max_requests=20, window_seconds=60)
async def update_financial_goal(
    goal_id: str,
    goal_data: FinancialGoalUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a financial goal"""
    try:
        # Validate goal data
        validate_finance_data(goal_data.dict(exclude_unset=True))
        
        finance_service = FinanceService(db)
        goal = finance_service.update_financial_goal(goal_id, goal_data, current_user["id"])
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Financial goal not found"
            )
        return goal
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update financial goal: {str(e)}"
        )

@router.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
@rate_limit(max_requests=10, window_seconds=60)
async def delete_financial_goal(
    goal_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a financial goal"""
    try:
        finance_service = FinanceService(db)
        success = finance_service.delete_financial_goal(goal_id, current_user["id"])
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Financial goal not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete financial goal: {str(e)}"
        )

# Debt Tracker Routes
@router.get("/debts", response_model=List[DebtTracker])
@rate_limit(max_requests=100, window_seconds=60)
async def get_debt_trackers(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all debt trackers for the current user"""
    try:
        finance_service = FinanceService(db)
        debts = finance_service.get_debt_trackers(current_user["id"])
        return debts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch debt trackers: {str(e)}"
        )

@router.get("/debts/{debt_id}", response_model=DebtTracker)
@rate_limit(max_requests=100, window_seconds=60)
async def get_debt_tracker(
    debt_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific debt tracker"""
    try:
        finance_service = FinanceService(db)
        debt = finance_service.get_debt_tracker(debt_id, current_user["id"])
        if not debt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Debt tracker not found"
            )
        return debt
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch debt tracker: {str(e)}"
        )

@router.post("/debts", response_model=DebtTracker, status_code=status.HTTP_201_CREATED)
@rate_limit(max_requests=20, window_seconds=60)
async def create_debt_tracker(
    debt_data: DebtTrackerCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new debt tracker"""
    try:
        # Validate debt data
        validate_finance_data(debt_data.dict())
        
        finance_service = FinanceService(db)
        debt = finance_service.create_debt_tracker(debt_data, current_user["id"])
        return debt
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create debt tracker: {str(e)}"
        )

@router.put("/debts/{debt_id}", response_model=DebtTracker)
@rate_limit(max_requests=20, window_seconds=60)
async def update_debt_tracker(
    debt_id: str,
    debt_data: DebtTrackerUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a debt tracker"""
    try:
        # Validate debt data
        validate_finance_data(debt_data.dict(exclude_unset=True))
        
        finance_service = FinanceService(db)
        debt = finance_service.update_debt_tracker(debt_id, debt_data, current_user["id"])
        if not debt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Debt tracker not found"
            )
        return debt
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update debt tracker: {str(e)}"
        )

@router.delete("/debts/{debt_id}", status_code=status.HTTP_204_NO_CONTENT)
@rate_limit(max_requests=10, window_seconds=60)
async def delete_debt_tracker(
    debt_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a debt tracker"""
    try:
        finance_service = FinanceService(db)
        success = finance_service.delete_debt_tracker(debt_id, current_user["id"])
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Debt tracker not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete debt tracker: {str(e)}"
        )

# Investment Routes
@router.get("/investments", response_model=List[Investment])
@rate_limit(max_requests=100, window_seconds=60)
async def get_investments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all investments for the current user"""
    try:
        finance_service = FinanceService(db)
        investments = finance_service.get_investments(current_user["id"])
        return investments
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch investments: {str(e)}"
        )

@router.get("/investments/{investment_id}", response_model=Investment)
@rate_limit(max_requests=100, window_seconds=60)
async def get_investment(
    investment_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific investment"""
    try:
        finance_service = FinanceService(db)
        investment = finance_service.get_investment(investment_id, current_user["id"])
        if not investment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Investment not found"
            )
        return investment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch investment: {str(e)}"
        )

@router.post("/investments", response_model=Investment, status_code=status.HTTP_201_CREATED)
@rate_limit(max_requests=20, window_seconds=60)
async def create_investment(
    investment_data: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new investment"""
    try:
        # Validate investment data
        validate_finance_data(investment_data.dict())
        
        finance_service = FinanceService(db)
        investment = finance_service.create_investment(investment_data, current_user["id"])
        return investment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create investment: {str(e)}"
        )

@router.put("/investments/{investment_id}", response_model=Investment)
@rate_limit(max_requests=20, window_seconds=60)
async def update_investment(
    investment_id: str,
    investment_data: InvestmentUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update an investment"""
    try:
        # Validate investment data
        validate_finance_data(investment_data.dict(exclude_unset=True))
        
        finance_service = FinanceService(db)
        investment = finance_service.update_investment(investment_id, investment_data, current_user["id"])
        if not investment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Investment not found"
            )
        return investment
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update investment: {str(e)}"
        )

@router.delete("/investments/{investment_id}", status_code=status.HTTP_204_NO_CONTENT)
@rate_limit(max_requests=10, window_seconds=60)
async def delete_investment(
    investment_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete an investment"""
    try:
        finance_service = FinanceService(db)
        success = finance_service.delete_investment(investment_id, current_user["id"])
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Investment not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete investment: {str(e)}"
        )

# Analytics and Reports Routes
@router.get("/analytics", response_model=FinancialAnalytics)
@rate_limit(max_requests=50, window_seconds=60)
async def get_financial_analytics(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive financial analytics"""
    try:
        finance_service = FinanceService(db)
        analytics = finance_service.get_financial_analytics(current_user["id"])
        return analytics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate financial analytics: {str(e)}"
        )

@router.get("/reports", response_model=FinancialReport)
@rate_limit(max_requests=30, window_seconds=60)
async def get_financial_reports(
    report_type: str = Query("summary", regex="^(summary|detailed|budget)$"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Generate financial reports"""
    try:
        finance_service = FinanceService(db)
        report = finance_service.get_financial_reports(current_user["id"], report_type)
        return report
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate financial report: {str(e)}"
        )

@router.get("/forecast")
@rate_limit(max_requests=20, window_seconds=60)
async def get_ai_forecast(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get AI-powered financial forecasting"""
    try:
        # This would integrate with the AI forecasting service
        # For now, return a placeholder response
        return {
            "message": "AI forecasting feature coming soon",
            "user_id": current_user["id"],
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI forecast: {str(e)}"
        )
