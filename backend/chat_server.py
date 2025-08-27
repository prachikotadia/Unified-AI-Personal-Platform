import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import os
from pathlib import Path

app = FastAPI(title="Real-time Chat Server", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class User(BaseModel):
    id: str
    username: str
    display_name: str
    avatar: Optional[str] = None
    is_online: bool = False
    last_seen: Optional[datetime] = None

class Message(BaseModel):
    id: str
    room_id: str
    sender_id: str
    sender_name: str
    sender_avatar: Optional[str] = None
    content: str
    message_type: str = "text"  # text, image, file, fitness_data
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    fitness_data: Optional[Dict[str, Any]] = None
    timestamp: datetime
    is_read: bool = False

class ChatRoom(BaseModel):
    id: str
    name: str
    type: str = "direct"  # direct, group
    participants: List[str]
    created_at: datetime
    last_message: Optional[Message] = None

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_rooms: Dict[str, List[str]] = {}  # user_id -> room_ids
        self.typing_users: Dict[str, Dict[str, bool]] = {}  # room_id -> {user_id: is_typing}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"User {user_id} connected")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        print(f"User {user_id} disconnected")

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

    async def send_to_room(self, message: str, room_id: str, exclude_user: Optional[str] = None):
        for user_id, websocket in self.active_connections.items():
            if user_id != exclude_user and room_id in self.user_rooms.get(user_id, []):
                await websocket.send_text(message)

    async def send_typing_indicator(self, room_id: str, user_id: str, is_typing: bool):
        typing_data = {
            "type": "typing_indicator",
            "room_id": room_id,
            "user_id": user_id,
            "is_typing": is_typing
        }
        await self.send_to_room(json.dumps(typing_data), room_id, exclude_user=user_id)

manager = ConnectionManager()

# Mock data storage
users: Dict[str, User] = {}
rooms: Dict[str, ChatRoom] = {}
messages: Dict[str, List[Message]] = {}
file_uploads: Dict[str, Dict[str, Any]] = {}

# Initialize some mock data
def initialize_mock_data():
    # Mock users
    users["user1"] = User(
        id="user1",
        username="john_doe",
        display_name="John Doe",
        avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        is_online=True
    )
    users["user2"] = User(
        id="user2",
        username="sarah_smith",
        display_name="Sarah Smith",
        avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        is_online=False
    )
    users["user3"] = User(
        id="user3",
        username="mike_wilson",
        display_name="Mike Wilson",
        avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        is_online=True
    )

    # Mock rooms
    rooms["room1"] = ChatRoom(
        id="room1",
        name="John & Sarah",
        type="direct",
        participants=["user1", "user2"],
        created_at=datetime.now()
    )
    rooms["room2"] = ChatRoom(
        id="room2",
        name="John & Mike",
        type="direct",
        participants=["user1", "user3"],
        created_at=datetime.now()
    )

    # Mock messages
    messages["room1"] = [
        Message(
            id="msg1",
            room_id="room1",
            sender_id="user2",
            sender_name="Sarah Smith",
            sender_avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            content="Hey! How's your fitness journey going?",
            timestamp=datetime.now()
        ),
        Message(
            id="msg2",
            room_id="room1",
            sender_id="user1",
            sender_name="John Doe",
            sender_avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            content="Great! I just completed a 5K run. Want to see my stats?",
            timestamp=datetime.now()
        )
    ]

    messages["room2"] = [
        Message(
            id="msg3",
            room_id="room2",
            sender_id="user3",
            sender_name="Mike Wilson",
            sender_avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            content="Hey John! Can you share your workout plan?",
            timestamp=datetime.now()
        )
    ]

    # Set user rooms
    manager.user_rooms["user1"] = ["room1", "room2"]
    manager.user_rooms["user2"] = ["room1"]
    manager.user_rooms["user3"] = ["room2"]

initialize_mock_data()

# WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    
    # Update user online status
    if user_id in users:
        users[user_id].is_online = True
        users[user_id].last_seen = datetime.now()
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            event_type = message_data.get("type")
            
            if event_type == "message":
                await handle_new_message(message_data, user_id)
            elif event_type == "typing":
                await handle_typing_indicator(message_data, user_id)
            elif event_type == "join_room":
                await handle_join_room(message_data, user_id)
            elif event_type == "leave_room":
                await handle_leave_room(message_data, user_id)
            elif event_type == "read_messages":
                await handle_read_messages(message_data, user_id)
            elif event_type == "share_fitness":
                await handle_share_fitness(message_data, user_id)
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)
        # Update user offline status
        if user_id in users:
            users[user_id].is_online = False
            users[user_id].last_seen = datetime.now()

