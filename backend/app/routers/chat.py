from fastapi import APIRouter, Depends, HTTPException, status, Query, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import structlog
import uuid
import json
import asyncio
import aiofiles
import os
from pathlib import Path

from app.models.chat import (
    Message, Conversation, Call, CallParticipant, FileUpload, VoiceMessage,
    TypingIndicator, MessageReaction, ConversationSettings, ChatInvitation,
    ChatSearchResult, ChatAnalytics, User,
    MessageType, CallType, CallStatus, MessageStatus, ConversationType
)

logger = structlog.get_logger()
router = APIRouter()

# Mock user for now - in real app, this would come from authentication
def get_mock_user():
    return {"id": "user_123", "username": "testuser"}

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_conversations: Dict[str, List[str]] = {}  # user_id: [conversation_ids]

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected to WebSocket")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        logger.info(f"User {user_id} disconnected from WebSocket")

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

    async def broadcast_to_conversation(self, message: str, conversation_id: str):
        # Send to all users in the conversation
        for user_id, websocket in self.active_connections.items():
            if user_id in self.user_conversations and conversation_id in self.user_conversations[user_id]:
                await websocket.send_text(message)

manager = ConnectionManager()

# Request/Response models
class MessageCreate(BaseModel):
    conversation_id: str
    content: str
    message_type: MessageType = MessageType.text
    reply_to: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    location: Optional[Dict[str, Any]] = None
    contact: Optional[Dict[str, Any]] = None
    emoji: Optional[str] = None

class ConversationCreate(BaseModel):
    type: ConversationType
    name: Optional[str] = None
    description: Optional[str] = None
    participants: List[str]
    avatar: Optional[str] = None

class CallCreate(BaseModel):
    conversation_id: str
    call_type: CallType
    participants: List[str]

class VoiceMessageCreate(BaseModel):
    conversation_id: str
    audio_url: str
    duration: int
    transcription: Optional[str] = None

class TypingUpdate(BaseModel):
    conversation_id: str
    is_typing: bool

class MessageReactionCreate(BaseModel):
    message_id: str
    emoji: str

# Mock data storage
conversations = []
messages = []
calls = []
call_participants = []
file_uploads = []
voice_messages = []
typing_indicators = []
message_reactions = []
conversation_settings = []
chat_invitations = []
chat_analytics = []

# WebSocket endpoint for real-time chat
@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle different types of real-time events
            event_type = message_data.get("type")
            
            if event_type == "message":
                await handle_new_message(message_data, user_id)
            elif event_type == "typing":
                await handle_typing_indicator(message_data, user_id)
            elif event_type == "call":
                await handle_call_event(message_data, user_id)
            elif event_type == "reaction":
                await handle_message_reaction(message_data, user_id)
            elif event_type == "read":
                await handle_message_read(message_data, user_id)
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)

async def handle_new_message(message_data: Dict[str, Any], user_id: str):
    """Handle new message from WebSocket"""
    conversation_id = message_data.get("conversation_id")
    content = message_data.get("content")
    message_type = message_data.get("message_type", "text")
    
    # Create new message
    message = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        sender_id=user_id,
        message_type=MessageType(message_type),
        content=content,
        file_url=message_data.get("file_url"),
        file_name=message_data.get("file_name"),
        file_size=message_data.get("file_size"),
        file_type=message_data.get("file_type"),
        location=message_data.get("location"),
        contact=message_data.get("contact"),
        emoji=message_data.get("emoji"),
        reply_to=message_data.get("reply_to")
    )
    
    messages.append(message.dict())
    
    # Update conversation last message
    for conv in conversations:
        if conv["id"] == conversation_id:
            conv["last_message"] = {
                "id": message.id,
                "content": content,
                "sender_id": user_id,
                "created_at": message.created_at.isoformat()
            }
            conv["updated_at"] = datetime.utcnow().isoformat()
            break
    
    # Broadcast to conversation participants
    await manager.broadcast_to_conversation(
        json.dumps({
            "type": "new_message",
            "message": message.dict()
        }),
        conversation_id
    )

