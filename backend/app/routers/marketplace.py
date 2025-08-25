from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime, date, timedelta
import structlog
import uuid
import json

from app.models.marketplace import (
    Product, ProductCreate, ProductUpdate, Review, ReviewCreate,
    CartItem, CartItemCreate, CartItemUpdate, SavedItem,
    Order, OrderCreate, OrderUpdate, Category, CategoryCreate,
    SearchRequest, SearchFilters, ProductSearchResponse,
    CartResponse, OrderResponse,
    ProductCategory, ProductSubcategory, OrderStatus, PaymentStatus, PaymentMethod
)

logger = structlog.get_logger()
router = APIRouter()

def get_mock_user():
    return {"id": "user_123", "username": "testuser"}

# Mock data storage
mock_products: List[Product] = [
    Product(
        id="1",
        name="Apple iPhone 15 Pro Max - 256GB - Natural Titanium",
        description="The most advanced iPhone ever with A17 Pro chip, 48MP camera, and titanium design.",
        price=1199.99,
        original_price=1299.99,
        category=ProductCategory.electronics,
        subcategory=ProductSubcategory.smartphones,
        brand="Apple",
        images=[
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop"
        ],
        features=[
            "A17 Pro chip with 6-core GPU",
            "48MP Main camera with 2x Telephoto",
            "Titanium design with Ceramic Shield",
            "USB-C connector for faster charging"
        ],
        specifications={
            "Display": "6.7-inch Super Retina XDR display",
            "Chip": "A17 Pro chip with 6-core GPU",
            "Storage": "256GB",
            "Camera": "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
            "Battery": "Up to 29 hours video playback"
        },
        rating=4.8,
        review_count=1247,
        stock_quantity=50,
        in_stock=True,
        fast_delivery=True,
        is_prime=True,
        is_deal=True,
        deal_ends_at=datetime.utcnow() + timedelta(days=2)
    ),
    Product(
        id="2",
        name="Samsung 65\" QLED 4K Smart TV - QN65Q80CAFXZA",
        description="Experience stunning 4K resolution with Quantum Dot technology and smart features.",
        price=1299.99,
        original_price=1799.99,
        category=ProductCategory.electronics,
        subcategory=ProductSubcategory.tvs,
        brand="Samsung",
        images=[
            "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=800&fit=crop"
        ],
        features=[
            "4K UHD Resolution",
            "Quantum Dot Technology",
            "Smart TV",
            "HDR"
        ],
        rating=4.6,
        review_count=892,
        stock_quantity=25,
        in_stock=True,
        fast_delivery=True,
        is_prime=True,
        is_deal=True,
        deal_ends_at=datetime.utcnow() + timedelta(days=1)
    ),
    Product(
        id="3",
        name="Nike Air Max 270 - Men's Running Shoes",
        description="Maximum comfort with Air Max 270 unit for all-day cushioning.",
        price=129.99,
        original_price=150.00,
        category=ProductCategory.fashion,
        subcategory=ProductSubcategory.shoes,
        brand="Nike",
        images=[
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop"
        ],
        features=[
            "Air Max 270 unit",
            "Breathable mesh",
            "Rubber outsole",
            "Lightweight"
        ],
        rating=4.5,
        review_count=2156,
        stock_quantity=100,
        in_stock=True,
        fast_delivery=True,
        is_prime=True
    ),
    Product(
        id="4",
        name="Instant Pot Duo 7-in-1 Electric Pressure Cooker",
        description="7-in-1 multi-functional pressure cooker for fast, healthy meals.",
        price=89.99,
        original_price=119.99,
        category=ProductCategory.home,
        subcategory=ProductSubcategory.kitchen,
        brand="Instant Pot",
        images=[
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop"
        ],
        features=[
            "7-in-1 functionality",
            "Pressure cooking",
            "Slow cooking",
            "Rice cooking"
        ],
        rating=4.7,
        review_count=3421,
        stock_quantity=75,
        in_stock=True,
        fast_delivery=True,
        is_prime=True,
        is_deal=True,
        deal_ends_at=datetime.utcnow() + timedelta(days=3)
    ),
    Product(
        id="5",
        name="Sony WH-1000XM4 Wireless Noise-Canceling Headphones",
        description="Industry-leading noise canceling with Dual Noise Sensor technology.",
        price=349.99,
        original_price=399.99,
        category=ProductCategory.electronics,
        subcategory=ProductSubcategory.audio,
        brand="Sony",
        images=[
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop"
        ],
        features=[
            "Industry-leading noise canceling",
            "30-hour battery",
            "Touch controls",
            "Quick Charge"
        ],
        rating=4.8,
        review_count=1892,
        stock_quantity=40,
        in_stock=True,
        fast_delivery=True,
        is_prime=True
    )
]

