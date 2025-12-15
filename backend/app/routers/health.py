from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import structlog
import uuid
import json
import os
from app.services.ai_service import ai_service

from app.models.health import (
    WorkoutPlan, WorkoutSession, NutritionEntry, HealthMetric,
    DailyHealthSummary, HealthGoal, HealthAchievement, HealthStreak,
    HealthShare, HeartbeatData, HealthInsight, HealthRecommendation,
    ActivityType, NutritionType, HealthMetricType, MoodLevel, EnergyLevel
)

logger = structlog.get_logger()
router = APIRouter()

# Mock user for now - in real app, this would come from authentication
def get_mock_user():
    return {"id": "user_123", "username": "testuser"}

# Request/Response models
class WorkoutPlanCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: ActivityType
    duration: int
    intensity: str
    exercises: List[Dict[str, Any]] = []
    schedule: Dict[str, Any] = {}

class WorkoutSessionCreate(BaseModel):
    workout_plan_id: Optional[str] = None
    name: str
    type: ActivityType
    duration: int
    intensity: str
    calories_burned: Optional[int] = None
    heart_rate: Optional[Dict[str, int]] = None
    location: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class NutritionEntryCreate(BaseModel):
    meal_type: NutritionType
    foods: List[Dict[str, Any]] = []
    total_calories: Optional[int] = None
    total_protein: Optional[float] = None
    total_carbs: Optional[float] = None
    total_fat: Optional[float] = None
    total_fiber: Optional[float] = None
    water_intake: Optional[int] = None
    supplements: List[Dict[str, Any]] = []
    notes: Optional[str] = None

class HealthMetricCreate(BaseModel):
    metric_type: HealthMetricType
    value: float
    unit: str
    notes: Optional[str] = None
    source: Optional[str] = None

class HealthGoalCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: str
    target_value: float
    unit: str
    deadline: datetime

class HealthShareCreate(BaseModel):
    type: str
    title: str
    description: str
    data: Dict[str, Any] = {}
    visibility: str = "friends"

class HeartbeatDataCreate(BaseModel):
    heart_rate: int
    activity_level: str
    location: Optional[Dict[str, Any]] = None
    device_id: Optional[str] = None

# Mock data storage
workout_plans = []
workout_sessions = []
nutrition_entries = []
health_metrics = []
daily_summaries = []
health_goals = []
health_achievements = []
health_streaks = []
health_shares = []
heartbeat_data = []
health_insights = []
health_recommendations = []

# Workout Plans
@router.post("/workout-plans", response_model=WorkoutPlan)
async def create_workout_plan(plan: WorkoutPlanCreate):
    """Create a new workout plan"""
    user = get_mock_user()
    
    workout_plan = WorkoutPlan(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        **plan.dict()
    )
    
    workout_plans.append(workout_plan.dict())
    logger.info(f"Created workout plan for user {user['id']}")
    
    return workout_plan

@router.get("/workout-plans", response_model=List[WorkoutPlan])
async def get_workout_plans(active_only: bool = True):
    """Get user's workout plans"""
    user = get_mock_user()
    
    plans = [plan for plan in workout_plans if plan["user_id"] == user["id"]]
    if active_only:
        plans = [plan for plan in plans if plan["is_active"]]
    
    return plans

@router.get("/workout-plans/{plan_id}", response_model=WorkoutPlan)
async def get_workout_plan(plan_id: str):
    """Get a specific workout plan"""
    user = get_mock_user()
    
    for plan in workout_plans:
        if plan["id"] == plan_id and plan["user_id"] == user["id"]:
            return plan
    
    raise HTTPException(status_code=404, detail="Workout plan not found")

# Workout Sessions
@router.post("/workout-sessions", response_model=WorkoutSession)
async def create_workout_session(session: WorkoutSessionCreate):
    """Log a workout session"""
    user = get_mock_user()
    
    workout_session = WorkoutSession(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        started_at=datetime.utcnow(),
        **session.dict()
    )
    
    workout_sessions.append(workout_session.dict())
    logger.info(f"Logged workout session for user {user['id']}")
    
    return workout_session

@router.get("/workout-sessions", response_model=List[WorkoutSession])
async def get_workout_sessions(
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    type: Optional[ActivityType] = None
):
    """Get user's workout sessions"""
    user = get_mock_user()
    
    sessions = [session for session in workout_sessions if session["user_id"] == user["id"]]
    
    if type:
        sessions = [session for session in sessions if session["type"] == type]
    
    sessions.sort(key=lambda x: x["created_at"], reverse=True)
    return sessions[offset:offset + limit]

@router.put("/workout-sessions/{session_id}/complete")
async def complete_workout_session(session_id: str):
    """Mark a workout session as completed"""
    user = get_mock_user()
    
    for session in workout_sessions:
        if session["id"] == session_id and session["user_id"] == user["id"]:
            session["completed"] = True
            session["completed_at"] = datetime.utcnow().isoformat()
            logger.info(f"Completed workout session {session_id}")
            return {"message": "Workout session completed"}
    
    raise HTTPException(status_code=404, detail="Workout session not found")

# Nutrition
@router.post("/nutrition", response_model=NutritionEntry)
async def log_nutrition(nutrition: NutritionEntryCreate):
    """Log nutrition entry"""
    user = get_mock_user()
    
    nutrition_entry = NutritionEntry(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        **nutrition.dict()
    )
    
    nutrition_entries.append(nutrition_entry.dict())
    logger.info(f"Logged nutrition entry for user {user['id']}")
    
    return nutrition_entry

@router.get("/nutrition", response_model=List[NutritionEntry])
async def get_nutrition_entries(
    date: Optional[datetime] = None,
    meal_type: Optional[NutritionType] = None,
    limit: int = Query(50, le=100)
):
    """Get user's nutrition entries"""
    user = get_mock_user()
    
    entries = [entry for entry in nutrition_entries if entry["user_id"] == user["id"]]
    
    if date:
        entries = [entry for entry in entries if entry["date"].date() == date.date()]
    
    if meal_type:
        entries = [entry for entry in entries if entry["meal_type"] == meal_type]
    
    entries.sort(key=lambda x: x["created_at"], reverse=True)
    return entries[:limit]

