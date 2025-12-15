"""
Shipping Calculation Service
Handles shipping cost calculation and estimation
"""
import structlog
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

logger = structlog.get_logger()

class ShippingService:
    """Service for shipping calculations"""
    
    def __init__(self, db: Session):
        self.db = db
        self.logger = logger
        
        # Shipping rates (mock data - in real app, use shipping API)
        self.shipping_rates = {
            "standard": {
                "name": "Standard Shipping",
                "base_cost": 5.99,
                "cost_per_kg": 1.50,
                "estimated_days": "5-7 business days",
                "free_threshold": 35.00
            },
            "express": {
                "name": "Express Shipping",
                "base_cost": 12.99,
                "cost_per_kg": 2.50,
                "estimated_days": "2-3 business days",
                "free_threshold": 75.00
            },
            "overnight": {
                "name": "Overnight Shipping",
                "base_cost": 24.99,
                "cost_per_kg": 5.00,
                "estimated_days": "1 business day",
                "free_threshold": 150.00
            },
            "international": {
                "name": "International Shipping",
                "base_cost": 19.99,
                "cost_per_kg": 8.00,
                "estimated_days": "7-14 business days",
                "free_threshold": None
            }
        }
    
    def estimate_shipping(
        self,
        address: Dict[str, Any],
        items: List[Dict[str, Any]],
        cart_total: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Estimate shipping costs
        
        Args:
            address: Shipping address
            items: List of items with {product_id, quantity, weight, price}
            cart_total: Optional cart total for free shipping calculation
            
        Returns:
            Shipping estimates for different methods
        """
        try:
            # Calculate total weight (mock - in real app, get from products)
            total_weight = sum(
                item.get("weight", 0.5) * item.get("quantity", 1) 
                for item in items
            )
            
            # Determine if international
            country = address.get("country", "US")
            is_international = country != "US"
            
            # Get available shipping methods
            available_methods = []
            
            for method_key, method_data in self.shipping_rates.items():
                # Skip international if domestic
                if method_key == "international" and not is_international:
                    continue
                
                # Skip non-international if international
                if method_key != "international" and is_international:
                    continue
                
                # Calculate cost
                if method_data["free_threshold"] and cart_total and cart_total >= method_data["free_threshold"]:
                    cost = 0.0
                    method_name = f"Free {method_data['name']}"
                else:
                    cost = method_data["base_cost"] + (total_weight * method_data["cost_per_kg"])
                    method_name = method_data["name"]
                
                available_methods.append({
                    "method": method_key,
                    "name": method_name,
                    "cost": round(cost, 2),
                    "estimated_days": method_data["estimated_days"],
                    "estimated_delivery": self._calculate_delivery_date(method_data["estimated_days"]),
                    "is_free": cost == 0.0
                })
            
            return {
                "address": address,
                "total_weight": round(total_weight, 2),
                "is_international": is_international,
                "shipping_options": available_methods,
                "estimated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error estimating shipping: {e}")
            raise
    
    def calculate_shipping_cost(
        self,
        method: str,
        weight: float,
        cart_total: Optional[float] = None,
        address: Optional[Dict[str, Any]] = None
    ) -> float:
        """
        Calculate shipping cost for a specific method
        
        Args:
            method: Shipping method key
            weight: Total weight in kg
            cart_total: Optional cart total for free shipping
            address: Optional address for location-based pricing
            
        Returns:
            Shipping cost
        """
        if method not in self.shipping_rates:
            raise ValueError(f"Invalid shipping method: {method}")
        
        method_data = self.shipping_rates[method]
        
        # Check free shipping threshold
        if method_data["free_threshold"] and cart_total and cart_total >= method_data["free_threshold"]:
            return 0.0
        
        # Calculate cost
        cost = method_data["base_cost"] + (weight * method_data["cost_per_kg"])
        
        # Apply location-based adjustments (mock)
        if address:
            country = address.get("country", "US")
            if country != "US":
                cost *= 1.5  # International markup
        
        return round(cost, 2)
    
    def _calculate_delivery_date(self, estimated_days: str) -> str:
        """Calculate estimated delivery date"""
        # Parse "5-7 business days" or "2-3 business days"
        try:
            days_str = estimated_days.split()[0]
            if "-" in days_str:
                max_days = int(days_str.split("-")[1])
            else:
                max_days = int(days_str)
            
            delivery_date = datetime.utcnow() + timedelta(days=max_days)
            return delivery_date.isoformat()
        except:
            return (datetime.utcnow() + timedelta(days=7)).isoformat()
    
    def get_shipping_methods(
        self,
        is_international: bool = False
    ) -> List[Dict[str, Any]]:
        """Get available shipping methods"""
        methods = []
        
        for method_key, method_data in self.shipping_rates.items():
            if is_international and method_key != "international":
                continue
            if not is_international and method_key == "international":
                continue
            
            methods.append({
                "method": method_key,
                "name": method_data["name"],
                "estimated_days": method_data["estimated_days"],
                "free_threshold": method_data["free_threshold"]
            })
        
        return methods

# Global service instance (will be initialized with db session)
shipping_service = None
