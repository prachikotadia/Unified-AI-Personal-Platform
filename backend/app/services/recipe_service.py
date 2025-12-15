import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.fitness_db import Recipe
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class RecipeService:
    def __init__(self):
        pass

    async def create_recipe(
        self,
        db: Session,
        user_id: int,
        recipe_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a new recipe"""
        try:
            recipe = Recipe(
                user_id=user_id,
                name=recipe_data.get("name"),
                description=recipe_data.get("description"),
                servings=recipe_data.get("servings", 1),
                prep_time=recipe_data.get("prep_time"),
                cook_time=recipe_data.get("cook_time"),
                ingredients=recipe_data.get("ingredients", []),
                instructions=recipe_data.get("instructions", []),
                nutrition_info=recipe_data.get("nutrition_info", {}),
                image_url=recipe_data.get("image_url"),
                tags=recipe_data.get("tags", []),
                is_public=recipe_data.get("is_public", False)
            )

            db.add(recipe)
            db.commit()
            db.refresh(recipe)

            return {
                "success": True,
                "recipe": self._recipe_to_dict(recipe)
            }

        except Exception as e:
            logger.error(f"Error creating recipe: {e}")
            db.rollback()
            return {"success": False, "message": f"Error creating recipe: {str(e)}"}

    async def update_recipe(
        self,
        db: Session,
        user_id: int,
        recipe_id: int,
        recipe_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update an existing recipe"""
        try:
            recipe = db.query(Recipe).filter(
                and_(
                    Recipe.id == recipe_id,
                    Recipe.user_id == user_id
                )
            ).first()

            if not recipe:
                return {"success": False, "message": "Recipe not found"}

            # Update fields
            if "name" in recipe_data:
                recipe.name = recipe_data["name"]
            if "description" in recipe_data:
                recipe.description = recipe_data["description"]
            if "servings" in recipe_data:
                recipe.servings = recipe_data["servings"]
            if "prep_time" in recipe_data:
                recipe.prep_time = recipe_data["prep_time"]
            if "cook_time" in recipe_data:
                recipe.cook_time = recipe_data["cook_time"]
            if "ingredients" in recipe_data:
                recipe.ingredients = recipe_data["ingredients"]
            if "instructions" in recipe_data:
                recipe.instructions = recipe_data["instructions"]
            if "nutrition_info" in recipe_data:
                recipe.nutrition_info = recipe_data["nutrition_info"]
            if "image_url" in recipe_data:
                recipe.image_url = recipe_data["image_url"]
            if "tags" in recipe_data:
                recipe.tags = recipe_data["tags"]
            if "is_public" in recipe_data:
                recipe.is_public = recipe_data["is_public"]

            recipe.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(recipe)

            return {
                "success": True,
                "recipe": self._recipe_to_dict(recipe)
            }

        except Exception as e:
            logger.error(f"Error updating recipe: {e}")
            db.rollback()
            return {"success": False, "message": f"Error updating recipe: {str(e)}"}

    async def delete_recipe(
        self,
        db: Session,
        user_id: int,
        recipe_id: int
    ) -> Dict[str, Any]:
        """Delete a recipe"""
        try:
            recipe = db.query(Recipe).filter(
                and_(
                    Recipe.id == recipe_id,
                    Recipe.user_id == user_id
                )
            ).first()

            if not recipe:
                return {"success": False, "message": "Recipe not found"}

            db.delete(recipe)
            db.commit()

            return {"success": True, "message": "Recipe deleted"}

        except Exception as e:
            logger.error(f"Error deleting recipe: {e}")
            db.rollback()
            return {"success": False, "message": f"Error deleting recipe: {str(e)}"}

    async def get_user_recipes(
        self,
        db: Session,
        user_id: int,
        include_public: bool = False,
        search: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Get user's recipes"""
        try:
            query = db.query(Recipe).filter(
                or_(
                    Recipe.user_id == user_id,
                    Recipe.is_public == True if include_public else False
                )
            )

            if search:
                query = query.filter(Recipe.name.contains(search))

            if tags:
                # Filter by tags (JSON contains)
                for tag in tags:
                    query = query.filter(Recipe.tags.contains([tag]))

            recipes = query.order_by(desc(Recipe.created_at)).all()

            return [self._recipe_to_dict(recipe) for recipe in recipes]

        except Exception as e:
            logger.error(f"Error getting recipes: {e}")
            return []

    async def get_recipe(
        self,
        db: Session,
        recipe_id: int,
        user_id: Optional[int] = None
    ) -> Optional[Dict[str, Any]]:
        """Get a specific recipe"""
        try:
            query = db.query(Recipe).filter(Recipe.id == recipe_id)

            if user_id:
                query = query.filter(
                    or_(
                        Recipe.user_id == user_id,
                        Recipe.is_public == True
                    )
                )

            recipe = query.first()
            if not recipe:
                return None

            return self._recipe_to_dict(recipe)

        except Exception as e:
            logger.error(f"Error getting recipe: {e}")
            return None

    def _recipe_to_dict(self, recipe: Recipe) -> Dict[str, Any]:
        """Convert recipe to dictionary"""
        return {
            "id": recipe.id,
            "user_id": recipe.user_id,
            "name": recipe.name,
            "description": recipe.description,
            "servings": recipe.servings,
            "prep_time": recipe.prep_time,
            "cook_time": recipe.cook_time,
            "ingredients": recipe.ingredients or [],
            "instructions": recipe.instructions or [],
            "nutrition_info": recipe.nutrition_info or {},
            "image_url": recipe.image_url,
            "tags": recipe.tags or [],
            "is_public": recipe.is_public,
            "created_at": recipe.created_at.isoformat() if recipe.created_at else None,
            "updated_at": recipe.updated_at.isoformat() if recipe.updated_at else None
        }

# Global service instance
recipe_service = RecipeService()