# Health Metrics
@router.post("/metrics", response_model=HealthMetric)
async def log_health_metric(metric: HealthMetricCreate):
    """Log a health metric"""
    user = get_mock_user()
    
    health_metric = HealthMetric(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        **metric.dict()
    )
    
    health_metrics.append(health_metric.dict())
    logger.info(f"Logged health metric for user {user['id']}")
    
    return health_metric

@router.get("/metrics", response_model=List[HealthMetric])
async def get_health_metrics(
    metric_type: Optional[HealthMetricType] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(100, le=500)
):
    """Get user's health metrics"""
    user = get_mock_user()
    
    metrics = [metric for metric in health_metrics if metric["user_id"] == user["id"]]
    
    if metric_type:
        metrics = [metric for metric in metrics if metric["metric_type"] == metric_type]
    
    if start_date:
        metrics = [metric for metric in metrics if metric["date"] >= start_date]
    
    if end_date:
        metrics = [metric for metric in metrics if metric["date"] <= end_date]
    
    metrics.sort(key=lambda x: x["created_at"], reverse=True)
    return metrics[:limit]

# Daily Health Summary
@router.get("/daily-summary/{date}", response_model=DailyHealthSummary)
async def get_daily_summary(date: datetime):
    """Get daily health summary"""
    user = get_mock_user()
    
    # Find existing summary or create new one
    for summary in daily_summaries:
        if summary["user_id"] == user["id"] and summary["date"].date() == date.date():
            return summary
    
    # Create new summary
    summary = DailyHealthSummary(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        date=date
    )
    
    daily_summaries.append(summary.dict())
    return summary

@router.put("/daily-summary/{date}")
async def update_daily_summary(date: datetime, summary_data: Dict[str, Any]):
    """Update daily health summary"""
    user = get_mock_user()
    
    for summary in daily_summaries:
        if summary["user_id"] == user["id"] and summary["date"].date() == date.date():
            summary.update(summary_data)
            summary["updated_at"] = datetime.utcnow().isoformat()
            return {"message": "Daily summary updated"}
    
    raise HTTPException(status_code=404, detail="Daily summary not found")

# Health Goals
@router.post("/goals", response_model=HealthGoal)
async def create_health_goal(goal: HealthGoalCreate):
    """Create a new health goal"""
    user = get_mock_user()
    
    health_goal = HealthGoal(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        **goal.dict()
    )
    
    health_goals.append(health_goal.dict())
    logger.info(f"Created health goal for user {user['id']}")
    
    return health_goal

@router.get("/goals", response_model=List[HealthGoal])
async def get_health_goals(status: Optional[str] = None):
    """Get user's health goals"""
    user = get_mock_user()
    
    goals = [goal for goal in health_goals if goal["user_id"] == user["id"]]
    
    if status:
        goals = [goal for goal in goals if goal["status"] == status]
    
    return goals

@router.put("/goals/{goal_id}/progress")
async def update_goal_progress(goal_id: str, current_value: float, notes: Optional[str] = None):
    """Update goal progress"""
    user = get_mock_user()
    
    for goal in health_goals:
        if goal["id"] == goal_id and goal["user_id"] == user["id"]:
            goal["current_value"] = current_value
            goal["progress"].append({
                "date": datetime.utcnow().isoformat(),
                "value": current_value,
                "notes": notes
            })
            goal["updated_at"] = datetime.utcnow().isoformat()
            
            # Check if goal is achieved
            if current_value >= goal["target_value"] and goal["status"] == "active":
                goal["status"] = "completed"
            
            return {"message": "Goal progress updated"}
    
    raise HTTPException(status_code=404, detail="Health goal not found")

# Health Achievements
@router.get("/achievements", response_model=List[HealthAchievement])
async def get_health_achievements(achieved_only: bool = False):
    """Get user's health achievements"""
    user = get_mock_user()
    
    achievements = [achievement for achievement in health_achievements if achievement["user_id"] == user["id"]]
    
    if achieved_only:
        achievements = [achievement for achievement in achievements if achievement["achieved"]]
    
    return achievements

# Health Streaks
@router.get("/streaks", response_model=List[HealthStreak])
async def get_health_streaks():
    """Get user's health streaks"""
    user = get_mock_user()
    
    streaks = [streak for streak in health_streaks if streak["user_id"] == user["id"]]
    return streaks

# Health Sharing
@router.post("/share", response_model=HealthShare)
async def share_health_data(share_data: HealthShareCreate):
    """Share health data with friends"""
    user = get_mock_user()
    
    health_share = HealthShare(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        **share_data.dict()
    )
    
    health_shares.append(health_share.dict())
    logger.info(f"Shared health data for user {user['id']}")
    
    return health_share

@router.get("/shared", response_model=List[HealthShare])
async def get_shared_health_data(visibility: str = "friends"):
    """Get shared health data"""
    user = get_mock_user()
    
    shares = [share for share in health_shares if share["visibility"] in ["public", visibility]]
    return shares

# Heartbeat Data
@router.post("/heartbeat", response_model=HeartbeatData)
async def log_heartbeat(heartbeat: HeartbeatDataCreate):
    """Log heartbeat data"""
    user = get_mock_user()
    
    heartbeat_data_entry = HeartbeatData(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        **heartbeat.dict()
    )
    
    heartbeat_data.append(heartbeat_data_entry.dict())
    logger.info(f"Logged heartbeat data for user {user['id']}")
    
    return heartbeat_data_entry

@router.get("/heartbeat", response_model=List[HeartbeatData])
async def get_heartbeat_data(
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = Query(100, le=1000)
):
    """Get user's heartbeat data"""
    user = get_mock_user()
    
    data = [entry for entry in heartbeat_data if entry["user_id"] == user["id"]]
    
    if start_time:
        data = [entry for entry in data if entry["timestamp"] >= start_time]
    
    if end_time:
        data = [entry for entry in data if entry["timestamp"] <= end_time]
    
    data.sort(key=lambda x: x["timestamp"], reverse=True)
    return data[:limit]

# Health Insights
@router.get("/insights", response_model=List[HealthInsight])
async def get_health_insights(limit: int = Query(10, le=50)):
    """Get AI-generated health insights"""
    user = get_mock_user()
    
    insights = [insight for insight in health_insights if insight["user_id"] == user["id"]]
    insights.sort(key=lambda x: x["created_at"], reverse=True)
    return insights[:limit]

