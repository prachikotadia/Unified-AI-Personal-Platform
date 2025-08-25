import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import json

class TestMarketplaceAPI:
    """Test cases for marketplace API endpoints."""
    
    def test_get_products(self, client):
        """Test getting products list."""
        response = client.get("/api/marketplace/products")
        assert response.status_code == 200
        
        data = response.json()
        assert "products" in data
        assert isinstance(data["products"], list)
    
    def test_get_products_with_filters(self, client):
        """Test getting products with filters."""
        response = client.get("/api/marketplace/products?category=Electronics&min_price=50&max_price=200")
        assert response.status_code == 200
        
        data = response.json()
        assert "products" in data
    
    def test_get_product_by_id(self, client):
        """Test getting a specific product."""
        response = client.get("/api/marketplace/products/1")
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["id"] == 1
    
    def test_get_featured_products(self, client):
        """Test getting featured products."""
        response = client.get("/api/marketplace/products/featured")
        assert response.status_code == 200
        
        data = response.json()
        assert "products" in data
        assert isinstance(data["products"], list)
    
    def test_get_deal_products(self, client):
        """Test getting deal products."""
        response = client.get("/api/marketplace/products/deals")
        assert response.status_code == 200
        
        data = response.json()
        assert "products" in data
        assert isinstance(data["products"], list)
    
    def test_get_trending_products(self, client):
        """Test getting trending products."""
        response = client.get("/api/marketplace/products/trending")
        assert response.status_code == 200
        
        data = response.json()
        assert "products" in data
        assert isinstance(data["products"], list)
    
    def test_add_to_cart(self, client):
        """Test adding item to cart."""
        cart_data = {
            "user_id": "test_user_123",
            "product_id": 1,
            "quantity": 2
        }
        
        response = client.post("/api/marketplace/cart/add", json=cart_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
    
    def test_get_cart(self, client):
        """Test getting user's cart."""
        response = client.get("/api/marketplace/cart?user_id=test_user_123")
        assert response.status_code == 200
        
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)
    
    def test_update_cart_item(self, client):
        """Test updating cart item."""
        update_data = {
            "user_id": "test_user_123",
            "product_id": 1,
            "quantity": 3
        }
        
        response = client.put("/api/marketplace/cart/update", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
    
    def test_remove_from_cart(self, client):
        """Test removing item from cart."""
        remove_data = {
            "user_id": "test_user_123",
            "product_id": 1
        }
        
        response = client.delete("/api/marketplace/cart/remove", json=remove_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
    
    def test_clear_cart(self, client):
        """Test clearing user's cart."""
        response = client.delete("/api/marketplace/cart/clear?user_id=test_user_123")
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
    
    def test_add_to_wishlist(self, client):
        """Test adding item to wishlist."""
        wishlist_data = {
            "user_id": "test_user_123",
            "product_id": 1
        }
        
        response = client.post("/api/marketplace/wishlist/add", json=wishlist_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
    
    def test_get_wishlist(self, client):
        """Test getting user's wishlist."""
        response = client.get("/api/marketplace/wishlist?user_id=test_user_123")
        assert response.status_code == 200
        
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)
    
    def test_remove_from_wishlist(self, client):
        """Test removing item from wishlist."""
        remove_data = {
            "user_id": "test_user_123",
            "product_id": 1
        }
        
        response = client.delete("/api/marketplace/wishlist/remove", json=remove_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
    
    def test_create_order(self, client):
        """Test creating an order."""
        order_data = {
            "user_id": "test_user_123",
            "items": [
                {
                    "product_id": 1,
                    "quantity": 2,
                    "price": 99.99
                }
            ],
            "shipping_address": {
                "street": "123 Test St",
                "city": "Test City",
                "state": "Test State",
                "zip_code": "12345",
                "country": "Test Country"
            },
            "billing_address": {
                "street": "123 Test St",
                "city": "Test City",
                "state": "Test State",
                "zip_code": "12345",
                "country": "Test Country"
            },
            "payment_method": "credit_card",
            "shipping_method": "standard"
        }
        
        response = client.post("/api/marketplace/orders/create", json=order_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "order_id" in data
        assert "message" in data
    
    def test_get_orders(self, client):
        """Test getting user's orders."""
        response = client.get("/api/marketplace/orders?user_id=test_user_123")
        assert response.status_code == 200
        
        data = response.json()
        assert "orders" in data
        assert isinstance(data["orders"], list)
    
    def test_get_order_by_id(self, client):
        """Test getting a specific order."""
        response = client.get("/api/marketplace/orders/order_123")
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
    
    def test_calculate_shipping(self, client):
        """Test shipping calculation."""
        shipping_data = {
            "origin_zip": "12345",
            "destination_zip": "54321",
            "weight": 2.5,
            "shipping_method": "standard"
        }
        
        response = client.post("/api/marketplace/shipping/calculate", json=shipping_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "cost" in data
        assert "estimated_days" in data
    
    def test_calculate_tax(self, client):
        """Test tax calculation."""
        tax_data = {
            "amount": 99.99,
            "state": "CA",
            "country": "US"
        }
        
        response = client.post("/api/marketplace/tax/calculate", json=tax_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "tax_amount" in data
        assert "tax_rate" in data
    
    def test_create_return(self, client):
        """Test creating a return."""
        return_data = {
            "user_id": "test_user_123",
            "order_id": "order_123",
            "items": [
                {
                    "product_id": 1,
                    "quantity": 1,
                    "reason": "defective"
                }
            ],
            "return_reason": "Product was defective"
        }
        
        response = client.post("/api/marketplace/returns/create", json=return_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "return_id" in data
        assert "message" in data
    
    def test_get_returns(self, client):
        """Test getting user's returns."""
        response = client.get("/api/marketplace/returns?user_id=test_user_123")
        assert response.status_code == 200
        
        data = response.json()
        assert "returns" in data
        assert isinstance(data["returns"], list)
    
    def test_get_loyalty_program(self, client):
        """Test getting loyalty program info."""
        response = client.get("/api/marketplace/loyalty?user_id=test_user_123")
        assert response.status_code == 200
        
        data = response.json()
        assert "points" in data
        assert "tier" in data
    
    def test_add_loyalty_points(self, client):
        """Test adding loyalty points."""
        points_data = {
            "user_id": "test_user_123",
            "points": 100,
            "reason": "purchase"
        }
        
        response = client.post("/api/marketplace/loyalty/points/add", json=points_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
    
    def test_redeem_loyalty_points(self, client):
        """Test redeeming loyalty points."""
        redeem_data = {
            "user_id": "test_user_123",
            "points": 50,
            "reason": "discount"
        }
        
        response = client.post("/api/marketplace/loyalty/points/redeem", json=redeem_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
    
    def test_get_ai_recommendations(self, client):
        """Test getting AI recommendations."""
        response = client.get("/api/marketplace/recommendations?user_id=test_user_123")
        assert response.status_code == 200
        
        data = response.json()
        assert "recommendations" in data
        assert isinstance(data["recommendations"], list)
    
    def test_create_price_alert(self, client):
        """Test creating a price alert."""
        alert_data = {
            "user_id": "test_user_123",
            "product_id": 1,
            "target_price": 79.99
        }
        
        response = client.post("/api/marketplace/price-alerts", json=alert_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "alert_id" in data
        assert "message" in data
    
    def test_get_product_reviews(self, client):
        """Test getting product reviews."""
        response = client.get("/api/marketplace/products/1/reviews")
        assert response.status_code == 200
        
        data = response.json()
        assert "reviews" in data
        assert isinstance(data["reviews"], list)
    
    def test_create_product_review(self, client):
        """Test creating a product review."""
        review_data = {
            "user_id": "test_user_123",
            "rating": 5,
            "title": "Great product!",
            "comment": "This product exceeded my expectations."
        }
        
        response = client.post("/api/marketplace/products/1/reviews", json=review_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "review_id" in data
        assert "message" in data
    
    def test_get_product_questions(self, client):
        """Test getting product questions."""
        response = client.get("/api/marketplace/products/1/questions")
        assert response.status_code == 200
        
        data = response.json()
        assert "questions" in data
        assert isinstance(data["questions"], list)
    
    def test_create_product_question(self, client):
        """Test creating a product question."""
        question_data = {
            "user_id": "test_user_123",
            "question": "What are the dimensions of this product?"
        }
        
        response = client.post("/api/marketplace/products/1/questions", json=question_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "question_id" in data
        assert "message" in data

class TestMarketplaceService:
    """Test cases for marketplace service layer."""
    
    @pytest.mark.asyncio
    async def test_get_products_service(self):
        """Test getting products from service."""
        from app.services.marketplace_service import marketplace_service
        
        products = await marketplace_service.get_products()
        assert isinstance(products, list)
    
    @pytest.mark.asyncio
    async def test_get_product_by_id_service(self):
        """Test getting product by ID from service."""
        from app.services.marketplace_service import marketplace_service
        
        product = await marketplace_service.get_product_by_id(1)
        assert product is not None
        assert product["id"] == 1
    
    @pytest.mark.asyncio
    async def test_add_to_cart_service(self):
        """Test adding to cart via service."""
        from app.services.marketplace_service import marketplace_service
        
        result = await marketplace_service.add_to_cart("test_user_123", 1, 2)
        assert result is True
    
    @pytest.mark.asyncio
    async def test_create_order_service(self):
        """Test creating order via service."""
        from app.services.marketplace_service import marketplace_service
        
        order_data = {
            "user_id": "test_user_123",
            "items": [{"product_id": 1, "quantity": 2, "price": 99.99}],
            "shipping_address": {"street": "123 Test St", "city": "Test City"},
            "billing_address": {"street": "123 Test St", "city": "Test City"},
            "payment_method": "credit_card",
            "shipping_method": "standard"
        }
        
        order_id = await marketplace_service.create_order(order_data)
        assert order_id is not None
