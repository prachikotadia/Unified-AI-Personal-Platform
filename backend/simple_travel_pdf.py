from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, date
import uuid
import io
import json
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.colors import HexColor

app = FastAPI(title="Travel API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:5173", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple models without enums
class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    adults: int = 1
    children: int = 0
    infants: int = 0
    cabin_class: str = "economy"
    currency: str = "USD"

class PassengerDetails(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    date_of_birth: str
    passport_number: str
    nationality: str

class SeatSelection(BaseModel):
    seat_number: str
    seat_type: str
    price: float

class PaymentDetails(BaseModel):
    card_number: str
    card_holder: str
    expiry_date: str
    cvv: str

class FlightBookingCreate(BaseModel):
    flight_id: str
    passenger_details: PassengerDetails
    seat_selection: Optional[SeatSelection] = None
    payment_details: PaymentDetails

# In-memory storage
flight_bookings = []
flight_tickets = []

# Sample data
def initialize_sample_data():
    global flight_bookings, flight_tickets
    
    # Sample flight booking
    sample_booking = {
        "id": "booking_1",
        "user_id": "user_123",
        "flight_id": "flight_1",
        "passenger_details": {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "phone": "+1-555-0123",
            "date_of_birth": "1990-01-01",
            "passport_number": "A12345678",
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
            "cvv": "123"
        },
        "booking_reference": "BK20241226001",
        "total_price": 349.99,
        "status": "confirmed",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    sample_ticket = {
        "id": "ticket_1",
        "booking_id": "booking_1",
        "ticket_number": "TK123456789",
        "passenger_name": "John Doe",
        "flight_details": {
            "airline": "American Airlines",
            "flight_number": "AA123",
            "origin": "JFK",
            "destination": "LAX",
            "departure_time": "2024-06-15T10:00:00",
            "arrival_time": "2024-06-15T14:30:00",
            "duration": "4h 30m",
            "cabin_class": "economy",
            "aircraft": "Boeing 737"
        },
        "seat_details": {
            "seat_number": "12A",
            "seat_type": "window",
            "price": 50.0
        },
        "boarding_time": "09:30",
        "gate": "B12",
        "created_at": datetime.now().isoformat()
    }
    
    flight_bookings.append(sample_booking)
    flight_tickets.append(sample_ticket)

# Initialize sample data
initialize_sample_data()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/travel/flights/search")
async def search_flights(search_request: FlightSearchRequest):
    """Search for flights - returns mock data"""
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

@app.post("/api/travel/flights/book")
async def create_flight_booking(booking: FlightBookingCreate):
    """Create a new flight booking"""
    booking_id = f"booking_{uuid.uuid4().hex[:8]}"
    booking_reference = f"BK{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Calculate total price (flight price + seat price)
    total_price = 299.99 + (booking.seat_selection.price if booking.seat_selection else 0)
    
    new_booking = {
        "id": booking_id,
        "user_id": "user_123",
        "flight_id": booking.flight_id,
        "passenger_details": booking.passenger_details.dict(),
        "seat_selection": booking.seat_selection.dict() if booking.seat_selection else None,
        "payment_details": booking.payment_details.dict(),
        "booking_reference": booking_reference,
        "total_price": total_price,
        "status": "confirmed",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    # Create corresponding ticket
    ticket_number = f"TK{uuid.uuid4().hex[:8].upper()}"
    new_ticket = {
        "id": f"ticket_{uuid.uuid4().hex[:8]}",
        "booking_id": booking_id,
        "ticket_number": ticket_number,
        "passenger_name": f"{booking.passenger_details.first_name} {booking.passenger_details.last_name}",
        "flight_details": {
            "airline": "American Airlines",
            "flight_number": "AA123",
            "origin": "JFK",
            "destination": "LAX",
            "departure_time": "2024-06-15T10:00:00",
            "arrival_time": "2024-06-15T14:30:00",
            "duration": "4h 30m",
            "cabin_class": "economy",
            "aircraft": "Boeing 737"
        },
        "seat_details": booking.seat_selection.dict() if booking.seat_selection else None,
        "boarding_time": "09:30",
        "gate": "B12",
        "created_at": datetime.now().isoformat()
    }
    
    flight_bookings.append(new_booking)
    flight_tickets.append(new_ticket)
    
    return {
        "id": booking_id,
        "booking_reference": booking_reference,
        "total_price": total_price,
        "status": "confirmed"
    }

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
        ["Currency:", "USD"]
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
    uvicorn.run(app, host="0.0.0.0", port=8002)
