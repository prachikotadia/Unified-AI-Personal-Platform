from fastapi import APIRouter, Depends, HTTPException, status, Query, Body, Form, UploadFile, File
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime, date, timedelta
import structlog
import uuid
import httpx
import asyncio
import json
import os
from app.services.ai_service import ai_service

from app.models.travel import (
    Trip, FlightSearch, Flight, HotelSearch, Hotel, Activity, ItineraryDay,
    TravelDocument, PriceAlert, TravelBudget, TravelPackingList, TravelExpense,
    TravelRecommendation, TravelInsight, TravelShare,
    TripType, TripStatus, FlightClass, HotelRating
)

logger = structlog.get_logger()
router = APIRouter()

# Mock user for now - in real app, this would come from authentication
def get_mock_user():
    return {"id": "user_123", "username": "testuser"}

# Skyscanner API configuration (mock for now)
SKYSCANNER_API_KEY = "your_skyscanner_api_key"
SKYSCANNER_BASE_URL = "https://partners.api.skyscanner.net/apiservices/v3"

# Request/Response models
class TripCreate(BaseModel):
    title: str
    description: Optional[str] = None
    trip_type: TripType
    destination: str
    start_date: date
    end_date: date
    budget: Optional[float] = None
    currency: str = "USD"
    travelers: List[Dict[str, Any]] = []

class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date] = None
    adults: int = 1
    children: int = 0
    infants: int = 0
    cabin_class: FlightClass = FlightClass.economy
    direct_flights_only: bool = False
    max_price: Optional[float] = None
    currency: str = "USD"

class HotelSearchRequest(BaseModel):
    destination: str
    check_in: date
    check_out: date
    rooms: int = 1
    adults: int = 1
    children: int = 0
    rating: Optional[HotelRating] = None
    max_price: Optional[float] = None
    currency: str = "USD"
    amenities: List[str] = []

class ActivityCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: str
    location: str
    date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    price: Optional[float] = None
    currency: str = "USD"
    notes: Optional[str] = None

class PriceAlertCreate(BaseModel):
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date] = None
    target_price: float
    currency: str = "USD"
    cabin_class: FlightClass = FlightClass.economy

# Mock data storage
trips = []
flights = []
hotels = []
activities = []
itineraries = []
documents = []
price_alerts = []
budgets = []
packing_lists = []
expenses = []
recommendations = []
insights = []
travel_shares = []

# Trip Management
@router.post("/trips", response_model=Trip)
async def create_trip(trip_data: TripCreate):
    """Create a new trip"""
    user = get_mock_user()
    
    trip = Trip(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        **trip_data.dict()
    )
    
    trips.append(trip.dict())
    logger.info(f"Created trip for user {user['id']}")
    
    return trip

@router.get("/trips", response_model=List[Trip])
async def get_trips(
    status: Optional[TripStatus] = None,
    trip_type: Optional[TripType] = None,
    limit: int = Query(50, le=100)
):
    """Get user's trips"""
    user = get_mock_user()
    
    user_trips = [trip for trip in trips if trip["user_id"] == user["id"]]
    
    if status:
        user_trips = [trip for trip in user_trips if trip["status"] == status]
    
    if trip_type:
        user_trips = [trip for trip in user_trips if trip["trip_type"] == trip_type]
    
    user_trips.sort(key=lambda x: x["created_at"], reverse=True)
    return user_trips[:limit]

@router.get("/trips/{trip_id}", response_model=Trip)
async def get_trip(trip_id: str):
    """Get a specific trip"""
    user = get_mock_user()
    
    for trip in trips:
        if trip["id"] == trip_id and trip["user_id"] == user["id"]:
            return trip
    
    raise HTTPException(status_code=404, detail="Trip not found")

@router.put("/trips/{trip_id}")
async def update_trip(trip_id: str, trip_data: Dict[str, Any]):
    """Update a trip"""
    user = get_mock_user()
    
    for trip in trips:
        if trip["id"] == trip_id and trip["user_id"] == user["id"]:
            trip.update(trip_data)
            trip["updated_at"] = datetime.utcnow().isoformat()
            return {"message": "Trip updated successfully"}
    
    raise HTTPException(status_code=404, detail="Trip not found")

# Flight Search and Booking
@router.post("/flights/search")
async def search_flights(search_request: FlightSearchRequest):
    """Search for flights using Skyscanner API"""
    try:
        # Mock Skyscanner API response
        mock_flights = [
            {
                "id": str(uuid.uuid4()),
                "flight_number": "AA123",
                "airline": "American Airlines",
                "airline_code": "AA",
                "origin": search_request.origin,
                "destination": search_request.destination,
                "departure_time": f"{search_request.departure_date}T10:00:00",
                "arrival_time": f"{search_request.departure_date}T12:30:00",
                "duration": 150,
                "stops": 0,
                "cabin_class": search_request.cabin_class,
                "price": 299.99,
                "currency": search_request.currency
            },
            {
                "id": str(uuid.uuid4()),
                "flight_number": "DL456",
                "airline": "Delta Airlines",
                "airline_code": "DL",
                "origin": search_request.origin,
                "destination": search_request.destination,
                "departure_time": f"{search_request.departure_date}T14:00:00",
                "arrival_time": f"{search_request.departure_date}T16:45:00",
                "duration": 165,
                "stops": 1,
                "cabin_class": search_request.cabin_class,
                "price": 249.99,
                "currency": search_request.currency
            },
            {
                "id": str(uuid.uuid4()),
                "flight_number": "UA789",
                "airline": "United Airlines",
                "airline_code": "UA",
                "origin": search_request.origin,
                "destination": search_request.destination,
                "departure_time": f"{search_request.departure_date}T08:30:00",
                "arrival_time": f"{search_request.departure_date}T11:15:00",
                "duration": 165,
                "stops": 0,
                "cabin_class": search_request.cabin_class,
                "price": 349.99,
                "currency": search_request.currency
            }
        ]
        
        # Filter by price if specified
        if search_request.max_price:
            mock_flights = [f for f in mock_flights if f["price"] <= search_request.max_price]
        
        # Filter direct flights if requested
        if search_request.direct_flights_only:
            mock_flights = [f for f in mock_flights if f["stops"] == 0]
        
        return {
            "search_request": search_request.dict(),
            "flights": mock_flights,
            "total_results": len(mock_flights),
            "search_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Flight search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Flight search failed")

@router.post("/flights/book")
async def book_flight(flight_data: Dict[str, Any]):
    """Book a flight"""
    user = get_mock_user()
    
    flight = Flight(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        booking_reference=f"BK{uuid.uuid4().hex[:8].upper()}",
        **flight_data
    )
    
    flights.append(flight.dict())
    logger.info(f"Booked flight for user {user['id']}")
    
    return {
        "message": "Flight booked successfully",
        "booking_reference": flight.booking_reference,
        "flight": flight.dict()
    }

@router.get("/flights", response_model=List[Flight])
async def get_user_flights(trip_id: Optional[str] = None):
    """Get user's booked flights"""
    user = get_mock_user()
    
    user_flights = [flight for flight in flights if flight["user_id"] == user["id"]]
    
    if trip_id:
        user_flights = [flight for flight in user_flights if flight["trip_id"] == trip_id]
    
    return user_flights

