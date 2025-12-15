import os
import json
import csv
from typing import Dict, List, Any, Optional
from datetime import datetime, date
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.fitness_db import WorkoutSession, WorkoutImport, WorkoutType
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class FitnessImportService:
    def __init__(self):
        self.supported_formats = ["json", "csv", "tcx", "gpx"]

    async def import_workout(
        self,
        db: Session,
        user_id: int,
        file_path: Optional[str] = None,
        file_content: Optional[str] = None,
        file_format: str = "json",
        source: str = "file"
    ) -> Dict[str, Any]:
        """Import workouts from file"""
        try:
            # Create import record
            import_record = WorkoutImport(
                user_id=user_id,
                source=source,
                file_path=file_path,
                import_format=file_format,
                status="processing"
            )
            db.add(import_record)
            db.commit()

            # Read file
            if file_path:
                with open(file_path, "r") as f:
                    content = f.read()
            elif file_content:
                content = file_content
            else:
                import_record.status = "failed"
                import_record.error_message = "No file or content provided"
                db.commit()
                return {"success": False, "message": "No file or content provided"}

            # Parse based on format
            workouts_data = []
            if file_format == "json":
                workouts_data = json.loads(content).get("workouts", [])
            elif file_format == "csv":
                workouts_data = self._parse_csv_workouts(content)
            else:
                import_record.status = "failed"
                import_record.error_message = f"Unsupported format: {file_format}"
                db.commit()
                return {"success": False, "message": f"Unsupported format: {file_format}"}

            # Import workouts
            imported_count = 0
            for workout_data in workouts_data:
                try:
                    workout = WorkoutSession(
                        user_id=user_id,
                        name=workout_data.get("name", "Imported Workout"),
                        type=WorkoutType(workout_data.get("type", "other")),
                        duration=workout_data.get("duration", 0),
                        intensity=workout_data.get("intensity", "medium"),
                        calories_burned=workout_data.get("calories_burned"),
                        started_at=datetime.fromisoformat(workout_data.get("started_at")) if workout_data.get("started_at") else datetime.utcnow(),
                        completed=workout_data.get("completed", True)
                    )
                    db.add(workout)
                    imported_count += 1
                except Exception as e:
                    logger.error(f"Error importing workout: {e}")
                    continue

            import_record.workouts_imported = imported_count
            import_record.status = "completed"
            import_record.completed_at = datetime.utcnow()
            db.commit()

            return {
                "success": True,
                "import_id": import_record.id,
                "workouts_imported": imported_count
            }

        except Exception as e:
            logger.error(f"Error importing workouts: {e}")
            db.rollback()
            return {"success": False, "message": f"Error importing workouts: {str(e)}"}

    async def import_from_strava(
        self,
        db: Session,
        user_id: int,
        access_token: str
    ) -> Dict[str, Any]:
        """Import workouts from Strava"""
        try:
            # In production, use Strava API
            # For now, return mock
            return {
                "success": True,
                "message": "Strava import not yet implemented",
                "workouts_imported": 0
            }

        except Exception as e:
            logger.error(f"Error importing from Strava: {e}")
            return {"success": False, "message": f"Error importing from Strava: {str(e)}"}

    def _parse_csv_workouts(self, content: str) -> List[Dict[str, Any]]:
        """Parse CSV workouts"""
        reader = csv.DictReader(content.splitlines())
        workouts = []
        for row in reader:
            workouts.append({
                "name": row.get("Name", "Workout"),
                "type": row.get("Type", "other"),
                "duration": int(row.get("Duration", 0)),
                "calories_burned": float(row.get("Calories", 0)) if row.get("Calories") else None,
                "intensity": row.get("Intensity", "medium"),
                "started_at": row.get("Date", datetime.utcnow().isoformat())
            })
        return workouts

# Global service instance
fitness_import_service = FitnessImportService()

