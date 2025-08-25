from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import structlog
import uuid

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
