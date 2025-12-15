import os
import json
import uuid
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.chat_db import Call, CallParticipant, Conversation, CallType, CallStatus
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class ChatCallService:
    def __init__(self):
        self.twilio_account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.max_participants = 50

    async def start_call(
        self,
        db: Session,
        user_id: int,
        conversation_id: int,
        call_type: CallType,
        participants: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        """Start a voice or video call"""
        try:
            # Validate conversation
            conversation = db.query(Conversation).filter(
                Conversation.id == conversation_id
            ).first()

            if not conversation:
                return {"success": False, "message": "Conversation not found"}

            # Create call
            call = Call(
                conversation_id=conversation_id,
                call_type=call_type,
                initiator_id=user_id,
                status=CallStatus.outgoing,
                start_time=datetime.utcnow(),
                call_data={
                    "call_id": str(uuid.uuid4()),
                    "room_id": f"call_{conversation_id}_{datetime.utcnow().timestamp()}"
                }
            )

            db.add(call)
            db.flush()

            # Add initiator as participant
            initiator_participant = CallParticipant(
                call_id=call.id,
                user_id=user_id,
                joined_at=datetime.utcnow(),
                is_video_enabled=(call_type == CallType.video or call_type == CallType.group_video)
            )
            db.add(initiator_participant)

            # Add other participants
            if participants:
                for participant_id in participants:
                    if participant_id != user_id:
                        participant = CallParticipant(
                            call_id=call.id,
                            user_id=participant_id,
                            is_video_enabled=(call_type == CallType.video or call_type == CallType.group_video)
                        )
                        db.add(participant)

            db.commit()
            db.refresh(call)

            return {
                "success": True,
                "call_id": call.id,
                "call_data": call.call_data,
                "status": call.status.value
            }

        except Exception as e:
            logger.error(f"Error starting call: {e}")
            db.rollback()
            return {"success": False, "message": f"Error starting call: {str(e)}"}

    async def answer_call(
        self,
        db: Session,
        call_id: int,
        user_id: int
    ) -> Dict[str, Any]:
        """Answer an incoming call"""
        try:
            call = db.query(Call).filter(Call.id == call_id).first()

            if not call:
                return {"success": False, "message": "Call not found"}

            # Check if user is a participant
            participant = db.query(CallParticipant).filter(
                and_(
                    CallParticipant.call_id == call_id,
                    CallParticipant.user_id == user_id
                )
            ).first()

            if not participant:
                return {"success": False, "message": "User is not a participant"}

            # Update call status
            if call.status == CallStatus.incoming:
                call.status = CallStatus.answered
                participant.joined_at = datetime.utcnow()
                if not call.start_time:
                    call.start_time = datetime.utcnow()

            db.commit()

            return {
                "success": True,
                "call_id": call.id,
                "status": call.status.value
            }

        except Exception as e:
            logger.error(f"Error answering call: {e}")
            db.rollback()
            return {"success": False, "message": f"Error answering call: {str(e)}"}

    async def end_call(
        self,
        db: Session,
        call_id: int,
        user_id: int
    ) -> Dict[str, Any]:
        """End a call"""
        try:
            call = db.query(Call).filter(Call.id == call_id).first()

            if not call:
                return {"success": False, "message": "Call not found"}

            # Update participant
            participant = db.query(CallParticipant).filter(
                and_(
                    CallParticipant.call_id == call_id,
                    CallParticipant.user_id == user_id
                )
            ).first()

            if participant:
                participant.left_at = datetime.utcnow()
                if participant.joined_at:
                    duration = (participant.left_at - participant.joined_at).total_seconds()
                    participant.duration = int(duration)

            # Check if all participants left
            active_participants = db.query(CallParticipant).filter(
                and_(
                    CallParticipant.call_id == call_id,
                    CallParticipant.left_at.is_(None)
                )
            ).count()

            if active_participants == 0:
                call.status = CallStatus.ended
                call.end_time = datetime.utcnow()
                if call.start_time:
                    duration = (call.end_time - call.start_time).total_seconds()
                    call.duration = int(duration)

            db.commit()

            return {
                "success": True,
                "call_id": call.id,
                "status": call.status.value,
                "duration": call.duration
            }

        except Exception as e:
            logger.error(f"Error ending call: {e}")
            db.rollback()
            return {"success": False, "message": f"Error ending call: {str(e)}"}

# Global service instance
chat_call_service = ChatCallService()

