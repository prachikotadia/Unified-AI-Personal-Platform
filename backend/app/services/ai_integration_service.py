import os
import json
import time
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import structlog
from app.cache import redis_cache

logger = structlog.get_logger()

# OpenAI imports
try:
    import openai
    from openai import AsyncOpenAI
except ImportError:
    openai = None
    AsyncOpenAI = None

class AIIntegrationService:
    """Enhanced AI integration service with caching, rate limiting, and cost tracking"""
    
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.openai_client = None
        
        if self.openai_api_key and AsyncOpenAI:
            self.openai_client = AsyncOpenAI(api_key=self.openai_api_key)
        
        # Rate limiting configuration
        self.rate_limits = {
            "requests_per_minute": 60,
            "requests_per_hour": 1000,
            "tokens_per_minute": 90000,
            "tokens_per_hour": 1000000
        }
        
        # Cost tracking (per 1K tokens)
        self.cost_per_token = {
            "gpt-4": {"input": 0.03, "output": 0.06},
            "gpt-4-turbo": {"input": 0.01, "output": 0.03},
            "gpt-3.5-turbo": {"input": 0.0015, "output": 0.002}
        }
        
        # Request tracking
        self.request_counts = defaultdict(int)
        self.token_usage = defaultdict(int)
        self.cost_tracking = defaultdict(float)
    
    async def generate_response(
        self,
        prompt: str,
        model: str = "gpt-4",
        temperature: float = 0.7,
        max_tokens: int = 1000,
        cache_key: Optional[str] = None,
        module: str = "general"
    ) -> Dict[str, Any]:
        """Generate AI response with caching and rate limiting"""
        try:
            # Check cache first
            if cache_key:
                cached = await redis_cache.get_cache(cache_key)
                if cached:
                    logger.info(f"Cache hit for {cache_key}")
                    return {
                        "success": True,
                        "response": cached,
                        "cached": True,
                        "cost": 0
                    }
            
            # Check rate limits
            rate_limit_check = await self._check_rate_limits(module)
            if not rate_limit_check["allowed"]:
                return {
                    "success": False,
                    "message": rate_limit_check["message"],
                    "retry_after": rate_limit_check.get("retry_after")
                }
            
            # Generate response
            if not self.openai_client:
                # Mock response for development
                return {
                    "success": True,
                    "response": f"Mock AI response for: {prompt[:50]}...",
                    "cached": False,
                    "model": model,
                    "cost": 0
                }
            
            start_time = time.time()
            
            try:
                response = await self.openai_client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                
                response_text = response.choices[0].message.content
                usage = response.usage
                
                # Calculate cost
                cost = self._calculate_cost(model, usage.prompt_tokens, usage.completion_tokens)
                
                # Track usage
                await self._track_usage(module, usage.prompt_tokens + usage.completion_tokens, cost)
                
                # Cache response
                if cache_key:
                    await redis_cache.set_cache(cache_key, response_text, expire=3600)
                
                return {
                    "success": True,
                    "response": response_text,
                    "cached": False,
                    "model": model,
                    "tokens_used": usage.total_tokens,
                    "cost": cost,
                    "latency": time.time() - start_time
                }
                
            except openai.RateLimitError as e:
                logger.error(f"OpenAI rate limit error: {e}")
                return {
                    "success": False,
                    "message": "Rate limit exceeded. Please try again later.",
                    "retry_after": 60
                }
            except openai.APIError as e:
                logger.error(f"OpenAI API error: {e}")
                return {
                    "success": False,
                    "message": f"AI service error: {str(e)}"
                }
                
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }
    
    async def _check_rate_limits(self, module: str) -> Dict[str, Any]:
        """Check if request is within rate limits"""
        try:
            now = datetime.utcnow()
            minute_key = f"ai_rate_{module}_{now.strftime('%Y%m%d%H%M')}"
            hour_key = f"ai_rate_{module}_{now.strftime('%Y%m%d%H')}"
            
            # Check requests per minute
            minute_count = await redis_cache.get_cache(minute_key) or 0
            if minute_count >= self.rate_limits["requests_per_minute"]:
                return {
                    "allowed": False,
                    "message": "Rate limit exceeded: too many requests per minute",
                    "retry_after": 60
                }
            
            # Check requests per hour
            hour_count = await redis_cache.get_cache(hour_key) or 0
            if hour_count >= self.rate_limits["requests_per_hour"]:
                return {
                    "allowed": False,
                    "message": "Rate limit exceeded: too many requests per hour",
                    "retry_after": 3600
                }
            
            # Increment counters
            await redis_cache.set_cache(minute_key, minute_count + 1, expire=60)
            await redis_cache.set_cache(hour_key, hour_count + 1, expire=3600)
            
            return {"allowed": True}
            
        except Exception as e:
            logger.error(f"Error checking rate limits: {e}")
            return {"allowed": True}  # Allow on error
    
    def _calculate_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """Calculate cost for API call"""
        if model not in self.cost_per_token:
            model = "gpt-4"  # Default
        
        costs = self.cost_per_token[model]
        input_cost = (input_tokens / 1000) * costs["input"]
        output_cost = (output_tokens / 1000) * costs["output"]
        
        return input_cost + output_cost
    
    async def _track_usage(self, module: str, tokens: int, cost: float):
        """Track AI usage and costs"""
        try:
            today = datetime.utcnow().strftime("%Y%m%d")
            usage_key = f"ai_usage_{module}_{today}"
            cost_key = f"ai_cost_{module}_{today}"
            
            current_usage = await redis_cache.get_cache(usage_key) or 0
            current_cost = await redis_cache.get_cache(cost_key) or 0.0
            
            await redis_cache.set_cache(usage_key, current_usage + tokens, expire=86400)
            await redis_cache.set_cache(cost_key, current_cost + cost, expire=86400)
            
        except Exception as e:
            logger.error(f"Error tracking usage: {e}")
    
    async def get_usage_stats(
        self,
        module: Optional[str] = None,
        date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get AI usage statistics"""
        try:
            if not date:
                date = datetime.utcnow().strftime("%Y%m%d")
            
            if module:
                modules = [module]
            else:
                modules = ["finance", "fitness", "travel", "marketplace", "social", "chat", "general"]
            
            stats = {}
            total_tokens = 0
            total_cost = 0.0
            
            for mod in modules:
                usage_key = f"ai_usage_{mod}_{date}"
                cost_key = f"ai_cost_{mod}_{date}"
                
                tokens = await redis_cache.get_cache(usage_key) or 0
                cost = await redis_cache.get_cache(cost_key) or 0.0
                
                stats[mod] = {
                    "tokens": tokens,
                    "cost": cost
                }
                
                total_tokens += tokens
                total_cost += cost
            
            return {
                "date": date,
                "modules": stats,
                "total_tokens": total_tokens,
                "total_cost": total_cost
            }
            
        except Exception as e:
            logger.error(f"Error getting usage stats: {e}")
            return {}

# Global service instance
ai_integration_service = AIIntegrationService()

