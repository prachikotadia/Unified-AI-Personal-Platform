import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
import random

from app.models.marketplace_db import Product, Category, Order, OrderItem, Review, Cart, CartItem, OrderStatus
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

# LangChain service - optional
try:
    from app.services.langchain_service import langchain_service
except ImportError:
    langchain_service = None

class MarketplaceService:
    def __init__(self):
        self.categories = [
            "Electronics", "Clothing", "Home & Garden", "Sports", "Books", 
            "Beauty", "Toys", "Automotive", "Health", "Food & Beverages"
        ]
        
    async def initialize_marketplace_data(self, db: Session):
        """Initialize marketplace with sample products and categories"""
        try:
            # Create categories
            for category_name in self.categories:
                existing = db.query(Category).filter(Category.name == category_name).first()
                if not existing:
                    category = Category(
                        name=category_name,
                        description=f"Products in {category_name} category",
                        slug=category_name.lower().replace(" ", "-")
                    )
                    db.add(category)
            
            db.commit()
            
            # Create sample products
            await self._create_sample_products(db)
            
            logger.info("Marketplace data initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing marketplace data: {e}")
            db.rollback()
            raise

    async def _create_sample_products(self, db: Session):
        """Create sample products for the marketplace"""
        sample_products = [
            {
                "name": "Wireless Bluetooth Headphones",
                "description": "High-quality wireless headphones with noise cancellation",
                "price": 89.99,
                "category": "Electronics",
                "stock": 50,
                "rating": 4.5,
                "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
                "tags": ["wireless", "bluetooth", "noise-cancellation"]
            },
            {
                "name": "Fitness Tracker Smartwatch",
                "description": "Advanced fitness tracking with heart rate monitoring",
                "price": 199.99,
                "category": "Electronics",
                "stock": 30,
                "rating": 4.3,
                "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
                "tags": ["fitness", "smartwatch", "health"]
            },
            {
                "name": "Organic Cotton T-Shirt",
                "description": "Comfortable organic cotton t-shirt, sustainable fashion",
                "price": 24.99,
                "category": "Clothing",
                "stock": 100,
                "rating": 4.2,
                "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
                "tags": ["organic", "cotton", "sustainable"]
            },
            {
                "name": "Yoga Mat Premium",
                "description": "Non-slip yoga mat with carrying strap",
                "price": 39.99,
                "category": "Sports",
                "stock": 75,
                "rating": 4.6,
                "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
                "tags": ["yoga", "fitness", "exercise"]
            },
            {
                "name": "Smart Home Security Camera",
                "description": "1080p HD security camera with night vision",
                "price": 129.99,
                "category": "Electronics",
                "stock": 25,
                "rating": 4.4,
                "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                "tags": ["security", "smart-home", "camera"]
            },
            {
                "name": "Natural Face Moisturizer",
                "description": "Hydrating face cream with natural ingredients",
                "price": 34.99,
                "category": "Beauty",
                "stock": 60,
                "rating": 4.1,
                "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
                "tags": ["beauty", "skincare", "natural"]
            },
            {
                "name": "Wireless Gaming Mouse",
                "description": "High-precision gaming mouse with RGB lighting",
                "price": 79.99,
                "category": "Electronics",
                "stock": 40,
                "rating": 4.7,
                "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
                "tags": ["gaming", "wireless", "rgb"]
            },
            {
                "name": "Portable Bluetooth Speaker",
                "description": "Waterproof portable speaker with 20-hour battery",
                "price": 59.99,
                "category": "Electronics",
                "stock": 35,
                "rating": 4.3,
                "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
                "tags": ["bluetooth", "portable", "waterproof"]
            }
        ]
        
        for product_data in sample_products:
            category = db.query(Category).filter(Category.name == product_data["category"]).first()
            if category:
                existing = db.query(Product).filter(Product.name == product_data["name"]).first()
                if not existing:
                    product = Product(
                        name=product_data["name"],
                        description=product_data["description"],
                        price=product_data["price"],
                        category_id=category.id,
                        stock=product_data["stock"],
                        rating=product_data["rating"],
                        image_url=product_data["image_url"],
                        tags=product_data["tags"]
                    )
                    db.add(product)
        
        db.commit()

    async def get_products(self, db: Session, category: str = None, search: str = None, 
                          min_price: float = None, max_price: float = None, 
                          sort_by: str = "name", page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """Get products with filtering and pagination"""
        try:
            query = db.query(Product).join(Category)
            
            # Apply filters
            if category:
                query = query.filter(Category.name == category)
            
            if search:
                search_filter = or_(
                    Product.name.ilike(f"%{search}%"),
                    Product.description.ilike(f"%{search}%"),
                    Product.tags.any(lambda tag: tag.ilike(f"%{search}%"))
                )
                query = query.filter(search_filter)
            
            if min_price is not None:
                query = query.filter(Product.price >= min_price)
            
            if max_price is not None:
                query = query.filter(Product.price <= max_price)
            
            # Apply sorting
            if sort_by == "price_low":
                query = query.order_by(Product.price.asc())
            elif sort_by == "price_high":
                query = query.order_by(Product.price.desc())
            elif sort_by == "rating":
                query = query.order_by(Product.rating.desc())
            elif sort_by == "newest":
                query = query.order_by(Product.created_at.desc())
            else:
                query = query.order_by(Product.name.asc())
            
            # Apply pagination
            total = query.count()
            offset = (page - 1) * limit
            products = query.offset(offset).limit(limit).all()
            
            return {
                "products": [self._product_to_dict(p) for p in products],
                "total": total,
                "page": page,
                "limit": limit,
                "pages": (total + limit - 1) // limit
            }
        except Exception as e:
            logger.error(f"Error getting products: {e}")
            return {"products": [], "total": 0, "page": 1, "limit": 20, "pages": 0}

    async def get_product_by_id(self, db: Session, product_id: int) -> Optional[Dict[str, Any]]:
        """Get product by ID with category and reviews"""
        try:
            product = db.query(Product).filter(Product.id == product_id).first()
            if product:
                return self._product_to_dict(product, include_reviews=True)
            return None
        except Exception as e:
            logger.error(f"Error getting product by ID: {e}")
            return None

    async def get_categories(self, db: Session) -> List[Dict[str, Any]]:
        """Get all categories with product counts"""
        try:
            categories = db.query(Category).all()
            result = []
            for category in categories:
                product_count = db.query(Product).filter(Product.category_id == category.id).count()
                result.append({
                    "id": category.id,
                    "name": category.name,
                    "description": category.description,
                    "slug": category.slug,
                    "product_count": product_count
                })
            return result
        except Exception as e:
            logger.error(f"Error getting categories: {e}")
            return []

    async def get_ai_recommendations(self, db: Session, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """Get AI-powered product recommendations"""
        try:
            # Get user's purchase history and preferences
            user_data = await self._get_user_preferences(db, user_id)
            
            # Use LangChain for recommendations
            recommendations = await langchain_service._recommend_products(json.dumps(user_data))
            
            # Get recommended products from database
            recommended_products = await self._get_recommended_products(db, user_data, limit)
            
            return {
                "recommendations": recommended_products,
                "ai_analysis": recommendations,
                "confidence": 0.89,
                "model": "langchain-gpt4"
            }
            
        except Exception as e:
            logger.error(f"Error getting AI recommendations: {e}")
            return {"recommendations": [], "ai_analysis": "Unable to generate recommendations", "confidence": 0.5}

    async def _get_user_preferences(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Get user preferences from purchase history"""
        try:
            # Get user's orders
            orders = db.query(Order).filter(Order.user_id == user_id).all()
            
            preferences = {
                "purchase_history": [],
                "categories": {},
                "price_range": {"min": 0, "max": 0},
                "total_spent": 0
            }
            
            for order in orders:
                order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
                for item in order_items:
                    product = db.query(Product).filter(Product.id == item.product_id).first()
                    if product:
                        preferences["purchase_history"].append({
                            "product_id": product.id,
                            "name": product.name,
                            "category": product.category.name,
                            "price": product.price,
                            "quantity": item.quantity
                        })
                        
                        # Track category preferences
                        if product.category.name not in preferences["categories"]:
                            preferences["categories"][product.category.name] = 0
                        preferences["categories"][product.category.name] += item.quantity
                        
                        preferences["total_spent"] += product.price * item.quantity
            
            # Calculate price range
            if preferences["purchase_history"]:
                prices = [item["price"] for item in preferences["purchase_history"]]
                preferences["price_range"]["min"] = min(prices)
                preferences["price_range"]["max"] = max(prices)
            
            return preferences
            
        except Exception as e:
            logger.error(f"Error getting user preferences: {e}")
            return {"purchase_history": [], "categories": {}, "price_range": {"min": 0, "max": 0}, "total_spent": 0}

    async def _get_recommended_products(self, db: Session, user_data: Dict[str, Any], limit: int) -> List[Dict[str, Any]]:
        """Get recommended products based on user preferences"""
        try:
            # Get top categories from user preferences
            top_categories = sorted(
                user_data.get("categories", {}).items(),
                key=lambda x: x[1],
                reverse=True
            )[:3]
            
            recommended_products = []
            
            # Get products from top categories
            for category_name, _ in top_categories:
                category = db.query(Category).filter(Category.name == category_name).first()
                if category:
                    products = db.query(Product).filter(
                        and_(
                            Product.category_id == category.id,
                            Product.stock > 0
                        )
                    ).order_by(Product.rating.desc()).limit(limit // len(top_categories)).all()
                    
                    for product in products:
                        if product.id not in [p["id"] for p in recommended_products]:
                            recommended_products.append(self._product_to_dict(product))
            
            # Fill remaining slots with popular products
            if len(recommended_products) < limit:
                popular_products = db.query(Product).filter(
                    Product.stock > 0
                ).order_by(Product.rating.desc()).limit(limit - len(recommended_products)).all()
                
                for product in popular_products:
                    if product.id not in [p["id"] for p in recommended_products]:
                        recommended_products.append(self._product_to_dict(product))
            
            return recommended_products[:limit]
            
        except Exception as e:
            logger.error(f"Error getting recommended products: {e}")
            return []

    async def add_to_cart(self, db: Session, user_id: int, product_id: int, quantity: int = 1) -> Dict[str, Any]:
        """Add product to user's cart"""
        try:
            # Check if product exists and has stock
            product = db.query(Product).filter(Product.id == product_id).first()
            if not product:
                return {"success": False, "message": "Product not found"}
            
            if product.stock < quantity:
                return {"success": False, "message": "Insufficient stock"}
            
            # Get or create cart
            cart = db.query(Cart).filter(Cart.user_id == user_id).first()
            if not cart:
                cart = Cart(user_id=user_id)
                db.add(cart)
                db.commit()
                db.refresh(cart)
            
            # Check if product already in cart
            cart_item = db.query(CartItem).filter(
                and_(
                    CartItem.cart_id == cart.id,
                    CartItem.product_id == product_id
                )
            ).first()
            
            if cart_item:
                cart_item.quantity += quantity
            else:
                cart_item = CartItem(
                    cart_id=cart.id,
                    product_id=product_id,
                    quantity=quantity,
                    price=product.price
                )
                db.add(cart_item)
            
            db.commit()
            
            # Update cache
            await redis_cache.invalidate_cache(f"cart_{user_id}")
            
            return {"success": True, "message": "Product added to cart"}
            
        except Exception as e:
            logger.error(f"Error adding to cart: {e}")
            db.rollback()
            return {"success": False, "message": "Error adding to cart"}

    async def get_cart(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Get user's cart with products"""
        try:
            # Try to get from cache first
            cache_key = f"cart_{user_id}"
            cached_cart = await redis_cache.get_cache(cache_key)
            if cached_cart:
                return cached_cart
            
            cart = db.query(Cart).filter(Cart.user_id == user_id).first()
            if not cart:
                return {"items": [], "total": 0, "item_count": 0}
            
            cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
            
            items = []
            total = 0
            item_count = 0
            
            for item in cart_items:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                if product:
                    item_total = item.price * item.quantity
                    items.append({
                        "id": item.id,
                        "product": self._product_to_dict(product),
                        "quantity": item.quantity,
                        "price": item.price,
                        "total": item_total
                    })
                    total += item_total
                    item_count += item.quantity
            
            cart_data = {
                "items": items,
                "total": total,
                "item_count": item_count
            }
            
            # Cache cart data
            await redis_cache.set_cache(cache_key, cart_data, expire=1800)
            
            return cart_data
            
        except Exception as e:
            logger.error(f"Error getting cart: {e}")
            return {"items": [], "total": 0, "item_count": 0}

    async def create_order(self, db: Session, user_id: int, shipping_address: Dict[str, Any]) -> Dict[str, Any]:
        """Create order from cart"""
        try:
            cart = db.query(Cart).filter(Cart.user_id == user_id).first()
            if not cart:
                return {"success": False, "message": "Cart is empty"}
            
            cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
            if not cart_items:
                return {"success": False, "message": "Cart is empty"}
            
            # Calculate total
            total = sum(item.price * item.quantity for item in cart_items)
            
            # Create order
            order = Order(
                user_id=user_id,
                total_amount=total,
                status="pending",
                shipping_address=shipping_address
            )
            db.add(order)
            db.commit()
            db.refresh(order)
            
            # Create order items and update stock
            for cart_item in cart_items:
                product = db.query(Product).filter(Product.id == cart_item.product_id).first()
                if product and product.stock_quantity >= cart_item.quantity:
                    order_item = OrderItem(
                        order_id=order.id,
                        product_id=cart_item.product_id,
                        quantity=cart_item.quantity,
                        unit_price=cart_item.price,
                        total_price=cart_item.price * cart_item.quantity
                    )
                    db.add(order_item)
                    
                    # Update product stock
                    product.stock_quantity -= cart_item.quantity
                else:
                    db.rollback()
                    return {"success": False, "message": f"Insufficient stock for {product.name if product else 'product'}"}
            
            # Clear cart
            db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
            db.delete(cart)
            
            db.commit()
            
            # Clear cache
            await redis_cache.invalidate_cache(f"cart_{user_id}")
            
            return {
                "success": True,
                "message": "Order created successfully",
                "order_id": order.id,
                "total": total
            }
            
        except Exception as e:
            logger.error(f"Error creating order: {e}")
            db.rollback()
            return {"success": False, "message": "Error creating order"}

    async def get_user_orders(self, db: Session, user_id: int) -> List[Dict[str, Any]]:
        """Get user's order history"""
        try:
            orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
            
            result = []
            for order in orders:
                order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
                
                items = []
                for item in order_items:
                    product = db.query(Product).filter(Product.id == item.product_id).first()
                    if product:
                        items.append({
                            "product": self._product_to_dict(product),
                            "quantity": item.quantity,
                            "price": item.price,
                            "total": item.price * item.quantity
                        })
                
                result.append({
                    "id": order.id,
                    "total_amount": order.total_amount,
                    "status": order.status,
                    "created_at": order.created_at.isoformat(),
                    "items": items
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting user orders: {e}")
            return []
    
    def _product_to_dict(self, product: Product, include_reviews: bool = False) -> Dict[str, Any]:
        """Convert product to dictionary"""
        result = {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "stock": product.stock,
            "rating": product.rating,
            "image_url": product.image_url,
            "tags": product.tags,
            "category": {
                "id": product.category.id,
                "name": product.category.name,
                "slug": product.category.slug
            },
            "created_at": product.created_at.isoformat()
        }
        
        if include_reviews:
            # Add reviews if requested
            reviews = []
            for review in product.reviews:
                reviews.append({
                    "id": review.id,
                    "rating": review.rating,
                    "comment": review.comment,
                    "user_name": review.user.username if review.user else "Anonymous",
                    "created_at": review.created_at.isoformat()
                })
            result["reviews"] = reviews
        
        return result

# Global marketplace service instance
marketplace_service = MarketplaceService()