# Health Recommendations
@router.get("/recommendations", response_model=List[HealthRecommendation])
async def get_health_recommendations(priority: Optional[str] = None):
    """Get health recommendations"""
    user = get_mock_user()
    
    recommendations = [rec for rec in health_recommendations if rec["user_id"] == user["id"]]
    
    if priority:
        recommendations = [rec for rec in recommendations if rec["priority"] == priority]
    
    return recommendations

# Analytics and Statistics
@router.get("/analytics/workouts")
async def get_workout_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """Get workout analytics"""
    user = get_mock_user()
    
    sessions = [session for session in workout_sessions if session["user_id"] == user["id"]]
    
    if start_date:
        sessions = [session for session in sessions if session["created_at"] >= start_date]
    
    if end_date:
        sessions = [session for session in sessions if session["created_at"] <= end_date]
    
    total_sessions = len(sessions)
    total_duration = sum(session["duration"] for session in sessions)
    total_calories = sum(session.get("calories_burned", 0) for session in sessions)
    
    # Group by type
    by_type = {}
    for session in sessions:
        session_type = session["type"]
        if session_type not in by_type:
            by_type[session_type] = {"count": 0, "duration": 0, "calories": 0}
        by_type[session_type]["count"] += 1
        by_type[session_type]["duration"] += session["duration"]
        by_type[session_type]["calories"] += session.get("calories_burned", 0)
    
    return {
        "total_sessions": total_sessions,
        "total_duration": total_duration,
        "total_calories": total_calories,
        "by_type": by_type,
        "period": {
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat() if end_date else None
        }
    }

@router.get("/analytics/nutrition")
async def get_nutrition_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """Get nutrition analytics"""
    user = get_mock_user()
    
    entries = [entry for entry in nutrition_entries if entry["user_id"] == user["id"]]
    
    if start_date:
        entries = [entry for entry in entries if entry["date"] >= start_date]
    
    if end_date:
        entries = [entry for entry in entries if entry["date"] <= end_date]
    
    total_calories = sum(entry.get("total_calories", 0) for entry in entries)
    total_protein = sum(entry.get("total_protein", 0) for entry in entries)
    total_carbs = sum(entry.get("total_carbs", 0) for entry in entries)
    total_fat = sum(entry.get("total_fat", 0) for entry in entries)
    total_water = sum(entry.get("water_intake", 0) for entry in entries)
    
    # Group by meal type
    by_meal = {}
    for entry in entries:
        meal_type = entry["meal_type"]
        if meal_type not in by_meal:
            by_meal[meal_type] = {"count": 0, "calories": 0, "protein": 0, "carbs": 0, "fat": 0}
        by_meal[meal_type]["count"] += 1
        by_meal[meal_type]["calories"] += entry.get("total_calories", 0)
        by_meal[meal_type]["protein"] += entry.get("total_protein", 0)
        by_meal[meal_type]["carbs"] += entry.get("total_carbs", 0)
        by_meal[meal_type]["fat"] += entry.get("total_fat", 0)
    
    return {
        "total_calories": total_calories,
        "total_protein": total_protein,
        "total_carbs": total_carbs,
        "total_fat": total_fat,
        "total_water": total_water,
        "by_meal": by_meal,
        "period": {
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat() if end_date else None
        }
    }

# Health Dashboard
@router.get("/dashboard")
async def get_health_dashboard():
    """Get comprehensive health dashboard"""
    user = get_mock_user()
    
    # Get recent data
    recent_workouts = [s for s in workout_sessions if s["user_id"] == user["id"]][:5]
    recent_nutrition = [n for n in nutrition_entries if n["user_id"] == user["id"]][:5]
    recent_metrics = [m for m in health_metrics if m["user_id"] == user["id"]][:10]
    
    # Get active goals
    active_goals = [g for g in health_goals if g["user_id"] == user["id"] and g["status"] == "active"]
    
    # Get recent achievements
    recent_achievements = [a for a in health_achievements if a["user_id"] == user["id"] and a["achieved"]][:5]
    
    # Get current streaks
    current_streaks = [s for s in health_streaks if s["user_id"] == user["id"]]
    
    # Get recent insights
    recent_insights = [i for i in health_insights if i["user_id"] == user["id"]][:3]
    
    return {
        "recent_workouts": recent_workouts,
        "recent_nutrition": recent_nutrition,
        "recent_metrics": recent_metrics,
        "active_goals": active_goals,
        "recent_achievements": recent_achievements,
        "current_streaks": current_streaks,
        "recent_insights": recent_insights,
        "summary": {
            "total_workouts_this_week": len([s for s in recent_workouts if s["created_at"] >= datetime.utcnow() - timedelta(days=7)]),
            "total_calories_this_week": sum(n.get("total_calories", 0) for n in recent_nutrition if n["date"] >= datetime.utcnow() - timedelta(days=7)),
            "active_goals_count": len(active_goals),
            "achievements_this_month": len([a for a in recent_achievements if a["achieved_at"] >= datetime.utcnow() - timedelta(days=30)])
        }
    }

# Additional Request Models
class DuplicateWorkoutRequest(BaseModel):
    new_name: Optional[str] = None
    new_date: Optional[datetime] = None

class ShareWorkoutRequest(BaseModel):
    recipients: List[str] = []
    message: Optional[str] = None
    share_type: str = "link"  # "link", "email", "social"

class RecipeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    ingredients: List[Dict[str, Any]] = []
    instructions: List[str] = []
    servings: int = 1
    prep_time: int = 0  # minutes
    cook_time: int = 0  # minutes
    total_calories: Optional[int] = None
    total_protein: Optional[float] = None
    total_carbs: Optional[float] = None
    total_fat: Optional[float] = None
    tags: List[str] = []

