import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, date, timedelta
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.travel_db import HotelBooking, Trip, BookingStatus
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class HotelBookingService:
    def __init__(self):
        self.booking_providers = {
            "booking_com": os.getenv("BOOKING_COM_API_KEY"),
            "expedia": os.getenv("EXPEDIA_API_KEY"),
            "hotels_com": os.getenv("HOTELS_COM_API_KEY")
        }

    async def search_hotels(
        self,
        db: Session,
        destination: str,
        check_in: date,
        check_out: date,
        rooms: int = 1,
        adults: int = 1,
        children: int = 0,
        rating: Optional[int] = None,
        max_price: Optional[float] = None,
        amenities: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Search for available hotels"""
        try:
            cache_key = f"hotel_search_{destination}_{check_in}_{check_out}_{rooms}_{adults}"
            cached_results = await redis_cache.get_cache(cache_key)
            if cached_results:
                return cached_results

            # Mock hotel search results
            hotels = self._generate_mock_hotels(
                destination, check_in, check_out, rooms, adults, children,
                rating, max_price, amenities or []
            )

            await redis_cache.set_cache(cache_key, hotels, expire=3600)
            return hotels

        except Exception as e:
            logger.error(f"Error searching hotels: {e}")
            return []

    async def book_hotel(
        self,
        db: Session,
        user_id: int,
        trip_id: int,
        hotel_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Book a hotel"""
        try:
            trip = db.query(Trip).filter(
                and_(Trip.id == trip_id, Trip.user_id == user_id)
            ).first()
            if not trip:
                return {"success": False, "message": "Trip not found"}

            # Calculate total price
            nights = (hotel_data.get("check_out") - hotel_data.get("check_in")).days
            total_price = hotel_data.get("price_per_night", 0) * nights * hotel_data.get("rooms", 1)

            hotel_booking = HotelBooking(
                trip_id=trip_id,
                hotel_name=hotel_data.get("hotel_name"),
                address=hotel_data.get("address"),
                city=hotel_data.get("city"),
                country=hotel_data.get("country"),
                rating=hotel_data.get("rating"),
                check_in=hotel_data.get("check_in"),
                check_out=hotel_data.get("check_out"),
                rooms=hotel_data.get("rooms", 1),
                room_type=hotel_data.get("room_type"),
                price_per_night=hotel_data.get("price_per_night"),
                total_price=total_price,
                currency=hotel_data.get("currency", "USD"),
                amenities=hotel_data.get("amenities", []),
                booking_reference=self._generate_booking_reference(),
                guest_info=hotel_data.get("guest_info", {}),
                special_requests=hotel_data.get("special_requests"),
                cancellation_policy=hotel_data.get("cancellation_policy"),
                status=BookingStatus.pending
            )

            db.add(hotel_booking)
            db.commit()
            db.refresh(hotel_booking)

            # Simulate booking confirmation
            await asyncio.sleep(1)
            hotel_booking.status = BookingStatus.confirmed
            hotel_booking.confirmation_number = self._generate_confirmation_number()
            db.commit()

            return {
                "success": True,
                "booking_id": hotel_booking.id,
                "booking_reference": hotel_booking.booking_reference,
                "confirmation_number": hotel_booking.confirmation_number,
                "status": hotel_booking.status.value
            }

        except Exception as e:
            logger.error(f"Error booking hotel: {e}")
            db.rollback()
            return {"success": False, "message": f"Error booking hotel: {str(e)}"}

    async def cancel_hotel_booking(
        self,
        db: Session,
        user_id: int,
        booking_id: int
    ) -> Dict[str, Any]:
        """Cancel a hotel booking"""
        try:
            booking = db.query(HotelBooking).join(Trip).filter(
                and_(
                    HotelBooking.id == booking_id,
                    Trip.user_id == user_id
                )
            ).first()

            if not booking:
                return {"success": False, "message": "Booking not found"}

            if booking.status == BookingStatus.cancelled:
                return {"success": False, "message": "Booking already cancelled"}

            booking.status = BookingStatus.cancelled
            db.commit()

            return {
                "success": True,
                "message": "Hotel booking cancelled",
                "refund_eligible": self._check_refund_eligibility(booking)
            }

        except Exception as e:
            logger.error(f"Error cancelling hotel booking: {e}")
            db.rollback()
            return {"success": False, "message": f"Error cancelling booking: {str(e)}"}

    def _generate_mock_hotels(
        self,
        destination: str,
        check_in: date,
        check_out: date,
        rooms: int,
        adults: int,
        children: int,
        rating: Optional[int],
        max_price: Optional[float],
        amenities: List[str]
    ) -> List[Dict[str, Any]]:
        """Generate mock hotel search results"""
        hotels = []
        hotel_names = [
            "Grand Plaza Hotel", "Oceanview Resort", "City Center Inn",
            "Mountain Lodge", "Riverside Suites"
        ]

        for i, name in enumerate(hotel_names):
            hotel_rating = rating if rating else (3 + (i % 3))
            price_per_night = 100 + (hotel_rating * 30) + (i * 20)

            if max_price and price_per_night > max_price:
                continue

            hotel = {
                "id": f"hotel_{i+1}",
                "name": name,
                "address": f"{i+1} Main Street",
                "city": destination,
                "country": "USA",
                "rating": hotel_rating,
                "price_per_night": price_per_night,
                "currency": "USD",
                "amenities": ["WiFi", "Pool", "Gym", "Restaurant"],
                "available_rooms": 5 - i,
                "images": [f"https://via.placeholder.com/400x300?text={name}"]
            }
            hotels.append(hotel)

        return hotels

    def _generate_booking_reference(self) -> str:
        import uuid
        return f"HB-{uuid.uuid4().hex[:8].upper()}"

    def _generate_confirmation_number(self) -> str:
        import uuid
        return f"HCNF-{uuid.uuid4().hex[:12].upper()}"

    def _check_refund_eligibility(self, booking: HotelBooking) -> bool:
        """Check if booking is eligible for refund"""
        time_until_checkin = booking.check_in - date.today()
        return time_until_checkin.days >= 1

# Global service instance
hotel_booking_service = HotelBookingService()

