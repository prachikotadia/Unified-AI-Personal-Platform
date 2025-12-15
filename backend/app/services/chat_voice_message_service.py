import os
import json
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.chat_db import VoiceMessage, Message, Conversation
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class ChatVoiceMessageService:
    def __init__(self):
        self.upload_dir = os.getenv("VOICE_UPLOAD_DIR", "/tmp/voice_uploads")
        self.max_duration = 300  # 5 minutes
        self.allowed_formats = {".mp3", ".wav", ".ogg", ".m4a", ".webm"}

    async def upload_voice_message(
        self,
        db: Session,
        user_id: int,
        conversation_id: int,
        audio_data: bytes,
        duration: int,
        filename: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upload a voice message"""
        try:
            if duration > self.max_duration:
                return {"success": False, "message": f"Voice message exceeds maximum duration of {self.max_duration} seconds"}

            # Generate unique filename
            unique_filename = f"{uuid.uuid4()}.webm"
            file_path = os.path.join(self.upload_dir, unique_filename)

            # Ensure upload directory exists
            os.makedirs(self.upload_dir, exist_ok=True)

            # Save audio file
            with open(file_path, "wb") as f:
                f.write(audio_data)

            # Generate waveform (in production, use audio processing library)
            waveform = self._generate_waveform(audio_data)

            # Transcribe audio (in production, use speech-to-text API)
            transcription = await self._transcribe_audio(audio_data)

            # Create message first
            message = Message(
                conversation_id=conversation_id,
                sender_id=user_id,
                message_type="voice_message",
                content=transcription or "",
                file_url=f"/voice_uploads/{unique_filename}",
                duration=duration
            )
            db.add(message)
            db.flush()

            # Create voice message record
            voice_message = VoiceMessage(
                conversation_id=conversation_id,
                message_id=message.id,
                sender_id=user_id,
                audio_url=f"/voice_uploads/{unique_filename}",
                duration=duration,
                waveform=waveform,
                transcription=transcription
            )

            db.add(voice_message)
            db.commit()
            db.refresh(voice_message)

            return {
                "success": True,
                "message_id": message.id,
                "voice_message_id": voice_message.id,
                "audio_url": voice_message.audio_url,
                "duration": duration,
                "transcription": transcription
            }

        except Exception as e:
            logger.error(f"Error uploading voice message: {e}")
            db.rollback()
            return {"success": False, "message": f"Error uploading voice message: {str(e)}"}

    async def mark_as_played(
        self,
        db: Session,
        voice_message_id: int,
        user_id: int
    ) -> Dict[str, Any]:
        """Mark voice message as played"""
        try:
            voice_message = db.query(VoiceMessage).filter(
                VoiceMessage.id == voice_message_id
            ).first()

            if not voice_message:
                return {"success": False, "message": "Voice message not found"}

            played_status = voice_message.is_played or {}
            played_status[str(user_id)] = True
            voice_message.is_played = played_status

            db.commit()

            return {"success": True, "message": "Voice message marked as played"}

        except Exception as e:
            logger.error(f"Error marking voice message as played: {e}")
            db.rollback()
            return {"success": False, "message": f"Error: {str(e)}"}

    def _generate_waveform(self, audio_data: bytes) -> List[float]:
        """Generate audio waveform data"""
        # In production, use audio processing library
        # For now, return mock waveform
        return [0.5] * 100

    async def _transcribe_audio(self, audio_data: bytes) -> Optional[str]:
        """Transcribe audio to text"""
        # In production, use speech-to-text API (Google Speech-to-Text, AWS Transcribe, etc.)
        # For now, return None
        return None

# Global service instance
chat_voice_message_service = ChatVoiceMessageService()

