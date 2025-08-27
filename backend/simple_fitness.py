from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import uuid
import asyncio
from collections import defaultdict

app = FastAPI(title="Fitness API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.device_connections: Dict[str, WebSocket] = {}
        self.connected_devices: Dict[str, Dict[str, Any]] = {}

    async def connect(self, websocket: WebSocket, device_id: Optional[str] = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if device_id:
            self.device_connections[device_id] = websocket

    def disconnect(self, websocket: WebSocket, device_id: Optional[str] = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if device_id and device_id in self.device_connections:
            del self.device_connections[device_id]
        if device_id and device_id in self.connected_devices:
            del self.connected_devices[device_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

    async def send_to_device(self, device_id: str, message: str):
        if device_id in self.device_connections:
            try:
                await self.device_connections[device_id].send_text(message)
            except:
                pass

manager = ConnectionManager()

# Pydantic models
class WorkoutPlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: str
    duration: int
    intensity: str
    exercises: List[Dict[str, Any]]
    schedule: Dict[str, Any]
    is_active: bool = True

class WorkoutPlan(WorkoutPlanBase):
    id: str
    user_id: str
    created_at: str
    updated_at: str

class WorkoutSessionBase(BaseModel):
    workout_plan_id: Optional[str] = None
    name: str
    type: str
    duration: int
    intensity: str
    calories_burned: Optional[int] = None
    heart_rate: Optional[Dict[str, int]] = None
    location: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    started_at: str
    completed_at: Optional[str] = None
    completed: bool = False

class WorkoutSession(WorkoutSessionBase):
    id: str
    user_id: str
    created_at: str
    updated_at: str

class NutritionEntryBase(BaseModel):
    meal_type: str
    foods: List[Dict[str, Any]]
    total_calories: int
    total_protein: int
    total_carbs: int
    total_fat: int
    total_fiber: Optional[int] = None
    water_intake: Optional[int] = None
    supplements: List[Dict[str, str]] = []
    notes: Optional[str] = None

class NutritionEntry(NutritionEntryBase):
    id: str
    user_id: str
    created_at: str
    updated_at: str

class HealthMetricBase(BaseModel):
    metric_type: str
    value: float
    unit: str
    notes: Optional[str] = None
    source: Optional[str] = None

class HealthMetric(HealthMetricBase):
    id: str
    user_id: str
    created_at: str
    updated_at: str

class HealthGoalBase(BaseModel):
    name: str
    description: Optional[str] = None
    goal_type: str
    target_value: float
    current_value: float = 0
    unit: str
    deadline: str
    is_active: bool = True

class HealthGoal(HealthGoalBase):
    id: str
    user_id: str
    created_at: str
    updated_at: str

class HealthAchievementBase(BaseModel):
    name: str
    description: str
    achievement_type: str
    icon: str
    earned_at: str
    progress: Optional[float] = None

class HealthAchievement(HealthAchievementBase):
    id: str
    user_id: str
    created_at: str

class HealthStreakBase(BaseModel):
    streak_type: str
    current_count: int
    longest_count: int
    start_date: str
    last_activity_date: str
    is_active: bool = True

class HealthStreak(HealthStreakBase):
    id: str
    user_id: str
    created_at: str
    updated_at: str

class DailyHealthSummaryBase(BaseModel):
    date: str
    steps: int
    calories_burned: int
    calories_consumed: int
    water_intake: int
    sleep_hours: float
    workouts_completed: int
    goals_achieved: int
    mood: Optional[str] = None
    notes: Optional[str] = None

class DailyHealthSummary(DailyHealthSummaryBase):
    id: str
    user_id: str
    created_at: str
    updated_at: str

class HealthInsightBase(BaseModel):
    insight_type: str
    title: str
    description: str
    data: Dict[str, Any]
    confidence: float
    actionable: bool = True

class HealthInsight(HealthInsightBase):
    id: str
    user_id: str
    created_at: str

class HealthRecommendationBase(BaseModel):
    recommendation_type: str
    title: str
    description: str
    priority: str
    category: str
    data: Dict[str, Any]

class HealthRecommendation(HealthRecommendationBase):
    id: str
    user_id: str
    created_at: str

# Device connection models
class DeviceConnectionInfo(BaseModel):
    id: str
    name: str
    type: str
    connection_method: str
    supported_data_types: List[str]
    battery_level: Optional[int] = None

class FitnessDataUpdate(BaseModel):
    device_id: str
    data_type: str
    value: Any
    timestamp: str
    unit: Optional[str] = None

class SyncProgress(BaseModel):
    device_id: str
    progress: int
    status: str
    message: Optional[str] = None

# In-memory storage
workout_plans: List[WorkoutPlan] = []
workout_sessions: List[WorkoutSession] = []
nutrition_entries: List[NutritionEntry] = []
health_metrics: List[HealthMetric] = []
health_goals: List[HealthGoal] = []
achievements: List[HealthAchievement] = []
streaks: List[HealthStreak] = []
daily_summaries: List[DailyHealthSummary] = []
insights: List[HealthInsight] = []
recommendations: List[HealthRecommendation] = []

def initialize_sample_data():
    global workout_plans, workout_sessions, nutrition_entries, health_metrics, health_goals, achievements, streaks, daily_summaries, insights, recommendations
    
    # Sample workout plans
    workout_plans = [
        WorkoutPlan(
            id="wp1",
            user_id="user_123",
            name="Morning Cardio",
            description="30-minute cardio session",
            type="cardio",
            duration=30,
            intensity="moderate",
            exercises=[
                {"name": "Running", "sets": 1, "duration": 20},
                {"name": "Jumping Jacks", "sets": 3, "reps": 20},
                {"name": "Burpees", "sets": 3, "reps": 10}
            ],
            schedule={"monday": True, "wednesday": True, "friday": True},
            is_active=True,
            created_at="2024-01-01T08:00:00Z",
            updated_at="2024-01-01T08:00:00Z"
        ),
        WorkoutPlan(
            id="wp2",
            user_id="user_123",
            name="Strength Training",
            description="Full body strength workout",
            type="strength",
            duration=45,
            intensity="high",
            exercises=[
                {"name": "Push-ups", "sets": 3, "reps": 15},
                {"name": "Squats", "sets": 3, "reps": 20},
                {"name": "Plank", "sets": 3, "duration": 60}
            ],
            schedule={"tuesday": True, "thursday": True, "saturday": True},
            is_active=True,
            created_at="2024-01-01T08:00:00Z",
            updated_at="2024-01-01T08:00:00Z"
        )
    ]

    # Sample workout sessions
    workout_sessions = [
        WorkoutSession(
            id="ws1",
            user_id="user_123",
            workout_plan_id="wp1",
            name="Morning Run",
            type="cardio",
            duration=25,
            intensity="moderate",
            calories_burned=250,
            heart_rate={"min": 120, "max": 160, "avg": 140},
            started_at="2024-01-15T07:00:00Z",
            completed_at="2024-01-15T07:25:00Z",
            completed=True,
            created_at="2024-01-15T07:00:00Z",
            updated_at="2024-01-15T07:25:00Z"
        ),
        WorkoutSession(
            id="ws2",
            user_id="user_123",
            workout_plan_id="wp2",
            name="Strength Training",
            type="strength",
            duration=40,
            intensity="high",
            calories_burned=300,
            started_at="2024-01-14T18:00:00Z",
            completed_at="2024-01-14T18:40:00Z",
            completed=True,
            created_at="2024-01-14T18:00:00Z",
            updated_at="2024-01-14T18:40:00Z"
        )
    ]

    # Sample nutrition entries
    nutrition_entries = [
        NutritionEntry(
            id="ne1",
            user_id="user_123",
            meal_type="breakfast",
            foods=[
                {"name": "Oatmeal", "calories": 150, "protein": 6, "carbs": 27, "fat": 3, "quantity": 1, "unit": "cup"}
            ],
            total_calories=150,
            total_protein=6,
            total_carbs=27,
            total_fat=3,
            supplements=[],
            created_at="2024-01-15T08:00:00Z",
            updated_at="2024-01-15T08:00:00Z"
        ),
        NutritionEntry(
            id="ne2",
            user_id="user_123",
            meal_type="lunch",
            foods=[
                {"name": "Chicken Breast", "calories": 200, "protein": 35, "carbs": 0, "fat": 4, "quantity": 1, "unit": "piece"},
                {"name": "Brown Rice", "calories": 100, "protein": 2, "carbs": 22, "fat": 1, "quantity": 0.5, "unit": "cup"}
            ],
            total_calories=300,
            total_protein=37,
            total_carbs=22,
            total_fat=5,
            supplements=[],
            created_at="2024-01-15T12:00:00Z",
            updated_at="2024-01-15T12:00:00Z"
        )
    ]

    # Sample health metrics
    health_metrics = [
        HealthMetric(
            id="hm1",
            user_id="user_123",
            metric_type="weight",
            value=70.5,
            unit="kg",
            source="scale",
            created_at="2024-01-15T08:00:00Z",
            updated_at="2024-01-15T08:00:00Z"
        ),
        HealthMetric(
            id="hm2",
            user_id="user_123",
            metric_type="body_fat",
            value=18.5,
            unit="%",
            source="caliper",
            created_at="2024-01-15T08:00:00Z",
            updated_at="2024-01-15T08:00:00Z"
        )
    ]

    # Sample health goals
    health_goals = [
        HealthGoal(
            id="hg1",
            user_id="user_123",
            name="Daily Steps",
            description="Walk 10,000 steps daily",
            goal_type="steps",
            target_value=10000,
            current_value=8420,
            unit="steps",
            deadline=(datetime.now() + timedelta(days=30)).isoformat(),
            created_at="2024-01-01T08:00:00Z",
            updated_at="2024-01-15T08:00:00Z"
        ),
        HealthGoal(
            id="hg2",
            user_id="user_123",
            name="Weight Goal",
            description="Reach target weight",
            goal_type="weight",
            target_value=65.0,
            current_value=70.5,
            unit="kg",
            deadline=(datetime.now() + timedelta(days=90)).isoformat(),
            created_at="2024-01-01T08:00:00Z",
            updated_at="2024-01-15T08:00:00Z"
        )
    ]

    # Sample achievements
    achievements = [
        HealthAchievement(
            id="ha1",
            user_id="user_123",
            name="First Workout",
            description="Completed your first workout",
            achievement_type="workout",
            icon="🏃‍♂️",
            earned_at="2024-01-10T08:00:00Z",
            created_at="2024-01-10T08:00:00Z"
        ),
        HealthAchievement(
            id="ha2",
            user_id="user_123",
            name="7-Day Streak",
            description="Worked out for 7 consecutive days",
            achievement_type="streak",
            icon="🔥",
            earned_at="2024-01-15T08:00:00Z",
            created_at="2024-01-15T08:00:00Z"
        )
    ]

    # Sample streaks
    streaks = [
        HealthStreak(
            id="hs1",
            user_id="user_123",
            streak_type="workout",
            current_count=7,
            longest_count=7,
            start_date=(datetime.now() - timedelta(days=7)).isoformat(),
            last_activity_date=datetime.now().isoformat(),
            is_active=True,
            created_at="2024-01-08T08:00:00Z",
            updated_at="2024-01-15T08:00:00Z"
        )
    ]

    # Sample daily summaries
    daily_summaries = [
        DailyHealthSummary(
            id="dhs1",
            user_id="user_123",
            date="2024-01-15",
            steps=8420,
            calories_burned=420,
            calories_consumed=1800,
            water_intake=2000,
            sleep_hours=7.5,
            workouts_completed=1,
            goals_achieved=1,
            mood="energetic",
            created_at="2024-01-15T08:00:00Z",
            updated_at="2024-01-15T08:00:00Z"
        )
    ]

    # Sample insights
    insights = [
        HealthInsight(
            id="hi1",
            user_id="user_123",
            insight_type="performance",
            title="Improving Cardio Performance",
            description="Your cardio sessions are getting longer and more intense",
            data={"duration_increase": 15, "intensity_improvement": 20},
            confidence=0.85,
            actionable=True,
            created_at="2024-01-15T08:00:00Z"
        )
    ]

    # Sample recommendations
    recommendations = [
        HealthRecommendation(
            id="hr1",
            user_id="user_123",
            recommendation_type="workout",
            title="Try Interval Training",
            description="Add high-intensity intervals to your cardio routine",
            priority="medium",
            category="performance",
            data={"workout_type": "interval", "duration": 20},
            created_at="2024-01-15T08:00:00Z"
        )
    ]

# Initialize sample data
initialize_sample_data()

# WebSocket endpoint for live sync
@app.websocket("/ws/fitness")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "connect_device":
                device_info = message.get("device", {})
                device_id = device_info.get("id")
                
                if device_id:
                    # Store device connection
                    manager.connected_devices[device_id] = {
                        "id": device_id,
                        "name": device_info.get("name", "Unknown Device"),
                        "type": device_info.get("type", "unknown"),
                        "connected": True,
                        "last_sync": datetime.now().isoformat(),
                        "battery_level": device_info.get("battery_level", 100),
                        "supported_data_types": device_info.get("supported_data_types", []),
                        "connection_method": device_info.get("connection_method", "unknown")
                    }
                    
                    # Send connection confirmation
                    await manager.send_personal_message(json.dumps({
                        "type": "device_connected",
                        "device": manager.connected_devices[device_id]
                    }), websocket)
                    
                    # Broadcast to other clients
                    await manager.broadcast(json.dumps({
                        "type": "device_connected",
                        "device": manager.connected_devices[device_id]
                    }))
            
            elif message.get("type") == "disconnect_device":
                device_id = message.get("deviceId")
                if device_id and device_id in manager.connected_devices:
                    device = manager.connected_devices[device_id]
                    del manager.connected_devices[device_id]
                    
                    # Send disconnection confirmation
                    await manager.send_personal_message(json.dumps({
                        "type": "device_disconnected",
                        "deviceId": device_id
                    }), websocket)
                    
                    # Broadcast to other clients
                    await manager.broadcast(json.dumps({
                        "type": "device_disconnected",
                        "deviceId": device_id
                    }))
            
            elif message.get("type") == "sync_request":
                device_id = message.get("deviceId")
                data_types = message.get("dataTypes", [])
                
                # Simulate sync progress
                for progress in range(0, 101, 10):
                    await manager.send_personal_message(json.dumps({
                        "type": "sync_progress",
                        "progress": {
                            "deviceId": device_id,
                            "progress": progress,
                            "status": "syncing" if progress < 100 else "completed",
                            "message": f"Syncing {progress}% complete"
                        }
                    }), websocket)
                    await asyncio.sleep(0.5)
                
                # Send sync completion
                await manager.send_personal_message(json.dumps({
                    "type": "sync_progress",
                    "progress": {
                        "deviceId": device_id,
                        "progress": 100,
                        "status": "completed",
                        "message": "Sync completed successfully"
                    }
                }), websocket)
            
            elif message.get("type") == "fitness_data_update":
                # Handle incoming fitness data from device
                data_update = message.get("data", {})
                device_id = data_update.get("deviceId")
                
                # Process the data update (store in database, etc.)
                # For now, just broadcast to other clients
                await manager.broadcast(json.dumps({
                    "type": "fitness_data_update",
                    "data": data_update
                }))
                
                # Send acknowledgment
                await manager.send_personal_message(json.dumps({
                    "type": "data_update_ack",
                    "deviceId": device_id,
                    "timestamp": datetime.now().isoformat()
                }), websocket)
            
            else:
                # Echo back unknown messages
                await manager.send_personal_message(json.dumps({
                    "type": "echo",
                    "message": message
                }), websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # Broadcast disconnection to other clients
        await manager.broadcast(json.dumps({
            "type": "client_disconnected",
            "message": "A client disconnected"
        }))

# REST API endpoints
@app.get("/")
async def root():
    return {"message": "Fitness API is running"}

@app.get("/api/health/workout-plans")
async def get_workout_plans():
    return workout_plans

@app.post("/api/health/workout-plans")
async def create_workout_plan(plan: WorkoutPlanBase):
    new_plan = WorkoutPlan(
        id=str(uuid.uuid4()),
        user_id="user_123",
        **plan.dict(),
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat()
    )
    workout_plans.append(new_plan)
    return new_plan

@app.get("/api/health/workout-sessions")
async def get_workout_sessions():
    return workout_sessions

@app.post("/api/health/workout-sessions")
async def create_workout_session(session: WorkoutSessionBase):
    new_session = WorkoutSession(
        id=str(uuid.uuid4()),
        user_id="user_123",
        **session.dict(),
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat()
    )
    workout_sessions.append(new_session)
    return new_session

@app.get("/api/health/nutrition")
async def get_nutrition_entries():
    return nutrition_entries

@app.post("/api/health/nutrition")
async def create_nutrition_entry(nutrition: NutritionEntryBase):
    new_entry = NutritionEntry(
        id=str(uuid.uuid4()),
        user_id="user_123",
        **nutrition.dict(),
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat()
    )
    nutrition_entries.append(new_entry)
    return new_entry

@app.get("/api/health/metrics")
async def get_health_metrics():
    return health_metrics

@app.post("/api/health/metrics")
async def create_health_metric(metric: HealthMetricBase):
    new_metric = HealthMetric(
        id=str(uuid.uuid4()),
        user_id="user_123",
        **metric.dict(),
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat()
    )
    health_metrics.append(new_metric)
    return new_metric

@app.get("/api/health/goals")
async def get_health_goals():
    return health_goals

@app.post("/api/health/goals")
async def create_health_goal(goal: HealthGoalBase):
    new_goal = HealthGoal(
        id=str(uuid.uuid4()),
        user_id="user_123",
        **goal.dict(),
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat()
    )
    health_goals.append(new_goal)
    return new_goal

@app.get("/api/health/achievements")
async def get_achievements():
    return achievements

@app.get("/api/health/streaks")
async def get_streaks():
    return streaks

@app.get("/api/health/daily-summary")
async def get_daily_summary():
    return daily_summaries

@app.post("/api/health/daily-summary")
async def create_daily_summary(summary: DailyHealthSummaryBase):
    new_summary = DailyHealthSummary(
        id=str(uuid.uuid4()),
        user_id="user_123",
        **summary.dict(),
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat()
    )
    daily_summaries.append(new_summary)
    return new_summary

@app.get("/api/health/insights")
async def get_insights():
    return insights

@app.get("/api/health/recommendations")
async def get_recommendations():
    return recommendations

@app.get("/api/health/dashboard")
async def get_dashboard():
    # Calculate dashboard metrics
    total_workouts = len(workout_sessions)
    total_calories_burned = sum(session.calories_burned or 0 for session in workout_sessions)
    current_streak = max((streak.current_count for streak in streaks), default=0)
    total_achievements = len(achievements)
    
    return {
        "total_workouts": total_workouts,
        "total_calories_burned": total_calories_burned,
        "current_streak": current_streak,
        "total_achievements": total_achievements,
        "recent_workouts": workout_sessions[-5:],
        "recent_nutrition": nutrition_entries[-5:],
        "goals_progress": health_goals
    }

@app.get("/api/health/analytics")
async def get_analytics():
    # Calculate analytics
    workout_types = defaultdict(int)
    for session in workout_sessions:
        workout_types[session.type] += 1
    
    nutrition_totals = {
        "total_calories": sum(entry.total_calories for entry in nutrition_entries),
        "total_protein": sum(entry.total_protein for entry in nutrition_entries),
        "total_carbs": sum(entry.total_carbs for entry in nutrition_entries),
        "total_fat": sum(entry.total_fat for entry in nutrition_entries)
    }
    
    return {
        "workout_types": dict(workout_types),
        "nutrition_totals": nutrition_totals,
        "weekly_progress": {
            "workouts": len([s for s in workout_sessions if s.created_at > (datetime.now() - timedelta(days=7)).isoformat()]),
            "calories_burned": sum(s.calories_burned or 0 for s in workout_sessions if s.created_at > (datetime.now() - timedelta(days=7)).isoformat())
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
