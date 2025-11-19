from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
import structlog

from app.database import get_db
from app.services.ai_service import AIService
from app.middleware.auth_middleware import get_current_user_optional
from app.models.user import UserResponse

load_dotenv()

logger = structlog.get_logger()

app = FastAPI(
    title="OmniLife AI Service",
    description="AI microservice for OmniLife platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-service",
        "version": "1.0.0"
    }

@app.get("/ai/model-info")
async def get_model_info():
    """Get AI model information"""
    ai_service = AIService()
    return await ai_service.get_model_info()

@app.post("/ai/command")
async def process_ai_command(
    command: str,
    context: dict = None,
    current_user: UserResponse = Depends(get_current_user_optional),
    ai_service: AIService = Depends()
):
    """Process AI command"""
    try:
        user_context = {
            "user_id": current_user.id if current_user else "anonymous",
            "username": current_user.username if current_user else "anonymous",
            **(context or {})
        }
        
        result = await ai_service.process_natural_language_command(command, user_context)
        return result
    except Exception as e:
        logger.error(f"Error processing AI command: {e}")
        raise HTTPException(status_code=500, detail="Failed to process command")

@app.post("/ai/finance/analyze")
async def analyze_financial_data(
    transactions: list,
    budgets: list,
    current_user: UserResponse = Depends(get_current_user_optional),
    ai_service: AIService = Depends()
):
    """Analyze financial data"""
    try:
        analysis = await ai_service.analyze_financial_data(transactions, budgets)
        return analysis
    except Exception as e:
        logger.error(f"Error analyzing financial data: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze data")

@app.post("/ai/fitness/workout-plan")
async def create_workout_plan(
    fitness_level: str,
    goals: list,
    available_time: int,
    current_user: UserResponse = Depends(get_current_user_optional),
    ai_service: AIService = Depends()
):
    """Create workout plan"""
    try:
        plan = await ai_service.recommend_workout_plan(fitness_level, goals, available_time)
        return plan
    except Exception as e:
        logger.error(f"Error creating workout plan: {e}")
        raise HTTPException(status_code=500, detail="Failed to create workout plan")

@app.post("/ai/travel/plan")
async def plan_trip(
    destination: str,
    budget: float,
    duration: int,
    preferences: dict,
    current_user: UserResponse = Depends(get_current_user_optional),
    ai_service: AIService = Depends()
):
    """Plan trip"""
    try:
        plan = await ai_service.plan_trip(destination, budget, duration, preferences)
        return plan
    except Exception as e:
        logger.error(f"Error planning trip: {e}")
        raise HTTPException(status_code=500, detail="Failed to plan trip")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port)
