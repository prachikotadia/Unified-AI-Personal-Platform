from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum
import uuid

class ProductCategory(str, Enum):
    electronics = "electronics"
    fashion = "fashion"
    home = "home"
    sports = "sports"
    books = "books"
    beauty = "beauty"

class ProductSubcategory(str, Enum):
    # Electronics
    smartphones = "smartphones"
    laptops = "laptops"
    tablets = "tablets"
    accessories = "accessories"
    gaming = "gaming"
    audio = "audio"
    tvs = "tvs"
    
    # Fashion
    men = "men"
    women = "women"
    kids = "kids"
    shoes = "shoes"
    bags = "bags"
    jewelry = "jewelry"
    
    # Home
    furniture = "furniture"
    kitchen = "kitchen"
    decor = "decor"
    garden = "garden"
    tools = "tools"
    lighting = "lighting"
    appliances = "appliances"
    
    # Sports
    fitness = "fitness"
    camping = "camping"
    cycling = "cycling"
    swimming = "swimming"
    team_sports = "team_sports"
    yoga = "yoga"
    
    # Books
    fiction = "fiction"
    non_fiction = "non_fiction"
    academic = "academic"
    children = "children"
    audiobooks = "audiobooks"
    magazines = "magazines"
    
    # Beauty
    skincare = "skincare"
    makeup = "makeup"
    haircare = "haircare"
    fragrances = "fragrances"
    vitamins = "vitamins"
    personal_care = "personal_care"

class OrderStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"
    returned = "returned"

class PaymentStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"

class PaymentMethod(str, Enum):
    credit_card = "credit_card"
    paypal = "paypal"
    cash_on_delivery = "cash_on_delivery"
    bank_transfer = "bank_transfer"

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    price: float = Field(..., gt=0)
    original_price: Optional[float] = Field(None, gt=0)
    category: ProductCategory
    subcategory: ProductSubcategory
    brand: str = Field(..., min_length=1, max_length=100)
    images: List[str] = Field(default_factory=list)
    features: List[str] = Field(default_factory=list)
    specifications: Dict[str, str] = Field(default_factory=dict)
    rating: float = Field(default=0.0, ge=0.0, le=5.0)
    review_count: int = Field(default=0, ge=0)
    stock_quantity: int = Field(default=0, ge=0)
    in_stock: bool = Field(default=True)
    fast_delivery: bool = Field(default=False)
    is_prime: bool = Field(default=False)
    is_deal: bool = Field(default=False)
    deal_ends_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @validator('original_price')
    def validate_original_price(cls, v, values):
        if v is not None and 'price' in values and v <= values['price']:
            raise ValueError('Original price must be greater than current price')
        return v

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    price: float = Field(..., gt=0)
    original_price: Optional[float] = Field(None, gt=0)
    category: ProductCategory
    subcategory: ProductSubcategory
    brand: str = Field(..., min_length=1, max_length=100)
    images: List[str] = Field(default_factory=list)
    features: List[str] = Field(default_factory=list)
    specifications: Dict[str, str] = Field(default_factory=dict)
    stock_quantity: int = Field(default=0, ge=0)
    fast_delivery: bool = Field(default=False)
    is_prime: bool = Field(default=False)
    is_deal: bool = Field(default=False)
    deal_ends_at: Optional[datetime] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    price: Optional[float] = Field(None, gt=0)
    original_price: Optional[float] = Field(None, gt=0)
    category: Optional[ProductCategory] = None
    subcategory: Optional[ProductSubcategory] = None
    brand: Optional[str] = Field(None, min_length=1, max_length=100)
    images: Optional[List[str]] = None
    features: Optional[List[str]] = None
    specifications: Optional[Dict[str, str]] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    fast_delivery: Optional[bool] = None
    is_prime: Optional[bool] = None
    is_deal: Optional[bool] = None
    deal_ends_at: Optional[datetime] = None

class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: str
    user_name: str = Field(..., min_length=1, max_length=100)
    user_avatar: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=10, max_length=1000)
    images: List[str] = Field(default_factory=list)
    helpful_count: int = Field(default=0, ge=0)
    verified_purchase: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(..., ge=1, le=5)
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=10, max_length=1000)
    images: List[str] = Field(default_factory=list)

class CartItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_id: str
    quantity: int = Field(..., gt=0)
    added_at: datetime = Field(default_factory=datetime.utcnow)

class CartItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)

class SavedItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_id: str
    saved_at: datetime = Field(default_factory=datetime.utcnow)

class OrderItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    product_id: str
    product_name: str
    product_image: str
    price: float = Field(..., gt=0)
    quantity: int = Field(..., gt=0)
    subtotal: float = Field(..., gt=0)

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[OrderItem] = Field(default_factory=list)
    subtotal: float = Field(..., gt=0)
    tax: float = Field(..., ge=0)
    shipping: float = Field(..., ge=0)
    total: float = Field(..., gt=0)
    status: OrderStatus = Field(default=OrderStatus.pending)
    payment_status: PaymentStatus = Field(default=PaymentStatus.pending)
    payment_method: Optional[PaymentMethod] = None
    shipping_address: Dict[str, Any] = Field(default_factory=dict)
    billing_address: Dict[str, Any] = Field(default_factory=dict)
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[date] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    items: List[OrderItem] = Field(..., min_items=1)
    payment_method: PaymentMethod
    shipping_address: Dict[str, Any]
    billing_address: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[date] = None
    notes: Optional[str] = None

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    icon: str = Field(..., min_length=1, max_length=50)
    color: str = Field(..., min_length=1, max_length=7)  # Hex color
    subcategories: List[str] = Field(default_factory=list)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    icon: str = Field(..., min_length=1, max_length=50)
    color: str = Field(..., min_length=1, max_length=7)
    subcategories: List[str] = Field(default_factory=list)

class SearchFilters(BaseModel):
    category: Optional[ProductCategory] = None
    subcategory: Optional[ProductSubcategory] = None
    brand: Optional[str] = None
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = Field(None, ge=0)
    rating: Optional[float] = Field(None, ge=0, le=5)
    in_stock: Optional[bool] = None
    is_prime: Optional[bool] = None
    is_deal: Optional[bool] = None
    fast_delivery: Optional[bool] = None

class SearchRequest(BaseModel):
    query: Optional[str] = None
    filters: Optional[SearchFilters] = None
    sort_by: Optional[str] = Field(None, pattern="^(price|rating|newest|featured)$")
    sort_order: Optional[str] = Field(None, pattern="^(asc|desc)$")
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)

class ProductSearchResponse(BaseModel):
    products: List[Product]
    total: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_prev: bool

class CartResponse(BaseModel):
    items: List[CartItem]
    total_items: int
    subtotal: float
    tax: float
    shipping: float
    total: float

class OrderResponse(BaseModel):
    order: Order
    items: List[OrderItem]
    estimated_delivery: Optional[date] = None
    tracking_url: Optional[str] = None
