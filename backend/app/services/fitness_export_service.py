import os
import json
import csv
import io
from typing import Dict, List, Any, Optional
from datetime import datetime, date
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.fitness_db import WorkoutSession, NutritionEntry, ProgressPhoto, SleepEntry
from app.cache import redis_cache

logger = structlog.get_logger()

class FitnessExportService:
    def __init__(self):
        self.export_dir = os.getenv("EXPORT_DIR", "/tmp/exports")

    async def export_workouts(
        self,
        db: Session,
        user_id: int,
        format: str = "json",
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """Export workouts to specified format"""
        try:
            query = db.query(WorkoutSession).filter(WorkoutSession.user_id == user_id)

            if start_date:
                query = query.filter(WorkoutSession.started_at >= datetime.combine(start_date, datetime.min.time()))
            if end_date:
                query = query.filter(WorkoutSession.started_at <= datetime.combine(end_date, datetime.max.time()))

            workouts = query.order_by(desc(WorkoutSession.started_at)).all()

            if format == "json":
                return await self._export_workouts_json(workouts)
            elif format == "csv":
                return await self._export_workouts_csv(workouts)
            else:
                return {"success": False, "message": f"Unsupported format: {format}"}

        except Exception as e:
            logger.error(f"Error exporting workouts: {e}")
            return {"success": False, "message": f"Error exporting workouts: {str(e)}"}

    async def export_progress(
        self,
        db: Session,
        user_id: int,
        format: str = "json"
    ) -> Dict[str, Any]:
        """Export progress data"""
        try:
            photos = db.query(ProgressPhoto).filter(
                ProgressPhoto.user_id == user_id
            ).order_by(desc(ProgressPhoto.date)).all()

            data = {
                "photos": [self._photo_to_dict(p) for p in photos],
                "exported_at": datetime.utcnow().isoformat()
            }

            if format == "json":
                file_path = f"{self.export_dir}/progress_{user_id}_{datetime.now().timestamp()}.json"
                os.makedirs(self.export_dir, exist_ok=True)
                with open(file_path, "w") as f:
                    json.dump(data, f, indent=2)

                return {
                    "success": True,
                    "file_path": file_path,
                    "file_size": os.path.getsize(file_path)
                }

            return {"success": False, "message": f"Unsupported format: {format}"}

        except Exception as e:
            logger.error(f"Error exporting progress: {e}")
            return {"success": False, "message": f"Error exporting progress: {str(e)}"}

    async def export_measurements(
        self,
        db: Session,
        user_id: int,
        format: str = "json"
    ) -> Dict[str, Any]:
        """Export measurements"""
        try:
            # This would query measurements table (if exists)
            # For now, return empty export
            data = {
                "measurements": [],
                "exported_at": datetime.utcnow().isoformat()
            }

            if format == "json":
                file_path = f"{self.export_dir}/measurements_{user_id}_{datetime.now().timestamp()}.json"
                os.makedirs(self.export_dir, exist_ok=True)
                with open(file_path, "w") as f:
                    json.dump(data, f, indent=2)

                return {
                    "success": True,
                    "file_path": file_path,
                    "file_size": os.path.getsize(file_path)
                }

            return {"success": False, "message": f"Unsupported format: {format}"}

        except Exception as e:
            logger.error(f"Error exporting measurements: {e}")
            return {"success": False, "message": f"Error exporting measurements: {str(e)}"}

    async def _export_workouts_json(self, workouts: List[WorkoutSession]) -> Dict[str, Any]:
        """Export workouts to JSON"""
        data = {
            "workouts": [self._workout_to_dict(w) for w in workouts],
            "exported_at": datetime.utcnow().isoformat()
        }

        file_path = f"{self.export_dir}/workouts_{datetime.now().timestamp()}.json"
        os.makedirs(self.export_dir, exist_ok=True)
        with open(file_path, "w") as f:
            json.dump(data, f, indent=2)

        return {
            "success": True,
            "file_path": file_path,
            "file_size": os.path.getsize(file_path)
        }

    async def _export_workouts_csv(self, workouts: List[WorkoutSession]) -> Dict[str, Any]:
        """Export workouts to CSV"""
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["Date", "Name", "Type", "Duration", "Calories", "Intensity"])

        for workout in workouts:
            writer.writerow([
                workout.started_at.date().isoformat() if workout.started_at else "",
                workout.name,
                workout.type.value if hasattr(workout.type, 'value') else str(workout.type),
                workout.duration,
                workout.calories_burned,
                workout.intensity
            ])

        csv_content = output.getvalue()
        file_path = f"{self.export_dir}/workouts_{datetime.now().timestamp()}.csv"
        os.makedirs(self.export_dir, exist_ok=True)
        with open(file_path, "w") as f:
            f.write(csv_content)

        return {
            "success": True,
            "file_path": file_path,
            "file_size": os.path.getsize(file_path)
        }

    def _workout_to_dict(self, workout: WorkoutSession) -> Dict[str, Any]:
        """Convert workout to dictionary"""
        return {
            "id": workout.id,
            "name": workout.name,
            "type": workout.type.value if hasattr(workout.type, 'value') else str(workout.type),
            "duration": workout.duration,
            "calories_burned": workout.calories_burned,
            "intensity": workout.intensity,
            "started_at": workout.started_at.isoformat() if workout.started_at else None,
            "ended_at": workout.ended_at.isoformat() if workout.ended_at else None
        }

    def _photo_to_dict(self, photo: ProgressPhoto) -> Dict[str, Any]:
        """Convert photo to dictionary"""
        return {
            "id": photo.id,
            "date": photo.date.isoformat() if photo.date else None,
            "body_part": photo.body_part,
            "weight": photo.weight,
            "notes": photo.notes
        }

# Global service instance
fitness_export_service = FitnessExportService()

