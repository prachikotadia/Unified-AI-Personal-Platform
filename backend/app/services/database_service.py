from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import structlog
from app.models_postgres import (
    User, FinanceAccount, FinanceTransaction, FitnessGoal, 
    AIInsight, TravelPlan, MarketplaceProduct, UserSession
)

logger = structlog.get_logger()

class DatabaseService:
    def __init__(self, db: Session):
        self.db = db

    # User operations
    def create_user(self, user_data: Dict[str, Any]) -> User:
        """Create a new user"""
        try:
            user = User(**user_data)
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            logger.info(f"Created user: {user.email}")
            return user
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating user: {e}")
            raise

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()

    def update_user(self, user_id: int, update_data: Dict[str, Any]) -> Optional[User]:
        """Update user"""
        try:
            user = self.get_user_by_id(user_id)
            if user:
                for key, value in update_data.items():
                    setattr(user, key, value)
                user.updated_at = datetime.utcnow()
                self.db.commit()
                self.db.refresh(user)
                logger.info(f"Updated user: {user.email}")
                return user
            return None
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating user: {e}")
            raise

    # Finance operations
    def create_finance_account(self, account_data: Dict[str, Any]) -> FinanceAccount:
        """Create a new finance account"""
        try:
            account = FinanceAccount(**account_data)
            self.db.add(account)
            self.db.commit()
            self.db.refresh(account)
            logger.info(f"Created finance account: {account.name}")
            return account
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating finance account: {e}")
            raise

    def get_user_finance_accounts(self, user_id: int) -> List[FinanceAccount]:
        """Get all finance accounts for a user"""
        return self.db.query(FinanceAccount).filter(
            FinanceAccount.user_id == user_id,
            FinanceAccount.is_active == True
        ).all()

    def create_finance_transaction(self, transaction_data: Dict[str, Any]) -> FinanceTransaction:
        """Create a new finance transaction"""
        try:
            transaction = FinanceTransaction(**transaction_data)
            self.db.add(transaction)
            self.db.commit()
            self.db.refresh(transaction)
            logger.info(f"Created finance transaction: {transaction.amount}")
            return transaction
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating finance transaction: {e}")
            raise

    def get_account_transactions(self, account_id: int, limit: int = 50) -> List[FinanceTransaction]:
        """Get transactions for an account"""
        return self.db.query(FinanceTransaction).filter(
            FinanceTransaction.account_id == account_id
        ).order_by(FinanceTransaction.date.desc()).limit(limit).all()

    # Fitness operations
    def create_fitness_goal(self, goal_data: Dict[str, Any]) -> FitnessGoal:
        """Create a new fitness goal"""
        try:
            goal = FitnessGoal(**goal_data)
            self.db.add(goal)
            self.db.commit()
            self.db.refresh(goal)
            logger.info(f"Created fitness goal: {goal.title}")
            return goal
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating fitness goal: {e}")
            raise

    def get_user_fitness_goals(self, user_id: int) -> List[FitnessGoal]:
        """Get all fitness goals for a user"""
        return self.db.query(FitnessGoal).filter(
            FitnessGoal.user_id == user_id
        ).all()

    def update_fitness_goal_progress(self, goal_id: int, current_value: float) -> Optional[FitnessGoal]:
        """Update fitness goal progress"""
        try:
            goal = self.db.query(FitnessGoal).filter(FitnessGoal.id == goal_id).first()
            if goal:
                goal.current_value = current_value
                goal.updated_at = datetime.utcnow()
                if goal.current_value >= goal.target_value:
                    goal.is_completed = True
                self.db.commit()
                self.db.refresh(goal)
                return goal
            return None
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating fitness goal: {e}")
            raise

    # AI Insights operations
    def create_ai_insight(self, insight_data: Dict[str, Any]) -> AIInsight:
        """Create a new AI insight"""
        try:
            insight = AIInsight(**insight_data)
            self.db.add(insight)
            self.db.commit()
            self.db.refresh(insight)
            logger.info(f"Created AI insight: {insight.title}")
            return insight
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating AI insight: {e}")
            raise

    def get_user_ai_insights(self, user_id: int, insight_type: Optional[str] = None, limit: int = 10) -> List[AIInsight]:
        """Get AI insights for a user"""
        query = self.db.query(AIInsight).filter(AIInsight.user_id == user_id)
        if insight_type:
            query = query.filter(AIInsight.insight_type == insight_type)
        return query.order_by(AIInsight.created_at.desc()).limit(limit).all()

    def mark_insight_as_read(self, insight_id: int) -> Optional[AIInsight]:
        """Mark an insight as read"""
        try:
            insight = self.db.query(AIInsight).filter(AIInsight.id == insight_id).first()
            if insight:
                insight.is_read = True
                self.db.commit()
                self.db.refresh(insight)
                return insight
            return None
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error marking insight as read: {e}")
            raise

    # Travel operations
    def create_travel_plan(self, plan_data: Dict[str, Any]) -> TravelPlan:
        """Create a new travel plan"""
        try:
            plan = TravelPlan(**plan_data)
            self.db.add(plan)
            self.db.commit()
            self.db.refresh(plan)
            logger.info(f"Created travel plan: {plan.destination}")
            return plan
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating travel plan: {e}")
            raise

    def get_user_travel_plans(self, user_id: int) -> List[TravelPlan]:
        """Get all travel plans for a user"""
        return self.db.query(TravelPlan).filter(
            TravelPlan.user_id == user_id
        ).order_by(TravelPlan.start_date.desc()).all()

    # Marketplace operations
    def create_marketplace_product(self, product_data: Dict[str, Any]) -> MarketplaceProduct:
        """Create a new marketplace product"""
        try:
            product = MarketplaceProduct(**product_data)
            self.db.add(product)
            self.db.commit()
            self.db.refresh(product)
            logger.info(f"Created marketplace product: {product.name}")
            return product
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating marketplace product: {e}")
            raise

    def get_marketplace_products(self, category: Optional[str] = None, limit: int = 50) -> List[MarketplaceProduct]:
        """Get marketplace products"""
        query = self.db.query(MarketplaceProduct).filter(MarketplaceProduct.is_active == True)
        if category:
            query = query.filter(MarketplaceProduct.category == category)
        return query.limit(limit).all()

    # Session operations
    def create_user_session(self, session_data: Dict[str, Any]) -> UserSession:
        """Create a new user session"""
        try:
            session = UserSession(**session_data)
            self.db.add(session)
            self.db.commit()
            self.db.refresh(session)
            return session
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating user session: {e}")
            raise

    def get_valid_session(self, session_token: str) -> Optional[UserSession]:
        """Get a valid session by token"""
        return self.db.query(UserSession).filter(
            and_(
                UserSession.session_token == session_token,
                UserSession.is_active == True,
                UserSession.expires_at > datetime.utcnow()
            )
        ).first()

    def invalidate_session(self, session_token: str) -> bool:
        """Invalidate a session"""
        try:
            session = self.db.query(UserSession).filter(
                UserSession.session_token == session_token
            ).first()
            if session:
                session.is_active = False
                self.db.commit()
                return True
            return False
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error invalidating session: {e}")
            raise

    # Analytics and reporting
    def get_user_financial_summary(self, user_id: int) -> Dict[str, Any]:
        """Get financial summary for a user"""
        accounts = self.get_user_finance_accounts(user_id)
        total_balance = sum(account.balance for account in accounts)
        
        # Get recent transactions
        recent_transactions = []
        for account in accounts:
            transactions = self.get_account_transactions(account.id, limit=10)
            recent_transactions.extend(transactions)
        
        return {
            "total_balance": total_balance,
            "account_count": len(accounts),
            "recent_transactions": len(recent_transactions)
        }

    def get_user_fitness_summary(self, user_id: int) -> Dict[str, Any]:
        """Get fitness summary for a user"""
        goals = self.get_user_fitness_goals(user_id)
        completed_goals = [goal for goal in goals if goal.is_completed]
        
        return {
            "total_goals": len(goals),
            "completed_goals": len(completed_goals),
            "completion_rate": len(completed_goals) / len(goals) if goals else 0
        }
