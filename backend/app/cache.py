import json
import os
from dotenv import load_dotenv
from typing import Optional, Any, Dict
import structlog

# Optional Redis imports
try:
    import redis
    import aioredis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    print("Warning: Redis not available. Running without caching.")

load_dotenv()

logger = structlog.get_logger()

class RedisCache:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.redis_client = None
        self.aioredis_client = None
        self.redis_available = REDIS_AVAILABLE
        
    async def connect(self):
        """Connect to Redis"""
        if not self.redis_available:
            logger.warning("Redis not available. Running without caching.")
            return
            
        try:
            self.redis_client = redis.from_url(self.redis_url)
            self.aioredis_client = aioredis.from_url(self.redis_url)
            # Test connection
            await self.aioredis_client.ping()
            logger.info("Connected to Redis successfully")
        except Exception as e:
            logger.warning(f"Redis not available: {e}. Running without caching.")
            self.redis_client = None
            self.aioredis_client = None
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.aioredis_client:
            await self.aioredis_client.close()
        if self.redis_client:
            self.redis_client.close()
    
    async def set(self, key: str, value: Any, expire: int = 3600):
        """Set a key-value pair with expiration"""
        if not self.redis_available or not self.aioredis_client:
            return
        try:
            serialized_value = json.dumps(value)
            await self.aioredis_client.set(key, serialized_value, ex=expire)
        except Exception as e:
            logger.error(f"Error setting Redis key {key}: {e}")
    
    async def get(self, key: str) -> Optional[Any]:
        """Get a value by key"""
        if not self.redis_available or not self.aioredis_client:
            return None
        try:
            value = await self.aioredis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Error getting Redis key {key}: {e}")
            return None
    
    async def delete(self, key: str):
        """Delete a key"""
        if not self.redis_available or not self.aioredis_client:
            return
        try:
            await self.aioredis_client.delete(key)
        except Exception as e:
            logger.error(f"Error deleting Redis key {key}: {e}")
    
    async def exists(self, key: str) -> bool:
        """Check if key exists"""
        if not self.redis_available or not self.aioredis_client:
            return False
        try:
            return await self.aioredis_client.exists(key)
        except Exception as e:
            logger.error(f"Error checking Redis key {key}: {e}")
            return False
    
    async def set_session(self, session_id: str, user_data: Dict[str, Any], expire: int = 86400):
        """Set user session data"""
        key = f"session:{session_id}"
        await self.set(key, user_data, expire)
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get user session data"""
        key = f"session:{session_id}"
        return await self.get(key)
    
    async def delete_session(self, session_id: str):
        """Delete user session"""
        key = f"session:{session_id}"
        await self.delete(key)
    
    async def set_cache(self, cache_key: str, data: Any, expire: int = 1800):
        """Set cache data"""
        key = f"cache:{cache_key}"
        await self.set(key, data, expire)
    
    async def get_cache(self, cache_key: str) -> Optional[Any]:
        """Get cache data"""
        key = f"cache:{cache_key}"
        return await self.get(key)
    
    async def invalidate_cache(self, pattern: str):
        """Invalidate cache by pattern"""
        if not self.redis_available or not self.aioredis_client:
            return
        try:
            keys = await self.aioredis_client.keys(f"cache:{pattern}")
            if keys:
                await self.aioredis_client.delete(*keys)
        except Exception as e:
            logger.error(f"Error invalidating cache pattern {pattern}: {e}")

# Global Redis cache instance
redis_cache = RedisCache()
