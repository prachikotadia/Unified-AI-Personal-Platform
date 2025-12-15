"""
Order Tracking Service
Handles order tracking and shipment updates
"""
import structlog
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.marketplace_db import Order, OrderTracking

logger = structlog.get_logger()

class OrderTrackingService:
    """Service for order tracking"""
    
    def __init__(self, db: Session):
        self.db = db
        self.logger = logger
    
    def create_tracking(
        self,
        order_id: int,
        tracking_number: str,
        carrier: str,
        carrier_service: Optional[str] = None
    ) -> OrderTracking:
        """
        Create tracking record for order
        
        Args:
            order_id: Order ID
            tracking_number: Tracking number
            carrier: Carrier name (UPS, FedEx, USPS, etc.)
            carrier_service: Optional service type
            
        Returns:
            Created tracking record
        """
        try:
            order = self.db.query(Order).filter(Order.id == order_id).first()
            if not order:
                raise ValueError(f"Order {order_id} not found")
            
            tracking = OrderTracking(
                order_id=order_id,
                tracking_number=tracking_number,
                carrier=carrier,
                carrier_service=carrier_service,
                status="pending",
                estimated_delivery=datetime.utcnow() + timedelta(days=5),
                events=[]
            )
            
            self.db.add(tracking)
            self.db.commit()
            self.db.refresh(tracking)
            
            return tracking
            
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Error creating tracking: {e}")
            raise
    
    def get_tracking(self, order_id: int) -> Optional[Dict[str, Any]]:
        """
        Get tracking information for order
        
        Args:
            order_id: Order ID
            
        Returns:
            Tracking information
        """
        try:
            tracking = self.db.query(OrderTracking).filter(
                OrderTracking.order_id == order_id
            ).first()
            
            if not tracking:
                return None
            
            return {
                "order_id": order_id,
                "tracking_number": tracking.tracking_number,
                "carrier": tracking.carrier,
                "carrier_service": tracking.carrier_service,
                "status": tracking.status,
                "estimated_delivery": tracking.estimated_delivery.isoformat() if tracking.estimated_delivery else None,
                "actual_delivery": tracking.actual_delivery.isoformat() if tracking.actual_delivery else None,
                "current_location": tracking.current_location,
                "events": tracking.events or [],
                "updated_at": tracking.updated_at.isoformat() if tracking.updated_at else None
            }
            
        except Exception as e:
            self.logger.error(f"Error getting tracking: {e}")
            return None
    
    def update_tracking(
        self,
        tracking_number: str,
        status: Optional[str] = None,
        location: Optional[str] = None,
        event: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Update tracking information
        
        Args:
            tracking_number: Tracking number
            status: Optional new status
            location: Optional current location
            event: Optional new tracking event
            
        Returns:
            True if updated successfully
        """
        try:
            tracking = self.db.query(OrderTracking).filter(
                OrderTracking.tracking_number == tracking_number
            ).first()
            
            if not tracking:
                return False
            
            if status:
                tracking.status = status
            
            if location:
                tracking.current_location = location
            
            if event:
                events = tracking.events or []
                events.append({
                    "timestamp": datetime.utcnow().isoformat(),
                    "status": event.get("status"),
                    "location": event.get("location"),
                    "description": event.get("description")
                })
                tracking.events = events
            
            if status == "delivered":
                tracking.actual_delivery = datetime.utcnow()
            
            tracking.updated_at = datetime.utcnow()
            self.db.commit()
            
            return True
            
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Error updating tracking: {e}")
            return False
    
    def get_tracking_by_number(self, tracking_number: str) -> Optional[Dict[str, Any]]:
        """Get tracking by tracking number"""
        tracking = self.db.query(OrderTracking).filter(
            OrderTracking.tracking_number == tracking_number
        ).first()
        
        if not tracking:
            return None
        
        return self.get_tracking(tracking.order_id)
    
    def add_tracking_event(
        self,
        tracking_number: str,
        status: str,
        location: str,
        description: str
    ) -> bool:
        """
        Add tracking event
        
        Args:
            tracking_number: Tracking number
            status: Event status
            location: Event location
            description: Event description
            
        Returns:
            True if added successfully
        """
        return self.update_tracking(
            tracking_number,
            status=status,
            location=location,
            event={
                "status": status,
                "location": location,
                "description": description
            }
        )

# Global service instance (will be initialized with db session)
order_tracking_service = None

