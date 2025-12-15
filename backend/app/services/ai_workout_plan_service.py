import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.fitness_db import WorkoutPlan, WorkoutSession, PlanStatus
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

# LangChain service - optional
try:
    from app.services.langchain_service import langchain_service
except ImportError:
    langchain_service = None

class AIWorkoutPlanService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    async def generate_workout_plan(
        self,
        db: Session,
        user_id: int,
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate AI-powered workout plan"""
        try:
            # Get user's workout history for personalization
            recent_workouts = db.query(WorkoutSession).filter(
                WorkoutSession.user_id == user_id
            ).order_by(desc(WorkoutSession.started_at)).limit(10).all()

            workout_history = self._analyze_workout_history(recent_workouts)

            # Generate plan using AI
            if langchain_service:
                plan = await self._generate_with_ai(preferences, workout_history)
            else:
                plan = self._generate_mock_plan(preferences)

            # Create workout plan in database
            workout_plan = WorkoutPlan(
                user_id=user_id,
                name=plan.get("name", "AI Generated Plan"),
                description=plan.get("description"),
                goal=preferences.get("goal", "general_fitness"),
                duration_weeks=preferences.get("duration_weeks", 4),
                days_per_week=preferences.get("days_per_week", 3),
                status=PlanStatus.draft
            )

            db.add(workout_plan)
            db.commit()
            db.refresh(workout_plan)

            return {
                "success": True,
                "plan_id": workout_plan.id,
                "plan": plan,
                "confidence": 0.88
            }

        except Exception as e:
            logger.error(f"Error generating workout plan: {e}")
            db.rollback()
            return {"success": False, "message": f"Error generating plan: {str(e)}"}

    async def _generate_with_ai(
        self,
        preferences: Dict[str, Any],
        workout_history: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate plan using AI"""
        prompt = f"""
        Create a personalized workout plan based on:
        - Goal: {preferences.get('goal')}
        - Experience Level: {preferences.get('experience_level')}
        - Available Time: {preferences.get('available_time')} minutes per session
        - Frequency: {preferences.get('days_per_week')} days per week
        - Equipment: {preferences.get('equipment', [])}
        - Workout History: {json.dumps(workout_history)}

        Provide:
        1. Weekly schedule
        2. Exercise details (sets, reps, rest)
        3. Progressive overload strategy
        4. Recovery recommendations
        """

        if langchain_service:
            chain = await langchain_service.create_workout_planning_chain()
            response = await chain.arun(
                user_profile=preferences.get("experience_level", "beginner"),
                fitness_goals=preferences.get("goal", "general_fitness"),
                available_time=preferences.get("available_time", 45),
                equipment=", ".join(preferences.get("equipment", []))
            )
            return json.loads(response) if isinstance(response, str) else response
        else:
            return self._generate_mock_plan(preferences)

    def _generate_mock_plan(self, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock workout plan"""
        return {
            "name": f"{preferences.get('goal', 'Fitness')} Plan",
            "description": "AI-generated personalized workout plan",
            "schedule": {
                "monday": {"exercises": ["Squats", "Bench Press", "Rows"]},
                "wednesday": {"exercises": ["Deadlifts", "Overhead Press", "Pull-ups"]},
                "friday": {"exercises": ["Squats", "Bench Press", "Rows"]}
            },
            "progressive_overload": "Increase weight by 2.5-5% weekly",
            "recovery": "Rest 48 hours between same muscle groups"
        }

    def _analyze_workout_history(self, workouts: List[WorkoutSession]) -> Dict[str, Any]:
        """Analyze user's workout history"""
        if not workouts:
            return {}

        return {
            "total_workouts": len(workouts),
            "average_duration": sum(w.duration or 0 for w in workouts) / len(workouts),
            "favorite_types": [w.type.value if hasattr(w.type, 'value') else str(w.type) for w in workouts[:5]]
        }

# Global service instance
ai_workout_plan_service = AIWorkoutPlanService()

