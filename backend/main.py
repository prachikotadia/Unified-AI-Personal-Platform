from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import structlog
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import uuid

# Import routers
from app.routers import health, travel, chat, finance, auth
from app.routers import marketplace_db as marketplace
from app.routers import search, analytics, notifications, security

# Load environment variables
load_dotenv()

# Configure logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting OmniLife Backend...")
    
    yield
    
    # Shutdown
    logger.info("Shutting down OmniLife Backend...")

# Create FastAPI app
app = FastAPI(
    title="OmniLife API",
    description="OmniLife Unified AI Personal Platform Backend API",
    version="1.0.0",
    docs_url="/api-docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3004"),
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "services": {
            "api": "healthy",
            "database": "healthy",
            "ai": "healthy"
        }
    }

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to OmniLife API",
        "version": "1.0.0",
        "docs": "/api-docs",
        "health": "/health",
        "features": {
            "health_tracking": "/api/health",
            "travel_planning": "/api/travel",
            "chat_messaging": "/api/chat",
            "finance_management": "/api/finance",
            "ai_assistant": "/api/ai",
            "social_sharing": "/api/health/share",
            "heartbeat_monitoring": "/api/health/heartbeat",
            "flight_search": "/api/travel/flights/search",
            "hotel_booking": "/api/travel/hotels/search",
            "real_time_chat": "/api/chat/ws",
            "voice_video_calls": "/api/chat/calls",
            "expense_tracking": "/api/finance/transactions",
            "credit_score": "/api/finance/credit-score",
            "financial_offers": "/api/finance/offers"
        }
    }

# Include routers
app.include_router(
    auth.router,
    prefix="/api",
    tags=["Authentication"]
)

app.include_router(
    health.router,
    prefix="/api/health",
    tags=["Health & Fitness"]
)

app.include_router(
    travel.router,
    prefix="/api/travel",
    tags=["Travel & Tourism"]
)

app.include_router(
    chat.router,
    prefix="/api/chat",
    tags=["Chat & Communication"]
)

app.include_router(
    finance.router,
    prefix="/api/finance",
    tags=["Finance & Banking"]
)

app.include_router(
    marketplace.router,
    prefix="/api/marketplace",
    tags=["Marketplace & E-commerce"]
)

app.include_router(
    search.router,
    prefix="/api",
    tags=["Search & Discovery"]
)

app.include_router(
    analytics.router,
    prefix="/api",
    tags=["Analytics & Insights"]
)

app.include_router(
    notifications.router,
    prefix="/api",
    tags=["Notifications & Communication"]
)

app.include_router(
    security.router,
    prefix="/api",
    tags=["Security & Fraud Detection"]
)

# AI endpoints
@app.get("/api/ai/health", tags=["AI"])
async def ai_health_check():
    """AI service health check"""
    return {
        "status": "healthy",
        "service": "ai",
        "timestamp": datetime.utcnow().isoformat(),
        "capabilities": [
            "natural_language_processing",
            "health_insights",
            "workout_planning",
            "nutrition_recommendations",
            "goal_tracking"
        ]
    }