# Hotel Search and Booking
@router.post("/hotels/search")
async def search_hotels(search_request: HotelSearchRequest):
    """Search for hotels"""
    try:
        # Mock hotel search results
        mock_hotels = [
            {
                "id": str(uuid.uuid4()),
                "name": "Grand Hotel",
                "address": "123 Main St",
                "city": search_request.destination,
                "country": "USA",
                "rating": "4",
                "check_in": search_request.check_in.isoformat(),
                "check_out": search_request.check_out.isoformat(),
                "rooms": search_request.rooms,
                "room_type": "Standard",
                "price_per_night": 150.00,
                "total_price": 150.00 * (search_request.check_out - search_request.check_in).days,
                "currency": search_request.currency,
                "amenities": ["WiFi", "Pool", "Gym", "Restaurant"]
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Luxury Resort",
                "address": "456 Beach Blvd",
                "city": search_request.destination,
                "country": "USA",
                "rating": "5",
                "check_in": search_request.check_in.isoformat(),
                "check_out": search_request.check_out.isoformat(),
                "rooms": search_request.rooms,
                "room_type": "Deluxe",
                "price_per_night": 300.00,
                "total_price": 300.00 * (search_request.check_out - search_request.check_in).days,
                "currency": search_request.currency,
                "amenities": ["WiFi", "Pool", "Spa", "Restaurant", "Beach Access"]
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Budget Inn",
                "address": "789 Economy Ave",
                "city": search_request.destination,
                "country": "USA",
                "rating": "3",
                "check_in": search_request.check_in.isoformat(),
                "check_out": search_request.check_out.isoformat(),
                "rooms": search_request.rooms,
                "room_type": "Basic",
                "price_per_night": 80.00,
                "total_price": 80.00 * (search_request.check_out - search_request.check_in).days,
                "currency": search_request.currency,
                "amenities": ["WiFi", "Parking"]
            }
        ]
        
        # Filter by price if specified
        if search_request.max_price:
            mock_hotels = [h for h in mock_hotels if h["price_per_night"] <= search_request.max_price]
        
        # Filter by rating if specified
        if search_request.rating:
            mock_hotels = [h for h in mock_hotels if h["rating"] >= search_request.rating]
        
        return {
            "search_request": search_request.dict(),
            "hotels": mock_hotels,
            "total_results": len(mock_hotels),
            "search_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Hotel search error: {str(e)}")
        raise HTTPException(status_code=500, detail="Hotel search failed")

@router.post("/hotels/book")
async def book_hotel(hotel_data: Dict[str, Any]):
    """Book a hotel"""
    user = get_mock_user()
    
    hotel = Hotel(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        confirmation_number=f"HTL{uuid.uuid4().hex[:8].upper()}",
        **hotel_data
    )
    
    hotels.append(hotel.dict())
    logger.info(f"Booked hotel for user {user['id']}")
    
    return {
        "message": "Hotel booked successfully",
        "confirmation_number": hotel.confirmation_number,
        "hotel": hotel.dict()
    }

# Activities
@router.post("/activities", response_model=Activity)
async def create_activity(activity_data: ActivityCreate):
    """Create a new activity"""
    user = get_mock_user()
    
    activity = Activity(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        **activity_data.dict()
    )
    
    activities.append(activity.dict())
    logger.info(f"Created activity for user {user['id']}")
    
    return activity

@router.get("/activities", response_model=List[Activity])
async def get_activities(trip_id: Optional[str] = None):
    """Get user's activities"""
    user = get_mock_user()
    
    user_activities = [activity for activity in activities if activity["user_id"] == user["id"]]
    
    if trip_id:
        user_activities = [activity for activity in user_activities if activity["trip_id"] == trip_id]
    
    return user_activities

# Price Alerts
@router.post("/price-alerts", response_model=PriceAlert)
async def create_price_alert(alert_data: PriceAlertCreate):
    """Create a price alert"""
    user = get_mock_user()
    
    price_alert = PriceAlert(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        **alert_data.dict()
    )
    
    price_alerts.append(price_alert.dict())
    logger.info(f"Created price alert for user {user['id']}")
    
    return price_alert

@router.get("/price-alerts", response_model=List[PriceAlert])
async def get_price_alerts(active_only: bool = True):
    """Get user's price alerts"""
    user = get_mock_user()
    
    user_alerts = [alert for alert in price_alerts if alert["user_id"] == user["id"]]
    
    if active_only:
        user_alerts = [alert for alert in user_alerts if alert["is_active"]]
    
    return user_alerts

# Itinerary Management
@router.post("/trips/{trip_id}/itinerary")
async def create_itinerary(trip_id: str, itinerary_data: List[Dict[str, Any]]):
    """Create itinerary for a trip"""
    user = get_mock_user()
    
    # Verify trip exists
    trip_exists = any(trip["id"] == trip_id and trip["user_id"] == user["id"] for trip in trips)
    if not trip_exists:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    itinerary_days = []
    for i, day_data in enumerate(itinerary_data, 1):
        day = ItineraryDay(
            id=str(uuid.uuid4()),
            trip_id=trip_id,
            day_number=i,
            **day_data
        )
        itinerary_days.append(day.dict())
    
    itineraries.extend(itinerary_days)
    logger.info(f"Created itinerary for trip {trip_id}")
    
    return {"message": "Itinerary created successfully", "days": len(itinerary_days)}

@router.get("/trips/{trip_id}/itinerary", response_model=List[ItineraryDay])
async def get_itinerary(trip_id: str):
    """Get itinerary for a trip"""
    user = get_mock_user()
    
    # Verify trip exists
    trip_exists = any(trip["id"] == trip_id and trip["user_id"] == user["id"] for trip in trips)
    if not trip_exists:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    trip_itinerary = [day for day in itineraries if day["trip_id"] == trip_id]
    trip_itinerary.sort(key=lambda x: x["day_number"])
    
    return trip_itinerary

# Travel Budget
@router.post("/trips/{trip_id}/budget")
async def create_budget_item(trip_id: str, budget_data: Dict[str, Any]):
    """Add budget item to a trip"""
    user = get_mock_user()
    
    budget_item = TravelBudget(
        id=str(uuid.uuid4()),
        trip_id=trip_id,
        **budget_data
    )
    
    budgets.append(budget_item.dict())
    logger.info(f"Added budget item for trip {trip_id}")
    
    return budget_item

@router.get("/trips/{trip_id}/budget", response_model=List[TravelBudget])
async def get_trip_budget(trip_id: str):
    """Get budget for a trip"""
    user = get_mock_user()
    
    trip_budget = [item for item in budgets if item["trip_id"] == trip_id]
    return trip_budget

# Packing Lists
@router.post("/trips/{trip_id}/packing-list")
async def create_packing_list(trip_id: str, packing_data: Dict[str, Any]):
    """Create packing list for a trip"""
    user = get_mock_user()
    
    packing_list = TravelPackingList(
        id=str(uuid.uuid4()),
        trip_id=trip_id,
        **packing_data
    )
    
    packing_lists.append(packing_list.dict())
    logger.info(f"Created packing list for trip {trip_id}")
    
    return packing_list

@router.get("/trips/{trip_id}/packing-list", response_model=List[TravelPackingList])
async def get_packing_list(trip_id: str):
    """Get packing list for a trip"""
    user = get_mock_user()
    
    trip_packing = [item for item in packing_lists if item["trip_id"] == trip_id]
    return trip_packing

