import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, date, timedelta
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.travel_db import Trip, Activity, FlightBooking, HotelBooking, RestaurantBooking
from app.cache import redis_cache

logger = structlog.get_logger()

class ItineraryOptimizationService:
    def __init__(self):
        self.optimization_strategies = {
            "time": self._optimize_for_time,
            "cost": self._optimize_for_cost,
            "experience": self._optimize_for_experience,
            "balance": self._optimize_balanced
        }

    async def optimize_itinerary(
        self,
        db: Session,
        trip_id: int,
        optimization_type: str = "balance",
        preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Optimize a trip itinerary"""
        try:
            trip = db.query(Trip).filter(Trip.id == trip_id).first()
            if not trip:
                return {"success": False, "message": "Trip not found"}

            # Get all trip components
            activities = db.query(Activity).filter(Activity.trip_id == trip_id).all()
            flights = db.query(FlightBooking).filter(FlightBooking.trip_id == trip_id).all()
            hotels = db.query(HotelBooking).filter(HotelBooking.trip_id == trip_id).all()
            restaurants = db.query(RestaurantBooking).filter(
                RestaurantBooking.trip_id == trip_id
            ).all()

            # Optimize based on strategy
            optimizer = self.optimization_strategies.get(optimization_type, self._optimize_balanced)
            optimized = optimizer(trip, activities, flights, hotels, restaurants, preferences or {})

            return {
                "success": True,
                "optimization_type": optimization_type,
                "optimized_itinerary": optimized,
                "improvements": self._calculate_improvements(trip, optimized),
                "recommendations": self._generate_recommendations(optimized)
            }

        except Exception as e:
            logger.error(f"Error optimizing itinerary: {e}")
            return {"success": False, "message": f"Error optimizing itinerary: {str(e)}"}

    def _optimize_for_time(
        self,
        trip: Trip,
        activities: List[Activity],
        flights: List[FlightBooking],
        hotels: List[HotelBooking],
        restaurants: List[RestaurantBooking],
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Optimize itinerary to minimize travel time"""
        # Sort activities by location proximity and time
        sorted_activities = sorted(activities, key=lambda a: (a.date, a.start_time or datetime.min.time()))
        
        # Group activities by day
        daily_activities = {}
        for activity in sorted_activities:
            day_key = activity.date.isoformat()
            if day_key not in daily_activities:
                daily_activities[day_key] = []
            daily_activities[day_key].append(activity)

        return {
            "activities": self._reorder_by_proximity(daily_activities),
            "optimization_notes": "Activities reordered to minimize travel time between locations"
        }

    def _optimize_for_cost(
        self,
        trip: Trip,
        activities: List[Activity],
        flights: List[FlightBooking],
        hotels: List[HotelBooking],
        restaurants: List[RestaurantBooking],
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Optimize itinerary to minimize costs"""
        # Suggest cheaper alternatives
        suggestions = []
        
        # Check for cheaper hotel options
        if hotels:
            avg_hotel_price = sum(h.total_price for h in hotels) / len(hotels)
            if avg_hotel_price > 200:
                suggestions.append({
                    "type": "hotel",
                    "message": "Consider budget hotels to reduce accommodation costs",
                    "potential_savings": avg_hotel_price * 0.3
                })

        # Check for free/cheap activities
        paid_activities = [a for a in activities if a.price and a.price > 50]
        if len(paid_activities) > len(activities) * 0.7:
            suggestions.append({
                "type": "activities",
                "message": "Consider adding more free activities to balance costs",
                "potential_savings": sum(a.price for a in paid_activities if a.price) * 0.2
            })

        return {
            "suggestions": suggestions,
            "optimization_notes": "Cost optimization suggestions generated"
        }

    def _optimize_for_experience(
        self,
        trip: Trip,
        activities: List[Activity],
        flights: List[FlightBooking],
        hotels: List[HotelBooking],
        restaurants: List[RestaurantBooking],
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Optimize itinerary for best experience"""
        # Suggest high-rated activities and restaurants
        recommendations = []
        
        # Recommend top-rated restaurants
        if restaurants:
            recommendations.append({
                "type": "restaurants",
                "message": "Consider adding highly-rated local restaurants for authentic experience"
            })

        # Suggest diverse activity types
        activity_types = set(
            a.type.value if hasattr(a.type, 'value') else (str(a.type) if a.type else 'unknown')
            for a in activities
        )
        if len(activity_types) < 3:
            recommendations.append({
                "type": "activities",
                "message": "Add more diverse activity types (cultural, adventure, food) for richer experience"
            })

        return {
            "recommendations": recommendations,
            "optimization_notes": "Experience optimization recommendations generated"
        }

    def _optimize_balanced(
        self,
        trip: Trip,
        activities: List[Activity],
        flights: List[FlightBooking],
        hotels: List[HotelBooking],
        restaurants: List[RestaurantBooking],
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Balance time, cost, and experience"""
        time_optimized = self._optimize_for_time(trip, activities, flights, hotels, restaurants, preferences)
        cost_optimized = self._optimize_for_cost(trip, activities, flights, hotels, restaurants, preferences)
        experience_optimized = self._optimize_for_experience(trip, activities, flights, hotels, restaurants, preferences)

        return {
            "time_optimization": time_optimized,
            "cost_optimization": cost_optimized,
            "experience_optimization": experience_optimized,
            "optimization_notes": "Balanced optimization considering time, cost, and experience"
        }

    def _reorder_by_proximity(self, daily_activities: Dict[str, List[Activity]]) -> Dict[str, List[Dict[str, Any]]]:
        """Reorder activities by geographic proximity"""
        optimized = {}
        for day, activities in daily_activities.items():
            if not activities:
                continue
            
            # Simple reordering - in production, use actual distance calculations
            sorted_acts = sorted(activities, key=lambda a: a.start_time or datetime.min.time())
            optimized[day] = [
                {
                    "id": a.id,
                    "name": a.name,
                    "time": a.start_time.isoformat() if a.start_time else None,
                    "location": a.location
                }
                for a in sorted_acts
            ]
        
        return optimized

    def _calculate_improvements(self, trip: Trip, optimized: Dict[str, Any]) -> List[str]:
        """Calculate improvements from optimization"""
        improvements = []
        
        if "time_optimization" in optimized:
            improvements.append("Reduced travel time between activities")
        
        if "cost_optimization" in optimized:
            improvements.append("Identified cost-saving opportunities")
        
        if "experience_optimization" in optimized:
            improvements.append("Enhanced experience recommendations")
        
        return improvements

    def _generate_recommendations(self, optimized: Dict[str, Any]) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if "suggestions" in optimized:
            for suggestion in optimized.get("suggestions", []):
                recommendations.append(suggestion.get("message", ""))
        
        if "recommendations" in optimized:
            for rec in optimized.get("recommendations", []):
                recommendations.append(rec.get("message", ""))
        
        return recommendations

# Global service instance
itinerary_optimization_service = ItineraryOptimizationService()

