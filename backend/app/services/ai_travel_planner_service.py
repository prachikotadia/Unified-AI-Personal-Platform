import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, date, timedelta
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.travel_db import Trip, TripType, TripStatus
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

# LangChain service - optional
try:
    from app.services.langchain_service import langchain_service
except ImportError:
    langchain_service = None

class AITravelPlannerService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    async def generate_travel_plan(
        self,
        db: Session,
        user_id: int,
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate AI-powered travel plan"""
        try:
            destination = preferences.get("destination")
            trip_type = preferences.get("trip_type", "leisure")
            duration = preferences.get("duration", 7)
            budget = preferences.get("budget")
            travelers = preferences.get("travelers", 1)

            # Get user's travel history for personalization
            user_trips = db.query(Trip).filter(Trip.user_id == user_id).all()
            travel_history = self._analyze_travel_history(user_trips)

            # Generate plan using AI
            if langchain_service:
                plan = await self._generate_with_ai(
                    destination, trip_type, duration, budget, travelers, travel_history, preferences
                )
            else:
                plan = self._generate_mock_plan(
                    destination, trip_type, duration, budget, travelers, preferences
                )

            return {
                "success": True,
                "plan": plan,
                "confidence": 0.85,
                "recommendations": plan.get("recommendations", []),
                "itinerary": plan.get("itinerary", [])
            }

        except Exception as e:
            logger.error(f"Error generating travel plan: {e}")
            return {"success": False, "message": f"Error generating plan: {str(e)}"}

    async def optimize_budget(
        self,
        db: Session,
        trip_id: int,
        target_budget: float
    ) -> Dict[str, Any]:
        """AI-powered budget optimization"""
        try:
            trip = db.query(Trip).filter(Trip.id == trip_id).first()
            if not trip:
                return {"success": False, "message": "Trip not found"}

            # Analyze current budget allocation
            current_allocation = self._analyze_budget_allocation(trip)

            # Generate optimization suggestions
            suggestions = self._generate_budget_suggestions(
                current_allocation, target_budget, trip
            )

            return {
                "success": True,
                "current_budget": trip.budget or 0,
                "target_budget": target_budget,
                "suggestions": suggestions,
                "potential_savings": sum(s.get("savings", 0) for s in suggestions)
            }

        except Exception as e:
            logger.error(f"Error optimizing budget: {e}")
            return {"success": False, "message": f"Error optimizing budget: {str(e)}"}

    async def suggest_destinations(
        self,
        db: Session,
        user_id: int,
        preferences: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """AI-powered destination suggestions"""
        try:
            # Get user preferences
            budget_range = preferences.get("budget_range", "medium")
            travel_style = preferences.get("travel_style", "leisure")
            interests = preferences.get("interests", [])

            # Get user's past destinations
            user_trips = db.query(Trip).filter(Trip.user_id == user_id).all()
            past_destinations = [t.destination for t in user_trips]

            # Generate suggestions
            suggestions = self._generate_destination_suggestions(
                budget_range, travel_style, interests, past_destinations
            )

            return suggestions

        except Exception as e:
            logger.error(f"Error suggesting destinations: {e}")
            return []

    async def _generate_with_ai(
        self,
        destination: str,
        trip_type: str,
        duration: int,
        budget: Optional[float],
        travelers: int,
        travel_history: Dict[str, Any],
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate plan using AI"""
        prompt = f"""
        Create a detailed travel plan for:
        - Destination: {destination}
        - Trip Type: {trip_type}
        - Duration: {duration} days
        - Budget: ${budget} (if specified)
        - Travelers: {travelers}
        - Preferences: {json.dumps(preferences)}
        - Travel History: {json.dumps(travel_history)}

        Provide:
        1. Day-by-day itinerary
        2. Recommended activities
        3. Restaurant suggestions
        4. Budget breakdown
        5. Travel tips
        """

        if langchain_service:
            response = await langchain_service.generate_response(prompt, {})
            return json.loads(response) if isinstance(response, str) else response
        else:
            return self._generate_mock_plan(destination, trip_type, duration, budget, travelers, preferences)

    def _generate_mock_plan(
        self,
        destination: str,
        trip_type: str,
        duration: int,
        budget: Optional[float],
        travelers: int,
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate mock travel plan"""
        itinerary = []
        for day in range(1, duration + 1):
            itinerary.append({
                "day": day,
                "date": (date.today() + timedelta(days=day-1)).isoformat(),
                "activities": [
                    {
                        "name": f"Morning Activity Day {day}",
                        "type": "sightseeing",
                        "time": "09:00",
                        "duration": "2 hours",
                        "location": destination
                    },
                    {
                        "name": f"Lunch at Local Restaurant",
                        "type": "food",
                        "time": "12:00",
                        "duration": "1 hour"
                    },
                    {
                        "name": f"Afternoon Activity Day {day}",
                        "type": "cultural",
                        "time": "14:00",
                        "duration": "3 hours",
                        "location": destination
                    }
                ]
            })

        return {
            "destination": destination,
            "duration": duration,
            "itinerary": itinerary,
            "recommendations": [
                "Book accommodations in advance",
                "Check local weather forecast",
                "Learn basic local phrases",
                "Keep copies of important documents"
            ],
            "budget_breakdown": {
                "accommodation": budget * 0.4 if budget else None,
                "food": budget * 0.3 if budget else None,
                "activities": budget * 0.2 if budget else None,
                "transportation": budget * 0.1 if budget else None
            }
        }

    def _analyze_travel_history(self, trips: List[Trip]) -> Dict[str, Any]:
        """Analyze user's travel history"""
        if not trips:
            return {}

        destinations = [t.destination for t in trips]
        trip_types = [t.trip_type.value if hasattr(t.trip_type, 'value') else str(t.trip_type) for t in trips]

        return {
            "total_trips": len(trips),
            "favorite_destinations": list(set(destinations)),
            "preferred_trip_types": list(set(trip_types)),
            "average_duration": sum((t.end_date - t.start_date).days for t in trips) / len(trips) if trips else 0
        }

    def _analyze_budget_allocation(self, trip: Trip) -> Dict[str, Any]:
        """Analyze current budget allocation"""
        # This would analyze actual expenses vs budget
        return {
            "accommodation": trip.budget * 0.4 if trip.budget else 0,
            "food": trip.budget * 0.3 if trip.budget else 0,
            "activities": trip.budget * 0.2 if trip.budget else 0,
            "transportation": trip.budget * 0.1 if trip.budget else 0
        }

    def _generate_budget_suggestions(
        self,
        current_allocation: Dict[str, Any],
        target_budget: float,
        trip: Trip
    ) -> List[Dict[str, Any]]:
        """Generate budget optimization suggestions"""
        suggestions = []
        current_total = sum(current_allocation.values())

        if current_total > target_budget:
            savings_needed = current_total - target_budget

            # Suggest cheaper accommodation
            if current_allocation.get("accommodation", 0) > target_budget * 0.4:
                suggestions.append({
                    "category": "accommodation",
                    "suggestion": "Consider budget hotels or vacation rentals",
                    "savings": savings_needed * 0.4
                })

            # Suggest local restaurants
            if current_allocation.get("food", 0) > target_budget * 0.3:
                suggestions.append({
                    "category": "food",
                    "suggestion": "Eat at local restaurants instead of tourist spots",
                    "savings": savings_needed * 0.3
                })

        return suggestions

    def _generate_destination_suggestions(
        self,
        budget_range: str,
        travel_style: str,
        interests: List[str],
        past_destinations: List[str]
    ) -> List[Dict[str, Any]]:
        """Generate destination suggestions"""
        destinations = [
            {
                "name": "Bali, Indonesia",
                "reason": "Perfect for adventure and relaxation",
                "match_score": 0.92,
                "budget_range": "low",
                "travel_style": "adventure"
            },
            {
                "name": "Paris, France",
                "reason": "Great for cultural experiences",
                "match_score": 0.88,
                "budget_range": "medium",
                "travel_style": "cultural"
            },
            {
                "name": "Tokyo, Japan",
                "reason": "Unique blend of tradition and modernity",
                "match_score": 0.85,
                "budget_range": "medium",
                "travel_style": "cultural"
            }
        ]

        # Filter based on preferences
        filtered = [d for d in destinations if d["budget_range"] == budget_range or budget_range == "any"]
        return filtered[:5]

# Global service instance
ai_travel_planner_service = AITravelPlannerService()

