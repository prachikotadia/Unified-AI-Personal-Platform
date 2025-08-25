import os
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
import structlog
from elasticsearch import Elasticsearch, NotFoundError
from elasticsearch_dsl import Search, Q, A
from elasticsearch_dsl.query import MultiMatch, Match, Range, Bool, Term, Terms
from elasticsearch_dsl.connections import connections
import redis
import hashlib

logger = structlog.get_logger()

class SearchService:
    def __init__(self):
        # Elasticsearch configuration
        self.es_host = os.getenv("ELASTICSEARCH_HOST", "localhost")
        self.es_port = int(os.getenv("ELASTICSEARCH_PORT", "9200"))
        self.es_index = os.getenv("ELASTICSEARCH_INDEX", "marketplace")
        
        # Redis for caching
        self.redis_host = os.getenv("REDIS_HOST", "localhost")
        self.redis_port = int(os.getenv("REDIS_PORT", "6379"))
        self.redis_db = int(os.getenv("REDIS_DB", "0"))
        
        # Initialize connections
        self._init_elasticsearch()
        self._init_redis()
        
        # Search configuration
        self.max_results = 1000
        self.default_size = 20
        
    def _init_elasticsearch(self):
        """Initialize Elasticsearch connection"""
        try:
            self.es = Elasticsearch([{
                'host': self.es_host,
                'port': self.es_port,
                'scheme': 'http'
            }])
            
            # Test connection
            if self.es.ping():
                logger.info("Elasticsearch connection successful")
                self._create_index_if_not_exists()
            else:
                logger.error("Elasticsearch connection failed")
                self.es = None
                
        except Exception as e:
            logger.error(f"Error connecting to Elasticsearch: {e}")
            self.es = None
    
    def _init_redis(self):
        """Initialize Redis connection for caching"""
        try:
            self.redis = redis.Redis(
                host=self.redis_host,
                port=self.redis_port,
                db=self.redis_db,
                decode_responses=True
            )
            
            # Test connection
            self.redis.ping()
            logger.info("Redis connection successful")
            
        except Exception as e:
            logger.error(f"Error connecting to Redis: {e}")
            self.redis = None
    
    def _create_index_if_not_exists(self):
        """Create Elasticsearch index with proper mapping if it doesn't exist"""
        if not self.es.indices.exists(index=self.es_index):
            mapping = {
                "mappings": {
                    "properties": {
                        "id": {"type": "integer"},
                        "name": {
                            "type": "text",
                            "analyzer": "standard",
                            "fields": {
                                "keyword": {"type": "keyword"},
                                "suggest": {"type": "completion"}
                            }
                        },
                        "description": {
                            "type": "text",
                            "analyzer": "standard"
                        },
                        "brand": {
                            "type": "text",
                            "analyzer": "standard",
                            "fields": {
                                "keyword": {"type": "keyword"}
                            }
                        },
                        "category": {
                            "type": "keyword"
                        },
                        "subcategory": {
                            "type": "keyword"
                        },
                        "price": {"type": "float"},
                        "original_price": {"type": "float"},
                        "discount_percentage": {"type": "float"},
                        "rating": {"type": "float"},
                        "review_count": {"type": "integer"},
                        "stock_quantity": {"type": "integer"},
                        "is_featured": {"type": "boolean"},
                        "is_deal": {"type": "boolean"},
                        "is_trending": {"type": "boolean"},
                        "tags": {"type": "keyword"},
                        "features": {"type": "text"},
                        "specifications": {"type": "object"},
                        "created_at": {"type": "date"},
                        "updated_at": {"type": "date"},
                        "view_count": {"type": "integer"},
                        "search_score": {"type": "float"}
                    }
                },
                "settings": {
                    "analysis": {
                        "analyzer": {
                            "product_analyzer": {
                                "type": "custom",
                                "tokenizer": "standard",
                                "filter": ["lowercase", "stop", "snowball"]
                            }
                        }
                    }
                }
            }
            
            self.es.indices.create(index=self.es_index, body=mapping)
            logger.info(f"Created Elasticsearch index: {self.es_index}")
    
    def _get_cache_key(self, search_params: Dict[str, Any]) -> str:
        """Generate cache key for search parameters"""
        cache_data = json.dumps(search_params, sort_keys=True)
        return f"search:{hashlib.md5(cache_data.encode()).hexdigest()}"
    
    def _get_cached_results(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached search results"""
        if not self.redis:
            return None
        
        try:
            cached = self.redis.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception as e:
            logger.error(f"Error getting cached results: {e}")
        
        return None
    
    def _cache_results(self, cache_key: str, results: Dict[str, Any], ttl: int = 300):
        """Cache search results"""
        if not self.redis:
            return
        
        try:
            self.redis.setex(cache_key, ttl, json.dumps(results))
        except Exception as e:
            logger.error(f"Error caching results: {e}")
    
    async def index_product(self, product: Dict[str, Any]) -> bool:
        """Index a product in Elasticsearch"""
        if not self.es:
            return False
        
        try:
            # Prepare document for indexing
            doc = {
                "id": product["id"],
                "name": product["name"],
                "description": product.get("description", ""),
                "brand": product.get("brand", ""),
                "category": product.get("category", ""),
                "subcategory": product.get("subcategory", ""),
                "price": float(product.get("price", 0)),
                "original_price": float(product.get("original_price", 0)),
                "discount_percentage": float(product.get("discount_percentage", 0)),
                "rating": float(product.get("rating", 0)),
                "review_count": int(product.get("review_count", 0)),
                "stock_quantity": int(product.get("stock_quantity", 0)),
                "is_featured": bool(product.get("is_featured", False)),
                "is_deal": bool(product.get("is_deal", False)),
                "is_trending": bool(product.get("is_trending", False)),
                "tags": product.get("tags", []),
                "features": " ".join(product.get("features", [])),
                "specifications": product.get("specifications", {}),
                "created_at": product.get("created_at"),
                "updated_at": product.get("updated_at"),
                "view_count": int(product.get("view_count", 0))
            }
            
            # Index the document
            self.es.index(index=self.es_index, id=product["id"], body=doc)
            logger.info(f"Indexed product {product['id']}")
            return True
            
        except Exception as e:
            logger.error(f"Error indexing product {product.get('id')}: {e}")
            return False
    
    async def search_products(
        self,
        query: str = "",
        filters: Dict[str, Any] = None,
        sort_by: str = "relevance",
        sort_order: str = "desc",
        page: int = 1,
        size: int = None,
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """Search products with advanced filtering and sorting"""
        if not self.es:
            return {"products": [], "total": 0, "page": page, "size": size or self.default_size}
        
        # Prepare search parameters
        search_params = {
            "query": query,
            "filters": filters or {},
            "sort_by": sort_by,
            "sort_order": sort_order,
            "page": page,
            "size": size or self.default_size
        }
        
        # Check cache
        if use_cache:
            cache_key = self._get_cache_key(search_params)
            cached_results = self._get_cached_results(cache_key)
            if cached_results:
                logger.info("Returning cached search results")
                return cached_results
        
        try:
            # Build search query
            s = Search(using=self.es, index=self.es_index)
            
            # Add query
            if query:
                # Multi-field search with boosting
                q = MultiMatch(
                    query=query,
                    fields=[
                        "name^3",  # Name has highest weight
                        "brand^2",  # Brand has medium weight
                        "description^1.5",  # Description has medium weight
                        "features^1",  # Features have lower weight
                        "tags^1"  # Tags have lower weight
                    ],
                    type="best_fields",
                    fuzziness="AUTO"
                )
                s = s.query(q)
            else:
                # Match all if no query
                s = s.query("match_all")
            
            # Add filters
            if filters:
                bool_query = Bool()
                
                # Category filter
                if filters.get("category"):
                    bool_query.must(Term(category=filters["category"]))
                
                # Subcategory filter
                if filters.get("subcategory"):
                    bool_query.must(Term(subcategory=filters["subcategory"]))
                
                # Brand filter
                if filters.get("brand"):
                    bool_query.must(Term(brand__keyword=filters["brand"]))
                
                # Price range filter
                if filters.get("min_price") or filters.get("max_price"):
                    price_range = {}
                    if filters.get("min_price"):
                        price_range["gte"] = float(filters["min_price"])
                    if filters.get("max_price"):
                        price_range["lte"] = float(filters["max_price"])
                    bool_query.must(Range(price=price_range))
                
                # Rating filter
                if filters.get("min_rating"):
                    bool_query.must(Range(rating={"gte": float(filters["min_rating"])}))
                
                # Stock filter
                if filters.get("in_stock"):
                    bool_query.must(Range(stock_quantity={"gt": 0}))
                
                # Featured/Deal/Trending filters
                if filters.get("featured"):
                    bool_query.must(Term(is_featured=True))
                if filters.get("deals"):
                    bool_query.must(Term(is_deal=True))
                if filters.get("trending"):
                    bool_query.must(Term(is_trending=True))
                
                # Tags filter
                if filters.get("tags"):
                    bool_query.must(Terms(tags=filters["tags"]))
                
                s = s.query(bool_query)
            
            # Add sorting
            if sort_by == "price":
                s = s.sort({"price": {"order": sort_order}})
            elif sort_by == "rating":
                s = s.sort({"rating": {"order": sort_order}})
            elif sort_by == "created_at":
                s = s.sort({"created_at": {"order": sort_order}})
            elif sort_by == "view_count":
                s = s.sort({"view_count": {"order": sort_order}})
            elif sort_by == "relevance" and query:
                # Relevance sorting is handled by Elasticsearch scoring
                pass
            else:
                # Default sorting by created_at
                s = s.sort({"created_at": {"order": "desc"}})
            
            # Add pagination
            from_value = (page - 1) * (size or self.default_size)
            s = s[from_value:from_value + (size or self.default_size)]
            
            # Add aggregations for faceted search
            s.aggs.bucket("categories", A("terms", field="category", size=20))
            s.aggs.bucket("brands", A("terms", field="brand.keyword", size=20))
            s.aggs.bucket("price_ranges", A("range", field="price", ranges=[
                {"to": 50},
                {"from": 50, "to": 100},
                {"from": 100, "to": 200},
                {"from": 200, "to": 500},
                {"from": 500}
            ]))
            s.aggs.bucket("ratings", A("range", field="rating", ranges=[
                {"from": 4.5},
                {"from": 4.0, "to": 4.5},
                {"from": 3.5, "to": 4.0},
                {"from": 3.0, "to": 3.5},
                {"to": 3.0}
            ]))
            
            # Execute search
            response = s.execute()
            
            # Process results
            products = []
            for hit in response:
                product = hit.to_dict()
                product["_score"] = hit.meta.score
                products.append(product)
            
            # Process aggregations
            aggregations = {}
            if hasattr(response, 'aggregations'):
                for agg_name, agg_data in response.aggregations.to_dict().items():
                    aggregations[agg_name] = agg_data
            
            results = {
                "products": products,
                "total": response.hits.total.value,
                "page": page,
                "size": size or self.default_size,
                "pages": (response.hits.total.value + (size or self.default_size) - 1) // (size or self.default_size),
                "aggregations": aggregations,
                "query": query,
                "filters": filters
            }
            
            # Cache results
            if use_cache:
                cache_key = self._get_cache_key(search_params)
                self._cache_results(cache_key, results)
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching products: {e}")
            return {"products": [], "total": 0, "page": page, "size": size or self.default_size}
    
    async def get_suggestions(self, query: str, size: int = 5) -> List[str]:
        """Get search suggestions based on query"""
        if not self.es or not query:
            return []
        
        try:
            s = Search(using=self.es, index=self.es_index)
            
            # Search in name and brand fields
            q = MultiMatch(
                query=query,
                fields=["name^2", "brand"],
                type="phrase_prefix"
            )
            
            s = s.query(q)
            s = s[0:size]
            
            response = s.execute()
            
            suggestions = []
            for hit in response:
                suggestions.append(hit.name)
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Error getting suggestions: {e}")
            return []
    
    async def get_popular_searches(self, days: int = 7, size: int = 10) -> List[Dict[str, Any]]:
        """Get popular search terms"""
        if not self.es:
            return []
        
        try:
            # This would require storing search queries in a separate index
            # For now, return empty list
            return []
            
        except Exception as e:
            logger.error(f"Error getting popular searches: {e}")
            return []
    
    async def get_search_analytics(self, query: str = None, days: int = 30) -> Dict[str, Any]:
        """Get search analytics"""
        if not self.es:
            return {}
        
        try:
            s = Search(using=self.es, index=self.es_index)
            
            # Add date range filter
            if days:
                s = s.filter("range", created_at={"gte": f"now-{days}d"})
            
            # Add query filter
            if query:
                s = s.query("match", name=query)
            
            # Add aggregations
            s.aggs.bucket("daily_searches", A("date_histogram", field="created_at", interval="day"))
            s.aggs.bucket("top_categories", A("terms", field="category", size=10))
            s.aggs.bucket("top_brands", A("terms", field="brand.keyword", size=10))
            
            response = s.execute()
            
            analytics = {
                "total_searches": response.hits.total.value,
                "daily_trends": [],
                "top_categories": [],
                "top_brands": []
            }
            
            if hasattr(response, 'aggregations'):
                # Process daily trends
                if "daily_searches" in response.aggregations:
                    for bucket in response.aggregations.daily_searches.buckets:
                        analytics["daily_trends"].append({
                            "date": bucket.key_as_string,
                            "count": bucket.doc_count
                        })
                
                # Process top categories
                if "top_categories" in response.aggregations:
                    for bucket in response.aggregations.top_categories.buckets:
                        analytics["top_categories"].append({
                            "category": bucket.key,
                            "count": bucket.doc_count
                        })
                
                # Process top brands
                if "top_brands" in response.aggregations:
                    for bucket in response.aggregations.top_brands.buckets:
                        analytics["top_brands"].append({
                            "brand": bucket.key,
                            "count": bucket.doc_count
                        })
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error getting search analytics: {e}")
            return {}
    
    async def reindex_all_products(self, products: List[Dict[str, Any]]) -> bool:
        """Reindex all products (for bulk operations)"""
        if not self.es:
            return False
        
        try:
            # Delete existing index
            if self.es.indices.exists(index=self.es_index):
                self.es.indices.delete(index=self.es_index)
            
            # Recreate index
            self._create_index_if_not_exists()
            
            # Bulk index products
            actions = []
            for product in products:
                action = {
                    "_index": self.es_index,
                    "_id": product["id"],
                    "_source": {
                        "id": product["id"],
                        "name": product["name"],
                        "description": product.get("description", ""),
                        "brand": product.get("brand", ""),
                        "category": product.get("category", ""),
                        "subcategory": product.get("subcategory", ""),
                        "price": float(product.get("price", 0)),
                        "original_price": float(product.get("original_price", 0)),
                        "discount_percentage": float(product.get("discount_percentage", 0)),
                        "rating": float(product.get("rating", 0)),
                        "review_count": int(product.get("review_count", 0)),
                        "stock_quantity": int(product.get("stock_quantity", 0)),
                        "is_featured": bool(product.get("is_featured", False)),
                        "is_deal": bool(product.get("is_deal", False)),
                        "is_trending": bool(product.get("is_trending", False)),
                        "tags": product.get("tags", []),
                        "features": " ".join(product.get("features", [])),
                        "specifications": product.get("specifications", {}),
                        "created_at": product.get("created_at"),
                        "updated_at": product.get("updated_at"),
                        "view_count": int(product.get("view_count", 0))
                    }
                }
                actions.append(action)
            
            # Bulk index
            from elasticsearch.helpers import bulk
            success, failed = bulk(self.es, actions, refresh=True)
            
            logger.info(f"Reindexed {success} products, {len(failed)} failed")
            return len(failed) == 0
            
        except Exception as e:
            logger.error(f"Error reindexing products: {e}")
            return False
    
    async def delete_product(self, product_id: int) -> bool:
        """Delete a product from the search index"""
        if not self.es:
            return False
        
        try:
            self.es.delete(index=self.es_index, id=product_id)
            logger.info(f"Deleted product {product_id} from search index")
            return True
            
        except NotFoundError:
            logger.warning(f"Product {product_id} not found in search index")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting product {product_id}: {e}")
            return False

# Global search service instance
search_service = SearchService()
