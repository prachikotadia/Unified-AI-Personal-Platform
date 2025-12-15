"""
Price Alert Service
Enhanced service for managing price alerts with notifications and monitoring
"""
import structlog
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.marketplace_db import PriceAlert, Product
from app.services.notification_service import NotificationService

logger = structlog.get_logger()

class PriceAlertService:
    """Enhanced service for price alerts"""
    
    def __init__(self, db: Session):
        self.db = db
        self.logger = logger
        self.notification_service = NotificationService()
    
    def create_price_alert(
        self,
        user_id: int,
        product_id: int,
        target_price: float,
        notification_preferences: Optional[Dict[str, Any]] = None
    ) -> PriceAlert:
        """
        Create price alert
        
        Args:
            user_id: User ID
            product_id: Product ID
            target_price: Target price
            notification_preferences: Notification preferences
            
        Returns:
            Created price alert
        """
        try:
            product = self.db.query(Product).filter(Product.id == product_id).first()
            if not product:
                raise ValueError(f"Product {product_id} not found")
            
            # Check if alert already exists
            existing = self.db.query(PriceAlert).filter(
                and_(
                    PriceAlert.user_id == user_id,
                    PriceAlert.product_id == product_id,
                    PriceAlert.is_active == True
                )
            ).first()
            
            if existing:
                # Update existing alert
                existing.target_price = target_price
                existing.current_price = product.price
                if notification_preferences:
                    existing.notification_preferences = notification_preferences
                existing.updated_at = datetime.utcnow()
                self.db.commit()
                return existing
            
            # Create new alert
            alert = PriceAlert(
                user_id=user_id,
                product_id=product_id,
                target_price=target_price,
                current_price=product.price,
                notification_preferences=notification_preferences or {
                    "email": True,
                    "push": True,
                    "sms": False
                },
                price_history=[{
                    "price": product.price,
                    "date": datetime.utcnow().isoformat()
                }]
            )
            
            self.db.add(alert)
            self.db.commit()
            self.db.refresh(alert)
            
            return alert
            
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Error creating price alert: {e}")
            raise
    
    async def check_price_alerts(self, product_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Check price alerts and send notifications
        
        Args:
            product_id: Optional product ID to check specific product
            
        Returns:
            List of triggered alerts
        """
        try:
            query = self.db.query(PriceAlert).filter(
                PriceAlert.is_active == True
            )
            
            if product_id:
                query = query.filter(PriceAlert.product_id == product_id)
            
            alerts = query.all()
            triggered_alerts = []
            
            for alert in alerts:
                product = self.db.query(Product).filter(Product.id == alert.product_id).first()
                if not product:
                    continue
                
                # Check if price dropped to target
                if product.price <= alert.target_price:
                    # Update alert
                    alert.triggered_at = datetime.utcnow()
                    alert.is_active = False  # Deactivate after trigger
                    
                    # Update price history
                    history = alert.price_history or []
                    history.append({
                        "price": product.price,
                        "date": datetime.utcnow().isoformat(),
                        "triggered": True
                    })
                    alert.price_history = history
                    
                    # Send notification
                    await self._send_price_alert_notification(alert, product)
                    
                    triggered_alerts.append({
                        "alert_id": alert.id,
                        "product_id": product.id,
                        "product_name": product.name,
                        "target_price": alert.target_price,
                        "current_price": product.price,
                        "savings": alert.target_price - product.price
                    })
            
            self.db.commit()
            return triggered_alerts
            
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Error checking price alerts: {e}")
            return []
    
    async def _send_price_alert_notification(self, alert: PriceAlert, product: Product):
        """Send price alert notification"""
        try:
            prefs = alert.notification_preferences or {}
            
            message = f"Price Alert! {product.name} is now ${product.price:.2f} (target: ${alert.target_price:.2f})"
            
            if prefs.get("email", False):
                await self.notification_service.send_finance_notification(
                    str(alert.user_id),
                    "price_alert",
                    message=message,
                    product_name=product.name,
                    current_price=product.price,
                    target_price=alert.target_price
                )
            
            alert.last_notified_at = datetime.utcnow()
            alert.notification_count += 1
            
        except Exception as e:
            self.logger.error(f"Error sending price alert notification: {e}")
    
    def get_user_price_alerts(self, user_id: int, active_only: bool = True) -> List[PriceAlert]:
        """Get user's price alerts"""
        query = self.db.query(PriceAlert).filter(PriceAlert.user_id == user_id)
        
        if active_only:
            query = query.filter(PriceAlert.is_active == True)
        
        return query.order_by(PriceAlert.created_at.desc()).all()
    
    def update_price_alert(
        self,
        alert_id: int,
        user_id: int,
        target_price: Optional[float] = None,
        is_active: Optional[bool] = None,
        notification_preferences: Optional[Dict[str, Any]] = None
    ) -> Optional[PriceAlert]:
        """Update price alert"""
        try:
            alert = self.db.query(PriceAlert).filter(
                and_(
                    PriceAlert.id == alert_id,
                    PriceAlert.user_id == user_id
                )
            ).first()
            
            if not alert:
                return None
            
            if target_price is not None:
                alert.target_price = target_price
            
            if is_active is not None:
                alert.is_active = is_active
            
            if notification_preferences:
                alert.notification_preferences = notification_preferences
            
            alert.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(alert)
            
            return alert
            
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Error updating price alert: {e}")
            return None
    
    def delete_price_alert(self, alert_id: int, user_id: int) -> bool:
        """Delete price alert"""
        try:
            alert = self.db.query(PriceAlert).filter(
                and_(
                    PriceAlert.id == alert_id,
                    PriceAlert.user_id == user_id
                )
            ).first()
            
            if not alert:
                return False
            
            self.db.delete(alert)
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Error deleting price alert: {e}")
            return False

# Global service instance (will be initialized with db session)
price_alert_service = None