mock_cart_items: List[CartItem] = []
mock_saved_items: List[SavedItem] = []
mock_orders: List[Order] = []
mock_reviews: List[Review] = []

# Product endpoints
@router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[ProductCategory] = None,
    subcategory: Optional[ProductSubcategory] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock: Optional[bool] = None,
    is_prime: Optional[bool] = None,
    is_deal: Optional[bool] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get products with optional filtering"""
    filtered_products = mock_products.copy()
    
    if category:
        filtered_products = [p for p in filtered_products if p.category == category]
    if subcategory:
        filtered_products = [p for p in filtered_products if p.subcategory == subcategory]
    if brand:
        filtered_products = [p for p in filtered_products if p.brand.lower() == brand.lower()]
    if min_price is not None:
        filtered_products = [p for p in filtered_products if p.price >= min_price]
    if max_price is not None:
        filtered_products = [p for p in filtered_products if p.price <= max_price]
    if in_stock is not None:
        filtered_products = [p for p in filtered_products if p.in_stock == in_stock]
    if is_prime is not None:
        filtered_products = [p for p in filtered_products if p.is_prime == is_prime]
    if is_deal is not None:
        filtered_products = [p for p in filtered_products if p.is_deal == is_deal]
    
    return filtered_products[offset:offset + limit]

@router.get("/products/search", response_model=ProductSearchResponse)
async def search_products(
    q: Optional[str] = Query(None, description="Search query"),
    category: Optional[ProductCategory] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = Query("featured", regex="^(price|rating|newest|featured)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Search products with advanced filtering and sorting"""
    filtered_products = mock_products.copy()
    
    # Search by query
    if q:
        query_lower = q.lower()
        filtered_products = [
            p for p in filtered_products
            if query_lower in p.name.lower() or
               query_lower in p.description.lower() or
               query_lower in p.brand.lower()
        ]
    
    # Apply filters
    if category:
        filtered_products = [p for p in filtered_products if p.category == category]
    if min_price is not None:
        filtered_products = [p for p in filtered_products if p.price >= min_price]
    if max_price is not None:
        filtered_products = [p for p in filtered_products if p.price <= max_price]
    
    # Sort products
    if sort_by == "price":
        filtered_products.sort(key=lambda x: x.price, reverse=(sort_order == "desc"))
    elif sort_by == "rating":
        filtered_products.sort(key=lambda x: x.rating, reverse=(sort_order == "desc"))
    elif sort_by == "newest":
        filtered_products.sort(key=lambda x: x.created_at, reverse=(sort_order == "desc"))
    
    # Pagination
    total = len(filtered_products)
    total_pages = (total + limit - 1) // limit
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    return ProductSearchResponse(
        products=filtered_products[start_idx:end_idx],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1
    )