# Travel Expenses
@router.post("/trips/{trip_id}/expenses", response_model=TravelExpense)
async def add_expense(trip_id: str, expense_data: Dict[str, Any]):
    """Add expense to a trip"""
    user = get_mock_user()
    
    expense = TravelExpense(
        id=str(uuid.uuid4()),
        trip_id=trip_id,
        **expense_data
    )
    
    expenses.append(expense.dict())
    logger.info(f"Added expense for trip {trip_id}")
    
    return expense

@router.get("/trips/{trip_id}/expenses", response_model=List[TravelExpense])
async def get_trip_expenses(trip_id: str):
    """Get expenses for a trip"""
    user = get_mock_user()
    
    trip_expenses = [expense for expense in expenses if expense["trip_id"] == trip_id]
    return trip_expenses

# Travel Recommendations
@router.get("/recommendations")
async def get_travel_recommendations(
    destination: Optional[str] = None,
    trip_type: Optional[TripType] = None,
    budget_range: Optional[str] = None
):
    """Get travel recommendations"""
    user = get_mock_user()
    
    # Mock recommendations
    mock_recommendations = [
        {
            "id": str(uuid.uuid4()),
            "destination": "Paris, France",
            "trip_type": "romantic",
            "duration": 7,
            "budget_range": "medium",
            "score": 0.95,
            "reasons": ["Perfect for couples", "Rich culture", "Great food"],
            "recommendations": [
                "Visit Eiffel Tower at sunset",
                "Take a Seine River cruise",
                "Explore Montmartre"
            ]
        },
        {
            "id": str(uuid.uuid4()),
            "destination": "Tokyo, Japan",
            "trip_type": "adventure",
            "duration": 10,
            "budget_range": "high",
            "score": 0.88,
            "reasons": ["Unique culture", "Amazing food", "Modern and traditional"],
            "recommendations": [
                "Visit Shibuya Crossing",
                "Explore Tsukiji Fish Market",
                "Take a day trip to Mount Fuji"
            ]
        },
        {
            "id": str(uuid.uuid4()),
            "destination": "Bali, Indonesia",
            "trip_type": "leisure",
            "duration": 14,
            "budget_range": "medium",
            "score": 0.92,
            "reasons": ["Beautiful beaches", "Affordable luxury", "Rich culture"],
            "recommendations": [
                "Visit Ubud Monkey Forest",
                "Relax at Nusa Penida",
                "Experience traditional dance"
            ]
        }
    ]
    
    # Filter recommendations
    if destination:
        mock_recommendations = [r for r in mock_recommendations if destination.lower() in r["destination"].lower()]
    
    if trip_type:
        mock_recommendations = [r for r in mock_recommendations if r["trip_type"] == trip_type]
    
    if budget_range:
        mock_recommendations = [r for r in mock_recommendations if r["budget_range"] == budget_range]
    
    return mock_recommendations

# Travel Insights
@router.get("/insights")
async def get_travel_insights():
    """Get travel insights"""
    user = get_mock_user()
    
    # Mock insights
    mock_insights = [
        {
            "id": str(uuid.uuid4()),
            "type": "spending_pattern",
            "title": "Hotel Spending Trend",
            "description": "You typically spend 40% of your travel budget on accommodation",
            "actionable": True,
            "action_items": ["Consider alternative accommodations", "Book in advance for better rates"]
        },
        {
            "id": str(uuid.uuid4()),
            "type": "destination_preference",
            "title": "Preferred Destinations",
            "description": "You prefer European destinations (60% of your trips)",
            "actionable": True,
            "action_items": ["Explore new regions", "Consider off-season travel"]
        },
        {
            "id": str(uuid.uuid4()),
            "type": "travel_frequency",
            "title": "Travel Frequency",
            "description": "You travel 4 times per year on average",
            "actionable": False,
            "action_items": []
        }
    ]
    
    return mock_insights

# Travel Sharing
@router.post("/share", response_model=TravelShare)
async def share_travel_experience(share_data: Dict[str, Any]):
    """Share travel experience"""
    user = get_mock_user()
    
    travel_share = TravelShare(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        **share_data
    )
    
    travel_shares.append(travel_share.dict())
    logger.info(f"Shared travel experience for user {user['id']}")
    
    return travel_share

@router.get("/shared", response_model=List[TravelShare])
async def get_shared_travel_experiences(visibility: str = "friends"):
    """Get shared travel experiences"""
    user = get_mock_user()
    
    shares = [share for share in travel_shares if share["visibility"] in ["public", visibility]]
    return shares

# Travel Dashboard
@router.get("/dashboard")
async def get_travel_dashboard():
    """Get travel dashboard"""
    user = get_mock_user()
    
    # Get user's trips
    user_trips = [trip for trip in trips if trip["user_id"] == user["id"]]
    
    # Get upcoming trips
    upcoming_trips = [trip for trip in user_trips if trip["start_date"] > datetime.now().date()]
    
    # Get recent trips
    recent_trips = [trip for trip in user_trips if trip["end_date"] < datetime.now().date()][:5]
    
    # Get active price alerts
    active_alerts = [alert for alert in price_alerts if alert["user_id"] == user["id"] and alert["is_active"]]
    
    # Calculate total spending
    total_spending = sum(expense["amount"] for expense in expenses if expense["trip_id"] in [trip["id"] for trip in user_trips])
    
    return {
        "upcoming_trips": upcoming_trips,
        "recent_trips": recent_trips,
        "active_price_alerts": active_alerts,
        "total_spending": total_spending,
        "total_trips": len(user_trips),
        "favorite_destinations": ["Paris", "Tokyo", "New York"],
        "travel_stats": {
            "countries_visited": 12,
            "cities_visited": 25,
            "total_flights": 45,
            "average_trip_duration": 7.5
        }
    }

# Skyscanner API Integration (Mock)
@router.get("/api/skyscanner/flights")
async def skyscanner_flight_search(
    origin: str,
    destination: str,
    departure_date: str,
    return_date: Optional[str] = None,
    adults: int = 1,
    cabin_class: str = "economy"
):
    """Mock Skyscanner flight search API"""
    try:
        # Simulate API delay
        await asyncio.sleep(0.5)
        
        # Mock flight data
        flights_data = [
            {
                "id": "flight_1",
                "airline": "American Airlines",
                "flight_number": "AA123",
                "departure": {
                    "airport": origin,
                    "time": f"{departure_date}T10:00:00Z"
                },
                "arrival": {
                    "airport": destination,
                    "time": f"{departure_date}T12:30:00Z"
                },
                "duration": "2h 30m",
                "stops": 0,
                "price": {
                    "amount": 299.99,
                    "currency": "USD"
                },
                "cabin_class": cabin_class
            },
            {
                "id": "flight_2",
                "airline": "Delta Airlines",
                "flight_number": "DL456",
                "departure": {
                    "airport": origin,
                    "time": f"{departure_date}T14:00:00Z"
                },
                "arrival": {
                    "airport": destination,
                    "time": f"{departure_date}T16:45:00Z"
                },
                "duration": "2h 45m",
                "stops": 1,
                "price": {
                    "amount": 249.99,
                    "currency": "USD"
                },
                "cabin_class": cabin_class
            }
        ]
        
        return {
            "search_params": {
                "origin": origin,
                "destination": destination,
                "departure_date": departure_date,
                "return_date": return_date,
                "adults": adults,
                "cabin_class": cabin_class
            },
            "flights": flights_data,
            "total_results": len(flights_data),
            "search_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Skyscanner API error: {str(e)}")
        raise HTTPException(status_code=500, detail="Flight search failed")