@app.get("/api/ai/capabilities", tags=["AI"])
async def get_ai_capabilities():
    """Get list of AI capabilities"""
    return {
        "capabilities": [
            {
                "name": "Natural Language Processing",
                "description": "Process natural language commands and execute actions",
                "endpoint": "/api/ai/command",
                "examples": [
                    "Plan a 30-minute workout",
                    "Create a meal plan for weight loss",
                    "Analyze my fitness progress"
                ]
            },
            {
                "name": "Health Insights",
                "description": "Generate personalized health insights and recommendations",
                "endpoint": "/api/ai/insights",
                "examples": [
                    "Analyze workout patterns",
                    "Identify nutrition trends",
                    "Predict health outcomes"
                ]
            },
            {
                "name": "Workout Planning",
                "description": "Create personalized workout plans based on goals and fitness level",
                "endpoint": "/api/ai/fitness/workout-plan",
                "examples": [
                    "Create a strength training plan",
                    "Design a cardio routine",
                    "Plan recovery workouts"
                ]
            },
            {
                "name": "Nutrition Recommendations",
                "description": "Provide personalized nutrition advice and meal planning",
                "endpoint": "/api/ai/nutrition/recommendations",
                "examples": [
                    "Create a meal plan for muscle gain",
                    "Suggest healthy snacks",
                    "Calculate daily calorie needs"
                ]
            },
            {
                "name": "Goal Tracking",
                "description": "Track progress and provide motivation for health goals",
                "endpoint": "/api/ai/goals/track",
                "examples": [
                    "Monitor weight loss progress",
                    "Track fitness milestones",
                    "Set achievable targets"
                ]
            },
            {
                "name": "Social Sharing",
                "description": "Generate engaging content for social media sharing",
                "endpoint": "/api/ai/social/generate-post",
                "examples": [
                    "Create workout motivation posts",
                    "Share achievement updates",
                    "Generate progress reports"
                ]
            },
            {
                "name": "Smart Reminders",
                "description": "Create intelligent reminders with personalized suggestions",
                "endpoint": "/api/ai/reminders/create",
                "examples": [
                    "Remind me to workout",
                    "Schedule meal prep time",
                    "Set hydration reminders"
                ]
            },
            {
                "name": "Heartbeat Analysis",
                "description": "Analyze heart rate patterns and provide health insights",
                "endpoint": "/api/ai/heartbeat/analyze",
                "examples": [
                    "Analyze resting heart rate trends",
                    "Monitor workout intensity",
                    "Detect stress patterns"
                ]
            }
        ],
        "supported_modules": ["health", "fitness", "nutrition", "goals", "social", "monitoring"],
        "supported_actions": [
            "workout_plan", "nutrition_plan", "goal_track", "insight_generate", 
            "social_share", "reminder_create", "heartbeat_analyze", "progress_report"
        ]
    }

# Mock AI command endpoint
@app.post("/api/ai/command", tags=["AI"])
async def process_ai_command():
    """Process natural language commands"""
    return {
        "action_type": "general",
        "response": "AI command processing is ready! This is a mock response.",
        "command": "test command",
        "executed": True,
        "data": {"status": "mock_response"},
        "suggestions": [
            "Try: 'Plan a 30-minute cardio workout'",
            "Try: 'Create a meal plan for today'",
            "Try: 'Analyze my fitness progress'",
            "Try: 'Share my workout achievement'"
        ]
    }

# Mock insights endpoint
@app.post("/api/ai/insights", tags=["AI"])
async def generate_insights():
    """Generate AI insights"""
    return {
        "insights": [
            {
                "type": "workout_pattern",
                "title": "Consistent Morning Workouts",
                "description": "You perform better when working out in the morning. Consider scheduling more morning sessions.",
                "confidence": 0.85,
                "action": "schedule_morning_workouts"
            },
            {
                "type": "nutrition_trend",
                "description": "Your protein intake has increased by 15% this week. Great job!",
                "confidence": 0.92,
                "action": "maintain_protein_intake"
            },
            {
                "type": "goal_progress",
                "title": "Weight Loss Goal On Track",
                "description": "You're 75% towards your weight loss goal. Keep up the great work!",
                "confidence": 0.78,
                "action": "continue_current_plan"
            },
            {
                "type": "travel_preference",
                "title": "Travel Pattern Analysis",
                "description": "You prefer European destinations and travel during spring/fall. Consider booking early for better rates.",
                "confidence": 0.88,
                "action": "plan_early_booking"
            }
        ],
        "module": "health",
        "generated_at": datetime.utcnow().isoformat()
    }

