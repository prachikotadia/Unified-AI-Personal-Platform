from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum as SQLEnum, Date, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base

# Enums
class TripType(str, enum.Enum):
    business = "business"
    leisure = "leisure"
    family = "family"
    adventure = "adventure"
    romantic = "romantic"
    solo = "solo"
    group = "group"

class TripStatus(str, enum.Enum):
    planning = "planning"
    booked = "booked"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"

class FlightClass(str, enum.Enum):
    economy = "economy"
    premium_economy = "premium_economy"
    business = "business"
    first = "first"

class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"
    refunded = "refunded"

class ActivityType(str, enum.Enum):
    sightseeing = "sightseeing"
    adventure = "adventure"
    cultural = "cultural"
    food = "food"
    entertainment = "entertainment"
    shopping = "shopping"
    relaxation = "relaxation"
    transportation = "transportation"

class ExportFormat(str, enum.Enum):
    pdf = "pdf"
    ical = "ical"
    google_calendar = "google_calendar"
    json = "json"
    csv = "csv"

# Database Models
class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    trip_type = Column(SQLEnum(TripType), nullable=False)
    status = Column(SQLEnum(TripStatus), default=TripStatus.planning)
    destination = Column(String(200), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    budget = Column(Float)
    currency = Column(String(3), default="USD")
    travelers = Column(JSON)  # List of traveler info
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="trips")
    flights = relationship("FlightBooking", back_populates="trip", cascade="all, delete-orphan")
    hotels = relationship("HotelBooking", back_populates="trip", cascade="all, delete-orphan")
    restaurants = relationship("RestaurantBooking", back_populates="trip", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="trip", cascade="all, delete-orphan")
    shares = relationship("TripShare", back_populates="trip", cascade="all, delete-orphan")
    exports = relationship("ItineraryExport", back_populates="trip", cascade="all, delete-orphan")

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    type = Column(SQLEnum(ActivityType), nullable=False)
    location = Column(String(200), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(Time)
    end_time = Column(Time)
    price = Column(Float)
    currency = Column(String(3), default="USD")
    booking_reference = Column(String(100))
    notes = Column(Text)
    status = Column(String(20), default="planned")  # planned, booked, completed, cancelled
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    trip = relationship("Trip", back_populates="activities")
    map_location = relationship("MapLocation", back_populates="activity", uselist=False, cascade="all, delete-orphan")

class FlightBooking(Base):
    __tablename__ = "flight_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    flight_number = Column(String(50), nullable=False)
    airline = Column(String(100), nullable=False)
    airline_code = Column(String(10), nullable=False)
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
    duration = Column(Integer)  # in minutes
    stops = Column(Integer, default=0)
    cabin_class = Column(SQLEnum(FlightClass), nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    booking_reference = Column(String(100), unique=True, index=True)
    confirmation_number = Column(String(100))
    seat_assignment = Column(String(20))
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.pending)
    passenger_info = Column(JSON)  # Passenger details
    baggage_info = Column(JSON)  # Baggage allowance
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    trip = relationship("Trip", back_populates="flights")

class HotelBooking(Base):
    __tablename__ = "hotel_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    hotel_name = Column(String(200), nullable=False)
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    rating = Column(Integer)  # 1-5 stars
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    rooms = Column(Integer, default=1)
    room_type = Column(String(100))
    price_per_night = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    amenities = Column(JSON)  # List of amenities
    booking_reference = Column(String(100), unique=True, index=True)
    confirmation_number = Column(String(100))
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.pending)
    guest_info = Column(JSON)  # Guest details
    special_requests = Column(Text)
    cancellation_policy = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    trip = relationship("Trip", back_populates="hotels")
    map_location = relationship("MapLocation", back_populates="hotel", uselist=False, cascade="all, delete-orphan")

