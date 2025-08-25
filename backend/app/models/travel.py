from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

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

class HotelRating(str, Enum):
    one_star = "1"
    two_star = "2"
    three_star = "3"
    four_star = "4"
    five_star = "5"

class TransportationType(str, Enum):
    flight = "flight"
    train = "train"
    bus = "bus"
    car = "car"
    boat = "boat"
    walking = "walking"

class Trip(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    description: Optional[str] = None
    trip_type: TripType
    status: TripStatus = TripStatus.planning
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
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FlightSearch(BaseModel):
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date] = None
    adults: int = Field(default=1, ge=1, le=9)
    children: int = Field(default=0, ge=0, le=9)
    infants: int = Field(default=0, ge=0, le=9)
    cabin_class: FlightClass = FlightClass.economy
    direct_flights_only: bool = False
    max_price: Optional[float] = None
    currency: str = "USD"

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
    duration: int  # in minutes
    stops: int = 0
    cabin_class: FlightClass
    price: float
    currency: str = "USD"
    booking_reference: Optional[str] = None
    seat_assignment: Optional[str] = None
    status: str = "confirmed"  # confirmed, cancelled, delayed, completed
    created_at: datetime = Field(default_factory=datetime.utcnow)

class HotelSearch(BaseModel):
    destination: str
    check_in: date
    check_out: date
    rooms: int = Field(default=1, ge=1, le=10)
    adults: int = Field(default=1, ge=1, le=20)
    children: int = Field(default=0, ge=0, le=10)
    rating: Optional[HotelRating] = None
    max_price: Optional[float] = None
    currency: str = "USD"
    amenities: List[str] = []

class Hotel(BaseModel):
    id: Optional[str] = None
    trip_id: Optional[str] = None
    name: str
    address: str
    city: str
    country: str
    rating: HotelRating
    check_in: date
    check_out: date
    rooms: int
    room_type: str
    price_per_night: float
    total_price: float
    currency: str = "USD"
    amenities: List[str] = []
    booking_reference: Optional[str] = None
    confirmation_number: Optional[str] = None
    status: str = "confirmed"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Activity(BaseModel):
    id: Optional[str] = None
    trip_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    type: str  # sightseeing, adventure, cultural, food, etc.
    location: str
    date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    price: Optional[float] = None
    currency: str = "USD"
    booking_reference: Optional[str] = None
    notes: Optional[str] = None
    status: str = "planned"  # planned, booked, completed, cancelled
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ItineraryDay(BaseModel):
    id: Optional[str] = None
    trip_id: Optional[str] = None
    day_number: int
    date: date
    location: str
    activities: List[Dict[str, Any]] = []
    transportation: List[Dict[str, Any]] = []
    accommodation: Optional[Dict[str, Any]] = None
    meals: List[Dict[str, Any]] = []
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TravelDocument(BaseModel):
    id: Optional[str] = None
    trip_id: Optional[str] = None
    type: str  # passport, visa, ticket, insurance, etc.
    name: str
    number: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    issuing_country: Optional[str] = None
    file_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PriceAlert(BaseModel):
    id: Optional[str] = None
    user_id: str
    origin: str
    destination: str
    departure_date: date
    return_date: Optional[date] = None
    target_price: float
    current_price: Optional[float] = None
    currency: str = "USD"
    cabin_class: FlightClass = FlightClass.economy
    is_active: bool = True
    notifications_sent: int = 0
    last_checked: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TravelBudget(BaseModel):
    id: Optional[str] = None
    trip_id: str
    category: str  # flights, accommodation, activities, food, transportation, etc.
    planned_amount: float
    actual_amount: float = 0
    currency: str = "USD"
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TravelPackingList(BaseModel):
    id: Optional[str] = None
    trip_id: str
    category: str  # clothing, electronics, toiletries, documents, etc.
    items: List[Dict[str, Any]] = []
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TravelExpense(BaseModel):
    id: Optional[str] = None
    trip_id: str
    category: str
    description: str
    amount: float
    currency: str = "USD"
    date: date
    location: Optional[str] = None
    receipt_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TravelRecommendation(BaseModel):
    id: Optional[str] = None
    user_id: str
    destination: str
    trip_type: TripType
    duration: int  # in days
    budget_range: str  # low, medium, high, luxury
    recommendations: List[Dict[str, Any]] = []
    reasons: List[str] = []
    score: float = Field(..., ge=0, le=1)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TravelInsight(BaseModel):
    id: Optional[str] = None
    user_id: str
    type: str  # spending_pattern, destination_preference, travel_frequency, etc.
    title: str
    description: str
    data: Dict[str, Any] = {}
    actionable: bool = True
    action_items: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TravelShare(BaseModel):
    id: Optional[str] = None
    user_id: str
    trip_id: str
    type: str  # itinerary, photos, experiences, tips
    title: str
    description: str
    content: Dict[str, Any] = {}
    visibility: str = Field(default="friends", pattern="^(public|friends|private)$")
    likes: int = 0
    comments: int = 0
    shares: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
