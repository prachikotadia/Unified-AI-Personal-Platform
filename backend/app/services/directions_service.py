import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.travel_db import Directions, MapLocation, Trip
from app.cache import redis_cache

logger = structlog.get_logger()

class DirectionsService:
    def __init__(self):
        self.google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY")

    async def get_directions(
        self,
        db: Session,
        from_location_id: int,
        to_location_id: int,
        travel_mode: str = "driving",
        waypoints: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        """Get directions between two locations"""
        try:
            from_location = db.query(MapLocation).filter(MapLocation.id == from_location_id).first()
            to_location = db.query(MapLocation).filter(MapLocation.id == to_location_id).first()

            if not from_location or not to_location:
                return {"success": False, "message": "Locations not found"}

            # Check cache
            cache_key = f"directions_{from_location_id}_{to_location_id}_{travel_mode}"
            cached = await redis_cache.get_cache(cache_key)
            if cached:
                return cached

            # Get directions (mock implementation)
            directions = await self._calculate_directions(
                from_location, to_location, travel_mode, waypoints
            )

            # Save to database
            direction_record = Directions(
                from_location_id=from_location_id,
                to_location_id=to_location_id,
                travel_mode=travel_mode,
                distance=directions.get("distance"),
                duration=directions.get("duration"),
                duration_text=directions.get("duration_text"),
                distance_text=directions.get("distance_text"),
                route_data=directions.get("route"),
                waypoints=waypoints
            )
            db.add(direction_record)
            db.commit()

            await redis_cache.set_cache(cache_key, directions, expire=3600)
            return directions

        except Exception as e:
            logger.error(f"Error getting directions: {e}")
            return {"success": False, "message": f"Error getting directions: {str(e)}"}

    async def get_trip_directions(
        self,
        db: Session,
        trip_id: int,
        travel_mode: str = "driving"
    ) -> List[Dict[str, Any]]:
        """Get directions for all locations in a trip"""
        try:
            from app.services.map_service import map_service
            
            locations = await map_service.get_trip_locations(db, trip_id)
            if len(locations) < 2:
                return []

            directions_list = []
            for i in range(len(locations) - 1):
                from_loc = locations[i]
                to_loc = locations[i + 1]

                # Find or create map locations
                from_map_loc = db.query(MapLocation).filter(
                    MapLocation.latitude == from_loc["latitude"],
                    MapLocation.longitude == from_loc["longitude"]
                ).first()

                to_map_loc = db.query(MapLocation).filter(
                    MapLocation.latitude == to_loc["latitude"],
                    MapLocation.longitude == to_loc["longitude"]
                ).first()

                if from_map_loc and to_map_loc:
                    directions = await self.get_directions(
                        db, from_map_loc.id, to_map_loc.id, travel_mode
                    )
                    if directions.get("success"):
                        directions_list.append(directions)

            return directions_list

        except Exception as e:
            logger.error(f"Error getting trip directions: {e}")
            return []

    async def _calculate_directions(
        self,
        from_location: MapLocation,
        to_location: MapLocation,
        travel_mode: str,
        waypoints: Optional[List[int]]
    ) -> Dict[str, Any]:
        """Calculate directions between locations"""
        # In production, use Google Maps Directions API
        # For now, return mock directions
        
        # Calculate approximate distance (Haversine formula)
        import math
        lat1, lon1 = from_location.latitude, from_location.longitude
        lat2, lon2 = to_location.latitude, to_location.longitude
        
        R = 6371000  # Earth radius in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = math.sin(delta_phi / 2) ** 2 + \
            math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        distance_meters = R * c
        
        # Estimate duration based on travel mode
        speed_kmh = {
            "driving": 50,
            "walking": 5,
            "bicycling": 15,
            "transit": 30
        }.get(travel_mode, 50)
        
        duration_seconds = int((distance_meters / 1000) / speed_kmh * 3600)
        
        return {
            "success": True,
            "from": {
                "name": from_location.name,
                "address": from_location.address,
                "coordinates": {"lat": lat1, "lng": lon1}
            },
            "to": {
                "name": to_location.name,
                "address": to_location.address,
                "coordinates": {"lat": lat2, "lng": lon2}
            },
            "travel_mode": travel_mode,
            "distance": distance_meters,
            "distance_text": self._format_distance(distance_meters),
            "duration": duration_seconds,
            "duration_text": self._format_duration(duration_seconds),
            "route": {
                "steps": [
                    {
                        "instruction": f"Start at {from_location.name}",
                        "distance": 0,
                        "duration": 0
                    },
                    {
                        "instruction": f"Arrive at {to_location.name}",
                        "distance": distance_meters,
                        "duration": duration_seconds
                    }
                ]
            }
        }

    def _format_distance(self, meters: float) -> str:
        """Format distance in human-readable format"""
        if meters < 1000:
            return f"{int(meters)} m"
        return f"{meters / 1000:.1f} km"

    def _format_duration(self, seconds: int) -> str:
        """Format duration in human-readable format"""
        if seconds < 60:
            return f"{seconds} sec"
        elif seconds < 3600:
            return f"{seconds // 60} min"
        else:
            hours = seconds // 3600
            minutes = (seconds % 3600) // 60
            return f"{hours} hr {minutes} min" if minutes > 0 else f"{hours} hr"

# Global service instance
directions_service = DirectionsService()

