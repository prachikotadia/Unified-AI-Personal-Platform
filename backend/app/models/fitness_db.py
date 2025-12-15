from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum as SQLEnum, Date, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base

# Enums
class WorkoutType(str, enum.Enum):
    cardio = "cardio"
    strength = "strength"
    yoga = "yoga"
    pilates = "pilates"
    hiit = "hiit"
    running = "running"
    cycling = "cycling"
    swimming = "swimming"
    walking = "walking"
    other = "other"

class ExerciseType(str, enum.Enum):
    compound = "compound"
    isolation = "isolation"
    cardio = "cardio"
    flexibility = "flexibility"
    balance = "balance"

class MuscleGroup(str, enum.Enum):
    chest = "chest"
    back = "back"
    shoulders = "shoulders"
    arms = "arms"
    legs = "legs"
    core = "core"
    full_body = "full_body"

class EquipmentType(str, enum.Enum):
    bodyweight = "bodyweight"
    dumbbells = "dumbbells"
    barbell = "barbell"
    machine = "machine"
    cable = "cable"
    resistance_bands = "resistance_bands"
    kettlebells = "kettlebells"
    other = "other"

class MealType(str, enum.Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"
    pre_workout = "pre_workout"
    post_workout = "post_workout"

class PlanStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    paused = "paused"
    completed = "completed"
    cancelled = "cancelled"

class DeviceType(str, enum.Enum):
    fitness_tracker = "fitness_tracker"
    smartwatch = "smartwatch"
    heart_rate_monitor = "heart_rate_monitor"
    scale = "scale"
    bike_computer = "bike_computer"
    other = "other"

class SyncStatus(str, enum.Enum):
    pending = "pending"
    syncing = "syncing"
    completed = "completed"
    failed = "failed"

# Database Models
class WorkoutSession(Base):
    __tablename__ = "workout_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workout_plan_id = Column(Integer, ForeignKey("workout_plans.id"))
    name = Column(String(200), nullable=False)
    type = Column(SQLEnum(WorkoutType), nullable=False)
    duration = Column(Integer)  # in minutes
    intensity = Column(String(20))  # low, medium, high
    calories_burned = Column(Float)
    heart_rate_avg = Column(Integer)
    heart_rate_max = Column(Integer)
    heart_rate_min = Column(Integer)
    location = Column(String(200))
    notes = Column(Text)
    completed = Column(Boolean, default=False)
    started_at = Column(DateTime)
    ended_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="workout_sessions")
    plan = relationship("WorkoutPlan", back_populates="sessions")
    exercises = relationship("WorkoutExercise", back_populates="session", cascade="all, delete-orphan")
    shares = relationship("WorkoutShare", back_populates="workout", cascade="all, delete-orphan")

class WorkoutExercise(Base):
    __tablename__ = "workout_exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    workout_session_id = Column(Integer, ForeignKey("workout_sessions.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    exercise_name = Column(String(200), nullable=False)
    sets = Column(Integer)
    reps = Column(Integer)
    weight = Column(Float)
    duration = Column(Integer)  # in seconds
    distance = Column(Float)  # in km
    rest_period = Column(Integer)  # in seconds
    notes = Column(Text)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    session = relationship("WorkoutSession", back_populates="exercises")
    exercise = relationship("Exercise", back_populates="workout_exercises")

class Exercise(Base):
    __tablename__ = "exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, unique=True, index=True)
    description = Column(Text)
    type = Column(SQLEnum(ExerciseType), nullable=False)
    muscle_groups = Column(JSON)  # List of muscle groups
    equipment = Column(SQLEnum(EquipmentType))
    difficulty = Column(String(20))  # beginner, intermediate, advanced
    instructions = Column(JSON)  # Step-by-step instructions
    video_url = Column(String(500))
    image_url = Column(String(500))
    calories_per_minute = Column(Float)
    is_custom = Column(Boolean, default=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    workout_exercises = relationship("WorkoutExercise", back_populates="exercise")
    favorites = relationship("ExerciseFavorite", back_populates="exercise", cascade="all, delete-orphan")

class ExerciseFavorite(Base):
    __tablename__ = "exercise_favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="exercise_favorites")
    exercise = relationship("Exercise", back_populates="favorites")

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    goal = Column(String(100))  # weight_loss, muscle_gain, endurance, etc.
    duration_weeks = Column(Integer)
    days_per_week = Column(Integer)
    status = Column(SQLEnum(PlanStatus), default=PlanStatus.draft)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="workout_plans")
    sessions = relationship("WorkoutSession", back_populates="plan")
    plan_days = relationship("WorkoutPlanDay", back_populates="plan", cascade="all, delete-orphan")
    progress = relationship("PlanProgress", back_populates="plan", cascade="all, delete-orphan")
    shares = relationship("WorkoutPlanShare", back_populates="plan", cascade="all, delete-orphan")

class WorkoutPlanDay(Base):
    __tablename__ = "workout_plan_days"
    
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("workout_plans.id"), nullable=False)
    day_number = Column(Integer, nullable=False)  # 1-7 for days of week
    name = Column(String(100))
    exercises = Column(JSON)  # List of exercise configurations
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    plan = relationship("WorkoutPlan", back_populates="plan_days")

