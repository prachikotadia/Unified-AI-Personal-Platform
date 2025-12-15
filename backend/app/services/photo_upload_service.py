import os
import json
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime, date
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.fitness_db import ProgressPhoto
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class PhotoUploadService:
    def __init__(self):
        self.upload_dir = os.getenv("UPLOAD_DIR", "/tmp/uploads")
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}

    async def upload_progress_photo(
        self,
        db: Session,
        user_id: int,
        file_data: bytes,
        filename: str,
        photo_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Upload a progress photo"""
        try:
            # Validate file
            file_ext = os.path.splitext(filename)[1].lower()
            if file_ext not in self.allowed_extensions:
                return {"success": False, "message": f"File type {file_ext} not allowed"}

            if len(file_data) > self.max_file_size:
                return {"success": False, "message": "File size exceeds maximum allowed"}

            # Generate unique filename
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(self.upload_dir, unique_filename)
            thumbnail_path = os.path.join(self.upload_dir, f"thumb_{unique_filename}")

            # Ensure upload directory exists
            os.makedirs(self.upload_dir, exist_ok=True)

            # Save file
            with open(file_path, "wb") as f:
                f.write(file_data)

            # Generate thumbnail (in production, use image processing library)
            # For now, use same file
            thumbnail_url = f"/uploads/thumb_{unique_filename}"

            # Create database record
            progress_photo = ProgressPhoto(
                user_id=user_id,
                photo_url=f"/uploads/{unique_filename}",
                thumbnail_url=thumbnail_url,
                date=date.fromisoformat(photo_data.get("date", date.today().isoformat())),
                body_part=photo_data.get("body_part"),
                weight=photo_data.get("weight"),
                notes=photo_data.get("notes"),
                is_private=photo_data.get("is_private", True)
            )

            db.add(progress_photo)
            db.commit()
            db.refresh(progress_photo)

            return {
                "success": True,
                "photo": self._photo_to_dict(progress_photo)
            }

        except Exception as e:
            logger.error(f"Error uploading photo: {e}")
            db.rollback()
            return {"success": False, "message": f"Error uploading photo: {str(e)}"}

    async def get_progress_photos(
        self,
        db: Session,
        user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        body_part: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get user's progress photos"""
        try:
            query = db.query(ProgressPhoto).filter(
                ProgressPhoto.user_id == user_id
            )

            if start_date:
                query = query.filter(ProgressPhoto.date >= start_date)
            if end_date:
                query = query.filter(ProgressPhoto.date <= end_date)
            if body_part:
                query = query.filter(ProgressPhoto.body_part == body_part)

            photos = query.order_by(desc(ProgressPhoto.date)).all()

            return [self._photo_to_dict(photo) for photo in photos]

        except Exception as e:
            logger.error(f"Error getting progress photos: {e}")
            return []

    async def delete_progress_photo(
        self,
        db: Session,
        user_id: int,
        photo_id: int
    ) -> Dict[str, Any]:
        """Delete a progress photo"""
        try:
            photo = db.query(ProgressPhoto).filter(
                and_(
                    ProgressPhoto.id == photo_id,
                    ProgressPhoto.user_id == user_id
                )
            ).first()

            if not photo:
                return {"success": False, "message": "Photo not found"}

            # Delete file
            if photo.photo_url and os.path.exists(photo.photo_url.replace("/uploads/", self.upload_dir + "/")):
                try:
                    os.remove(photo.photo_url.replace("/uploads/", self.upload_dir + "/"))
                except:
                    pass

            db.delete(photo)
            db.commit()

            return {"success": True, "message": "Photo deleted"}

        except Exception as e:
            logger.error(f"Error deleting photo: {e}")
            db.rollback()
            return {"success": False, "message": f"Error deleting photo: {str(e)}"}

    def _photo_to_dict(self, photo: ProgressPhoto) -> Dict[str, Any]:
        """Convert photo to dictionary"""
        return {
            "id": photo.id,
            "user_id": photo.user_id,
            "photo_url": photo.photo_url,
            "thumbnail_url": photo.thumbnail_url,
            "date": photo.date.isoformat() if photo.date else None,
            "body_part": photo.body_part,
            "weight": photo.weight,
            "notes": photo.notes,
            "is_private": photo.is_private,
            "created_at": photo.created_at.isoformat() if photo.created_at else None
        }

# Global service instance
photo_upload_service = PhotoUploadService()

