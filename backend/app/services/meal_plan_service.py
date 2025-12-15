import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, date
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.fitness_db import MealPlan
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class MealPlanService:
    def __init__(self):
        pass

    async def create_meal_plan(
        self,
        db: Session,
        user_id: int,
        meal_plan_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a new meal plan"""
        try:
            meal_plan = MealPlan(
                user_id=user_id,
                name=meal_plan_data.get("name"),
                description=meal_plan_data.get("description"),
                start_date=date.fromisoformat(meal_plan_data.get("start_date")),
                end_date=date.fromisoformat(meal_plan_data.get("end_date")),
                daily_calorie_target=meal_plan_data.get("daily_calorie_target"),
                daily_protein_target=meal_plan_data.get("daily_protein_target"),
                daily_carb_target=meal_plan_data.get("daily_carb_target"),
                daily_fat_target=meal_plan_data.get("daily_fat_target"),
                meals=meal_plan_data.get("meals", {})
            )

            db.add(meal_plan)
            db.commit()
            db.refresh(meal_plan)

            return {
                "success": True,
                "meal_plan": self._meal_plan_to_dict(meal_plan)
            }

        except Exception as e:
            logger.error(f"Error creating meal plan: {e}")
            db.rollback()
            return {"success": False, "message": f"Error creating meal plan: {str(e)}"}

    async def update_meal_plan(
        self,
        db: Session,
        user_id: int,
        meal_plan_id: int,
        meal_plan_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update an existing meal plan"""
        try:
            meal_plan = db.query(MealPlan).filter(
                and_(
                    MealPlan.id == meal_plan_id,
                    MealPlan.user_id == user_id
                )
            ).first()

            if not meal_plan:
                return {"success": False, "message": "Meal plan not found"}

            # Update fields
            if "name" in meal_plan_data:
                meal_plan.name = meal_plan_data["name"]
            if "description" in meal_plan_data:
                meal_plan.description = meal_plan_data["description"]
            if "start_date" in meal_plan_data:
                meal_plan.start_date = date.fromisoformat(meal_plan_data["start_date"])
            if "end_date" in meal_plan_data:
                meal_plan.end_date = date.fromisoformat(meal_plan_data["end_date"])
            if "daily_calorie_target" in meal_plan_data:
                meal_plan.daily_calorie_target = meal_plan_data["daily_calorie_target"]
            if "daily_protein_target" in meal_plan_data:
                meal_plan.daily_protein_target = meal_plan_data["daily_protein_target"]
            if "daily_carb_target" in meal_plan_data:
                meal_plan.daily_carb_target = meal_plan_data["daily_carb_target"]
            if "daily_fat_target" in meal_plan_data:
                meal_plan.daily_fat_target = meal_plan_data["daily_fat_target"]
            if "meals" in meal_plan_data:
                meal_plan.meals = meal_plan_data["meals"]

            meal_plan.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(meal_plan)

            return {
                "success": True,
                "meal_plan": self._meal_plan_to_dict(meal_plan)
            }

        except Exception as e:
            logger.error(f"Error updating meal plan: {e}")
            db.rollback()
            return {"success": False, "message": f"Error updating meal plan: {str(e)}"}

    async def delete_meal_plan(
        self,
        db: Session,
        user_id: int,
        meal_plan_id: int
    ) -> Dict[str, Any]:
        """Delete a meal plan"""
        try:
            meal_plan = db.query(MealPlan).filter(
                and_(
                    MealPlan.id == meal_plan_id,
                    MealPlan.user_id == user_id
                )
            ).first()

            if not meal_plan:
                return {"success": False, "message": "Meal plan not found"}

            db.delete(meal_plan)
            db.commit()

            return {"success": True, "message": "Meal plan deleted"}

        except Exception as e:
            logger.error(f"Error deleting meal plan: {e}")
            db.rollback()
            return {"success": False, "message": f"Error deleting meal plan: {str(e)}"}

    async def get_user_meal_plans(
        self,
        db: Session,
        user_id: int
    ) -> List[Dict[str, Any]]:
        """Get user's meal plans"""
        try:
            meal_plans = db.query(MealPlan).filter(
                MealPlan.user_id == user_id
            ).order_by(desc(MealPlan.created_at)).all()

            return [self._meal_plan_to_dict(plan) for plan in meal_plans]

        except Exception as e:
            logger.error(f"Error getting meal plans: {e}")
            return []

    def _meal_plan_to_dict(self, meal_plan: MealPlan) -> Dict[str, Any]:
        """Convert meal plan to dictionary"""
        return {
            "id": meal_plan.id,
            "user_id": meal_plan.user_id,
            "name": meal_plan.name,
            "description": meal_plan.description,
            "start_date": meal_plan.start_date.isoformat() if meal_plan.start_date else None,
            "end_date": meal_plan.end_date.isoformat() if meal_plan.end_date else None,
            "daily_calorie_target": meal_plan.daily_calorie_target,
            "daily_protein_target": meal_plan.daily_protein_target,
            "daily_carb_target": meal_plan.daily_carb_target,
            "daily_fat_target": meal_plan.daily_fat_target,
            "meals": meal_plan.meals or {},
            "created_at": meal_plan.created_at.isoformat() if meal_plan.created_at else None,
            "updated_at": meal_plan.updated_at.isoformat() if meal_plan.updated_at else None
        }

# Global service instance
meal_plan_service = MealPlanService()