@router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a specific product by ID"""
    product = next((p for p in mock_products if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate):
    """Create a new product"""
    product = Product(**product_data.dict())
    mock_products.append(product)
    return product

@router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductUpdate):
    """Update a product"""
    product = next((p for p in mock_products if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    product.updated_at = datetime.utcnow()
    return product

@router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    """Delete a product"""
    global mock_products
    product = next((p for p in mock_products if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    mock_products = [p for p in mock_products if p.id != product_id]
    return {"message": "Product deleted successfully"}

# Category endpoints
@router.get("/categories", response_model=List[Category])
async def get_categories():
    """Get all product categories"""
    categories = [
        Category(
            id="1",
            name="Electronics",
            slug="electronics",
            description="Latest gadgets and electronic devices",
            icon="trending-up",
            color="#3B82F6",
            subcategories=["smartphones", "laptops", "tablets", "accessories", "gaming", "audio", "tvs"]
        ),
        Category(
            id="2",
            name="Fashion",
            slug="fashion",
            description="Trendy clothing and accessories",
            icon="user",
            color="#EC4899",
            subcategories=["men", "women", "kids", "shoes", "bags", "jewelry"]
        ),
        Category(
            id="3",
            name="Home & Garden",
            slug="home",
            description="Everything for your home and garden",
            icon="package",
            color="#10B981",
            subcategories=["furniture", "kitchen", "decor", "garden", "tools", "lighting", "appliances"]
        ),
        Category(
            id="4",
            name="Sports & Outdoors",
            slug="sports",
            description="Sports equipment and outdoor gear",
            icon="trending-up",
            color="#F59E0B",
            subcategories=["fitness", "camping", "cycling", "swimming", "team_sports", "yoga"]
        ),
        Category(
            id="5",
            name="Books & Media",
            slug="books",
            description="Books, magazines, and digital media",
            icon="package",
            color="#8B5CF6",
            subcategories=["fiction", "non_fiction", "academic", "children", "audiobooks", "magazines"]
        ),
        Category(
            id="6",
            name="Beauty & Health",
            slug="beauty",
            description="Beauty products and health supplements",
            icon="heart",
            color="#EF4444",
            subcategories=["skincare", "makeup", "haircare", "fragrances", "vitamins", "personal_care"]
        )
    ]
    return categories

# Cart endpoints
@router.get("/cart", response_model=CartResponse)
async def get_cart():
    """Get user's shopping cart"""
    user = get_mock_user()
    user_cart_items = [item for item in mock_cart_items if item.user_id == user["id"]]
    
    # Calculate totals
    subtotal = 0
    for item in user_cart_items:
        product = next((p for p in mock_products if p.id == item.product_id), None)
        if product:
            subtotal += product.price * item.quantity
    
    tax = subtotal * 0.08  # 8% tax
    shipping = 0 if subtotal > 35 else 5.99  # Free shipping over $35
    total = subtotal + tax + shipping
    
    return CartResponse(
        items=user_cart_items,
        total_items=len(user_cart_items),
        subtotal=subtotal,
        tax=tax,
        shipping=shipping,
        total=total
    )

