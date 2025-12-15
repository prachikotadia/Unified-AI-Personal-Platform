"""
AI Debt Strategy Service
Provides AI-powered debt payoff strategies and optimization
"""
import structlog
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import asyncio

from app.services.ai_service import ai_service
from app.services.langchain_service import langchain_service

logger = structlog.get_logger()

class AIDebtService:
    """Service for AI-powered debt payoff strategies"""
    
    def __init__(self):
        self.logger = logger
    
    async def generate_debt_strategy(
        self,
        debts: List[Dict[str, Any]],
        monthly_budget: float,
        preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate AI-powered debt payoff strategy
        
        Args:
            debts: List of debt trackers
            monthly_budget: Available monthly budget for debt payments
            preferences: User preferences (strategy type, priorities, etc.)
            
        Returns:
            Optimized debt payoff strategy with timeline and savings
        """
        try:
            self.logger.info(f"Generating debt strategy for {len(debts)} debts")
            
            total_debt = sum(d.get("current_balance", 0) for d in debts)
            total_minimum = sum(d.get("minimum_payment", 0) for d in debts)
            
            if monthly_budget < total_minimum:
                raise ValueError("Monthly budget must be at least equal to total minimum payments")
            
            available_extra = monthly_budget - total_minimum
            
            # Prepare data for AI analysis
            debt_data = {
                "debts": debts,
                "total_debt": total_debt,
                "total_minimum_payments": total_minimum,
                "available_extra": available_extra,
                "monthly_budget": monthly_budget,
                "preferences": preferences or {},
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Use AI service for strategy generation
            ai_prompt = f"""
            Generate an optimized debt payoff strategy for:
            - Total Debt: ${total_debt:,.2f}
            - Total Minimum Payments: ${total_minimum:,.2f}
            - Available Extra: ${available_extra:,.2f}
            - Number of Debts: {len(debts)}
            
            Provide:
            1. Recommended payoff strategy (avalanche vs snowball)
            2. Payment plan with timeline
            3. Total interest savings
            4. Optimization recommendations
            5. Risk assessment
            """
            
            ai_analysis = await ai_service.generate_response(ai_prompt, debt_data)
            
            # Generate strategies
            avalanche_strategy = await self._generate_avalanche_strategy(debts, monthly_budget)
            snowball_strategy = await self._generate_snowball_strategy(debts, monthly_budget)
            
            # Compare strategies
            comparison = await self._compare_strategies(avalanche_strategy, snowball_strategy)
            
            # Recommend best strategy
            recommended_strategy = avalanche_strategy if comparison["avalanche_savings"] > comparison["snowball_savings"] else snowball_strategy
            
            return {
                "total_debt": total_debt,
                "total_minimum_payments": total_minimum,
                "available_extra": available_extra,
                "recommended_strategy": recommended_strategy["name"],
                "avalanche_strategy": avalanche_strategy,
                "snowball_strategy": snowball_strategy,
                "strategy_comparison": comparison,
                "ai_analysis": ai_analysis,
                "optimization_tips": await self._generate_optimization_tips(debts, monthly_budget),
                "risk_assessment": await self._assess_debt_risk(debts),
                "confidence": 0.90,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error generating debt strategy: {e}")
            raise
    
    async def calculate_payoff_timeline(
        self,
        debt_id: str,
        debt: Dict[str, Any],
        monthly_payment: float
    ) -> Dict[str, Any]:
        """
        Calculate detailed payoff timeline for a debt
        
        Args:
            debt_id: Debt ID
            debt: Debt details
            monthly_payment: Monthly payment amount
            
        Returns:
            Detailed payoff timeline with payment schedule
        """
        try:
            balance = debt.get("current_balance", 0)
            interest_rate = debt.get("interest_rate", 0) / 100 / 12  # Monthly rate
            minimum_payment = debt.get("minimum_payment", 0)
            
            if monthly_payment < minimum_payment:
                raise ValueError("Monthly payment must be at least the minimum payment")
            
            if monthly_payment <= balance * interest_rate:
                raise ValueError("Monthly payment must be greater than monthly interest")
            
            # Calculate payoff
            months = 0
            remaining_balance = balance
            total_interest = 0
            payment_schedule = []
            
            while remaining_balance > 0.01 and months < 600:  # Max 50 years
                monthly_interest = remaining_balance * interest_rate
                principal_payment = monthly_payment - monthly_interest
                
                if principal_payment > remaining_balance:
                    principal_payment = remaining_balance
                    monthly_payment = principal_payment + monthly_interest
                
                remaining_balance -= principal_payment
                total_interest += monthly_interest
                months += 1
                
                # Store payment details (first 12 months and last payment)
                if months <= 12 or remaining_balance < 0.01:
                    payment_schedule.append({
                        "month": months,
                        "balance": round(remaining_balance, 2),
                        "interest_paid": round(monthly_interest, 2),
                        "principal_paid": round(principal_payment, 2),
                        "total_payment": round(monthly_payment, 2)
                    })
            
            return {
                "debt_id": debt_id,
                "debt_name": debt.get("name", "Unknown"),
                "current_balance": balance,
                "monthly_payment": monthly_payment,
                "months_to_payoff": months,
                "years_to_payoff": round(months / 12, 1),
                "total_interest": round(total_interest, 2),
                "total_paid": round(monthly_payment * months, 2),
                "payment_schedule": payment_schedule,
                "calculated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating payoff timeline: {e}")
            raise
    
    async def _generate_avalanche_strategy(
        self,
        debts: List[Dict[str, Any]],
        monthly_budget: float
    ) -> Dict[str, Any]:
        """Generate debt avalanche strategy (highest interest first)"""
        sorted_debts = sorted(debts, key=lambda x: x.get("interest_rate", 0), reverse=True)
        
        total_minimum = sum(d.get("minimum_payment", 0) for d in debts)
        available_extra = monthly_budget - total_minimum
        
        payment_plan = []
        remaining_extra = available_extra
        total_interest_saved = 0
        months_to_freedom = 0
        
        for debt in sorted_debts:
            if remaining_extra <= 0:
                break
            
            extra_payment = min(remaining_extra, debt.get("current_balance", 0))
            total_payment = debt.get("minimum_payment", 0) + extra_payment
            
            # Calculate payoff time
            timeline = await self.calculate_payoff_timeline(
                debt.get("id", ""),
                debt,
                total_payment
            )
            
            payment_plan.append({
                "debt_name": debt.get("name", "Unknown"),
                "debt_id": debt.get("id", ""),
                "interest_rate": debt.get("interest_rate", 0),
                "current_balance": debt.get("current_balance", 0),
                "minimum_payment": debt.get("minimum_payment", 0),
                "extra_payment": extra_payment,
                "total_payment": total_payment,
                "months_to_payoff": timeline["months_to_payoff"],
                "interest_saved": timeline["total_interest"]
            })
            
            remaining_extra -= extra_payment
            total_interest_saved += timeline["total_interest"]
            months_to_freedom = max(months_to_freedom, timeline["months_to_payoff"])
        
        return {
            "name": "Debt Avalanche",
            "description": "Pay off debts with highest interest rates first to save the most money",
            "payment_plan": payment_plan,
            "total_interest_saved": round(total_interest_saved, 2),
            "months_to_freedom": months_to_freedom,
            "years_to_freedom": round(months_to_freedom / 12, 1),
            "reasoning": "Paying highest interest debts first minimizes total interest paid"
        }
    
    async def _generate_snowball_strategy(
        self,
        debts: List[Dict[str, Any]],
        monthly_budget: float
    ) -> Dict[str, Any]:
        """Generate debt snowball strategy (smallest balance first)"""
        sorted_debts = sorted(debts, key=lambda x: x.get("current_balance", 0))
        
        total_minimum = sum(d.get("minimum_payment", 0) for d in debts)
        available_extra = monthly_budget - total_minimum
        
        payment_plan = []
        remaining_extra = available_extra
        total_interest_saved = 0
        months_to_freedom = 0
        
        for debt in sorted_debts:
            if remaining_extra <= 0:
                break
            
            extra_payment = min(remaining_extra, debt.get("current_balance", 0))
            total_payment = debt.get("minimum_payment", 0) + extra_payment
            
            # Calculate payoff time
            timeline = await self.calculate_payoff_timeline(
                debt.get("id", ""),
                debt,
                total_payment
            )
            
            payment_plan.append({
                "debt_name": debt.get("name", "Unknown"),
                "debt_id": debt.get("id", ""),
                "current_balance": debt.get("current_balance", 0),
                "minimum_payment": debt.get("minimum_payment", 0),
                "extra_payment": extra_payment,
                "total_payment": total_payment,
                "months_to_payoff": timeline["months_to_payoff"],
                "interest_saved": timeline["total_interest"]
            })
            
            remaining_extra -= extra_payment
            total_interest_saved += timeline["total_interest"]
            months_to_freedom = max(months_to_freedom, timeline["months_to_payoff"])
        
        return {
            "name": "Debt Snowball",
            "description": "Pay off smallest debts first for quick wins and motivation",
            "payment_plan": payment_plan,
            "total_interest_saved": round(total_interest_saved, 2),
            "months_to_freedom": months_to_freedom,
            "years_to_freedom": round(months_to_freedom / 12, 1),
            "reasoning": "Paying smallest debts first provides psychological wins and momentum"
        }
    
    async def _compare_strategies(
        self,
        avalanche: Dict[str, Any],
        snowball: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Compare avalanche and snowball strategies"""
        avalanche_savings = avalanche.get("total_interest_saved", 0)
        snowball_savings = snowball.get("total_interest_saved", 0)
        
        savings_difference = avalanche_savings - snowball_savings
        
        return {
            "avalanche_savings": avalanche_savings,
            "snowball_savings": snowball_savings,
            "savings_difference": round(savings_difference, 2),
            "avalanche_months": avalanche.get("months_to_freedom", 0),
            "snowball_months": snowball.get("months_to_freedom", 0),
            "recommendation": "avalanche" if savings_difference > 0 else "snowball",
            "reasoning": "Avalanche saves more money" if savings_difference > 0 else "Snowball provides faster wins"
        }
    
    async def _generate_optimization_tips(
        self,
        debts: List[Dict[str, Any]],
        monthly_budget: float
    ) -> List[str]:
        """Generate optimization tips for debt payoff"""
        tips = []
        
        total_debt = sum(d.get("current_balance", 0) for d in debts)
        total_minimum = sum(d.get("minimum_payment", 0) for d in debts)
        debt_to_income_ratio = (total_minimum / monthly_budget * 100) if monthly_budget > 0 else 0
        
        if debt_to_income_ratio > 40:
            tips.append("Your debt-to-income ratio is high. Consider increasing income or reducing expenses.")
        
        high_interest_debts = [d for d in debts if d.get("interest_rate", 0) > 15]
        if high_interest_debts:
            tips.append(f"You have {len(high_interest_debts)} high-interest debt(s). Prioritize paying these off first.")
        
        if monthly_budget - total_minimum > 0:
            tips.append(f"You have ${monthly_budget - total_minimum:,.2f} extra per month. Apply this to your highest interest debt.")
        
        tips.append("Consider debt consolidation if you have multiple high-interest debts.")
        tips.append("Avoid taking on new debt while paying off existing debts.")
        tips.append("Set up automatic payments to avoid missed payments and late fees.")
        
        return tips
    
    async def _assess_debt_risk(self, debts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Assess overall debt risk"""
        total_debt = sum(d.get("current_balance", 0) for d in debts)
        total_minimum = sum(d.get("minimum_payment", 0) for d in debts)
        avg_interest_rate = sum(d.get("interest_rate", 0) for d in debts) / len(debts) if debts else 0
        
        risk_factors = []
        risk_score = 0
        
        if avg_interest_rate > 20:
            risk_factors.append("Very high average interest rate")
            risk_score += 0.3
        elif avg_interest_rate > 15:
            risk_factors.append("High average interest rate")
            risk_score += 0.2
        
        if total_debt > 50000:
            risk_factors.append("High total debt amount")
            risk_score += 0.2
        elif total_debt > 25000:
            risk_factors.append("Moderate total debt amount")
            risk_score += 0.1
        
        if len(debts) > 5:
            risk_factors.append("Many debt accounts")
            risk_score += 0.1
        
        if risk_score < 0.3:
            risk_level = "low"
        elif risk_score < 0.6:
            risk_level = "medium"
        else:
            risk_level = "high"
        
        return {
            "risk_level": risk_level,
            "risk_score": round(risk_score, 2),
            "risk_factors": risk_factors,
            "total_debt": total_debt,
            "average_interest_rate": round(avg_interest_rate, 2),
            "recommendations": [
                "Focus on high-interest debts first",
                "Consider debt consolidation if applicable",
                "Avoid taking on new debt"
            ]
        }

# Global service instance
ai_debt_service = AIDebtService()

