import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, date, timedelta
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.travel_db import FlightBooking, Trip, BookingStatus, FlightClass
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class FlightBookingService:
    def __init__(self):
        self.booking_providers = {
            "amadeus": os.getenv("AMADEUS_API_KEY"),
            "skyscanner": os.getenv("SKYSCANNER_API_KEY"),
            "expedia": os.getenv("EXPEDIA_API_KEY")
        }

    async def search_flights(
        self,
        db: Session,
        origin: str,
        destination: str,
        departure_date: date,
        return_date: Optional[date] = None,
        adults: int = 1,
        children: int = 0,
        infants: int = 0,
        cabin_class: FlightClass = FlightClass.economy,
        direct_flights_only: bool = False,
        max_price: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """Search for available flights"""
        try:
            cache_key = f"flight_search_{origin}_{destination}_{departure_date}_{return_date}_{adults}_{cabin_class.value}"
            cached_results = await redis_cache.get_cache(cache_key)
            if cached_results:
                return cached_results

            # Mock flight search results (in production, integrate with flight API)
            flights = self._generate_mock_flights(
                origin, destination, departure_date, return_date,
                adults, children, infants, cabin_class, direct_flights_only, max_price
            )

            # Cache results for 1 hour
            await redis_cache.set_cache(cache_key, flights, expire=3600)
            return flights

        except Exception as e:
            logger.error(f"Error searching flights: {e}")
            return []

    async def book_flight(
        self,
        db: Session,
        user_id: int,
        trip_id: int,
        flight_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Book a flight"""
        try:
            # Validate trip belongs to user
            trip = db.query(Trip).filter(
                and_(Trip.id == trip_id, Trip.user_id == user_id)
            ).first()
            if not trip:
                return {"success": False, "message": "Trip not found"}

            # Create flight booking
            flight_booking = FlightBooking(
                trip_id=trip_id,
                flight_number=flight_data.get("flight_number"),
                airline=flight_data.get("airline"),
                airline_code=flight_data.get("airline_code"),
                origin=flight_data.get("origin"),
                destination=flight_data.get("destination"),
                departure_time=datetime.fromisoformat(flight_data.get("departure_time")),
                arrival_time=datetime.fromisoformat(flight_data.get("arrival_time")),
                duration=flight_data.get("duration"),
                stops=flight_data.get("stops", 0),
                cabin_class=flight_data.get("cabin_class", FlightClass.economy),
                price=flight_data.get("price"),
                currency=flight_data.get("currency", "USD"),
                booking_reference=self._generate_booking_reference(),
                passenger_info=flight_data.get("passenger_info", {}),
                baggage_info=flight_data.get("baggage_info", {}),
                status=BookingStatus.pending
            )

            db.add(flight_booking)
            db.commit()
            db.refresh(flight_booking)

            # In production, integrate with actual booking API
            # For now, simulate booking confirmation
            await asyncio.sleep(1)  # Simulate API call
            flight_booking.status = BookingStatus.confirmed
            flight_booking.confirmation_number = self._generate_confirmation_number()
            db.commit()

            return {
                "success": True,
                "booking_id": flight_booking.id,
                "booking_reference": flight_booking.booking_reference,
                "confirmation_number": flight_booking.confirmation_number,
                "status": flight_booking.status.value
            }

        except Exception as e:
            logger.error(f"Error booking flight: {e}")
            db.rollback()
            return {"success": False, "message": f"Error booking flight: {str(e)}"}

    async def cancel_flight_booking(
        self,
        db: Session,
        user_id: int,
        booking_id: int
    ) -> Dict[str, Any]:
        """Cancel a flight booking"""
        try:
            booking = db.query(FlightBooking).join(Trip).filter(
                and_(
                    FlightBooking.id == booking_id,
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
                "message": "Flight booking cancelled",
                "refund_eligible": self._check_refund_eligibility(booking)
            }

        except Exception as e:
            logger.error(f"Error cancelling flight booking: {e}")
            db.rollback()
            return {"success": False, "message": f"Error cancelling booking: {str(e)}"}

    async def get_user_flight_bookings(
        self,
        db: Session,
        user_id: int,
        status: Optional[BookingStatus] = None
    ) -> List[Dict[str, Any]]:
        """Get all flight bookings for a user"""
        try:
            query = db.query(FlightBooking).join(Trip).filter(
                Trip.user_id == user_id
            )

            if status:
                query = query.filter(FlightBooking.status == status)

            bookings = query.order_by(desc(FlightBooking.departure_time)).all()

            return [self._flight_booking_to_dict(booking) for booking in bookings]

        except Exception as e:
            logger.error(f"Error getting flight bookings: {e}")
            return []

    def _generate_mock_flights(
        self,
        origin: str,
        destination: str,
        departure_date: date,
        return_date: Optional[date],
        adults: int,
        children: int,
        infants: int,
        cabin_class: FlightClass,
        direct_flights_only: bool,
        max_price: Optional[float]
    ) -> List[Dict[str, Any]]:
        """Generate mock flight search results"""
        flights = []
        airlines = ["American Airlines", "Delta", "United", "Southwest", "JetBlue"]
        airline_codes = ["AA", "DL", "UA", "WN", "B6"]

        for i in range(5):
            flight = {
                "id": f"flight_{i+1}",
                "flight_number": f"{airline_codes[i]}{1000 + i}",
                "airline": airlines[i],
                "airline_code": airline_codes[i],
                "origin": origin,
                "destination": destination,
                "departure_time": datetime.combine(departure_date, datetime.min.time()).isoformat(),
                "arrival_time": (datetime.combine(departure_date, datetime.min.time()) + timedelta(hours=3)).isoformat(),
                "duration": 180,
                "stops": 0 if direct_flights_only else (i % 2),
                "cabin_class": cabin_class.value,
                "price": 300 + (i * 50),
                "currency": "USD",
                "available_seats": 10 - i
            }

            if not max_price or flight["price"] <= max_price:
                flights.append(flight)

        return flights

    def _generate_booking_reference(self) -> str:
        """Generate a unique booking reference"""
        import uuid
        return f"FB-{uuid.uuid4().hex[:8].upper()}"

    def _generate_confirmation_number(self) -> str:
        """Generate a confirmation number"""
        import uuid
        return f"CNF-{uuid.uuid4().hex[:12].upper()}"

    def _check_refund_eligibility(self, booking: FlightBooking) -> bool:
        """Check if booking is eligible for refund"""
        # Check if cancellation is within 24 hours (US regulation)
        time_until_departure = booking.departure_time - datetime.utcnow()
        return time_until_departure.total_seconds() > 24 * 3600

    def _flight_booking_to_dict(self, booking: FlightBooking) -> Dict[str, Any]:
        """Convert flight booking to dictionary"""
        return {
            "id": booking.id,
            "trip_id": booking.trip_id,
            "flight_number": booking.flight_number,
            "airline": booking.airline,
            "origin": booking.origin,
            "destination": booking.destination,
            "departure_time": booking.departure_time.isoformat() if booking.departure_time else None,
            "arrival_time": booking.arrival_time.isoformat() if booking.arrival_time else None,
            "duration": booking.duration,
            "cabin_class": booking.cabin_class.value if booking.cabin_class else None,
            "price": booking.price,
            "currency": booking.currency,
            "booking_reference": booking.booking_reference,
            "confirmation_number": booking.confirmation_number,
            "status": booking.status.value if booking.status else None,
            "created_at": booking.created_at.isoformat() if booking.created_at else None
        }

# Global service instance
flight_booking_service = FlightBookingService()

