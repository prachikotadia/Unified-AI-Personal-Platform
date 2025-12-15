import os
import json
import uuid
import mimetypes
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.chat_db import MediaFile, Message, Conversation
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class ChatFileUploadService:
    def __init__(self):
        self.upload_dir = os.getenv("CHAT_UPLOAD_DIR", "/tmp/chat_uploads")
        self.max_file_size = 100 * 1024 * 1024  # 100MB
        self.allowed_types = {
            "image": {".jpg", ".jpeg", ".png", ".gif", ".webp"},
            "video": {".mp4", ".avi", ".mov", ".mkv", ".webm"},
            "audio": {".mp3", ".wav", ".ogg", ".m4a"},
            "document": {".pdf", ".doc", ".docx", ".txt", ".xls", ".xlsx", ".ppt", ".pptx"}
        }

    async def upload_file(
        self,
        db: Session,
        user_id: int,
        conversation_id: int,
        file_data: bytes,
        filename: str,
        file_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upload a file for chat"""
        try:
            # Validate file
            file_ext = os.path.splitext(filename)[1].lower()
            if not file_type:
                file_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"

            if len(file_data) > self.max_file_size:
                return {"success": False, "message": "File size exceeds maximum allowed"}

            # Generate unique filename
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(self.upload_dir, unique_filename)

            # Ensure upload directory exists
            os.makedirs(self.upload_dir, exist_ok=True)

            # Save file
            with open(file_path, "wb") as f:
                f.write(file_data)

            # Generate thumbnail for images/videos
            thumbnail_url = None
            if file_ext in self.allowed_types.get("image", set()) or file_ext in self.allowed_types.get("video", set()):
                thumbnail_url = await self._generate_thumbnail(file_path, unique_filename)

            # Create database record
            media_file = MediaFile(
                conversation_id=conversation_id,
                sender_id=user_id,
                file_name=filename,
                file_type=file_type,
                file_size=len(file_data),
                file_url=f"/chat_uploads/{unique_filename}",
                thumbnail_url=thumbnail_url
            )

            db.add(media_file)
            db.commit()
            db.refresh(media_file)

            return {
                "success": True,
                "file_id": media_file.id,
                "file_url": media_file.file_url,
                "thumbnail_url": media_file.thumbnail_url
            }

        except Exception as e:
            logger.error(f"Error uploading file: {e}")
            db.rollback()
            return {"success": False, "message": f"Error uploading file: {str(e)}"}

    async def get_conversation_media(
        self,
        db: Session,
        conversation_id: int,
        media_type: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get media files for a conversation"""
        try:
            query = db.query(MediaFile).filter(
                MediaFile.conversation_id == conversation_id
            )

            if media_type:
                if media_type == "image":
                    query = query.filter(MediaFile.file_type.like("image/%"))
                elif media_type == "video":
                    query = query.filter(MediaFile.file_type.like("video/%"))
                elif media_type == "audio":
                    query = query.filter(MediaFile.file_type.like("audio/%"))

            media_files = query.order_by(desc(MediaFile.created_at)).limit(limit).all()

            return [self._media_file_to_dict(mf) for mf in media_files]

        except Exception as e:
            logger.error(f"Error getting conversation media: {e}")
            return []

    async def get_conversation_files(
        self,
        db: Session,
        conversation_id: int,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get document files for a conversation"""
        try:
            files = db.query(MediaFile).filter(
                and_(
                    MediaFile.conversation_id == conversation_id,
                    ~MediaFile.file_type.like("image/%"),
                    ~MediaFile.file_type.like("video/%"),
                    ~MediaFile.file_type.like("audio/%")
                )
            ).order_by(desc(MediaFile.created_at)).limit(limit).all()

            return [self._media_file_to_dict(f) for f in files]

        except Exception as e:
            logger.error(f"Error getting conversation files: {e}")
            return []

    async def _generate_thumbnail(self, file_path: str, filename: str) -> Optional[str]:
        """Generate thumbnail for image/video"""
        # In production, use image processing library (PIL, OpenCV)
        # For now, return None
        return None

    def _media_file_to_dict(self, media_file: MediaFile) -> Dict[str, Any]:
        """Convert media file to dictionary"""
        return {
            "id": media_file.id,
            "file_name": media_file.file_name,
            "file_type": media_file.file_type,
            "file_size": media_file.file_size,
            "file_url": media_file.file_url,
            "thumbnail_url": media_file.thumbnail_url,
            "duration": media_file.duration,
            "created_at": media_file.created_at.isoformat() if media_file.created_at else None
        }

# Global service instance
chat_file_upload_service = ChatFileUploadService()

