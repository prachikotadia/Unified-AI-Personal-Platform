from sqlalchemy.orm import Session
from app.database import engine, get_db
from app.models.user import User, UserSession
from app.models.marketplace_db import (
    Product, Review, CartItem, WishlistItem, Order, OrderItem, Category,
    SearchHistory, ProductView, AIRecommendation, PriceAlert, ProductComparison,
    RecentlyViewed, ProductQuestion, ProductAnswer, ProductCategory, ProductSubcategory
)
from app.models.payment import PaymentMethod, PaymentTransaction, PaymentRefund, PaymentWebhook
from app.models.inventory import Inventory, InventoryOperation, InventoryAlert, Supplier
from app.models.shipping import Address, ShippingZone, ShippingRate, Shipment
from app.services.user_service import UserService
from app.services.payment_service import PaymentService
from app.services.inventory_service import InventoryService
from app.services.shipping_service import ShippingService
import structlog

logger = structlog.get_logger()

def init_database():
    """Initialize database with tables and sample data"""
    try:
        # Import all models to ensure they are registered
        from app.models.user import Base as UserBase
        from app.models.marketplace_db import Base as MarketplaceBase
        from app.models.payment import Base as PaymentBase
        from app.models.inventory import Base as InventoryBase
        from app.models.shipping import Base as ShippingBase
        
        # Create all tables
        UserBase.metadata.create_all(bind=engine)
        MarketplaceBase.metadata.create_all(bind=engine)
        PaymentBase.metadata.create_all(bind=engine)
        InventoryBase.metadata.create_all(bind=engine)
        ShippingBase.metadata.create_all(bind=engine)
        
        logger.info("Database tables created successfully")
        
        # Create sample data
        create_sample_data()
        
        logger.info("Sample data created successfully")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        raise