class MealPlanCreate(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    meals: List[Dict[str, Any]] = []  # List of meal entries
    daily_calorie_target: Optional[int] = None
    daily_protein_target: Optional[float] = None
    daily_carb_target: Optional[float] = None
    daily_fat_target: Optional[float] = None

class BarcodeScanRequest(BaseModel):
    barcode: str
    meal_type: Optional[NutritionType] = None

class ProgressPhotoUpload(BaseModel):
    photo_url: str
    notes: Optional[str] = None
    weight: Optional[float] = None
    body_fat: Optional[float] = None

class SleepGoalCreate(BaseModel):
    target_hours: float
    bedtime: Optional[str] = None  # HH:MM format
    wake_time: Optional[str] = None  # HH:MM format
    reminders: List[str] = []

class DeviceConnectRequest(BaseModel):
    device_type: str  # "fitness_tracker", "smartwatch", "scale", etc.
    device_name: str
    device_id: str
    connection_type: str = "bluetooth"  # "bluetooth", "wifi", "api"
    api_key: Optional[str] = None

class AIWorkoutPlanRequest(BaseModel):
    goal: str  # "strength", "endurance", "weight_loss", "flexibility"
    experience_level: str  # "beginner", "intermediate", "advanced"
    frequency: str  # "2_times_week", "3_times_week", etc.
    duration_per_session: int  # minutes
    equipment: List[str] = []
    focus_areas: List[str] = []

class AINutritionPlanRequest(BaseModel):
    goal: str  # "weight_loss", "muscle_gain", "maintenance", "healthy_eating"
    dietary_restrictions: List[str] = []
    cuisine_preferences: List[str] = []
    meals_per_day: int = 3
    calorie_target: int
    protein_target: Optional[float] = None
    carb_target: Optional[float] = None
    fat_target: Optional[float] = None

class AIFormCorrectionRequest(BaseModel):
    exercise_name: str
    video_url: Optional[str] = None
    image_url: Optional[str] = None
    current_form_description: Optional[str] = None

# Mock data storage (additional)
recipes = []
meal_plans = []
progress_photos = []
device_connections = []
device_syncs = []
barcode_scans = []
workout_imports = []
plan_progress = []
favorite_exercises = []
workout_shares = []

# Workout Management - Additional Endpoints
@router.post("/workouts/{workout_id}/duplicate")
async def duplicate_workout(workout_id: str, request: DuplicateWorkoutRequest):
    """Duplicate a workout session"""
    user = get_mock_user()
    
    # Find original workout
    original_workout = None
    for session in workout_sessions:
        if session["id"] == workout_id and session["user_id"] == user["id"]:
            original_workout = session
            break
    
    if not original_workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    # Create duplicate
    new_workout = WorkoutSession(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        workout_plan_id=original_workout.get("workout_plan_id"),
        name=request.new_name or f"{original_workout['name']} (Copy)",
        type=original_workout["type"],
        duration=original_workout["duration"],
        intensity=original_workout["intensity"],
        calories_burned=original_workout.get("calories_burned"),
        heart_rate=original_workout.get("heart_rate"),
        location=original_workout.get("location"),
        notes=original_workout.get("notes"),
        started_at=request.new_date or datetime.utcnow()
    )
    
    workout_sessions.append(new_workout.dict())
    logger.info(f"Duplicated workout {workout_id} to {new_workout.id}")
    
    return new_workout

@router.post("/workouts/{workout_id}/share")
async def share_workout(workout_id: str, request: ShareWorkoutRequest):
    """Share workout"""
    user = get_mock_user()
    
    # Find workout
    workout = None
    for session in workout_sessions:
        if session["id"] == workout_id and session["user_id"] == user["id"]:
            workout = session
            break
    
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    # Generate share link
    share_token = str(uuid.uuid4())
    share_link = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/shared/workout/{share_token}"
    
    workout_share = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "workout_id": workout_id,
        "share_type": request.share_type,
        "share_token": share_token,
        "recipients": request.recipients,
        "message": request.message,
        "visibility": "public" if request.share_type == "link" else "private",
        "created_at": datetime.utcnow().isoformat()
    }
    
    workout_shares.append(workout_share)
    
    return {
        "share_token": share_token,
        "share_link": share_link,
        "recipients": request.recipients,
        "message": request.message,
        "shared_at": datetime.utcnow().isoformat()
    }

@router.post("/workouts/import")
async def import_workout(
    source: str = Form(...),
    file: Optional[UploadFile] = File(None),
    data: Optional[str] = Form(None)
):
    """Import workout from file or external source"""
    user = get_mock_user()
    
    try:
        if source == "file" and file:
            content = await file.read()
            workout_data = json.loads(content.decode('utf-8'))
        elif source == "link" and data:
            workout_data = json.loads(data)
        else:
            raise HTTPException(status_code=400, detail="Invalid import source or missing data")
        
        # Create workout from imported data
        workout = WorkoutSession(
            id=str(uuid.uuid4()),
            user_id=user["id"],
            name=workout_data.get("name", "Imported Workout"),
            type=workout_data.get("type", ActivityType.other),
            duration=workout_data.get("duration", 30),
            intensity=workout_data.get("intensity", "moderate"),
            calories_burned=workout_data.get("calories_burned"),
            notes=workout_data.get("notes")
        )
        
        workout_sessions.append(workout.dict())
        
        # Record import
        workout_imports.append({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "workout_id": workout.id,
            "source": source,
            "imported_at": datetime.utcnow().isoformat()
        })
        
        logger.info(f"Imported workout for user {user['id']}")
        
        return {
            "message": "Workout imported successfully",
            "workout_id": workout.id,
            "workout": workout.dict()
        }
        
    except Exception as e:
        logger.error(f"Error importing workout: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to import workout: {str(e)}")

