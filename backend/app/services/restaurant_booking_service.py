import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, date, time
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.travel_db import RestaurantBooking, Trip, BookingStatus
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class RestaurantBookingService:
    def __init__(self):
        self.booking_providers = {
            "opentable": os.getenv("OPENTABLE_API_KEY"),
            "resy": os.getenv("RESY_API_KEY")
        }

    async def search_restaurants(
        self,
        db: Session,
        destination: str,
        cuisine_type: Optional[str] = None,
        price_range: Optional[str] = None,
        rating: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """Search for restaurants"""
        try:
            cache_key = f"restaurant_search_{destination}_{cuisine_type}_{price_range}"
            cached_results = await redis_cache.get_cache(cache_key)
            if cached_results:
                return cached_results

            restaurants = self._generate_mock_restaurants(destination, cuisine_type, price_range, rating)
            await redis_cache.set_cache(cache_key, restaurants, expire=1800)
            return restaurants

        except Exception as e:
            logger.error(f"Error searching restaurants: {e}")
            return []

    async def book_restaurant(
        self,
        db: Session,
        user_id: int,
        trip_id: int,
        restaurant_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Make a restaurant reservation"""
        try:
            trip = db.query(Trip).filter(
                and_(Trip.id == trip_id, Trip.user_id == user_id)
            ).first()
            if not trip:
                return {"success": False, "message": "Trip not found"}

            restaurant_booking = RestaurantBooking(
                trip_id=trip_id,
                restaurant_name=restaurant_data.get("restaurant_name"),
                cuisine_type=restaurant_data.get("cuisine_type"),
                address=restaurant_data.get("address"),
                city=restaurant_data.get("city"),
                country=restaurant_data.get("country"),
                reservation_date=restaurant_data.get("reservation_date"),
                reservation_time=restaurant_data.get("reservation_time"),
                party_size=restaurant_data.get("party_size", 2),
                price_estimate=restaurant_data.get("price_estimate"),
                currency=restaurant_data.get("currency", "USD"),
                booking_reference=self._generate_booking_reference(),
                special_requests=restaurant_data.get("special_requests"),
                dietary_restrictions=restaurant_data.get("dietary_restrictions", []),
                contact_info=restaurant_data.get("contact_info", {}),
                status=BookingStatus.pending
            )

            db.add(restaurant_booking)
            db.commit()
            db.refresh(restaurant_booking)

            await asyncio.sleep(0.5)
            restaurant_booking.status = BookingStatus.confirmed
            restaurant_booking.confirmation_number = self._generate_confirmation_number()
            db.commit()

            return {
                "success": True,
                "booking_id": restaurant_booking.id,
                "booking_reference": restaurant_booking.booking_reference,
                "confirmation_number": restaurant_booking.confirmation_number,
                "status": restaurant_booking.status.value
            }

        except Exception as e:
            logger.error(f"Error booking restaurant: {e}")
            db.rollback()
            return {"success": False, "message": f"Error booking restaurant: {str(e)}"}

    async def cancel_restaurant_booking(
        self,
        db: Session,
        user_id: int,
        booking_id: int
    ) -> Dict[str, Any]:
        """Cancel a restaurant reservation"""
        try:
            booking = db.query(RestaurantBooking).join(Trip).filter(
                and_(
                    RestaurantBooking.id == booking_id,
                    Trip.user_id == user_id
                )
            ).first()

            if not booking:
                return {"success": False, "message": "Booking not found"}

            booking.status = BookingStatus.cancelled
            db.commit()

            return {"success": True, "message": "Restaurant reservation cancelled"}

        except Exception as e:
            logger.error(f"Error cancelling restaurant booking: {e}")
            db.rollback()
            return {"success": False, "message": f"Error cancelling booking: {str(e)}"}

    def _generate_mock_restaurants(
        self,
        destination: str,
        cuisine_type: Optional[str],
        price_range: Optional[str],
        rating: Optional[float]
    ) -> List[Dict[str, Any]]:
        """Generate mock restaurant search results"""
        restaurants = []
        cuisines = ["Italian", "French", "Japanese", "Mexican", "American"]
        names = [
            "Bella Vista", "Le Jardin", "Sakura Sushi", "El Fuego", "The Grill House"
        ]

        for i, name in enumerate(names):
            restaurant = {
                "id": f"restaurant_{i+1}",
                "name": name,
                "cuisine_type": cuisines[i],
                "address": f"{i+1} Restaurant Row",
                "city": destination,
                "country": "USA",
                "rating": 4.0 + (i * 0.2),
                "price_range": "$" * (2 + (i % 2)),
                "available_times": ["18:00", "19:00", "20:00", "21:00"]
            }
            restaurants.append(restaurant)

        return restaurants

    def _generate_booking_reference(self) -> str:
        import uuid
        return f"RB-{uuid.uuid4().hex[:8].upper()}"

    def _generate_confirmation_number(self) -> str:
        import uuid
        return f"RCNF-{uuid.uuid4().hex[:12].upper()}"

# Global service instance
restaurant_booking_service = RestaurantBookingService()