async def handle_new_message(message_data: Dict[str, Any], user_id: str):
    """Handle new message from WebSocket"""
    room_id = message_data.get("room_id")
    content = message_data.get("content")
    message_type = message_data.get("message_type", "text")
    file_data = message_data.get("file_data")
    fitness_data = message_data.get("fitness_data")
    
    if not room_id or not content:
        return
    
    # Create new message
    new_message = Message(
        id=str(uuid.uuid4()),
        room_id=room_id,
        sender_id=user_id,
        sender_name=users.get(user_id, User(id=user_id, username=user_id, display_name=user_id)).display_name,
        sender_avatar=users.get(user_id, User(id=user_id, username=user_id, display_name=user_id)).avatar,
        content=content,
        message_type=message_type,
        timestamp=datetime.now()
    )
    
    # Handle file upload
    if file_data and message_type in ["image", "file"]:
        file_id = str(uuid.uuid4())
        file_uploads[file_id] = {
            "data": file_data,
            "name": message_data.get("file_name", "file"),
            "size": message_data.get("file_size", 0),
            "type": message_data.get("file_type", "application/octet-stream")
        }
        new_message.file_url = f"/files/{file_id}"
        new_message.file_name = file_data.get("file_name")
        new_message.file_size = file_data.get("file_size")
        new_message.file_type = file_data.get("file_type")
    
    # Handle fitness data
    if fitness_data and message_type == "fitness_data":
        new_message.fitness_data = fitness_data
    
    # Store message
    if room_id not in messages:
        messages[room_id] = []
    messages[room_id].append(new_message)
    
    # Update room's last message
    if room_id in rooms:
        rooms[room_id].last_message = new_message
    
    # Broadcast to room
    message_payload = {
        "type": "new_message",
        "message": {
            "id": new_message.id,
            "room_id": new_message.room_id,
            "sender_id": new_message.sender_id,
            "sender_name": new_message.sender_name,
            "sender_avatar": new_message.sender_avatar,
            "content": new_message.content,
            "message_type": new_message.message_type,
            "file_url": new_message.file_url,
            "file_name": new_message.file_name,
            "file_size": new_message.file_size,
            "file_type": new_message.file_type,
            "fitness_data": new_message.fitness_data,
            "timestamp": new_message.timestamp.isoformat(),
            "is_read": new_message.is_read
        }
    }
    
    await manager.send_to_room(json.dumps(message_payload), room_id, exclude_user=user_id)

async def handle_typing_indicator(data: Dict[str, Any], user_id: str):
    """Handle typing indicator"""
    room_id = data.get("room_id")
    is_typing = data.get("is_typing", False)
    
    if room_id:
        if room_id not in manager.typing_users:
            manager.typing_users[room_id] = {}
        manager.typing_users[room_id][user_id] = is_typing
        
        await manager.send_typing_indicator(room_id, user_id, is_typing)

async def handle_join_room(data: Dict[str, Any], user_id: str):
    """Handle user joining a room"""
    room_id = data.get("room_id")
    
    if room_id and user_id not in manager.user_rooms:
        manager.user_rooms[user_id] = []
    if room_id and room_id not in manager.user_rooms[user_id]:
        manager.user_rooms[user_id].append(room_id)