# Social sharing endpoints
@app.get("/api/social/feed", tags=["Social"])
async def get_social_feed():
    """Get social feed with health and fitness posts"""
    return {
        "posts": [
            {
                "id": str(uuid.uuid4()),
                "user": {"id": "user_123", "name": "John Doe", "avatar": "https://example.com/avatar1.jpg"},
                "type": "workout_achievement",
                "title": "Completed 5K Run!",
                "content": "Just finished my first 5K run in 25 minutes! Feeling amazing! 🏃‍♂️",
                "data": {
                    "distance": "5km",
                    "time": "25:30",
                    "calories": 320,
                    "pace": "5:06/km"
                },
                "likes": 15,
                "comments": 3,
                "shares": 2,
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "user": {"id": "user_456", "name": "Jane Smith", "avatar": "https://example.com/avatar2.jpg"},
                "type": "nutrition_share",
                "title": "Healthy Meal Prep Sunday",
                "content": "Prepped my meals for the week! High protein, low carb, and delicious! 🥗",
                "data": {
                    "meals": 7,
                    "calories_per_meal": 450,
                    "protein": "35g",
                    "carbs": "25g"
                },
                "likes": 23,
                "comments": 7,
                "shares": 5,
                "created_at": datetime.utcnow().isoformat()
            }
        ],
        "total_posts": 2,
        "has_more": False
    }

@app.post("/api/social/share", tags=["Social"])
async def share_health_data():
    """Share health data with friends"""
    return {
        "message": "Health data shared successfully!",
        "post_id": str(uuid.uuid4()),
        "visibility": "friends",
        "shared_at": datetime.utcnow().isoformat(),
        "reach": {
            "friends": 45,
            "followers": 120,
            "estimated_views": 200
        }
    }

# Heartbeat monitoring endpoints
@app.get("/api/heartbeat/current", tags=["Heartbeat"])
async def get_current_heartbeat():
    """Get current heartbeat status"""
    return {
        "user_id": "user_123",
        "current_heart_rate": 72,
        "activity_level": "resting",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "normal",
        "trend": "stable",
        "device": "Apple Watch",
        "location": {
            "lat": 37.7749,
            "lng": -122.4194,
            "name": "San Francisco, CA"
        }
    }

