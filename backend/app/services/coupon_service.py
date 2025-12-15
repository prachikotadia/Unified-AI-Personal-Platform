"""
Coupon Validation Service
Handles coupon validation, application, and usage tracking
"""
import structlog
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.marketplace_db import Coupon, CouponUsage, Order

logger = structlog.get_logger()

class CouponService:
    """Service for coupon validation and management"""
    
    def __init__(self, db: Session):
        self.db = db
        self.logger = logger
    
    def validate_coupon(
        self,
        coupon_code: str,
        cart_total: float,
        user_id: Optional[int] = None,
        product_ids: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        """
        Validate coupon code
        
        Args:
            coupon_code: Coupon code to validate
            cart_total: Total cart amount
            user_id: Optional user ID for per-user limits
            product_ids: Optional list of product IDs in cart
            
        Returns:
            Validation result with discount details
        """
        try:
            coupon = self.db.query(Coupon).filter(
                Coupon.code == coupon_code.upper(),
                Coupon.is_active == True
            ).first()
            
            if not coupon:
                return {
                    "valid": False,
                    "error": "Invalid coupon code"
                }
            
            # Check validity dates
            now = datetime.utcnow()
            if now < coupon.valid_from or now > coupon.valid_until:
                return {
                    "valid": False,
                    "error": "Coupon has expired or is not yet valid"
                }
            
            # Check minimum purchase
            if cart_total < coupon.min_purchase:
                return {
                    "valid": False,
                    "error": f"Minimum purchase of ${coupon.min_purchase:.2f} required"
                }
            
            # Check usage limits
            if coupon.usage_limit and coupon.usage_count >= coupon.usage_limit:
                return {
                    "valid": False,
                    "error": "Coupon usage limit reached"
                }
            
            # Check per-user limit
            if user_id and coupon.user_limit:
                user_usage_count = self.db.query(CouponUsage).filter(
                    and_(
                        CouponUsage.coupon_id == coupon.id,
                        CouponUsage.user_id == user_id
                    )
                ).count()
                
                if user_usage_count >= coupon.user_limit:
                    return {
                        "valid": False,
                        "error": "You have already used this coupon"
                    }
            
            # Check product/category restrictions
            if coupon.applicable_products or coupon.applicable_categories:
                if product_ids:
                    # In real app, check if products match restrictions
                    pass  # Simplified for now
            
            # Calculate discount
            discount = self._calculate_discount(coupon, cart_total)
            
            return {
                "valid": True,
                "coupon_code": coupon.code,
                "coupon_name": coupon.name,
                "discount_type": coupon.discount_type,
                "discount_value": coupon.discount_value,
                "discount": discount,
                "discounted_total": round(cart_total - discount, 2),
                "description": coupon.description
            }
            
        except Exception as e:
            self.logger.error(f"Error validating coupon: {e}")
            return {
                "valid": False,
                "error": "Error validating coupon"
            }
    
    def apply_coupon(
        self,
        coupon_code: str,
        order_id: int,
        user_id: int,
        cart_total: float
    ) -> Dict[str, Any]:
        """
        Apply coupon to order
        
        Args:
            coupon_code: Coupon code
            order_id: Order ID
            user_id: User ID
            cart_total: Cart total
            
        Returns:
            Application result
        """
        try:
            validation = self.validate_coupon(coupon_code, cart_total, user_id)
            
            if not validation["valid"]:
                raise ValueError(validation.get("error", "Invalid coupon"))
            
            coupon = self.db.query(Coupon).filter(
                Coupon.code == coupon_code.upper()
            ).first()
            
            # Record usage
            usage = CouponUsage(
                coupon_id=coupon.id,
                user_id=user_id,
                order_id=order_id,
                discount_amount=validation["discount"]
            )
            self.db.add(usage)
            
            # Update coupon usage count
            coupon.usage_count += 1
            self.db.commit()
            
            return {
                "success": True,
                "coupon_code": coupon.code,
                "discount": validation["discount"],
                "discounted_total": validation["discounted_total"]
            }
            
        except Exception as e:
            self.db.rollback()
            self.logger.error(f"Error applying coupon: {e}")
            raise
    
    def _calculate_discount(self, coupon: Coupon, cart_total: float) -> float:
        """Calculate discount amount"""
        if coupon.discount_type == "percentage":
            discount = cart_total * (coupon.discount_value / 100)
            if coupon.max_discount:
                discount = min(discount, coupon.max_discount)
        elif coupon.discount_type == "fixed":
            discount = coupon.discount_value
        elif coupon.discount_type == "shipping":
            discount = 0  # Shipping discount handled separately
        else:
            discount = 0
        
        return round(discount, 2)
    
    def get_coupon_by_code(self, coupon_code: str) -> Optional[Coupon]:
        """Get coupon by code"""
        return self.db.query(Coupon).filter(
            Coupon.code == coupon_code.upper()
        ).first()
    
    def get_user_coupon_usage(
        self,
        user_id: int,
        coupon_id: Optional[int] = None
    ) -> List[CouponUsage]:
        """Get user's coupon usage history"""
        query = self.db.query(CouponUsage).filter(
            CouponUsage.user_id == user_id
        )
        
        if coupon_id:
            query = query.filter(CouponUsage.coupon_id == coupon_id)
        
        return query.order_by(CouponUsage.used_at.desc()).all()

# Global service instance (will be initialized with db session)
coupon_service = None