async def handle_leave_room(data: Dict[str, Any], user_id: str):
    """Handle user leaving a room"""
    room_id = data.get("room_id")
    
    if room_id and user_id in manager.user_rooms:
        if room_id in manager.user_rooms[user_id]:
            manager.user_rooms[user_id].remove(room_id)

async def handle_read_messages(data: Dict[str, Any], user_id: str):
    """Handle marking messages as read"""
    room_id = data.get("room_id")
    message_ids = data.get("message_ids", [])
    
    if room_id and room_id in messages:
        for message in messages[room_id]:
            if message.id in message_ids and user_id not in message.read_by:
                message.read_by.append(user_id)
                message.is_read = True

async def handle_share_fitness(data: Dict[str, Any], user_id: str):
    """Handle sharing fitness data"""
    room_id = data.get("room_id")
    fitness_data = data.get("fitness_data", {})
    
    if room_id and fitness_data:
        # Create fitness data message
        fitness_message = Message(
            id=str(uuid.uuid4()),
            room_id=room_id,
            sender_id=user_id,
            sender_name=users.get(user_id, User(id=user_id, username=user_id, display_name=user_id)).display_name,
            sender_avatar=users.get(user_id, User(id=user_id, username=user_id, display_name=user_id)).avatar,
            content="Shared fitness data",
            message_type="fitness_data",
            fitness_data=fitness_data,
            timestamp=datetime.now()
        )
        
        # Store message
        if room_id not in messages:
            messages[room_id] = []
        messages[room_id].append(fitness_message)
        
        # Broadcast to room
        message_payload = {
            "type": "new_message",
            "message": {
                "id": fitness_message.id,
                "room_id": fitness_message.room_id,
                "sender_id": fitness_message.sender_id,
                "sender_name": fitness_message.sender_name,
                "sender_avatar": fitness_message.sender_avatar,
                "content": fitness_message.content,
                "message_type": fitness_message.message_type,
                "fitness_data": fitness_message.fitness_data,
                "timestamp": fitness_message.timestamp.isoformat(),
                "is_read": fitness_message.is_read
            }
        }
        
        await manager.send_to_room(json.dumps(message_payload), room_id, exclude_user=user_id)

# REST API endpoints
@app.get("/api/users")
async def get_users():
    """Get all users"""
    return {"users": list(users.values())}

@app.get("/api/users/{user_id}")
async def get_user(user_id: str):
    """Get specific user"""
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": users[user_id]}

@app.get("/api/rooms")
async def get_rooms():
    """Get all rooms"""
    return {"rooms": list(rooms.values())}

@app.get("/api/rooms/{room_id}")
async def get_room(room_id: str):
    """Get specific room"""
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"room": rooms[room_id]}

@app.get("/api/rooms/{room_id}/messages")
async def get_room_messages(room_id: str, limit: int = 50, offset: int = 0):
    """Get messages for a room"""
    if room_id not in messages:
        return {"messages": []}
    
    room_messages = messages[room_id]
    paginated_messages = room_messages[offset:offset + limit]
    
    return {"messages": paginated_messages}

@app.post("/api/rooms")
async def create_room(room_data: Dict[str, Any]):
    """Create a new room"""
    room_id = str(uuid.uuid4())
    new_room = ChatRoom(
        id=room_id,
        name=room_data.get("name", "New Room"),
        type=room_data.get("type", "direct"),
        participants=room_data.get("participants", []),
        created_at=datetime.now()
    )
    
    rooms[room_id] = new_room
    messages[room_id] = []
    
    # Add room to participants' room lists
    for participant_id in new_room.participants:
        if participant_id not in manager.user_rooms:
            manager.user_rooms[participant_id] = []
        manager.user_rooms[participant_id].append(room_id)
    
    return {"room": new_room}

@app.get("/api/files/{file_id}")
async def get_file(file_id: str):
    """Get uploaded file"""
    if file_id not in file_uploads:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_data = file_uploads[file_id]
    return {
        "file_id": file_id,
        "name": file_data["name"],
        "size": file_data["size"],
        "type": file_data["type"],
        "data": file_data["data"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
