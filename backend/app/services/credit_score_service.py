"""
Credit Score Calculation Service
Calculates and analyzes credit scores based on financial data
"""
import structlog
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import asyncio

logger = structlog.get_logger()

class CreditScoreService:
    """Service for calculating and analyzing credit scores"""
    
    def __init__(self):
        self.logger = logger
        
        # Credit score factors and weights (FICO model)
        self.factor_weights = {
            "payment_history": 0.35,      # 35% - Most important
            "credit_utilization": 0.30,   # 30% - Second most important
            "credit_history_length": 0.15, # 15%
            "credit_mix": 0.10,           # 10%
            "new_credit": 0.10            # 10%
        }
    
    async def calculate_credit_score(
        self,
        user_id: str,
        transactions: List[Dict[str, Any]],
        accounts: List[Dict[str, Any]],
        debts: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculate credit score based on financial data
        
        Args:
            user_id: User ID
            transactions: List of transactions
            accounts: List of bank accounts
            credit_cards: List of credit card accounts
            debts: List of debt trackers
            
        Returns:
            Calculated credit score with breakdown
        """
        try:
            self.logger.info(f"Calculating credit score for user {user_id}")
            
            # Extract credit card accounts
            credit_cards = [acc for acc in accounts if acc.get("account_type") == "credit_card"]
            
            # Calculate each factor
            payment_history_score = await self._calculate_payment_history(transactions, debts)
            utilization_score = await self._calculate_credit_utilization(credit_cards)
            history_length_score = await self._calculate_history_length(accounts, transactions)
            credit_mix_score = await self._calculate_credit_mix(accounts, debts)
            new_credit_score = await self._calculate_new_credit(accounts, transactions)
            
            # Calculate weighted score
            base_score = (
                payment_history_score * self.factor_weights["payment_history"] +
                utilization_score * self.factor_weights["credit_utilization"] +
                history_length_score * self.factor_weights["credit_history_length"] +
                credit_mix_score * self.factor_weights["credit_mix"] +
                new_credit_score * self.factor_weights["new_credit"]
            )
            
            # Normalize to 300-850 range
            credit_score = int(300 + (base_score * 550))
            credit_score = max(300, min(850, credit_score))
            
            # Determine score range
            score_range = self._get_score_range(credit_score)
            
            # Calculate trend
            trend = await self._calculate_trend(user_id, credit_score)
            
            # Generate factors impact
            factors_impact = {
                "payment_history": self._get_impact_status(payment_history_score),
                "credit_utilization": self._get_impact_status(utilization_score),
                "credit_history_length": self._get_impact_status(history_length_score),
                "credit_mix": self._get_impact_status(credit_mix_score),
                "new_credit": self._get_impact_status(new_credit_score)
            }
            
            # Generate improvement tips
            improvement_tips = await self._generate_improvement_tips(
                payment_history_score,
                utilization_score,
                history_length_score,
                credit_mix_score,
                new_credit_score
            )
            
            return {
                "score": credit_score,
                "range": score_range,
                "trend": trend,
                "factors": {
                    "payment_history": {
                        "score": round(payment_history_score * 100, 0),
                        "weight": self.factor_weights["payment_history"],
                        "impact": factors_impact["payment_history"]
                    },
                    "credit_utilization": {
                        "score": round(utilization_score * 100, 0),
                        "weight": self.factor_weights["credit_utilization"],
                        "impact": factors_impact["credit_utilization"]
                    },
                    "credit_history_length": {
                        "score": round(history_length_score * 100, 0),
                        "weight": self.factor_weights["credit_history_length"],
                        "impact": factors_impact["credit_history_length"]
                    },
                    "credit_mix": {
                        "score": round(credit_mix_score * 100, 0),
                        "weight": self.factor_weights["credit_mix"],
                        "impact": factors_impact["credit_mix"]
                    },
                    "new_credit": {
                        "score": round(new_credit_score * 100, 0),
                        "weight": self.factor_weights["new_credit"],
                        "impact": factors_impact["new_credit"]
                    }
                },
                "factors_impact": factors_impact,
                "improvement_tips": improvement_tips,
                "calculated_at": datetime.utcnow().isoformat(),
                "next_update": (datetime.utcnow() + timedelta(days=30)).isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating credit score: {e}")
            raise
    
    async def _calculate_payment_history(
        self,
        transactions: List[Dict[str, Any]],
        debts: List[Dict[str, Any]]
    ) -> float:
        """Calculate payment history score (0-1)"""
        # Check for late payments in transactions
        late_payments = 0
        total_payments = 0
        
        # Analyze debt payment history
        for debt in debts:
            payment_history = debt.get("payment_history", [])
            if payment_history:
                total_payments += len(payment_history)
                late_payments += sum(1 for p in payment_history if p.get("late", False))
        
        # If no payment history, assume good (for new users)
        if total_payments == 0:
            return 0.9
        
        on_time_rate = 1 - (late_payments / total_payments)
        return max(0, min(1, on_time_rate))
    
    async def _calculate_credit_utilization(
        self,
        credit_cards: List[Dict[str, Any]]
    ) -> float:
        """Calculate credit utilization score (0-1)"""
        if not credit_cards:
            return 0.5  # Neutral if no credit cards
        
        total_balance = sum(acc.get("balance", 0) for acc in credit_cards)
        total_limit = sum(acc.get("credit_limit", 0) for acc in credit_cards)
        
        if total_limit == 0:
            return 0.5
        
        utilization_rate = total_balance / total_limit
        
        # Optimal utilization is below 30%
        if utilization_rate <= 0.30:
            return 1.0
        elif utilization_rate <= 0.50:
            return 0.8
        elif utilization_rate <= 0.70:
            return 0.6
        elif utilization_rate <= 0.90:
            return 0.4
        else:
            return 0.2
    
    async def _calculate_history_length(
        self,
        accounts: List[Dict[str, Any]],
        transactions: List[Dict[str, Any]]
    ) -> float:
        """Calculate credit history length score (0-1)"""
        if not accounts and not transactions:
            return 0.3  # New user
        
        # Find oldest account or transaction
        oldest_date = None
        
        for acc in accounts:
            created_at = acc.get("created_at")
            if created_at:
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                if oldest_date is None or created_at < oldest_date:
                    oldest_date = created_at
        
        for txn in transactions:
            txn_date = txn.get("date") or txn.get("created_at")
            if txn_date:
                if isinstance(txn_date, str):
                    txn_date = datetime.fromisoformat(txn_date.replace('Z', '+00:00'))
                if oldest_date is None or txn_date < oldest_date:
                    oldest_date = txn_date
        
        if oldest_date is None:
            return 0.3
        
        # Calculate age in years
        age_years = (datetime.utcnow() - oldest_date).days / 365.25
        
        # Score based on age
        if age_years >= 7:
            return 1.0
        elif age_years >= 5:
            return 0.9
        elif age_years >= 3:
            return 0.7
        elif age_years >= 1:
            return 0.5
        else:
            return 0.3
    
    async def _calculate_credit_mix(
        self,
        accounts: List[Dict[str, Any]],
        debts: List[Dict[str, Any]]
    ) -> float:
        """Calculate credit mix score (0-1)"""
        account_types = set()
        
        for acc in accounts:
            acc_type = acc.get("account_type", "")
            if acc_type:
                account_types.add(acc_type)
        
        for debt in debts:
            debt_type = debt.get("type", "")
            if debt_type:
                account_types.add(debt_type)
        
        # More diverse credit mix is better
        if len(account_types) >= 4:
            return 1.0
        elif len(account_types) >= 3:
            return 0.8
        elif len(account_types) >= 2:
            return 0.6
        elif len(account_types) >= 1:
            return 0.4
        else:
            return 0.2
    
    async def _calculate_new_credit(
        self,
        accounts: List[Dict[str, Any]],
        transactions: List[Dict[str, Any]]
    ) -> float:
        """Calculate new credit score (0-1)"""
        # Count new accounts opened in last 2 years
        two_years_ago = datetime.utcnow() - timedelta(days=730)
        new_accounts = 0
        
        for acc in accounts:
            created_at = acc.get("created_at")
            if created_at:
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                if created_at >= two_years_ago:
                    new_accounts += 1
        
        # Too many new accounts is negative
        if new_accounts == 0:
            return 1.0
        elif new_accounts == 1:
            return 0.9
        elif new_accounts == 2:
            return 0.7
        elif new_accounts == 3:
            return 0.5
        else:
            return 0.3
    
    def _get_score_range(self, score: int) -> str:
        """Get credit score range category"""
        if score >= 800:
            return "excellent"
        elif score >= 740:
            return "very_good"
        elif score >= 670:
            return "good"
        elif score >= 580:
            return "fair"
        else:
            return "poor"
    
    async def _calculate_trend(self, user_id: str, current_score: int) -> str:
        """Calculate credit score trend"""
        # In real app, this would compare with historical scores
        # For now, return stable
        return "stable"
    
    def _get_impact_status(self, score: float) -> str:
        """Get impact status based on score"""
        if score >= 0.8:
            return "positive"
        elif score >= 0.5:
            return "neutral"
        else:
            return "negative"
    
    async def _generate_improvement_tips(
        self,
        payment_history: float,
        utilization: float,
        history_length: float,
        credit_mix: float,
        new_credit: float
    ) -> List[str]:
        """Generate improvement tips based on factor scores"""
        tips = []
        
        if payment_history < 0.8:
            tips.append("Make all payments on time. Payment history is the most important factor.")
        
        if utilization < 0.7:
            tips.append("Keep credit utilization below 30%. Pay down credit card balances.")
        
        if history_length < 0.5:
            tips.append("Keep old accounts open to maintain credit history length.")
        
        if credit_mix < 0.6:
            tips.append("Consider diversifying your credit mix with different types of accounts.")
        
        if new_credit < 0.7:
            tips.append("Avoid opening too many new credit accounts in a short period.")
        
        if not tips:
            tips.append("Your credit factors are in good shape. Continue maintaining good credit habits.")
        
        return tips

# Global service instance
credit_score_service = CreditScoreService()

