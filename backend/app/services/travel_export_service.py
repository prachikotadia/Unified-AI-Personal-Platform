import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, date
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.travel_db import Trip, Activity, FlightBooking, HotelBooking, RestaurantBooking, ItineraryExport, ExportFormat
from app.cache import redis_cache

logger = structlog.get_logger()

class TravelExportService:
    def __init__(self):
        self.export_formats = {
            "pdf": self._export_to_pdf,
            "ical": self._export_to_ical,
            "google_calendar": self._export_to_google_calendar,
            "json": self._export_to_json,
            "csv": self._export_to_csv
        }

    async def export_itinerary(
        self,
        db: Session,
        trip_id: int,
        user_id: int,
        export_format: ExportFormat,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Export trip itinerary to specified format"""
        try:
            trip = db.query(Trip).filter(
                and_(Trip.id == trip_id, Trip.user_id == user_id)
            ).first()
            if not trip:
                return {"success": False, "message": "Trip not found"}

            # Get all trip data
            activities = db.query(Activity).filter(Activity.trip_id == trip_id).all()
            flights = db.query(FlightBooking).filter(FlightBooking.trip_id == trip_id).all()
            hotels = db.query(HotelBooking).filter(HotelBooking.trip_id == trip_id).all()
            restaurants = db.query(RestaurantBooking).filter(
                RestaurantBooking.trip_id == trip_id
            ).all()

            # Export based on format
            exporter = self.export_formats.get(export_format.value)
            if not exporter:
                return {"success": False, "message": f"Unsupported export format: {export_format.value}"}

            export_data = await exporter(trip, activities, flights, hotels, restaurants, options or {})

            # Save export record
            export_record = ItineraryExport(
                trip_id=trip_id,
                user_id=user_id,
                export_format=export_format,
                file_url=export_data.get("file_url"),
                file_size=export_data.get("file_size", 0),
                export_options=options,
                status="completed"
            )
            db.add(export_record)
            db.commit()

            return {
                "success": True,
                "export_id": export_record.id,
                "format": export_format.value,
                "file_url": export_data.get("file_url"),
                "file_size": export_data.get("file_size"),
                "download_url": export_data.get("download_url")
            }

        except Exception as e:
            logger.error(f"Error exporting itinerary: {e}")
            db.rollback()
            return {"success": False, "message": f"Error exporting itinerary: {str(e)}"}

    async def _export_to_pdf(
        self,
        trip: Trip,
        activities: List[Activity],
        flights: List[FlightBooking],
        hotels: List[HotelBooking],
        restaurants: List[RestaurantBooking],
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Export itinerary to PDF"""
        try:
            # In production, use a PDF library like reportlab or weasyprint
            # For now, generate a simple text representation
            
            pdf_content = f"""
ITINERARY: {trip.title}
Destination: {trip.destination}
Dates: {trip.start_date} to {trip.end_date}

FLIGHTS:
"""
            for flight in flights:
                pdf_content += f"- {flight.airline} {flight.flight_number}: {flight.origin} to {flight.destination}\n"
                pdf_content += f"  Departure: {flight.departure_time}\n"
                pdf_content += f"  Arrival: {flight.arrival_time}\n\n"

            pdf_content += "\nHOTELS:\n"
            for hotel in hotels:
                pdf_content += f"- {hotel.hotel_name}\n"
                pdf_content += f"  Check-in: {hotel.check_in}, Check-out: {hotel.check_out}\n\n"

            pdf_content += "\nACTIVITIES:\n"
            for activity in activities:
                pdf_content += f"- {activity.name} ({activity.date})\n"
                if activity.start_time:
                    pdf_content += f"  Time: {activity.start_time}\n"
                pdf_content += f"  Location: {activity.location}\n\n"

            # Save to file (in production, use proper PDF generation)
            file_path = f"/tmp/itinerary_{trip.id}_{datetime.now().timestamp()}.txt"
            with open(file_path, "w") as f:
                f.write(pdf_content)

            return {
                "file_url": file_path,
                "file_size": len(pdf_content.encode()),
                "download_url": f"/api/travel/exports/{trip.id}/download"
            }

        except Exception as e:
            logger.error(f"Error exporting to PDF: {e}")
            raise

    async def _export_to_ical(
        self,
        trip: Trip,
        activities: List[Activity],
        flights: List[FlightBooking],
        hotels: List[HotelBooking],
        restaurants: List[RestaurantBooking],
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Export itinerary to iCal format"""
        try:
            ical_content = "BEGIN:VCALENDAR\n"
            ical_content += "VERSION:2.0\n"
            ical_content += f"PRODID:-//Travel App//Itinerary//EN\n"
            ical_content += f"X-WR-CALNAME:{trip.title}\n"

            # Add flights
            for flight in flights:
                ical_content += "BEGIN:VEVENT\n"
                ical_content += f"DTSTART:{flight.departure_time.strftime('%Y%m%dT%H%M%S')}\n"
                ical_content += f"DTEND:{flight.arrival_time.strftime('%Y%m%dT%H%M%S')}\n"
                ical_content += f"SUMMARY:Flight: {flight.airline} {flight.flight_number}\n"
                ical_content += f"DESCRIPTION:{flight.origin} to {flight.destination}\n"
                ical_content += "END:VEVENT\n"

            # Add activities
            for activity in activities:
                if activity.start_time:
                    ical_content += "BEGIN:VEVENT\n"
                    start_dt = datetime.combine(activity.date, activity.start_time)
                    end_dt = datetime.combine(activity.date, activity.end_time) if activity.end_time else start_dt
                    ical_content += f"DTSTART:{start_dt.strftime('%Y%m%dT%H%M%S')}\n"
                    ical_content += f"DTEND:{end_dt.strftime('%Y%m%dT%H%M%S')}\n"
                    ical_content += f"SUMMARY:{activity.name}\n"
                    ical_content += f"LOCATION:{activity.location}\n"
                    ical_content += "END:VEVENT\n"

            ical_content += "END:VCALENDAR\n"

            file_path = f"/tmp/itinerary_{trip.id}_{datetime.now().timestamp()}.ics"
            with open(file_path, "w") as f:
                f.write(ical_content)

            return {
                "file_url": file_path,
                "file_size": len(ical_content.encode()),
                "download_url": f"/api/travel/exports/{trip.id}/download"
            }

        except Exception as e:
            logger.error(f"Error exporting to iCal: {e}")
            raise

    async def _export_to_google_calendar(
        self,
        trip: Trip,
        activities: List[Activity],
        flights: List[FlightBooking],
        hotels: List[HotelBooking],
        restaurants: List[RestaurantBooking],
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Export itinerary to Google Calendar format"""
        # Google Calendar uses iCal format, so reuse that
        return await self._export_to_ical(trip, activities, flights, hotels, restaurants, options)

    async def _export_to_json(
        self,
        trip: Trip,
        activities: List[Activity],
        flights: List[FlightBooking],
        hotels: List[HotelBooking],
        restaurants: List[RestaurantBooking],
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Export itinerary to JSON format"""
        try:
            data = {
                "trip": {
                    "id": trip.id,
                    "title": trip.title,
                    "destination": trip.destination,
                    "start_date": trip.start_date.isoformat(),
                    "end_date": trip.end_date.isoformat(),
                    "status": trip.status.value if hasattr(trip.status, 'value') else str(trip.status)
                },
                "flights": [self._flight_to_dict(f) for f in flights],
                "hotels": [self._hotel_to_dict(h) for h in hotels],
                "restaurants": [self._restaurant_to_dict(r) for r in restaurants],
                "activities": [self._activity_to_dict(a) for a in activities],
                "exported_at": datetime.utcnow().isoformat()
            }

            json_content = json.dumps(data, indent=2)
            file_path = f"/tmp/itinerary_{trip.id}_{datetime.now().timestamp()}.json"
            with open(file_path, "w") as f:
                f.write(json_content)

            return {
                "file_url": file_path,
                "file_size": len(json_content.encode()),
                "download_url": f"/api/travel/exports/{trip.id}/download"
            }

        except Exception as e:
            logger.error(f"Error exporting to JSON: {e}")
            raise

    async def _export_to_csv(
        self,
        trip: Trip,
        activities: List[Activity],
        flights: List[FlightBooking],
        hotels: List[HotelBooking],
        restaurants: List[RestaurantBooking],
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Export itinerary to CSV format"""
        try:
            import csv
            import io

            output = io.StringIO()
            writer = csv.writer(output)

            # Write header
            writer.writerow(["Type", "Name", "Date", "Time", "Location", "Details"])

            # Write flights
            for flight in flights:
                writer.writerow([
                    "Flight",
                    f"{flight.airline} {flight.flight_number}",
                    flight.departure_time.date().isoformat(),
                    flight.departure_time.time().isoformat(),
                    f"{flight.origin} to {flight.destination}",
                    f"Duration: {flight.duration} min"
                ])

            # Write hotels
            for hotel in hotels:
                writer.writerow([
                    "Hotel",
                    hotel.hotel_name,
                    hotel.check_in.isoformat(),
                    "",
                    f"{hotel.city}, {hotel.country}",
                    f"Check-out: {hotel.check_out.isoformat()}"
                ])

            # Write activities
            for activity in activities:
                writer.writerow([
                    "Activity",
                    activity.name,
                    activity.date.isoformat(),
                    activity.start_time.isoformat() if activity.start_time else "",
                    activity.location,
                    activity.description or ""
                ])

            csv_content = output.getvalue()
            file_path = f"/tmp/itinerary_{trip.id}_{datetime.now().timestamp()}.csv"
            with open(file_path, "w") as f:
                f.write(csv_content)

            return {
                "file_url": file_path,
                "file_size": len(csv_content.encode()),
                "download_url": f"/api/travel/exports/{trip.id}/download"
            }

        except Exception as e:
            logger.error(f"Error exporting to CSV: {e}")
            raise

    def _flight_to_dict(self, flight: FlightBooking) -> Dict[str, Any]:
        return {
            "flight_number": flight.flight_number,
            "airline": flight.airline,
            "origin": flight.origin,
            "destination": flight.destination,
            "departure_time": flight.departure_time.isoformat() if flight.departure_time else None,
            "arrival_time": flight.arrival_time.isoformat() if flight.arrival_time else None
        }

    def _hotel_to_dict(self, hotel: HotelBooking) -> Dict[str, Any]:
        return {
            "name": hotel.hotel_name,
            "address": hotel.address,
            "check_in": hotel.check_in.isoformat() if hotel.check_in else None,
            "check_out": hotel.check_out.isoformat() if hotel.check_out else None
        }

    def _restaurant_to_dict(self, restaurant: RestaurantBooking) -> Dict[str, Any]:
        return {
            "name": restaurant.restaurant_name,
            "address": restaurant.address,
            "reservation_date": restaurant.reservation_date.isoformat() if restaurant.reservation_date else None,
            "reservation_time": restaurant.reservation_time.isoformat() if restaurant.reservation_time else None
        }

    def _activity_to_dict(self, activity: Activity) -> Dict[str, Any]:
        return {
            "name": activity.name,
            "type": activity.type.value if hasattr(activity.type, 'value') else str(activity.type),
            "date": activity.date.isoformat() if activity.date else None,
            "start_time": activity.start_time.isoformat() if activity.start_time else None,
            "location": activity.location
        }

# Global service instance
travel_export_service = TravelExportService()

