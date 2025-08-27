from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import structlog

from app.database import get_db
from app.services.shipping_service import ShippingService
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.shipping import ShippingMethod, Carrier

logger = structlog.get_logger()
router = APIRouter()

# Pydantic models
class AddressCreate(BaseModel):
    first_name: str
    last_name: str
    company: Optional[str] = None
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address_type: str = "shipping"

class ShippingRateRequest(BaseModel):
    from_address: dict
    to_address: dict
    weight: float
    dimensions: Optional[dict] = None
    items: List[dict]

class ShipmentCreate(BaseModel):
    order_id: int
    shipping_address_id: int
    method: ShippingMethod
    carrier: Carrier
    weight: Optional[float] = None
    dimensions: Optional[dict] = None

# Address endpoints
@router.get("/addresses", response_model=List[dict])
async def get_addresses(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's addresses"""
    shipping_service = ShippingService(db)
    addresses = shipping_service.get_user_addresses(current_user.id)
    
    return [
        {
            "id": addr.id,
            "first_name": addr.first_name,
            "last_name": addr.last_name,
            "company": addr.company,
            "address_line1": addr.address_line1,
            "address_line2": addr.address_line2,
            "city": addr.city,
            "state": addr.state,
            "postal_code": addr.postal_code,
            "country": addr.country,
            "phone": addr.phone,
            "email": addr.email,
            "address_type": addr.address_type,
            "is_default": addr.is_default,
            "is_validated": addr.is_validated,
            "created_at": addr.created_at.isoformat()
        }
        for addr in addresses
    ]

@router.post("/addresses", response_model=dict)
async def create_address(
    address_data: AddressCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create new address"""
    shipping_service = ShippingService(db)
    address = shipping_service.create_address(current_user.id, address_data.dict())
    
    return {
        "message": "Address created successfully",
        "address": {
            "id": address.id,
            "first_name": address.first_name,
            "last_name": address.last_name,
            "address_line1": address.address_line1,
            "city": address.city,
            "state": address.state,
            "postal_code": address.postal_code,
            "country": address.country,
            "is_default": address.is_default
        }
    }

@router.put("/addresses/{address_id}", response_model=dict)
async def update_address(
    address_id: int,
    address_data: AddressCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update address"""
    shipping_service = ShippingService(db)
    address = shipping_service.update_address(
        address_id,
        current_user.id,
        address_data.dict()
    )
    
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    
    return {
        "message": "Address updated successfully",
        "address": {
            "id": address.id,
            "first_name": address.first_name,
            "last_name": address.last_name,
            "address_line1": address.address_line1,
            "city": address.city,
            "state": address.state,
            "postal_code": address.postal_code,
            "country": address.country
        }
    }

@router.delete("/addresses/{address_id}")
async def delete_address(
    address_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete address"""
    shipping_service = ShippingService(db)
    success = shipping_service.delete_address(address_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    
    return {"message": "Address deleted successfully"}

@router.post("/addresses/{address_id}/default")
async def set_default_address(
    address_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Set default address"""
    shipping_service = ShippingService(db)
    success = shipping_service.set_default_address(address_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    
    return {"message": "Default address updated successfully"}

@router.post("/addresses/validate", response_model=dict)
async def validate_address(
    address_data: AddressCreate,
    db: Session = Depends(get_db)
):
    """Validate address"""
    shipping_service = ShippingService(db)
    validation_result = shipping_service.validate_address(address_data.dict())
    
    return {
        "is_valid": validation_result["is_valid"],
        "suggestions": validation_result.get("suggestions", []),
        "normalized_address": validation_result.get("normalized_address"),
        "validation_messages": validation_result.get("messages", [])
    }

# Shipping rates
@router.post("/rates", response_model=List[dict])
async def get_shipping_rates(
    rate_request: ShippingRateRequest,
    db: Session = Depends(get_db)
):
    """Get shipping rates"""
    shipping_service = ShippingService(db)
    rates = shipping_service.get_shipping_rates(
        rate_request.from_address,
        rate_request.to_address,
        rate_request.weight,
        rate_request.dimensions,
        rate_request.items
    )
    
    return [
        {
            "method": rate["method"],
            "carrier": rate["carrier"],
            "cost": rate["cost"],
            "estimated_days": rate["estimated_days"],
            "service_name": rate["service_name"],
            "tracking_available": rate["tracking_available"]
        }
        for rate in rates
    ]

# Shipments
@router.post("/shipments", response_model=dict)
async def create_shipment(
    shipment_data: ShipmentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create shipment"""
    shipping_service = ShippingService(db)
    shipment = shipping_service.create_shipment(
        shipment_data.order_id,
        shipment_data.shipping_address_id,
        shipment_data.method,
        shipment_data.carrier,
        shipment_data.weight,
        shipment_data.dimensions
    )
    
    return {
        "message": "Shipment created successfully",
        "shipment": {
            "id": shipment.id,
            "tracking_number": shipment.tracking_number,
            "tracking_url": shipment.tracking_url,
            "status": shipment.status,
            "shipping_cost": shipment.shipping_cost,
            "estimated_delivery": shipment.estimated_delivery.isoformat() if shipment.estimated_delivery else None
        }
    }

@router.get("/shipments", response_model=List[dict])
async def get_shipments(
    order_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get shipments"""
    shipping_service = ShippingService(db)
    shipments = shipping_service.get_shipments(
        current_user.id,
        order_id=order_id,
        status=status,
        page=page,
        limit=limit
    )
    
    return [
        {
            "id": shipment.id,
            "order_id": shipment.order_id,
            "tracking_number": shipment.tracking_number,
            "tracking_url": shipment.tracking_url,
            "status": shipment.status,
            "method": shipment.method,
            "carrier": shipment.carrier,
            "shipping_cost": shipment.shipping_cost,
            "weight": shipment.weight,
            "estimated_delivery": shipment.estimated_delivery.isoformat() if shipment.estimated_delivery else None,
            "actual_delivery": shipment.actual_delivery.isoformat() if shipment.actual_delivery else None,
            "created_at": shipment.created_at.isoformat()
        }
        for shipment in shipments
    ]

@router.get("/shipments/{shipment_id}", response_model=dict)
async def get_shipment(
    shipment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific shipment"""
    shipping_service = ShippingService(db)
    shipment = shipping_service.get_shipment(shipment_id, current_user.id)
    
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    return {
        "id": shipment.id,
        "order_id": shipment.order_id,
        "tracking_number": shipment.tracking_number,
        "tracking_url": shipment.tracking_url,
        "status": shipment.status,
        "method": shipment.method,
        "carrier": shipment.carrier,
        "shipping_cost": shipment.shipping_cost,
        "weight": shipment.weight,
        "dimensions": shipment.dimensions,
        "estimated_delivery": shipment.estimated_delivery.isoformat() if shipment.estimated_delivery else None,
        "actual_delivery": shipment.actual_delivery.isoformat() if shipment.actual_delivery else None,
        "shipping_address": {
            "first_name": shipment.shipping_address.first_name,
            "last_name": shipment.shipping_address.last_name,
            "address_line1": shipment.shipping_address.address_line1,
            "city": shipment.shipping_address.city,
            "state": shipment.shipping_address.state,
            "postal_code": shipment.shipping_address.postal_code,
            "country": shipment.shipping_address.country
        } if shipment.shipping_address else None,
        "tracking_events": [
            {
                "event_type": event.event_type,
                "status": event.status,
                "description": event.description,
                "location": event.location,
                "event_time": event.event_time.isoformat()
            }
            for event in shipment.tracking_events
        ]
    }

# Tracking
@router.get("/tracking/{tracking_number}", response_model=dict)
async def track_shipment(
    tracking_number: str,
    db: Session = Depends(get_db)
):
    """Track shipment by tracking number"""
    shipping_service = ShippingService(db)
    tracking_info = shipping_service.track_shipment(tracking_number)
    
    if not tracking_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tracking information not found"
        )
    
    return {
        "tracking_number": tracking_info["tracking_number"],
        "status": tracking_info["status"],
        "carrier": tracking_info["carrier"],
        "estimated_delivery": tracking_info["estimated_delivery"],
        "events": tracking_info["events"]
    }

# Shipping labels
@router.post("/shipments/{shipment_id}/label", response_model=dict)
async def generate_shipping_label(
    shipment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate shipping label"""
    shipping_service = ShippingService(db)
    label = shipping_service.generate_shipping_label(shipment_id, current_user.id)
    
    if not label:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    return {
        "label_url": label.label_url,
        "label_data": label.label_data,
        "expires_at": label.expires_at.isoformat() if label.expires_at else None
    }

# Return shipments
@router.post("/shipments/{shipment_id}/return", response_model=dict)
async def create_return_shipment(
    shipment_id: int,
    return_reason: str,
    return_type: str = "refund",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create return shipment"""
    shipping_service = ShippingService(db)
    return_shipment = shipping_service.create_return_shipment(
        shipment_id,
        return_reason,
        return_type,
        current_user.id
    )
    
    return {
        "message": "Return shipment created successfully",
        "return_shipment": {
            "id": return_shipment.id,
            "return_tracking_number": return_shipment.return_tracking_number,
            "status": return_shipment.status,
            "return_reason": return_shipment.return_reason,
            "return_type": return_shipment.return_type
        }
    }