@router.post("/cart/items", response_model=CartItem)
async def add_to_cart(cart_item_data: CartItemCreate):
    """Add item to cart"""
    user = get_mock_user()
    
    # Check if product exists
    product = next((p for p in mock_products if p.id == cart_item_data.product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    existing_item = next(
        (item for item in mock_cart_items 
         if item.user_id == user["id"] and item.product_id == cart_item_data.product_id),
        None
    )
    
    if existing_item:
        existing_item.quantity += cart_item_data.quantity
        return existing_item
    else:
        cart_item = CartItem(
            user_id=user["id"],
            product_id=cart_item_data.product_id,
            quantity=cart_item_data.quantity
        )
        mock_cart_items.append(cart_item)
        return cart_item

@router.put("/cart/items/{item_id}", response_model=CartItem)
async def update_cart_item(item_id: str, cart_item_data: CartItemUpdate):
    """Update cart item quantity"""
    user = get_mock_user()
    cart_item = next(
        (item for item in mock_cart_items 
         if item.id == item_id and item.user_id == user["id"]),
        None
    )
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    cart_item.quantity = cart_item_data.quantity
    return cart_item

@router.delete("/cart/items/{item_id}")
async def remove_from_cart(item_id: str):
    """Remove item from cart"""
    user = get_mock_user()
    global mock_cart_items
    
    cart_item = next(
        (item for item in mock_cart_items 
         if item.id == item_id and item.user_id == user["id"]),
        None
    )
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    mock_cart_items = [item for item in mock_cart_items if item.id != item_id]
    return {"message": "Item removed from cart"}

# Saved items endpoints
@router.get("/saved", response_model=List[SavedItem])
async def get_saved_items():
    """Get user's saved items"""
    user = get_mock_user()
    return [item for item in mock_saved_items if item.user_id == user["id"]]

@router.post("/saved", response_model=SavedItem)
async def save_item(product_id: str):
    """Save item for later"""
    user = get_mock_user()
    
    # Check if product exists
    product = next((p for p in mock_products if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if already saved
    existing_item = next(
        (item for item in mock_saved_items 
         if item.user_id == user["id"] and item.product_id == product_id),
        None
    )
    
    if existing_item:
        raise HTTPException(status_code=400, detail="Item already saved")
    
    saved_item = SavedItem(
        user_id=user["id"],
        product_id=product_id
    )
    mock_saved_items.append(saved_item)
    return saved_item

@router.delete("/saved/{item_id}")
async def remove_saved_item(item_id: str):
    """Remove saved item"""
    user = get_mock_user()
    global mock_saved_items
    
    saved_item = next(
        (item for item in mock_saved_items 
         if item.id == item_id and item.user_id == user["id"]),
        None
    )
    
    if not saved_item:
        raise HTTPException(status_code=404, detail="Saved item not found")
    
    mock_saved_items = [item for item in mock_saved_items if item.id != item_id]
    return {"message": "Saved item removed"}

# Review endpoints
@router.get("/products/{product_id}/reviews", response_model=List[Review])
async def get_product_reviews(product_id: str):
    """Get reviews for a product"""
    return [review for review in mock_reviews if review.product_id == product_id]

@router.post("/products/{product_id}/reviews", response_model=Review)
async def create_review(product_id: str, review_data: ReviewCreate):
    """Create a review for a product"""
    user = get_mock_user()
    
    # Check if product exists
    product = next((p for p in mock_products if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    review = Review(
        product_id=product_id,
        user_id=user["id"],
        user_name=user["username"],
        rating=review_data.rating,
        title=review_data.title,
        content=review_data.content,
        images=review_data.images
    )
    
    mock_reviews.append(review)
    
    # Update product rating
    product_reviews = [r for r in mock_reviews if r.product_id == product_id]
    if product_reviews:
        product.rating = sum(r.rating for r in product_reviews) / len(product_reviews)
        product.review_count = len(product_reviews)
    
    return review

# Order endpoints
@router.get("/orders", response_model=List[Order])
async def get_orders():
    """Get user's orders"""
    user = get_mock_user()
    return [order for order in mock_orders if order.user_id == user["id"]]

@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str):
    """Get specific order details"""
    user = get_mock_user()
    order = next(
        (order for order in mock_orders 
         if order.id == order_id and order.user_id == user["id"]),
        None
    )
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return OrderResponse(
        order=order,
        items=order.items,
        estimated_delivery=date.today() + timedelta(days=7)
    )

@router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    """Create a new order"""
    user = get_mock_user()
    
    # Calculate totals
    subtotal = sum(item.subtotal for item in order_data.items)
    tax = subtotal * 0.08
    shipping = 0 if subtotal > 35 else 5.99
    total = subtotal + tax + shipping
    
    order = Order(
        user_id=user["id"],
        items=order_data.items,
        subtotal=subtotal,
        tax=tax,
        shipping=shipping,
        total=total,
        payment_method=order_data.payment_method,
        shipping_address=order_data.shipping_address,
        billing_address=order_data.billing_address or order_data.shipping_address,
        notes=order_data.notes
    )
    
    mock_orders.append(order)
    
    # Clear cart after order creation
    global mock_cart_items
    mock_cart_items = [item for item in mock_cart_items if item.user_id != user["id"]]
    
    return order

@router.put("/orders/{order_id}", response_model=Order)
async def update_order(order_id: str, order_data: OrderUpdate):
    """Update order status"""
    user = get_mock_user()
    order = next(
        (order for order in mock_orders 
         if order.id == order_id and order.user_id == user["id"]),
        None
    )
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    update_data = order_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(order, field, value)
    
    order.updated_at = datetime.utcnow()
    return order

# Deals and featured products
@router.get("/deals", response_model=List[Product])
async def get_deals():
    """Get products with deals"""
    return [product for product in mock_products if product.is_deal]

@router.get("/featured", response_model=List[Product])
async def get_featured_products():
    """Get featured products"""
    return [product for product in mock_products if product.rating >= 4.5][:10]

@router.get("/prime", response_model=List[Product])
async def get_prime_products():
    """Get Prime eligible products"""
    return [product for product in mock_products if product.is_prime]
