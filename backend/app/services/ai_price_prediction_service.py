import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, date, timedelta
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.travel_db import PriceAlert, FlightBooking
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

# LangChain service - optional
try:
    from app.services.langchain_service import langchain_service
except ImportError:
    langchain_service = None

class AIPricePredictionService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    async def predict_flight_price(
        self,
        db: Session,
        origin: str,
        destination: str,
        departure_date: date,
        return_date: Optional[date] = None,
        cabin_class: str = "economy"
    ) -> Dict[str, Any]:
        """Predict future flight prices using AI"""
        try:
            cache_key = f"price_prediction_{origin}_{destination}_{departure_date}_{cabin_class}"
            cached = await redis_cache.get_cache(cache_key)
            if cached:
                return cached

            # Get historical price data
            historical_prices = await self._get_historical_prices(
                db, origin, destination, departure_date
            )

            # Generate prediction
            if langchain_service:
                prediction = await self._predict_with_ai(
                    origin, destination, departure_date, return_date, cabin_class, historical_prices
                )
            else:
                prediction = self._generate_mock_prediction(
                    origin, destination, departure_date, return_date, cabin_class, historical_prices
                )

            await redis_cache.set_cache(cache_key, prediction, expire=3600)
            return prediction

        except Exception as e:
            logger.error(f"Error predicting flight price: {e}")
            return {"success": False, "message": f"Error predicting price: {str(e)}"}

    async def analyze_price_trends(
        self,
        db: Session,
        origin: str,
        destination: str,
        days_ahead: int = 90
    ) -> Dict[str, Any]:
        """Analyze price trends for a route"""
        try:
            # Get price history
            historical_prices = await self._get_historical_prices(
                db, origin, destination, date.today()
            )

            # Analyze trends
            trends = self._analyze_trends(historical_prices, days_ahead)

            return {
                "success": True,
                "route": f"{origin} to {destination}",
                "trends": trends,
                "recommendations": self._generate_trend_recommendations(trends)
            }

        except Exception as e:
            logger.error(f"Error analyzing price trends: {e}")
            return {"success": False, "message": f"Error analyzing trends: {str(e)}"}

    async def get_best_time_to_book(
        self,
        db: Session,
        origin: str,
        destination: str,
        departure_date: date
    ) -> Dict[str, Any]:
        """Determine the best time to book a flight"""
        try:
            days_until_departure = (departure_date - date.today()).days

            # Analyze historical booking patterns
            booking_patterns = await self._analyze_booking_patterns(
                db, origin, destination, departure_date
            )

            # Generate recommendation
            recommendation = self._generate_booking_recommendation(
                days_until_departure, booking_patterns
            )

            return {
                "success": True,
                "days_until_departure": days_until_departure,
                "recommendation": recommendation,
                "confidence": 0.82
            }

        except Exception as e:
            logger.error(f"Error determining best booking time: {e}")
            return {"success": False, "message": f"Error: {str(e)}"}

    async def _get_historical_prices(
        self,
        db: Session,
        origin: str,
        destination: str,
        departure_date: date
    ) -> List[Dict[str, Any]]:
        """Get historical price data"""
        # In production, fetch from price history database or external API
        # For now, generate mock historical data
        historical = []
        base_price = 300

        for i in range(30, 0, -1):
            check_date = departure_date - timedelta(days=i)
            price = base_price + (i % 7) * 20 - (i % 3) * 10
            historical.append({
                "date": check_date.isoformat(),
                "price": price,
                "source": "mock"
            })

        return historical

    async def _predict_with_ai(
        self,
        origin: str,
        destination: str,
        departure_date: date,
        return_date: Optional[date],
        cabin_class: str,
        historical_prices: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate price prediction using AI"""
        prompt = f"""
        Analyze flight price trends and predict the best price for:
        - Route: {origin} to {destination}
        - Departure: {departure_date}
        - Return: {return_date or 'One-way'}
        - Class: {cabin_class}
        
        Historical prices: {json.dumps(historical_prices[-7:])}
        
        Provide:
        1. Predicted price range
        2. Best time to buy
        3. Price trend (increasing/decreasing/stable)
        4. Confidence level
        """

        if langchain_service:
            response = await langchain_service.generate_response(prompt, {})
            return json.loads(response) if isinstance(response, str) else response
        else:
            return self._generate_mock_prediction(
                origin, destination, departure_date, return_date, cabin_class, historical_prices
            )

    def _generate_mock_prediction(
        self,
        origin: str,
        destination: str,
        departure_date: date,
        return_date: Optional[date],
        cabin_class: str,
        historical_prices: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate mock price prediction"""
        if not historical_prices:
            base_price = 400
        else:
            recent_prices = [p["price"] for p in historical_prices[-7:]]
            base_price = sum(recent_prices) / len(recent_prices)

        days_until = (departure_date - date.today()).days

        # Simple prediction model
        if days_until > 60:
            predicted_price = base_price * 0.9  # Cheaper if booking far in advance
            recommendation = "buy_now"
            trend = "decreasing"
        elif days_until > 30:
            predicted_price = base_price
            recommendation = "monitor"
            trend = "stable"
        else:
            predicted_price = base_price * 1.2  # More expensive if booking soon
            recommendation = "buy_now"
            trend = "increasing"

        return {
            "success": True,
            "predicted_price": round(predicted_price, 2),
            "price_range": {
                "min": round(predicted_price * 0.85, 2),
                "max": round(predicted_price * 1.15, 2)
            },
            "current_price": base_price,
            "trend": trend,
            "recommendation": recommendation,
            "confidence": 0.85,
            "best_time_to_buy": "within 2 weeks" if days_until > 14 else "now",
            "reasoning": f"Based on historical data, prices typically {'decrease' if trend == 'decreasing' else 'increase'} as departure date approaches for this route."
        }

    def _analyze_trends(
        self,
        historical_prices: List[Dict[str, Any]],
        days_ahead: int
    ) -> Dict[str, Any]:
        """Analyze price trends"""
        if not historical_prices:
            return {"trend": "unknown", "volatility": 0}

        prices = [p["price"] for p in historical_prices]
        avg_price = sum(prices) / len(prices)
        min_price = min(prices)
        max_price = max(prices)

        # Calculate volatility
        variance = sum((p - avg_price) ** 2 for p in prices) / len(prices)
        volatility = (variance ** 0.5) / avg_price

        # Determine trend
        if len(prices) >= 7:
            recent_avg = sum(prices[-7:]) / 7
            older_avg = sum(prices[:-7]) / (len(prices) - 7) if len(prices) > 7 else recent_avg
            if recent_avg < older_avg * 0.95:
                trend = "decreasing"
            elif recent_avg > older_avg * 1.05:
                trend = "increasing"
            else:
                trend = "stable"
        else:
            trend = "stable"

        return {
            "trend": trend,
            "average_price": round(avg_price, 2),
            "min_price": min_price,
            "max_price": max_price,
            "volatility": round(volatility, 3),
            "price_range": round(max_price - min_price, 2)
        }

    def _generate_trend_recommendations(self, trends: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on trends"""
        recommendations = []

        if trends.get("trend") == "decreasing":
            recommendations.append("Prices are trending down - consider waiting a few days")
        elif trends.get("trend") == "increasing":
            recommendations.append("Prices are rising - consider booking soon")

        if trends.get("volatility", 0) > 0.2:
            recommendations.append("High price volatility - set up price alerts")

        return recommendations

    async def _analyze_booking_patterns(
        self,
        db: Session,
        origin: str,
        destination: str,
        departure_date: date
    ) -> Dict[str, Any]:
        """Analyze historical booking patterns"""
        # In production, analyze actual booking data
        return {
            "optimal_booking_days": 45,  # Days before departure
            "price_drop_probability": 0.3,
            "price_increase_probability": 0.7
        }

    def _generate_booking_recommendation(
        self,
        days_until_departure: int,
        booking_patterns: Dict[str, Any]
    ) -> str:
        """Generate booking recommendation"""
        optimal_days = booking_patterns.get("optimal_booking_days", 45)

        if days_until_departure > optimal_days + 14:
            return f"Wait - optimal booking window is {optimal_days} days before departure"
        elif days_until_departure > optimal_days - 7:
            return "Good time to book - within optimal window"
        else:
            return "Book now - prices likely to increase"

# Global service instance
ai_price_prediction_service = AIPricePredictionService()

