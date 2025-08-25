from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class MessageType(str, Enum):
    text = "text"
    image = "image"
    video = "video"
    audio = "audio"
    file = "file"
    location = "location"
    contact = "contact"
    emoji = "emoji"
    voice_message = "voice_message"
    system = "system"

class CallType(str, Enum):
    voice = "voice"
    video = "video"
    group_voice = "group_voice"
    group_video = "group_video"

class CallStatus(str, Enum):
    incoming = "incoming"
    outgoing = "outgoing"
    answered = "answered"
    missed = "missed"
    ended = "ended"
    busy = "busy"
    declined = "declined"

class MessageStatus(str, Enum):
    sent = "sent"
    delivered = "delivered"
    read = "read"
    failed = "failed"
    pending = "pending"

class ConversationType(str, Enum):
    direct = "direct"
    group = "group"
    channel = "channel"
    broadcast = "broadcast"

class User(BaseModel):
    id: str
    username: str
    display_name: Optional[str] = None
    avatar: Optional[str] = None
    status: str = "online"  # online, offline, away, busy
    last_seen: Optional[datetime] = None
    is_typing: bool = False
    typing_since: Optional[datetime] = None

class Message(BaseModel):
    id: Optional[str] = None
    conversation_id: str
    sender_id: str
    message_type: MessageType
    content: str
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None  # for audio/video messages
    location: Optional[Dict[str, Any]] = None
    contact: Optional[Dict[str, Any]] = None
    emoji: Optional[str] = None
    reply_to: Optional[str] = None  # ID of message being replied to
    forwarded_from: Optional[str] = None
    status: MessageStatus = MessageStatus.sent
    read_by: List[str] = []  # List of user IDs who read the message
    delivered_to: List[str] = []  # List of user IDs who received the message
    reactions: Dict[str, str] = {}  # user_id: emoji
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Conversation(BaseModel):
    id: Optional[str] = None
    type: ConversationType
    name: Optional[str] = None
    description: Optional[str] = None
    avatar: Optional[str] = None
    participants: List[str] = []  # List of user IDs
    admins: List[str] = []  # For group conversations
    last_message: Optional[Dict[str, Any]] = None
    unread_count: Dict[str, int] = {}  # user_id: unread_count
    is_archived: Dict[str, bool] = {}  # user_id: archived_status
    is_muted: Dict[str, bool] = {}  # user_id: muted_status
    is_pinned: Dict[str, bool] = {}  # user_id: pinned_status
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Call(BaseModel):
    id: Optional[str] = None
    conversation_id: str
    call_type: CallType
    initiator_id: str
    participants: List[str] = []
    status: CallStatus
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[int] = None  # in seconds
    recording_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CallParticipant(BaseModel):
    id: Optional[str] = None
    call_id: str
    user_id: str
    joined_at: Optional[datetime] = None
    left_at: Optional[datetime] = None
    duration: Optional[int] = None
    is_muted: bool = False
    is_video_enabled: bool = True
    connection_quality: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FileUpload(BaseModel):
    id: Optional[str] = None
    conversation_id: str
    sender_id: str
    file_name: str
    file_type: str
    file_size: int
    file_url: str
    thumbnail_url: Optional[str] = None
    duration: Optional[int] = None  # for audio/video files
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class VoiceMessage(BaseModel):
    id: Optional[str] = None
    conversation_id: str
    sender_id: str
    audio_url: str
    duration: int  # in seconds
    waveform: Optional[List[float]] = None  # Audio waveform data
    transcription: Optional[str] = None
    is_played: Dict[str, bool] = {}  # user_id: played_status
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TypingIndicator(BaseModel):
    id: Optional[str] = None
    conversation_id: str
    user_id: str
    is_typing: bool
    started_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MessageReaction(BaseModel):
    id: Optional[str] = None
    message_id: str
    user_id: str
    emoji: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ConversationSettings(BaseModel):
    id: Optional[str] = None
    conversation_id: str
    user_id: str
    is_muted: bool = False
    is_archived: bool = False
    is_pinned: bool = False
    notification_settings: Dict[str, Any] = {
        "sound": True,
        "vibration": True,
        "mentions": True,
        "group_updates": True
    }
    theme: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatInvitation(BaseModel):
    id: Optional[str] = None
    conversation_id: str
    inviter_id: str
    invitee_id: str
    message: Optional[str] = None
    expires_at: Optional[datetime] = None
    is_accepted: bool = False
    accepted_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatSearchResult(BaseModel):
    id: Optional[str] = None
    conversation_id: str
    message_id: str
    sender_id: str
    content: str
    message_type: MessageType
    created_at: datetime
    relevance_score: float
    context: Optional[str] = None

class ChatAnalytics(BaseModel):
    id: Optional[str] = None
    user_id: str
    conversation_id: str
    total_messages: int = 0
    total_calls: int = 0
    total_call_duration: int = 0  # in seconds
    total_files_shared: int = 0
    total_voice_messages: int = 0
    average_response_time: Optional[float] = None  # in seconds
    most_active_hours: List[int] = []
    favorite_emojis: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
