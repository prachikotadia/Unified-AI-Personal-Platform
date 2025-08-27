from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime
import io

app = FastAPI(title="Travel API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    adults: int = 1
    cabin_class: str = "economy"
    currency: str = "USD"

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
        }
    ]
    return mock_flights

@app.get("/api/travel/flights/bookings/{booking_id}/download-pdf")
async def download_ticket_pdf(booking_id: str):
    """Download flight ticket as PDF"""
    try:
        # Generate a simple PDF for testing
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_CENTER
        from reportlab.lib.colors import HexColor
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        story = []
        
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=HexColor('#1e40af'),
            alignment=TA_CENTER,
            spaceAfter=20
        )
        
        story.append(Paragraph("✈️ FLIGHT TICKET", title_style))
        story.append(Spacer(1, 20))
        story.append(Paragraph(f"Booking ID: {booking_id}", styles['Normal']))
        story.append(Paragraph("Test PDF Ticket", styles['Normal']))
        story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        
        doc.build(story)
        buffer.seek(0)
        pdf_content = buffer.getvalue()
        
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
    print("Starting Travel API server...")
    uvicorn.run(app, host="0.0.0.0", port=8002)