async def handle_typing_indicator(data: Dict[str, Any], user_id: str):
    """Handle typing indicator"""
    conversation_id = data.get("conversation_id")
    is_typing = data.get("is_typing", False)
    
    # Update typing indicator
    typing_indicator = TypingIndicator(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        user_id=user_id,
        is_typing=is_typing,
        started_at=datetime.utcnow() if is_typing else None
    )
    
    typing_indicators.append(typing_indicator.dict())
    
    # Broadcast typing indicator
    await manager.broadcast_to_conversation(
        json.dumps({
            "type": "typing_indicator",
            "user_id": user_id,
            "conversation_id": conversation_id,
            "is_typing": is_typing
        }),
        conversation_id
    )

async def handle_call_event(data: Dict[str, Any], user_id: str):
    """Handle call events"""
    event = data.get("event")
    call_id = data.get("call_id")
    
    if event == "join":
        # User joined call
        participant = CallParticipant(
            id=str(uuid.uuid4()),
            call_id=call_id,
            user_id=user_id,
            joined_at=datetime.utcnow()
        )
        call_participants.append(participant.dict())
        
        await manager.broadcast_to_conversation(
            json.dumps({
                "type": "call_participant_joined",
                "call_id": call_id,
                "user_id": user_id
            }),
            data.get("conversation_id")
        )
    
    elif event == "leave":
        # User left call
        for participant in call_participants:
            if participant["call_id"] == call_id and participant["user_id"] == user_id:
                participant["left_at"] = datetime.utcnow().isoformat()
                break
        
        await manager.broadcast_to_conversation(
            json.dumps({
                "type": "call_participant_left",
                "call_id": call_id,
                "user_id": user_id
            }),
            data.get("conversation_id")
        )

async def handle_message_reaction(data: Dict[str, Any], user_id: str):
    """Handle message reactions"""
    message_id = data.get("message_id")
    emoji = data.get("emoji")
    
    reaction = MessageReaction(
        id=str(uuid.uuid4()),
        message_id=message_id,
        user_id=user_id,
        emoji=emoji
    )
    
    message_reactions.append(reaction.dict())
    
    # Update message reactions
    for message in messages:
        if message["id"] == message_id:
            message["reactions"][user_id] = emoji
            break
    
    # Broadcast reaction
    await manager.broadcast_to_conversation(
        json.dumps({
            "type": "message_reaction",
            "message_id": message_id,
            "user_id": user_id,
            "emoji": emoji
        }),
        data.get("conversation_id")
    )

async def handle_message_read(data: Dict[str, Any], user_id: str):
    """Handle message read status"""
    message_id = data.get("message_id")
    
    # Update message read status
    for message in messages:
        if message["id"] == message_id and user_id not in message["read_by"]:
            message["read_by"].append(user_id)
            message["status"] = "read"
            break
    
    # Broadcast read receipt
    await manager.broadcast_to_conversation(
        json.dumps({
            "type": "message_read",
            "message_id": message_id,
            "user_id": user_id
        }),
        data.get("conversation_id")
    )

# Conversation Management
@router.post("/conversations", response_model=Conversation)
async def create_conversation(conversation_data: ConversationCreate):
    """Create a new conversation"""
    user = get_mock_user()
    
    conversation = Conversation(
        id=str(uuid.uuid4()),
        participants=conversation_data.participants,
        admins=[user["id"]] if conversation_data.type == ConversationType.group else [],
        **conversation_data.dict(exclude={"participants"})
    )
    
    conversations.append(conversation.dict())
    logger.info(f"Created conversation for user {user['id']}")
    
    return conversation