# Popular Destinations
@router.get("/destinations/popular")
async def get_popular_destinations():
    """Get popular travel destinations"""
    return [
        {
            "name": "Paris, France",
            "country": "France",
            "image_url": "https://example.com/paris.jpg",
            "description": "The City of Light offers iconic landmarks, world-class museums, and incredible cuisine.",
            "best_time_to_visit": "April to October",
            "average_cost_per_day": 200,
            "currency": "EUR",
            "highlights": ["Eiffel Tower", "Louvre Museum", "Notre-Dame", "Champs-Élysées"]
        },
        {
            "name": "Tokyo, Japan",
            "country": "Japan",
            "image_url": "https://example.com/tokyo.jpg",
            "description": "A fascinating blend of ultramodern and traditional, offering endless discoveries.",
            "best_time_to_visit": "March to May and September to November",
            "average_cost_per_day": 150,
            "currency": "JPY",
            "highlights": ["Shibuya Crossing", "Senso-ji Temple", "Tokyo Skytree", "Tsukiji Market"]
        },
        {
            "name": "New York City, USA",
            "country": "United States",
            "image_url": "https://example.com/nyc.jpg",
            "description": "The Big Apple offers world-famous attractions, diverse neighborhoods, and endless entertainment.",
            "best_time_to_visit": "April to June and September to November",
            "average_cost_per_day": 300,
            "currency": "USD",
            "highlights": ["Times Square", "Central Park", "Statue of Liberty", "Broadway"]
        },
        {
            "name": "Bali, Indonesia",
            "country": "Indonesia",
            "image_url": "https://example.com/bali.jpg",
            "description": "A paradise island known for its beautiful beaches, spiritual temples, and lush landscapes.",
            "best_time_to_visit": "April to October",
            "average_cost_per_day": 80,
            "currency": "IDR",
            "highlights": ["Ubud Monkey Forest", "Tanah Lot Temple", "Nusa Penida", "Rice Terraces"]
        },
        {
            "name": "Barcelona, Spain",
            "country": "Spain",
            "image_url": "https://example.com/barcelona.jpg",
            "description": "A vibrant city with stunning architecture, beautiful beaches, and rich culture.",
            "best_time_to_visit": "May to June and September to October",
            "average_cost_per_day": 120,
            "currency": "EUR",
            "highlights": ["Sagrada Familia", "Park Güell", "La Rambla", "Gothic Quarter"]
        }
    ]

# Additional Request Models
class DuplicateTripRequest(BaseModel):
    new_start_date: date
    new_end_date: date
    new_title: Optional[str] = None

class ShareTripRequest(BaseModel):
    recipients: List[str]  # Email addresses
    message: Optional[str] = None
    share_type: str = "link"  # "link", "email", "social"

class ExportItineraryRequest(BaseModel):
    format: str = "pdf"  # "pdf", "json", "ical", "csv"
    include_details: bool = True

class ImportTripRequest(BaseModel):
    source: str  # "file", "email", "link"
    data: Optional[str] = None  # For link/email imports

class FlightCreate(BaseModel):
    flight_number: str
    airline: str
    airline_code: str
    origin: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    duration: int
    stops: int = 0
    cabin_class: FlightClass
    price: float
    currency: str = "USD"
    booking_reference: Optional[str] = None
    seat_assignment: Optional[str] = None

class HotelCreate(BaseModel):
    name: str
    address: str
    city: str
    country: str
    check_in: date
    check_out: date
    rooms: int = 1
    room_type: str
    price_per_night: float
    total_price: float
    currency: str = "USD"
    confirmation_number: Optional[str] = None
    amenities: List[str] = []

class RestaurantCreate(BaseModel):
    name: str
    address: str
    city: str
    cuisine_type: str
    reservation_date: date
    reservation_time: str
    party_size: int = 2
    price_range: str = "medium"  # "low", "medium", "high"
    notes: Optional[str] = None

class OptimizeItineraryRequest(BaseModel):
    optimize_for: str = "time"  # "time", "cost", "experience"
    avoid_crowds: bool = False
    include_hidden_gems: bool = False
    pace: str = "moderate"  # "relaxed", "moderate", "fast"

class DirectionsRequest(BaseModel):
    from_location: Dict[str, Any]  # {lat, lng, name}
    to_location: Dict[str, Any]  # {lat, lng, name}
    mode: str = "driving"  # "driving", "walking", "transit", "bicycling"

# Trip Management - Additional Endpoints
@router.post("/trips/{trip_id}/duplicate")
async def duplicate_trip(trip_id: str, request: DuplicateTripRequest):
    """Duplicate a trip with new dates"""
    user = get_mock_user()
    
    # Find original trip
    original_trip = None
    for trip in trips:
        if trip["id"] == trip_id and trip["user_id"] == user["id"]:
            original_trip = trip
            break
    
    if not original_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Create duplicate
    new_trip = Trip(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        title=request.new_title or f"{original_trip['title']} (Copy)",
        description=original_trip.get("description"),
        trip_type=original_trip["trip_type"],
        status=TripStatus.planning,
        destination=original_trip["destination"],
        start_date=request.new_start_date,
        end_date=request.new_end_date,
        budget=original_trip.get("budget"),
        currency=original_trip.get("currency", "USD"),
        travelers=original_trip.get("travelers", []).copy()
    )
    
    trips.append(new_trip.dict())
    logger.info(f"Duplicated trip {trip_id} to {new_trip.id}")
    
    return new_trip

@router.post("/trips/{trip_id}/share")
async def share_trip(trip_id: str, request: ShareTripRequest):
    """Share trip itinerary"""
    user = get_mock_user()
    
    # Verify trip exists
    trip_exists = any(trip["id"] == trip_id and trip["user_id"] == user["id"] for trip in trips)
    if not trip_exists:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Generate share link
    share_token = str(uuid.uuid4())
    share_link = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/shared/trip/{share_token}"
    
    travel_share = TravelShare(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        trip_id=trip_id,
        share_type=request.share_type,
        share_token=share_token,
        recipients=request.recipients,
        message=request.message,
        visibility="public" if request.share_type == "link" else "private"
    )
    
    travel_shares.append(travel_share.dict())
    
    return {
        "share_token": share_token,
        "share_link": share_link,
        "recipients": request.recipients,
        "message": request.message,
        "shared_at": datetime.utcnow().isoformat()
    }