@app.get("/api/heartbeat/history", tags=["Heartbeat"])
async def get_heartbeat_history():
    """Get heartbeat history"""
    return {
        "user_id": "user_123",
        "data": [
            {
                "timestamp": datetime.utcnow().isoformat(),
                "heart_rate": 72,
                "activity_level": "resting"
            },
            {
                "timestamp": (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
                "heart_rate": 68,
                "activity_level": "resting"
            },
            {
                "timestamp": (datetime.utcnow() - timedelta(minutes=10)).isoformat(),
                "heart_rate": 75,
                "activity_level": "light"
            }
        ],
        "summary": {
            "average_heart_rate": 71.7,
            "min_heart_rate": 68,
            "max_heart_rate": 75,
            "resting_heart_rate": 65,
            "total_readings": 3
        }
    }

# Finance AI endpoints
@app.post("/api/ai/finance/analyze", tags=["AI"])
async def analyze_financial_data():
    """Analyze financial data using AI"""
    return {
        "analysis": {
            "spending_patterns": [
                "You spend 29% of your income on housing",
                "Your food spending is 12.9% of total expenses",
                "Entertainment spending increased by 15% this month",
                "You have a healthy savings rate of 27.1%"
            ],
            "recommendations": [
                "Consider refinancing your mortgage to lower housing costs",
                "Set up automatic savings transfers to increase savings",
                "Review subscription services to reduce entertainment costs",
                "Diversify your investment portfolio"
            ],
            "risk_assessment": {
                "credit_utilization": "Low risk (15%)",
                "debt_to_income": "Moderate risk (35%)",
                "emergency_fund": "Good (3 months of expenses)",
                "investment_diversification": "Needs improvement"
            },
            "opportunities": [
                "You qualify for better credit card offers",
                "Consider opening a high-yield savings account",
                "Your credit score qualifies you for lower loan rates",
                "You could benefit from tax-advantaged accounts"
            ]
        },
        "ai_insights": [
            "Your financial health score is 78/100",
            "You're on track for your retirement goals",
            "Consider increasing your emergency fund",
            "Your spending habits are improving month-over-month"
        ]
    }

@app.post("/api/ai/finance/budget", tags=["AI"])
async def create_ai_budget():
    """Create AI-powered budget recommendations"""
    return {
        "budget_recommendations": {
            "housing": {"recommended": 1800, "current": 1800, "status": "optimal"},
            "food_dining": {"recommended": 600, "current": 800, "status": "over"},
            "transportation": {"recommended": 400, "current": 400, "status": "optimal"},
            "utilities": {"recommended": 300, "current": 300, "status": "optimal"},
            "entertainment": {"recommended": 400, "current": 500, "status": "over"},
            "shopping": {"recommended": 500, "current": 600, "status": "over"},
            "healthcare": {"recommended": 200, "current": 200, "status": "optimal"},
            "insurance": {"recommended": 300, "current": 300, "status": "optimal"},
            "taxes": {"recommended": 500, "current": 500, "status": "optimal"},
            "debt_payment": {"recommended": 800, "current": 800, "status": "optimal"},
            "savings": {"recommended": 1000, "current": 0, "status": "under"},
            "investment": {"recommended": 500, "current": 0, "status": "under"}
        },
        "total_recommended": 6800,
        "total_current": 6200,
        "savings_potential": 600,
        "ai_suggestions": [
            "Reduce food spending by $200/month",
            "Cut entertainment budget by $100/month",
            "Reduce shopping expenses by $100/month",
            "Increase savings by $600/month"
        ]
    }

@app.post("/api/ai/finance/forecast", tags=["AI"])
async def forecast_financial_future():
    """Forecast financial future using AI"""
    return {
        "forecast": {
            "next_3_months": {
                "projected_income": 25500,
                "projected_expenses": 18600,
                "projected_savings": 6900,
                "savings_rate": 27.1
            },
            "next_6_months": {
                "projected_income": 51000,
                "projected_expenses": 37200,
                "projected_savings": 13800,
                "savings_rate": 27.1
            },
            "next_12_months": {
                "projected_income": 102000,
                "projected_expenses": 74400,
                "projected_savings": 27600,
                "savings_rate": 27.1
            }
        },
        "goals_progress": {
            "emergency_fund": {"target": 15000, "projected": 13800, "completion": 92},
            "vacation_fund": {"target": 5000, "projected": 4600, "completion": 92},
            "house_down_payment": {"target": 50000, "projected": 27600, "completion": 55}
        },
        "ai_predictions": [
            "You'll reach your emergency fund goal in 1 month",
            "Vacation fund will be complete in 1 month",
            "House down payment will take 18 more months",
            "Your credit score will improve to 760 by year-end"
        ]
    }

# Chat AI endpoints
@app.post("/api/ai/chat/summarize", tags=["AI"])
async def summarize_conversation():
    """Summarize a conversation using AI"""
    return {
        "summary": {
            "conversation_id": "conv_123",
            "participants": ["user_123", "user_456"],
            "total_messages": 45,
            "key_topics": [
                "Project planning for Q4",
                "Team meeting schedule",
                "Client presentation feedback"
            ],
            "action_items": [
                "Schedule follow-up meeting",
                "Prepare presentation slides",
                "Send project timeline"
            ],
            "sentiment": "positive",
            "summary_text": "The conversation focused on Q4 project planning with positive sentiment. Key topics included team meetings and client presentations. Action items were identified for follow-up.",
            "duration": "2 hours 15 minutes",
            "most_active_participant": "user_123"
        },
        "ai_insights": [
            "High engagement during project discussions",
            "Positive team collaboration",
            "Clear action items identified"
        ]
    }

@app.post("/api/ai/chat/suggest", tags=["AI"])
async def suggest_responses():
    """Suggest responses using AI"""
    return {
        "suggestions": [
            {
                "text": "That sounds great! Let's schedule it for tomorrow.",
                "confidence": 0.85,
                "context": "responding to meeting request"
            },
            {
                "text": "I'll get back to you with the details soon.",
                "confidence": 0.78,
                "context": "responding to information request"
            },
            {
                "text": "Thanks for the update! 👍",
                "confidence": 0.92,
                "context": "responding to status update"
            },
            {
                "text": "Can you share more details about that?",
                "confidence": 0.76,
                "context": "asking for clarification"
            }
        ],
        "quick_replies": [
            "👍", "👎", "❤️", "😂", "🎉", "🔥", "💯"
        ]
    }

@app.post("/api/ai/chat/translate", tags=["AI"])
async def translate_message():
    """Translate message using AI"""
    return {
        "original_text": "Hello, how are you?",
        "translated_text": "Hola, ¿cómo estás?",
        "source_language": "en",
        "target_language": "es",
        "confidence": 0.95,
        "detected_language": "en"
    }

@app.post("/api/ai/chat/sentiment", tags=["AI"])
async def analyze_sentiment():
    """Analyze message sentiment using AI"""
    return {
        "message_id": "msg_123",
        "sentiment": "positive",
        "confidence": 0.87,
        "emotions": {
            "joy": 0.75,
            "excitement": 0.60,
            "satisfaction": 0.45
        },
        "suggestions": [
            "Consider using more positive language",
            "Great tone for team communication"
        ]
    }

# Travel AI endpoints
@app.post("/api/ai/travel/plan", tags=["AI"])
async def plan_travel_trip():
    """Plan a travel trip using AI"""
    return {
        "trip_plan": {
            "destination": "Paris, France",
            "duration": 7,
            "budget": 2500,
            "currency": "USD",
            "itinerary": [
                {
                    "day": 1,
                    "activities": ["Eiffel Tower", "Seine River Cruise", "Dinner at local bistro"],
                    "accommodation": "Hotel in 7th arrondissement"
                },
                {
                    "day": 2,
                    "activities": ["Louvre Museum", "Notre-Dame", "Champs-Élysées"],
                    "accommodation": "Hotel in 7th arrondissement"
                }
            ],
            "flights": {
                "outbound": "American Airlines AA123",
                "return": "American Airlines AA124",
                "total_cost": 800
            },
            "hotels": {
                "name": "Hotel Paris",
                "total_cost": 700,
                "nights": 6
            },
            "activities": {
                "total_cost": 400,
                "recommendations": ["Museum Pass", "Food Tour", "Day Trip to Versailles"]
            }
        },
        "ai_recommendations": [
            "Book flights 3 months in advance for best rates",
            "Consider a Paris Pass for attractions",
            "Reserve restaurants in advance",
            "Pack comfortable walking shoes"
        ],
        "budget_breakdown": {
            "flights": 32,
            "accommodation": 28,
            "activities": 16,
            "food": 15,
            "transportation": 9
        }
    }

@app.post("/api/ai/travel/recommend", tags=["AI"])
async def get_travel_recommendations():
    """Get AI-powered travel recommendations"""
    return {
        "recommendations": [
            {
                "destination": "Tokyo, Japan",
                "reason": "Based on your interest in technology and culture",
                "score": 0.95,
                "best_time": "March-May or September-November",
                "budget_range": "Medium-High",
                "highlights": ["Shibuya Crossing", "Tsukiji Market", "Mount Fuji"]
            },
            {
                "destination": "Barcelona, Spain",
                "reason": "Perfect for your preferred 7-day trips with rich culture",
                "score": 0.88,
                "best_time": "May-June or September-October",
                "budget_range": "Medium",
                "highlights": ["Sagrada Familia", "Park Güell", "Gothic Quarter"]
            },
            {
                "destination": "Bali, Indonesia",
                "reason": "Great value for money with beautiful beaches and culture",
                "score": 0.82,
                "best_time": "April-October",
                "budget_range": "Low-Medium",
                "highlights": ["Ubud Monkey Forest", "Nusa Penida", "Rice Terraces"]
            }
        ],
        "personalized_insights": {
            "preferred_climate": "Mild temperatures",
            "budget_preference": "Medium range",
            "travel_style": "Cultural exploration",
            "group_size": "Couple/Small group"
        }
    }

# Chat Features
@app.get("/api/chat/status", tags=["Chat"])
async def get_chat_status():
    """Get chat system status"""
    return {
        "status": "online",
        "active_users": 1250,
        "active_conversations": 890,
        "messages_sent_today": 15420,
        "calls_active": 45,
        "system_health": "excellent",
        "last_updated": datetime.utcnow().isoformat()
    }

@app.get("/api/chat/features", tags=["Chat"])
async def get_chat_features():
    """Get available chat features"""
    return {
        "real_time_messaging": {
            "enabled": True,
            "features": ["instant delivery", "typing indicators", "read receipts", "message reactions"]
        },
        "voice_video_calls": {
            "enabled": True,
            "features": ["1-on-1 calls", "group calls", "screen sharing", "call recording"]
        },
        "file_sharing": {
            "enabled": True,
            "features": ["images", "videos", "documents", "audio files", "voice messages"]
        },
        "ai_features": {
            "enabled": True,
            "features": ["smart replies", "conversation summaries", "sentiment analysis", "translation"]
        },
        "emoji_reactions": {
            "enabled": True,
            "features": ["emoji picker", "quick reactions", "custom emojis", "emoji suggestions"]
        },
        "search": {
            "enabled": True,
            "features": ["message search", "file search", "contact search", "advanced filters"]
        }
    }

# Progress tracking endpoints
@app.get("/api/progress/summary", tags=["Progress"])
async def get_progress_summary():
    """Get overall progress summary"""
    return {
        "user_id": "user_123",
        "period": "this_week",
        "summary": {
            "workouts_completed": 4,
            "total_workout_time": 180,  # minutes
            "calories_burned": 1200,
            "steps_taken": 45000,
            "weight_change": -1.2,  # kg
            "goals_achieved": 2,
            "streak_days": 7
        },
        "goals": [
            {
                "id": "goal_1",
                "name": "Lose 5kg",
                "progress": 60,
                "current": 3,
                "target": 5,
                "unit": "kg"
            },
            {
                "id": "goal_2",
                "name": "Run 5K",
                "progress": 100,
                "current": 5.2,
                "target": 5,
                "unit": "km",
                "achieved": True
            }
        ],
        "achievements": [
            {
                "id": "ach_1",
                "title": "7-Day Workout Streak",
                "description": "Completed workouts for 7 consecutive days",
                "earned_at": datetime.utcnow().isoformat()
            }
        ]
    }

@app.get("/api/progress/trends", tags=["Progress"])
async def get_progress_trends():
    """Get progress trends over time"""
    return {
        "user_id": "user_123",
        "period": "last_30_days",
        "trends": {
            "weight": {
                "data": [75.2, 74.8, 74.5, 74.1, 73.8, 73.5, 73.2],
                "trend": "decreasing",
                "change": -2.0
            },
            "workouts": {
                "data": [3, 4, 2, 5, 4, 3, 4],
                "trend": "stable",
                "average": 3.6
            },
            "calories_burned": {
                "data": [800, 950, 600, 1100, 900, 750, 950],
                "trend": "increasing",
                "average": 864
            }
        },
        "insights": [
            "Your weight loss is consistent and healthy",
            "Workout frequency is stable and sustainable",
            "Calorie burn is trending upward"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENVIRONMENT") == "development",
        log_level="info"
    )
