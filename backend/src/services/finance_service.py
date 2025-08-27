from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc
from ..models.finance_models import (
    BankAccount, Transaction, Budget, FinancialGoal, 
    DebtTracker, Investment, User
)
from ..schemas.finance_schemas import (
    BankAccountCreate, BankAccountUpdate, TransactionCreate, TransactionUpdate,
    BudgetCreate, BudgetUpdate, FinancialGoalCreate, FinancialGoalUpdate,
    DebtTrackerCreate, DebtTrackerUpdate, InvestmentCreate, InvestmentUpdate
)
from ..utils.security import get_current_user
from ..utils.encryption import encrypt_data, decrypt_data
import logging

logger = logging.getLogger(__name__)

class FinanceService:
    def __init__(self, db: Session):
        self.db = db

    # Bank Account Management
    def get_bank_accounts(self, user_id: str) -> List[BankAccount]:
        """Get all bank accounts for a user"""
        try:
            accounts = self.db.query(BankAccount).filter(BankAccount.user_id == user_id).all()
            # Decrypt sensitive data
            for account in accounts:
                if account.account_number:
                    account.account_number = decrypt_data(account.account_number)
            return accounts
        except Exception as e:
            logger.error(f"Error fetching bank accounts: {e}")
            raise

    def get_bank_account(self, account_id: str, user_id: str) -> Optional[BankAccount]:
        """Get a specific bank account"""
        try:
            account = self.db.query(BankAccount).filter(
                and_(BankAccount.id == account_id, BankAccount.user_id == user_id)
            ).first()
            if account and account.account_number:
                account.account_number = decrypt_data(account.account_number)
            return account
        except Exception as e:
            logger.error(f"Error fetching bank account: {e}")
            raise

    def create_bank_account(self, account_data: BankAccountCreate, user_id: str) -> BankAccount:
        """Create a new bank account"""
        try:
            # Encrypt sensitive data
            encrypted_account_number = encrypt_data(account_data.account_number) if account_data.account_number else None
            
            db_account = BankAccount(
                user_id=user_id,
                account_name=account_data.account_name,
                bank_name=account_data.bank_name,
                account_number=encrypted_account_number,
                account_type=account_data.account_type,
                balance=account_data.balance,
                currency=account_data.currency,
                interest_rate=account_data.interest_rate,
                credit_limit=account_data.credit_limit,
                is_active=account_data.is_active,
                is_primary=account_data.is_primary,
                last_updated=datetime.utcnow()
            )
            
            self.db.add(db_account)
            self.db.commit()
            self.db.refresh(db_account)
            
            # Decrypt for response
            if db_account.account_number:
                db_account.account_number = decrypt_data(db_account.account_number)
            
            return db_account
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating bank account: {e}")
            raise

    def update_bank_account(self, account_id: str, account_data: BankAccountUpdate, user_id: str) -> Optional[BankAccount]:
        """Update a bank account"""
        try:
            account = self.db.query(BankAccount).filter(
                and_(BankAccount.id == account_id, BankAccount.user_id == user_id)
            ).first()
            
            if not account:
                return None
            
            # Update fields
            for field, value in account_data.dict(exclude_unset=True).items():
                if field == 'account_number' and value:
                    value = encrypt_data(value)
                setattr(account, field, value)
            
            account.last_updated = datetime.utcnow()
            self.db.commit()
            self.db.refresh(account)
            
            # Decrypt for response
            if account.account_number:
                account.account_number = decrypt_data(account.account_number)
            
            return account
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating bank account: {e}")
            raise

    def delete_bank_account(self, account_id: str, user_id: str) -> bool:
        """Delete a bank account"""
        try:
            account = self.db.query(BankAccount).filter(
                and_(BankAccount.id == account_id, BankAccount.user_id == user_id)
            ).first()
            
            if not account:
                return False
            
            self.db.delete(account)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting bank account: {e}")
            raise

    # Transaction Management
    def get_transactions(self, user_id: str, limit: int = 100, offset: int = 0) -> List[Transaction]:
        """Get transactions for a user"""
        try:
            transactions = self.db.query(Transaction).filter(
                Transaction.user_id == user_id
            ).order_by(desc(Transaction.date)).limit(limit).offset(offset).all()
            return transactions
        except Exception as e:
            logger.error(f"Error fetching transactions: {e}")
            raise

    def get_transaction(self, transaction_id: str, user_id: str) -> Optional[Transaction]:
        """Get a specific transaction"""
        try:
            transaction = self.db.query(Transaction).filter(
                and_(Transaction.id == transaction_id, Transaction.user_id == user_id)
            ).first()
            return transaction
        except Exception as e:
            logger.error(f"Error fetching transaction: {e}")
            raise

    def create_transaction(self, transaction_data: TransactionCreate, user_id: str) -> Transaction:
        """Create a new transaction"""
        try:
            db_transaction = Transaction(
                user_id=user_id,
                description=transaction_data.description,
                amount=transaction_data.amount,
                type=transaction_data.type,
                category=transaction_data.category,
                date=transaction_data.date,
                account_id=transaction_data.account_id,
                notes=transaction_data.notes,
                receipt_url=transaction_data.receipt_url
            )
            
            self.db.add(db_transaction)
            self.db.commit()
            self.db.refresh(db_transaction)
            return db_transaction
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating transaction: {e}")
            raise

    def update_transaction(self, transaction_id: str, transaction_data: TransactionUpdate, user_id: str) -> Optional[Transaction]:
        """Update a transaction"""
        try:
            transaction = self.db.query(Transaction).filter(
                and_(Transaction.id == transaction_id, Transaction.user_id == user_id)
            ).first()
            
            if not transaction:
                return None
            
            for field, value in transaction_data.dict(exclude_unset=True).items():
                setattr(transaction, field, value)
            
            self.db.commit()
            self.db.refresh(transaction)
            return transaction
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating transaction: {e}")
            raise

    def delete_transaction(self, transaction_id: str, user_id: str) -> bool:
        """Delete a transaction"""
        try:
            transaction = self.db.query(Transaction).filter(
                and_(Transaction.id == transaction_id, Transaction.user_id == user_id)
            ).first()
            
            if not transaction:
                return False
            
            self.db.delete(transaction)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting transaction: {e}")
            raise

    # Budget Management
    def get_budgets(self, user_id: str) -> List[Budget]:
        """Get all budgets for a user"""
        try:
            budgets = self.db.query(Budget).filter(Budget.user_id == user_id).all()
            return budgets
        except Exception as e:
            logger.error(f"Error fetching budgets: {e}")
            raise

    def get_budget(self, budget_id: str, user_id: str) -> Optional[Budget]:
        """Get a specific budget"""
        try:
            budget = self.db.query(Budget).filter(
                and_(Budget.id == budget_id, Budget.user_id == user_id)
            ).first()
            return budget
        except Exception as e:
            logger.error(f"Error fetching budget: {e}")
            raise

    def create_budget(self, budget_data: BudgetCreate, user_id: str) -> Budget:
        """Create a new budget"""
        try:
            db_budget = Budget(
                user_id=user_id,
                name=budget_data.name,
                category=budget_data.category,
                amount=budget_data.amount,
                currency=budget_data.currency,
                period=budget_data.period,
                start_date=budget_data.start_date,
                end_date=budget_data.end_date,
                budget_type=budget_data.budget_type,
                goal_amount=budget_data.goal_amount,
                goal_deadline=budget_data.goal_deadline,
                alerts=budget_data.alerts,
                notes=budget_data.notes,
                is_active=budget_data.is_active
            )
            
            self.db.add(db_budget)
            self.db.commit()
            self.db.refresh(db_budget)
            return db_budget
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating budget: {e}")
            raise

    def update_budget(self, budget_id: str, budget_data: BudgetUpdate, user_id: str) -> Optional[Budget]:
        """Update a budget"""
        try:
            budget = self.db.query(Budget).filter(
                and_(Budget.id == budget_id, Budget.user_id == user_id)
            ).first()
            
            if not budget:
                return None
            
            for field, value in budget_data.dict(exclude_unset=True).items():
                setattr(budget, field, value)
            
            self.db.commit()
            self.db.refresh(budget)
            return budget
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating budget: {e}")
            raise

    def delete_budget(self, budget_id: str, user_id: str) -> bool:
        """Delete a budget"""
        try:
            budget = self.db.query(Budget).filter(
                and_(Budget.id == budget_id, Budget.user_id == user_id)
            ).first()
            
            if not budget:
                return False
            
            self.db.delete(budget)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting budget: {e}")
            raise

    # Financial Goals Management
    def get_financial_goals(self, user_id: str) -> List[FinancialGoal]:
        """Get all financial goals for a user"""
        try:
            goals = self.db.query(FinancialGoal).filter(FinancialGoal.user_id == user_id).all()
            return goals
        except Exception as e:
            logger.error(f"Error fetching financial goals: {e}")
            raise

    def get_financial_goal(self, goal_id: str, user_id: str) -> Optional[FinancialGoal]:
        """Get a specific financial goal"""
        try:
            goal = self.db.query(FinancialGoal).filter(
                and_(FinancialGoal.id == goal_id, FinancialGoal.user_id == user_id)
            ).first()
            return goal
        except Exception as e:
            logger.error(f"Error fetching financial goal: {e}")
            raise

    def create_financial_goal(self, goal_data: FinancialGoalCreate, user_id: str) -> FinancialGoal:
        """Create a new financial goal"""
        try:
            db_goal = FinancialGoal(
                user_id=user_id,
                name=goal_data.name,
                description=goal_data.description,
                target_amount=goal_data.target_amount,
                current_amount=goal_data.current_amount,
                currency=goal_data.currency,
                category=goal_data.category,
                priority=goal_data.priority,
                deadline=goal_data.deadline,
                status=goal_data.status,
                notes=goal_data.notes
            )
            
            self.db.add(db_goal)
            self.db.commit()
            self.db.refresh(db_goal)
            return db_goal
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating financial goal: {e}")
            raise

    def update_financial_goal(self, goal_id: str, goal_data: FinancialGoalUpdate, user_id: str) -> Optional[FinancialGoal]:
        """Update a financial goal"""
        try:
            goal = self.db.query(FinancialGoal).filter(
                and_(FinancialGoal.id == goal_id, FinancialGoal.user_id == user_id)
            ).first()
            
            if not goal:
                return None
            
            for field, value in goal_data.dict(exclude_unset=True).items():
                setattr(goal, field, value)
            
            self.db.commit()
            self.db.refresh(goal)
            return goal
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating financial goal: {e}")
            raise

    def delete_financial_goal(self, goal_id: str, user_id: str) -> bool:
        """Delete a financial goal"""
        try:
            goal = self.db.query(FinancialGoal).filter(
                and_(FinancialGoal.id == goal_id, FinancialGoal.user_id == user_id)
            ).first()
            
            if not goal:
                return False
            
            self.db.delete(goal)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting financial goal: {e}")
            raise

    # Debt Tracker Management
    def get_debt_trackers(self, user_id: str) -> List[DebtTracker]:
        """Get all debt trackers for a user"""
        try:
            debts = self.db.query(DebtTracker).filter(DebtTracker.user_id == user_id).all()
            return debts
        except Exception as e:
            logger.error(f"Error fetching debt trackers: {e}")
            raise

    def get_debt_tracker(self, debt_id: str, user_id: str) -> Optional[DebtTracker]:
        """Get a specific debt tracker"""
        try:
            debt = self.db.query(DebtTracker).filter(
                and_(DebtTracker.id == debt_id, DebtTracker.user_id == user_id)
            ).first()
            return debt
        except Exception as e:
            logger.error(f"Error fetching debt tracker: {e}")
            raise

    def create_debt_tracker(self, debt_data: DebtTrackerCreate, user_id: str) -> DebtTracker:
        """Create a new debt tracker"""
        try:
            db_debt = DebtTracker(
                user_id=user_id,
                name=debt_data.name,
                creditor=debt_data.creditor,
                account_number=debt_data.account_number,
                debt_type=debt_data.debt_type,
                original_amount=debt_data.original_amount,
                current_balance=debt_data.current_balance,
                interest_rate=debt_data.interest_rate,
                monthly_payment=debt_data.monthly_payment,
                due_date=debt_data.due_date,
                remaining_payments=debt_data.remaining_payments,
                priority=debt_data.priority,
                status=debt_data.status,
                notes=debt_data.notes
            )
            
            self.db.add(db_debt)
            self.db.commit()
            self.db.refresh(db_debt)
            return db_debt
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating debt tracker: {e}")
            raise

    def update_debt_tracker(self, debt_id: str, debt_data: DebtTrackerUpdate, user_id: str) -> Optional[DebtTracker]:
        """Update a debt tracker"""
        try:
            debt = self.db.query(DebtTracker).filter(
                and_(DebtTracker.id == debt_id, DebtTracker.user_id == user_id)
            ).first()
            
            if not debt:
                return None
            
            for field, value in debt_data.dict(exclude_unset=True).items():
                setattr(debt, field, value)
            
            self.db.commit()
            self.db.refresh(debt)
            return debt
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating debt tracker: {e}")
            raise

    def delete_debt_tracker(self, debt_id: str, user_id: str) -> bool:
        """Delete a debt tracker"""
        try:
            debt = self.db.query(DebtTracker).filter(
                and_(DebtTracker.id == debt_id, DebtTracker.user_id == user_id)
            ).first()
            
            if not debt:
                return False
            
            self.db.delete(debt)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting debt tracker: {e}")
            raise

    # Investment Management
    def get_investments(self, user_id: str) -> List[Investment]:
        """Get all investments for a user"""
        try:
            investments = self.db.query(Investment).filter(Investment.user_id == user_id).all()
            return investments
        except Exception as e:
            logger.error(f"Error fetching investments: {e}")
            raise

    def get_investment(self, investment_id: str, user_id: str) -> Optional[Investment]:
        """Get a specific investment"""
        try:
            investment = self.db.query(Investment).filter(
                and_(Investment.id == investment_id, Investment.user_id == user_id)
            ).first()
            return investment
        except Exception as e:
            logger.error(f"Error fetching investment: {e}")
            raise

    def create_investment(self, investment_data: InvestmentCreate, user_id: str) -> Investment:
        """Create a new investment"""
        try:
            db_investment = Investment(
                user_id=user_id,
                name=investment_data.name,
                symbol=investment_data.symbol,
                investment_type=investment_data.investment_type,
                purchase_price=investment_data.purchase_price,
                current_value=investment_data.current_value,
                quantity=investment_data.quantity,
                purchase_date=investment_data.purchase_date,
                sell_date=investment_data.sell_date,
                risk_level=investment_data.risk_level,
                status=investment_data.status,
                notes=investment_data.notes
            )
            
            self.db.add(db_investment)
            self.db.commit()
            self.db.refresh(db_investment)
            return db_investment
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating investment: {e}")
            raise

    def update_investment(self, investment_id: str, investment_data: InvestmentUpdate, user_id: str) -> Optional[Investment]:
        """Update an investment"""
        try:
            investment = self.db.query(Investment).filter(
                and_(Investment.id == investment_id, Investment.user_id == user_id)
            ).first()
            
            if not investment:
                return None
            
            for field, value in investment_data.dict(exclude_unset=True).items():
                setattr(investment, field, value)
            
            self.db.commit()
            self.db.refresh(investment)
            return investment
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating investment: {e}")
            raise

    def delete_investment(self, investment_id: str, user_id: str) -> bool:
        """Delete an investment"""
        try:
            investment = self.db.query(Investment).filter(
                and_(Investment.id == investment_id, Investment.user_id == user_id)
            ).first()
            
            if not investment:
                return False
            
            self.db.delete(investment)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting investment: {e}")
            raise

    # Analytics and Reports
    def get_financial_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive financial analytics"""
        try:
            # Get date range for analytics (last 12 months)
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=365)
            
            # Transaction analytics
            transactions = self.db.query(Transaction).filter(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.date >= start_date,
                    Transaction.date <= end_date
                )
            ).all()
            
            # Calculate spending by category
            spending_by_category = {}
            income_by_category = {}
            
            for transaction in transactions:
                if transaction.type == 'expense':
                    spending_by_category[transaction.category] = spending_by_category.get(transaction.category, 0) + transaction.amount
                elif transaction.type == 'income':
                    income_by_category[transaction.category] = income_by_category.get(transaction.category, 0) + transaction.amount
            
            # Monthly spending trends
            monthly_spending = {}
            for transaction in transactions:
                if transaction.type == 'expense':
                    month_key = transaction.date.strftime('%Y-%m')
                    monthly_spending[month_key] = monthly_spending.get(month_key, 0) + transaction.amount
            
            # Account balances
            accounts = self.get_bank_accounts(user_id)
            total_balance = sum(account.balance for account in accounts if account.is_active)
            
            # Budget performance
            budgets = self.get_budgets(user_id)
            budget_performance = []
            for budget in budgets:
                if budget.is_active:
                    spent = sum(t.amount for t in transactions if t.category == budget.category and t.type == 'expense')
                    performance = {
                        'budget_name': budget.name,
                        'budget_amount': budget.amount,
                        'spent': spent,
                        'remaining': budget.amount - spent,
                        'percentage_used': (spent / budget.amount * 100) if budget.amount > 0 else 0
                    }
                    budget_performance.append(performance)
            
            return {
                'total_balance': total_balance,
                'spending_by_category': spending_by_category,
                'income_by_category': income_by_category,
                'monthly_spending': monthly_spending,
                'budget_performance': budget_performance,
                'total_transactions': len(transactions),
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                }
            }
        except Exception as e:
            logger.error(f"Error generating financial analytics: {e}")
            raise

    def get_financial_reports(self, user_id: str, report_type: str = 'summary') -> Dict[str, Any]:
        """Generate financial reports"""
        try:
            if report_type == 'summary':
                return self._generate_summary_report(user_id)
            elif report_type == 'detailed':
                return self._generate_detailed_report(user_id)
            elif report_type == 'budget':
                return self._generate_budget_report(user_id)
            else:
                raise ValueError(f"Unknown report type: {report_type}")
        except Exception as e:
            logger.error(f"Error generating financial report: {e}")
            raise

    def _generate_summary_report(self, user_id: str) -> Dict[str, Any]:
        """Generate summary financial report"""
        accounts = self.get_bank_accounts(user_id)
        transactions = self.get_transactions(user_id, limit=1000)
        budgets = self.get_budgets(user_id)
        goals = self.get_financial_goals(user_id)
        debts = self.get_debt_trackers(user_id)
        investments = self.get_investments(user_id)
        
        total_balance = sum(account.balance for account in accounts if account.is_active)
        total_debt = sum(debt.current_balance for debt in debts if debt.status == 'active')
        total_investments = sum(inv.current_value for inv in investments if inv.status == 'active')
        
        recent_transactions = transactions[:10] if transactions else []
        
        return {
            'summary': {
                'total_balance': total_balance,
                'total_debt': total_debt,
                'total_investments': total_investments,
                'net_worth': total_balance + total_investments - total_debt,
                'active_accounts': len([a for a in accounts if a.is_active]),
                'active_budgets': len([b for b in budgets if b.is_active]),
                'active_goals': len([g for g in goals if g.status == 'active']),
                'active_debts': len([d for d in debts if d.status == 'active']),
                'active_investments': len([i for i in investments if i.status == 'active'])
            },
            'recent_transactions': recent_transactions,
            'generated_at': datetime.utcnow().isoformat()
        }

    def _generate_detailed_report(self, user_id: str) -> Dict[str, Any]:
        """Generate detailed financial report"""
        summary = self._generate_summary_report(user_id)
        
        # Add detailed analytics
        analytics = self.get_financial_analytics(user_id)
        
        return {
            **summary,
            'analytics': analytics,
            'report_type': 'detailed'
        }

    def _generate_budget_report(self, user_id: str) -> Dict[str, Any]:
        """Generate budget-specific report"""
        budgets = self.get_budgets(user_id)
        transactions = self.get_transactions(user_id, limit=1000)
        
        budget_reports = []
        for budget in budgets:
            if budget.is_active:
                # Calculate spending for this budget category
                spent = sum(
                    t.amount for t in transactions 
                    if t.category == budget.category and t.type == 'expense'
                )
                
                budget_reports.append({
                    'budget_name': budget.name,
                    'category': budget.category,
                    'budget_amount': budget.amount,
                    'spent': spent,
                    'remaining': budget.amount - spent,
                    'percentage_used': (spent / budget.amount * 100) if budget.amount > 0 else 0,
                    'status': 'over_budget' if spent > budget.amount else 'under_budget'
                })
        
        return {
            'budget_reports': budget_reports,
            'total_budgets': len(budgets),
            'active_budgets': len([b for b in budgets if b.is_active]),
            'generated_at': datetime.utcnow().isoformat(),
            'report_type': 'budget'
        }
