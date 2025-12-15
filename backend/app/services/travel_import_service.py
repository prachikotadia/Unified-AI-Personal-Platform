import os
import json
import csv
from typing import Dict, List, Any, Optional
from datetime import datetime, date, time, timedelta
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.travel_db import Trip, Activity, FlightBooking, HotelBooking, RestaurantBooking, TripType, TripStatus, ActivityType
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class TravelImportService:
    def __init__(self):
        self.supported_formats = ["json", "csv", "ical", "google_calendar"]

    async def import_trip(
        self,
        db: Session,
        user_id: int,
        file_path: Optional[str] = None,
        file_content: Optional[str] = None,
        file_format: str = "json",
        source: str = "file"
    ) -> Dict[str, Any]:
        """Import a trip from file or other source"""
        try:
            if source == "file" and file_path:
                content = self._read_file(file_path)
            elif file_content:
                content = file_content
            else:
                return {"success": False, "message": "No file or content provided"}

            # Parse based on format
            if file_format == "json":
                trip_data = json.loads(content)
            elif file_format == "csv":
                trip_data = self._parse_csv(content)
            elif file_format in ["ical", "google_calendar"]:
                trip_data = self._parse_ical(content)
            else:
                return {"success": False, "message": f"Unsupported format: {file_format}"}

            # Create trip
            trip = Trip(
                user_id=user_id,
                title=trip_data.get("title", "Imported Trip"),
                description=trip_data.get("description"),
                trip_type=TripType.leisure,  # Default
                status=TripStatus.planning,
                destination=trip_data.get("destination", ""),
                start_date=date.fromisoformat(trip_data.get("start_date")),
                end_date=date.fromisoformat(trip_data.get("end_date")),
                budget=trip_data.get("budget"),
                currency=trip_data.get("currency", "USD")
            )

            db.add(trip)
            db.commit()
            db.refresh(trip)

            # Import flights
            for flight_data in trip_data.get("flights", []):
                flight = FlightBooking(
                    trip_id=trip.id,
                    flight_number=flight_data.get("flight_number"),
                    airline=flight_data.get("airline"),
                    airline_code=flight_data.get("airline_code", ""),
                    origin=flight_data.get("origin"),
                    destination=flight_data.get("destination"),
                    departure_time=datetime.fromisoformat(flight_data.get("departure_time")),
                    arrival_time=datetime.fromisoformat(flight_data.get("arrival_time")),
                    duration=flight_data.get("duration", 0),
                    cabin_class=flight_data.get("cabin_class", "economy"),
                    price=flight_data.get("price", 0),
                    currency=flight_data.get("currency", "USD")
                )
                db.add(flight)

            # Import hotels
            for hotel_data in trip_data.get("hotels", []):
                hotel = HotelBooking(
                    trip_id=trip.id,
                    hotel_name=hotel_data.get("name"),
                    address=hotel_data.get("address", ""),
                    city=hotel_data.get("city", ""),
                    country=hotel_data.get("country", ""),
                    check_in=date.fromisoformat(hotel_data.get("check_in")),
                    check_out=date.fromisoformat(hotel_data.get("check_out")),
                    rooms=hotel_data.get("rooms", 1),
                    price_per_night=hotel_data.get("price_per_night", 0),
                    total_price=hotel_data.get("total_price", 0),
                    currency=hotel_data.get("currency", "USD")
                )
                db.add(hotel)

            # Import activities
            for activity_data in trip_data.get("activities", []):
                activity = Activity(
                    trip_id=trip.id,
                    name=activity_data.get("name"),
                    description=activity_data.get("description"),
                    type=ActivityType(activity_data.get("type", "sightseeing")),
                    location=activity_data.get("location", ""),
                    date=date.fromisoformat(activity_data.get("date")),
                    start_time=time.fromisoformat(activity_data.get("start_time")) if activity_data.get("start_time") else None,
                    price=activity_data.get("price"),
                    currency=activity_data.get("currency", "USD")
                )
                db.add(activity)

            db.commit()

            return {
                "success": True,
                "trip_id": trip.id,
                "message": "Trip imported successfully",
                "imported_items": {
                    "flights": len(trip_data.get("flights", [])),
                    "hotels": len(trip_data.get("hotels", [])),
                    "activities": len(trip_data.get("activities", []))
                }
            }

        except Exception as e:
            logger.error(f"Error importing trip: {e}")
            db.rollback()
            return {"success": False, "message": f"Error importing trip: {str(e)}"}

    async def import_from_email(
        self,
        db: Session,
        user_id: int,
        email_content: str
    ) -> Dict[str, Any]:
        """Import trip from email content"""
        try:
            # Parse email for trip information
            # In production, use email parsing library
            trip_data = self._parse_email(email_content)
            return await self.import_trip(db, user_id, file_content=json.dumps(trip_data), file_format="json", source="email")

        except Exception as e:
            logger.error(f"Error importing from email: {e}")
            return {"success": False, "message": f"Error importing from email: {str(e)}"}

    async def import_from_link(
        self,
        db: Session,
        user_id: int,
        link: str
    ) -> Dict[str, Any]:
        """Import trip from external link"""
        try:
            import httpx
            
            # Fetch content from link
            async with httpx.AsyncClient() as client:
                response = await client.get(link)
                content = response.text

            # Try to detect format
            file_format = self._detect_format(content)
            return await self.import_trip(db, user_id, file_content=content, file_format=file_format, source="link")

        except Exception as e:
            logger.error(f"Error importing from link: {e}")
            return {"success": False, "message": f"Error importing from link: {str(e)}"}

    def _read_file(self, file_path: str) -> str:
        """Read file content"""
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()

    def _parse_csv(self, content: str) -> Dict[str, Any]:
        """Parse CSV content"""
        reader = csv.DictReader(content.splitlines())
        rows = list(reader)
        
        # Group by type
        flights = [r for r in rows if r.get("Type") == "Flight"]
        hotels = [r for r in rows if r.get("Type") == "Hotel"]
        activities = [r for r in rows if r.get("Type") == "Activity"]

        return {
            "title": "Imported Trip",
            "destination": activities[0].get("Location", "") if activities else "",
            "start_date": date.today().isoformat(),
            "end_date": (date.today() + timedelta(days=7)).isoformat(),
            "flights": flights,
            "hotels": hotels,
            "activities": activities
        }

    def _parse_ical(self, content: str) -> Dict[str, Any]:
        """Parse iCal content"""
        # Simple iCal parser
        events = []
        current_event = {}
        
        for line in content.splitlines():
            if line.startswith("BEGIN:VEVENT"):
                current_event = {}
            elif line.startswith("SUMMARY:"):
                current_event["name"] = line.replace("SUMMARY:", "").strip()
            elif line.startswith("DTSTART:"):
                dt_str = line.replace("DTSTART:", "").strip()
                current_event["start_time"] = self._parse_ical_datetime(dt_str)
            elif line.startswith("LOCATION:"):
                current_event["location"] = line.replace("LOCATION:", "").strip()
            elif line.startswith("END:VEVENT"):
                events.append(current_event)

        return {
            "title": "Imported Trip",
            "destination": events[0].get("location", "") if events else "",
            "start_date": date.today().isoformat(),
            "end_date": (date.today() + timedelta(days=len(events))).isoformat(),
            "activities": events
        }

    def _parse_email(self, email_content: str) -> Dict[str, Any]:
        """Parse email content for trip information"""
        # Simple email parser - in production, use proper email parsing
        return {
            "title": "Trip from Email",
            "destination": "Unknown",
            "start_date": date.today().isoformat(),
            "end_date": (date.today() + timedelta(days=7)).isoformat(),
            "flights": [],
            "hotels": [],
            "activities": []
        }

    def _detect_format(self, content: str) -> str:
        """Detect file format from content"""
        if content.strip().startswith("BEGIN:VCALENDAR"):
            return "ical"
        elif content.strip().startswith("{"):
            return "json"
        elif "," in content and "\n" in content:
            return "csv"
        return "json"

    def _parse_ical_datetime(self, dt_str: str) -> str:
        """Parse iCal datetime string"""
        # iCal format: YYYYMMDDTHHMMSS
        if "T" in dt_str:
            year = int(dt_str[0:4])
            month = int(dt_str[4:6])
            day = int(dt_str[6:8])
            hour = int(dt_str[9:11])
            minute = int(dt_str[11:13])
            second = int(dt_str[13:15]) if len(dt_str) > 15 else 0
            return datetime(year, month, day, hour, minute, second).isoformat()
        return datetime.now().isoformat()

# Global service instance
travel_import_service = TravelImportService()

