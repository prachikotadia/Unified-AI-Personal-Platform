from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Dict, Any, Optional
import structlog
from app.services.search_service import search_service

logger = structlog.get_logger()
router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/products")
async def search_products(
    q: str = Query("", description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    subcategory: Optional[str] = Query(None, description="Filter by subcategory"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    min_rating: Optional[float] = Query(None, description="Minimum rating"),
    in_stock: Optional[bool] = Query(None, description="In stock only"),
    featured: Optional[bool] = Query(None, description="Featured products only"),
    deals: Optional[bool] = Query(None, description="Deal products only"),
    trending: Optional[bool] = Query(None, description="Trending products only"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    sort_by: str = Query("relevance", description="Sort by: relevance, price, rating, created_at, view_count"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    use_cache: bool = Query(True, description="Use cached results")
):
    """Search products with advanced filtering and sorting"""
    try:
        # Build filters
        filters = {}
        if category:
            filters["category"] = category
        if subcategory:
            filters["subcategory"] = subcategory
        if brand:
            filters["brand"] = brand
        if min_price is not None:
            filters["min_price"] = min_price
        if max_price is not None:
            filters["max_price"] = max_price
        if min_rating is not None:
            filters["min_rating"] = min_rating
        if in_stock is not None:
            filters["in_stock"] = in_stock
        if featured is not None:
            filters["featured"] = featured
        if deals is not None:
            filters["deals"] = deals
        if trending is not None:
            filters["trending"] = trending
        if tags:
            filters["tags"] = tags
        
        results = await search_service.search_products(
            query=q,
            filters=filters,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            size=size,
            use_cache=use_cache
        )
        
        return results
        
    except Exception as e:
        logger.error(f"Error searching products: {e}")
        raise HTTPException(status_code=500, detail="Search failed")

@router.get("/suggestions")
async def get_search_suggestions(
    q: str = Query(..., description="Search query for suggestions"),
    size: int = Query(5, ge=1, le=20, description="Number of suggestions")
):
    """Get search suggestions based on query"""
    try:
        suggestions = await search_service.get_suggestions(q, size)
        return {"suggestions": suggestions}
        
    except Exception as e:
        logger.error(f"Error getting suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get suggestions")

@router.get("/popular")
async def get_popular_searches(
    days: int = Query(7, ge=1, le=30, description="Number of days to look back"),
    size: int = Query(10, ge=1, le=50, description="Number of popular searches")
):
    """Get popular search terms"""
    try:
        popular = await search_service.get_popular_searches(days, size)
        return {"popular_searches": popular}
        
    except Exception as e:
        logger.error(f"Error getting popular searches: {e}")
        raise HTTPException(status_code=500, detail="Failed to get popular searches")

@router.get("/analytics")
async def get_search_analytics(
    q: Optional[str] = Query(None, description="Filter by specific query"),
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze")
):
    """Get search analytics"""
    try:
        analytics = await search_service.get_search_analytics(q, days)
        return analytics
        
    except Exception as e:
        logger.error(f"Error getting search analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get search analytics")

@router.post("/index/product")
async def index_product(product: Dict[str, Any]):
    """Index a product in search"""
    try:
        success = await search_service.index_product(product)
        if success:
            return {"message": "Product indexed successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to index product")
            
    except Exception as e:
        logger.error(f"Error indexing product: {e}")
        raise HTTPException(status_code=500, detail="Failed to index product")

@router.delete("/index/product/{product_id}")
async def delete_product_from_index(product_id: int):
    """Delete a product from search index"""
    try:
        success = await search_service.delete_product(product_id)
        if success:
            return {"message": "Product deleted from index successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete product from index")
            
    except Exception as e:
        logger.error(f"Error deleting product from index: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete product from index")

@router.post("/reindex")
async def reindex_all_products(products: List[Dict[str, Any]]):
    """Reindex all products (bulk operation)"""
    try:
        success = await search_service.reindex_all_products(products)
        if success:
            return {"message": f"Successfully reindexed {len(products)} products"}
        else:
            raise HTTPException(status_code=500, detail="Failed to reindex products")
            
    except Exception as e:
        logger.error(f"Error reindexing products: {e}")
        raise HTTPException(status_code=500, detail="Failed to reindex products")