@router.post("/trips/{trip_id}/export")
async def export_itinerary(trip_id: str, request: ExportItineraryRequest):
    """Export itinerary to various formats"""
    user = get_mock_user()
    
    # Verify trip exists
    trip = None
    for t in trips:
        if t["id"] == trip_id and t["user_id"] == user["id"]:
            trip = t
            break
    
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Get itinerary
    trip_itinerary = [day for day in itineraries if day["trip_id"] == trip_id]
    trip_itinerary.sort(key=lambda x: x["day_number"])
    
    # Get activities, flights, hotels
    trip_activities = [a for a in activities if a.get("trip_id") == trip_id]
    trip_flights = [f for f in flights if f.get("trip_id") == trip_id]
    trip_hotels = [h for h in hotels if h.get("trip_id") == trip_id]
    
    export_data = {
        "trip": trip,
        "itinerary": trip_itinerary if request.include_details else [],
        "activities": trip_activities if request.include_details else [],
        "flights": trip_flights if request.include_details else [],
        "hotels": trip_hotels if request.include_details else [],
        "exported_at": datetime.utcnow().isoformat()
    }
    
    if request.format == "json":
        return export_data
    elif request.format == "pdf":
        # In real app, generate PDF
        return {
            "format": "pdf",
            "file_url": f"/exports/trips/{trip_id}/itinerary.pdf",
            "download_link": f"{os.getenv('API_URL', 'http://localhost:8000')}/exports/trips/{trip_id}/itinerary.pdf"
        }
    elif request.format == "ical":
        # In real app, generate iCal file
        return {
            "format": "ical",
            "file_url": f"/exports/trips/{trip_id}/itinerary.ics",
            "download_link": f"{os.getenv('API_URL', 'http://localhost:8000')}/exports/trips/{trip_id}/itinerary.ics"
        }
    elif request.format == "csv":
        # In real app, generate CSV
        return {
            "format": "csv",
            "file_url": f"/exports/trips/{trip_id}/itinerary.csv",
            "download_link": f"{os.getenv('API_URL', 'http://localhost:8000')}/exports/trips/{trip_id}/itinerary.csv"
        }
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format")

@router.post("/trips/import")
async def import_trip(
    source: str = Form(...),
    file: Optional[UploadFile] = File(None),
    data: Optional[str] = Form(None)
):
    """Import trip from file, email, or link"""
    user = get_mock_user()
    
    try:
        if source == "file" and file:
            # Read file content
            content = await file.read()
            # In real app, parse file (JSON, CSV, etc.)
            trip_data = json.loads(content.decode('utf-8'))
        elif source == "link" and data:
            # In real app, fetch from link
            trip_data = json.loads(data)
        elif source == "email" and data:
            # In real app, parse email content
            trip_data = json.loads(data)
        else:
            raise HTTPException(status_code=400, detail="Invalid import source or missing data")
        
        # Create trip from imported data
        trip = Trip(
            id=str(uuid.uuid4()),
            user_id=user["id"],
            title=trip_data.get("title", "Imported Trip"),
            description=trip_data.get("description"),
            trip_type=trip_data.get("trip_type", TripType.leisure),
            destination=trip_data.get("destination", ""),
            start_date=datetime.fromisoformat(trip_data["start_date"]).date() if trip_data.get("start_date") else date.today(),
            end_date=datetime.fromisoformat(trip_data["end_date"]).date() if trip_data.get("end_date") else date.today() + timedelta(days=7),
            budget=trip_data.get("budget"),
            currency=trip_data.get("currency", "USD")
        )
        
        trips.append(trip.dict())
        logger.info(f"Imported trip for user {user['id']}")
        
        return {
            "message": "Trip imported successfully",
            "trip_id": trip.id,
            "trip": trip.dict()
        }
        
    except Exception as e:
        logger.error(f"Error importing trip: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to import trip: {str(e)}")

# Activity Management
@router.post("/trips/{trip_id}/activities")
async def add_activity(trip_id: str, activity_data: ActivityCreate):
    """Add activity to trip"""
    user = get_mock_user()
    
    # Verify trip exists
    trip_exists = any(trip["id"] == trip_id and trip["user_id"] == user["id"] for trip in trips)
    if not trip_exists:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    activity = Activity(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        trip_id=trip_id,
        **activity_data.dict()
    )
    
    activities.append(activity.dict())
    logger.info(f"Added activity to trip {trip_id}")
    
    return activity

@router.put("/trips/{trip_id}/activities/{activity_id}")
async def update_activity(
    trip_id: str,
    activity_id: str,
    activity_data: Dict[str, Any]
):
    """Update activity"""
    user = get_mock_user()
    
    # Find activity
    activity = None
    for a in activities:
        if a["id"] == activity_id and a.get("trip_id") == trip_id and a["user_id"] == user["id"]:
            activity = a
            break
    
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    activity.update(activity_data)
    activity["updated_at"] = datetime.utcnow().isoformat()
    
    return {"message": "Activity updated successfully", "activity": activity}

@router.delete("/trips/{trip_id}/activities/{activity_id}")
async def delete_activity(trip_id: str, activity_id: str):
    """Delete activity"""
    user = get_mock_user()
    
    # Find and remove activity
    global activities
    activity_found = False
    for i, a in enumerate(activities):
        if a["id"] == activity_id and a.get("trip_id") == trip_id and a["user_id"] == user["id"]:
            activities.pop(i)
            activity_found = True
            break
    
    if not activity_found:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    return {"message": "Activity deleted successfully"}

# Flight Management
@router.post("/trips/{trip_id}/flights")
async def add_flight(trip_id: str, flight_data: FlightCreate):
    """Add flight to trip"""
    user = get_mock_user()
    
    # Verify trip exists
    trip_exists = any(trip["id"] == trip_id and trip["user_id"] == user["id"] for trip in trips)
    if not trip_exists:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    flight = Flight(
        id=str(uuid.uuid4()),
        trip_id=trip_id,
        user_id=user["id"],
        **flight_data.dict()
    )
    
    flights.append(flight.dict())
    logger.info(f"Added flight to trip {trip_id}")
    
    return flight

@router.put("/trips/{trip_id}/flights/{flight_id}")
async def update_flight(
    trip_id: str,
    flight_id: str,
    flight_data: Dict[str, Any]
):
    """Update flight"""
    user = get_mock_user()
    
    # Find flight
    flight = None
    for f in flights:
        if f["id"] == flight_id and f.get("trip_id") == trip_id and f["user_id"] == user["id"]:
            flight = f
            break
    
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    
    flight.update(flight_data)
    flight["updated_at"] = datetime.utcnow().isoformat()
    
    return {"message": "Flight updated successfully", "flight": flight}

@router.delete("/trips/{trip_id}/flights/{flight_id}")
async def delete_flight(trip_id: str, flight_id: str):
    """Delete flight"""
    user = get_mock_user()
    
    # Find and remove flight
    global flights
    flight_found = False
    for i, f in enumerate(flights):
        if f["id"] == flight_id and f.get("trip_id") == trip_id and f["user_id"] == user["id"]:
            flights.pop(i)
            flight_found = True
            break
    
    if not flight_found:
        raise HTTPException(status_code=404, detail="Flight not found")
    
    return {"message": "Flight deleted successfully"}

@router.get("/flights/{flight_id}")
async def get_flight_details(flight_id: str):
    """Get flight details"""
    user = get_mock_user()
    
    flight = next((f for f in flights if f["id"] == flight_id and f["user_id"] == user["id"]), None)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    
    return flight

# Hotel Management
@router.post("/trips/{trip_id}/hotels")
async def add_hotel(trip_id: str, hotel_data: HotelCreate):
    """Add hotel to trip"""
    user = get_mock_user()
    
    # Verify trip exists
    trip_exists = any(trip["id"] == trip_id and trip["user_id"] == user["id"] for trip in trips)
    if not trip_exists:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    hotel = Hotel(
        id=str(uuid.uuid4()),
        trip_id=trip_id,
        user_id=user["id"],
        **hotel_data.dict()
    )
    
    hotels.append(hotel.dict())
    logger.info(f"Added hotel to trip {trip_id}")
    
    return hotel

