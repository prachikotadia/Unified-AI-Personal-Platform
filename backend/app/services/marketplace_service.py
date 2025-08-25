from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from app.models.marketplace_db import (
    Product, Review, CartItem, WishlistItem, Order, OrderItem, 
    Category, AIRecommendation, PriceAlert, ProductComparison, 
    RecentlyViewed, ProductQuestion, ProductAnswer, InventoryLog,
    Return, ShippingZone, ShippingRate, TaxRate, LoyaltyProgram,
    LoyaltyTransaction
)
from app.models.marketplace_db import (
    OrderStatus, PaymentStatus, PaymentMethod, ShippingMethod,
    ReturnStatus, InventoryStatus
)
import structlog
from datetime import datetime, timedelta
import uuid
import json

logger = structlog.get_logger()

class MarketplaceService:
    def __init__(self, db: Session):
        self.db = db

    # Product Management
    def get_products(self, skip: int = 0, limit: int = 20, category_id: int = None, 
                    search: str = None, min_price: float = None, max_price: float = None,
                    sort_by: str = "created_at", sort_order: str = "desc"):
        """Get products with filtering and sorting"""
        query = self.db.query(Product).filter(Product.is_active == True)
        
        if category_id:
            query = query.filter(Product.category_id == category_id)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.description.ilike(search_term),
                    Product.brand.ilike(search_term)
                )
            )
        
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        
        # Sorting
        if sort_by == "price":
            order_col = Product.price
        elif sort_by == "rating":
            order_col = Product.rating
        elif sort_by == "name":
            order_col = Product.name
        else:
            order_col = Product.created_at
        
        if sort_order == "asc":
            query = query.order_by(order_col.asc())
        else:
            query = query.order_by(order_col.desc())
        
        total = query.count()
        products = query.offset(skip).limit(limit).all()
        
        return {
            "products": products,
            "total": total,
            "skip": skip,
            "limit": limit
        }

    def get_product(self, product_id: int):
        """Get a single product by ID"""
        return self.db.query(Product).filter(Product.id == product_id).first()

    def get_featured_products(self, limit: int = 10):
        """Get featured products"""
        return self.db.query(Product).filter(
            Product.is_active == True,
            Product.is_featured == True
        ).limit(limit).all()

    def get_deal_products(self, limit: int = 10):
        """Get products with deals"""
        return self.db.query(Product).filter(
            Product.is_active == True,
            Product.is_deal == True,
            Product.discount_percentage > 0
        ).limit(limit).all()

    def get_trending_products(self, limit: int = 10):
        """Get trending products based on views and sales"""
        return self.db.query(Product).filter(
            Product.is_active == True,
            Product.is_trending == True
        ).order_by(desc(Product.view_count)).limit(limit).all()

    # Inventory Management
    def update_inventory(self, product_id: int, quantity: int, action: str, 
                        user_id: str = None, reason: str = None):
        """Update product inventory with logging"""
        product = self.get_product(product_id)
        if not product:
            return None
        
        previous_quantity = product.stock_quantity
        
        if action == "stock_in":
            product.stock_quantity += quantity
        elif action == "stock_out":
            product.stock_quantity = max(0, product.stock_quantity - quantity)
        elif action == "adjustment":
            product.stock_quantity = quantity
        elif action == "reserved":
            # For reserved inventory (in cart but not purchased)
            pass
        
        # Log inventory change
        inventory_log = InventoryLog(
            product_id=product_id,
            user_id=user_id,
            action=action,
            quantity=quantity,
            previous_quantity=previous_quantity,
            new_quantity=product.stock_quantity,
            reason=reason
        )
        
        self.db.add(inventory_log)
        self.db.commit()
        
        return product

    def get_inventory_status(self, product_id: int):
        """Get current inventory status"""
        product = self.get_product(product_id)
        if not product:
            return None
        
        if product.stock_quantity == 0:
            status = InventoryStatus.out_of_stock
        elif product.stock_quantity <= product.min_stock_threshold:
            status = InventoryStatus.low_stock
        else:
            status = InventoryStatus.in_stock
        
        return {
            "product_id": product_id,
            "current_stock": product.stock_quantity,
            "min_threshold": product.min_stock_threshold,
            "status": status,
            "last_updated": datetime.utcnow()
        }

    def get_inventory_logs(self, product_id: int, limit: int = 50):
        """Get inventory change logs"""
        return self.db.query(InventoryLog).filter(
            InventoryLog.product_id == product_id
        ).order_by(desc(InventoryLog.created_at)).limit(limit).all()

    # Cart Management
    def get_cart(self, user_id: str):
        """Get user's cart items"""
        return self.db.query(CartItem).filter(CartItem.user_id == user_id).all()

    def add_to_cart(self, user_id: str, product_id: int, quantity: int = 1):
        """Add item to cart"""
        # Check if item already in cart
        existing_item = self.db.query(CartItem).filter(
            CartItem.user_id == user_id,
            CartItem.product_id == product_id
        ).first()
        
        if existing_item:
            existing_item.quantity += quantity
            self.db.commit()
            return existing_item
        
        # Check inventory
        product = self.get_product(product_id)
        if not product or product.stock_quantity < quantity:
            return None
        
        cart_item = CartItem(
            user_id=user_id,
            product_id=product_id,
            quantity=quantity
        )
        
        self.db.add(cart_item)
        self.db.commit()
        return cart_item

    def update_cart_item(self, user_id: str, product_id: int, quantity: int):
        """Update cart item quantity"""
        cart_item = self.db.query(CartItem).filter(
            CartItem.user_id == user_id,
            CartItem.product_id == product_id
        ).first()
        
        if not cart_item:
            return None
        
        if quantity <= 0:
            self.db.delete(cart_item)
        else:
            cart_item.quantity = quantity
        
        self.db.commit()
        return cart_item

    def remove_from_cart(self, user_id: str, product_id: int):
        """Remove item from cart"""
        cart_item = self.db.query(CartItem).filter(
            CartItem.user_id == user_id,
            CartItem.product_id == product_id
        ).first()
        
        if cart_item:
            self.db.delete(cart_item)
            self.db.commit()
            return True
        return False

    def clear_cart(self, user_id: str):
        """Clear user's entire cart"""
        self.db.query(CartItem).filter(CartItem.user_id == user_id).delete()
        self.db.commit()
        return True

    # Wishlist Management
    def get_wishlist(self, user_id: str):
        """Get user's wishlist"""
        return self.db.query(WishlistItem).filter(WishlistItem.user_id == user_id).all()

    def add_to_wishlist(self, user_id: str, product_id: int):
        """Add item to wishlist"""
        existing_item = self.db.query(WishlistItem).filter(
            WishlistItem.user_id == user_id,
            WishlistItem.product_id == product_id
        ).first()
        
        if existing_item:
            return existing_item
        
        wishlist_item = WishlistItem(
            user_id=user_id,
            product_id=product_id
        )
        
        self.db.add(wishlist_item)
        self.db.commit()
        return wishlist_item

    def remove_from_wishlist(self, user_id: str, product_id: int):
        """Remove item from wishlist"""
        wishlist_item = self.db.query(WishlistItem).filter(
            WishlistItem.user_id == user_id,
            WishlistItem.product_id == product_id
        ).first()
        
        if wishlist_item:
            self.db.delete(wishlist_item)
            self.db.commit()
            return True
        return False

    # Order Management
    def create_order(self, user_id: str, cart_items: list, shipping_address: dict,
                    billing_address: dict, payment_method: PaymentMethod,
                    shipping_method: ShippingMethod = ShippingMethod.standard):
        """Create a new order"""
        # Calculate totals
        subtotal = 0
        order_items = []
        
        for item in cart_items:
            product = self.get_product(item.product_id)
            if not product or product.stock_quantity < item.quantity:
                return None
            
            item_total = product.price * item.quantity
            subtotal += item_total
            
            order_items.append({
                "product_id": item.product_id,
                "product_name": product.name,
                "product_sku": product.sku,
                "quantity": item.quantity,
                "unit_price": product.price,
                "total_price": item_total
            })
        
        # Calculate shipping
        shipping_amount = self.calculate_shipping(shipping_address, shipping_method, subtotal)
        
        # Calculate tax
        tax_amount = self.calculate_tax(billing_address, subtotal)
        
        # Calculate total
        total_amount = subtotal + shipping_amount + tax_amount
        
        # Create order
        order = Order(
            user_id=user_id,
            order_number=f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}",
            status=OrderStatus.pending,
            payment_status=PaymentStatus.pending,
            payment_method=payment_method,
            subtotal=subtotal,
            tax_amount=tax_amount,
            shipping_amount=shipping_amount,
            total_amount=total_amount,
            shipping_address=shipping_address,
            billing_address=billing_address,
            shipping_method=shipping_method
        )
        
        self.db.add(order)
        self.db.flush()  # Get the order ID
        
        # Create order items
        for item_data in order_items:
            order_item = OrderItem(
                order_id=order.id,
                **item_data
            )
            self.db.add(order_item)
            
            # Update inventory
            self.update_inventory(
                item_data["product_id"],
                item_data["quantity"],
                "stock_out",
                user_id,
                "Order purchase"
            )
        
        # Clear cart
        self.clear_cart(user_id)
        
        # Add loyalty points
        self.add_loyalty_points(user_id, int(subtotal), f"Order {order.order_number}")
        
        self.db.commit()
        return order

    def get_orders(self, user_id: str, skip: int = 0, limit: int = 20):
        """Get user's orders"""
        query = self.db.query(Order).filter(Order.user_id == user_id)
        total = query.count()
        orders = query.order_by(desc(Order.created_at)).offset(skip).limit(limit).all()
        
        return {
            "orders": orders,
            "total": total,
            "skip": skip,
            "limit": limit
        }

    def get_order(self, order_id: int, user_id: str = None):
        """Get a specific order"""
        query = self.db.query(Order).filter(Order.id == order_id)
        if user_id:
            query = query.filter(Order.user_id == user_id)
        return query.first()

    def update_order_status(self, order_id: int, status: OrderStatus):
        """Update order status"""
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.status = status
            order.updated_at = datetime.utcnow()
            self.db.commit()
            return order
        return None

    # Shipping Calculator
    def calculate_shipping(self, shipping_address: dict, shipping_method: ShippingMethod, 
                          subtotal: float) -> float:
        """Calculate shipping cost based on address and method"""
        # Mock shipping calculation
        base_rate = 0
        
        if shipping_method == ShippingMethod.standard:
            base_rate = 5.99
        elif shipping_method == ShippingMethod.express:
            base_rate = 12.99
        elif shipping_method == ShippingMethod.overnight:
            base_rate = 24.99
        elif shipping_method == ShippingMethod.same_day:
            base_rate = 34.99
        elif shipping_method == ShippingMethod.international:
            base_rate = 29.99
        
        # Free shipping for orders over $50
        if subtotal >= 50 and shipping_method == ShippingMethod.standard:
            return 0
        
        return base_rate

    # Tax Calculator
    def calculate_tax(self, billing_address: dict, subtotal: float) -> float:
        """Calculate tax based on billing address"""
        # Mock tax calculation
        state = billing_address.get("state", "")
        
        # Sample tax rates
        tax_rates = {
            "CA": 0.0825,  # 8.25%
            "NY": 0.085,   # 8.5%
            "TX": 0.0625,  # 6.25%
            "FL": 0.06,    # 6%
            "WA": 0.065    # 6.5%
        }
        
        rate = tax_rates.get(state, 0.07)  # Default 7%
        return subtotal * rate

    # Return/Refund System
    def create_return(self, user_id: str, order_id: int, reason: str, 
                     description: str = None, return_method: str = "shipping"):
        """Create a return request"""
        order = self.get_order(order_id, user_id)
        if not order:
            return None
        
        # Check if return already exists
        existing_return = self.db.query(Return).filter(
            Return.order_id == order_id
        ).first()
        
        if existing_return:
            return existing_return
        
        return_request = Return(
            order_id=order_id,
            user_id=user_id,
            return_number=f"RET-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}",
            status=ReturnStatus.requested,
            reason=reason,
            description=description,
            return_method=return_method
        )
        
        self.db.add(return_request)
        self.db.commit()
        return return_request

    def get_returns(self, user_id: str):
        """Get user's returns"""
        return self.db.query(Return).filter(Return.user_id == user_id).all()

    def update_return_status(self, return_id: int, status: ReturnStatus, 
                           refund_amount: float = None):
        """Update return status"""
        return_request = self.db.query(Return).filter(Return.id == return_id).first()
        if return_request:
            return_request.status = status
            if refund_amount:
                return_request.refund_amount = refund_amount
            return_request.updated_at = datetime.utcnow()
            self.db.commit()
            return return_request
        return None

    # Loyalty Program
    def get_loyalty_program(self, user_id: str):
        """Get user's loyalty program status"""
        loyalty = self.db.query(LoyaltyProgram).filter(
            LoyaltyProgram.user_id == user_id
        ).first()
        
        if not loyalty:
            # Create new loyalty account
            loyalty = LoyaltyProgram(user_id=user_id)
            self.db.add(loyalty)
            self.db.commit()
        
        return loyalty

    def add_loyalty_points(self, user_id: str, amount: int, description: str):
        """Add loyalty points to user account"""
        loyalty = self.get_loyalty_program(user_id)
        
        # Calculate points (1 point per dollar spent)
        points = amount
        
        loyalty.points_balance += points
        loyalty.total_points_earned += points
        
        # Update tier
        self.update_loyalty_tier(loyalty)
        
        # Log transaction
        transaction = LoyaltyTransaction(
            user_id=user_id,
            transaction_type="earned",
            points=points,
            description=description
        )
        
        self.db.add(transaction)
        self.db.commit()
        
        return loyalty

    def redeem_loyalty_points(self, user_id: str, points: int, description: str):
        """Redeem loyalty points"""
        loyalty = self.get_loyalty_program(user_id)
        
        if loyalty.points_balance < points:
            return None
        
        loyalty.points_balance -= points
        loyalty.total_points_redeemed += points
        
        # Log transaction
        transaction = LoyaltyTransaction(
            user_id=user_id,
            transaction_type="redeemed",
            points=-points,
            description=description
        )
        
        self.db.add(transaction)
        self.db.commit()
        
        return loyalty

    def update_loyalty_tier(self, loyalty: LoyaltyProgram):
        """Update user's loyalty tier based on points"""
        if loyalty.total_points_earned >= 10000:
            tier = "platinum"
            next_tier_points = 15000
        elif loyalty.total_points_earned >= 5000:
            tier = "gold"
            next_tier_points = 10000
        elif loyalty.total_points_earned >= 1000:
            tier = "silver"
            next_tier_points = 5000
        else:
            tier = "bronze"
            next_tier_points = 1000
        
        loyalty.tier = tier
        loyalty.tier_points = loyalty.total_points_earned
        loyalty.next_tier_points = next_tier_points

    def get_loyalty_transactions(self, user_id: str, limit: int = 50):
        """Get user's loyalty transactions"""
        return self.db.query(LoyaltyTransaction).filter(
            LoyaltyTransaction.user_id == user_id
        ).order_by(desc(LoyaltyTransaction.created_at)).limit(limit).all()

    # Enhanced Features (AI Recommendations, Price Alerts, etc.)
    def get_ai_recommendations(self, user_id: str, product_id: int = None, limit: int = 10):
        """Get AI-powered product recommendations"""
        query = self.db.query(AIRecommendation).filter(AIRecommendation.user_id == user_id)
        
        if product_id:
            query = query.filter(AIRecommendation.product_id == product_id)
        
        recommendations = query.order_by(desc(AIRecommendation.score)).limit(limit).all()
        return recommendations

    def create_price_alert(self, user_id: str, product_id: int, target_price: float):
        """Create a price alert"""
        product = self.get_product(product_id)
        if not product:
            return None
        
        # Check if alert already exists
        existing_alert = self.db.query(PriceAlert).filter(
            PriceAlert.user_id == user_id,
            PriceAlert.product_id == product_id,
            PriceAlert.is_active == True
        ).first()
        
        if existing_alert:
            existing_alert.target_price = target_price
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
        return alert

    def get_price_alerts(self, user_id: str):
        """Get user's price alerts"""
        return self.db.query(PriceAlert).filter(
            PriceAlert.user_id == user_id,
            PriceAlert.is_active == True
        ).all()

    def create_product_comparison(self, user_id: str, name: str, product_ids: list):
        """Create a product comparison"""
        comparison = ProductComparison(
            user_id=user_id,
            name=name,
            product_ids=product_ids
        )
        
        self.db.add(comparison)
        self.db.commit()
        return comparison

    def get_product_comparisons(self, user_id: str):
        """Get user's product comparisons"""
        return self.db.query(ProductComparison).filter(
            ProductComparison.user_id == user_id
        ).all()

    def add_recently_viewed(self, user_id: str, product_id: int):
        """Add product to recently viewed"""
        # Remove existing entry if exists
        self.db.query(RecentlyViewed).filter(
            RecentlyViewed.user_id == user_id,
            RecentlyViewed.product_id == product_id
        ).delete()
        
        # Add new entry
        recently_viewed = RecentlyViewed(
            user_id=user_id,
            product_id=product_id
        )
        
        self.db.add(recently_viewed)
        self.db.commit()
        return recently_viewed

    def get_recently_viewed(self, user_id: str, limit: int = 10):
        """Get user's recently viewed products"""
        return self.db.query(RecentlyViewed).filter(
            RecentlyViewed.user_id == user_id
        ).order_by(desc(RecentlyViewed.viewed_at)).limit(limit).all()

    # Reviews and Q&A
    def create_review(self, user_id: str, product_id: int, rating: int, 
                     title: str, comment: str, user_name: str = None):
        """Create a product review"""
        review = Review(
            product_id=product_id,
            user_id=user_id,
            user_name=user_name or f"User {user_id}",
            rating=rating,
            title=title,
            comment=comment
        )
        
        self.db.add(review)
        
        # Update product rating
        product = self.get_product(product_id)
        if product:
            # Recalculate average rating
            avg_rating = self.db.query(func.avg(Review.rating)).filter(
                Review.product_id == product_id
            ).scalar()
            
            product.rating = avg_rating or 0
            product.review_count += 1
        
        self.db.commit()
        return review

    def get_product_reviews(self, product_id: int, skip: int = 0, limit: int = 20):
        """Get product reviews"""
        query = self.db.query(Review).filter(Review.product_id == product_id)
        total = query.count()
        reviews = query.order_by(desc(Review.created_at)).offset(skip).limit(limit).all()
        
        return {
            "reviews": reviews,
            "total": total,
            "skip": skip,
            "limit": limit
        }

    def create_product_question(self, user_id: str, product_id: int, question: str, 
                               user_name: str = None):
        """Create a product question"""
        product_question = ProductQuestion(
            product_id=product_id,
            user_id=user_id,
            user_name=user_name or f"User {user_id}",
            question=question
        )
        
        self.db.add(product_question)
        self.db.commit()
        return product_question

    def answer_product_question(self, question_id: int, user_id: str, answer: str,
                               user_name: str = None, user_type: str = "customer"):
        """Answer a product question"""
        product_answer = ProductAnswer(
            question_id=question_id,
            user_id=user_id,
            user_name=user_name or f"User {user_id}",
            user_type=user_type,
            answer=answer
        )
        
        self.db.add(product_answer)
        self.db.commit()
        return product_answer

    def get_product_questions(self, product_id: int, skip: int = 0, limit: int = 20):
        """Get product questions and answers"""
        query = self.db.query(ProductQuestion).filter(ProductQuestion.product_id == product_id)
        total = query.count()
        questions = query.order_by(desc(ProductQuestion.created_at)).offset(skip).limit(limit).all()
        
        return {
            "questions": questions,
            "total": total,
            "skip": skip,
            "limit": limit
        }

    # Categories
    def get_categories(self):
        """Get all categories"""
        return self.db.query(Category).filter(Category.parent_id == None).all()

    def get_category(self, category_id: int):
        """Get a specific category"""
        return self.db.query(Category).filter(Category.id == category_id).first()

    def get_category_by_slug(self, slug: str):
        """Get category by slug"""
        return self.db.query(Category).filter(Category.slug == slug).first()
