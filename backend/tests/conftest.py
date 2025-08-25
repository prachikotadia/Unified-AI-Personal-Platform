import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import tempfile
import shutil

# Import your FastAPI app
from main import app

# Test database configuration
TEST_DATABASE_URL = "sqlite:///./test_omnilife.db"

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
def test_database():
    """Create a test database."""
    engine = create_engine(TEST_DATABASE_URL)
    
    # Create all tables
    from app.database import Base
    Base.metadata.create_all(bind=engine)
    
    yield engine
    
    # Clean up
    engine.dispose()
    if os.path.exists("./test_omnilife.db"):
        os.remove("./test_omnilife.db")

@pytest.fixture
def db_session(test_database):
    """Create a database session for testing."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_database)
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def sample_user():
    """Sample user data for testing."""
    return {
        "id": "test_user_123",
        "username": "testuser",
        "email": "test@example.com",
        "full_name": "Test User"
    }

@pytest.fixture
def sample_product():
    """Sample product data for testing."""
    return {
        "id": 1,
        "name": "Test Product",
        "description": "A test product for testing",
        "price": 99.99,
        "category": "Electronics",
        "brand": "TestBrand",
        "stock_quantity": 10,
        "rating": 4.5,
        "review_count": 25
    }

@pytest.fixture
def sample_order():
    """Sample order data for testing."""
    return {
        "id": "order_123",
        "user_id": "test_user_123",
        "total_amount": 199.98,
        "status": "pending",
        "items": [
            {
                "product_id": 1,
                "quantity": 2,
                "price": 99.99
            }
        ]
    }

@pytest.fixture
def mock_redis():
    """Mock Redis for testing."""
    class MockRedis:
        def __init__(self):
            self.data = {}
        
        def set(self, key, value, ex=None):
            self.data[key] = value
            return True
        
        def get(self, key):
            return self.data.get(key)
        
        def exists(self, key):
            return key in self.data
        
        def delete(self, key):
            if key in self.data:
                del self.data[key]
                return 1
            return 0
        
        def setex(self, key, time, value):
            self.data[key] = value
            return True
        
        def lpush(self, key, value):
            if key not in self.data:
                self.data[key] = []
            self.data[key].insert(0, value)
            return len(self.data[key])
        
        def brpop(self, key, timeout=0):
            if key in self.data and self.data[key]:
                return (key, self.data[key].pop())
            return None
        
        def keys(self, pattern):
            return [k for k in self.data.keys() if pattern.replace("*", "") in k]
        
        def ping(self):
            return True
    
    return MockRedis()

@pytest.fixture
def mock_elasticsearch():
    """Mock Elasticsearch for testing."""
    class MockElasticsearch:
        def __init__(self):
            self.indices = {}
            self.documents = {}
        
        def ping(self):
            return True
        
        def indices(self):
            return self
        
        def exists(self, index):
            return index in self.indices
        
        def create(self, index, body):
            self.indices[index] = body
            return {"acknowledged": True}
        
        def index(self, index, id, body):
            if index not in self.documents:
                self.documents[index] = {}
            self.documents[index][id] = body
            return {"_id": id, "result": "created"}
        
        def search(self, index, body):
            # Mock search results
            return {
                "hits": {
                    "total": {"value": 0},
                    "hits": []
                }
            }
        
        def delete(self, index, id):
            if index in self.documents and id in self.documents[index]:
                del self.documents[index][id]
                return {"result": "deleted"}
            return {"result": "not_found"}
    
    return MockElasticsearch()

@pytest.fixture
def temp_dir():
    """Create a temporary directory for testing."""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)

# Test utilities
def create_test_user(db_session, user_data):
    """Helper function to create a test user."""
    # This would typically insert into the database
    # For now, just return the user data
    return user_data

def create_test_product(db_session, product_data):
    """Helper function to create a test product."""
    # This would typically insert into the database
    # For now, just return the product data
    return product_data

def cleanup_test_data(db_session):
    """Helper function to cleanup test data."""
    # This would typically delete test data from the database
    pass
