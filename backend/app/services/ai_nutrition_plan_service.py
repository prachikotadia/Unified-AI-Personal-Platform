import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.fitness_db import MealPlan, NutritionEntry
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

# LangChain service - optional
try:
    from app.services.langchain_service import langchain_service
except ImportError:
    langchain_service = None

class AINutritionPlanService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    async def generate_nutrition_plan(
        self,
        db: Session,
        user_id: int,
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate AI-powered nutrition plan"""
        try:
            # Get user's nutrition history
            recent_entries = db.query(NutritionEntry).filter(
                NutritionEntry.user_id == user_id
            ).order_by(desc(NutritionEntry.date)).limit(30).all()

            nutrition_history = self._analyze_nutrition_history(recent_entries)

            # Generate plan using AI
            if langchain_service:
                plan = await self._generate_with_ai(preferences, nutrition_history)
            else:
                plan = self._generate_mock_plan(preferences)

            return {
                "success": True,
                "plan": plan,
                "confidence": 0.85
            }

        except Exception as e:
            logger.error(f"Error generating nutrition plan: {e}")
            return {"success": False, "message": f"Error generating plan: {str(e)}"}

    async def _generate_with_ai(
        self,
        preferences: Dict[str, Any],
        nutrition_history: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate plan using AI"""
        prompt = f"""
        Create a personalized nutrition plan based on:
        - Goal: {preferences.get('goal')}
        - Calorie Target: {preferences.get('calorie_target')}
        - Dietary Restrictions: {preferences.get('dietary_restrictions', [])}
        - Meal Frequency: {preferences.get('meals_per_day')} meals per day
        - Nutrition History: {json.dumps(nutrition_history)}

        Provide:
        1. Daily meal plan
        2. Macro breakdown
        3. Meal timing recommendations
        4. Recipe suggestions
        """

        # In production, use LangChain or OpenAI directly
        return self._generate_mock_plan(preferences)

    def _generate_mock_plan(self, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock nutrition plan"""
        return {
            "name": f"{preferences.get('goal', 'Nutrition')} Plan",
            "daily_calories": preferences.get("calorie_target", 2000),
            "macros": {
                "protein": preferences.get("calorie_target", 2000) * 0.3 / 4,  # 30% protein
                "carbs": preferences.get("calorie_target", 2000) * 0.4 / 4,  # 40% carbs
                "fat": preferences.get("calorie_target", 2000) * 0.3 / 9  # 30% fat
            },
            "meals": {
                "breakfast": {"calories": 400, "suggestions": ["Oatmeal with fruits", "Greek yogurt"]},
                "lunch": {"calories": 600, "suggestions": ["Grilled chicken salad", "Quinoa bowl"]},
                "dinner": {"calories": 700, "suggestions": ["Salmon with vegetables", "Lean beef"]},
                "snacks": {"calories": 300, "suggestions": ["Nuts", "Protein shake"]}
            }
        }

    def _analyze_nutrition_history(self, entries: List[NutritionEntry]) -> Dict[str, Any]:
        """Analyze user's nutrition history"""
        if not entries:
            return {}

        avg_calories = sum(e.total_calories or 0 for e in entries) / len(entries)
        avg_protein = sum(e.total_protein or 0 for e in entries) / len(entries)

        return {
            "average_calories": avg_calories,
            "average_protein": avg_protein,
            "entries_analyzed": len(entries)
        }

# Global service instance
ai_nutrition_plan_service = AINutritionPlanService()

