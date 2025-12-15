"""
AI Investment Recommendations Service
Provides AI-powered investment recommendations and portfolio analysis
"""
import structlog
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import asyncio

from app.services.ai_service import ai_service
from app.services.langchain_service import langchain_service

logger = structlog.get_logger()

class AIInvestmentService:
    """Service for AI-powered investment recommendations"""
    
    def __init__(self):
        self.logger = logger
    
    async def generate_investment_recommendations(
        self,
        risk_tolerance: str,
        investment_amount: float,
        time_horizon: str,
        current_portfolio: Optional[List[Dict[str, Any]]] = None,
        user_preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate AI-powered investment recommendations
        
        Args:
            risk_tolerance: User's risk tolerance (conservative, moderate, aggressive)
            investment_amount: Amount to invest
            time_horizon: Investment time horizon (short, medium, long)
            current_portfolio: Current investment portfolio
            user_preferences: Additional user preferences
            
        Returns:
            Investment recommendations with allocations and reasoning
        """
        try:
            self.logger.info(f"Generating investment recommendations for risk: {risk_tolerance}, amount: {investment_amount}")
            
            # Prepare data for AI analysis
            investment_data = {
                "risk_tolerance": risk_tolerance,
                "investment_amount": investment_amount,
                "time_horizon": time_horizon,
                "current_portfolio": current_portfolio or [],
                "user_preferences": user_preferences or {},
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Use AI service for recommendations
            ai_prompt = f"""
            Generate personalized investment recommendations based on:
            - Risk Tolerance: {risk_tolerance}
            - Investment Amount: ${investment_amount:,.2f}
            - Time Horizon: {time_horizon}
            - Current Portfolio: {len(current_portfolio or [])} investments
            
            Provide:
            1. Recommended asset allocation (stocks, bonds, cash, alternatives)
            2. Specific investment recommendations with reasoning
            3. Expected returns and risk assessment
            4. Portfolio diversification strategy
            5. Rebalancing recommendations
            """
            
            ai_response = await ai_service.generate_response(ai_prompt, investment_data)
            
            # Generate structured recommendations
            recommendations = await self._generate_structured_recommendations(
                risk_tolerance,
                investment_amount,
                time_horizon,
                current_portfolio
            )
            
            # Calculate projected growth
            projected_growth = await self._calculate_projected_growth(
                investment_amount,
                recommendations["recommended_allocation"],
                time_horizon
            )
            
            return {
                "risk_tolerance": risk_tolerance,
                "investment_amount": investment_amount,
                "time_horizon": time_horizon,
                "recommended_allocation": recommendations["recommended_allocation"],
                "recommended_investments": recommendations["recommended_investments"],
                "ai_analysis": ai_response,
                "projected_growth": projected_growth,
                "diversification_score": recommendations["diversification_score"],
                "risk_assessment": recommendations["risk_assessment"],
                "rebalancing_recommendations": recommendations["rebalancing_recommendations"],
                "confidence": 0.88,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error generating investment recommendations: {e}")
            raise
    
    async def analyze_portfolio(
        self,
        portfolio: List[Dict[str, Any]],
        market_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analyze investment portfolio using AI
        
        Args:
            portfolio: List of investments
            market_data: Current market data
            
        Returns:
            Portfolio analysis with recommendations
        """
        try:
            total_value = sum(inv.get("total_value", 0) for inv in portfolio)
            total_cost = sum(inv.get("quantity", 0) * inv.get("purchase_price", 0) for inv in portfolio)
            total_gain_loss = total_value - total_cost
            
            # AI analysis
            portfolio_data = {
                "investments": portfolio,
                "total_value": total_value,
                "total_cost": total_cost,
                "total_gain_loss": total_gain_loss,
                "market_data": market_data or {}
            }
            
            ai_prompt = f"""
            Analyze this investment portfolio:
            - Total Value: ${total_value:,.2f}
            - Total Cost: ${total_cost:,.2f}
            - Gain/Loss: ${total_gain_loss:,.2f}
            - Number of Investments: {len(portfolio)}
            
            Provide:
            1. Portfolio performance analysis
            2. Risk assessment
            3. Diversification analysis
            4. Recommendations for optimization
            5. Rebalancing suggestions
            """
            
            ai_analysis = await ai_service.generate_response(ai_prompt, portfolio_data)
            
            return {
                "portfolio_summary": {
                    "total_value": total_value,
                    "total_cost": total_cost,
                    "total_gain_loss": total_gain_loss,
                    "gain_loss_percentage": (total_gain_loss / total_cost * 100) if total_cost > 0 else 0,
                    "investment_count": len(portfolio)
                },
                "asset_allocation": await self._calculate_asset_allocation(portfolio),
                "risk_analysis": await self._analyze_portfolio_risk(portfolio),
                "diversification_analysis": await self._analyze_diversification(portfolio),
                "ai_analysis": ai_analysis,
                "recommendations": await self._generate_portfolio_recommendations(portfolio),
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing portfolio: {e}")
            raise
    
    async def _generate_structured_recommendations(
        self,
        risk_tolerance: str,
        investment_amount: float,
        time_horizon: str,
        current_portfolio: Optional[List[Dict[str, Any]]]
    ) -> Dict[str, Any]:
        """Generate structured investment recommendations"""
        # Risk-based allocation
        allocations = {
            "conservative": {"stocks": 30, "bonds": 50, "cash": 20},
            "moderate": {"stocks": 60, "bonds": 30, "cash": 10},
            "aggressive": {"stocks": 80, "bonds": 15, "cash": 5}
        }
        
        allocation = allocations.get(risk_tolerance, allocations["moderate"])
        
        # Generate specific investment recommendations
        investments = [
            {
                "name": "S&P 500 Index Fund",
                "type": "ETF",
                "allocation_percentage": allocation["stocks"] * 0.6,
                "reasoning": "Diversified exposure to large-cap US stocks",
                "expected_return": 8.5,
                "risk_level": "medium"
            },
            {
                "name": "Total Bond Market Fund",
                "type": "ETF",
                "allocation_percentage": allocation["bonds"],
                "reasoning": "Stable income with lower volatility",
                "expected_return": 4.0,
                "risk_level": "low"
            },
            {
                "name": "International Stock Fund",
                "type": "ETF",
                "allocation_percentage": allocation["stocks"] * 0.3,
                "reasoning": "Geographic diversification",
                "expected_return": 7.5,
                "risk_level": "medium"
            },
            {
                "name": "High-Yield Savings",
                "type": "Cash",
                "allocation_percentage": allocation["cash"],
                "reasoning": "Emergency fund and liquidity",
                "expected_return": 4.5,
                "risk_level": "very_low"
            }
        ]
        
        return {
            "recommended_allocation": allocation,
            "recommended_investments": investments,
            "diversification_score": 0.85,
            "risk_assessment": {
                "overall_risk": risk_tolerance,
                "risk_score": 0.6 if risk_tolerance == "moderate" else (0.3 if risk_tolerance == "conservative" else 0.8),
                "volatility_estimate": "medium"
            },
            "rebalancing_recommendations": [
                "Review portfolio quarterly",
                "Rebalance when allocation drifts more than 5%",
                "Consider tax implications when rebalancing"
            ]
        }
    
    async def _calculate_projected_growth(
        self,
        initial_amount: float,
        allocation: Dict[str, float],
        time_horizon: str
    ) -> Dict[str, float]:
        """Calculate projected growth based on allocation"""
        # Expected returns by asset class
        expected_returns = {
            "stocks": 0.085,
            "bonds": 0.04,
            "cash": 0.045
        }
        
        # Calculate weighted average return
        weighted_return = (
            (allocation.get("stocks", 0) / 100) * expected_returns["stocks"] +
            (allocation.get("bonds", 0) / 100) * expected_returns["bonds"] +
            (allocation.get("cash", 0) / 100) * expected_returns["cash"]
        )
        
        # Time horizon multipliers
        horizon_multipliers = {
            "short": 1.2,
            "medium": 1.5,
            "long": 2.0
        }
        
        years = horizon_multipliers.get(time_horizon, 1.5)
        
        # Projected growth
        projected_5_years = initial_amount * ((1 + weighted_return) ** 5)
        projected_10_years = initial_amount * ((1 + weighted_return) ** 10)
        projected_20_years = initial_amount * ((1 + weighted_return) ** 20)
        
        return {
            "5_years": round(projected_5_years, 2),
            "10_years": round(projected_10_years, 2),
            "20_years": round(projected_20_years, 2),
            "expected_annual_return": round(weighted_return * 100, 2)
        }
    
    async def _calculate_asset_allocation(self, portfolio: List[Dict[str, Any]]) -> Dict[str, float]:
        """Calculate current asset allocation"""
        total_value = sum(inv.get("total_value", 0) for inv in portfolio)
        if total_value == 0:
            return {}
        
        allocation = {}
        for inv in portfolio:
            inv_type = inv.get("type", "other")
            inv_value = inv.get("total_value", 0)
            percentage = (inv_value / total_value) * 100
            
            if inv_type not in allocation:
                allocation[inv_type] = 0
            allocation[inv_type] += percentage
        
        return allocation
    
    async def _analyze_portfolio_risk(self, portfolio: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze portfolio risk"""
        # Simplified risk analysis
        risk_scores = {
            "stocks": 0.8,
            "bonds": 0.3,
            "etf": 0.6,
            "mutual_fund": 0.5,
            "crypto": 0.9,
            "other": 0.5
        }
        
        total_value = sum(inv.get("total_value", 0) for inv in portfolio)
        if total_value == 0:
            return {"overall_risk": "low", "risk_score": 0.3}
        
        weighted_risk = sum(
            (inv.get("total_value", 0) / total_value) * risk_scores.get(inv.get("type", "other"), 0.5)
            for inv in portfolio
        )
        
        if weighted_risk < 0.4:
            risk_level = "low"
        elif weighted_risk < 0.7:
            risk_level = "medium"
        else:
            risk_level = "high"
        
        return {
            "overall_risk": risk_level,
            "risk_score": round(weighted_risk, 2),
            "volatility_estimate": "low" if risk_level == "low" else ("medium" if risk_level == "medium" else "high")
        }
    
    async def _analyze_diversification(self, portfolio: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze portfolio diversification"""
        types = {}
        sectors = {}
        
        for inv in portfolio:
            inv_type = inv.get("type", "other")
            types[inv_type] = types.get(inv_type, 0) + 1
            
            sector = inv.get("sector", "other")
            sectors[sector] = sectors.get(sector, 0) + 1
        
        diversification_score = min(1.0, (len(types) / 5) * 0.5 + (len(sectors) / 10) * 0.5)
        
        return {
            "diversification_score": round(diversification_score, 2),
            "asset_types": len(types),
            "sectors": len(sectors),
            "recommendation": "Well diversified" if diversification_score > 0.7 else "Consider more diversification"
        }
    
    async def _generate_portfolio_recommendations(self, portfolio: List[Dict[str, Any]]) -> List[str]:
        """Generate portfolio optimization recommendations"""
        recommendations = []
        
        allocation = await self._calculate_asset_allocation(portfolio)
        risk = await self._analyze_portfolio_risk(portfolio)
        diversification = await self._analyze_diversification(portfolio)
        
        if diversification["diversification_score"] < 0.6:
            recommendations.append("Consider diversifying across more asset types and sectors")
        
        if risk["overall_risk"] == "high":
            recommendations.append("Consider adding more bonds to reduce portfolio risk")
        elif risk["overall_risk"] == "low":
            recommendations.append("Consider increasing stock allocation for higher growth potential")
        
        if len(portfolio) < 5:
            recommendations.append("Consider adding more investments for better diversification")
        
        return recommendations

# Global service instance
ai_investment_service = AIInvestmentService()

