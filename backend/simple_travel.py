from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
import uuid
import json
import asyncio
import httpx
import io
from enum import Enum
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

app = FastAPI(title="Travel API", version="1.0.0")

# Booking.com API configuration
BOOKING_API_HOST = "booking-com15.p.rapidapi.com"
BOOKING_API_KEY = "your_rapidapi_key"  # Replace with actual RapidAPI key

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:5173", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enums
class TripType(str, Enum):
    business = "business"
    leisure = "leisure"
    family = "family"
    adventure = "adventure"
    romantic = "romantic"
    solo = "solo"
    group = "group"

class TripStatus(str, Enum):
    planning = "planning"
    booked = "booked"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"

class FlightClass(str, Enum):
    economy = "economy"
    premium_economy = "premium_economy"
    business = "business"
    first = "first"

# Pydantic Models
class Trip(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    description: Optional[str] = None
    trip_type: str = "leisure"  # Accept string instead of enum
    status: str = "planning"  # Accept string instead of enum
    destination: str
    start_date: date
    end_date: date
    budget: Optional[float] = None
    currency: str = "USD"
    travelers: List[Dict[str, Any]] = []
    flights: List[Dict[str, Any]] = []
    hotels: List[Dict[str, Any]] = []
    activities: List[Dict[str, Any]] = []
    itinerary: List[Dict[str, Any]] = []
    documents: List[Dict[str, Any]] = []
    notes: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

class TripCreate(BaseModel):
    title: str
    description: Optional[str] = None
    trip_type: str = "leisure"  # Accept string instead of enum
    destination: str
    start_date: date
    end_date: date
    budget: Optional[float] = None
    currency: str = "USD"
    travelers: List[Dict[str, Any]] = []

class Flight(BaseModel):
    id: Optional[str] = None
    trip_id: Optional[str] = None
    flight_number: str
    airline: str
    airline_code: str
    origin: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    duration: int
    stops: int = 0
    cabin_class: str = "economy"  # Accept string instead of enum
    price: float
    currency: str = "USD"
    booking_reference: Optional[str] = None
    seat_assignment: Optional[str] = None
    status: str = "confirmed"
    created_at: datetime = datetime.utcnow()

class Hotel(BaseModel):
    id: Optional[str] = None
    trip_id: Optional[str] = None
    name: str
    address: str
    city: str
    country: str
    check_in: date
    check_out: date
    room_type: str
    price_per_night: float
    currency: str = "USD"
    rating: float
    amenities: List[str] = []
    booking_reference: Optional[str] = None
    status: str = "confirmed"
    created_at: datetime = datetime.utcnow()

class Activity(BaseModel):
    id: Optional[str] = None
    trip_id: Optional[str] = None
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
    created_at: datetime = datetime.utcnow()

class PriceAlert(BaseModel):
    id: Optional[str] = None
    user_id: str
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date] = None
    target_price: float
    currency: str = "USD"
    cabin_class: FlightClass = FlightClass.economy
    is_active: bool = True
    created_at: datetime = datetime.utcnow()

class PriceAlertCreate(BaseModel):
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date] = None
    target_price: float
    currency: str = "USD"
    cabin_class: FlightClass = FlightClass.economy

class TravelBudget(BaseModel):
    id: Optional[str] = None
    trip_id: str
    category: str
    planned_amount: float
    actual_amount: float = 0.0
    currency: str = "USD"
    notes: Optional[str] = None
    created_at: datetime = datetime.utcnow()

class TravelExpense(BaseModel):
    id: Optional[str] = None
    trip_id: str
    category: str
    amount: float
    currency: str = "USD"
    date: date
    description: str
    receipt_url: Optional[str] = None
    created_at: datetime = datetime.utcnow()

class TravelRecommendation(BaseModel):
    id: Optional[str] = None
    destination: str
    title: str
    description: str
    image_url: str
    price_range: str
    rating: float
    category: str
    tags: List[str] = []
    created_at: datetime = datetime.utcnow()

class TravelInsight(BaseModel):
    id: Optional[str] = None
    user_id: str
    type: str
    title: str
    content: str
    data: Dict[str, Any] = {}
    created_at: datetime = datetime.utcnow()