@router.post("/workouts/export")
async def export_workouts(
    format: str = Query("json", regex="^(json|csv|pdf)$"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """Export workouts to various formats"""
    user = get_mock_user()
    
    # Get user's workouts
    user_workouts = [s for s in workout_sessions if s["user_id"] == user["id"]]
    
    # Filter by date range
    if start_date:
        user_workouts = [w for w in user_workouts if w["created_at"] >= start_date]
    if end_date:
        user_workouts = [w for w in user_workouts if w["created_at"] <= end_date]
    
    export_data = {
        "workouts": user_workouts,
        "total_count": len(user_workouts),
        "exported_at": datetime.utcnow().isoformat()
    }
    
    if format == "json":
        return export_data
    elif format == "csv":
        # In real app, generate CSV
        return {
            "format": "csv",
            "file_url": f"/exports/workouts/workouts.csv",
            "download_link": f"{os.getenv('API_URL', 'http://localhost:8000')}/exports/workouts/workouts.csv"
        }
    elif format == "pdf":
        # In real app, generate PDF
        return {
            "format": "pdf",
            "file_url": f"/exports/workouts/workouts.pdf",
            "download_link": f"{os.getenv('API_URL', 'http://localhost:8000')}/exports/workouts/workouts.pdf"
        }
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format")

# Nutrition - Additional Endpoints
@router.post("/nutrition/scan-barcode")
async def scan_barcode(request: BarcodeScanRequest):
    """Scan barcode to get nutrition information"""
    user = get_mock_user()
    
    # Mock barcode lookup (in real app, use barcode database API)
    mock_barcode_data = {
        "1234567890123": {
            "name": "Protein Bar",
            "brand": "Fitness Brand",
            "calories": 200,
            "protein": 20.0,
            "carbs": 15.0,
            "fat": 5.0,
            "fiber": 3.0,
            "serving_size": "1 bar (50g)"
        }
    }
    
    product_data = mock_barcode_data.get(request.barcode)
    if not product_data:
        raise HTTPException(status_code=404, detail="Product not found in database")
    
    # Record scan
    barcode_scans.append({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "barcode": request.barcode,
        "product_data": product_data,
        "scanned_at": datetime.utcnow().isoformat()
    })
    
    return {
        "barcode": request.barcode,
        "product": product_data,
        "can_add_to_nutrition": True
    }

@router.post("/nutrition/recipes", response_model=Dict[str, Any])
async def add_recipe(recipe: RecipeCreate):
    """Add a custom recipe"""
    user = get_mock_user()
    
    recipe_data = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        **recipe.dict(),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    recipes.append(recipe_data)
    logger.info(f"Added recipe for user {user['id']}")
    
    return recipe_data

@router.put("/nutrition/recipes/{recipe_id}")
async def update_recipe(recipe_id: str, recipe_data: Dict[str, Any]):
    """Update recipe"""
    user = get_mock_user()
    
    recipe = None
    for r in recipes:
        if r["id"] == recipe_id and r["user_id"] == user["id"]:
            recipe = r
            break
    
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    recipe.update(recipe_data)
    recipe["updated_at"] = datetime.utcnow().isoformat()
    
    return {"message": "Recipe updated successfully", "recipe": recipe}

@router.delete("/nutrition/recipes/{recipe_id}")
async def delete_recipe(recipe_id: str):
    """Delete recipe"""
    user = get_mock_user()
    
    global recipes
    recipe_found = False
    for i, r in enumerate(recipes):
        if r["id"] == recipe_id and r["user_id"] == user["id"]:
            recipes.pop(i)
            recipe_found = True
            break
    
    if not recipe_found:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    return {"message": "Recipe deleted successfully"}

@router.post("/nutrition/meal-plans", response_model=Dict[str, Any])
async def create_meal_plan(plan: MealPlanCreate):
    """Create a meal plan"""
    user = get_mock_user()
    
    meal_plan = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        **plan.dict(),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    meal_plans.append(meal_plan)
    logger.info(f"Created meal plan for user {user['id']}")
    
    return meal_plan

@router.put("/nutrition/meal-plans/{plan_id}")
async def update_meal_plan(plan_id: str, plan_data: Dict[str, Any]):
    """Update meal plan"""
    user = get_mock_user()
    
    plan = None
    for p in meal_plans:
        if p["id"] == plan_id and p["user_id"] == user["id"]:
            plan = p
            break
    
    if not plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    
    plan.update(plan_data)
    plan["updated_at"] = datetime.utcnow().isoformat()
    
    return {"message": "Meal plan updated successfully", "plan": plan}

@router.delete("/nutrition/meal-plans/{plan_id}")
async def delete_meal_plan(plan_id: str):
    """Delete meal plan"""
    user = get_mock_user()
    
    global meal_plans
    plan_found = False
    for i, p in enumerate(meal_plans):
        if p["id"] == plan_id and p["user_id"] == user["id"]:
            meal_plans.pop(i)
            plan_found = True
            break
    
    if not plan_found:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    
    return {"message": "Meal plan deleted successfully"}

# Workout Plans - Additional Endpoints
@router.post("/plans/{plan_id}/start")
async def start_plan(plan_id: str):
    """Start a workout plan"""
    user = get_mock_user()
    
    plan = None
    for p in workout_plans:
        if p["id"] == plan_id and p["user_id"] == user["id"]:
            plan = p
            break
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    plan["is_active"] = True
    plan["started_at"] = datetime.utcnow().isoformat()
    
    # Create plan progress tracking
    plan_progress.append({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "plan_id": plan_id,
        "status": "active",
        "started_at": datetime.utcnow().isoformat(),
        "completed_sessions": 0,
        "total_sessions": len(plan.get("schedule", {}).get("sessions", []))
    })
    
    return {"message": "Plan started successfully", "plan": plan}

@router.post("/plans/{plan_id}/pause")
async def pause_plan(plan_id: str):
    """Pause a workout plan"""
    user = get_mock_user()
    
    plan = None
    for p in workout_plans:
        if p["id"] == plan_id and p["user_id"] == user["id"]:
            plan = p
            break
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    plan["is_active"] = False
    plan["paused_at"] = datetime.utcnow().isoformat()
    
    # Update plan progress
    for progress in plan_progress:
        if progress["plan_id"] == plan_id and progress["user_id"] == user["id"]:
            progress["status"] = "paused"
            progress["paused_at"] = datetime.utcnow().isoformat()
            break
    
    return {"message": "Plan paused successfully", "plan": plan}

@router.post("/plans/{plan_id}/complete")
async def complete_plan(plan_id: str):
    """Mark a workout plan as completed"""
    user = get_mock_user()
    
    plan = None
    for p in workout_plans:
        if p["id"] == plan_id and p["user_id"] == user["id"]:
            plan = p
            break
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    plan["is_active"] = False
    plan["completed_at"] = datetime.utcnow().isoformat()
    
    # Update plan progress
    for progress in plan_progress:
        if progress["plan_id"] == plan_id and progress["user_id"] == user["id"]:
            progress["status"] = "completed"
            progress["completed_at"] = datetime.utcnow().isoformat()
            break
    
    return {"message": "Plan completed successfully", "plan": plan}

@router.post("/plans/{plan_id}/share")
async def share_plan(plan_id: str, request: ShareWorkoutRequest):
    """Share workout plan"""
    user = get_mock_user()
    
    plan = None
    for p in workout_plans:
        if p["id"] == plan_id and p["user_id"] == user["id"]:
            plan = p
            break
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    share_token = str(uuid.uuid4())
    share_link = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/shared/plan/{share_token}"
    
    return {
        "share_token": share_token,
        "share_link": share_link,
        "recipients": request.recipients,
        "message": request.message,
        "shared_at": datetime.utcnow().isoformat()
    }

@router.post("/plans/import")
async def import_plan(
    source: str = Form(...),
    file: Optional[UploadFile] = File(None),
    data: Optional[str] = Form(None)
):
    """Import workout plan"""
    user = get_mock_user()
    
    try:
        if source == "file" and file:
            content = await file.read()
            plan_data = json.loads(content.decode('utf-8'))
        elif source == "link" and data:
            plan_data = json.loads(data)
        else:
            raise HTTPException(status_code=400, detail="Invalid import source or missing data")
        
        plan = WorkoutPlan(
            id=str(uuid.uuid4()),
            user_id=user["id"],
            name=plan_data.get("name", "Imported Plan"),
            description=plan_data.get("description"),
            type=plan_data.get("type", ActivityType.other),
            duration=plan_data.get("duration", 30),
            intensity=plan_data.get("intensity", "moderate"),
            exercises=plan_data.get("exercises", []),
            schedule=plan_data.get("schedule", {})
        )
        
        workout_plans.append(plan.dict())
        logger.info(f"Imported plan for user {user['id']}")
        
        return {
            "message": "Plan imported successfully",
            "plan_id": plan.id,
            "plan": plan.dict()
        }
        
    except Exception as e:
        logger.error(f"Error importing plan: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to import plan: {str(e)}")

# Exercises - Additional Endpoints
@router.post("/exercises/{exercise_id}/favorite")
async def favorite_exercise(exercise_id: str):
    """Add exercise to favorites"""
    user = get_mock_user()
    
    # Check if already favorited
    for fav in favorite_exercises:
        if fav["exercise_id"] == exercise_id and fav["user_id"] == user["id"]:
            return {"message": "Exercise already in favorites", "favorite": fav}
    
    favorite = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "exercise_id": exercise_id,
        "created_at": datetime.utcnow().isoformat()
    }
    
    favorite_exercises.append(favorite)
    return {"message": "Exercise added to favorites", "favorite": favorite}

@router.get("/exercises/favorites")
async def get_favorite_exercises():
    """Get favorite exercises"""
    user = get_mock_user()
    
    user_favorites = [f for f in favorite_exercises if f["user_id"] == user["id"]]
    
    # In real app, fetch exercise details for each favorite
    exercises = []
    for fav in user_favorites:
        exercises.append({
            "id": fav["exercise_id"],
            "name": "Exercise Name",  # Would fetch from exercise database
            "favorited_at": fav["created_at"]
        })
    
    return {"favorites": exercises, "total": len(exercises)}

# Progress - Additional Endpoints
@router.post("/progress/photos")
async def upload_progress_photo(photo: ProgressPhotoUpload):
    """Upload progress photo"""
    user = get_mock_user()
    
    progress_photo = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "photo_url": photo.photo_url,
        "notes": photo.notes,
        "weight": photo.weight,
        "body_fat": photo.body_fat,
        "created_at": datetime.utcnow().isoformat()
    }
    
    progress_photos.append(progress_photo)
    logger.info(f"Uploaded progress photo for user {user['id']}")
    
    return progress_photo

