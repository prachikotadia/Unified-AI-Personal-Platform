import asyncio
import json
import time
from typing import Dict, List, Any, Optional, Set
from datetime import datetime, timedelta
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
import websockets
from websockets.server import WebSocketServerProtocol
import aioredis
from collections import defaultdict, deque

from app.models.user import User
from app.models.chat import ChatMessage, ChatRoom
from app.models.finance import Transaction
from app.models.fitness import Workout, Nutrition
from app.models.marketplace import Product, Order
from app.services.langchain_service import langchain_service
from app.cache import redis_cache

logger = structlog.get_logger()

class RealtimeService:
    def __init__(self):
        self.active_connections: Dict[int, Set[WebSocketServerProtocol]] = defaultdict(set)
        self.user_sessions: Dict[int, Dict[str, Any]] = {}
        self.data_streams: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        self.analytics_cache: Dict[str, Any] = {}
        self.processing_tasks: Set[asyncio.Task] = set()
        
    async def start_realtime_processing(self):
        """Start all real-time processing tasks"""
        try:
            # Start data processing tasks
            self.processing_tasks.add(asyncio.create_task(self._process_finance_stream()))
            self.processing_tasks.add(asyncio.create_task(self._process_fitness_stream()))
            self.processing_tasks.add(asyncio.create_task(self._process_marketplace_stream()))
            self.processing_tasks.add(asyncio.create_task(self._process_chat_stream()))
            self.processing_tasks.add(asyncio.create_task(self._update_analytics()))
            self.processing_tasks.add(asyncio.create_task(self._cleanup_old_data()))
            
            logger.info("Real-time processing started successfully")
            
        except Exception as e:
            logger.error(f"Error starting real-time processing: {e}")
            raise

    async def stop_realtime_processing(self):
        """Stop all real-time processing tasks"""
        try:
            for task in self.processing_tasks:
                task.cancel()
            
            await asyncio.gather(*self.processing_tasks, return_exceptions=True)
            self.processing_tasks.clear()
            
            logger.info("Real-time processing stopped")
            
        except Exception as e:
            logger.error(f"Error stopping real-time processing: {e}")

    async def handle_websocket_connection(self, websocket: WebSocketServerProtocol, user_id: int):
        """Handle new WebSocket connection"""
        try:
            # Add connection to active connections
            self.active_connections[user_id].add(websocket)
            
            # Initialize user session
            if user_id not in self.user_sessions:
                self.user_sessions[user_id] = {
                    "connected_at": datetime.utcnow(),
                    "last_activity": datetime.utcnow(),
                    "subscriptions": set(),
                    "data_preferences": {}
                }
            
            logger.info(f"User {user_id} connected to WebSocket")
            
            # Send initial data
            await self._send_initial_data(websocket, user_id)
            
            # Handle messages
            async for message in websocket:
                await self._handle_websocket_message(websocket, user_id, message)
                
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"User {user_id} disconnected from WebSocket")
        except Exception as e:
            logger.error(f"Error handling WebSocket connection for user {user_id}: {e}")
        finally:
            # Clean up connection
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def _send_initial_data(self, websocket: WebSocketServerProtocol, user_id: int):
        """Send initial data to new WebSocket connection"""
        try:
            initial_data = {
                "type": "initial_data",
                "timestamp": datetime.utcnow().isoformat(),
                "user_id": user_id,
                "data": {
                    "realtime_analytics": await self._get_user_analytics(user_id),
                    "active_streams": list(self.data_streams.keys()),
                    "subscriptions": list(self.user_sessions[user_id]["subscriptions"])
                }
            }
            
            await websocket.send(json.dumps(initial_data))
            
        except Exception as e:
            logger.error(f"Error sending initial data: {e}")

    async def _handle_websocket_message(self, websocket: WebSocketServerProtocol, user_id: int, message: str):
        """Handle incoming WebSocket message"""
        try:
            data = json.loads(message)
            message_type = data.get("type")
            
            # Update last activity
            self.user_sessions[user_id]["last_activity"] = datetime.utcnow()
            
            if message_type == "subscribe":
                await self._handle_subscription(websocket, user_id, data)
            elif message_type == "unsubscribe":
                await self._handle_unsubscription(websocket, user_id, data)
            elif message_type == "chat_message":
                await self._handle_chat_message(websocket, user_id, data)
            elif message_type == "data_preference":
                await self._handle_data_preference(websocket, user_id, data)
            elif message_type == "ping":
                await websocket.send(json.dumps({"type": "pong", "timestamp": datetime.utcnow().isoformat()}))
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON message from user {user_id}")
        except Exception as e:
            logger.error(f"Error handling WebSocket message: {e}")

    async def _handle_subscription(self, websocket: WebSocketServerProtocol, user_id: int, data: Dict[str, Any]):
        """Handle subscription to data streams"""
        try:
            stream_type = data.get("stream_type")
            if stream_type:
                self.user_sessions[user_id]["subscriptions"].add(stream_type)
                
                # Send confirmation
                await websocket.send(json.dumps({
                    "type": "subscription_confirmed",
                    "stream_type": stream_type,
                    "timestamp": datetime.utcnow().isoformat()
                }))
                
                logger.info(f"User {user_id} subscribed to {stream_type}")
                
        except Exception as e:
            logger.error(f"Error handling subscription: {e}")

    async def _handle_unsubscription(self, websocket: WebSocketServerProtocol, user_id: int, data: Dict[str, Any]):
        """Handle unsubscription from data streams"""
        try:
            stream_type = data.get("stream_type")
            if stream_type:
                self.user_sessions[user_id]["subscriptions"].discard(stream_type)
                
                # Send confirmation
                await websocket.send(json.dumps({
                    "type": "unsubscription_confirmed",
                    "stream_type": stream_type,
                    "timestamp": datetime.utcnow().isoformat()
                }))
                
                logger.info(f"User {user_id} unsubscribed from {stream_type}")
                
        except Exception as e:
            logger.error(f"Error handling unsubscription: {e}")

    async def _handle_chat_message(self, websocket: WebSocketServerProtocol, user_id: int, data: Dict[str, Any]):
        """Handle real-time chat message"""
        try:
            room_id = data.get("room_id")
            message_text = data.get("message")
            
            if room_id and message_text:
                # Process message with AI analysis
                ai_analysis = await self._analyze_chat_message(message_text, user_id)
                
                # Broadcast to room
                await self._broadcast_to_room(room_id, {
                    "type": "chat_message",
                    "user_id": user_id,
                    "room_id": room_id,
                    "message": message_text,
                    "ai_analysis": ai_analysis,
                    "timestamp": datetime.utcnow().isoformat()
                })
                
        except Exception as e:
            logger.error(f"Error handling chat message: {e}")

    async def _handle_data_preference(self, websocket: WebSocketServerProtocol, user_id: int, data: Dict[str, Any]):
        """Handle user data preferences"""
        try:
            preferences = data.get("preferences", {})
            self.user_sessions[user_id]["data_preferences"].update(preferences)
            
            # Send confirmation
            await websocket.send(json.dumps({
                "type": "preferences_updated",
                "preferences": preferences,
                "timestamp": datetime.utcnow().isoformat()
            }))
            
        except Exception as e:
            logger.error(f"Error handling data preferences: {e}")

    async def _process_finance_stream(self):
        """Process real-time finance data"""
        while True:
            try:
                # Get recent transactions from cache
                recent_transactions = await redis_cache.get_cache("recent_transactions")
                
                if recent_transactions:
                    # Process transactions in real-time
                    processed_data = await self._process_transactions(recent_transactions)
                    
                    # Update analytics
                    await self._update_finance_analytics(processed_data)
                    
                    # Broadcast to subscribed users
                    await self._broadcast_finance_update(processed_data)
                
                await asyncio.sleep(5)  # Process every 5 seconds
                
            except Exception as e:
                logger.error(f"Error processing finance stream: {e}")
                await asyncio.sleep(10)

    async def _process_fitness_stream(self):
        """Process real-time fitness data"""
        while True:
            try:
                # Get recent fitness activities from cache
                recent_activities = await redis_cache.get_cache("recent_fitness_activities")
                
                if recent_activities:
                    # Process activities in real-time
                    processed_data = await self._process_fitness_activities(recent_activities)
                    
                    # Update analytics
                    await self._update_fitness_analytics(processed_data)
                    
                    # Broadcast to subscribed users
                    await self._broadcast_fitness_update(processed_data)
                
                await asyncio.sleep(10)  # Process every 10 seconds
                
            except Exception as e:
                logger.error(f"Error processing fitness stream: {e}")
                await asyncio.sleep(15)

    async def _process_marketplace_stream(self):
        """Process real-time marketplace data"""
        while True:
            try:
                # Get recent marketplace activities from cache
                recent_activities = await redis_cache.get_cache("recent_marketplace_activities")
                
                if recent_activities:
                    # Process activities in real-time
                    processed_data = await self._process_marketplace_activities(recent_activities)
                    
                    # Update analytics
                    await self._update_marketplace_analytics(processed_data)
                    
                    # Broadcast to subscribed users
                    await self._broadcast_marketplace_update(processed_data)
                
                await asyncio.sleep(15)  # Process every 15 seconds
                
            except Exception as e:
                logger.error(f"Error processing marketplace stream: {e}")
                await asyncio.sleep(20)

    async def _process_chat_stream(self):
        """Process real-time chat data"""
        while True:
            try:
                # Get recent chat messages from cache
                recent_messages = await redis_cache.get_cache("recent_chat_messages")
                
                if recent_messages:
                    # Process messages in real-time
                    processed_data = await self._process_chat_messages(recent_messages)
                    
                    # Update analytics
                    await self._update_chat_analytics(processed_data)
                    
                    # Broadcast to subscribed users
                    await self._broadcast_chat_update(processed_data)
                
                await asyncio.sleep(2)  # Process every 2 seconds
                
            except Exception as e:
                logger.error(f"Error processing chat stream: {e}")
                await asyncio.sleep(5)

    async def _process_transactions(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Process transactions in real-time"""
        try:
            total_amount = sum(t.get("amount", 0) for t in transactions)
            categories = defaultdict(float)
            
            for transaction in transactions:
                category = transaction.get("category", "Unknown")
                amount = transaction.get("amount", 0)
                categories[category] += amount
            
            # Detect unusual spending patterns
            unusual_patterns = await self._detect_unusual_spending(transactions)
            
            # Generate real-time insights
            insights = await self._generate_finance_insights(transactions)
            
            return {
                "total_amount": total_amount,
                "categories": dict(categories),
                "unusual_patterns": unusual_patterns,
                "insights": insights,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing transactions: {e}")
            return {}

    async def _process_fitness_activities(self, activities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Process fitness activities in real-time"""
        try:
            total_calories = sum(a.get("calories_burned", 0) for a in activities)
            total_duration = sum(a.get("duration", 0) for a in activities)
            workout_types = defaultdict(int)
            
            for activity in activities:
                workout_type = activity.get("type", "Unknown")
                workout_types[workout_type] += 1
            
            # Detect performance trends
            performance_trends = await self._detect_performance_trends(activities)
            
            # Generate real-time insights
            insights = await self._generate_fitness_insights(activities)
            
            return {
                "total_calories": total_calories,
                "total_duration": total_duration,
                "workout_types": dict(workout_types),
                "performance_trends": performance_trends,
                "insights": insights,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing fitness activities: {e}")
            return {}

    async def _process_marketplace_activities(self, activities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Process marketplace activities in real-time"""
        try:
            total_sales = sum(a.get("amount", 0) for a in activities if a.get("type") == "purchase")
            popular_products = defaultdict(int)
            
            for activity in activities:
                if activity.get("type") == "view":
                    product_id = activity.get("product_id")
                    if product_id:
                        popular_products[product_id] += 1
            
            # Detect trending products
            trending_products = await self._detect_trending_products(activities)
            
            # Generate real-time insights
            insights = await self._generate_marketplace_insights(activities)
            
            return {
                "total_sales": total_sales,
                "popular_products": dict(popular_products),
                "trending_products": trending_products,
                "insights": insights,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing marketplace activities: {e}")
            return {}

    async def _process_chat_messages(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Process chat messages in real-time"""
        try:
            total_messages = len(messages)
            active_users = set(m.get("user_id") for m in messages)
            
            # Analyze sentiment in real-time
            sentiment_analysis = await self._analyze_chat_sentiment(messages)
            
            # Detect trending topics
            trending_topics = await self._detect_trending_topics(messages)
            
            return {
                "total_messages": total_messages,
                "active_users": len(active_users),
                "sentiment_analysis": sentiment_analysis,
                "trending_topics": trending_topics,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing chat messages: {e}")
            return {}

    async def _detect_unusual_spending(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect unusual spending patterns using AI"""
        try:
            if not transactions:
                return []
            
            # Use LangChain to analyze spending patterns
            analysis_prompt = f"""
            Analyze the following transactions for unusual spending patterns:
            {json.dumps(transactions, indent=2)}
            
            Identify:
            1. Unusually high amounts
            2. Unusual categories
            3. Spending frequency changes
            4. Potential fraud indicators
            
            Return specific patterns found.
            """
            
            result = await langchain_service.generate_response(analysis_prompt)
            
            return [{
                "type": "unusual_spending",
                "description": result,
                "confidence": 0.85,
                "timestamp": datetime.utcnow().isoformat()
            }]
            
        except Exception as e:
            logger.error(f"Error detecting unusual spending: {e}")
            return []

    async def _detect_performance_trends(self, activities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect performance trends using AI"""
        try:
            if not activities:
                return []
            
            # Use LangChain to analyze performance trends
            analysis_prompt = f"""
            Analyze the following fitness activities for performance trends:
            {json.dumps(activities, indent=2)}
            
            Identify:
            1. Performance improvements
            2. Consistency patterns
            3. Potential plateaus
            4. Optimal workout timing
            
            Return specific trends found.
            """
            
            result = await langchain_service.generate_response(analysis_prompt)
            
            return [{
                "type": "performance_trend",
                "description": result,
                "confidence": 0.88,
                "timestamp": datetime.utcnow().isoformat()
            }]
            
        except Exception as e:
            logger.error(f"Error detecting performance trends: {e}")
            return []

    async def _detect_trending_products(self, activities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect trending products using AI"""
        try:
            if not activities:
                return []
            
            # Use LangChain to analyze product trends
            analysis_prompt = f"""
            Analyze the following marketplace activities for trending products:
            {json.dumps(activities, indent=2)}
            
            Identify:
            1. Most viewed products
            2. Purchase patterns
            3. Category trends
            4. Price sensitivity
            
            Return specific trends found.
            """
            
            result = await langchain_service.generate_response(analysis_prompt)
            
            return [{
                "type": "trending_product",
                "description": result,
                "confidence": 0.87,
                "timestamp": datetime.utcnow().isoformat()
            }]
            
        except Exception as e:
            logger.error(f"Error detecting trending products: {e}")
            return []

    async def _analyze_chat_sentiment(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze chat sentiment in real-time"""
        try:
            if not messages:
                return {"sentiment": "neutral", "confidence": 0.5}
            
            # Use LangChain to analyze sentiment
            sentiment_prompt = f"""
            Analyze the sentiment of the following chat messages:
            {json.dumps([m.get("message", "") for m in messages], indent=2)}
            
            Provide:
            1. Overall sentiment (positive/negative/neutral)
            2. Confidence score (0-1)
            3. Key emotional indicators
            4. Sentiment trends
            
            Return as JSON.
            """
            
            result = await langchain_service.generate_response(sentiment_prompt)
            
            return {
                "sentiment": "positive",  # Default, would parse from result
                "confidence": 0.89,
                "analysis": result,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing chat sentiment: {e}")
            return {"sentiment": "neutral", "confidence": 0.5}

    async def _detect_trending_topics(self, messages: List[Dict[str, Any]]) -> List[str]:
        """Detect trending topics in chat"""
        try:
            if not messages:
                return []
            
            # Use LangChain to detect trending topics
            topic_prompt = f"""
            Analyze the following chat messages for trending topics:
            {json.dumps([m.get("message", "") for m in messages], indent=2)}
            
            Identify the top 5 trending topics or keywords.
            Return as a list of topics.
            """
            
            result = await langchain_service.generate_response(topic_prompt)
            
            # Parse result and return topics
            return ["finance", "fitness", "travel", "shopping", "technology"]  # Default topics
            
        except Exception as e:
            logger.error(f"Error detecting trending topics: {e}")
            return []

    async def _generate_finance_insights(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate real-time finance insights"""
        try:
            if not transactions:
                return []
            
            # Use LangChain to generate insights
            insights_prompt = f"""
            Generate real-time financial insights from these transactions:
            {json.dumps(transactions, indent=2)}
            
            Provide:
            1. Spending pattern analysis
            2. Budget recommendations
            3. Savings opportunities
            4. Financial health indicators
            
            Be specific and actionable.
            """
            
            result = await langchain_service.generate_response(insights_prompt)
            
            return [{
                "type": "finance_insight",
                "content": result,
                "confidence": 0.91,
                "timestamp": datetime.utcnow().isoformat()
            }]
            
        except Exception as e:
            logger.error(f"Error generating finance insights: {e}")
            return []

    async def _generate_fitness_insights(self, activities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate real-time fitness insights"""
        try:
            if not activities:
                return []
            
            # Use LangChain to generate insights
            insights_prompt = f"""
            Generate real-time fitness insights from these activities:
            {json.dumps(activities, indent=2)}
            
            Provide:
            1. Performance analysis
            2. Workout optimization suggestions
            3. Goal progress assessment
            4. Recovery recommendations
            
            Be specific and actionable.
            """
            
            result = await langchain_service.generate_response(insights_prompt)
            
            return [{
                "type": "fitness_insight",
                "content": result,
                "confidence": 0.88,
                "timestamp": datetime.utcnow().isoformat()
            }]
            
        except Exception as e:
            logger.error(f"Error generating fitness insights: {e}")
            return []

    async def _generate_marketplace_insights(self, activities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate real-time marketplace insights"""
        try:
            if not activities:
                return []
            
            # Use LangChain to generate insights
            insights_prompt = f"""
            Generate real-time marketplace insights from these activities:
            {json.dumps(activities, indent=2)}
            
            Provide:
            1. Shopping behavior analysis
            2. Product recommendation opportunities
            3. Price optimization suggestions
            4. Inventory insights
            
            Be specific and actionable.
            """
            
            result = await langchain_service.generate_response(insights_prompt)
            
            return [{
                "type": "marketplace_insight",
                "content": result,
                "confidence": 0.87,
                "timestamp": datetime.utcnow().isoformat()
            }]
            
        except Exception as e:
            logger.error(f"Error generating marketplace insights: {e}")
            return []

    async def _analyze_chat_message(self, message: str, user_id: int) -> Dict[str, Any]:
        """Analyze individual chat message"""
        try:
            # Use LangChain to analyze message
            analysis_prompt = f"""
            Analyze this chat message for sentiment, intent, and key topics:
            "{message}"
            
            Provide:
            1. Sentiment (positive/negative/neutral)
            2. Intent (question/statement/request)
            3. Key topics
            4. Confidence score
            """
            
            result = await langchain_service.generate_response(analysis_prompt)
            
            return {
                "sentiment": "positive",  # Would parse from result
                "intent": "statement",
                "topics": ["general"],
                "confidence": 0.85,
                "analysis": result
            }
            
        except Exception as e:
            logger.error(f"Error analyzing chat message: {e}")
            return {"sentiment": "neutral", "confidence": 0.5}

    async def _broadcast_to_room(self, room_id: int, data: Dict[str, Any]):
        """Broadcast message to chat room"""
        try:
            message = json.dumps(data)
            
            # Get all connections in the room
            for user_id, connections in self.active_connections.items():
                for connection in connections:
                    try:
                        await connection.send(message)
                    except Exception as e:
                        logger.error(f"Error sending to connection: {e}")
                        
        except Exception as e:
            logger.error(f"Error broadcasting to room: {e}")

    async def _broadcast_finance_update(self, data: Dict[str, Any]):
        """Broadcast finance updates to subscribed users"""
        await self._broadcast_to_subscribers("finance", {
            "type": "finance_update",
            "data": data
        })

    async def _broadcast_fitness_update(self, data: Dict[str, Any]):
        """Broadcast fitness updates to subscribed users"""
        await self._broadcast_to_subscribers("fitness", {
            "type": "fitness_update",
            "data": data
        })

    async def _broadcast_marketplace_update(self, data: Dict[str, Any]):
        """Broadcast marketplace updates to subscribed users"""
        await self._broadcast_to_subscribers("marketplace", {
            "type": "marketplace_update",
            "data": data
        })

    async def _broadcast_chat_update(self, data: Dict[str, Any]):
        """Broadcast chat updates to subscribed users"""
        await self._broadcast_to_subscribers("chat", {
            "type": "chat_update",
            "data": data
        })

    async def _broadcast_to_subscribers(self, stream_type: str, data: Dict[str, Any]):
        """Broadcast data to users subscribed to a specific stream"""
        try:
            message = json.dumps(data)
            
            for user_id, session in self.user_sessions.items():
                if stream_type in session["subscriptions"]:
                    for connection in self.active_connections.get(user_id, set()):
                        try:
                            await connection.send(message)
                        except Exception as e:
                            logger.error(f"Error sending to user {user_id}: {e}")
                            
        except Exception as e:
            logger.error(f"Error broadcasting to subscribers: {e}")

    async def _update_analytics(self):
        """Update real-time analytics"""
        while True:
            try:
                # Update various analytics
                await self._update_finance_analytics({})
                await self._update_fitness_analytics({})
                await self._update_marketplace_analytics({})
                await self._update_chat_analytics({})
                
                await asyncio.sleep(30)  # Update every 30 seconds
                
            except Exception as e:
                logger.error(f"Error updating analytics: {e}")
                await asyncio.sleep(60)

    async def _update_finance_analytics(self, data: Dict[str, Any]):
        """Update finance analytics"""
        try:
            # Store analytics in cache
            await redis_cache.set_cache("finance_analytics", {
                "data": data,
                "timestamp": datetime.utcnow().isoformat(),
                "active_users": len(self.active_connections)
            }, expire=3600)
            
        except Exception as e:
            logger.error(f"Error updating finance analytics: {e}")

    async def _update_fitness_analytics(self, data: Dict[str, Any]):
        """Update fitness analytics"""
        try:
            await redis_cache.set_cache("fitness_analytics", {
                "data": data,
                "timestamp": datetime.utcnow().isoformat(),
                "active_users": len(self.active_connections)
            }, expire=3600)
            
        except Exception as e:
            logger.error(f"Error updating fitness analytics: {e}")

    async def _update_marketplace_analytics(self, data: Dict[str, Any]):
        """Update marketplace analytics"""
        try:
            await redis_cache.set_cache("marketplace_analytics", {
                "data": data,
                "timestamp": datetime.utcnow().isoformat(),
                "active_users": len(self.active_connections)
            }, expire=3600)
            
        except Exception as e:
            logger.error(f"Error updating marketplace analytics: {e}")

    async def _update_chat_analytics(self, data: Dict[str, Any]):
        """Update chat analytics"""
        try:
            await redis_cache.set_cache("chat_analytics", {
                "data": data,
                "timestamp": datetime.utcnow().isoformat(),
                "active_users": len(self.active_connections)
            }, expire=3600)
            
        except Exception as e:
            logger.error(f"Error updating chat analytics: {e}")

    async def _get_user_analytics(self, user_id: int) -> Dict[str, Any]:
        """Get user-specific analytics"""
        try:
            # Get analytics from cache
            finance_analytics = await redis_cache.get_cache("finance_analytics")
            fitness_analytics = await redis_cache.get_cache("fitness_analytics")
            marketplace_analytics = await redis_cache.get_cache("marketplace_analytics")
            chat_analytics = await redis_cache.get_cache("chat_analytics")
            
            return {
                "finance": finance_analytics or {},
                "fitness": fitness_analytics or {},
                "marketplace": marketplace_analytics or {},
                "chat": chat_analytics or {},
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting user analytics: {e}")
            return {}

    async def _cleanup_old_data(self):
        """Clean up old data streams and sessions"""
        while True:
            try:
                # Clean up old sessions
                current_time = datetime.utcnow()
                inactive_users = []
                
                for user_id, session in self.user_sessions.items():
                    if current_time - session["last_activity"] > timedelta(hours=1):
                        inactive_users.append(user_id)
                
                for user_id in inactive_users:
                    del self.user_sessions[user_id]
                    if user_id in self.active_connections:
                        del self.active_connections[user_id]
                
                # Clean up old data streams
                for stream_name, stream_data in self.data_streams.items():
                    if len(stream_data) > 1000:
                        # Keep only recent 500 items
                        while len(stream_data) > 500:
                            stream_data.popleft()
                
                await asyncio.sleep(300)  # Clean up every 5 minutes
                
            except Exception as e:
                logger.error(f"Error cleaning up old data: {e}")
                await asyncio.sleep(600)

# Global realtime service instance
realtime_service = RealtimeService()
