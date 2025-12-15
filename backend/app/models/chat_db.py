from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base

# Enums
class MessageType(str, enum.Enum):
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

class ConversationType(str, enum.Enum):
    direct = "direct"
    group = "group"
    channel = "channel"
    broadcast = "broadcast"

class MessageStatus(str, enum.Enum):
    sent = "sent"
    delivered = "delivered"
    read = "read"
    failed = "failed"
    pending = "pending"

class CallType(str, enum.Enum):
    voice = "voice"
    video = "video"
    group_voice = "group_voice"
    group_video = "group_video"

class CallStatus(str, enum.Enum):
    incoming = "incoming"
    outgoing = "outgoing"
    answered = "answered"
    missed = "missed"
    ended = "ended"
    busy = "busy"
    declined = "declined"

# Database Models
class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(SQLEnum(ConversationType), nullable=False)
    name = Column(String(200))
    description = Column(Text)
    avatar = Column(String(500))
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    participants = relationship("ConversationParticipant", back_populates="conversation", cascade="all, delete-orphan")
    group_chat = relationship("GroupChat", back_populates="conversation", uselist=False, cascade="all, delete-orphan")
    archives = relationship("ConversationArchive", back_populates="conversation", cascade="all, delete-orphan")
    settings = relationship("ChatSettings", back_populates="conversation", cascade="all, delete-orphan")
    calls = relationship("Call", back_populates="conversation", cascade="all, delete-orphan")

class ConversationParticipant(Base):
    __tablename__ = "conversation_participants"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), default="member")  # member, admin, owner
    joined_at = Column(DateTime, default=func.now())
    left_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="participants")
    user = relationship("User", back_populates="conversation_participants")
    
    __table_args__ = (
        Index('idx_conv_user', 'conversation_id', 'user_id'),
    )

class GroupChat(Base):
    __tablename__ = "group_chats"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False, unique=True)
    max_members = Column(Integer, default=256)
    is_public = Column(Boolean, default=False)
    invite_link = Column(String(500), unique=True, index=True)
    invite_link_expires_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    conversation = relationship("Conversation", back_populates="group_chat")
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")

class GroupMember(Base):
    __tablename__ = "group_members"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("group_chats.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), default="member")  # member, admin, owner
    added_by = Column(Integer, ForeignKey("users.id"))
    joined_at = Column(DateTime, default=func.now())
    left_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    group = relationship("GroupChat", back_populates="members")
    user = relationship("User", foreign_keys=[user_id])
    added_by_user = relationship("User", foreign_keys=[added_by])
    
    __table_args__ = (
        Index('idx_group_user', 'group_id', 'user_id'),
    )

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message_type = Column(SQLEnum(MessageType), nullable=False)
    content = Column(Text)
    file_url = Column(String(500))
    file_name = Column(String(200))
    file_size = Column(Integer)
    file_type = Column(String(50))
    thumbnail_url = Column(String(500))
    duration = Column(Integer)  # for audio/video messages
    location_data = Column(JSON)  # Location information
    contact_data = Column(JSON)  # Contact information
    emoji = Column(String(10))
    reply_to_id = Column(Integer, ForeignKey("messages.id"))
    forwarded_from_id = Column(Integer, ForeignKey("messages.id"))
    status = Column(SQLEnum(MessageStatus), default=MessageStatus.sent)
    read_by = Column(JSON)  # List of user IDs who read
    delivered_to = Column(JSON)  # List of user IDs who received
    message_metadata = Column(JSON)  # Additional message data
    is_edited = Column(Boolean, default=False)
    edited_at = Column(DateTime)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now(), index=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    reply_to = relationship("Message", remote_side=[id], foreign_keys=[reply_to_id])
    forwarded_from = relationship("Message", remote_side=[id], foreign_keys=[forwarded_from_id])
    reactions = relationship("MessageReaction", back_populates="message", cascade="all, delete-orphan")
    replies = relationship("MessageReply", back_populates="message", cascade="all, delete-orphan")
    forwards = relationship("MessageForward", back_populates="message", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_conv_created', 'conversation_id', 'created_at'),
    )

class MessageReaction(Base):
    __tablename__ = "message_reactions"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    emoji = Column(String(10), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    message = relationship("Message", back_populates="reactions")
    user = relationship("User", back_populates="message_reactions")
    
    __table_args__ = (
        Index('idx_msg_user_emoji', 'message_id', 'user_id', 'emoji'),
    )

class MessageReply(Base):
    __tablename__ = "message_replies"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    reply_to_message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    reply_content = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    message = relationship("Message", foreign_keys=[message_id], back_populates="replies")
    reply_to_message = relationship("Message", foreign_keys=[reply_to_message_id])

class MessageForward(Base):
    __tablename__ = "message_forwards"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    forwarded_to_conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    forwarded_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    message = relationship("Message", back_populates="forwards")
    conversation = relationship("Conversation")
    user = relationship("User")

class MediaFile(Base):
    __tablename__ = "media_files"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    message_id = Column(Integer, ForeignKey("messages.id"))
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_name = Column(String(200), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500))
    duration = Column(Integer)  # for audio/video files
    file_metadata = Column(JSON)  # Additional file data
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    conversation = relationship("Conversation")
    message = relationship("Message")
    sender = relationship("User")

class VoiceMessage(Base):
    __tablename__ = "voice_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    audio_url = Column(String(500), nullable=False)
    duration = Column(Integer, nullable=False)  # in seconds
    waveform = Column(JSON)  # Audio waveform data
    transcription = Column(Text)
    is_played = Column(JSON)  # user_id: played_status
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    conversation = relationship("Conversation")
    message = relationship("Message")
    sender = relationship("User")

class Call(Base):
    __tablename__ = "calls"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    call_type = Column(SQLEnum(CallType), nullable=False)
    initiator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(CallStatus), nullable=False)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    duration = Column(Integer)  # in seconds
    recording_url = Column(String(500))
    notes = Column(Text)
    call_data = Column(JSON)  # Additional call metadata
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    conversation = relationship("Conversation", back_populates="calls")
    initiator = relationship("User", foreign_keys=[initiator_id])
    participants = relationship("CallParticipant", back_populates="call", cascade="all, delete-orphan")

class CallParticipant(Base):
    __tablename__ = "call_participants"
    
    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime)
    left_at = Column(DateTime)
    duration = Column(Integer)  # in seconds
    is_muted = Column(Boolean, default=False)
    is_video_enabled = Column(Boolean, default=True)
    connection_quality = Column(String(20))  # excellent, good, fair, poor
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    call = relationship("Call", back_populates="participants")
    user = relationship("User")

class ChatSettings(Base):
    __tablename__ = "chat_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    is_muted = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)
    notification_settings = Column(JSON)  # Sound, vibration, mentions, etc.
    theme = Column(String(50))
    wallpaper = Column(String(500))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="chat_settings")
    conversation = relationship("Conversation", back_populates="settings")
    
    __table_args__ = (
        Index('idx_user_conv', 'user_id', 'conversation_id'),
    )

class ConversationArchive(Base):
    __tablename__ = "conversation_archives"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    archived_at = Column(DateTime, default=func.now())
    unarchived_at = Column(DateTime)
    is_archived = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="conversation_archives")
    conversation = relationship("Conversation", back_populates="archives")
    
    __table_args__ = (
        Index('idx_user_conv_archived', 'user_id', 'conversation_id', 'is_archived'),
    )

