from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.models.marketplace_db import (
    Base, Product, Review, CartItem, WishlistItem, Order, OrderItem, 
    Category, ProductCategory, ProductSubcategory, OrderStatus, 
    PaymentStatus, PaymentMethod, AIRecommendation, PriceAlert, 
    ProductComparison, RecentlyViewed, ProductQuestion, ProductAnswer
)
import structlog
from datetime import datetime

logger = structlog.get_logger()

def init_database():
    """Initialize database tables"""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")

def create_sample_data():
    """Create sample marketplace data"""
    db = SessionLocal()
    try:
        logger.info("Creating sample marketplace data...")
        
        # Create categories
        categories = [
            Category(
                name="Electronics",
                slug="electronics",
                description="Latest gadgets and electronic devices",
                icon="smartphone",
                color="#3B82F6",
                sort_order=1
            ),
            Category(
                name="Fashion",
                slug="fashion",
                description="Trendy clothing and accessories",
                icon="shirt",
                color="#EC4899",
                sort_order=2
            ),
            Category(
                name="Home & Garden",
                slug="home-garden",
                description="Home improvement and garden supplies",
                icon="home",
                color="#10B981",
                sort_order=3
            ),
            Category(
                name="Sports & Outdoors",
                slug="sports-outdoors",
                description="Sports equipment and outdoor gear",
                icon="dumbbell",
                color="#F59E0B",
                sort_order=4
            ),
            Category(
                name="Books",
                slug="books",
                description="Books for all ages and interests",
                icon="book-open",
                color="#8B5CF6",
                sort_order=5
            ),
            Category(
                name="Beauty & Personal Care",
                slug="beauty-personal-care",
                description="Beauty products and personal care items",
                icon="sparkles",
                color="#EF4444",
                sort_order=6
            )
        ]
        
        for category in categories:
            db.add(category)
        db.commit()
        
        # Create products
        products = [
            Product(
                name="iPhone 15 Pro Max",
                description="The most advanced iPhone ever with A17 Pro chip, titanium design, and pro camera system.",
                price=1199.99,
                original_price=1299.99,
                discount_percentage=7.7,
                category=ProductCategory.electronics,
                subcategory=ProductSubcategory.smartphones,
                brand="Apple",
                sku="IPH15PM-256",
                stock_quantity=50,
                images=[
                    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
                    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500"
                ],
                specifications={
                    "storage": "256GB",
                    "color": "Natural Titanium",
                    "screen": "6.7 inch Super Retina XDR",
                    "camera": "48MP Main + 12MP Ultra Wide + 12MP Telephoto"
                },
                features=["A17 Pro chip", "Titanium design", "Pro camera system", "Action button", "USB-C connector"],
                tags=["iphone", "smartphone", "apple", "5g", "camera"],
                rating=4.8,
                review_count=1250,
                featured=True,
                trending=True,
                prime_eligible=True,
                free_shipping=True
            ),
            Product(
                name="MacBook Air M2",
                description="Supercharged by M2, MacBook Air combines incredible performance and up to 18 hours of battery life.",
                price=1099.99,
                original_price=1199.99,
                discount_percentage=8.3,
                category=ProductCategory.electronics,
                subcategory=ProductSubcategory.laptops,
                brand="Apple",
                sku="MBA-M2-256",
                stock_quantity=30,
                images=[
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"
                ],
                specifications={
                    "processor": "M2 chip",
                    "memory": "8GB unified memory",
                    "storage": "256GB SSD",
                    "display": "13.6 inch Liquid Retina"
                },
                features=["M2 chip", "18-hour battery life", "Liquid Retina display", "MagSafe charging", "Touch ID"],
                tags=["macbook", "laptop", "apple", "m2", "ultrabook"],
                rating=4.9,
                review_count=890,
                featured=True,
                trending=True,
                prime_eligible=True,
                free_shipping=True
            ),
            Product(
                name="Sony WH-1000XM5 Wireless Headphones",
                description="Industry-leading noise canceling with Dual Noise Sensor technology and 30-hour battery life.",
                price=349.99,
                original_price=399.99,
                discount_percentage=12.5,
                category=ProductCategory.electronics,
                subcategory=ProductSubcategory.headphones,
                brand="Sony",
                sku="SONY-WH1000XM5",
                stock_quantity=75,
                images=[
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
                ],
                specifications={
                    "driver": "30mm",
                    "frequency": "4Hz-40,000Hz",
                    "battery": "30 hours",
                    "weight": "250g"
                },
                features=["Industry-leading noise canceling", "Dual Noise Sensor technology", "30-hour battery life", "Quick Charge (3 min = 3 hours)", "Touch controls"],
                tags=["headphones", "wireless", "noise-canceling", "sony", "bluetooth"],
                rating=4.7,
                review_count=2100,
                featured=False,
                trending=True,
                prime_eligible=True,
                free_shipping=True
            ),
            Product(
                name="Nike Air Max 270",
                description="The Nike Air Max 270 delivers unrivaled, all-day comfort with the Air unit that's the tallest ever.",
                price=129.99,
                original_price=150.0,
                discount_percentage=13.3,
                category=ProductCategory.fashion,
                subcategory=ProductSubcategory.shoes,
                brand="Nike",
                sku="NIKE-AM270-BLK",
                stock_quantity=120,
                images=[
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
                ],
                specifications={
                    "material": "Mesh and synthetic",
                    "sole": "Rubber",
                    "closure": "Lace-up",
                    "weight": "340g"
                },
                features=["Tallest Air unit ever", "Breathable mesh upper", "Foam midsole", "Rubber outsole", "All-day comfort"],
                tags=["nike", "shoes", "sneakers", "air-max", "running"],
                rating=4.6,
                review_count=3400,
                featured=False,
                trending=True,
                prime_eligible=True,
                free_shipping=True
            ),
            Product(
                name="Instant Pot Duo 7-in-1",
                description="7-in-1 electric pressure cooker that slow cooks, pressure cooks, rice cooks, steams, sautés, and keeps warm.",
                price=89.99,
                original_price=119.99,
                discount_percentage=25.0,
                category=ProductCategory.home_garden,
                subcategory=ProductSubcategory.kitchen,
                brand="Instant Pot",
                sku="INSTANT-DUO-6QT",
                stock_quantity=200,
                images=[
                    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500",
                    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500"
                ],
                specifications={
                    "capacity": "6 quarts",
                    "power": "1000W",
                    "material": "Stainless steel",
                    "dimensions": "13.4 x 12.2 x 12.5 inches"
                },
                features=["7-in-1 functionality", "Pressure cooking", "Slow cooking", "Rice cooking", "Steaming", "Sautéing", "Keep warm"],
                tags=["instant-pot", "pressure-cooker", "kitchen", "cooking", "appliance"],
                rating=4.8,
                review_count=15600,
                featured=True,
                trending=False,
                prime_eligible=True,
                free_shipping=True
            ),
            Product(
                name="Yoga Mat Premium",
                description="Non-slip yoga mat with alignment lines, perfect for yoga, pilates, and fitness workouts.",
                price=29.99,
                original_price=39.99,
                discount_percentage=25.0,
                category=ProductCategory.sports_outdoors,
                subcategory=ProductSubcategory.yoga,
                brand="Manduka",
                sku="MANDUKA-PRO-BLK",
                stock_quantity=300,
                images=[
                    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500",
                    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500"
                ],
                specifications={
                    "thickness": "6mm",
                    "length": "72 inches",
                    "width": "24 inches",
                    "material": "PVC-free"
                },
                features=["Non-slip surface", "Alignment lines", "Cushioned support", "Eco-friendly materials", "Lifetime guarantee"],
                tags=["yoga", "mat", "fitness", "workout", "pilates"],
                rating=4.7,
                review_count=2800,
                featured=False,
                trending=False,
                prime_eligible=True,
                free_shipping=True
            ),
            Product(
                name="The Seven Husbands of Evelyn Hugo",
                description="A reclusive Hollywood legend reveals her life story to an unknown journalist.",
                price=16.99,
                original_price=24.99,
                discount_percentage=32.0,
                category=ProductCategory.books,
                subcategory=ProductSubcategory.fiction,
                brand="Atria Books",
                sku="BOOK-EVELYN-HUGO",
                stock_quantity=500,
                images=[
                    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
                    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500"
                ],
                specifications={
                    "pages": "400",
                    "language": "English",
                    "format": "Hardcover",
                    "isbn": "978-1501161939"
                },
                features=["Bestselling novel", "Historical fiction", "Hollywood setting", "Complex characters", "Page-turner"],
                tags=["book", "fiction", "romance", "historical", "hollywood"],
                rating=4.5,
                review_count=8900,
                featured=True,
                trending=True,
                prime_eligible=True,
                free_shipping=True
            ),
            Product(
                name="La Mer Moisturizing Cream",
                description="The iconic moisturizing cream that transforms skin with the power of the sea.",
                price=349.99,
                original_price=399.99,
                discount_percentage=12.5,
                category=ProductCategory.beauty_personal_care,
                subcategory=ProductSubcategory.skincare,
                brand="La Mer",
                sku="LAMER-CREAM-30ML",
                stock_quantity=25,
                images=[
                    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500",
                    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500"
                ],
                specifications={
                    "size": "30ml",
                    "type": "Moisturizer",
                    "skin_type": "All skin types",
                    "ingredients": "Miracle Broth, Lime Tea"
                },
                features=["Miracle Broth technology", "Intensive hydration", "Anti-aging benefits", "Luxury formula", "Iconic packaging"],
                tags=["skincare", "moisturizer", "luxury", "anti-aging", "la-mer"],
                rating=4.9,
                review_count=1200,
                featured=True,
                trending=False,
                prime_eligible=True,
                free_shipping=True
            )
        ]
        
        for product in products:
            db.add(product)
        db.commit()
        
        # Create reviews
        reviews = [
            Review(
                product_id=1,
                user_id="user_123",
                rating=5,
                title="Amazing phone!",
                comment="The best iPhone I've ever owned. The camera is incredible and the performance is outstanding.",
                helpful_votes=45,
                verified_purchase=True
            ),
            Review(
                product_id=1,
                user_id="user_456",
                rating=4,
                title="Great but expensive",
                comment="Excellent phone with great features, but quite expensive. Worth it if you can afford it.",
                helpful_votes=23,
                verified_purchase=True
            ),
            Review(
                product_id=2,
                user_id="user_789",
                rating=5,
                title="Perfect laptop",
                comment="The M2 chip is incredibly fast and the battery life is amazing. Perfect for work and play.",
                helpful_votes=67,
                verified_purchase=True
            ),
            Review(
                product_id=3,
                user_id="user_101",
                rating=4,
                title="Excellent noise cancellation",
                comment="The noise cancellation is incredible. Perfect for travel and work. Battery life is great too.",
                helpful_votes=34,
                verified_purchase=True
            )
        ]
        
        for review in reviews:
            db.add(review)
        db.commit()
        
        # Create AI recommendations
        ai_recommendations = [
            AIRecommendation(
                user_id="user_123",
                product_id=1,
                recommended_product_id=2,
                score=0.95,
                reason="Users who bought iPhone also bought MacBook",
                algorithm="collaborative_filtering"
            ),
            AIRecommendation(
                user_id="user_123",
                product_id=1,
                recommended_product_id=3,
                score=0.87,
                reason="Similar to other premium electronics",
                algorithm="content_based"
            ),
            AIRecommendation(
                user_id="user_123",
                product_id=2,
                recommended_product_id=1,
                score=0.92,
                reason="Apple ecosystem recommendation",
                algorithm="collaborative_filtering"
            )
        ]
        
        for rec in ai_recommendations:
            db.add(rec)
        db.commit()
        
        # Create price alerts
        price_alerts = [
            PriceAlert(
                user_id="user_123",
                product_id=1,
                target_price=1100.0,
                current_price=1199.99
            ),
            PriceAlert(
                user_id="user_123",
                product_id=3,
                target_price=300.0,
                current_price=349.99
            )
        ]
        
        for alert in price_alerts:
            db.add(alert)
        db.commit()
        
        # Create product comparisons
        comparisons = [
            ProductComparison(
                user_id="user_123",
                name="iPhone vs Samsung",
                product_ids=[1, 2]  # iPhone and MacBook for demo
            ),
            ProductComparison(
                user_id="user_123",
                name="Headphones Comparison",
                product_ids=[3]  # Just Sony headphones for demo
            )
        ]
        
        for comp in comparisons:
            db.add(comp)
        db.commit()
        
        # Create recently viewed
        recently_viewed = [
            RecentlyViewed(
                user_id="user_123",
                product_id=1,
                session_id="session_123"
            ),
            RecentlyViewed(
                user_id="user_123",
                product_id=2,
                session_id="session_123"
            ),
            RecentlyViewed(
                user_id="user_123",
                product_id=3,
                session_id="session_123"
            )
        ]
        
        for view in recently_viewed:
            db.add(view)
        db.commit()
        
        # Create product questions
        questions = [
            ProductQuestion(
                product_id=1,
                user_id="user_456",
                question="Does this come with a charger?",
                is_answered=True,
                answered_at=datetime.now()
            ),
            ProductQuestion(
                product_id=1,
                user_id="user_789",
                question="What colors are available?",
                is_answered=False
            ),
            ProductQuestion(
                product_id=2,
                user_id="user_101",
                question="Can I upgrade the RAM later?",
                is_answered=True,
                answered_at=datetime.now()
            )
        ]
        
        for question in questions:
            db.add(question)
        db.commit()
        
        # Create product answers
        answers = [
            ProductAnswer(
                question_id=1,
                answer="No, the iPhone 15 Pro Max does not come with a charger. You'll need to purchase one separately or use an existing USB-C charger.",
                answered_by="Apple Support",
                helpful_votes=12,
                is_verified=True
            ),
            ProductAnswer(
                question_id=3,
                answer="No, the RAM in MacBook Air M2 is unified memory and cannot be upgraded after purchase. Choose the configuration you need when buying.",
                answered_by="Apple Support",
                helpful_votes=8,
                is_verified=True
            )
        ]
        
        for answer in answers:
            db.add(answer)
        db.commit()
        
        logger.info("Sample marketplace data created successfully")
        
    except Exception as e:
        logger.error(f"Error creating sample data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
    create_sample_data()