class PlanProgress(Base):
    __tablename__ = "plan_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("workout_plans.id"), nullable=False)
    week_number = Column(Integer, nullable=False)
    completion_percentage = Column(Float, default=0)
    workouts_completed = Column(Integer, default=0)
    workouts_planned = Column(Integer, default=0)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    plan = relationship("WorkoutPlan", back_populates="progress")

class WorkoutShare(Base):
    __tablename__ = "workout_shares"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workout_id = Column(Integer, ForeignKey("workout_sessions.id"), nullable=False)
    share_type = Column(String(50), default="public")  # public, friends, private
    share_link = Column(String(500), unique=True, index=True)
    views_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="workout_shares")
    workout = relationship("WorkoutSession", back_populates="shares")

class WorkoutPlanShare(Base):
    __tablename__ = "workout_plan_shares"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("workout_plans.id"), nullable=False)
    share_type = Column(String(50), default="public")
    share_link = Column(String(500), unique=True, index=True)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User")
    plan = relationship("WorkoutPlan", back_populates="shares")

class NutritionEntry(Base):
    __tablename__ = "nutrition_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    meal_type = Column(SQLEnum(MealType), nullable=False)
    foods = Column(JSON)  # List of food items with nutrition data
    total_calories = Column(Float)
    total_protein = Column(Float)
    total_carbs = Column(Float)
    total_fat = Column(Float)
    total_fiber = Column(Float)
    water_intake = Column(Integer)  # in ml
    supplements = Column(JSON)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="nutrition_entries")

class Recipe(Base):
    __tablename__ = "recipes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    servings = Column(Integer, default=1)
    prep_time = Column(Integer)  # in minutes
    cook_time = Column(Integer)  # in minutes
    ingredients = Column(JSON)  # List of ingredients with quantities
    instructions = Column(JSON)  # Step-by-step instructions
    nutrition_info = Column(JSON)  # Per serving nutrition
    image_url = Column(String(500))
    tags = Column(JSON)  # List of tags (vegetarian, gluten-free, etc.)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="recipes")

class MealPlan(Base):
    __tablename__ = "meal_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    daily_calorie_target = Column(Float)
    daily_protein_target = Column(Float)
    daily_carb_target = Column(Float)
    daily_fat_target = Column(Float)
    meals = Column(JSON)  # Structured meal plan data
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="meal_plans")

class ProgressPhoto(Base):
    __tablename__ = "progress_photos"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    photo_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500))
    date = Column(Date, nullable=False)
    body_part = Column(String(50))  # front, side, back, full_body
    weight = Column(Float)
    notes = Column(Text)
    is_private = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="progress_photos")

class DeviceConnection(Base):
    __tablename__ = "device_connections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_name = Column(String(200), nullable=False)
    device_type = Column(SQLEnum(DeviceType), nullable=False)
    manufacturer = Column(String(100))
    model = Column(String(100))
    device_id = Column(String(200), unique=True, index=True)
    connection_status = Column(String(20), default="connected")  # connected, disconnected, error
    last_sync_at = Column(DateTime)
    sync_enabled = Column(Boolean, default=True)
    sync_frequency = Column(String(20), default="realtime")  # realtime, hourly, daily
    battery_level = Column(Integer)
    firmware_version = Column(String(50))
    connection_data = Column(JSON)  # Device-specific connection info
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="device_connections")
    syncs = relationship("DeviceSync", back_populates="device", cascade="all, delete-orphan")

class DeviceSync(Base):
    __tablename__ = "device_syncs"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("device_connections.id"), nullable=False)
    sync_type = Column(String(50))  # workout, nutrition, sleep, heart_rate, steps
    data = Column(JSON)  # Synced data
    status = Column(SQLEnum(SyncStatus), default=SyncStatus.pending)
    records_synced = Column(Integer, default=0)
    error_message = Column(Text)
    started_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime)
    
    # Relationships
    device = relationship("DeviceConnection", back_populates="syncs")

class BarcodeScan(Base):
    __tablename__ = "barcode_scans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    barcode = Column(String(100), nullable=False, index=True)
    product_name = Column(String(200))
    brand = Column(String(100))
    nutrition_data = Column(JSON)  # Nutrition facts
    image_url = Column(String(500))
    source = Column(String(50))  # upc_db, open_food_facts, custom
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="barcode_scans")

class WorkoutImport(Base):
    __tablename__ = "workout_imports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    source = Column(String(100))  # strava, garmin, myfitnesspal, file
    file_path = Column(String(500))
    import_format = Column(String(50))  # json, csv, tcx, gpx
    workouts_imported = Column(Integer, default=0)
    status = Column(String(20), default="pending")  # pending, processing, completed, failed
    error_message = Column(Text)
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="workout_imports")

class SleepEntry(Base):
    __tablename__ = "sleep_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    bedtime = Column(Time)
    wake_time = Column(Time)
    sleep_duration = Column(Float)  # in hours
    sleep_quality = Column(Integer)  # 1-10
    deep_sleep_hours = Column(Float)
    rem_sleep_hours = Column(Float)
    light_sleep_hours = Column(Float)
    awakenings = Column(Integer, default=0)
    sleep_goal_hours = Column(Float)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sleep_entries")

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(50))  # workout, nutrition, consistency, milestone
    icon = Column(String(100))
    unlocked_at = Column(DateTime, default=func.now())
    progress = Column(Float, default=100)  # 0-100
    is_shared = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="achievements")

