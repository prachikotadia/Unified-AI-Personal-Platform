from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import structlog

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
