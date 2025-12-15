from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import structlog

from app.middleware.auth_middleware import get_current_user, get_current_user_optional
from app.models.user import UserResponse
from app.services.ai_service import ai_service

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
    ai_model: str = "GPT-4"

class InsightRequest(BaseModel):
    module: str
    user_data: Dict[str, Any]

class InsightResponse(BaseModel):
    insights: List[Dict[str, Any]]
    ai_model: str = "GPT-4"

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

class ChatAnalysisRequest(BaseModel):
    messages: List[Dict[str, Any]]

class ModelInfoResponse(BaseModel):
    model: str
    version: str
    capabilities: List[str]
    max_tokens: int
    temperature: float
    provider: str

@router.get("/model-info", response_model=ModelInfoResponse)
async def get_ai_model_info():
    """Get information about the AI model being used"""
    try:
        model_info = await ai_service.get_model_info()
        return ModelInfoResponse(**model_info)
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get model information"
        )

@router.post("/command", response_model=AICommandResponse)
async def process_ai_command(
    request: AICommandRequest,
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    """
    Process natural language commands and execute AI-powered actions using GPT-4
    
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
        user_id = current_user.id if current_user else None
        logger.info(f"Processing GPT-4 AI command for user {user_id}: {request.command}")
        
        # Add user context to the request (handle guest mode)
        user_context = {
            "user_id": user_id,
            "username": current_user.username if current_user else "guest",
            "preferences": current_user.preferences.dict() if current_user and current_user.preferences else {},
        }
        if request.context:
            user_context.update(request.context)
        
        result = await ai_service.process_natural_language_command(
            request.command, 
            user_context
        )
        
        return AICommandResponse(
            action_type=result.get("action_type", "general"),
            response=result.get("response", ""),
            command=request.command,
            executed=result.get("executed", False),
            data=result.get("data"),
            ai_model=result.get("ai_model", "GPT-4")
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
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    """
    Generate AI insights for different modules using GPT-4
    """
    try:
        user_id = current_user.id if current_user else None
        logger.info(f"Generating GPT-4 insights for user {user_id} in module {request.module}")
        
        insights = await ai_service.generate_insights(
            request.module,
            request.user_data
        )
        
        return InsightResponse(
            insights=insights,
            ai_model="GPT-4"
        )
        
    except Exception as e:
        logger.error(f"Error generating insights: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate insights"
        )

class FinanceAnalyzeRequest(BaseModel):
    transactions: List[Dict[str, Any]]
    budgets: List[Dict[str, Any]]

@router.post("/finance/analyze")
async def analyze_financial_data(
    request: FinanceAnalyzeRequest,
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    """
    Analyze financial data using GPT-4's advanced reasoning capabilities
    """
    try:
        user_id = current_user.id if current_user else None
        logger.info(f"Analyzing financial data with GPT-4 for user {user_id}")
        
        analysis = await ai_service.analyze_financial_data(request.transactions, request.budgets)
        
        return {
            "analysis": analysis,
            "ai_model": "GPT-4",
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"Error analyzing financial data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze financial data"
        )

@router.post("/finance/budget-plan")
async def create_budget_plan(
    request: BudgetPlanRequest,
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    """
    Create a personalized budget plan using GPT-4's advanced planning capabilities
    """
    try:
        user_id = current_user.id if current_user else None
        logger.info(f"Creating budget plan with GPT-4 for user {user_id}")
        
        budget_plan = await ai_service.create_budget_plan(
            request.income,
            request.goals,
            request.expenses
        )
        
        return {
            "budget_plan": budget_plan,
            "ai_model": "GPT-4",
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"Error creating budget plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create budget plan"
        )

@router.post("/fitness/workout-plan")
async def create_workout_plan(
    request: WorkoutPlanRequest,
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    """
    Create a personalized workout plan using GPT-4's fitness expertise
    """
    try:
        user_id = current_user.id if current_user else None
        logger.info(f"Creating workout plan with GPT-4 for user {user_id}")
        
        workout_plan = await ai_service.recommend_workout_plan(
            request.fitness_level,
            request.goals,
            request.available_time
        )
        
        return {
            "workout_plan": workout_plan,
            "ai_model": "GPT-4",
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"Error creating workout plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create workout plan"
        )

@router.post("/travel/plan")
async def plan_trip(
    request: TripPlanRequest,
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    """
    Plan a personalized trip using GPT-4's travel expertise
    """
    try:
        user_id = current_user.id if current_user else None
        logger.info(f"Planning trip with GPT-4 for user {user_id}")
        
        trip_plan = await ai_service.plan_trip(
            request.destination,
            request.budget,
            request.duration,
            request.preferences
        )
        
        return {
            "trip_plan": trip_plan,
            "ai_model": "GPT-4",
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"Error planning trip: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to plan trip"
        )

@router.post("/marketplace/recommendations")
async def recommend_products(
    request: ProductRecommendationRequest,
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    """
    Get AI-powered product recommendations using GPT-4
    """
    try:
        user_id = current_user.id if current_user else None
        logger.info(f"Getting product recommendations with GPT-4 for user {user_id}")
        
        recommendations = await ai_service.recommend_products(
            request.preferences,
            request.budget,
            request.category
        )
        
        return {
            "recommendations": recommendations,
            "ai_model": "GPT-4",
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"Error recommending products: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get product recommendations"
        )

@router.post("/social/generate-post")
async def generate_social_post(
    request: SocialPostRequest,
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    """
    Generate social media post content using GPT-4's content creation capabilities
    """
    try:
        user_id = current_user.id if current_user else None
        logger.info(f"Generating social post with GPT-4 for user {user_id}")
        
        post_content = await ai_service.generate_social_post(
            request.topic,
            request.tone,
            request.platform
        )
        
        return {
            "post_content": post_content,
            "ai_model": "GPT-4",
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"Error generating social post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate social post"
        )

@router.post("/chat/analyze-sentiment")
async def analyze_chat_sentiment(
    request: ChatAnalysisRequest,
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    """
    Analyze chat conversation sentiment using GPT-4's advanced NLP capabilities
    """
    try:
        user_id = current_user.id if current_user else None
        logger.info(f"Analyzing chat sentiment with GPT-4 for user {user_id}")
        
        analysis = await ai_service.analyze_chat_sentiment(request.messages)
        
        return {
            "analysis": analysis,
            "ai_model": "GPT-4",
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"Error analyzing chat sentiment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze chat sentiment"
        )

@router.post("/productivity/create-reminder")
async def create_reminder(
    task: str,
    priority: str,
    due_date: datetime,
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    """
    Create a smart reminder with GPT-4's planning capabilities
    """
    try:
        user_id = current_user.id if current_user else None
        logger.info(f"Creating reminder with GPT-4 for user {user_id}")
        
        reminder = await ai_service.create_reminder(task, priority, due_date)
        
        return {
            "reminder": reminder,
            "ai_model": "GPT-4",
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"Error creating reminder: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create reminder"
        )

@router.post("/advanced/function-calling")
async def advanced_function_calling(
    prompt: str,
    functions: Optional[List[Dict[str, Any]]] = None,
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    """
    Use GPT-4's advanced function calling capabilities
    """
    try:
        user_id = current_user.id if current_user else None
        logger.info(f"Using GPT-4 function calling for user {user_id}")
        
        response = await ai_service.generate_advanced_response_with_functions(prompt, functions)
        
        return {
            "response": response,
            "ai_model": "GPT-4",
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"Error with function calling: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process function calling request"
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