@router.put("/trips/{trip_id}/hotels/{hotel_id}")
async def update_hotel(
    trip_id: str,
    hotel_id: str,
    hotel_data: Dict[str, Any]
):
    """Update hotel"""
    user = get_mock_user()
    
    # Find hotel
    hotel = None
    for h in hotels:
        if h["id"] == hotel_id and h.get("trip_id") == trip_id and h["user_id"] == user["id"]:
            hotel = h
            break
    
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    hotel.update(hotel_data)
    hotel["updated_at"] = datetime.utcnow().isoformat()
    
    return {"message": "Hotel updated successfully", "hotel": hotel}

@router.delete("/trips/{trip_id}/hotels/{hotel_id}")
async def delete_hotel(trip_id: str, hotel_id: str):
    """Delete hotel"""
    user = get_mock_user()
    
    # Find and remove hotel
    global hotels
    hotel_found = False
    for i, h in enumerate(hotels):
        if h["id"] == hotel_id and h.get("trip_id") == trip_id and h["user_id"] == user["id"]:
            hotels.pop(i)
            hotel_found = True
            break
    
    if not hotel_found:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    return {"message": "Hotel deleted successfully"}

@router.get("/hotels/{hotel_id}")
async def get_hotel_details(hotel_id: str):
    """Get hotel details"""
    user = get_mock_user()
    
    hotel = next((h for h in hotels if h["id"] == hotel_id and h["user_id"] == user["id"]), None)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    return hotel

