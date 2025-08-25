from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime, date, timedelta
import structlog
import uuid
import httpx
import asyncio

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