# Flight Booking Models
class PassengerDetails(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    date_of_birth: date
    passport_number: str
    nationality: str

class SeatSelection(BaseModel):
    seat_number: str
    seat_type: str  # window, aisle, middle
    price: float

class PaymentDetails(BaseModel):
    card_number: str
    card_holder: str
    expiry_date: str
    cvv: str

class FlightBooking(BaseModel):
    id: Optional[str] = None
    user_id: str
    flight_id: str
    passenger_details: PassengerDetails
    seat_selection: Optional[SeatSelection] = None
    payment_details: PaymentDetails
    booking_reference: Optional[str] = None
    total_price: float
    status: str = "pending"  # pending, confirmed, cancelled
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

class FlightBookingCreate(BaseModel):
    flight_id: str
    passenger_details: PassengerDetails
    seat_selection: Optional[SeatSelection] = None
    payment_details: PaymentDetails

class FlightTicket(BaseModel):
    id: Optional[str] = None
    booking_id: str
    ticket_number: str
    passenger_name: str
    flight_details: Dict[str, Any]
    seat_details: Optional[Dict[str, Any]] = None
    boarding_time: Optional[str] = None
    gate: Optional[str] = None
    created_at: datetime = datetime.utcnow()

# Flight Search Models
class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    adults: int = 1
    children: int = 0
    infants: int = 0
    cabin_class: str = "economy"  # Accept string instead of enum
    currency: str = "USD"
    
    class Config:
        # Allow extra fields and ignore validation errors
        extra = "ignore"

class FlightSearchResult(BaseModel):
    id: str
    airline: str
    flight_number: str
    origin: str
    destination: str
    departure_time: str
    arrival_time: str
    duration: str
    price: float
    currency: str = "USD"
    cabin_class: str = "economy"  # Accept string instead of enum
    stops: int = 0
    aircraft: Optional[str] = None
    booking_url: Optional[str] = None

# In-memory storage
trips = []
flights = []
hotels = []
activities = []
price_alerts = []
budgets = []
expenses = []
recommendations = []
insights = []
flight_bookings = []
flight_tickets = []
available_seats = []

# Sample data
def initialize_sample_data():
    global trips, flights, hotels, activities, price_alerts, budgets, expenses, recommendations, insights, flight_bookings, flight_tickets, available_seats
    
    # Sample trips
    trips.extend([
        {
            "id": "trip_1",
            "user_id": "user_123",
            "title": "Tokyo Adventure",
            "description": "Exploring the vibrant city of Tokyo",
            "trip_type": "leisure",
            "status": "booked",
            "destination": "Tokyo, Japan",
            "start_date": date(2024, 3, 15),
            "end_date": date(2024, 3, 22),
            "budget": 2500.0,
            "currency": "USD",
            "travelers": [{"name": "John Doe", "age": 30}],
            "flights": [],
            "hotels": [],
            "activities": [],
            "itinerary": [],
            "documents": [],
            "notes": "Excited for this trip!",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": "trip_2",
            "user_id": "user_123",
            "title": "Paris Getaway",
            "description": "Romantic trip to the City of Light",
            "trip_type": "romantic",
            "status": "planning",
            "destination": "Paris, France",
            "start_date": date(2024, 5, 10),
            "end_date": date(2024, 5, 17),
            "budget": 3000.0,
            "currency": "USD",
            "travelers": [{"name": "John Doe", "age": 30}, {"name": "Jane Doe", "age": 28}],
            "flights": [],
            "hotels": [],
            "activities": [],
            "itinerary": [],
            "documents": [],
            "notes": "Planning phase",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ])
    
    # Sample flights
    flights.extend([
        {
            "id": "flight_1",
            "trip_id": "trip_1",
            "flight_number": "NH 12",
            "airline": "All Nippon Airways",
            "airline_code": "NH",
            "origin": "SFO",
            "destination": "NRT",
            "departure_time": datetime(2024, 3, 15, 10, 30),
            "arrival_time": datetime(2024, 3, 16, 14, 45),
            "duration": 735,
            "stops": 0,
            "cabin_class": FlightClass.economy,
            "price": 850.0,
            "currency": "USD",
            "booking_reference": "ABC123",
            "seat_assignment": "12A",
            "status": "confirmed",
            "created_at": datetime.utcnow()
        }
    ])
    
    # Sample hotels
    hotels.extend([
        {
            "id": "hotel_1",
            "trip_id": "trip_1",
            "name": "Park Hyatt Tokyo",
            "address": "3-7-1-2 Nishi-Shinjuku, Shinjuku-ku",
            "city": "Tokyo",
            "country": "Japan",
            "check_in": date(2024, 3, 15),
            "check_out": date(2024, 3, 22),
            "room_type": "Deluxe Room",
            "price_per_night": 350.0,
            "currency": "USD",
            "rating": 4.8,
            "amenities": ["WiFi", "Pool", "Spa", "Restaurant"],
            "booking_reference": "PHY123",
            "status": "confirmed",
            "created_at": datetime.utcnow()
        }
    ])
    
    # Sample activities
    activities.extend([
        {
            "id": "activity_1",
            "trip_id": "trip_1",
            "name": "Senso-ji Temple Visit",
            "description": "Visit the oldest temple in Tokyo",
            "type": "Cultural",
            "location": "Asakusa, Tokyo",
            "date": date(2024, 3, 16),
            "start_time": "09:00",
            "end_time": "12:00",
            "price": 0.0,
            "currency": "USD",
            "notes": "Free entry, traditional market nearby",
            "created_at": datetime.utcnow()
        }
    ])
    
    # Sample price alerts
    price_alerts.extend([
        {
            "id": "alert_1",
            "user_id": "user_123",
            "origin": "SFO",
            "destination": "CDG",
            "departure_date": date(2024, 5, 10),
            "return_date": date(2024, 5, 17),
            "target_price": 800.0,
            "currency": "USD",
            "cabin_class": FlightClass.economy,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    ])
    
    # Sample recommendations
    recommendations.extend([
        {
            "id": "rec_1",
            "destination": "Bali, Indonesia",
            "title": "Tropical Paradise",
            "description": "Experience the perfect blend of culture and relaxation",
            "image_url": "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=300&h=200&fit=crop",
            "price_range": "$800-$1500",
            "rating": 4.8,
            "category": "Beach",
            "tags": ["beach", "culture", "relaxation"],
            "created_at": datetime.utcnow()
        },
        {
            "id": "rec_2",
            "destination": "Santorini, Greece",
            "title": "Mediterranean Dream",
            "description": "Stunning sunsets and white-washed buildings",
            "image_url": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=300&h=200&fit=crop",
            "price_range": "$1200-$2000",
            "rating": 4.9,
            "category": "Island",
            "tags": ["island", "romantic", "sunset"],
            "created_at": datetime.utcnow()
        }
    ])
    
    # Sample insights
    insights.extend([
        {
            "id": "insight_1",
            "user_id": "user_123",
            "type": "budget",
            "title": "Budget Optimization",
            "content": "You can save 15% on your Tokyo trip by booking flights 3 months in advance",
            "data": {"savings_percentage": 15, "recommended_booking_time": "3 months"},
            "created_at": datetime.utcnow()
        }
    ])

    # Sample flight bookings
    flight_bookings.extend([
        {
            "id": "booking_1",
            "user_id": "user_123",
            "flight_id": "flight_1",
            "passenger_details": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "john.doe@example.com",
                "phone": "+1-555-0123",
                "date_of_birth": date(1990, 5, 15),
                "passport_number": "US123456789",
                "nationality": "US"
            },
            "seat_selection": {
                "seat_number": "12A",
                "seat_type": "window",
                "price": 50.0
            },
            "payment_details": {
                "card_number": "****-****-****-1234",
                "card_holder": "John Doe",
                "expiry_date": "12/25",
                "cvv": "***"
            },
            "booking_reference": "BK20241201001",
            "total_price": 900.0,
            "status": "confirmed",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ])

    # Sample flight tickets
    flight_tickets.extend([
        {
            "id": "ticket_1",
            "booking_id": "booking_1",
            "ticket_number": "TK20241201001",
            "passenger_name": "John Doe",
            "flight_details": {
                "airline": "All Nippon Airways",
                "flight_number": "NH 12",
                "origin": "SFO",
                "destination": "NRT",
                "departure_time": "2024-03-15T10:30:00Z",
                "arrival_time": "2024-03-16T14:45:00Z",
                "duration": "14h 15m"
            },
            "seat_details": {
                "seat_number": "12A",
                "seat_type": "window"
            },
            "boarding_time": "10:00",
            "gate": "A12",
            "created_at": datetime.utcnow()
        }
    ])

    # Sample available seats
    available_seats.extend([
        {"seat_number": "12A", "seat_type": "window", "price": 50.0, "available": True},
        {"seat_number": "12B", "seat_type": "middle", "price": 30.0, "available": True},
        {"seat_number": "12C", "seat_type": "aisle", "price": 40.0, "available": True},
        {"seat_number": "13A", "seat_type": "window", "price": 50.0, "available": True},
        {"seat_number": "13B", "seat_type": "middle", "price": 30.0, "available": True},
        {"seat_number": "13C", "seat_type": "aisle", "price": 40.0, "available": True},
        {"seat_number": "14A", "seat_type": "window", "price": 50.0, "available": True},
        {"seat_number": "14B", "seat_type": "middle", "price": 30.0, "available": True},
        {"seat_number": "14C", "seat_type": "aisle", "price": 40.0, "available": True}
    ])

# Initialize sample data
initialize_sample_data()

# API Routes

@app.get("/")
async def root():
    return {"message": "Travel API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Trip endpoints
@app.get("/api/travel/trips", response_model=List[Trip])
async def get_trips(user_id: str = "user_123"):
    """Get all trips for a user"""
    user_trips = [trip for trip in trips if trip["user_id"] == user_id]
    return user_trips

@app.get("/api/travel/trips/{trip_id}", response_model=Trip)
async def get_trip(trip_id: str):
    """Get a specific trip by ID"""
    trip = next((trip for trip in trips if trip["id"] == trip_id), None)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@app.post("/api/travel/trips", response_model=Trip)
async def create_trip(trip: TripCreate, user_id: str = "user_123"):
    """Create a new trip"""
    new_trip = Trip(
        id=str(uuid.uuid4()),
        user_id=user_id,
        **trip.model_dump()
    )
    trips.append(new_trip.model_dump())
    return new_trip

@app.put("/api/travel/trips/{trip_id}", response_model=Trip)
async def update_trip(trip_id: str, trip_update: TripCreate):
    """Update a trip"""
    trip_index = next((i for i, trip in enumerate(trips) if trip["id"] == trip_id), None)
    if trip_index is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    trips[trip_index].update(trip_update.dict())
    trips[trip_index]["updated_at"] = datetime.utcnow()
    return trips[trip_index]

@app.delete("/api/travel/trips/{trip_id}")
async def delete_trip(trip_id: str):
    """Delete a trip"""
    trip_index = next((i for i, trip in enumerate(trips) if trip["id"] == trip_id), None)
    if trip_index is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    trips.pop(trip_index)
    return {"message": "Trip deleted successfully"}

# Flight endpoints
@app.get("/api/travel/flights", response_model=List[Flight])
async def get_flights(trip_id: Optional[str] = None):
    """Get flights, optionally filtered by trip_id"""
    if trip_id:
        return [flight for flight in flights if flight["trip_id"] == trip_id]
    return flights

@app.post("/api/travel/flights", response_model=Flight)
async def create_flight(flight: Flight):
    """Create a new flight"""
    new_flight = Flight(
        id=str(uuid.uuid4()),
        **flight.dict(exclude={"id"})
    )
    flights.append(new_flight.dict())
    return new_flight

# Hotel endpoints
@app.get("/api/travel/hotels", response_model=List[Hotel])
async def get_hotels(trip_id: Optional[str] = None):
    """Get hotels, optionally filtered by trip_id"""
    if trip_id:
        return [hotel for hotel in hotels if hotel["trip_id"] == trip_id]
    return hotels

@app.post("/api/travel/hotels", response_model=Hotel)
async def create_hotel(hotel: Hotel):
    """Create a new hotel booking"""
    new_hotel = Hotel(
        id=str(uuid.uuid4()),
        **hotel.dict(exclude={"id"})
    )
    hotels.append(new_hotel.dict())
    return new_hotel

# Activity endpoints
@app.get("/api/travel/activities", response_model=List[Activity])
async def get_activities(trip_id: Optional[str] = None):
    """Get activities, optionally filtered by trip_id"""
    if trip_id:
        return [activity for activity in activities if activity["trip_id"] == trip_id]
    return activities

@app.post("/api/travel/activities", response_model=Activity)
async def create_activity(activity: Activity):
    """Create a new activity"""
    new_activity = Activity(
        id=str(uuid.uuid4()),
        **activity.dict(exclude={"id"})
    )
    activities.append(new_activity.dict())
    return new_activity

# Price alert endpoints
@app.get("/api/travel/price-alerts", response_model=List[PriceAlert])
async def get_price_alerts(user_id: str = "user_123"):
    """Get price alerts for a user"""
    user_alerts = [alert for alert in price_alerts if alert["user_id"] == user_id]
    return user_alerts

@app.post("/api/travel/price-alerts", response_model=PriceAlert)
async def create_price_alert(alert: PriceAlertCreate, user_id: str = "user_123"):
    """Create a new price alert"""
    new_alert = PriceAlert(
        id=str(uuid.uuid4()),
        user_id=user_id,
        **alert.dict()
    )
    price_alerts.append(new_alert.dict())
    return new_alert

@app.delete("/api/travel/price-alerts/{alert_id}")
async def delete_price_alert(alert_id: str):
    """Delete a price alert"""
    alert_index = next((i for i, alert in enumerate(price_alerts) if alert["id"] == alert_id), None)
    if alert_index is None:
        raise HTTPException(status_code=404, detail="Price alert not found")
    
    price_alerts.pop(alert_index)
    return {"message": "Price alert deleted successfully"}

# Recommendation endpoints
@app.get("/api/travel/recommendations", response_model=List[TravelRecommendation])
async def get_recommendations(category: Optional[str] = None):
    """Get travel recommendations, optionally filtered by category"""
    if category:
        return [rec for rec in recommendations if rec["category"].lower() == category.lower()]
    return recommendations

# Insight endpoints
@app.get("/api/travel/insights", response_model=List[TravelInsight])
async def get_insights(user_id: str = "user_123"):
    """Get travel insights for a user"""
    user_insights = [insight for insight in insights if insight["user_id"] == user_id]
    return user_insights

# Dashboard endpoints
@app.get("/api/travel/dashboard")
async def get_dashboard(user_id: str = "user_123"):
    """Get travel dashboard data"""
    user_trips = [trip for trip in trips if trip["user_id"] == user_id]
    user_alerts = [alert for alert in price_alerts if alert["user_id"] == user_id]
    user_insights = [insight for insight in insights if insight["user_id"] == user_id]
    
    return {
        "total_trips": len(user_trips),
        "upcoming_trips": len([trip for trip in user_trips if trip["status"] in ["planning", "booked"]]),
        "active_trips": len([trip for trip in user_trips if trip["status"] == "active"]),
        "completed_trips": len([trip for trip in user_trips if trip["status"] == "completed"]),
        "total_spent": sum(trip.get("budget", 0) for trip in user_trips if trip["status"] == "completed"),
        "price_alerts": len(user_alerts),
        "insights": len(user_insights),
        "recent_trips": sorted(user_trips, key=lambda x: x["created_at"], reverse=True)[:3],
        "recommendations": recommendations[:4]
    }

# Flight Search endpoints
async def search_flights_booking_api(search_request: FlightSearchRequest) -> List[FlightSearchResult]:
    """Search flights using Booking.com API"""
    try:
        # Convert airport codes to Booking.com format
        from_id = f"{search_request.origin}.AIRPORT"
        to_id = f"{search_request.destination}.AIRPORT"
        
        # Convert cabin class to Booking.com format
        cabin_class_map = {
            "economy": "ECONOMY",
            "premium_economy": "PREMIUM_ECONOMY", 
            "business": "BUSINESS",
            "first": "FIRST"
        }
        cabin_class = cabin_class_map.get(search_request.cabin_class, "ECONOMY")
        
        # Build the search URL
        search_url = f"https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights"
        params = {
            "fromId": from_id,
            "toId": to_id,
            "stops": "none",  # Can be "none", "one", "two"
            "pageNo": 1,
            "adults": search_request.adults,
            "children": f"0,{search_request.children}" if search_request.children > 0 else "0,17",
            "sort": "BEST",  # Can be "BEST", "PRICE", "DURATION"
            "cabinClass": cabin_class,
            "currency_code": search_request.currency
        }
        
        headers = {
            "x-rapidapi-host": BOOKING_API_HOST,
            "x-rapidapi-key": BOOKING_API_KEY
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(search_url, params=params, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                # Parse the Booking.com API response
                flights = []
                if "data" in data and "flights" in data["data"]:
                    for flight_data in data["data"]["flights"]:
                        flight = {
                            "id": flight_data.get("id", f"flight_{uuid.uuid4().hex[:8]}"),
                            "airline": flight_data.get("airline", {}).get("name", "Unknown"),
                            "airline_code": flight_data.get("airline", {}).get("code", "UN"),
                            "flight_number": flight_data.get("flightNumber", "Unknown"),
                            "origin": search_request.origin,
                            "destination": search_request.destination,
                            "departure_time": flight_data.get("departureTime", ""),
                            "arrival_time": flight_data.get("arrivalTime", ""),
                            "duration": flight_data.get("duration", "Unknown"),
                            "stops": flight_data.get("stops", 0),
                            "price": flight_data.get("price", {}).get("amount", 0),
                            "currency": flight_data.get("price", {}).get("currency", search_request.currency),
                            "cabin_class": search_request.cabin_class,
                            "aircraft": flight_data.get("aircraft", "Unknown"),
                            "booking_url": flight_data.get("bookingUrl", "")
                        }
                        flights.append(FlightSearchResult(**flight))
                
                return flights
            else:
                print(f"Booking.com API error: {response.status_code} - {response.text}")
                # Fallback to mock data if API fails
                return await get_mock_flights(search_request)
                
    except Exception as e:
        print(f"Error searching flights: {e}")
        # Fallback to mock data
        return await get_mock_flights(search_request)

async def get_mock_flights(search_request: FlightSearchRequest) -> List[FlightSearchResult]:
    """Get mock flight data as fallback"""
    mock_flights = [
        {
            "id": f"flight_{uuid.uuid4().hex[:8]}",
            "airline": "American Airlines",
            "airline_code": "AA",
            "flight_number": "AA123",
            "origin": search_request.origin,
            "destination": search_request.destination,
            "departure_time": f"{search_request.departure_date}T10:00:00",
            "arrival_time": f"{search_request.departure_date}T14:30:00",
            "duration": "4h 30m",
            "stops": 0,
            "price": 299.99,
            "currency": search_request.currency,
            "cabin_class": search_request.cabin_class,
            "aircraft": "Boeing 737",
            "booking_url": "https://booking.com/flights"
        },
        {
            "id": f"flight_{uuid.uuid4().hex[:8]}",
            "airline": "Delta Airlines",
            "airline_code": "DL",
            "flight_number": "DL456",
            "origin": search_request.origin,
            "destination": search_request.destination,
            "departure_time": f"{search_request.departure_date}T15:30:00",
            "arrival_time": f"{search_request.departure_date}T19:45:00",
            "duration": "4h 15m",
            "stops": 1,
            "price": 249.99,
            "currency": search_request.currency,
            "cabin_class": search_request.cabin_class,
            "aircraft": "Airbus A320",
            "booking_url": "https://booking.com/flights"
        },
        {
            "id": f"flight_{uuid.uuid4().hex[:8]}",
            "airline": "United Airlines",
            "airline_code": "UA",
            "flight_number": "UA789",
            "origin": search_request.origin,
            "destination": search_request.destination,
            "departure_time": f"{search_request.departure_date}T08:15:00",
            "arrival_time": f"{search_request.departure_date}T12:30:00",
            "duration": "4h 15m",
            "stops": 0,
            "price": 349.99,
            "currency": search_request.currency,
            "cabin_class": search_request.cabin_class,
            "aircraft": "Boeing 787",
            "booking_url": "https://booking.com/flights"
        }
    ]
    
    return [FlightSearchResult(**flight) for flight in mock_flights]

async def get_min_price_flight(from_id: str, to_id: str, cabin_class: str = "ECONOMY", currency: str = "USD") -> Dict[str, Any]:
    """Get minimum price for a flight route"""
    try:
        min_price_url = "https://booking-com15.p.rapidapi.com/api/v1/flights/getMinPrice"
        params = {
            "fromId": f"{from_id}.AIRPORT",
            "toId": f"{to_id}.AIRPORT",
            "cabinClass": cabin_class,
            "currency_code": currency
        }
        
        headers = {
            "x-rapidapi-host": BOOKING_API_HOST,
            "x-rapidapi-key": BOOKING_API_KEY
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(min_price_url, params=params, headers=headers)
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Min price API error: {response.status_code} - {response.text}")
                return {"error": "Failed to get minimum price"}
                
    except Exception as e:
        print(f"Error getting minimum price: {e}")
        return {"error": str(e)}

@app.post("/api/travel/flights/search")
async def search_flights(search_request: FlightSearchRequest):
    """Search for flights using Booking.com API"""
    try:
        # Simple mock data without complex processing
        mock_flights = [
            {
                "id": "flight_1",
                "airline": "American Airlines",
                "flight_number": "AA123",
                "origin": search_request.origin,
                "destination": search_request.destination,
                "departure_time": f"{search_request.departure_date}T10:00:00",
                "arrival_time": f"{search_request.departure_date}T14:30:00",
                "duration": "4h 30m",
                "price": 299.99,
                "currency": search_request.currency,
                "cabin_class": search_request.cabin_class,
                "stops": 0,
                "aircraft": "Boeing 737",
                "booking_url": "https://booking.com/flights"
            },
            {
                "id": "flight_2",
                "airline": "Delta Airlines",
                "flight_number": "DL456",
                "origin": search_request.origin,
                "destination": search_request.destination,
                "departure_time": f"{search_request.departure_date}T15:30:00",
                "arrival_time": f"{search_request.departure_date}T19:45:00",
                "duration": "4h 15m",
                "price": 249.99,
                "currency": search_request.currency,
                "cabin_class": search_request.cabin_class,
                "stops": 1,
                "aircraft": "Airbus A320",
                "booking_url": "https://booking.com/flights"
            }
        ]
        return mock_flights
    except Exception as e:
        print(f"Error in search_flights: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to search flights: {str(e)}")

@app.get("/api/travel/flights/search/quick")

# Flight Booking endpoints
@app.post("/api/travel/flights/book", response_model=FlightBooking)
async def create_flight_booking(booking: FlightBookingCreate, user_id: str = "user_123"):
    """Create a new flight booking"""
    # Generate booking reference
    booking_reference = f"BK{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    # Calculate total price
    total_price = 0.0
    # Find the flight to get base price
    flight = next((f for f in flights if f["id"] == booking.flight_id), None)
    if flight:
        total_price = flight["price"]
    
    # Add seat selection price if provided
    if booking.seat_selection:
        total_price += booking.seat_selection.price
    
    new_booking = FlightBooking(
        id=str(uuid.uuid4()),
        user_id=user_id,
        booking_reference=booking_reference,
        total_price=total_price,
        **booking.dict()
    )
    
    flight_bookings.append(new_booking.dict())
    
    # Create flight ticket
    ticket_number = f"TK{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    passenger_name = f"{booking.passenger_details.first_name} {booking.passenger_details.last_name}"
    
    new_ticket = FlightTicket(
        id=str(uuid.uuid4()),
        booking_id=new_booking.id,
        ticket_number=ticket_number,
        passenger_name=passenger_name,
        flight_details={
            "airline": flight["airline"] if flight else "Unknown",
            "flight_number": flight["flight_number"] if flight else "Unknown",
            "origin": flight["origin"] if flight else "Unknown",
            "destination": flight["destination"] if flight else "Unknown",
            "departure_time": flight["departure_time"].isoformat() if flight else "",
            "arrival_time": flight["arrival_time"].isoformat() if flight else "",
            "duration": f"{flight['duration']} minutes" if flight else ""
        },
        seat_details=booking.seat_selection.dict() if booking.seat_selection else None,
        boarding_time="2 hours before departure",
        gate="TBD"
    )
    
    flight_tickets.append(new_ticket.dict())
    
    return new_booking

@app.get("/api/travel/flights/bookings", response_model=List[FlightBooking])
async def get_flight_bookings(user_id: str = "user_123"):
    """Get all flight bookings for a user"""
    user_bookings = [booking for booking in flight_bookings if booking["user_id"] == user_id]
    return user_bookings

@app.get("/api/travel/flights/bookings/{booking_id}", response_model=FlightBooking)
async def get_flight_booking(booking_id: str):
    """Get a specific flight booking by ID"""
    booking = next((booking for booking in flight_bookings if booking["id"] == booking_id), None)
    if not booking:
        raise HTTPException(status_code=404, detail="Flight booking not found")
    return booking

@app.get("/api/travel/flights/tickets/{booking_id}", response_model=FlightTicket)
async def get_flight_ticket(booking_id: str):
    """Get flight ticket for a booking"""
    ticket = next((ticket for ticket in flight_tickets if ticket["booking_id"] == booking_id), None)
    if not ticket:
        raise HTTPException(status_code=404, detail="Flight ticket not found")
    return ticket

@app.get("/api/travel/flights/seats/available")
async def get_available_seats():
    """Get available seats for booking"""
    return [seat for seat in available_seats if seat["available"]]

@app.post("/api/travel/flights/seats/reserve")
async def reserve_seat(seat_number: str):
    """Reserve a seat"""
    seat = next((seat for seat in available_seats if seat["seat_number"] == seat_number and seat["available"]), None)
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not available")
    
    seat["available"] = False
    return {"message": f"Seat {seat_number} reserved successfully"}

@app.post("/api/travel/flights/seats/release")
async def release_seat(seat_number: str):
    """Release a reserved seat"""
    seat = next((seat for seat in available_seats if seat["seat_number"] == seat_number), None)
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")
    
    seat["available"] = True
    return {"message": f"Seat {seat_number} released successfully"}

@app.get("/api/travel/flights/bookings/{booking_id}/download")
async def download_ticket(booking_id: str):
    """Download flight ticket as JSON"""
    booking = next((booking for booking in flight_bookings if booking["id"] == booking_id), None)
    if not booking:
        raise HTTPException(status_code=404, detail="Flight booking not found")
    
    ticket = next((ticket for ticket in flight_tickets if ticket["booking_id"] == booking_id), None)
    if not ticket:
        raise HTTPException(status_code=404, detail="Flight ticket not found")
    
    # Create ticket data for download
    ticket_data = {
        "booking_reference": booking["booking_reference"],
        "ticket_number": ticket["ticket_number"],
        "passenger": booking["passenger_details"],
        "flight": ticket["flight_details"],
        "seat": ticket["seat_details"],
        "boarding_time": ticket["boarding_time"],
        "gate": ticket["gate"],
        "total_price": booking["total_price"],
        "status": booking["status"]
    }
    
    return ticket_data
async def quick_flight_search(
    origin: str = Query(..., description="Origin airport code"),
    destination: str = Query(..., description="Destination airport code"),
    departure_date: str = Query(..., description="Departure date (YYYY-MM-DD)"),
    return_date: Optional[str] = Query(None, description="Return date (YYYY-MM-DD)"),
    adults: int = Query(1, description="Number of adult passengers"),
    currency: str = Query("USD", description="Currency code")
):
    """Quick flight search endpoint"""
    try:
        search_request = FlightSearchRequest(
            origin=origin,
            destination=destination,
            departure_date=date.fromisoformat(departure_date),
            return_date=date.fromisoformat(return_date) if return_date else None,
            adults=adults,
            currency=currency
        )
        
        flights = await search_flights_booking_api(search_request)
        return {
            "search_params": {
                "origin": origin,
                "destination": destination,
                "departure_date": departure_date,
                "return_date": return_date,
                "adults": adults,
                "currency": currency
            },
            "results": flights,
            "total_results": len(flights)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search flights: {str(e)}")

@app.get("/api/travel/flights/min-price")
async def get_min_price(
    from_id: str = Query(..., description="Origin airport code"),
    to_id: str = Query(..., description="Destination airport code"),
    cabin_class: str = Query("ECONOMY", description="Cabin class"),
    currency: str = Query("USD", description="Currency code")
):
    """Get minimum price for a flight route"""
    try:
        result = await get_min_price_flight(from_id, to_id, cabin_class, currency)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get minimum price: {str(e)}")

def generate_pdf_ticket(booking_data: Dict[str, Any], ticket_data: Dict[str, Any]) -> bytes:
    """Generate a beautiful PDF flight ticket"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    story = []
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Create custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=HexColor('#1e40af'),  # Blue
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=HexColor('#374151'),  # Gray
        alignment=TA_CENTER,
        spaceAfter=15
    )
    
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=HexColor('#059669'),  # Green
        spaceAfter=10
    )
    
    normal_style = ParagraphStyle(
        'Normal',
        parent=styles['Normal'],
        fontSize=12,
        spaceAfter=5
    )
    
    # Add title
    story.append(Paragraph("✈️ FLIGHT TICKET", title_style))
    story.append(Spacer(1, 20))
    
    # Add booking reference
    story.append(Paragraph(f"Booking Reference: <b>{booking_data.get('booking_reference', 'N/A')}</b>", subtitle_style))
    story.append(Paragraph(f"Ticket Number: <b>{ticket_data.get('ticket_number', 'N/A')}</b>", subtitle_style))
    story.append(Spacer(1, 20))
    
    # Passenger Information
    story.append(Paragraph("👤 PASSENGER INFORMATION", header_style))
    passenger = booking_data.get('passenger_details', {})
    passenger_info = [
        ["Name:", f"{passenger.get('first_name', '')} {passenger.get('last_name', '')}"],
        ["Email:", passenger.get('email', 'N/A')],
        ["Phone:", passenger.get('phone', 'N/A')],
        ["Passport:", passenger.get('passport_number', 'N/A')],
        ["Nationality:", passenger.get('nationality', 'N/A')]
    ]
    
    passenger_table = Table(passenger_info, colWidths=[2*inch, 4*inch])
    passenger_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), HexColor('#f3f4f6')),  # Light gray
        ('TEXTCOLOR', (0, 0), (0, -1), HexColor('#374151')),   # Dark gray
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, HexColor('#d1d5db'))
    ]))
    story.append(passenger_table)
    story.append(Spacer(1, 20))
    
    # Flight Information
    story.append(Paragraph("🛫 FLIGHT INFORMATION", header_style))
    flight = ticket_data.get('flight_details', {})
    flight_info = [
        ["Airline:", flight.get('airline', 'N/A')],
        ["Flight Number:", flight.get('flight_number', 'N/A')],
        ["Origin:", flight.get('origin', 'N/A')],
        ["Destination:", flight.get('destination', 'N/A')],
        ["Departure:", flight.get('departure_time', 'N/A')],
        ["Arrival:", flight.get('arrival_time', 'N/A')],
        ["Duration:", flight.get('duration', 'N/A')],
        ["Cabin Class:", flight.get('cabin_class', 'N/A').title()],
        ["Aircraft:", flight.get('aircraft', 'N/A')]
    ]
    
    flight_table = Table(flight_info, colWidths=[2*inch, 4*inch])
    flight_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), HexColor('#dbeafe')),  # Light blue
        ('TEXTCOLOR', (0, 0), (0, -1), HexColor('#1e40af')),   # Blue
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, HexColor('#93c5fd'))
    ]))
    story.append(flight_table)
    story.append(Spacer(1, 20))
    
    # Seat Information
    if ticket_data.get('seat_details'):
        story.append(Paragraph("💺 SEAT INFORMATION", header_style))
        seat = ticket_data.get('seat_details', {})
        seat_info = [
            ["Seat Number:", seat.get('seat_number', 'N/A')],
            ["Seat Type:", seat.get('seat_type', 'N/A').title()],
            ["Price:", f"${seat.get('price', 0):.2f}"]
        ]
        
        seat_table = Table(seat_info, colWidths=[2*inch, 4*inch])
        seat_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), HexColor('#dcfce7')),  # Light green
            ('TEXTCOLOR', (0, 0), (0, -1), HexColor('#059669')),   # Green
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, HexColor('#86efac'))
        ]))
        story.append(seat_table)
        story.append(Spacer(1, 20))
    
    # Boarding Information
    story.append(Paragraph("🚪 BOARDING INFORMATION", header_style))
    boarding_info = [
        ["Boarding Time:", ticket_data.get('boarding_time', 'N/A')],
        ["Gate:", ticket_data.get('gate', 'N/A')],
        ["Status:", booking_data.get('status', 'N/A').title()]
    ]
    
    boarding_table = Table(boarding_info, colWidths=[2*inch, 4*inch])
    boarding_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), HexColor('#fef3c7')),  # Light yellow
        ('TEXTCOLOR', (0, 0), (0, -1), HexColor('#d97706')),   # Orange
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, HexColor('#fcd34d'))
    ]))
    story.append(boarding_table)
    story.append(Spacer(1, 20))
    
    # Price Information
    story.append(Paragraph("💰 PRICE INFORMATION", header_style))
    price_info = [
        ["Total Price:", f"${booking_data.get('total_price', 0):.2f}"],
        ["Currency:", booking_data.get('currency', 'USD')]
    ]
    
    price_table = Table(price_info, colWidths=[2*inch, 4*inch])
    price_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), HexColor('#fce7f3')),  # Light pink
        ('TEXTCOLOR', (0, 0), (0, -1), HexColor('#be185d')),   # Pink
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, HexColor('#f9a8d4'))
    ]))
    story.append(price_table)
    story.append(Spacer(1, 30))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=10,
        textColor=HexColor('#6b7280'),
        alignment=TA_CENTER
    )
    story.append(Paragraph("Thank you for choosing our airline! Have a safe and pleasant journey.", footer_style))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", footer_style))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

@app.get("/api/travel/flights/bookings/{booking_id}/download-pdf")
async def download_ticket_pdf(booking_id: str):
    """Download flight ticket as PDF"""
    booking = next((booking for booking in flight_bookings if booking["id"] == booking_id), None)
    if not booking:
        raise HTTPException(status_code=404, detail="Flight booking not found")
    
    ticket = next((ticket for ticket in flight_tickets if ticket["booking_id"] == booking_id), None)
    if not ticket:
        raise HTTPException(status_code=404, detail="Flight ticket not found")
    
    try:
        # Generate PDF
        pdf_content = generate_pdf_ticket(booking, ticket)
        
        # Return PDF as streaming response
        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=flight_ticket_{booking_id}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