@router.get("/conversations", response_model=List[Conversation])
async def get_conversations(
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """Get user's conversations"""
    user = get_mock_user()
    
    user_conversations = [
        conv for conv in conversations 
        if user["id"] in conv["participants"]
    ]
    
    # Sort by last message time
    user_conversations.sort(
        key=lambda x: x["updated_at"], 
        reverse=True
    )
    
    return user_conversations[offset:offset + limit]

@router.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    """Get a specific conversation"""
    user = get_mock_user()
    
    for conversation in conversations:
        if conversation["id"] == conversation_id and user["id"] in conversation["participants"]:
            return conversation
    
    raise HTTPException(status_code=404, detail="Conversation not found")

# Message Management
@router.post("/messages", response_model=Message)
async def send_message(message_data: MessageCreate):
    """Send a new message"""
    user = get_mock_user()
    
    message = Message(
        id=str(uuid.uuid4()),
        sender_id=user["id"],
        **message_data.dict()
    )
    
    messages.append(message.dict())
    
    # Update conversation last message
    for conv in conversations:
        if conv["id"] == message_data.conversation_id:
            conv["last_message"] = {
                "id": message.id,
                "content": message_data.content,
                "sender_id": user["id"],
                "created_at": message.created_at.isoformat()
            }
            conv["updated_at"] = datetime.utcnow().isoformat()
            break
    
    logger.info(f"Message sent by user {user['id']}")
    
    return message

@router.get("/conversations/{conversation_id}/messages", response_model=List[Message])
async def get_messages(
    conversation_id: str,
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    before_id: Optional[str] = None
):
    """Get messages from a conversation"""
    user = get_mock_user()
    
    # Verify user is in conversation
    conversation_exists = any(
        conv["id"] == conversation_id and user["id"] in conv["participants"]
        for conv in conversations
    )
    
    if not conversation_exists:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation_messages = [
        msg for msg in messages 
        if msg["conversation_id"] == conversation_id
    ]
    
    # Sort by creation time (newest first)
    conversation_messages.sort(
        key=lambda x: x["created_at"], 
        reverse=True
    )
    
    # Apply pagination
    if before_id:
        # Get messages before specific message
        before_index = next(
            (i for i, msg in enumerate(conversation_messages) if msg["id"] == before_id),
            len(conversation_messages)
        )
        conversation_messages = conversation_messages[before_index + 1:before_index + 1 + limit]
    else:
        conversation_messages = conversation_messages[offset:offset + limit]
    
    return conversation_messages

# File Upload
@router.post("/upload")
async def upload_file(
    conversation_id: str = Form(...),
    file: UploadFile = File(...)
):
    """Upload a file for sharing in chat"""
    user = get_mock_user()
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Create file upload record
    file_upload = FileUpload(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        sender_id=user["id"],
        file_name=file.filename,
        file_type=file.content_type,
        file_size=len(content),
        file_url=f"/uploads/{unique_filename}"
    )
    
    file_uploads.append(file_upload.dict())
    
    return {
        "message": "File uploaded successfully",
        "file": file_upload.dict()
    }

# Voice Messages
@router.post("/voice-messages", response_model=VoiceMessage)
async def send_voice_message(voice_data: VoiceMessageCreate):
    """Send a voice message"""
    user = get_mock_user()
    
    voice_message = VoiceMessage(
        id=str(uuid.uuid4()),
        sender_id=user["id"],
        **voice_data.dict()
    )
    
    voice_messages.append(voice_message.dict())
    
    # Create corresponding message
    message = Message(
        id=str(uuid.uuid4()),
        conversation_id=voice_data.conversation_id,
        sender_id=user["id"],
        message_type=MessageType.voice_message,
        content="Voice message",
        file_url=voice_data.audio_url,
        duration=voice_data.duration
    )
    
    messages.append(message.dict())
    
    logger.info(f"Voice message sent by user {user['id']}")
    
    return voice_message

# Call Management
@router.post("/calls", response_model=Call)
async def initiate_call(call_data: CallCreate):
    """Initiate a call"""
    user = get_mock_user()
    
    call = Call(
        id=str(uuid.uuid4()),
        initiator_id=user["id"],
        status=CallStatus.outgoing,
        **call_data.dict()
    )
    
    calls.append(call.dict())
    
    # Create call participants
    for participant_id in call_data.participants:
        participant = CallParticipant(
            id=str(uuid.uuid4()),
            call_id=call.id,
            user_id=participant_id
        )
        call_participants.append(participant.dict())
    
    logger.info(f"Call initiated by user {user['id']}")
    
    return call

@router.put("/calls/{call_id}/answer")
async def answer_call(call_id: str):
    """Answer a call"""
    user = get_mock_user()
    
    for call in calls:
        if call["id"] == call_id and user["id"] in call["participants"]:
            call["status"] = CallStatus.answered
            call["start_time"] = datetime.utcnow().isoformat()
            
            # Update participant
            for participant in call_participants:
                if participant["call_id"] == call_id and participant["user_id"] == user["id"]:
                    participant["joined_at"] = datetime.utcnow().isoformat()
                    break
            
            return {"message": "Call answered"}
    
    raise HTTPException(status_code=404, detail="Call not found")

@router.put("/calls/{call_id}/end")
async def end_call(call_id: str):
    """End a call"""
    user = get_mock_user()
    
    for call in calls:
        if call["id"] == call_id and user["id"] in call["participants"]:
            call["status"] = CallStatus.ended
            call["end_time"] = datetime.utcnow().isoformat()
            
            # Calculate duration
            if call["start_time"]:
                start_time = datetime.fromisoformat(call["start_time"])
                end_time = datetime.utcnow()
                call["duration"] = int((end_time - start_time).total_seconds())
            
            return {"message": "Call ended"}
    
    raise HTTPException(status_code=404, detail="Call not found")

@router.get("/calls", response_model=List[Call])
async def get_calls(conversation_id: Optional[str] = None):
    """Get user's calls"""
    user = get_mock_user()
    
    user_calls = [call for call in calls if user["id"] in call["participants"]]
    
    if conversation_id:
        user_calls = [call for call in user_calls if call["conversation_id"] == conversation_id]
    
    return user_calls

# Message Reactions
@router.post("/messages/{message_id}/reactions", response_model=MessageReaction)
async def add_reaction(message_id: str, reaction_data: MessageReactionCreate):
    """Add reaction to a message"""
    user = get_mock_user()
    
    reaction = MessageReaction(
        id=str(uuid.uuid4()),
        message_id=message_id,
        user_id=user["id"],
        emoji=reaction_data.emoji
    )
    
    message_reactions.append(reaction.dict())
    
    # Update message reactions
    for message in messages:
        if message["id"] == message_id:
            message["reactions"][user["id"]] = reaction_data.emoji
            break
    
    return reaction

@router.delete("/messages/{message_id}/reactions")
async def remove_reaction(message_id: str, emoji: str):
    """Remove reaction from a message"""
    user = get_mock_user()
    
    # Remove reaction
    message_reactions[:] = [
        r for r in message_reactions 
        if not (r["message_id"] == message_id and r["user_id"] == user["id"] and r["emoji"] == emoji)
    ]
    
    # Update message reactions
    for message in messages:
        if message["id"] == message_id and user["id"] in message["reactions"]:
            del message["reactions"][user["id"]]
            break
    
    return {"message": "Reaction removed"}

# Search
@router.get("/search")
async def search_messages(
    query: str,
    conversation_id: Optional[str] = None,
    limit: int = Query(20, le=50)
):
    """Search messages"""
    user = get_mock_user()
    
    search_results = []
    
    for message in messages:
        # Check if user has access to conversation
        conversation = next(
            (conv for conv in conversations if conv["id"] == message["conversation_id"]),
            None
        )
        
        if not conversation or user["id"] not in conversation["participants"]:
            continue
        
        # Filter by conversation if specified
        if conversation_id and message["conversation_id"] != conversation_id:
            continue
        
        # Search in content
        if query.lower() in message["content"].lower():
            search_result = ChatSearchResult(
                id=str(uuid.uuid4()),
                conversation_id=message["conversation_id"],
                message_id=message["id"],
                sender_id=message["sender_id"],
                content=message["content"],
                message_type=message["message_type"],
                created_at=message["created_at"],
                relevance_score=0.8  # Mock relevance score
            )
            search_results.append(search_result.dict())
    
    # Sort by relevance and limit results
    search_results.sort(key=lambda x: x["relevance_score"], reverse=True)
    return search_results[:limit]

# Chat Analytics
@router.get("/analytics/{conversation_id}")
async def get_chat_analytics(conversation_id: str):
    """Get chat analytics for a conversation"""
    user = get_mock_user()
    
    # Verify user has access
    conversation = next(
        (conv for conv in conversations if conv["id"] == conversation_id),
        None
    )
    
    if not conversation or user["id"] not in conversation["participants"]:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Calculate analytics
    conversation_messages = [msg for msg in messages if msg["conversation_id"] == conversation_id]
    conversation_calls = [call for call in calls if call["conversation_id"] == conversation_id]
    conversation_files = [file for file in file_uploads if file["conversation_id"] == conversation_id]
    conversation_voice = [vm for vm in voice_messages if vm["conversation_id"] == conversation_id]
    
    # Calculate most active hours
    hour_counts = {}
    for msg in conversation_messages:
        hour = datetime.fromisoformat(msg["created_at"]).hour
        hour_counts[hour] = hour_counts.get(hour, 0) + 1
    
    most_active_hours = sorted(hour_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    most_active_hours = [hour for hour, count in most_active_hours]
    
    # Calculate favorite emojis
    emoji_counts = {}
    for msg in conversation_messages:
        if msg["emoji"]:
            emoji_counts[msg["emoji"]] = emoji_counts.get(msg["emoji"], 0) + 1
    
    favorite_emojis = sorted(emoji_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    favorite_emojis = [emoji for emoji, count in favorite_emojis]
    
    analytics = ChatAnalytics(
        id=str(uuid.uuid4()),
        user_id=user["id"],
        conversation_id=conversation_id,
        total_messages=len(conversation_messages),
        total_calls=len(conversation_calls),
        total_call_duration=sum(call.get("duration", 0) for call in conversation_calls),
        total_files_shared=len(conversation_files),
        total_voice_messages=len(conversation_voice),
        most_active_hours=most_active_hours,
        favorite_emojis=favorite_emojis
    )
    
    return analytics.dict()

# Emoji suggestions
@router.get("/emoji-suggestions")
async def get_emoji_suggestions(text: str):
    """Get emoji suggestions based on text"""
    # Mock emoji suggestions based on text content
    emoji_map = {
        "happy": ["😊", "😄", "😃", "🙂", "😁"],
        "sad": ["😢", "😭", "😔", "😞", "😥"],
        "love": ["❤️", "💕", "💖", "💗", "💓"],
        "laugh": ["😂", "🤣", "😆", "😅", "😄"],
        "angry": ["😠", "😡", "🤬", "😤", "😾"],
        "surprised": ["😲", "😱", "😯", "😳", "🤯"],
        "food": ["🍕", "🍔", "🍟", "🌮", "🍜"],
        "travel": ["✈️", "🏖️", "🗺️", "🏰", "🌍"],
        "work": ["💼", "👔", "📊", "💻", "📈"],
        "party": ["🎉", "🎊", "🎈", "🎂", "🍾"]
    }
    
    suggestions = []
    text_lower = text.lower()
    
    for category, emojis in emoji_map.items():
        if category in text_lower:
            suggestions.extend(emojis)
    
    # Add common emojis
    common_emojis = ["👍", "👎", "❤️", "😊", "😂", "🎉", "🔥", "💯", "👏", "🙏"]
    suggestions.extend(common_emojis)
    
    return {"suggestions": list(set(suggestions))[:10]}

# Chat Dashboard
@router.get("/dashboard")
async def get_chat_dashboard():
    """Get chat dashboard with overview"""
    user = get_mock_user()
    
    # Get user's conversations
    user_conversations = [
        conv for conv in conversations 
        if user["id"] in conv["participants"]
    ]
    
    # Get recent messages
    recent_messages = [
        msg for msg in messages 
        if any(conv["id"] == msg["conversation_id"] for conv in user_conversations)
    ][:10]
    
    # Get recent calls
    recent_calls = [
        call for call in calls 
        if user["id"] in call["participants"]
    ][:5]
    
    # Calculate unread counts
    unread_counts = {}
    for conv in user_conversations:
        unread_count = len([
            msg for msg in messages 
            if msg["conversation_id"] == conv["id"] 
            and msg["sender_id"] != user["id"]
            and user["id"] not in msg["read_by"]
        ])
        unread_counts[conv["id"]] = unread_count
    
    return {
        "total_conversations": len(user_conversations),
        "total_unread_messages": sum(unread_counts.values()),
        "recent_conversations": user_conversations[:5],
        "recent_messages": recent_messages,
        "recent_calls": recent_calls,
        "unread_counts": unread_counts,
        "online_friends": 12,  # Mock data
        "total_messages_today": 45,  # Mock data
        "favorite_emojis": ["😊", "❤️", "😂", "👍", "🎉"]
    }
