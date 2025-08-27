from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import structlog
from app.models.marketplace_db import (
    Product, Review, CartItem, WishlistItem, Order, OrderItem, 
    Category, SearchHistory, ProductView, ProductCategory, 
    ProductSubcategory, OrderStatus, PaymentStatus, PaymentMethod,
    AIRecommendation, PriceAlert, ProductComparison, RecentlyViewed,
    ProductQuestion, ProductAnswer
)

logger = structlog.get_logger()

class MarketplaceService:
    def __init__(self, db: Session):
        self.db = db
    
    # Product Operations
    def get_products(self, category: Optional[str] = None, subcategory: Optional[str] = None,
                    min_price: Optional[float] = None, max_price: Optional[float] = None,
                    brand: Optional[str] = None, rating: Optional[float] = None,
                    in_stock: Optional[bool] = None, sort_by: str = "relevance",
                    sort_order: str = "desc", page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """Get products with advanced filtering and sorting"""
        query = self.db.query(Product)
        
        # Apply filters
        if category:
            query = query.filter(Product.category == category)
        if subcategory:
            query = query.filter(Product.subcategory == subcategory)
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        if brand:
            query = query.filter(Product.brand.ilike(f"%{brand}%"))
        if rating is not None:
            query = query.filter(Product.rating >= rating)
        if in_stock is not None:
            if in_stock:
                query = query.filter(Product.stock_quantity > 0)
            else:
                query = query.filter(Product.stock_quantity == 0)
        
        # Apply sorting
        if sort_by == "price":
            query = query.order_by(asc(Product.price) if sort_order == "asc" else desc(Product.price))
        elif sort_by == "rating":
            query = query.order_by(desc(Product.rating) if sort_order == "desc" else asc(Product.rating))
        elif sort_by == "newest":
            query = query.order_by(desc(Product.created_at))
        elif sort_by == "featured":
            query = query.order_by(desc(Product.featured), desc(Product.rating))
        else:  # relevance - default sorting
            query = query.order_by(desc(Product.featured), desc(Product.trending), desc(Product.rating))
        
        # Pagination
        total = query.count()
        products = query.offset((page - 1) * limit).limit(limit).all()
        
        return {
            "products": products,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    
    def search_products(self, query: str, filters: Optional[Dict] = None,
                       sort_by: str = "relevance", sort_order: str = "desc",
                       page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """Search products with advanced filtering"""
        search_query = self.db.query(Product).filter(
            or_(
                Product.name.ilike(f"%{query}%"),
                Product.description.ilike(f"%{query}%"),
                Product.brand.ilike(f"%{query}%"),
                Product.tags.contains([query])
            )
        )
        
        # Apply additional filters
        if filters:
            if filters.get("category"):
                search_query = search_query.filter(Product.category == filters["category"])
            if filters.get("min_price"):
                search_query = search_query.filter(Product.price >= filters["min_price"])
            if filters.get("max_price"):
                search_query = search_query.filter(Product.price <= filters["max_price"])
            if filters.get("rating"):
                search_query = search_query.filter(Product.rating >= filters["rating"])
            if filters.get("in_stock"):
                search_query = search_query.filter(Product.stock_quantity > 0)
        
        # Apply sorting
        if sort_by == "price":
            search_query = search_query.order_by(asc(Product.price) if sort_order == "asc" else desc(Product.price))
        elif sort_by == "rating":
            search_query = search_query.order_by(desc(Product.rating) if sort_order == "desc" else asc(Product.rating))
        elif sort_by == "newest":
            search_query = search_query.order_by(desc(Product.created_at))
        else:  # relevance
            search_query = search_query.order_by(desc(Product.featured), desc(Product.rating))
        
        # Pagination
        total = search_query.count()
        products = search_query.offset((page - 1) * limit).limit(limit).all()
        
        # Record search history
        self.record_search_history("user_123", query, total)
        
        return {
            "products": products,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit,
            "query": query
        }
    
    def get_product_by_id(self, product_id: int) -> Optional[Product]:
        """Get product by ID"""
        return self.db.query(Product).filter(Product.id == product_id).first()
    
    def get_featured_products(self, limit: int = 8) -> List[Product]:
        """Get featured products"""
        return self.db.query(Product).filter(Product.featured == True).limit(limit).all()
    
    def get_trending_products(self, limit: int = 8) -> List[Product]:
        """Get trending products"""
        return self.db.query(Product).filter(Product.trending == True).limit(limit).all()
    
    def get_deals(self, limit: int = 8) -> List[Product]:
        """Get products with discounts"""
        return self.db.query(Product).filter(
            and_(Product.discount_percentage > 0, Product.discount_percentage <= 50)
        ).limit(limit).all()
    
    def get_prime_products(self, limit: int = 8) -> List[Product]:
        """Get prime eligible products"""
        return self.db.query(Product).filter(Product.prime_eligible == True).limit(limit).all()
    
    def get_popular_products(self, limit: int = 8) -> List[Product]:
        """Get popular products based on views and ratings"""
        return self.db.query(Product).order_by(
            desc(Product.rating), desc(Product.review_count)
        ).limit(limit).all()
    
    # Cart Operations
    def get_cart(self, user_id: str) -> List[CartItem]:
        """Get user's cart"""
        return self.db.query(CartItem).filter(CartItem.user_id == user_id).all()
    
    def add_to_cart(self, user_id: str, product_id: int, quantity: int = 1) -> CartItem:
        """Add product to cart"""
        existing_item = self.db.query(CartItem).filter(
            and_(CartItem.user_id == user_id, CartItem.product_id == product_id)
        ).first()
        
        if existing_item:
            existing_item.quantity += quantity
            self.db.commit()
            return existing_item
        else:
            cart_item = CartItem(
                user_id=user_id,
                product_id=product_id,
                quantity=quantity
            )
            self.db.add(cart_item)
            self.db.commit()
            self.db.refresh(cart_item)
            return cart_item
    
    def update_cart_item(self, user_id: str, product_id: int, quantity: int) -> Optional[CartItem]:
        """Update cart item quantity"""
        cart_item = self.db.query(CartItem).filter(
            and_(CartItem.user_id == user_id, CartItem.product_id == product_id)
        ).first()
        
        if cart_item:
            if quantity <= 0:
                self.db.delete(cart_item)
            else:
                cart_item.quantity = quantity
            self.db.commit()
            return cart_item
        return None
    
    def remove_from_cart(self, user_id: str, product_id: int) -> bool:
        """Remove product from cart"""
        cart_item = self.db.query(CartItem).filter(
            and_(CartItem.user_id == user_id, CartItem.product_id == product_id)
        ).first()
        
        if cart_item:
            self.db.delete(cart_item)
            self.db.commit()
            return True
        return False
    
    def clear_cart(self, user_id: str) -> bool:
        """Clear user's cart"""
        cart_items = self.db.query(CartItem).filter(CartItem.user_id == user_id).all()
        for item in cart_items:
            self.db.delete(item)
        self.db.commit()
        return True
    
    # Wishlist Operations
    def get_wishlist(self, user_id: str) -> List[WishlistItem]:
        """Get user's wishlist"""
        return self.db.query(WishlistItem).filter(WishlistItem.user_id == user_id).all()
    
    def add_to_wishlist(self, user_id: str, product_id: int) -> WishlistItem:
        """Add product to wishlist"""
        existing_item = self.db.query(WishlistItem).filter(
            and_(WishlistItem.user_id == user_id, WishlistItem.product_id == product_id)
        ).first()
        
        if existing_item:
            return existing_item
        
        wishlist_item = WishlistItem(
            user_id=user_id,
            product_id=product_id
        )
        self.db.add(wishlist_item)
        self.db.commit()
        self.db.refresh(wishlist_item)
        return wishlist_item
    
    def remove_from_wishlist(self, user_id: str, product_id: int) -> bool:
        """Remove product from wishlist"""
        wishlist_item = self.db.query(WishlistItem).filter(
            and_(WishlistItem.user_id == user_id, WishlistItem.product_id == product_id)
        ).first()
        
        if wishlist_item:
            self.db.delete(wishlist_item)
            self.db.commit()
            return True
        return False
    
    # Order Operations
    def create_order(self, user_id: str, cart_items: List[CartItem], 
                    shipping_address: Dict, billing_address: Dict,
                    payment_method: PaymentMethod) -> Order:
        """Create a new order"""
        # Calculate totals
        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        tax = subtotal * 0.08  # 8% tax
        shipping = 0.0 if subtotal > 50 else 5.99  # Free shipping over $50
        total = subtotal + tax + shipping
        
        # Create order
        order = Order(
            user_id=user_id,
            order_number=f"ORD-{uuid.uuid4().hex[:8].upper()}",
            status=OrderStatus.pending,
            payment_status=PaymentStatus.pending,
            payment_method=payment_method,
            subtotal=subtotal,
            tax=tax,
            shipping=shipping,
            total=total,
            shipping_address=shipping_address,
            billing_address=billing_address
        )
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        
        # Create order items
        for cart_item in cart_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
            self.db.add(order_item)
        
        # Clear cart
        self.clear_cart(user_id)
        
        self.db.commit()
        return order
    
    def get_user_orders(self, user_id: str) -> List[Order]:
        """Get user's orders"""
        return self.db.query(Order).filter(Order.user_id == user_id).order_by(desc(Order.created_at)).all()
    
    def get_order_by_id(self, order_id: int) -> Optional[Order]:
        """Get order by ID"""
        return self.db.query(Order).filter(Order.id == order_id).first()
    
    def update_order_status(self, order_id: int, status: OrderStatus) -> Optional[Order]:
        """Update order status"""
        order = self.get_order_by_id(order_id)
        if order:
            order.status = status
            self.db.commit()
            self.db.refresh(order)
        return order
    
    # Review Operations
    def get_product_reviews(self, product_id: int, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """Get product reviews with pagination"""
        query = self.db.query(Review).filter(Review.product_id == product_id)
        total = query.count()
        reviews = query.order_by(desc(Review.created_at)).offset((page - 1) * limit).limit(limit).all()
        
        return {
            "reviews": reviews,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    
    def create_review(self, user_id: str, product_id: int, rating: int, 
                     title: str, comment: str) -> Review:
        """Create a product review"""
        review = Review(
            user_id=user_id,
            product_id=product_id,
            rating=rating,
            title=title,
            comment=comment,
            verified_purchase=True  # Mock verified purchase
        )
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        
        # Update product rating
        self.update_product_rating(product_id)
        
        return review
    
    def update_product_rating(self, product_id: int):
        """Update product average rating and review count"""
        product = self.get_product_by_id(product_id)
        if product:
            reviews = self.db.query(Review).filter(Review.product_id == product_id).all()
            if reviews:
                avg_rating = sum(r.rating for r in reviews) / len(reviews)
                product.rating = round(avg_rating, 1)
                product.review_count = len(reviews)
                self.db.commit()
    
    # Category Operations
    def get_categories(self) -> List[Category]:
        """Get all categories"""
        return self.db.query(Category).filter(Category.parent_id == None).order_by(Category.sort_order).all()
    
    def get_category_by_slug(self, slug: str) -> Optional[Category]:
        """Get category by slug"""
        return self.db.query(Category).filter(Category.slug == slug).first()
    
    # Search History
    def record_search_history(self, user_id: str, query: str, results_count: int):
        """Record search history"""
        search_history = SearchHistory(
            user_id=user_id,
            query=query,
            results_count=results_count
        )
        self.db.add(search_history)
        self.db.commit()
    
    # Product Views
    def record_product_view(self, user_id: str, product_id: int, session_id: str = None):
        """Record product view"""
        product_view = ProductView(
            user_id=user_id,
            product_id=product_id,
            session_id=session_id
        )
        self.db.add(product_view)
        self.db.commit()
    
    # Enhanced Features
    
    # AI Recommendations
    def get_ai_recommendations(self, user_id: str, product_id: Optional[int] = None, limit: int = 8) -> List[Product]:
        """Get AI-powered product recommendations"""
        if product_id:
            # Get recommendations based on specific product
            recommendations = self.db.query(AIRecommendation).filter(
                AIRecommendation.product_id == product_id
            ).order_by(desc(AIRecommendation.score)).limit(limit).all()
            
            recommended_products = []
            for rec in recommendations:
                product = self.get_product_by_id(rec.recommended_product_id)
                if product:
                    recommended_products.append(product)
            return recommended_products
        else:
            # Get general recommendations based on user behavior
            # This is a simplified version - in production, you'd use ML models
            return self.get_popular_products(limit)
    
    def create_ai_recommendation(self, user_id: str, product_id: int, 
                               recommended_product_id: int, score: float, 
                               reason: str, algorithm: str = "collaborative_filtering"):
        """Create AI recommendation"""
        recommendation = AIRecommendation(
            user_id=user_id,
            product_id=product_id,
            recommended_product_id=recommended_product_id,
            score=score,
            reason=reason,
            algorithm=algorithm
        )
        self.db.add(recommendation)
        self.db.commit()
        return recommendation
    
    # Price Alerts
    def create_price_alert(self, user_id: str, product_id: int, target_price: float) -> PriceAlert:
        """Create price alert"""
        product = self.get_product_by_id(product_id)
        if not product:
            raise ValueError("Product not found")
        
        # Check if alert already exists
        existing_alert = self.db.query(PriceAlert).filter(
            and_(PriceAlert.user_id == user_id, PriceAlert.product_id == product_id)
        ).first()
        
        if existing_alert:
            existing_alert.target_price = target_price
            existing_alert.current_price = product.price
            existing_alert.is_active = True
            existing_alert.notified = False
            self.db.commit()
            return existing_alert
        
        alert = PriceAlert(
            user_id=user_id,
            product_id=product_id,
            target_price=target_price,
            current_price=product.price
        )
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        return alert
    
    def get_user_price_alerts(self, user_id: str) -> List[PriceAlert]:
        """Get user's price alerts"""
        return self.db.query(PriceAlert).filter(
            and_(PriceAlert.user_id == user_id, PriceAlert.is_active == True)
        ).all()
    
    def delete_price_alert(self, user_id: str, alert_id: int) -> bool:
        """Delete price alert"""
        alert = self.db.query(PriceAlert).filter(
            and_(PriceAlert.user_id == user_id, PriceAlert.id == alert_id)
        ).first()
        
        if alert:
            self.db.delete(alert)
            self.db.commit()
            return True
        return False
    
    def check_price_alerts(self):
        """Check and trigger price alerts"""
        alerts = self.db.query(PriceAlert).filter(
            and_(PriceAlert.is_active == True, PriceAlert.notified == False)
        ).all()
        
        triggered_alerts = []
        for alert in alerts:
            product = self.get_product_by_id(alert.product_id)
            if product and product.price <= alert.target_price:
                alert.notified = True
                alert.current_price = product.price
                triggered_alerts.append(alert)
        
        self.db.commit()
        return triggered_alerts
    
    # Product Comparisons
    def create_product_comparison(self, user_id: str, name: str, product_ids: List[int]) -> ProductComparison:
        """Create product comparison"""
        comparison = ProductComparison(
            user_id=user_id,
            name=name,
            product_ids=product_ids
        )
        self.db.add(comparison)
        self.db.commit()
        self.db.refresh(comparison)
        return comparison
    
    def get_user_comparisons(self, user_id: str) -> List[ProductComparison]:
        """Get user's product comparisons"""
        return self.db.query(ProductComparison).filter(
            ProductComparison.user_id == user_id
        ).order_by(desc(ProductComparison.updated_at)).all()
    
    def get_comparison_products(self, comparison_id: int) -> List[Product]:
        """Get products in a comparison"""
        comparison = self.db.query(ProductComparison).filter(
            ProductComparison.id == comparison_id
        ).first()
        
        if comparison:
            return [self.get_product_by_id(pid) for pid in comparison.product_ids if self.get_product_by_id(pid)]
        return []
    
    def delete_comparison(self, user_id: str, comparison_id: int) -> bool:
        """Delete product comparison"""
        comparison = self.db.query(ProductComparison).filter(
            and_(ProductComparison.user_id == user_id, ProductComparison.id == comparison_id)
        ).first()
        
        if comparison:
            self.db.delete(comparison)
            self.db.commit()
            return True
        return False
    
    # Recently Viewed
    def get_recently_viewed(self, user_id: str, limit: int = 10) -> List[Product]:
        """Get user's recently viewed products"""
        recent_views = self.db.query(RecentlyViewed).filter(
            RecentlyViewed.user_id == user_id
        ).order_by(desc(RecentlyViewed.viewed_at)).limit(limit).all()
        
        products = []
        seen_ids = set()
        for view in recent_views:
            if view.product_id not in seen_ids:
                product = self.get_product_by_id(view.product_id)
                if product:
                    products.append(product)
                    seen_ids.add(view.product_id)
        
        return products
    
    def add_recently_viewed(self, user_id: str, product_id: int, session_id: str = None):
        """Add product to recently viewed"""
        recent_view = RecentlyViewed(
            user_id=user_id,
            product_id=product_id,
            session_id=session_id
        )
        self.db.add(recent_view)
        self.db.commit()
    
    # Q&A System
    def get_product_questions(self, product_id: int, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """Get product questions with pagination"""
        query = self.db.query(ProductQuestion).filter(ProductQuestion.product_id == product_id)
        total = query.count()
        questions = query.order_by(desc(ProductQuestion.created_at)).offset((page - 1) * limit).limit(limit).all()
        
        return {
            "questions": questions,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    
    def create_product_question(self, user_id: str, product_id: int, question: str) -> ProductQuestion:
        """Create product question"""
        product_question = ProductQuestion(
            user_id=user_id,
            product_id=product_id,
            question=question
        )
        self.db.add(product_question)
        self.db.commit()
        self.db.refresh(product_question)
        return product_question
    
    def answer_product_question(self, question_id: int, answer: str, answered_by: str) -> ProductAnswer:
        """Answer a product question"""
        product_answer = ProductAnswer(
            question_id=question_id,
            answer=answer,
            answered_by=answered_by
        )
        self.db.add(product_answer)
        
        # Update question status
        question = self.db.query(ProductQuestion).filter(ProductQuestion.id == question_id).first()
        if question:
            question.is_answered = True
            question.answered_at = datetime.now()
        
        self.db.commit()
        self.db.refresh(product_answer)
        return product_answer
    
    def vote_question_helpful(self, question_id: int) -> bool:
        """Vote question as helpful"""
        question = self.db.query(ProductQuestion).filter(ProductQuestion.id == question_id).first()
        if question:
            question.helpful_votes += 1
            self.db.commit()
            return True
        return False
    
    def vote_answer_helpful(self, answer_id: int) -> bool:
        """Vote answer as helpful"""
        answer = self.db.query(ProductAnswer).filter(ProductAnswer.id == answer_id).first()
        if answer:
            answer.helpful_votes += 1
            self.db.commit()
            return True
        return False
