import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func, text
from app.cache import redis_cache

logger = structlog.get_logger()

class SearchService:
    """Full-text search service with indexing and suggestions"""
    
    def __init__(self):
        self.search_index_enabled = os.getenv("SEARCH_INDEX_ENABLED", "true").lower() == "true"
    
    async def search(
        self,
        db: Session,
        query: str,
        module: Optional[str] = None,
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Perform full-text search"""
        try:
            # Check cache
            cache_key = f"search_{hash(query)}_{module}_{limit}_{offset}"
            cached = await redis_cache.get_cache(cache_key)
            if cached:
                return cached
            
            results = []
            
            # Search across modules
            if not module or module == "finance":
                finance_results = await self._search_finance(db, query, filters, limit)
                results.extend(finance_results)
            
            if not module or module == "marketplace":
                marketplace_results = await self._search_marketplace(db, query, filters, limit)
                results.extend(marketplace_results)
            
            if not module or module == "social":
                social_results = await self._search_social(db, query, filters, limit)
                results.extend(social_results)
            
            # Sort by relevance
            results.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
            results = results[:limit]
            
            response = {
                "success": True,
                "query": query,
                "results": results,
                "total": len(results),
                "limit": limit,
                "offset": offset
            }
            
            await redis_cache.set_cache(cache_key, response, expire=300)  # 5 minutes
            return response
            
        except Exception as e:
            logger.error(f"Error performing search: {e}")
            return {"success": False, "message": f"Error: {str(e)}"}
    
    async def _search_finance(
        self,
        db: Session,
        query: str,
        filters: Optional[Dict[str, Any]],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Search finance data"""
        try:
            from app.models.data_models import FinanceTransaction
            
            # Simple text search
            results = db.query(FinanceTransaction).filter(
                or_(
                    FinanceTransaction.description.contains(query),
                    FinanceTransaction.category.contains(query)
                )
            ).limit(limit).all()
            
            return [
                {
                    "type": "finance",
                    "id": r.id,
                    "title": r.description,
                    "content": f"{r.category} - ${r.amount}",
                    "relevance_score": 0.8,
                    "module": "finance"
                }
                for r in results
            ]
            
        except Exception as e:
            logger.error(f"Error searching finance: {e}")
            return []
    
    async def _search_marketplace(
        self,
        db: Session,
        query: str,
        filters: Optional[Dict[str, Any]],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Search marketplace data"""
        try:
            from app.models.marketplace_db import Product
            
            results = db.query(Product).filter(
                or_(
                    Product.name.contains(query),
                    Product.description.contains(query)
                )
            ).limit(limit).all()
            
            return [
                {
                    "type": "product",
                    "id": r.id,
                    "title": r.name,
                    "content": r.description[:200] if r.description else "",
                    "relevance_score": 0.9,
                    "module": "marketplace"
                }
                for r in results
            ]
            
        except Exception as e:
            logger.error(f"Error searching marketplace: {e}")
            return []
    
    async def _search_social(
        self,
        db: Session,
        query: str,
        filters: Optional[Dict[str, Any]],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Search social data"""
        try:
            from app.models.social_db import Post
            
            results = db.query(Post).filter(
                and_(
                    Post.content.contains(query),
                    Post.is_deleted == False
                )
            ).limit(limit).all()
            
            return [
                {
                    "type": "post",
                    "id": r.id,
                    "title": r.content[:100] if r.content else "",
                    "content": r.content[:200] if r.content else "",
                    "relevance_score": 0.85,
                    "module": "social"
                }
                for r in results
            ]
            
        except Exception as e:
            logger.error(f"Error searching social: {e}")
            return []
    
    async def get_search_suggestions(
        self,
        query: str,
        limit: int = 5
    ) -> List[str]:
        """Get search suggestions"""
        try:
            # In production, use search history and popular queries
            suggestions = [
                f"{query} finance",
                f"{query} marketplace",
                f"{query} fitness",
                f"{query} travel"
            ]
            
            return suggestions[:limit]
            
        except Exception as e:
            logger.error(f"Error getting suggestions: {e}")
            return []
    
    async def track_search(
        self,
        query: str,
        results_count: int,
        module: Optional[str] = None
    ):
        """Track search analytics"""
        try:
            search_key = f"search_analytics_{datetime.utcnow().strftime('%Y%m%d')}"
            analytics = await redis_cache.get_cache(search_key) or {
                "total_searches": 0,
                "queries": {},
                "modules": {}
            }
            
            analytics["total_searches"] += 1
            analytics["queries"][query] = analytics["queries"].get(query, 0) + 1
            if module:
                analytics["modules"][module] = analytics["modules"].get(module, 0) + 1
            
            await redis_cache.set_cache(search_key, analytics, expire=86400)
            
        except Exception as e:
            logger.error(f"Error tracking search: {e}")

# Global service instance
search_service = SearchService()

