from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import structlog

from app.middleware.auth_middleware import get_current_user
from app.models.user import UserResponse
from app.services.ai_service import AIService

logger = structlog.get_logger()
router = APIRouter()

# Pydantic models for AI requests
class AICommandRequest(BaseModel):
    command: str
    context: Optional[Dict[str, Any]] = None

class AICommandResponse(BaseModel):
    action_type: str
    response: str
    command: str
    executed: bool
    data: Optional[Dict[str, Any]] = None

class InsightRequest(BaseModel):
    module: str
    data: Dict[str, Any]

class InsightResponse(BaseModel):
    insights: List[Dict[str, Any]]
    module: str
    generated_at: datetime

class FinancialAnalysisRequest(BaseModel):
    transactions: List[Dict[str, Any]]
    budgets: List[Dict[str, Any]]

class BudgetPlanRequest(BaseModel):
    income: float
    goals: List[str]
    expenses: Dict[str, float]

class WorkoutPlanRequest(BaseModel):
    fitness_level: str
    goals: List[str]
    available_time: int

class TripPlanRequest(BaseModel):
    destination: str
    budget: float
    duration: int
    preferences: Dict[str, Any]

class ProductRecommendationRequest(BaseModel):
    preferences: Dict[str, Any]
    budget: float
    category: str

class SocialPostRequest(BaseModel):
    topic: str
    tone: str
    platform: str

class ReminderRequest(BaseModel):
    task: str
    priority: str
    due_date: datetime

class ChatAnalysisRequest(BaseModel):
    messages: List[Dict[str, Any]]

@router.post("/command", response_model=AICommandResponse)
async def process_ai_command(
    request: AICommandRequest,
    current_user: UserResponse = Depends(get_current_user),
    ai_service: AIService = Depends()
):
    """
    Process natural language commands and execute AI-powered actions
    
    Examples:
    - "Send message to John about the meeting"
    - "Find products under $100 in electronics"
    - "Create a budget for next month"
    - "Plan a workout for today"
    - "Plan a trip to Paris"
    - "Create a social post about fitness"
    - "Remind me to call the doctor tomorrow"
    """
    try:
        logger.info(f"Processing AI command for user {current_user.id}: {request.command}")
        
        # Add user context to the request
        user_context = {
            "user_id": current_user.id,
            "username": current_user.username,
            "preferences": current_user.preferences.dict() if current_user.preferences else {},
            **request.context or {}
        }
        
        result = await ai_service.process_natural_language_command(
            request.command, 
            user_context
        )
        
        return AICommandResponse(
            action_type=result.get("action_type", "general"),
            response=result.get("response", ""),
            command=request.command,
            executed=result.get("executed", False),
            data=result.get("data")
        )
        
    except Exception as e:
        logger.error(f"Error processing AI command: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process AI command"
        )

@router.post("/insights", response_model=InsightResponse)
async def generate_insights(
    request: InsightRequest,
    current_user: UserResponse = Depends(get_current_user),
    ai_service: AIService = Depends()
):
    """
    Generate AI insights for different modules (finance, fitness, travel, social)
    """
    try:
        logger.info(f"Generating insights for user {current_user.id} in module {request.module}")
        
        insights = await ai_service.generate_insights(request.module, request.data)
        
        return InsightResponse(
            insights=insights,
            module=request.module,
            generated_at=datetime.utcnow()
        )
        
    except Exception as e:
        logger.error(f"Error generating insights: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate insights"
        )

@router.post("/finance/analyze")
async def analyze_financial_data(
    request: FinancialAnalysisRequest,
    current_user: UserResponse = Depends(get_current_user),
    ai_service: AIService = Depends()
):
    """
    Analyze financial data and provide AI-powered insights
    """
    try:
        logger.info(f"Analyzing financial data for user {current_user.id}")
        
        analysis = await ai_service.analyze_financial_data(
            request.transactions,
            request.budgets
        )
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing financial data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze financial data"
        )

@router.post("/finance/budget-plan")
async def create_budget_plan(
    request: BudgetPlanRequest,
    current_user: UserResponse = Depends(get_current_user),
    ai_service: AIService = Depends()
):
    """
    Create a personalized budget plan using AI
    """
    try:
        logger.info(f"Creating budget plan for user {current_user.id}")
        
        budget_plan = await ai_service.create_budget_plan(
            request.income,
            request.goals,
            request.expenses
        )
        
        return budget_plan
        
    except Exception as e:
        logger.error(f"Error creating budget plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create budget plan"
        )

@router.post("/fitness/workout-plan")
async def create_workout_plan(
    request: WorkoutPlanRequest,
    current_user: UserResponse = Depends(get_current_user),
    ai_service: AIService = Depends()
):
    """
    Create a personalized workout plan using AI
    """
    try:
        logger.info(f"Creating workout plan for user {current_user.id}")
        
        workout_plan = await ai_service.recommend_workout_plan(
            request.fitness_level,
            request.goals,
            request.available_time
        )
        
        return workout_plan
        
    except Exception as e:
        logger.error(f"Error creating workout plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create workout plan"
        )

