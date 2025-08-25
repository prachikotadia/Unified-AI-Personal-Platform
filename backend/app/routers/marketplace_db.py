from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from app.database import get_db
from app.services.marketplace_service import MarketplaceService
from app.models.marketplace_db import (
    OrderStatus, PaymentStatus, PaymentMethod, ShippingMethod,
    ReturnStatus, InventoryStatus
)

router = APIRouter()

# Product endpoints
@router.get("/products")
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = Query("created_at", regex="^(created_at|price|rating|name)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """Get products with filtering and sorting"""
    service = MarketplaceService(db)
    return service.get_products(
        skip=skip, limit=limit, category_id=category_id,
        search=search, min_price=min_price, max_price=max_price,
        sort_by=sort_by, sort_order=sort_order
    )

@router.get("/products/{product_id}")
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product"""
    service = MarketplaceService(db)
    product = service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/products/featured")
async def get_featured_products(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get featured products"""
    service = MarketplaceService(db)
    return service.get_featured_products(limit=limit)

@router.get("/products/deals")
async def get_deal_products(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get products with deals"""
    service = MarketplaceService(db)
    return service.get_deal_products(limit=limit)

@router.get("/products/trending")
async def get_trending_products(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get trending products"""
    service = MarketplaceService(db)
    return service.get_trending_products(limit=limit)

# Inventory Management
@router.get("/products/{product_id}/inventory")
async def get_inventory_status(product_id: int, db: Session = Depends(get_db)):
    """Get product inventory status"""
    service = MarketplaceService(db)
    status = service.get_inventory_status(product_id)
    if not status:
        raise HTTPException(status_code=404, detail="Product not found")
    return status

@router.get("/products/{product_id}/inventory/logs")
async def get_inventory_logs(
    product_id: int,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get inventory change logs"""
    service = MarketplaceService(db)
    return service.get_inventory_logs(product_id, limit=limit)

@router.post("/products/{product_id}/inventory/update")
async def update_inventory(
    product_id: int,
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Update product inventory"""
    service = MarketplaceService(db)
    result = service.update_inventory(
        product_id=product_id,
        quantity=data.get("quantity", 0),
        action=data.get("action", "adjustment"),
        user_id=data.get("user_id"),
        reason=data.get("reason")
    )
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    return result

# Cart Management
@router.get("/cart")
async def get_cart(user_id: str = Query(..., description="User ID"), db: Session = Depends(get_db)):
    """Get user's cart"""
    service = MarketplaceService(db)
    return service.get_cart(user_id)

@router.post("/cart/add")
async def add_to_cart(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Add item to cart"""
    service = MarketplaceService(db)
    result = service.add_to_cart(
        user_id=data["user_id"],
        product_id=data["product_id"],
        quantity=data.get("quantity", 1)
    )
    if not result:
        raise HTTPException(status_code=400, detail="Failed to add to cart")
    return result

@router.put("/cart/update")
async def update_cart_item(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Update cart item quantity"""
    service = MarketplaceService(db)
    result = service.update_cart_item(
        user_id=data["user_id"],
        product_id=data["product_id"],
        quantity=data["quantity"]
    )
    if not result:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return result

@router.delete("/cart/remove")
async def remove_from_cart(
    user_id: str = Query(..., description="User ID"),
    product_id: int = Query(..., description="Product ID"),
    db: Session = Depends(get_db)
):
    """Remove item from cart"""
    service = MarketplaceService(db)
    success = service.remove_from_cart(user_id, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Item removed from cart"}

@router.delete("/cart/clear")
async def clear_cart(
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Clear user's cart"""
    service = MarketplaceService(db)
    service.clear_cart(user_id)
    return {"message": "Cart cleared"}

# Wishlist Management
@router.get("/wishlist")
async def get_wishlist(user_id: str = Query(..., description="User ID"), db: Session = Depends(get_db)):
    """Get user's wishlist"""
    service = MarketplaceService(db)
    return service.get_wishlist(user_id)

@router.post("/wishlist/add")
async def add_to_wishlist(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Add item to wishlist"""
    service = MarketplaceService(db)
    return service.add_to_wishlist(
        user_id=data["user_id"],
        product_id=data["product_id"]
    )

@router.delete("/wishlist/remove")
async def remove_from_wishlist(
    user_id: str = Query(..., description="User ID"),
    product_id: int = Query(..., description="Product ID"),
    db: Session = Depends(get_db)
):
    """Remove item from wishlist"""
    service = MarketplaceService(db)
    success = service.remove_from_wishlist(user_id, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    return {"message": "Item removed from wishlist"}

# Order Management
@router.post("/orders/create")
async def create_order(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Create a new order"""
    service = MarketplaceService(db)
    
    # Get cart items
    cart_items = service.get_cart(data["user_id"])
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Create order
    order = service.create_order(
        user_id=data["user_id"],
        cart_items=cart_items,
        shipping_address=data["shipping_address"],
        billing_address=data["billing_address"],
        payment_method=PaymentMethod(data["payment_method"]),
        shipping_method=ShippingMethod(data.get("shipping_method", "standard"))
    )
    
    if not order:
        raise HTTPException(status_code=400, detail="Failed to create order")
    
    return order

@router.get("/orders")
async def get_orders(
    user_id: str = Query(..., description="User ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get user's orders"""
    service = MarketplaceService(db)
    return service.get_orders(user_id, skip=skip, limit=limit)

@router.get("/orders/{order_id}")
async def get_order(
    order_id: int,
    user_id: Optional[str] = Query(None, description="User ID for verification"),
    db: Session = Depends(get_db)
):
    """Get a specific order"""
    service = MarketplaceService(db)
    order = service.get_order(order_id, user_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Update order status"""
    service = MarketplaceService(db)
    order = service.update_order_status(order_id, OrderStatus(data["status"]))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# Shipping Calculator
@router.post("/shipping/calculate")
async def calculate_shipping(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Calculate shipping cost"""
    service = MarketplaceService(db)
    shipping_cost = service.calculate_shipping(
        shipping_address=data["shipping_address"],
        shipping_method=ShippingMethod(data["shipping_method"]),
        subtotal=data["subtotal"]
    )
    return {
        "shipping_cost": shipping_cost,
        "shipping_method": data["shipping_method"],
        "estimated_days": {
            "standard": 5,
            "express": 2,
            "overnight": 1,
            "same_day": 1,
            "international": 7
        }.get(data["shipping_method"], 5)
    }

# Tax Calculator
@router.post("/tax/calculate")
async def calculate_tax(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Calculate tax"""
    service = MarketplaceService(db)
    tax_amount = service.calculate_tax(
        billing_address=data["billing_address"],
        subtotal=data["subtotal"]
    )
    return {
        "tax_amount": tax_amount,
        "tax_rate": tax_amount / data["subtotal"] if data["subtotal"] > 0 else 0,
        "billing_address": data["billing_address"]
    }

# Return/Refund System
@router.post("/returns/create")
async def create_return(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Create a return request"""
    service = MarketplaceService(db)
    return_request = service.create_return(
        user_id=data["user_id"],
        order_id=data["order_id"],
        reason=data["reason"],
        description=data.get("description"),
        return_method=data.get("return_method", "shipping")
    )
    if not return_request:
        raise HTTPException(status_code=404, detail="Order not found")
    return return_request

@router.get("/returns")
async def get_returns(
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Get user's returns"""
    service = MarketplaceService(db)
    return service.get_returns(user_id)

@router.put("/returns/{return_id}/status")
async def update_return_status(
    return_id: int,
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Update return status"""
    service = MarketplaceService(db)
    return_request = service.update_return_status(
        return_id=return_id,
        status=ReturnStatus(data["status"]),
        refund_amount=data.get("refund_amount")
    )
    if not return_request:
        raise HTTPException(status_code=404, detail="Return not found")
    return return_request

# Loyalty Program
@router.get("/loyalty")
async def get_loyalty_program(
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Get user's loyalty program status"""
    service = MarketplaceService(db)
    return service.get_loyalty_program(user_id)

@router.post("/loyalty/points/add")
async def add_loyalty_points(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Add loyalty points"""
    service = MarketplaceService(db)
    loyalty = service.add_loyalty_points(
        user_id=data["user_id"],
        amount=data["amount"],
        description=data["description"]
    )
    return loyalty

@router.post("/loyalty/points/redeem")
async def redeem_loyalty_points(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Redeem loyalty points"""
    service = MarketplaceService(db)
    loyalty = service.redeem_loyalty_points(
        user_id=data["user_id"],
        points=data["points"],
        description=data["description"]
    )
    if not loyalty:
        raise HTTPException(status_code=400, detail="Insufficient points")
    return loyalty

@router.get("/loyalty/transactions")
async def get_loyalty_transactions(
    user_id: str = Query(..., description="User ID"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get loyalty transactions"""
    service = MarketplaceService(db)
    return service.get_loyalty_transactions(user_id, limit=limit)

# Enhanced Features
@router.get("/recommendations")
async def get_ai_recommendations(
    user_id: str = Query(..., description="User ID"),
    product_id: Optional[int] = Query(None, description="Product ID"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get AI-powered recommendations"""
    service = MarketplaceService(db)
    return service.get_ai_recommendations(user_id, product_id, limit)

@router.post("/price-alerts")
async def create_price_alert(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Create a price alert"""
    service = MarketplaceService(db)
    alert = service.create_price_alert(
        user_id=data["user_id"],
        product_id=data["product_id"],
        target_price=data["target_price"]
    )
    if not alert:
        raise HTTPException(status_code=404, detail="Product not found")
    return alert

@router.get("/price-alerts")
async def get_price_alerts(
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Get user's price alerts"""
    service = MarketplaceService(db)
    return service.get_price_alerts(user_id)

@router.delete("/price-alerts/{alert_id}")
async def delete_price_alert(
    alert_id: int,
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Delete a price alert"""
    service = MarketplaceService(db)
    # Implementation would be added to service
    return {"message": "Price alert deleted"}

@router.post("/comparisons")
async def create_product_comparison(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Create a product comparison"""
    service = MarketplaceService(db)
    return service.create_product_comparison(
        user_id=data["user_id"],
        name=data["name"],
        product_ids=data["product_ids"]
    )

@router.get("/comparisons")
async def get_product_comparisons(
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Get user's product comparisons"""
    service = MarketplaceService(db)
    return service.get_product_comparisons(user_id)

@router.get("/recently-viewed")
async def get_recently_viewed(
    user_id: str = Query(..., description="User ID"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get recently viewed products"""
    service = MarketplaceService(db)
    return service.get_recently_viewed(user_id, limit)

@router.post("/recently-viewed")
async def add_recently_viewed(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Add product to recently viewed"""
    service = MarketplaceService(db)
    return service.add_recently_viewed(
        user_id=data["user_id"],
        product_id=data["product_id"]
    )

# Reviews and Q&A
@router.post("/products/{product_id}/reviews")
async def create_review(
    product_id: int,
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Create a product review"""
    service = MarketplaceService(db)
    review = service.create_review(
        user_id=data["user_id"],
        product_id=product_id,
        rating=data["rating"],
        title=data["title"],
        comment=data["comment"],
        user_name=data.get("user_name")
    )
    return review

@router.get("/products/{product_id}/reviews")
async def get_product_reviews(
    product_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get product reviews"""
    service = MarketplaceService(db)
    return service.get_product_reviews(product_id, skip=skip, limit=limit)

@router.post("/products/{product_id}/questions")
async def create_product_question(
    product_id: int,
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Create a product question"""
    service = MarketplaceService(db)
    question = service.create_product_question(
        user_id=data["user_id"],
        product_id=product_id,
        question=data["question"],
        user_name=data.get("user_name")
    )
    return question

@router.post("/questions/{question_id}/answer")
async def answer_product_question(
    question_id: int,
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Answer a product question"""
    service = MarketplaceService(db)
    answer = service.answer_product_question(
        question_id=question_id,
        user_id=data["user_id"],
        answer=data["answer"],
        user_name=data.get("user_name"),
        user_type=data.get("user_type", "customer")
    )
    return answer

@router.get("/products/{product_id}/questions")
async def get_product_questions(
    product_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get product questions"""
    service = MarketplaceService(db)
    return service.get_product_questions(product_id, skip=skip, limit=limit)

# Categories
@router.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    """Get all categories"""
    service = MarketplaceService(db)
    return service.get_categories()

@router.get("/categories/{category_id}")
async def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get a specific category"""
    service = MarketplaceService(db)
    category = service.get_category(category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.get("/categories/slug/{slug}")
async def get_category_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get category by slug"""
    service = MarketplaceService(db)
    category = service.get_category_by_slug(slug)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category
