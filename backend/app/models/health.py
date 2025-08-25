from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ActivityType(str, Enum):
    walking = "walking"
    running = "running"
    cycling = "cycling"
    swimming = "swimming"
    gym = "gym"
    yoga = "yoga"
    pilates = "pilates"
    dancing = "dancing"
    hiking = "hiking"
    sports = "sports"
    other = "other"

class NutritionType(str, Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"
    pre_workout = "pre_workout"
    post_workout = "post_workout"

class HealthMetricType(str, Enum):
    weight = "weight"
    body_fat = "body_fat"
    muscle_mass = "muscle_mass"
    heart_rate = "heart_rate"
    blood_pressure = "blood_pressure"
    sleep_hours = "sleep_hours"
    water_intake = "water_intake"
    steps = "steps"
    calories_burned = "calories_burned"
    mood = "mood"
    energy_level = "energy_level"

class MoodLevel(str, Enum):
    excellent = "excellent"
    good = "good"
    okay = "okay"
    poor = "poor"
    terrible = "terrible"

class EnergyLevel(str, Enum):
    very_high = "very_high"
    high = "high"
    medium = "medium"
    low = "low"
    very_low = "very_low"

class WorkoutPlan(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    description: Optional[str] = None
    type: ActivityType
    duration: int  # in minutes
    intensity: str = Field(..., pattern="^(low|moderate|high)$")
    exercises: List[Dict[str, Any]] = []
    schedule: Dict[str, Any] = {}
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WorkoutSession(BaseModel):
    id: Optional[str] = None
    user_id: str
    workout_plan_id: Optional[str] = None
    name: str
    type: ActivityType
    duration: int  # in minutes
    intensity: str
    calories_burned: Optional[int] = None
    heart_rate: Optional[Dict[str, int]] = None  # {avg, max, min}
    location: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    completed: bool = False
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class NutritionEntry(BaseModel):
    id: Optional[str] = None
    user_id: str
    date: datetime = Field(default_factory=datetime.utcnow)
    meal_type: NutritionType
    foods: List[Dict[str, Any]] = []
    total_calories: Optional[int] = None
    total_protein: Optional[float] = None
    total_carbs: Optional[float] = None
    total_fat: Optional[float] = None
    total_fiber: Optional[float] = None
    water_intake: Optional[int] = None  # in ml
    supplements: List[Dict[str, Any]] = []
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class HealthMetric(BaseModel):
    id: Optional[str] = None
    user_id: str
    date: datetime = Field(default_factory=datetime.utcnow)
    metric_type: HealthMetricType
    value: float
    unit: str
    notes: Optional[str] = None
    source: Optional[str] = None  # manual, device, app
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DailyHealthSummary(BaseModel):
    id: Optional[str] = None
    user_id: str
    date: datetime = Field(default_factory=datetime.utcnow)
    steps: Optional[int] = None
    calories_burned: Optional[int] = None
    calories_consumed: Optional[int] = None
    water_intake: Optional[int] = None  # in ml
    sleep_hours: Optional[float] = None
    heart_rate_avg: Optional[int] = None
    mood: Optional[MoodLevel] = None
    energy_level: Optional[EnergyLevel] = None
    weight: Optional[float] = None
    body_fat: Optional[float] = None
    muscle_mass: Optional[float] = None
    workouts_completed: int = 0
    meals_logged: int = 0
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class HealthGoal(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    description: Optional[str] = None
    type: str  # weight_loss, muscle_gain, endurance, strength, etc.
    target_value: float
    current_value: float = 0
    unit: str
    deadline: datetime
    status: str = Field(default="active", pattern="^(active|completed|paused|cancelled)$")
    progress: List[Dict[str, Any]] = []
    milestones: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class HealthAchievement(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    description: str
    type: str  # workout, nutrition, goal, streak, milestone
    criteria: str
    threshold: float
    current_value: float = 0
    achieved: bool = False
    achieved_at: Optional[datetime] = None
    points: int = 0
    badge: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class HealthStreak(BaseModel):
    id: Optional[str] = None
    user_id: str
    type: str  # workout, nutrition, steps, etc.
    current_streak: int = 0
    longest_streak: int = 0
    last_activity_date: Optional[datetime] = None
    start_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class HealthShare(BaseModel):
    id: Optional[str] = None
    user_id: str
    type: str  # workout, achievement, milestone, progress
    title: str
    description: str
    data: Dict[str, Any] = {}
    visibility: str = Field(default="friends", pattern="^(public|friends|private)$")
    likes: int = 0
    comments: int = 0
    shares: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class HeartbeatData(BaseModel):
    id: Optional[str] = None
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    heart_rate: int
    activity_level: str = Field(..., pattern="^(resting|light|moderate|intense)$")
    location: Optional[Dict[str, Any]] = None
    device_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class HealthInsight(BaseModel):
    id: Optional[str] = None
    user_id: str
    type: str  # trend, pattern, recommendation, alert
    title: str
    description: str
    data: Dict[str, Any] = {}
    confidence: float = Field(..., ge=0, le=1)
    actionable: bool = True
    action: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class HealthRecommendation(BaseModel):
    id: Optional[str] = None
    user_id: str
    type: str  # workout, nutrition, lifestyle, medical
    title: str
    description: str
    priority: str = Field(default="medium", pattern="^(low|medium|high|urgent)$")
    actionable: bool = True
    action_items: List[str] = []
    data: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
