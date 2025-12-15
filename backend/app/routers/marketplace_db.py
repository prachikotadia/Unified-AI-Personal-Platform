from fastapi import APIRouter, Depends, HTTPException, status, Query, Request, Form, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel
import structlog
import uuid
import json
import os

from app.database import get_db
from app.services.marketplace_service import MarketplaceService
from app.models.marketplace import (
    ProductCreate, ProductUpdate, ReviewCreate, CartItemCreate, 
    CartItemUpdate, OrderCreate, SearchRequest, SearchFilters
)
from app.models.marketplace_db import (
    Product, Review, CartItem, WishlistItem, Order, OrderItem, 
    Category, ProductCategory, ProductSubcategory, OrderStatus, 
    PaymentStatus, PaymentMethod, AIRecommendation, PriceAlert, 
    ProductComparison, RecentlyViewed, ProductQuestion, ProductAnswer
)

logger = structlog.get_logger()
router = APIRouter()

def get_mock_user():
    """Mock user for development - replace with actual auth"""
    return {"id": "user_123", "username": "testuser"}

# Product endpoints
@router.get("/products", response_model=List[Dict[str, Any]])
async def get_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    subcategory: Optional[str] = Query(None, description="Filter by subcategory"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    rating: Optional[float] = Query(None, description="Minimum rating"),
    in_stock: Optional[bool] = Query(None, description="In stock only"),
    sort_by: str = Query("relevance", description="Sort by: relevance, price, rating, newest, featured"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Get products with advanced filtering and sorting"""
    service = MarketplaceService(db)
    result = service.get_products(
        category=category,
        subcategory=subcategory,
        min_price=min_price,
        max_price=max_price,
        brand=brand,
        rating=rating,
        in_stock=in_stock,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit
    )
    # Convert SQLAlchemy objects to dictionaries
    products = []
    for product in result["products"]:
        product_dict = {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "original_price": product.original_price,
            "discount_percentage": product.discount_percentage,
            "category": product.category.value if product.category else None,
            "subcategory": product.subcategory.value if product.subcategory else None,
            "brand": product.brand,
            "sku": product.sku,
            "stock_quantity": product.stock_quantity,
            "images": product.images,
            "specifications": product.specifications,
            "features": product.features,
            "tags": product.tags,
            "rating": product.rating,
            "review_count": product.review_count,
            "featured": product.featured,
            "trending": product.trending,
            "prime_eligible": product.prime_eligible,
            "free_shipping": product.free_shipping,
            "status": product.status,
            "created_at": product.created_at.isoformat() if product.created_at else None
        }
        products.append(product_dict)
    return products

@router.get("/products/search")
async def search_products(
    q: str = Query(..., description="Search query"),
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    rating: Optional[float] = Query(None),
    in_stock: Optional[bool] = Query(None),
    sort_by: str = Query("relevance"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search products"""
    service = MarketplaceService(db)
    filters = {
        "category": category,
        "min_price": min_price,
        "max_price": max_price,
        "rating": rating,
        "in_stock": in_stock
    }
    return service.search_products(q, filters, sort_by, sort_order, page, limit)

@router.get("/products/{product_id}")
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get product by ID"""
    service = MarketplaceService(db)
    product = service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Record product view
    service.record_product_view("user_123", product_id)
    service.add_recently_viewed("user_123", product_id)
    
    return product

@router.get("/products/featured")
async def get_featured_products(limit: int = Query(8, ge=1, le=20), db: Session = Depends(get_db)):
    """Get featured products"""
    service = MarketplaceService(db)
    return service.get_featured_products(limit)

@router.get("/products/trending")
async def get_trending_products(limit: int = Query(8, ge=1, le=20), db: Session = Depends(get_db)):
    """Get trending products"""
    service = MarketplaceService(db)
    return service.get_trending_products(limit)

@router.get("/products/deals")
async def get_deals(limit: int = Query(8, ge=1, le=20), db: Session = Depends(get_db)):
    """Get products with deals"""
    service = MarketplaceService(db)
    return service.get_deals(limit)

@router.get("/products/prime")
async def get_prime_products(limit: int = Query(8, ge=1, le=20), db: Session = Depends(get_db)):
    """Get prime eligible products"""
    service = MarketplaceService(db)
    return service.get_prime_products(limit)

@router.get("/products/popular")
async def get_popular_products(limit: int = Query(8, ge=1, le=20), db: Session = Depends(get_db)):
    """Get popular products"""
    service = MarketplaceService(db)
    return service.get_popular_products(limit)

# Cart endpoints
@router.get("/cart")
async def get_cart(db: Session = Depends(get_db)):
    """Get user's cart"""
    service = MarketplaceService(db)
    return service.get_cart("user_123")

@router.post("/cart")
async def add_to_cart(item: CartItemCreate, db: Session = Depends(get_db)):
    """Add item to cart"""
    service = MarketplaceService(db)
    return service.add_to_cart("user_123", item.product_id, item.quantity)

@router.put("/cart/{product_id}")
async def update_cart_item(product_id: int, quantity: int = Query(..., ge=0), db: Session = Depends(get_db)):
    """Update cart item quantity"""
    service = MarketplaceService(db)
    return service.update_cart_item("user_123", product_id, quantity)

@router.delete("/cart/{product_id}")
async def remove_from_cart(product_id: int, db: Session = Depends(get_db)):
    """Remove item from cart"""
    service = MarketplaceService(db)
    success = service.remove_from_cart("user_123", product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    return {"message": "Item removed from cart"}

@router.delete("/cart")
async def clear_cart(db: Session = Depends(get_db)):
    """Clear cart"""
    service = MarketplaceService(db)
    service.clear_cart("user_123")
    return {"message": "Cart cleared"}

# Wishlist endpoints
@router.get("/wishlist")
async def get_wishlist(db: Session = Depends(get_db)):
    """Get user's wishlist"""
    service = MarketplaceService(db)
    return service.get_wishlist("user_123")

@router.post("/wishlist")
async def add_to_wishlist(product_id: int, db: Session = Depends(get_db)):
    """Add item to wishlist"""
    service = MarketplaceService(db)
    return service.add_to_wishlist("user_123", product_id)

@router.delete("/wishlist/{product_id}")
async def remove_from_wishlist(product_id: int, db: Session = Depends(get_db)):
    """Remove item from wishlist"""
    service = MarketplaceService(db)
    success = service.remove_from_wishlist("user_123", product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")
    return {"message": "Item removed from wishlist"}

# Order endpoints
@router.get("/orders")
async def get_orders(db: Session = Depends(get_db)):
    """Get user's orders"""
    service = MarketplaceService(db)
    return service.get_user_orders("user_123")

@router.get("/orders/{order_id}")
async def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get order by ID"""
    service = MarketplaceService(db)
    order = service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/orders")
async def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """Create new order"""
    service = MarketplaceService(db)
    cart_items = service.get_cart("user_123")
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    return service.create_order(
        "user_123",
        cart_items,
        order_data.shipping_address,
        order_data.billing_address,
        order_data.payment_method
    )

# Review endpoints
@router.get("/products/{product_id}/reviews")
async def get_product_reviews(
    product_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get product reviews"""
    service = MarketplaceService(db)
    return service.get_product_reviews(product_id, page, limit)

@router.post("/products/{product_id}/reviews")
async def create_review(
    product_id: int,
    review: ReviewCreate,
    db: Session = Depends(get_db)
):
    """Create product review"""
    service = MarketplaceService(db)
    return service.create_review(
        "user_123",
        product_id,
        review.rating,
        review.title,
        review.comment
    )

# Category endpoints
@router.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    """Get all categories"""
    service = MarketplaceService(db)
    return service.get_categories()

@router.get("/categories/{slug}")
async def get_category(slug: str, db: Session = Depends(get_db)):
    """Get category by slug"""
    service = MarketplaceService(db)
    category = service.get_category_by_slug(slug)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

# Enhanced Features Endpoints

# AI Recommendations
@router.get("/recommendations")
async def get_ai_recommendations(
    product_id: Optional[int] = Query(None, description="Get recommendations for specific product"),
    limit: int = Query(8, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get AI-powered product recommendations"""
    service = MarketplaceService(db)
    return service.get_ai_recommendations("user_123", product_id, limit)

@router.get("/products/{product_id}/recommendations")
async def get_product_recommendations(
    product_id: int,
    limit: int = Query(8, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get recommendations for a specific product"""
    service = MarketplaceService(db)
    return service.get_ai_recommendations("user_123", product_id, limit)

# Price Alerts
@router.get("/price-alerts")
async def get_price_alerts(db: Session = Depends(get_db)):
    """Get user's price alerts"""
    service = MarketplaceService(db)
    return service.get_user_price_alerts("user_123")

@router.post("/price-alerts")
async def create_price_alert(
    product_id: int,
    target_price: float = Query(..., gt=0, description="Target price for alert"),
    db: Session = Depends(get_db)
):
    """Create price alert"""
    service = MarketplaceService(db)
    try:
        return service.create_price_alert("user_123", product_id, target_price)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/price-alerts/{alert_id}")
async def delete_price_alert(alert_id: int, db: Session = Depends(get_db)):
    """Delete price alert"""
    service = MarketplaceService(db)
    success = service.delete_price_alert("user_123", alert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Price alert not found")
    return {"message": "Price alert deleted"}

# Product Comparisons
@router.get("/comparisons")
async def get_comparisons(db: Session = Depends(get_db)):
    """Get user's product comparisons"""
    service = MarketplaceService(db)
    return service.get_user_comparisons("user_123")

@router.post("/comparisons")
async def create_comparison(
    name: str = Query(..., description="Comparison name"),
    product_ids: List[int] = Query(..., description="Product IDs to compare"),
    db: Session = Depends(get_db)
):
    """Create product comparison"""
    service = MarketplaceService(db)
    if len(product_ids) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 products to compare")
    if len(product_ids) > 4:
        raise HTTPException(status_code=400, detail="Can compare maximum 4 products")
    
    return service.create_product_comparison("user_123", name, product_ids)

@router.get("/comparisons/{comparison_id}")
async def get_comparison(comparison_id: int, db: Session = Depends(get_db)):
    """Get comparison products"""
    service = MarketplaceService(db)
    products = service.get_comparison_products(comparison_id)
    if not products:
        raise HTTPException(status_code=404, detail="Comparison not found")
    return products

@router.delete("/comparisons/{comparison_id}")
async def delete_comparison(comparison_id: int, db: Session = Depends(get_db)):
    """Delete product comparison"""
    service = MarketplaceService(db)
    success = service.delete_comparison("user_123", comparison_id)
    if not success:
        raise HTTPException(status_code=404, detail="Comparison not found")
    return {"message": "Comparison deleted"}

# Recently Viewed
@router.get("/recently-viewed")
async def get_recently_viewed(
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get recently viewed products"""
    service = MarketplaceService(db)
    return service.get_recently_viewed("user_123", limit)

# Q&A System
@router.get("/products/{product_id}/questions")
async def get_product_questions(
    product_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get product questions"""
    service = MarketplaceService(db)
    return service.get_product_questions(product_id, page, limit)

@router.post("/products/{product_id}/questions")
async def create_product_question(
    product_id: int,
    question: str = Query(..., description="Question text"),
    db: Session = Depends(get_db)
):
    """Create product question"""
    service = MarketplaceService(db)
    return service.create_product_question("user_123", product_id, question)

@router.post("/questions/{question_id}/answer")
async def answer_question(
    question_id: int,
    answer: str = Query(..., description="Answer text"),
    db: Session = Depends(get_db)
):
    """Answer a product question"""
    service = MarketplaceService(db)
    return service.answer_product_question(question_id, answer, "admin")

@router.post("/questions/{question_id}/vote")
async def vote_question_helpful(question_id: int, db: Session = Depends(get_db)):
    """Vote question as helpful"""
    service = MarketplaceService(db)
    success = service.vote_question_helpful(question_id)
    if not success:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Vote recorded"}

@router.post("/answers/{answer_id}/vote")
async def vote_answer_helpful(answer_id: int, db: Session = Depends(get_db)):
    """Vote answer as helpful"""
    service = MarketplaceService(db)
    success = service.vote_answer_helpful(answer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Answer not found")
    return {"message": "Vote recorded"}

# Additional Request Models
class BulkAddToCartRequest(BaseModel):
    items: List[Dict[str, Any]]  # List of {product_id, quantity}

class CouponRequest(BaseModel):
    coupon_code: str

class WishlistListCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False

class WishlistListUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

class ShareRequest(BaseModel):
    recipients: List[str]  # Email addresses
    message: Optional[str] = None

class CancelOrderRequest(BaseModel):
    reason: str
    refund_to_original: bool = True

class ReturnOrderRequest(BaseModel):
    items: List[Dict[str, Any]]  # List of {item_id, quantity, reason}
    return_type: str  # 'return', 'refund', 'exchange'

class SaveSearchRequest(BaseModel):
    name: str
    description: Optional[str] = None
    query: str
    filters: Dict[str, Any]

class ShippingEstimateRequest(BaseModel):
    address: Dict[str, Any]
    items: List[Dict[str, Any]]  # List of {product_id, quantity}

class ValidateCouponRequest(BaseModel):
    coupon_code: str
    cart_total: float

# Product Quick View
@router.post("/products/{product_id}/quick-view")
async def product_quick_view(product_id: int, db: Session = Depends(get_db)):
    """Get product quick view data"""
    service = MarketplaceService(db)
    product = service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Return essential product data for quick view
    return {
        "id": product.id,
        "name": product.name,
        "price": product.price,
        "original_price": product.original_price,
        "images": product.images[:3] if product.images else [],  # First 3 images
        "rating": product.rating,
        "review_count": product.review_count,
        "in_stock": product.stock_quantity > 0,
        "fast_delivery": product.free_shipping,
        "is_prime": product.prime_eligible
    }

# Cart Bulk Operations
@router.post("/cart/bulk-add")
async def bulk_add_to_cart(request: BulkAddToCartRequest, db: Session = Depends(get_db)):
    """Bulk add items to cart"""
    service = MarketplaceService(db)
    user_id = "user_123"
    
    added_items = []
    failed_items = []
    
    for item in request.items:
        try:
            product_id = item.get("product_id")
            quantity = item.get("quantity", 1)
            cart_item = service.add_to_cart(user_id, product_id, quantity)
            added_items.append(cart_item)
        except Exception as e:
            failed_items.append({"product_id": item.get("product_id"), "error": str(e)})
    
    return {
        "added": len(added_items),
        "failed": len(failed_items),
        "added_items": added_items,
        "failed_items": failed_items
    }

# Coupon Management
@router.post("/cart/apply-coupon")
async def apply_coupon(request: CouponRequest, db: Session = Depends(get_db)):
    """Apply coupon to cart"""
    service = MarketplaceService(db)
    user_id = "user_123"
    
    # Mock coupon validation
    valid_coupons = {
        "SAVE10": {"discount": 0.10, "type": "percentage", "min_purchase": 50},
        "SAVE20": {"discount": 0.20, "type": "percentage", "min_purchase": 100},
        "FREESHIP": {"discount": 0, "type": "shipping", "min_purchase": 0},
        "FLAT5": {"discount": 5, "type": "fixed", "min_purchase": 25}
    }
    
    coupon_code = request.coupon_code.upper()
    if coupon_code not in valid_coupons:
        raise HTTPException(status_code=400, detail="Invalid coupon code")
    
    coupon = valid_coupons[coupon_code]
    cart = service.get_cart(user_id)
    cart_total = sum(item.get("subtotal", 0) for item in cart.get("items", []))
    
    if cart_total < coupon["min_purchase"]:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum purchase of ${coupon['min_purchase']} required"
        )
    
    return {
        "coupon_code": coupon_code,
        "discount": coupon["discount"],
        "type": coupon["type"],
        "applied": True,
        "message": f"Coupon {coupon_code} applied successfully"
    }

@router.delete("/cart/coupon")
async def remove_coupon(db: Session = Depends(get_db)):
    """Remove applied coupon"""
    return {
        "message": "Coupon removed successfully",
        "coupon_code": None
    }

# Save for Later
@router.post("/cart/save-for-later")
async def save_for_later(
    product_id: int = Query(...),
    quantity: int = Query(1, ge=1),
    db: Session = Depends(get_db)
):
    """Save cart item for later"""
    service = MarketplaceService(db)
    user_id = "user_123"
    
    # Remove from cart and add to saved items
    service.remove_from_cart(user_id, product_id)
    saved_item = service.add_to_wishlist(user_id, product_id)  # Using wishlist as saved items
    
    return {
        "message": "Item saved for later",
        "saved_item": saved_item
    }

@router.post("/cart/move-to-cart")
async def move_to_cart(
    product_id: int = Query(...),
    quantity: int = Query(1, ge=1),
    db: Session = Depends(get_db)
):
    """Move saved item back to cart"""
    service = MarketplaceService(db)
    user_id = "user_123"
    
    # Remove from saved and add to cart
    service.remove_from_wishlist(user_id, product_id)
    cart_item = service.add_to_cart(user_id, product_id, quantity)
    
    return {
        "message": "Item moved to cart",
        "cart_item": cart_item
    }

# Wishlist Lists Management
@router.post("/wishlist/lists")
async def create_wishlist_list(request: WishlistListCreate, db: Session = Depends(get_db)):
    """Create a new wishlist list"""
    service = MarketplaceService(db)
    user_id = "user_123"
    
    # In real app, this would create a new wishlist list
    list_id = str(uuid.uuid4())
    
    return {
        "id": list_id,
        "name": request.name,
        "description": request.description,
        "is_public": request.is_public,
        "user_id": user_id,
        "item_count": 0,
        "created_at": datetime.utcnow().isoformat()
    }

@router.put("/wishlist/lists/{list_id}")
async def update_wishlist_list(
    list_id: str,
    request: WishlistListUpdate,
    db: Session = Depends(get_db)
):
    """Update wishlist list"""
    user_id = "user_123"
    
    # In real app, this would update the list
    return {
        "id": list_id,
        "name": request.name,
        "description": request.description,
        "is_public": request.is_public,
        "updated_at": datetime.utcnow().isoformat()
    }

@router.delete("/wishlist/lists/{list_id}")
async def delete_wishlist_list(list_id: str, db: Session = Depends(get_db)):
    """Delete wishlist list"""
    user_id = "user_123"
    
    # In real app, this would delete the list and its items
    return {"message": "Wishlist list deleted successfully"}

@router.post("/wishlist/share")
async def share_wishlist(
    list_id: str = Query(...),
    request: ShareRequest = Body(...),
    db: Session = Depends(get_db)
):
    """Share wishlist"""
    user_id = "user_123"
    
    # Generate share link
    share_id = str(uuid.uuid4())
    share_link = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/shared/wishlist/{share_id}"
    
    return {
        "share_id": share_id,
        "share_link": share_link,
        "recipients": request.recipients,
        "message": request.message,
        "expires_at": (datetime.utcnow() + timedelta(days=30)).isoformat()
    }

# Order Management
@router.post("/orders/{order_id}/cancel")
async def cancel_order(
    order_id: int,
    request: CancelOrderRequest,
    db: Session = Depends(get_db)
):
    """Cancel an order"""
    service = MarketplaceService(db)
    user_id = "user_123"
    
    order = service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if order can be cancelled
    if order.status in ["shipped", "delivered", "cancelled"]:
        raise HTTPException(
            status_code=400,
            detail=f"Order cannot be cancelled. Current status: {order.status}"
        )
    
    # In real app, update order status and process refund
    return {
        "order_id": order_id,
        "status": "cancelled",
        "cancelled_at": datetime.utcnow().isoformat(),
        "reason": request.reason,
        "refund_processed": request.refund_to_original,
        "message": "Order cancelled successfully"
    }

@router.post("/orders/{order_id}/return")
async def return_order(
    order_id: int,
    request: ReturnOrderRequest,
    db: Session = Depends(get_db)
):
    """Initiate order return/refund"""
    service = MarketplaceService(db)
    user_id = "user_123"
    
    order = service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # In real app, create return request
    return_id = str(uuid.uuid4())
    
    return {
        "return_id": return_id,
        "order_id": order_id,
        "type": request.return_type,
        "items": request.items,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
        "estimated_refund": sum(item.get("quantity", 0) * item.get("price", 0) for item in request.items)
    }

@router.get("/orders/{order_id}/tracking")
async def get_order_tracking(order_id: int, db: Session = Depends(get_db)):
    """Get order tracking information"""
    service = MarketplaceService(db)
    user_id = "user_123"
    
    order = service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Mock tracking data
    tracking_events = [
        {
            "status": "order_placed",
            "timestamp": order.created_at.isoformat() if order.created_at else datetime.utcnow().isoformat(),
            "location": "Warehouse",
            "description": "Order placed"
        },
        {
            "status": "processing",
            "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
            "location": "Warehouse",
            "description": "Order is being processed"
        },
        {
            "status": "shipped",
            "timestamp": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
            "location": "Distribution Center",
            "description": "Order has been shipped",
            "tracking_number": f"TRACK{order_id:06d}"
        }
    ]
    
    return {
        "order_id": order_id,
        "tracking_number": f"TRACK{order_id:06d}",
        "carrier": "Standard Shipping",
        "estimated_delivery": (datetime.utcnow() + timedelta(days=5)).isoformat(),
        "events": tracking_events,
        "current_status": order.status if hasattr(order, 'status') else "processing"
    }

@router.get("/orders/{order_id}/invoice")
async def get_order_invoice(order_id: int, db: Session = Depends(get_db)):
    """Get order invoice"""
    service = MarketplaceService(db)
    user_id = "user_123"
    
    order = service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Generate invoice data
    invoice_data = {
        "invoice_number": f"INV-{order_id:06d}",
        "order_id": order_id,
        "order_date": order.created_at.isoformat() if order.created_at else datetime.utcnow().isoformat(),
        "items": order.items if hasattr(order, 'items') else [],
        "subtotal": order.subtotal if hasattr(order, 'subtotal') else 0,
        "tax": order.tax if hasattr(order, 'tax') else 0,
        "shipping": order.shipping if hasattr(order, 'shipping') else 0,
        "total": order.total if hasattr(order, 'total') else 0,
        "billing_address": order.billing_address if hasattr(order, 'billing_address') else {},
        "shipping_address": order.shipping_address if hasattr(order, 'shipping_address') else {}
    }
    
    return invoice_data

@router.post("/orders/{order_id}/reorder")
async def reorder(order_id: int, db: Session = Depends(get_db)):
    """Reorder items from a previous order"""
    service = MarketplaceService(db)
    user_id = "user_123"
    
    order = service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Add all items from order to cart
    added_items = []
    if hasattr(order, 'items') and order.items:
        for item in order.items:
            product_id = item.product_id if hasattr(item, 'product_id') else item.get("product_id")
            quantity = item.quantity if hasattr(item, 'quantity') else item.get("quantity", 1)
            try:
                cart_item = service.add_to_cart(user_id, product_id, quantity)
                added_items.append(cart_item)
            except Exception as e:
                logger.error(f"Error adding item to cart: {e}")
    
    return {
        "message": "Items added to cart",
        "items_added": len(added_items),
        "added_items": added_items
    }

# Review Management
@router.post("/reviews/{review_id}/helpful")
async def mark_review_helpful(review_id: int, db: Session = Depends(get_db)):
    """Mark review as helpful"""
    service = MarketplaceService(db)
    user_id = "user_123"
    
    # In real app, this would increment helpful count
    return {
        "review_id": review_id,
        "helpful_count": 1,  # Mock
        "message": "Review marked as helpful"
    }

@router.post("/reviews/{review_id}/report")
async def report_review(
    review_id: int,
    reason: str = Query(...),
    description: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Report inappropriate review"""
    service = MarketplaceService(db)
    user_id = "user_123"
    
    # In real app, this would create a report
    report_id = str(uuid.uuid4())
    
    return {
        "report_id": report_id,
        "review_id": review_id,
        "reason": reason,
        "description": description,
        "status": "submitted",
        "submitted_at": datetime.utcnow().isoformat(),
        "message": "Review reported successfully"
    }

# Question Management
@router.post("/questions/{question_id}/answer")
async def answer_question(
    question_id: int,
    answer: str = Query(..., description="Answer text"),
    db: Session = Depends(get_db)
):
    """Answer a product question"""
    service = MarketplaceService(db)
    return service.answer_product_question(question_id, answer, "user_123")

@router.post("/questions/{question_id}/vote")
async def vote_question_helpful(question_id: int, db: Session = Depends(get_db)):
    """Vote question as helpful"""
    service = MarketplaceService(db)
    success = service.vote_question_helpful(question_id)
    if not success:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Vote recorded"}

# Price Alerts Enhancement
@router.put("/price-alerts/{alert_id}")
async def update_price_alert(
    alert_id: int,
    target_price: float = Query(..., gt=0),
    db: Session = Depends(get_db)
):
    """Update price alert"""
    service = MarketplaceService(db)
    user_id = "user_123"
    
    # In real app, this would update the alert
    return {
        "alert_id": alert_id,
        "target_price": target_price,
        "updated_at": datetime.utcnow().isoformat(),
        "message": "Price alert updated successfully"
    }

# Product Comparisons Enhancement
@router.post("/comparisons/share")
async def share_comparison(
    comparison_id: int = Query(...),
    request: ShareRequest = Body(...),
    db: Session = Depends(get_db)
):
    """Share product comparison"""
    user_id = "user_123"
    
    # Generate share link
    share_id = str(uuid.uuid4())
    share_link = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/shared/comparison/{share_id}"
    
    return {
        "share_id": share_id,
        "comparison_id": comparison_id,
        "share_link": share_link,
        "recipients": request.recipients,
        "message": request.message,
        "expires_at": (datetime.utcnow() + timedelta(days=7)).isoformat()
    }

# Product Sharing and Reporting
@router.post("/products/{product_id}/share")
async def share_product(
    product_id: int,
    request: ShareRequest = Body(...),
    db: Session = Depends(get_db)
):
    """Share product"""
    service = MarketplaceService(db)
    product = service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    share_link = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/products/{product_id}"
    
    return {
        "product_id": product_id,
        "product_name": product.name,
        "share_link": share_link,
        "recipients": request.recipients,
        "message": request.message,
        "shared_at": datetime.utcnow().isoformat()
    }

@router.post("/products/{product_id}/report")
async def report_product(
    product_id: int,
    reason: str = Query(...),
    description: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Report inappropriate product"""
    service = MarketplaceService(db)
    product = service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    report_id = str(uuid.uuid4())
    
    return {
        "report_id": report_id,
        "product_id": product_id,
        "reason": reason,
        "description": description,
        "status": "submitted",
        "submitted_at": datetime.utcnow().isoformat(),
        "message": "Product reported successfully"
    }

# Recently Viewed Enhancement
@router.delete("/recently-viewed")
async def clear_recently_viewed(db: Session = Depends(get_db)):
    """Clear recently viewed history"""
    service = MarketplaceService(db)
    user_id = "user_123"
    
    # In real app, this would delete all recently viewed items
    return {"message": "Recently viewed history cleared"}

# Search Management
@router.post("/search/save")
async def save_search(request: SaveSearchRequest, db: Session = Depends(get_db)):
    """Save search query"""
    user_id = "user_123"
    
    search_id = str(uuid.uuid4())
    
    return {
        "search_id": search_id,
        "name": request.name,
        "description": request.description,
        "query": request.query,
        "filters": request.filters,
        "saved_at": datetime.utcnow().isoformat(),
        "message": "Search saved successfully"
    }

@router.get("/search/saved")
async def get_saved_searches(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get saved searches"""
    user_id = "user_123"
    
    # Mock saved searches
    return {
        "saved_searches": [
            {
                "id": "1",
                "name": "Laptop Deals",
                "query": "laptop",
                "filters": {"category": "electronics", "min_price": 500},
                "saved_at": (datetime.utcnow() - timedelta(days=5)).isoformat()
            }
        ],
        "total": 1
    }

# Checkout Operations
@router.post("/checkout/estimate-shipping")
async def estimate_shipping(request: ShippingEstimateRequest, db: Session = Depends(get_db)):
    """Estimate shipping costs"""
    service = MarketplaceService(db)
    
    # Mock shipping estimates
    shipping_options = [
        {
            "method": "standard",
            "name": "Standard Shipping",
            "cost": 5.99,
            "estimated_days": "5-7 business days"
        },
        {
            "method": "express",
            "name": "Express Shipping",
            "cost": 12.99,
            "estimated_days": "2-3 business days"
        },
        {
            "method": "overnight",
            "name": "Overnight Shipping",
            "cost": 24.99,
            "estimated_days": "1 business day"
        }
    ]
    
    # Calculate total weight/value for more accurate estimates
    total_value = sum(item.get("price", 0) * item.get("quantity", 1) for item in request.items)
    
    # Free shipping over $35
    if total_value >= 35:
        shipping_options.insert(0, {
            "method": "free",
            "name": "Free Shipping",
            "cost": 0,
            "estimated_days": "5-7 business days"
        })
    
    return {
        "address": request.address,
        "shipping_options": shipping_options,
        "estimated_at": datetime.utcnow().isoformat()
    }

@router.post("/checkout/validate-coupon")
async def validate_coupon(request: ValidateCouponRequest, db: Session = Depends(get_db)):
    """Validate coupon code"""
    valid_coupons = {
        "SAVE10": {"discount": 0.10, "type": "percentage", "min_purchase": 50, "max_discount": 50},
        "SAVE20": {"discount": 0.20, "type": "percentage", "min_purchase": 100, "max_discount": 100},
        "FREESHIP": {"discount": 0, "type": "shipping", "min_purchase": 0},
        "FLAT5": {"discount": 5, "type": "fixed", "min_purchase": 25}
    }
    
    coupon_code = request.coupon_code.upper()
    
    if coupon_code not in valid_coupons:
        raise HTTPException(status_code=400, detail="Invalid coupon code")
    
    coupon = valid_coupons[coupon_code]
    
    if request.cart_total < coupon["min_purchase"]:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum purchase of ${coupon['min_purchase']} required"
        )
    
    # Calculate discount
    if coupon["type"] == "percentage":
        discount = min(request.cart_total * coupon["discount"], coupon.get("max_discount", float('inf')))
    elif coupon["type"] == "fixed":
        discount = coupon["discount"]
    else:
        discount = 0
    
    return {
        "valid": True,
        "coupon_code": coupon_code,
        "discount": round(discount, 2),
        "type": coupon["type"],
        "discounted_total": round(request.cart_total - discount, 2)
    }

# AI Features
@router.post("/ai/recommendations")
async def get_ai_recommendations(
    product_id: Optional[int] = Query(None),
    limit: int = Query(8, ge=1, le=20),
    preferences: Optional[Dict[str, Any]] = Body(None),
    db: Session = Depends(get_db)
):
    """Enhanced AI product recommendations"""
    service = MarketplaceService(db)
    user_id = "user_123"
    
    # Get recommendations
    recommendations = service.get_ai_recommendations(user_id, product_id, limit)
    
    # Add AI reasoning if preferences provided
    if preferences:
        # In real app, use AI service to generate personalized recommendations
        pass
    
    return {
        "recommendations": recommendations,
        "personalized": preferences is not None,
        "generated_at": datetime.utcnow().isoformat()
    }

@router.post("/ai/search")
async def ai_search_assistant(
    query: str = Query(...),
    context: Optional[Dict[str, Any]] = Body(None),
    db: Session = Depends(get_db)
):
    """AI search assistant for refining searches"""
    from app.services.ai_service import ai_service
    
    # Use AI to refine search query
    ai_prompt = f"""
    Refine this product search query: "{query}"
    Context: {json.dumps(context or {}, indent=2)}
    
    Provide:
    1. Refined search query
    2. Suggested filters
    3. Search tips
    """
    
    try:
        ai_response = await ai_service.generate_response(ai_prompt, context)
        
        # Parse AI response (in real app, use structured output)
        return {
            "original_query": query,
            "refined_query": query,  # Would be extracted from AI response
            "suggested_filters": {
                "category": None,
                "price_range": None,
                "rating": None
            },
            "search_tips": [
                "Try using more specific keywords",
                "Filter by category to narrow results"
            ],
            "ai_suggestions": ai_response
        }
    except Exception as e:
        logger.error(f"Error in AI search: {e}")
        return {
            "original_query": query,
            "refined_query": query,
            "suggested_filters": {},
            "search_tips": []
        }

@router.post("/ai/compare")
async def ai_product_comparison(
    product_ids: List[int] = Query(...),
    db: Session = Depends(get_db)
):
    """AI-powered product comparison"""
    from app.services.ai_service import ai_service
    service = MarketplaceService(db)
    
    if len(product_ids) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 products to compare")
    if len(product_ids) > 4:
        raise HTTPException(status_code=400, detail="Can compare maximum 4 products")
    
    # Get product details
    products = []
    for product_id in product_ids:
        product = service.get_product_by_id(product_id)
        if product:
            products.append(product)
    
    if len(products) < 2:
        raise HTTPException(status_code=404, detail="One or more products not found")
    
    # Use AI to generate comparison
    product_summaries = [
        f"{p.name} - ${p.price} - Rating: {p.rating}" for p in products
    ]
    
    ai_prompt = f"""
    Compare these products:
    {chr(10).join(product_summaries)}
    
    Provide:
    1. Key differences
    2. Best value recommendation
    3. Feature comparison
    4. Use case recommendations
    """
    
    try:
        ai_analysis = await ai_service.generate_response(ai_prompt, {"products": products})
        
        return {
            "products": [{"id": p.id, "name": p.name, "price": p.price} for p in products],
            "ai_analysis": ai_analysis,
            "key_differences": [],  # Would be extracted from AI response
            "best_value": products[0].id,  # Would be determined by AI
            "recommendations": [],
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in AI comparison: {e}")
        return {
            "products": [{"id": p.id, "name": p.name, "price": p.price} for p in products],
            "ai_analysis": "Comparison analysis unavailable",
            "key_differences": [],
            "best_value": products[0].id,
            "recommendations": []
        }

@router.post("/ai/price-prediction")
async def ai_price_prediction(
    product_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """AI price prediction for product"""
    from app.services.ai_service import ai_service
    service = MarketplaceService(db)
    
    product = service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Use AI to predict price trends
    ai_prompt = f"""
    Predict price trends for: {product.name}
    Current Price: ${product.price}
    Category: {product.category}
    
    Provide:
    1. Price trend prediction (increasing/decreasing/stable)
    2. Best time to buy
    3. Expected price range
    4. Confidence level
    """
    
    try:
        ai_prediction = await ai_service.generate_response(ai_prompt, {"product": product})
        
        # Mock prediction data
        return {
            "product_id": product_id,
            "product_name": product.name,
            "current_price": product.price,
            "predicted_trend": "decreasing",
            "predicted_price_range": {
                "min": product.price * 0.85,
                "max": product.price * 0.95
            },
            "best_time_to_buy": "within 2 weeks",
            "confidence": 0.75,
            "ai_analysis": ai_prediction,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in AI price prediction: {e}")
        return {
            "product_id": product_id,
            "current_price": product.price,
            "predicted_trend": "stable",
            "confidence": 0.5
        }

@router.post("/ai/review-analysis")
async def ai_review_analysis(
    product_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """AI analysis of product reviews"""
    from app.services.ai_service import ai_service
    service = MarketplaceService(db)
    
    product = service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    reviews = service.get_product_reviews(product_id, page=1, limit=50)
    
    # Use AI to analyze reviews
    review_summaries = [
        f"Rating: {r.rating}/5 - {r.title}: {r.comment[:100]}" 
        for r in reviews.get("reviews", [])[:10]
    ]
    
    ai_prompt = f"""
    Analyze these product reviews for: {product.name}
    
    Reviews:
    {chr(10).join(review_summaries)}
    
    Provide:
    1. Overall sentiment analysis
    2. Common themes (positive and negative)
    3. Key features mentioned
    4. Improvement suggestions
    """
    
    try:
        ai_analysis = await ai_service.generate_response(ai_prompt, {"reviews": reviews})
        
        return {
            "product_id": product_id,
            "total_reviews": reviews.get("total", 0),
            "average_rating": product.rating,
            "sentiment": "positive",  # Would be extracted from AI
            "common_themes": {
                "positive": ["Good quality", "Fast shipping"],
                "negative": ["Price could be lower"]
            },
            "key_features": ["Durability", "Design"],
            "ai_analysis": ai_analysis,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in AI review analysis: {e}")
        return {
            "product_id": product_id,
            "total_reviews": reviews.get("total", 0),
            "average_rating": product.rating,
            "sentiment": "neutral"
        }

@router.get("/ai/chat")
async def ai_shopping_assistant_chat(
    message: str = Query(...),
    conversation_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """AI shopping assistant chat"""
    from app.services.ai_service import ai_service
    
    # Use AI for shopping assistance
    ai_prompt = f"""
    You are a helpful shopping assistant. User message: "{message}"
    
    Provide helpful shopping advice, product recommendations, or answer questions.
    """
    
    try:
        ai_response = await ai_service.generate_response(ai_prompt, {
            "conversation_id": conversation_id,
            "context": "shopping"
        })
        
        return {
            "message": message,
            "response": ai_response,
            "conversation_id": conversation_id or str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in AI chat: {e}")
        return {
            "message": message,
            "response": "I'm having trouble processing your request. Please try again.",
            "conversation_id": conversation_id or str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat()
        }