def create_sample_data():
    """Create sample data for all models"""
    db = next(get_db())
    
    try:
        # Create sample users
        user_service = UserService(db)
        
        # Create test user
        test_user = user_service.create_user(
            username="testuser",
            email="test@example.com",
            password="password123",
            first_name="Test",
            last_name="User"
        )
        
        # Create sample categories
        categories = [
            Category(name="Electronics", slug="electronics", description="Electronic devices and gadgets"),
            Category(name="Clothing", slug="clothing", description="Fashion and apparel"),
            Category(name="Home & Garden", slug="home-garden", description="Home improvement and garden supplies"),
            Category(name="Sports & Outdoors", slug="sports-outdoors", description="Sports equipment and outdoor gear"),
            Category(name="Books", slug="books", description="Books and literature"),
            Category(name="Beauty & Personal Care", slug="beauty", description="Beauty and personal care products"),
            Category(name="Toys & Games", slug="toys-games", description="Toys and games for all ages"),
            Category(name="Automotive", slug="automotive", description="Automotive parts and accessories"),
            Category(name="Health & Wellness", slug="health-wellness", description="Health and wellness products"),
            Category(name="Food & Beverages", slug="food-beverages", description="Food and beverage products")
        ]
        
        for category in categories:
            db.add(category)
        db.commit()
        
        # Create sample products
        products = [
            Product(
                name="iPhone 15 Pro",
                description="Latest iPhone with advanced camera system and A17 Pro chip",
                price=999.99,
                original_price=1099.99,
                discount_percentage=9.09,
                category=ProductCategory.electronics,
                subcategory=ProductSubcategory.smartphones,
                brand="Apple",
                sku="IPHONE15PRO-128",
                stock_quantity=50,
                images=["https://example.com/iphone15pro1.jpg", "https://example.com/iphone15pro2.jpg"],
                specifications={
                    "Screen Size": "6.1 inches",
                    "Storage": "128GB",
                    "Color": "Natural Titanium",
                    "Chip": "A17 Pro"
                },
                features=["5G capable", "Face ID", "Pro camera system", "MagSafe compatible"],
                tags=["smartphone", "apple", "5g", "camera"],
                rating=4.8,
                review_count=1250,
                featured=True,
                trending=True,
                prime_eligible=True,
                free_shipping=True
            ),
            Product(
                name="Samsung Galaxy S24 Ultra",
                description="Premium Android smartphone with S Pen and advanced AI features",
                price=1199.99,
                original_price=1299.99,
                discount_percentage=7.69,
                category=ProductCategory.electronics,
                subcategory=ProductSubcategory.smartphones,
                brand="Samsung",
                sku="SAMSUNG-S24ULTRA-256",
                stock_quantity=35,
                images=["https://example.com/s24ultra1.jpg", "https://example.com/s24ultra2.jpg"],
                specifications={
                    "Screen Size": "6.8 inches",
                    "Storage": "256GB",
                    "Color": "Titanium Gray",
                    "Chip": "Snapdragon 8 Gen 3"
                },
                features=["S Pen included", "200MP camera", "AI features", "5G capable"],
                tags=["smartphone", "samsung", "android", "s-pen"],
                rating=4.7,
                review_count=890,
                featured=True,
                trending=True,
                prime_eligible=True,
                free_shipping=True
            ),
            Product(
                name="MacBook Pro 14-inch",
                description="Professional laptop with M3 Pro chip for power users",
                price=1999.99,
                original_price=2199.99,
                discount_percentage=9.09,
                category=ProductCategory.electronics,
                subcategory=ProductSubcategory.laptops,
                brand="Apple",
                sku="MACBOOK-PRO-14-M3",
                stock_quantity=25,
                images=["https://example.com/macbookpro1.jpg", "https://example.com/macbookpro2.jpg"],
                specifications={
                    "Screen Size": "14 inches",
                    "Processor": "M3 Pro",
                    "Memory": "16GB",
                    "Storage": "512GB SSD"
                },
                features=["Liquid Retina XDR display", "Up to 22 hours battery", "Studio-quality microphones"],
                tags=["laptop", "apple", "macbook", "professional"],
                rating=4.9,
                review_count=567,
                featured=True,
                trending=False,
                prime_eligible=True,
                free_shipping=True
            ),
            Product(
                name="Sony WH-1000XM5",
                description="Industry-leading noise canceling headphones with exceptional sound quality",
                price=349.99,
                original_price=399.99,
                discount_percentage=12.5,
                category=ProductCategory.electronics,
                subcategory=ProductSubcategory.headphones,
                brand="Sony",
                sku="SONY-WH1000XM5",
                stock_quantity=75,
                images=["https://example.com/sony-headphones1.jpg", "https://example.com/sony-headphones2.jpg"],
                specifications={
                    "Driver Size": "30mm",
                    "Frequency Response": "4Hz-40kHz",
                    "Battery Life": "30 hours",
                    "Weight": "250g"
                },
                features=["Industry-leading noise canceling", "30-hour battery life", "Quick Charge", "Touch controls"],
                tags=["headphones", "sony", "noise-canceling", "wireless"],
                rating=4.8,
                review_count=2340,
                featured=False,
                trending=True,
                prime_eligible=True,
                free_shipping=True
            ),
            Product(
                name="Nike Air Max 270",
                description="Comfortable running shoes with Air Max technology",
                price=129.99,
                original_price=150.00,
                discount_percentage=13.34,
                category=ProductCategory.clothing,
                subcategory=ProductSubcategory.shoes,
                brand="Nike",
                sku="NIKE-AIRMAX270-10",
                stock_quantity=120,
                images=["https://example.com/nike-shoes1.jpg", "https://example.com/nike-shoes2.jpg"],
                specifications={
                    "Size": "10",
                    "Color": "Black/White",
                    "Material": "Mesh and synthetic",
                    "Weight": "320g"
                },
                features=["Air Max technology", "Breathable mesh", "Cushioned sole", "Lightweight design"],
                tags=["shoes", "nike", "running", "athletic"],
                rating=4.6,
                review_count=1890,
                featured=False,
                trending=False,
                prime_eligible=True,
                free_shipping=True
            )
        ]
        
        for product in products:
            db.add(product)
        db.commit()
        
        # Create inventory records for products
        inventory_service = InventoryService(db)
        for product in products:
            inventory = Inventory(
                product_id=product.id,
                current_stock=product.stock_quantity,
                reserved_stock=0,
                available_stock=product.stock_quantity,
                low_stock_threshold=10,
                reorder_point=5,
                max_stock=200
            )
            db.add(inventory)
        db.commit()
        
        # Create sample reviews
        reviews = [
            Review(
                product_id=products[0].id,
                user_id=test_user.id,
                rating=5,
                title="Excellent phone!",
                comment="The iPhone 15 Pro is amazing. The camera quality is outstanding and the performance is incredible.",
                helpful_votes=15
            ),
            Review(
                product_id=products[0].id,
                user_id=test_user.id,
                rating=4,
                title="Great phone with minor issues",
                comment="Overall great phone, but the battery life could be better. Camera is fantastic though.",
                helpful_votes=8
            ),
            Review(
                product_id=products[1].id,
                user_id=test_user.id,
                rating=5,
                title="Best Android phone ever",
                comment="The S24 Ultra is incredible. The S Pen is a game changer and the camera is phenomenal.",
                helpful_votes=23
            )
        ]
        
        for review in reviews:
            db.add(review)
        db.commit()
        
        # Create sample orders
        orders = [
            Order(
                user_id=test_user.id,
                order_number="ORD-2024-001",
                status="delivered",
                payment_status="paid",
                payment_method="credit_card",
                subtotal=999.99,
                tax=89.99,
                shipping_cost=0.0,
                discount=0.0,
                total=1089.98,
                shipping_address={
                    "first_name": "Test",
                    "last_name": "User",
                    "address_line1": "123 Main St",
                    "city": "New York",
                    "state": "NY",
                    "postal_code": "10001",
                    "country": "USA"
                },
                billing_address={
                    "first_name": "Test",
                    "last_name": "User",
                    "address_line1": "123 Main St",
                    "city": "New York",
                    "state": "NY",
                    "postal_code": "10001",
                    "country": "USA"
                }
            )
        ]
        
        for order in orders:
            db.add(order)
        db.commit()
        
        # Create sample order items
        order_items = [
            OrderItem(
                order_id=orders[0].id,
                product_id=products[0].id,
                quantity=1,
                unit_price=999.99,
                total_price=999.99
            )
        ]
        
        for item in order_items:
            db.add(item)
        db.commit()
        
        # Create sample addresses
        addresses = [
            Address(
                user_id=test_user.id,
                first_name="Test",
                last_name="User",
                address_line1="123 Main St",
                city="New York",
                state="NY",
                postal_code="10001",
                country="USA",
                phone="+1-555-123-4567",
                email="test@example.com",
                address_type="shipping",
                is_default=True
            )
        ]
        
        for address in addresses:
            db.add(address)
        db.commit()
        
        # Create sample AI recommendations
        ai_recommendations = [
            AIRecommendation(
                user_id=test_user.id,
                product_id=products[1].id,
                recommendation_type="similar",
                score=0.85,
                reason="Based on your interest in smartphones"
            ),
            AIRecommendation(
                user_id=test_user.id,
                product_id=products[3].id,
                recommendation_type="trending",
                score=0.92,
                reason="Popular among tech enthusiasts"
            )
        ]
        
        for rec in ai_recommendations:
            db.add(rec)
        db.commit()
        
        # Create sample price alerts
        price_alerts = [
            PriceAlert(
                user_id=test_user.id,
                product_id=products[2].id,
                target_price=1800.00,
                current_price=1999.99
            )
        ]
        
        for alert in price_alerts:
            db.add(alert)
        db.commit()
        
        # Create sample product comparisons
        comparisons = [
            ProductComparison(
                user_id=test_user.id,
                name="Smartphone Comparison",
                product_ids=[products[0].id, products[1].id]
            )
        ]
        
        for comp in comparisons:
            db.add(comp)
        db.commit()
        
        # Create sample recently viewed
        recently_viewed = [
            RecentlyViewed(
                user_id=test_user.id,
                product_id=products[0].id
            ),
            RecentlyViewed(
                user_id=test_user.id,
                product_id=products[1].id
            )
        ]
        
        for viewed in recently_viewed:
            db.add(viewed)
        db.commit()
        
        # Create sample product questions
        questions = [
            ProductQuestion(
                product_id=products[0].id,
                user_id=test_user.id,
                question="Does this phone support 5G?",
                helpful_votes=5
            )
        ]
        
        for question in questions:
            db.add(question)
        db.commit()
        
        # Create sample product answers
        answers = [
            ProductAnswer(
                question_id=questions[0].id,
                user_id=test_user.id,
                answer="Yes, the iPhone 15 Pro supports 5G networks and includes advanced 5G capabilities.",
                helpful_votes=12,
                is_verified=True
            )
        ]
        
        for answer in answers:
            db.add(answer)
        db.commit()
        
        logger.info("Sample data created successfully")
        
    except Exception as e:
        logger.error(f"Error creating sample data: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
