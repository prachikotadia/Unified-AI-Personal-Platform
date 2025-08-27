from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import structlog
import uuid

from app.models.shipping import (
    Address, ShippingZone, ShippingRate, Shipment, ShipmentTrackingEvent,
    DeliveryAttempt, ReturnShipment, ShippingLabel, ShippingMethod, Carrier
)

logger = structlog.get_logger()

class ShippingService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_addresses(self, user_id: int) -> List[Address]:
        """Get user's addresses"""
        return self.db.query(Address).filter(
            Address.user_id == user_id,
            Address.is_active == True
        ).all()
    
    def create_address(self, user_id: int, address_data: Dict[str, Any]) -> Address:
        """Create new address"""
        # Set default address if this is the first address
        is_default = address_data.get("is_default", False)
        if is_default:
            # Remove default from other addresses
            self.db.query(Address).filter(
                Address.user_id == user_id,
                Address.is_default == True
            ).update({"is_default": False})
        elif not self.db.query(Address).filter(Address.user_id == user_id).first():
            # First address should be default
            is_default = True
        
        address = Address(
            user_id=user_id,
            is_default=is_default,
            **address_data
        )
        
        self.db.add(address)
        self.db.commit()
        self.db.refresh(address)
        
        return address
    
    def update_address(self, address_id: int, user_id: int, address_data: Dict[str, Any]) -> Optional[Address]:
        """Update address"""
        address = self.db.query(Address).filter(
            Address.id == address_id,
            Address.user_id == user_id
        ).first()
        
        if not address:
            return None
        
        for key, value in address_data.items():
            if hasattr(address, key):
                setattr(address, key, value)
        
        address.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(address)
        
        return address
    
    def delete_address(self, address_id: int, user_id: int) -> bool:
        """Delete address"""
        address = self.db.query(Address).filter(
            Address.id == address_id,
            Address.user_id == user_id
        ).first()
        
        if not address:
            return False
        
        address.is_active = False
        self.db.commit()
        
        return True
    
    def set_default_address(self, address_id: int, user_id: int) -> bool:
        """Set default address"""
        address = self.db.query(Address).filter(
            Address.id == address_id,
            Address.user_id == user_id
        ).first()
        
        if not address:
            return False
        
        # Remove default from other addresses
        self.db.query(Address).filter(
            Address.user_id == user_id,
            Address.is_default == True
        ).update({"is_default": False})
        
        # Set new default
        address.is_default = True
        self.db.commit()
        
        return True
    
    def validate_address(self, address_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate address (mock implementation)"""
        # In production, integrate with address validation service
        required_fields = ["address_line1", "city", "state", "postal_code", "country"]
        
        is_valid = all(address_data.get(field) for field in required_fields)
        
        result = {
            "is_valid": is_valid,
            "suggestions": [],
            "normalized_address": None,
            "messages": []
        }
        
        if not is_valid:
            result["messages"].append("Missing required address fields")
        else:
            # Mock normalization
            result["normalized_address"] = {
                "address_line1": address_data["address_line1"].upper(),
                "city": address_data["city"].title(),
                "state": address_data["state"].upper(),
                "postal_code": address_data["postal_code"],
                "country": address_data["country"].upper()
            }
        
        return result
    
    def get_shipping_rates(
        self,
        from_address: Dict[str, Any],
        to_address: Dict[str, Any],
        weight: float,
        dimensions: Optional[Dict[str, Any]] = None,
        items: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """Get shipping rates (mock implementation)"""
        # In production, integrate with shipping carriers API
        rates = []
        
        # Standard shipping
        rates.append({
            "method": ShippingMethod.standard,
            "carrier": Carrier.usps,
            "cost": 5.99,
            "estimated_days": 5,
            "service_name": "USPS Standard",
            "tracking_available": True
        })
        
        # Express shipping
        rates.append({
            "method": ShippingMethod.express,
            "carrier": Carrier.fedex,
            "cost": 12.99,
            "estimated_days": 2,
            "service_name": "FedEx Express",
            "tracking_available": True
        })
        
        # Overnight shipping
        rates.append({
            "method": ShippingMethod.overnight,
            "carrier": Carrier.ups,
            "cost": 24.99,
            "estimated_days": 1,
            "service_name": "UPS Overnight",
            "tracking_available": True
        })
        
        # Adjust rates based on weight and distance
        if weight > 5:
            for rate in rates:
                rate["cost"] += (weight - 5) * 0.5
        
        return rates
    
    def create_shipment(
        self,
        order_id: int,
        shipping_address_id: int,
        method: ShippingMethod,
        carrier: Carrier,
        weight: Optional[float] = None,
        dimensions: Optional[Dict[str, Any]] = None
    ) -> Shipment:
        """Create shipment"""
        # Get shipping rate
        rates = self.get_shipping_rates({}, {}, weight or 1.0)
        shipping_rate = next((r for r in rates if r["method"] == method and r["carrier"] == carrier), None)
        
        if not shipping_rate:
            raise ValueError("Invalid shipping method or carrier")
        
        # Generate tracking number
        tracking_number = f"{carrier.upper()}{uuid.uuid4().hex[:8].upper()}"
        
        # Calculate estimated delivery
        estimated_delivery = datetime.utcnow() + timedelta(days=shipping_rate["estimated_days"])
        
        shipment = Shipment(
            order_id=order_id,
            shipping_address_id=shipping_address_id,
            method=method,
            carrier=carrier,
            tracking_number=tracking_number,
            tracking_url=f"https://tracking.{carrier}.com/{tracking_number}",
            shipping_cost=shipping_rate["cost"],
            weight=weight or 1.0,
            dimensions=dimensions,
            estimated_delivery=estimated_delivery
        )
        
        self.db.add(shipment)
        self.db.commit()
        self.db.refresh(shipment)
        
        # Create initial tracking event
        tracking_event = ShipmentTrackingEvent(
            shipment_id=shipment.id,
            event_type="shipment_created",
            status="pending",
            description="Shipment created and label generated",
            event_time=datetime.utcnow()
        )
        
        self.db.add(tracking_event)
        self.db.commit()
        
        return shipment
    
    def get_shipments(
        self,
        user_id: int,
        order_id: Optional[int] = None,
        status: Optional[str] = None,
        page: int = 1,
        limit: int = 20
    ) -> List[Shipment]:
        """Get shipments"""
        query = self.db.query(Shipment).join(Address).filter(Address.user_id == user_id)
        
        if order_id:
            query = query.filter(Shipment.order_id == order_id)
        
        if status:
            query = query.filter(Shipment.status == status)
        
        offset = (page - 1) * limit
        return query.order_by(desc(Shipment.created_at)).offset(offset).limit(limit).all()
    
    def get_shipment(self, shipment_id: int, user_id: int) -> Optional[Shipment]:
        """Get specific shipment"""
        return self.db.query(Shipment).join(Address).filter(
            Shipment.id == shipment_id,
            Address.user_id == user_id
        ).first()
    
    def track_shipment(self, tracking_number: str) -> Optional[Dict[str, Any]]:
        """Track shipment by tracking number"""
        shipment = self.db.query(Shipment).filter(
            Shipment.tracking_number == tracking_number
        ).first()
        
        if not shipment:
            return None
        
        # Get tracking events
        events = self.db.query(ShipmentTrackingEvent).filter(
            ShipmentTrackingEvent.shipment_id == shipment.id
        ).order_by(asc(ShipmentTrackingEvent.event_time)).all()
        
        return {
            "tracking_number": shipment.tracking_number,
            "status": shipment.status,
            "carrier": shipment.carrier,
            "estimated_delivery": shipment.estimated_delivery.isoformat() if shipment.estimated_delivery else None,
            "events": [
                {
                    "event_type": event.event_type,
                    "status": event.status,
                    "description": event.description,
                    "location": event.location,
                    "event_time": event.event_time.isoformat()
                }
                for event in events
            ]
        }
    
    def generate_shipping_label(self, shipment_id: int, user_id: int) -> Optional[ShippingLabel]:
        """Generate shipping label"""
        shipment = self.get_shipment(shipment_id, user_id)
        if not shipment:
            return None
        
        # Check if label already exists
        existing_label = self.db.query(ShippingLabel).filter(
            ShippingLabel.shipment_id == shipment_id
        ).first()
        
        if existing_label:
            return existing_label
        
        # Generate label (mock implementation)
        label = ShippingLabel(
            shipment_id=shipment_id,
            label_type="pdf",
            label_url=f"https://labels.example.com/{shipment.tracking_number}.pdf",
            label_data="base64_encoded_label_data",
            label_number=f"LABEL-{uuid.uuid4().hex[:8].upper()}",
            barcode=shipment.tracking_number,
            expires_at=datetime.utcnow() + timedelta(days=30)
        )
        
        self.db.add(label)
        self.db.commit()
        self.db.refresh(label)
        
        return label
    
    def create_return_shipment(
        self,
        shipment_id: int,
        return_reason: str,
        return_type: str,
        user_id: int
    ) -> ReturnShipment:
        """Create return shipment"""
        # Verify shipment belongs to user
        shipment = self.get_shipment(shipment_id, user_id)
        if not shipment:
            raise ValueError("Shipment not found")
        
        return_shipment = ReturnShipment(
            original_shipment_id=shipment_id,
            return_reason=return_reason,
            return_type=return_type,
            return_tracking_number=f"RETURN-{uuid.uuid4().hex[:8].upper()}",
            return_carrier=Carrier.usps,
            return_shipping_cost=0.0  # Free returns
        )
        
        self.db.add(return_shipment)
        self.db.commit()
        self.db.refresh(return_shipment)
        
        return return_shipment
    
    def update_shipment_status(self, shipment_id: int, status: str, event_description: str = None):
        """Update shipment status and create tracking event"""
        shipment = self.db.query(Shipment).filter(Shipment.id == shipment_id).first()
        if not shipment:
            return
        
        shipment.status = status
        shipment.updated_at = datetime.utcnow()
        
        if status == "delivered":
            shipment.actual_delivery = datetime.utcnow()
        
        # Create tracking event
        if event_description:
            tracking_event = ShipmentTrackingEvent(
                shipment_id=shipment_id,
                event_type=f"status_{status}",
                status=status,
                description=event_description,
                event_time=datetime.utcnow()
            )
            self.db.add(tracking_event)
        
        self.db.commit()