@router.get("/progress/photos")
async def get_progress_photos(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(50, le=100)
):
    """Get progress photos"""
    user = get_mock_user()
    
    user_photos = [p for p in progress_photos if p["user_id"] == user["id"]]
    
    if start_date:
        user_photos = [p for p in user_photos if datetime.fromisoformat(p["created_at"]) >= start_date]
    if end_date:
        user_photos = [p for p in user_photos if datetime.fromisoformat(p["created_at"]) <= end_date]
    
    user_photos.sort(key=lambda x: x["created_at"], reverse=True)
    return {"photos": user_photos[:limit], "total": len(user_photos)}

@router.delete("/progress/photos/{photo_id}")
async def delete_progress_photo(photo_id: str):
    """Delete progress photo"""
    user = get_mock_user()
    
    global progress_photos
    photo_found = False
    for i, p in enumerate(progress_photos):
        if p["id"] == photo_id and p["user_id"] == user["id"]:
            progress_photos.pop(i)
            photo_found = True
            break
    
    if not photo_found:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    return {"message": "Photo deleted successfully"}

@router.post("/progress/export")
async def export_progress(
    format: str = Query("json", regex="^(json|csv|pdf)$"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """Export progress data"""
    user = get_mock_user()
    
    # Get progress data
    user_metrics = [m for m in health_metrics if m["user_id"] == user["id"]]
    user_photos = [p for p in progress_photos if p["user_id"] == user["id"]]
    
    if start_date:
        user_metrics = [m for m in user_metrics if m["date"] >= start_date]
        user_photos = [p for p in user_photos if datetime.fromisoformat(p["created_at"]) >= start_date]
    if end_date:
        user_metrics = [m for m in user_metrics if m["date"] <= end_date]
        user_photos = [p for p in user_photos if datetime.fromisoformat(p["created_at"]) <= end_date]
    
    export_data = {
        "metrics": user_metrics,
        "photos": user_photos,
        "exported_at": datetime.utcnow().isoformat()
    }
    
    if format == "json":
        return export_data
    elif format == "csv":
        return {
            "format": "csv",
            "file_url": f"/exports/progress/progress.csv",
            "download_link": f"{os.getenv('API_URL', 'http://localhost:8000')}/exports/progress/progress.csv"
        }
    elif format == "pdf":
        return {
            "format": "pdf",
            "file_url": f"/exports/progress/progress.pdf",
            "download_link": f"{os.getenv('API_URL', 'http://localhost:8000')}/exports/progress/progress.pdf"
        }
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format")

@router.post("/progress/share")
async def share_progress(request: ShareWorkoutRequest):
    """Share progress"""
    user = get_mock_user()
    
    share_token = str(uuid.uuid4())
    share_link = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/shared/progress/{share_token}"
    
    return {
        "share_token": share_token,
        "share_link": share_link,
        "recipients": request.recipients,
        "message": request.message,
        "shared_at": datetime.utcnow().isoformat()
    }

# Measurements - Additional Endpoints
@router.post("/measurements/export")
async def export_measurements(
    format: str = Query("json", regex="^(json|csv|pdf)$"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """Export measurements"""
    user = get_mock_user()
    
    user_metrics = [m for m in health_metrics if m["user_id"] == user["id"]]
    
    if start_date:
        user_metrics = [m for m in user_metrics if m["date"] >= start_date]
    if end_date:
        user_metrics = [m for m in user_metrics if m["date"] <= end_date]
    
    export_data = {
        "measurements": user_metrics,
        "exported_at": datetime.utcnow().isoformat()
    }
    
    if format == "json":
        return export_data
    elif format == "csv":
        return {
            "format": "csv",
            "file_url": f"/exports/measurements/measurements.csv",
            "download_link": f"{os.getenv('API_URL', 'http://localhost:8000')}/exports/measurements/measurements.csv"
        }
    elif format == "pdf":
        return {
            "format": "pdf",
            "file_url": f"/exports/measurements/measurements.pdf",
            "download_link": f"{os.getenv('API_URL', 'http://localhost:8000')}/exports/measurements/measurements.pdf"
        }
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format")

# Sleep - Additional Endpoints
@router.post("/sleep/goals")
async def set_sleep_goal(goal: SleepGoalCreate):
    """Set sleep goal"""
    user = get_mock_user()
    
    sleep_goal = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        **goal.dict(),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    # Store in health_goals with type "sleep"
    health_goal = HealthGoal(
        id=sleep_goal["id"],
        user_id=user["id"],
        name="Sleep Goal",
        type="sleep",
        target_value=goal.target_hours,
        unit="hours",
        deadline=datetime.utcnow() + timedelta(days=365)  # Long-term goal
    )
    health_goals.append(health_goal.dict())
    
    return {"message": "Sleep goal set successfully", "goal": sleep_goal}

@router.get("/sleep/trends")
async def get_sleep_trends(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    days: int = Query(30, ge=7, le=365)
):
    """Get sleep trends"""
    user = get_mock_user()
    
    # Get sleep metrics
    sleep_metrics = [m for m in health_metrics if m["user_id"] == user["id"] and m["metric_type"] == HealthMetricType.sleep_hours]
    
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=days)
    if not end_date:
        end_date = datetime.utcnow()
    
    sleep_metrics = [m for m in sleep_metrics if m["date"] >= start_date and m["date"] <= end_date]
    
    # Calculate trends
    avg_sleep = sum(m["value"] for m in sleep_metrics) / len(sleep_metrics) if sleep_metrics else 0
    min_sleep = min((m["value"] for m in sleep_metrics), default=0)
    max_sleep = max((m["value"] for m in sleep_metrics), default=0)
    
    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "average_hours": round(avg_sleep, 2),
        "min_hours": min_sleep,
        "max_hours": max_sleep,
        "data_points": len(sleep_metrics),
        "trend": "stable"  # Would calculate actual trend
    }

# Achievements - Additional Endpoints
@router.post("/achievements/{achievement_id}/share")
async def share_achievement(achievement_id: str, request: ShareWorkoutRequest):
    """Share achievement"""
    user = get_mock_user()
    
    achievement = None
    for a in health_achievements:
        if a["id"] == achievement_id and a["user_id"] == user["id"]:
            achievement = a
            break
    
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    
    share_token = str(uuid.uuid4())
    share_link = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/shared/achievement/{share_token}"
    
    return {
        "share_token": share_token,
        "share_link": share_link,
        "recipients": request.recipients,
        "message": request.message,
        "shared_at": datetime.utcnow().isoformat()
    }

# Device Management - Additional Endpoints
@router.post("/devices/connect")
async def connect_device(request: DeviceConnectRequest):
    """Connect a fitness device"""
    user = get_mock_user()
    
    device_connection = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        **request.dict(),
        "connection_status": "connected",
        "last_sync": datetime.utcnow().isoformat(),
        "connected_at": datetime.utcnow().isoformat()
    }
    
    device_connections.append(device_connection)
    logger.info(f"Connected device for user {user['id']}")
    
    return {"message": "Device connected successfully", "device": device_connection}

@router.get("/devices")
async def list_devices():
    """List connected devices"""
    user = get_mock_user()
    
    user_devices = [d for d in device_connections if d["user_id"] == user["id"]]
    
    return {"devices": user_devices, "total": len(user_devices)}

@router.delete("/devices/{device_id}")
async def disconnect_device(device_id: str):
    """Disconnect device"""
    user = get_mock_user()
    
    global device_connections
    device_found = False
    for i, d in enumerate(device_connections):
        if d["id"] == device_id and d["user_id"] == user["id"]:
            device_connections[i]["connection_status"] = "disconnected"
            device_connections[i]["disconnected_at"] = datetime.utcnow().isoformat()
            device_found = True
            break
    
    if not device_found:
        raise HTTPException(status_code=404, detail="Device not found")
    
    return {"message": "Device disconnected successfully"}

@router.post("/devices/{device_id}/sync")
async def sync_device(device_id: str):
    """Sync data from device"""
    user = get_mock_user()
    
    device = None
    for d in device_connections:
        if d["id"] == device_id and d["user_id"] == user["id"]:
            device = d
            break
    
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    if device["connection_status"] != "connected":
        raise HTTPException(status_code=400, detail="Device is not connected")
    
    # Mock sync (in real app, would fetch from device API)
    sync_record = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "device_id": device_id,
        "sync_status": "success",
        "data_synced": {
            "steps": 8500,
            "calories": 400,
            "heart_rate": 72
        },
        "synced_at": datetime.utcnow().isoformat()
    }
    
    device_syncs.append(sync_record)
    device["last_sync"] = datetime.utcnow().isoformat()
    
    return {"message": "Device synced successfully", "sync": sync_record}