# Restaurant Management
@router.post("/trips/{trip_id}/restaurants")
async def add_restaurant(trip_id: str, restaurant_data: RestaurantCreate):
    """Add restaurant to trip"""
    user = get_mock_user()
    
    # Verify trip exists
    trip_exists = any(trip["id"] == trip_id and trip["user_id"] == user["id"] for trip in trips)
    if not trip_exists:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    restaurant = {
        "id": str(uuid.uuid4()),
        "trip_id": trip_id,
        "user_id": user["id"],
        **restaurant_data.dict(),
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Add to activities as restaurant type
    activity = Activity(
        id=restaurant["id"],
        user_id=user["id"],
        trip_id=trip_id,
        name=restaurant_data.name,
        type="restaurant",
        location=restaurant_data.address,
        date=restaurant_data.reservation_date,
        start_time=restaurant_data.reservation_time,
        price=0,  # Restaurant price handled separately
        notes=restaurant_data.notes
    )
    activities.append(activity.dict())
    
    logger.info(f"Added restaurant to trip {trip_id}")
    
    return restaurant

@router.put("/trips/{trip_id}/restaurants/{restaurant_id}")
async def update_restaurant(
    trip_id: str,
    restaurant_id: str,
    restaurant_data: Dict[str, Any]
):
    """Update restaurant"""
    user = get_mock_user()
    
    # Find restaurant (stored as activity)
    restaurant = None
    for a in activities:
        if a["id"] == restaurant_id and a.get("trip_id") == trip_id and a["user_id"] == user["id"] and a.get("type") == "restaurant":
            restaurant = a
            break
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    restaurant.update(restaurant_data)
    restaurant["updated_at"] = datetime.utcnow().isoformat()
    
    return {"message": "Restaurant updated successfully", "restaurant": restaurant}

@router.delete("/trips/{trip_id}/restaurants/{restaurant_id}")
async def delete_restaurant(trip_id: str, restaurant_id: str):
    """Delete restaurant"""
    user = get_mock_user()
    
    # Find and remove restaurant (stored as activity)
    global activities
    restaurant_found = False
    for i, a in enumerate(activities):
        if a["id"] == restaurant_id and a.get("trip_id") == trip_id and a["user_id"] == user["id"] and a.get("type") == "restaurant":
            activities.pop(i)
            restaurant_found = True
            break
    
    if not restaurant_found:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    return {"message": "Restaurant deleted successfully"}

@router.post("/restaurants/search")
async def search_restaurants(
    destination: str = Query(...),
    cuisine_type: Optional[str] = Query(None),
    price_range: Optional[str] = Query(None),
    rating: Optional[float] = Query(None, ge=0, le=5)
):
    """Search restaurants"""
    # Mock restaurant search
    mock_restaurants = [
        {
            "id": str(uuid.uuid4()),
            "name": "Le Bistro",
            "cuisine_type": "French",
            "address": "123 Main St",
            "city": destination,
            "rating": 4.5,
            "price_range": "medium",
            "image_url": "https://example.com/restaurant1.jpg"
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Sushi Master",
            "cuisine_type": "Japanese",
            "address": "456 Oak Ave",
            "city": destination,
            "rating": 4.8,
            "price_range": "high",
            "image_url": "https://example.com/restaurant2.jpg"
        }
    ]
    
    # Apply filters
    if cuisine_type:
        mock_restaurants = [r for r in mock_restaurants if r["cuisine_type"].lower() == cuisine_type.lower()]
    if price_range:
        mock_restaurants = [r for r in mock_restaurants if r["price_range"] == price_range]
    if rating:
        mock_restaurants = [r for r in mock_restaurants if r["rating"] >= rating]
    
    return {
        "destination": destination,
        "restaurants": mock_restaurants,
        "total_results": len(mock_restaurants)
    }

@router.get("/restaurants/{restaurant_id}")
async def get_restaurant_details(restaurant_id: str):
    """Get restaurant details"""
    # Mock restaurant details
    return {
        "id": restaurant_id,
        "name": "Le Bistro",
        "cuisine_type": "French",
        "address": "123 Main St",
        "city": "Paris",
        "country": "France",
        "rating": 4.5,
        "price_range": "medium",
        "phone": "+33 1 23 45 67 89",
        "hours": "Mon-Sun: 12:00 PM - 11:00 PM",
        "menu": [],
        "reviews": [],
        "images": []
    }

# Itinerary Optimization
@router.post("/trips/{trip_id}/optimize")
async def optimize_itinerary(trip_id: str, request: OptimizeItineraryRequest):
    """Optimize itinerary using AI"""
    user = get_mock_user()
    
    # Verify trip exists
    trip = None
    for t in trips:
        if t["id"] == trip_id and t["user_id"] == user["id"]:
            trip = t
            break
    
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Get current itinerary
    trip_itinerary = [day for day in itineraries if day["trip_id"] == trip_id]
    trip_activities = [a for a in activities if a.get("trip_id") == trip_id]
    
    # Use AI to optimize
    ai_prompt = f"""
    Optimize this travel itinerary:
    Destination: {trip['destination']}
    Dates: {trip['start_date']} to {trip['end_date']}
    Optimization Goal: {request.optimize_for}
    Avoid Crowds: {request.avoid_crowds}
    Include Hidden Gems: {request.include_hidden_gems}
    Pace: {request.pace}
    
    Current Activities: {len(trip_activities)}
    
    Provide:
    1. Optimized day-by-day schedule
    2. Time and cost savings
    3. Improved route efficiency
    4. Recommendations
    """
    
    try:
        ai_optimization = await ai_service.generate_response(ai_prompt, {
            "trip": trip,
            "itinerary": trip_itinerary,
            "activities": trip_activities
        })
        
        return {
            "trip_id": trip_id,
            "optimization_goal": request.optimize_for,
            "optimized_itinerary": trip_itinerary,  # Would be replaced with optimized version
            "ai_analysis": ai_optimization,
            "estimated_savings": {
                "time": "2 hours",
                "cost": "$50"
            },
            "optimized_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error optimizing itinerary: {e}")
        raise HTTPException(status_code=500, detail="Failed to optimize itinerary")

# Map and Directions
@router.get("/trips/{trip_id}/map")
async def get_trip_map(trip_id: str):
    """Get map data for trip"""
    user = get_mock_user()
    
    # Verify trip exists
    trip_exists = any(trip["id"] == trip_id and trip["user_id"] == user["id"] for trip in trips)
    if not trip_exists:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Get all locations from activities, flights, hotels
    trip_activities = [a for a in activities if a.get("trip_id") == trip_id]
    trip_flights = [f for f in flights if f.get("trip_id") == trip_id]
    trip_hotels = [h for h in hotels if h.get("trip_id") == trip_id]
    
    locations = []
    
    # Add destination
    locations.append({
        "name": "Destination",
        "type": "destination",
        "lat": 48.8566,  # Mock coordinates
        "lng": 2.3522,
        "address": "Destination City"
    })
    
    # Add hotels
    for hotel in trip_hotels:
        locations.append({
            "name": hotel.get("name", "Hotel"),
            "type": "hotel",
            "lat": 48.8566 + (len(locations) * 0.01),
            "lng": 2.3522 + (len(locations) * 0.01),
            "address": hotel.get("address", "")
        })
    
    # Add activities
    for activity in trip_activities:
        locations.append({
            "name": activity.get("name", "Activity"),
            "type": activity.get("type", "activity"),
            "lat": 48.8566 + (len(locations) * 0.01),
            "lng": 2.3522 + (len(locations) * 0.01),
            "address": activity.get("location", "")
        })
    
    return {
        "trip_id": trip_id,
        "locations": locations,
        "center": {
            "lat": 48.8566,
            "lng": 2.3522
        },
        "zoom": 12,
        "map_url": f"https://maps.googleapis.com/maps/api/staticmap?center=48.8566,2.3522&zoom=12&size=600x400&markers=color:red|48.8566,2.3522"
    }

@router.get("/trips/{trip_id}/directions")
async def get_trip_directions(
    trip_id: str,
    from_location: str = Query(...),
    to_location: str = Query(...),
    mode: str = Query("driving", regex="^(driving|walking|transit|bicycling)$")
):
    """Get directions between locations"""
    user = get_mock_user()
    
    # Verify trip exists
    trip_exists = any(trip["id"] == trip_id and trip["user_id"] == user["id"] for trip in trips)
    if not trip_exists:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Mock directions (in real app, use Google Maps Directions API)
    return {
        "from": from_location,
        "to": to_location,
        "mode": mode,
        "distance": "5.2 km",
        "duration": "15 minutes",
        "steps": [
            {"instruction": "Head north on Main St", "distance": "0.5 km", "duration": "2 min"},
            {"instruction": "Turn right on Oak Ave", "distance": "2.0 km", "duration": "5 min"},
            {"instruction": "Turn left on Park Blvd", "distance": "2.7 km", "duration": "8 min"}
        ],
        "route": {
            "overview_polyline": "mock_polyline_data",
            "bounds": {
                "northeast": {"lat": 48.8600, "lng": 2.3600},
                "southwest": {"lat": 48.8500, "lng": 2.3400}
            }
        }
    }

# Enhanced Flight Booking
@router.post("/flights/book")
async def book_flight_enhanced(flight_data: Dict[str, Any]):
    """Enhanced flight booking with additional features"""
    user = get_mock_user()
    
    # Enhanced booking with seat selection, meal preferences, etc.
    flight = Flight(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        booking_reference=f"BK{uuid.uuid4().hex[:8].upper()}",
        **flight_data
    )
    
    flights.append(flight.dict())
    logger.info(f"Booked flight for user {user['id']}")
    
    # In real app, integrate with booking API
    return {
        "message": "Flight booked successfully",
        "booking_reference": flight.booking_reference,
        "flight": flight.dict(),
        "confirmation_email_sent": True,
        "check_in_available": True,
        "check_in_opens": (datetime.utcnow() + timedelta(days=1)).isoformat()
    }

# Enhanced Hotel Booking
@router.post("/hotels/book")
async def book_hotel_enhanced(hotel_data: Dict[str, Any]):
    """Enhanced hotel booking"""
    user = get_mock_user()
    
    hotel = Hotel(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        confirmation_number=f"HTL{uuid.uuid4().hex[:8].upper()}",
        **hotel_data
    )
    
    hotels.append(hotel.dict())
    logger.info(f"Booked hotel for user {user['id']}")
    
    return {
        "message": "Hotel booked successfully",
        "confirmation_number": hotel.confirmation_number,
        "hotel": hotel.dict(),
        "confirmation_email_sent": True,
        "cancellation_policy": "Free cancellation until 24 hours before check-in"
    }

# Price Alerts Enhancement
@router.put("/price-alerts/{alert_id}")
async def update_price_alert(alert_id: str, alert_data: Dict[str, Any]):
    """Update price alert"""
    user = get_mock_user()
    
    # Find alert
    alert = None
    for a in price_alerts:
        if a["id"] == alert_id and a["user_id"] == user["id"]:
            alert = a
            break
    
    if not alert:
        raise HTTPException(status_code=404, detail="Price alert not found")
    
    alert.update(alert_data)
    alert["updated_at"] = datetime.utcnow().isoformat()
    
    return {"message": "Price alert updated successfully", "alert": alert}

@router.delete("/price-alerts/{alert_id}")
async def delete_price_alert(alert_id: str):
    """Delete price alert"""
    user = get_mock_user()
    
    # Find and remove alert
    global price_alerts
    alert_found = False
    for i, a in enumerate(price_alerts):
        if a["id"] == alert_id and a["user_id"] == user["id"]:
            price_alerts.pop(i)
            alert_found = True
            break
    
    if not alert_found:
        raise HTTPException(status_code=404, detail="Price alert not found")
    
    return {"message": "Price alert deleted successfully"}

# AI Features
@router.post("/ai/planner")
async def ai_travel_planner(request: Dict[str, Any]):
    """AI travel planner"""
    try:
        ai_prompt = f"""
        Plan a trip based on:
        Destination: {request.get('destination', 'Unknown')}
        Dates: {request.get('start_date', 'Unknown')} to {request.get('end_date', 'Unknown')}
        Budget: ${request.get('budget', 0)}
        Travelers: {request.get('travelers', 1)}
        Preferences: {request.get('preferences', {})}
        
        Provide:
        1. Day-by-day itinerary
        2. Recommended activities
        3. Restaurant suggestions
        4. Budget breakdown
        5. Travel tips
        """
        
        ai_plan = await ai_service.generate_response(ai_prompt, request)
        
        return {
            "plan": ai_plan,
            "itinerary": [],  # Would be extracted from AI response
            "activities": [],
            "restaurants": [],
            "budget_breakdown": {},
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in AI travel planner: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate travel plan")

@router.post("/ai/optimize")
async def ai_optimize_itinerary(request: Dict[str, Any]):
    """AI itinerary optimizer"""
    trip_id = request.get("trip_id")
    if not trip_id:
        raise HTTPException(status_code=400, detail="trip_id is required")
    
    user = get_mock_user()
    
    # Verify trip exists
    trip = None
    for t in trips:
        if t["id"] == trip_id and t["user_id"] == user["id"]:
            trip = t
            break
    
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Get itinerary data
    trip_itinerary = [day for day in itineraries if day["trip_id"] == trip_id]
    trip_activities = [a for a in activities if a.get("trip_id") == trip_id]
    
    ai_prompt = f"""
    Optimize this travel itinerary:
    Destination: {trip['destination']}
    Current Activities: {len(trip_activities)}
    Optimization Preferences: {request.get('preferences', {})}
    
    Provide optimized schedule with:
    1. Better time management
    2. Reduced travel time
    3. Cost optimization
    4. Experience enhancement
    """
    
    try:
        ai_optimization = await ai_service.generate_response(ai_prompt, {
            "trip": trip,
            "itinerary": trip_itinerary,
            "activities": trip_activities
        })
        
        return {
            "trip_id": trip_id,
            "optimized_itinerary": trip_itinerary,
            "ai_analysis": ai_optimization,
            "improvements": {
                "time_saved": "2 hours",
                "cost_saved": "$50",
                "efficiency_gain": "15%"
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in AI optimization: {e}")
        raise HTTPException(status_code=500, detail="Failed to optimize itinerary")

@router.post("/ai/destination-finder")
async def ai_destination_finder(request: Dict[str, Any]):
    """AI destination finder"""
    try:
        ai_prompt = f"""
        Find travel destinations based on:
        Budget: ${request.get('budget', 0)}
        Travel Style: {request.get('travel_style', 'any')}
        Climate: {request.get('climate', 'any')}
        Companions: {request.get('companions', 'solo')}
        Duration: {request.get('duration', 'any')}
        Keywords: {request.get('keywords', '')}
        
        Provide:
        1. Top destination recommendations
        2. Why each destination matches
        3. Best time to visit
        4. Estimated costs
        5. Highlights
        """
        
        ai_recommendations = await ai_service.generate_response(ai_prompt, request)
        
        # Mock destinations (would be extracted from AI response)
        return {
            "recommendations": [
                {
                    "destination": "Paris, France",
                    "match_score": 95,
                    "reasoning": "Matches your preferences for cultural experiences",
                    "estimated_cost": 2000,
                    "best_time": "April to October"
                }
            ],
            "ai_analysis": ai_recommendations,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in AI destination finder: {e}")
        raise HTTPException(status_code=500, detail="Failed to find destinations")

@router.post("/ai/budget-optimizer")
async def ai_budget_optimizer(request: Dict[str, Any]):
    """AI budget optimizer"""
    try:
        trip_budget = request.get("trip_budget", 0)
        trip_duration = request.get("trip_duration_days", 7)
        existing_expenses = request.get("existing_expenses", [])
        
        ai_prompt = f"""
        Optimize travel budget:
        Total Budget: ${trip_budget}
        Duration: {trip_duration} days
        Existing Expenses: {existing_expenses}
        
        Provide:
        1. Optimized budget allocation
        2. Cost-saving recommendations
        3. Category breakdown
        4. Savings opportunities
        """
        
        ai_optimization = await ai_service.generate_response(ai_prompt, request)
        
        return {
            "original_budget": trip_budget,
            "optimized_budget": trip_budget * 0.9,  # 10% savings
            "savings": trip_budget * 0.1,
            "category_breakdown": {
                "accommodation": trip_budget * 0.4,
                "transportation": trip_budget * 0.3,
                "food": trip_budget * 0.2,
                "activities": trip_budget * 0.1
            },
            "recommendations": [
                "Book accommodation in advance for better rates",
                "Consider alternative transportation options"
            ],
            "ai_analysis": ai_optimization,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in AI budget optimizer: {e}")
        raise HTTPException(status_code=500, detail="Failed to optimize budget")

@router.post("/ai/price-prediction")
async def ai_flight_price_prediction(request: Dict[str, Any]):
    """AI flight price prediction"""
    try:
        origin = request.get("origin")
        destination = request.get("destination")
        departure_date = request.get("departure_date")
        current_price = request.get("current_price", 0)
        
        ai_prompt = f"""
        Predict flight price trends:
        Route: {origin} to {destination}
        Departure Date: {departure_date}
        Current Price: ${current_price}
        
        Provide:
        1. Price trend prediction
        2. Best time to buy
        3. Expected price range
        4. Confidence level
        """
        
        ai_prediction = await ai_service.generate_response(ai_prompt, request)
        
        return {
            "route": f"{origin} to {destination}",
            "departure_date": departure_date,
            "current_price": current_price,
            "predicted_trend": "decreasing",
            "predicted_price_range": {
                "min": current_price * 0.85,
                "max": current_price * 0.95
            },
            "best_time_to_buy": "within 2 weeks",
            "confidence": 0.75,
            "ai_analysis": ai_prediction,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in AI price prediction: {e}")
        raise HTTPException(status_code=500, detail="Failed to predict prices")

@router.post("/ai/activity-recommendations")
async def ai_activity_recommendations(request: Dict[str, Any]):
    """AI activity recommendations"""
    try:
        destination = request.get("destination", "")
        trip_dates = request.get("trip_dates", {})
        preferences = request.get("traveler_preferences", [])
        
        ai_prompt = f"""
        Recommend activities for:
        Destination: {destination}
        Dates: {trip_dates.get('start', '')} to {trip_dates.get('end', '')}
        Preferences: {', '.join(preferences)}
        
        Provide:
        1. Activity recommendations
        2. Why each activity is recommended
        3. Best times to visit
        4. Cost estimates
        """
        
        ai_recommendations = await ai_service.generate_response(ai_prompt, request)
        
        return {
            "destination": destination,
            "recommendations": [
                {
                    "name": "Explore Historic Old Town",
                    "type": "cultural",
                    "duration": "3 hours",
                    "cost": "low",
                    "rating": 4.7,
                    "match_score": 92,
                    "reasoning": "Aligns with your cultural preferences"
                }
            ],
            "ai_analysis": ai_recommendations,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in AI activity recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

@router.post("/ai/restaurant-recommendations")
async def ai_restaurant_recommendations(request: Dict[str, Any]):
    """AI restaurant recommendations"""
    try:
        destination = request.get("destination", "")
        meal_type = request.get("meal_type", "any")
        cuisine_preferences = request.get("cuisine_preferences", [])
        budget = request.get("budget", "any")
        
        ai_prompt = f"""
        Recommend restaurants for:
        Destination: {destination}
        Meal Type: {meal_type}
        Cuisine Preferences: {', '.join(cuisine_preferences)}
        Budget: {budget}
        
        Provide:
        1. Restaurant recommendations
        2. Why each restaurant is recommended
        3. Best dishes to try
        4. Reservation tips
        """
        
        ai_recommendations = await ai_service.generate_response(ai_prompt, request)
        
        return {
            "destination": destination,
            "recommendations": [
                {
                    "name": "Le Bistro",
                    "cuisine": "French",
                    "rating": 4.9,
                    "price_range": "high",
                    "match_score": 95,
                    "reasoning": "Matches your fine dining preference"
                }
            ],
            "ai_analysis": ai_recommendations,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in AI restaurant recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")
