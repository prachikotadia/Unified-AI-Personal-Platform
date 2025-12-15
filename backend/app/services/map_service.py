import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.travel_db import MapLocation, Activity, HotelBooking, RestaurantBooking, Trip
from app.cache import redis_cache

logger = structlog.get_logger()

class MapService:
    def __init__(self):
        self.google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        self.map_provider = "google"  # google, mapbox, openstreetmap

    async def get_location_coordinates(
        self,
        db: Session,
        address: str,
        city: Optional[str] = None,
        country: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get coordinates for an address"""
        try:
            # Check cache first
            cache_key = f"location_coords_{address}_{city}_{country}"
            cached = await redis_cache.get_cache(cache_key)
            if cached:
                return cached

            # In production, use Google Maps Geocoding API
            # For now, return mock coordinates
            coordinates = self._geocode_address(address, city, country)

            await redis_cache.set_cache(cache_key, coordinates, expire=86400)
            return coordinates

        except Exception as e:
            logger.error(f"Error getting location coordinates: {e}")
            return {"latitude": None, "longitude": None, "error": str(e)}

    async def create_map_location(
        self,
        db: Session,
        activity_id: Optional[int] = None,
        hotel_id: Optional[int] = None,
        restaurant_id: Optional[int] = None,
        name: str = "",
        address: str = "",
        city: Optional[str] = None,
        country: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None
    ) -> Dict[str, Any]:
        """Create or update a map location"""
        try:
            # If coordinates not provided, geocode the address
            if not latitude or not longitude:
                coords = await self.get_location_coordinates(db, address, city, country)
                latitude = coords.get("latitude")
                longitude = coords.get("longitude")

            if not latitude or not longitude:
                return {"success": False, "message": "Could not determine coordinates"}

            # Check if location already exists
            existing = None
            if activity_id:
                existing = db.query(MapLocation).filter(MapLocation.activity_id == activity_id).first()
            elif hotel_id:
                existing = db.query(MapLocation).filter(MapLocation.hotel_id == hotel_id).first()
            elif restaurant_id:
                existing = db.query(MapLocation).filter(MapLocation.restaurant_id == restaurant_id).first()

            if existing:
                # Update existing
                existing.name = name
                existing.address = address
                existing.city = city
                existing.country = country
                existing.latitude = latitude
                existing.longitude = longitude
                db.commit()
                return {"success": True, "location_id": existing.id, "action": "updated"}
            else:
                # Create new
                location = MapLocation(
                    activity_id=activity_id,
                    hotel_id=hotel_id,
                    restaurant_id=restaurant_id,
                    name=name,
                    address=address,
                    city=city,
                    country=country,
                    latitude=latitude,
                    longitude=longitude,
                    location_type=self._determine_location_type(activity_id, hotel_id, restaurant_id)
                )
                db.add(location)
                db.commit()
                db.refresh(location)
                return {"success": True, "location_id": location.id, "action": "created"}

        except Exception as e:
            logger.error(f"Error creating map location: {e}")
            db.rollback()
            return {"success": False, "message": f"Error creating location: {str(e)}"}

    async def get_trip_locations(
        self,
        db: Session,
        trip_id: int
    ) -> List[Dict[str, Any]]:
        """Get all locations for a trip"""
        try:
            # Get all activities, hotels, and restaurants for the trip
            activities = db.query(Activity).filter(Activity.trip_id == trip_id).all()
            hotels = db.query(HotelBooking).filter(HotelBooking.trip_id == trip_id).all()
            restaurants = db.query(RestaurantBooking).filter(RestaurantBooking.trip_id == trip_id).all()

            locations = []

            # Get locations for activities
            for activity in activities:
                location = db.query(MapLocation).filter(MapLocation.activity_id == activity.id).first()
                if location:
                    locations.append(self._location_to_dict(location, "activity", activity.name))

            # Get locations for hotels
            for hotel in hotels:
                location = db.query(MapLocation).filter(MapLocation.hotel_id == hotel.id).first()
                if location:
                    locations.append(self._location_to_dict(location, "hotel", hotel.hotel_name))

            # Get locations for restaurants
            for restaurant in restaurants:
                location = db.query(MapLocation).filter(MapLocation.restaurant_id == restaurant.id).first()
                if location:
                    locations.append(self._location_to_dict(location, "restaurant", restaurant.restaurant_name))

            return locations

        except Exception as e:
            logger.error(f"Error getting trip locations: {e}")
            return []

    def _geocode_address(self, address: str, city: Optional[str], country: Optional[str]) -> Dict[str, Any]:
        """Geocode an address (mock implementation)"""
        # In production, use Google Maps Geocoding API
        # For now, return mock coordinates
        import random
        return {
            "latitude": 40.7128 + (random.random() - 0.5) * 0.1,  # Mock NYC area
            "longitude": -74.0060 + (random.random() - 0.5) * 0.1,
            "formatted_address": f"{address}, {city or ''}, {country or ''}",
            "place_id": f"mock_place_{hash(address)}"
        }

    def _determine_location_type(
        self,
        activity_id: Optional[int],
        hotel_id: Optional[int],
        restaurant_id: Optional[int]
    ) -> str:
        """Determine location type"""
        if activity_id:
            return "activity"
        elif hotel_id:
            return "hotel"
        elif restaurant_id:
            return "restaurant"
        return "other"

    def _location_to_dict(self, location: MapLocation, item_type: str, item_name: str) -> Dict[str, Any]:
        """Convert location to dictionary"""
        return {
            "id": location.id,
            "name": location.name or item_name,
            "address": location.address,
            "city": location.city,
            "country": location.country,
            "latitude": location.latitude,
            "longitude": location.longitude,
            "type": item_type,
            "place_id": location.place_id
        }

# Global service instance
map_service = MapService()