# AI Features - Additional Endpoints
@router.post("/ai/workout-plan")
async def ai_workout_plan(request: AIWorkoutPlanRequest):
    """Generate AI workout plan (enhanced)"""
    try:
        ai_prompt = f"""
        Create a personalized workout plan:
        Goal: {request.goal}
        Experience Level: {request.experience_level}
        Frequency: {request.frequency}
        Duration per Session: {request.duration_per_session} minutes
        Equipment: {', '.join(request.equipment)}
        Focus Areas: {', '.join(request.focus_areas)}
        
        Provide:
        1. Weekly schedule
        2. Exercise details with sets/reps
        3. Progression plan
        4. Rest days
        5. Tips and modifications
        """
        
        ai_plan = await ai_service.generate_response(ai_prompt, request.dict())
        
        return {
            "plan": ai_plan,
            "workout_plan": {
                "name": f"AI {request.goal.title()} Plan",
                "type": ActivityType.gym,
                "duration": request.duration_per_session,
                "intensity": "moderate",
                "exercises": [],
                "schedule": {}
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating AI workout plan: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate workout plan")

@router.post("/ai/nutrition-plan")
async def ai_nutrition_plan(request: AINutritionPlanRequest):
    """Generate AI nutrition plan"""
    try:
        ai_prompt = f"""
        Create a personalized nutrition plan:
        Goal: {request.goal}
        Dietary Restrictions: {', '.join(request.dietary_restrictions)}
        Cuisine Preferences: {', '.join(request.cuisine_preferences)}
        Meals per Day: {request.meals_per_day}
        Calorie Target: {request.calorie_target}
        Protein Target: {request.protein_target}
        Carb Target: {request.carb_target}
        Fat Target: {request.fat_target}
        
        Provide:
        1. Daily meal plan
        2. Recipe suggestions
        3. Shopping list
        4. Meal prep tips
        5. Macro breakdown
        """
        
        ai_plan = await ai_service.generate_response(ai_prompt, request.dict())
        
        return {
            "plan": ai_plan,
            "meal_plan": {
                "name": f"AI {request.goal.replace('_', ' ').title()} Nutrition Plan",
                "daily_calorie_target": request.calorie_target,
                "daily_protein_target": request.protein_target,
                "daily_carb_target": request.carb_target,
                "daily_fat_target": request.fat_target,
                "meals": []
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating AI nutrition plan: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate nutrition plan")

@router.post("/ai/progress-analysis")
async def ai_progress_analysis(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """AI progress analysis"""
    user = get_mock_user()
    
    # Get user data
    user_workouts = [s for s in workout_sessions if s["user_id"] == user["id"]]
    user_metrics = [m for m in health_metrics if m["user_id"] == user["id"]]
    user_nutrition = [n for n in nutrition_entries if n["user_id"] == user["id"]]
    
    if start_date:
        user_workouts = [w for w in user_workouts if w["created_at"] >= start_date]
        user_metrics = [m for m in user_metrics if m["date"] >= start_date]
        user_nutrition = [n for n in user_nutrition if n["date"] >= start_date]
    if end_date:
        user_workouts = [w for w in user_workouts if w["created_at"] <= end_date]
        user_metrics = [m for m in user_metrics if m["date"] <= end_date]
        user_nutrition = [n for n in user_nutrition if n["date"] <= end_date]
    
    try:
        ai_prompt = f"""
        Analyze fitness progress:
        Workouts: {len(user_workouts)} sessions
        Metrics: {len(user_metrics)} data points
        Nutrition: {len(user_nutrition)} entries
        
        Provide:
        1. Progress summary
        2. Trends and patterns
        3. Strengths and areas for improvement
        4. Recommendations
        5. Projected outcomes
        """
        
        ai_analysis = await ai_service.generate_response(ai_prompt, {
            "workouts": user_workouts,
            "metrics": user_metrics,
            "nutrition": user_nutrition
        })
        
        return {
            "analysis": ai_analysis,
            "summary": {
                "total_workouts": len(user_workouts),
                "total_metrics": len(user_metrics),
                "total_nutrition_entries": len(user_nutrition)
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in AI progress analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze progress")

@router.post("/ai/exercise-recommendations")
async def ai_exercise_recommendations(
    goal: str = Query(...),
    experience_level: str = Query(...),
    equipment: List[str] = Query([]),
    focus_areas: List[str] = Query([])
):
    """AI exercise recommendations"""
    try:
        ai_prompt = f"""
        Recommend exercises:
        Goal: {goal}
        Experience Level: {experience_level}
        Available Equipment: {', '.join(equipment) if equipment else 'Bodyweight only'}
        Focus Areas: {', '.join(focus_areas) if focus_areas else 'Full body'}
        
        Provide:
        1. Recommended exercises
        2. Why each exercise is recommended
        3. Sets/reps/weight suggestions
        4. Progression tips
        """
        
        ai_recommendations = await ai_service.generate_response(ai_prompt, {
            "goal": goal,
            "experience_level": experience_level,
            "equipment": equipment,
            "focus_areas": focus_areas
        })
        
        return {
            "recommendations": [],
            "ai_analysis": ai_recommendations,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating exercise recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

@router.post("/ai/form-correction")
async def ai_form_correction(request: AIFormCorrectionRequest):
    """AI form correction"""
    try:
        ai_prompt = f"""
        Analyze exercise form:
        Exercise: {request.exercise_name}
        Form Description: {request.current_form_description}
        Video/Image: {'Provided' if request.video_url or request.image_url else 'Not provided'}
        
        Provide:
        1. Form analysis
        2. Corrections needed
        3. Proper form cues
        4. Common mistakes to avoid
        5. Safety tips
        """
        
        ai_correction = await ai_service.generate_response(ai_prompt, request.dict())
        
        return {
            "exercise": request.exercise_name,
            "corrections": [],
            "ai_analysis": ai_correction,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in AI form correction: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze form")

@router.post("/ai/recovery-recommendations")
async def ai_recovery_recommendations(
    recent_workouts: List[str] = Query([]),
    recovery_goals: List[str] = Query([])
):
    """AI recovery recommendations"""
    user = get_mock_user()
    
    # Get recent workouts
    user_recent_workouts = [s for s in workout_sessions if s["user_id"] == user["id"]][:5]
    
    try:
        ai_prompt = f"""
        Provide recovery recommendations:
        Recent Workouts: {len(user_recent_workouts)} sessions
        Recovery Goals: {', '.join(recovery_goals) if recovery_goals else 'General recovery'}
        
        Provide:
        1. Recovery strategies
        2. Rest day suggestions
        3. Stretching/mobility exercises
        4. Nutrition for recovery
        5. Sleep recommendations
        """
        
        ai_recommendations = await ai_service.generate_response(ai_prompt, {
            "recent_workouts": user_recent_workouts,
            "recovery_goals": recovery_goals
        })
        
        return {
            "recommendations": [],
            "ai_analysis": ai_recommendations,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating recovery recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")