@router.post("/travel/plan")
async def plan_trip(
    request: TripPlanRequest,
    current_user: UserResponse = Depends(get_current_user),
    ai_service: AIService = Depends()
):
    """
    Plan a personalized trip using AI
    """
    try:
        logger.info(f"Planning trip for user {current_user.id} to {request.destination}")
        
        trip_plan = await ai_service.plan_trip(
            request.destination,
            request.budget,
            request.duration,
            request.preferences
        )
        
        return trip_plan
        
    except Exception as e:
        logger.error(f"Error planning trip: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to plan trip"
        )

@router.post("/marketplace/recommendations")
async def recommend_products(
    request: ProductRecommendationRequest,
    current_user: UserResponse = Depends(get_current_user),
    ai_service: AIService = Depends()
):
    """
    Get AI-powered product recommendations
    """
    try:
        logger.info(f"Getting product recommendations for user {current_user.id}")
        
        recommendations = await ai_service.recommend_products(
            request.preferences,
            request.budget,
            request.category
        )
        
        return {"recommendations": recommendations}
        
    except Exception as e:
        logger.error(f"Error recommending products: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get product recommendations"
        )

@router.post("/social/generate-post")
async def generate_social_post(
    request: SocialPostRequest,
    current_user: UserResponse = Depends(get_current_user),
    ai_service: AIService = Depends()
):
    """
    Generate social media post content using AI
    """
    try:
        logger.info(f"Generating social post for user {current_user.id}")
        
        post = await ai_service.generate_social_post(
            request.topic,
            request.tone,
            request.platform
        )
        
        return post
        
    except Exception as e:
        logger.error(f"Error generating social post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate social post"
        )

@router.post("/reminders/create")
async def create_reminder(
    request: ReminderRequest,
    current_user: UserResponse = Depends(get_current_user),
    ai_service: AIService = Depends()
):
    """
    Create a smart reminder with AI suggestions
    """
    try:
        logger.info(f"Creating reminder for user {current_user.id}")
        
        reminder = await ai_service.create_reminder(
            request.task,
            request.priority,
            request.due_date
        )
        
        return reminder
        
    except Exception as e:
        logger.error(f"Error creating reminder: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create reminder"
        )

@router.post("/chat/analyze")
async def analyze_chat_sentiment(
    request: ChatAnalysisRequest,
    current_user: UserResponse = Depends(get_current_user),
    ai_service: AIService = Depends()
):
    """
    Analyze chat conversation sentiment and provide insights
    """
    try:
        logger.info(f"Analyzing chat sentiment for user {current_user.id}")
        
        analysis = await ai_service.analyze_chat_sentiment(request.messages)
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing chat sentiment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze chat sentiment"
        )

@router.get("/health")
async def ai_health_check():
    """
    Check AI service health
    """
    return {
        "status": "healthy",
        "service": "ai",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/capabilities")
async def get_ai_capabilities():
    """
    Get list of AI capabilities and supported actions
    """
    return {
        "capabilities": [
            {
                "name": "Natural Language Processing",
                "description": "Process natural language commands and execute actions",
                "endpoint": "/api/ai/command"
            },
            {
                "name": "Financial Analysis",
                "description": "Analyze financial data and provide insights",
                "endpoint": "/api/ai/finance/analyze"
            },
            {
                "name": "Budget Planning",
                "description": "Create personalized budget plans",
                "endpoint": "/api/ai/finance/budget-plan"
            },
            {
                "name": "Workout Planning",
                "description": "Create personalized workout plans",
                "endpoint": "/api/ai/fitness/workout-plan"
            },
            {
                "name": "Trip Planning",
                "description": "Plan personalized trips",
                "endpoint": "/api/ai/travel/plan"
            },
            {
                "name": "Product Recommendations",
                "description": "Get AI-powered product recommendations",
                "endpoint": "/api/ai/marketplace/recommendations"
            },
            {
                "name": "Social Post Generation",
                "description": "Generate social media content",
                "endpoint": "/api/ai/social/generate-post"
            },
            {
                "name": "Smart Reminders",
                "description": "Create intelligent reminders with suggestions",
                "endpoint": "/api/ai/reminders/create"
            },
            {
                "name": "Chat Analysis",
                "description": "Analyze chat conversations and sentiment",
                "endpoint": "/api/ai/chat/analyze"
            },
            {
                "name": "Insights Generation",
                "description": "Generate insights for different modules",
                "endpoint": "/api/ai/insights"
            }
        ],
        "supported_modules": ["finance", "fitness", "travel", "social", "marketplace", "chat"],
        "supported_actions": [
            "message", "product_search", "budget_create", "workout_plan", 
            "trip_plan", "social_post", "reminder", "general"
        ]
    }
