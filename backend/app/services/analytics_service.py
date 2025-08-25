import os
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import structlog
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import redis
import hashlib
import uuid

logger = structlog.get_logger()

class AnalyticsService:
    def __init__(self):
        # Database configuration
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./omnilife_analytics.db")
        self.engine = create_engine(self.database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        # Redis for real-time analytics
        self.redis_host = os.getenv("REDIS_HOST", "localhost")
        self.redis_port = int(os.getenv("REDIS_PORT", "6379"))
        self.redis_db = int(os.getenv("REDIS_DB", "1"))  # Use different DB for analytics
        
        # Initialize connections
        self._init_database()
        self._init_redis()
        
        # Analytics configuration
        self.session_timeout = 1800  # 30 minutes
        self.max_events_per_session = 1000
        
    def _init_database(self):
        """Initialize analytics database tables"""
        try:
            with self.engine.connect() as conn:
                # Create analytics tables
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS user_sessions (
                        id TEXT PRIMARY KEY,
                        user_id TEXT,
                        session_start TIMESTAMP,
                        session_end TIMESTAMP,
                        duration INTEGER,
                        page_views INTEGER DEFAULT 0,
                        interactions INTEGER DEFAULT 0,
                        device_type TEXT,
                        browser TEXT,
                        os TEXT,
                        ip_address TEXT,
                        user_agent TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS page_views (
                        id TEXT PRIMARY KEY,
                        session_id TEXT,
                        user_id TEXT,
                        page_url TEXT,
                        page_title TEXT,
                        referrer TEXT,
                        time_spent INTEGER,
                        scroll_depth INTEGER,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (session_id) REFERENCES user_sessions (id)
                    )
                """))
                
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS user_interactions (
                        id TEXT PRIMARY KEY,
                        session_id TEXT,
                        user_id TEXT,
                        event_type TEXT,
                        event_data JSON,
                        element_id TEXT,
                        element_class TEXT,
                        element_text TEXT,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (session_id) REFERENCES user_sessions (id)
                    )
                """))
                
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS marketplace_events (
                        id TEXT PRIMARY KEY,
                        user_id TEXT,
                        event_type TEXT,
                        product_id INTEGER,
                        category_id INTEGER,
                        search_query TEXT,
                        price_range TEXT,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        session_id TEXT,
                        FOREIGN KEY (session_id) REFERENCES user_sessions (id)
                    )
                """))
                
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS conversion_events (
                        id TEXT PRIMARY KEY,
                        user_id TEXT,
                        event_type TEXT,
                        order_id TEXT,
                        order_value DECIMAL(10,2),
                        products JSON,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        session_id TEXT,
                        FOREIGN KEY (session_id) REFERENCES user_sessions (id)
                    )
                """))
                
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS user_metrics (
                        id TEXT PRIMARY KEY,
                        user_id TEXT,
                        metric_type TEXT,
                        metric_value DECIMAL(10,2),
                        date DATE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                
                conn.commit()
                logger.info("Analytics database initialized successfully")
                
        except Exception as e:
            logger.error(f"Error initializing analytics database: {e}")
    
    def _init_redis(self):
        """Initialize Redis connection for real-time analytics"""
        try:
            self.redis = redis.Redis(
                host=self.redis_host,
                port=self.redis_port,
                db=self.redis_db,
                decode_responses=True
            )
            
            # Test connection
            self.redis.ping()
            logger.info("Redis analytics connection successful")
            
        except Exception as e:
            logger.error(f"Error connecting to Redis for analytics: {e}")
            self.redis = None
    
    def _generate_id(self) -> str:
        """Generate unique ID for analytics events"""
        return str(uuid.uuid4())
    
    async def start_session(
        self,
        user_id: str,
        device_type: str = "desktop",
        browser: str = "unknown",
        os: str = "unknown",
        ip_address: str = "unknown",
        user_agent: str = "unknown"
    ) -> str:
        """Start a new user session"""
        session_id = self._generate_id()
        
        try:
            with self.SessionLocal() as db:
                # Create session record
                db.execute(text("""
                    INSERT INTO user_sessions 
                    (id, user_id, session_start, device_type, browser, os, ip_address, user_agent)
                    VALUES (:session_id, :user_id, :session_start, :device_type, :browser, :os, :ip_address, :user_agent)
                """), {
                    "session_id": session_id,
                    "user_id": user_id,
                    "session_start": datetime.utcnow(),
                    "device_type": device_type,
                    "browser": browser,
                    "os": os,
                    "ip_address": ip_address,
                    "user_agent": user_agent
                })
                
                db.commit()
                
                # Store session in Redis for real-time tracking
                if self.redis:
                    session_data = {
                        "user_id": user_id,
                        "start_time": datetime.utcnow().isoformat(),
                        "page_views": 0,
                        "interactions": 0
                    }
                    self.redis.setex(
                        f"session:{session_id}",
                        self.session_timeout,
                        json.dumps(session_data)
                    )
                
                logger.info(f"Started session {session_id} for user {user_id}")
                return session_id
                
        except Exception as e:
            logger.error(f"Error starting session: {e}")
            return None
    
    async def end_session(self, session_id: str) -> bool:
        """End a user session"""
        try:
            with self.SessionLocal() as db:
                # Get session data
                result = db.execute(text("""
                    SELECT session_start, page_views, interactions 
                    FROM user_sessions 
                    WHERE id = :session_id AND session_end IS NULL
                """), {"session_id": session_id})
                
                session_data = result.fetchone()
                if not session_data:
                    return False
                
                # Calculate duration
                session_start = session_data[0]
                session_end = datetime.utcnow()
                duration = int((session_end - session_start).total_seconds())
                
                # Update session
                db.execute(text("""
                    UPDATE user_sessions 
                    SET session_end = :session_end, duration = :duration
                    WHERE id = :session_id
                """), {
                    "session_end": session_end,
                    "duration": duration,
                    "session_id": session_id
                })
                
                db.commit()
                
                # Remove from Redis
                if self.redis:
                    self.redis.delete(f"session:{session_id}")
                
                logger.info(f"Ended session {session_id}, duration: {duration}s")
                return True
                
        except Exception as e:
            logger.error(f"Error ending session {session_id}: {e}")
            return False
    
    async def track_page_view(
        self,
        session_id: str,
        user_id: str,
        page_url: str,
        page_title: str = "",
        referrer: str = "",
        time_spent: int = 0,
        scroll_depth: int = 0
    ) -> bool:
        """Track a page view"""
        try:
            with self.SessionLocal() as db:
                # Record page view
                db.execute(text("""
                    INSERT INTO page_views 
                    (id, session_id, user_id, page_url, page_title, referrer, time_spent, scroll_depth)
                    VALUES (:id, :session_id, :user_id, :page_url, :page_title, :referrer, :time_spent, :scroll_depth)
                """), {
                    "id": self._generate_id(),
                    "session_id": session_id,
                    "user_id": user_id,
                    "page_url": page_url,
                    "page_title": page_title,
                    "referrer": referrer,
                    "time_spent": time_spent,
                    "scroll_depth": scroll_depth
                })
                
                # Update session page view count
                db.execute(text("""
                    UPDATE user_sessions 
                    SET page_views = page_views + 1 
                    WHERE id = :session_id
                """), {"session_id": session_id})
                
                db.commit()
                
                # Update Redis session data
                if self.redis:
                    session_key = f"session:{session_id}"
                    session_data = self.redis.get(session_key)
                    if session_data:
                        data = json.loads(session_data)
                        data["page_views"] += 1
                        self.redis.setex(session_key, self.session_timeout, json.dumps(data))
                
                return True
                
        except Exception as e:
            logger.error(f"Error tracking page view: {e}")
            return False
    
    async def track_interaction(
        self,
        session_id: str,
        user_id: str,
        event_type: str,
        event_data: Dict[str, Any] = None,
        element_id: str = "",
        element_class: str = "",
        element_text: str = ""
    ) -> bool:
        """Track a user interaction"""
        try:
            with self.SessionLocal() as db:
                # Record interaction
                db.execute(text("""
                    INSERT INTO user_interactions 
                    (id, session_id, user_id, event_type, event_data, element_id, element_class, element_text)
                    VALUES (:id, :session_id, :user_id, :event_type, :event_data, :element_id, :element_class, :element_text)
                """), {
                    "id": self._generate_id(),
                    "session_id": session_id,
                    "user_id": user_id,
                    "event_type": event_type,
                    "event_data": json.dumps(event_data) if event_data else None,
                    "element_id": element_id,
                    "element_class": element_class,
                    "element_text": element_text
                })
                
                # Update session interaction count
                db.execute(text("""
                    UPDATE user_sessions 
                    SET interactions = interactions + 1 
                    WHERE id = :session_id
                """), {"session_id": session_id})
                
                db.commit()
                
                # Update Redis session data
                if self.redis:
                    session_key = f"session:{session_id}"
                    session_data = self.redis.get(session_key)
                    if session_data:
                        data = json.loads(session_data)
                        data["interactions"] += 1
                        self.redis.setex(session_key, self.session_timeout, json.dumps(data))
                
                return True
                
        except Exception as e:
            logger.error(f"Error tracking interaction: {e}")
            return False
    
    async def track_marketplace_event(
        self,
        user_id: str,
        event_type: str,
        session_id: str = None,
        product_id: int = None,
        category_id: int = None,
        search_query: str = None,
        price_range: str = None
    ) -> bool:
        """Track marketplace-specific events"""
        try:
            with self.SessionLocal() as db:
                db.execute(text("""
                    INSERT INTO marketplace_events 
                    (id, user_id, event_type, product_id, category_id, search_query, price_range, session_id)
                    VALUES (:id, :user_id, :event_type, :product_id, :category_id, :search_query, :price_range, :session_id)
                """), {
                    "id": self._generate_id(),
                    "user_id": user_id,
                    "event_type": event_type,
                    "product_id": product_id,
                    "category_id": category_id,
                    "search_query": search_query,
                    "price_range": price_range,
                    "session_id": session_id
                })
                
                db.commit()
                return True
                
        except Exception as e:
            logger.error(f"Error tracking marketplace event: {e}")
            return False
    
    async def track_conversion(
        self,
        user_id: str,
        event_type: str,
        order_id: str,
        order_value: float,
        products: List[Dict[str, Any]] = None,
        session_id: str = None
    ) -> bool:
        """Track conversion events (purchases, etc.)"""
        try:
            with self.SessionLocal() as db:
                db.execute(text("""
                    INSERT INTO conversion_events 
                    (id, user_id, event_type, order_id, order_value, products, session_id)
                    VALUES (:id, :user_id, :event_type, :order_id, :order_value, :products, :session_id)
                """), {
                    "id": self._generate_id(),
                    "user_id": user_id,
                    "event_type": event_type,
                    "order_id": order_id,
                    "order_value": order_value,
                    "products": json.dumps(products) if products else None,
                    "session_id": session_id
                })
                
                db.commit()
                return True
                
        except Exception as e:
            logger.error(f"Error tracking conversion: {e}")
            return False
    
    async def get_user_analytics(
        self,
        user_id: str,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get analytics for a specific user"""
        try:
            with self.SessionLocal() as db:
                # Get session data
                sessions_result = db.execute(text("""
                    SELECT 
                        COUNT(*) as total_sessions,
                        AVG(duration) as avg_session_duration,
                        SUM(page_views) as total_page_views,
                        SUM(interactions) as total_interactions
                    FROM user_sessions 
                    WHERE user_id = :user_id 
                    AND session_start >= :start_date
                """), {
                    "user_id": user_id,
                    "start_date": datetime.utcnow() - timedelta(days=days)
                })
                
                session_stats = sessions_result.fetchone()
                
                # Get page view data
                pages_result = db.execute(text("""
                    SELECT page_url, COUNT(*) as views, AVG(time_spent) as avg_time
                    FROM page_views 
                    WHERE user_id = :user_id 
                    AND timestamp >= :start_date
                    GROUP BY page_url 
                    ORDER BY views DESC 
                    LIMIT 10
                """), {
                    "user_id": user_id,
                    "start_date": datetime.utcnow() - timedelta(days=days)
                })
                
                top_pages = [dict(row) for row in pages_result.fetchall()]
                
                # Get interaction data
                interactions_result = db.execute(text("""
                    SELECT event_type, COUNT(*) as count
                    FROM user_interactions 
                    WHERE user_id = :user_id 
                    AND timestamp >= :start_date
                    GROUP BY event_type 
                    ORDER BY count DESC
                """), {
                    "user_id": user_id,
                    "start_date": datetime.utcnow() - timedelta(days=days)
                })
                
                interactions = [dict(row) for row in interactions_result.fetchall()]
                
                # Get marketplace data
                marketplace_result = db.execute(text("""
                    SELECT event_type, COUNT(*) as count
                    FROM marketplace_events 
                    WHERE user_id = :user_id 
                    AND timestamp >= :start_date
                    GROUP BY event_type 
                    ORDER BY count DESC
                """), {
                    "user_id": user_id,
                    "start_date": datetime.utcnow() - timedelta(days=days)
                })
                
                marketplace_events = [dict(row) for row in marketplace_result.fetchall()]
                
                return {
                    "user_id": user_id,
                    "period_days": days,
                    "sessions": {
                        "total": session_stats[0] or 0,
                        "avg_duration": float(session_stats[1] or 0),
                        "total_page_views": session_stats[2] or 0,
                        "total_interactions": session_stats[3] or 0
                    },
                    "top_pages": top_pages,
                    "interactions": interactions,
                    "marketplace_events": marketplace_events
                }
                
        except Exception as e:
            logger.error(f"Error getting user analytics: {e}")
            return {}
    
    async def get_platform_analytics(
        self,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get platform-wide analytics"""
        try:
            with self.SessionLocal() as db:
                # Get session statistics
                sessions_result = db.execute(text("""
                    SELECT 
                        COUNT(*) as total_sessions,
                        COUNT(DISTINCT user_id) as unique_users,
                        AVG(duration) as avg_session_duration,
                        SUM(page_views) as total_page_views,
                        SUM(interactions) as total_interactions
                    FROM user_sessions 
                    WHERE session_start >= :start_date
                """), {
                    "start_date": datetime.utcnow() - timedelta(days=days)
                })
                
                session_stats = sessions_result.fetchone()
                
                # Get daily active users
                daily_users_result = db.execute(text("""
                    SELECT DATE(session_start) as date, COUNT(DISTINCT user_id) as users
                    FROM user_sessions 
                    WHERE session_start >= :start_date
                    GROUP BY DATE(session_start)
                    ORDER BY date DESC
                """), {
                    "start_date": datetime.utcnow() - timedelta(days=days)
                })
                
                daily_users = [dict(row) for row in daily_users_result.fetchall()]
                
                # Get top pages
                top_pages_result = db.execute(text("""
                    SELECT page_url, COUNT(*) as views
                    FROM page_views 
                    WHERE timestamp >= :start_date
                    GROUP BY page_url 
                    ORDER BY views DESC 
                    LIMIT 10
                """), {
                    "start_date": datetime.utcnow() - timedelta(days=days)
                })
                
                top_pages = [dict(row) for row in top_pages_result.fetchall()]
                
                # Get marketplace analytics
                marketplace_result = db.execute(text("""
                    SELECT event_type, COUNT(*) as count
                    FROM marketplace_events 
                    WHERE timestamp >= :start_date
                    GROUP BY event_type 
                    ORDER BY count DESC
                """), {
                    "start_date": datetime.utcnow() - timedelta(days=days)
                })
                
                marketplace_events = [dict(row) for row in marketplace_result.fetchall()]
                
                # Get conversion data
                conversions_result = db.execute(text("""
                    SELECT 
                        COUNT(*) as total_conversions,
                        SUM(order_value) as total_revenue,
                        AVG(order_value) as avg_order_value
                    FROM conversion_events 
                    WHERE timestamp >= :start_date
                """), {
                    "start_date": datetime.utcnow() - timedelta(days=days)
                })
                
                conversion_stats = conversions_result.fetchone()
                
                return {
                    "period_days": days,
                    "overview": {
                        "total_sessions": session_stats[0] or 0,
                        "unique_users": session_stats[1] or 0,
                        "avg_session_duration": float(session_stats[2] or 0),
                        "total_page_views": session_stats[3] or 0,
                        "total_interactions": session_stats[4] or 0
                    },
                    "daily_users": daily_users,
                    "top_pages": top_pages,
                    "marketplace_events": marketplace_events,
                    "conversions": {
                        "total": conversion_stats[0] or 0,
                        "total_revenue": float(conversion_stats[1] or 0),
                        "avg_order_value": float(conversion_stats[2] or 0)
                    }
                }
                
        except Exception as e:
            logger.error(f"Error getting platform analytics: {e}")
            return {}
    
    async def get_real_time_stats(self) -> Dict[str, Any]:
        """Get real-time statistics from Redis"""
        if not self.redis:
            return {}
        
        try:
            # Get active sessions
            active_sessions = self.redis.keys("session:*")
            active_users = set()
            total_page_views = 0
            total_interactions = 0
            
            for session_key in active_sessions:
                session_data = self.redis.get(session_key)
                if session_data:
                    data = json.loads(session_data)
                    active_users.add(data["user_id"])
                    total_page_views += data.get("page_views", 0)
                    total_interactions += data.get("interactions", 0)
            
            return {
                "active_sessions": len(active_sessions),
                "active_users": len(active_users),
                "total_page_views": total_page_views,
                "total_interactions": total_interactions,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting real-time stats: {e}")
            return {}
    
    async def generate_insights(self, user_id: str = None) -> List[Dict[str, Any]]:
        """Generate actionable insights from analytics data"""
        insights = []
        
        try:
            if user_id:
                # User-specific insights
                user_data = await self.get_user_analytics(user_id, days=7)
                
                if user_data.get("sessions", {}).get("total", 0) == 0:
                    insights.append({
                        "type": "engagement",
                        "title": "Welcome!",
                        "message": "Start exploring our platform to discover personalized insights.",
                        "priority": "low"
                    })
                else:
                    avg_duration = user_data["sessions"]["avg_duration"]
                    if avg_duration < 60:
                        insights.append({
                            "type": "engagement",
                            "title": "Quick Sessions",
                            "message": "Your sessions are quite short. Consider exploring more features to get the most out of our platform.",
                            "priority": "medium"
                        })
                    
                    if user_data["sessions"]["total_interactions"] < 5:
                        insights.append({
                            "type": "engagement",
                            "title": "Low Interaction",
                            "message": "Try interacting with more elements to discover hidden features.",
                            "priority": "medium"
                        })
            else:
                # Platform-wide insights
                platform_data = await self.get_platform_analytics(days=7)
                
                if platform_data.get("overview", {}).get("unique_users", 0) < 10:
                    insights.append({
                        "type": "growth",
                        "title": "Low User Activity",
                        "message": "Consider implementing user engagement strategies to increase platform usage.",
                        "priority": "high"
                    })
                
                conversion_rate = 0
                if platform_data.get("overview", {}).get("total_sessions", 0) > 0:
                    conversion_rate = (platform_data.get("conversions", {}).get("total", 0) / 
                                     platform_data["overview"]["total_sessions"]) * 100
                
                if conversion_rate < 1:
                    insights.append({
                        "type": "conversion",
                        "title": "Low Conversion Rate",
                        "message": "Consider optimizing the user journey to improve conversion rates.",
                        "priority": "high"
                    })
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            return []

# Global analytics service instance
analytics_service = AnalyticsService()