class RestaurantBooking(Base):
    __tablename__ = "restaurant_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    restaurant_name = Column(String(200), nullable=False)
    cuisine_type = Column(String(100))
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    reservation_date = Column(Date, nullable=False)
    reservation_time = Column(Time, nullable=False)
    party_size = Column(Integer, default=2)
    price_estimate = Column(Float)
    currency = Column(String(3), default="USD")
    booking_reference = Column(String(100), unique=True, index=True)
    confirmation_number = Column(String(100))
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.pending)
    special_requests = Column(Text)
    dietary_restrictions = Column(JSON)  # List of dietary restrictions
    contact_info = Column(JSON)  # Restaurant contact details
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    trip = relationship("Trip", back_populates="restaurants")
    map_location = relationship("MapLocation", back_populates="restaurant", uselist=False, cascade="all, delete-orphan")

class TripShare(Base):
    __tablename__ = "trip_shares"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    share_type = Column(String(50), nullable=False)  # itinerary, photos, experiences, tips
    title = Column(String(200), nullable=False)
    description = Column(Text)
    content = Column(JSON)  # Shared content data
    visibility = Column(String(20), default="friends")  # public, friends, private
    share_link = Column(String(500), unique=True, index=True)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="trip_shares")
    trip = relationship("Trip", back_populates="shares")

class ItineraryExport(Base):
    __tablename__ = "itinerary_exports"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    export_format = Column(SQLEnum(ExportFormat), nullable=False)
    file_url = Column(String(500))
    file_size = Column(Integer)  # in bytes
    export_options = Column(JSON)  # Export configuration
    status = Column(String(20), default="pending")  # pending, completed, failed
    error_message = Column(Text)
    expires_at = Column(DateTime)  # For temporary file links
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    trip = relationship("Trip", back_populates="exports")
    user = relationship("User", back_populates="itinerary_exports")

class PriceAlert(Base):
    __tablename__ = "travel_price_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    departure_date = Column(Date, nullable=False)
    return_date = Column(Date)
    target_price = Column(Float, nullable=False)
    current_price = Column(Float)
    currency = Column(String(3), default="USD")
    cabin_class = Column(SQLEnum(FlightClass), default=FlightClass.economy)
    is_active = Column(Boolean, default=True)
    notifications_sent = Column(Integer, default=0)
    last_checked = Column(DateTime)
    # Enhanced fields
    notification_preferences = Column(JSON)  # {"email": True, "push": True, "sms": False}
    price_history = Column(JSON)  # List of price snapshots
    alert_frequency = Column(String(20), default="daily")  # "hourly", "daily", "weekly"
    last_notified_at = Column(DateTime)
    triggered_at = Column(DateTime)
    min_price_seen = Column(Float)
    max_price_seen = Column(Float)
    price_change_percentage = Column(Float)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="travel_price_alerts")

class MapLocation(Base):
    __tablename__ = "map_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"))
    hotel_id = Column(Integer, ForeignKey("hotel_bookings.id"))
    restaurant_id = Column(Integer, ForeignKey("restaurant_bookings.id"))
    name = Column(String(200), nullable=False)
    address = Column(String(500), nullable=False)
    city = Column(String(100))
    country = Column(String(100))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    place_id = Column(String(200))  # Google Places ID or similar
    location_type = Column(String(50))  # activity, hotel, restaurant, landmark, etc.
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    activity = relationship("Activity", back_populates="map_location")
    hotel = relationship("HotelBooking", back_populates="map_location")
    restaurant = relationship("RestaurantBooking", back_populates="map_location")

class Directions(Base):
    __tablename__ = "directions"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    from_location_id = Column(Integer, ForeignKey("map_locations.id"), nullable=False)
    to_location_id = Column(Integer, ForeignKey("map_locations.id"), nullable=False)
    travel_mode = Column(String(20), nullable=False)  # driving, walking, bicycling, transit
    distance = Column(Float)  # in meters
    duration = Column(Integer)  # in seconds
    duration_text = Column(String(50))  # Human-readable duration
    distance_text = Column(String(50))  # Human-readable distance
    route_data = Column(JSON)  # Full route information
    waypoints = Column(JSON)  # Intermediate waypoints
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    trip = relationship("Trip")
    from_location = relationship("MapLocation", foreign_keys=[from_location_id])
    to_location = relationship("MapLocation", foreign_keys=[to_location_id])

