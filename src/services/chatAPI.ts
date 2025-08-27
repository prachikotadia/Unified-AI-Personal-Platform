import { io, Socket } from 'socket.io-client';

// Types
export interface ChatUser {
  id: string;
  username: string;
  display_name: string;
  avatar?: string;
  is_online: boolean;
  last_seen?: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'fitness_data';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  fitness_data?: any;
  timestamp: string;
  is_read: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group';
  participants: string[];
  created_at: string;
  last_message?: ChatMessage;
}

export interface FitnessData {
  steps?: number;
  calories?: number;
  distance?: number;
  workout_type?: string;
  duration?: number;
  heart_rate?: number;
  sleep_hours?: number;
  weight?: number;
  bmi?: number;
  goals?: any[];
  achievements?: any[];
}

class ChatAPIService {
  private socket: Socket | null = null;
  private baseURL = 'http://localhost:8003';
  private messageHandlers: Map<string, (message: ChatMessage) => void> = new Map();
  private typingHandlers: Map<string, (data: { user_id: string; is_typing: boolean }) => void> = new Map();
  private connectionHandlers: Map<string, () => void> = new Map();

  // Connect to WebSocket
  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Use WebSocket URL for connection
        const wsURL = this.baseURL.replace('http://', 'ws://');
        this.socket = io(wsURL, {
          transports: ['websocket'],
          query: { user_id: userId }
        });

        this.socket.on('connect', () => {
          console.log('Connected to chat server');
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from chat server');
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          reject(error);
        });

        // Handle incoming messages
        this.socket.on('new_message', (data: { message: ChatMessage }) => {
          const { message } = data;
          const handler = this.messageHandlers.get(message.room_id);
          if (handler) {
            handler(message);
          }
        });

        // Handle typing indicators
        this.socket.on('typing_indicator', (data: { room_id: string; user_id: string; is_typing: boolean }) => {
          const handler = this.typingHandlers.get(data.room_id);
          if (handler) {
            handler({ user_id: data.user_id, is_typing: data.is_typing });
          }
        });

        // Handle user status changes
        this.socket.on('user_status_change', (data: { user_id: string; is_online: boolean }) => {
          const handler = this.connectionHandlers.get('user_status');
          if (handler) {
            handler();
          }
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a room
  joinRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('join_room', { room_id: roomId });
    }
  }

  // Leave a room
  leaveRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('leave_room', { room_id: roomId });
    }
  }

  // Send a text message
  sendMessage(roomId: string, content: string): void {
    if (this.socket) {
      this.socket.emit('message', {
        type: 'message',
        room_id: roomId,
        content,
        message_type: 'text'
      });
    }
  }

  // Send an image message
  async sendImage(roomId: string, file: File): Promise<void> {
    if (!this.socket) return;

    try {
      const base64Data = await this.fileToBase64(file);
      this.socket.emit('message', {
        type: 'message',
        room_id: roomId,
        content: 'Image shared',
        message_type: 'image',
        file_data: {
          data: base64Data,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type
        }
      });
    } catch (error) {
      console.error('Error sending image:', error);
      throw error;
    }
  }

  // Send a file message
  async sendFile(roomId: string, file: File): Promise<void> {
    if (!this.socket) return;

    try {
      const base64Data = await this.fileToBase64(file);
      this.socket.emit('message', {
        type: 'message',
        room_id: roomId,
        content: `File: ${file.name}`,
        message_type: 'file',
        file_data: {
          data: base64Data,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type
        }
      });
    } catch (error) {
      console.error('Error sending file:', error);
      throw error;
    }
  }

  // Share fitness data
  shareFitnessData(roomId: string, fitnessData: FitnessData): void {
    if (this.socket) {
      this.socket.emit('message', {
        type: 'share_fitness',
        room_id: roomId,
        fitness_data: fitnessData
      });
    }
  }

  // Send typing indicator
  sendTypingIndicator(roomId: string, isTyping: boolean): void {
    if (this.socket) {
      this.socket.emit('typing', {
        type: 'typing',
        room_id: roomId,
        is_typing: isTyping
      });
    }
  }

  // Mark messages as read
  markMessagesAsRead(roomId: string, messageIds: string[]): void {
    if (this.socket) {
      this.socket.emit('read_messages', {
        type: 'read_messages',
        room_id: roomId,
        message_ids: messageIds
      });
    }
  }

  // Event handlers
  onMessage(roomId: string, handler: (message: ChatMessage) => void): void {
    this.messageHandlers.set(roomId, handler);
  }

  onTyping(roomId: string, handler: (data: { user_id: string; is_typing: boolean }) => void): void {
    this.typingHandlers.set(roomId, handler);
  }

  onUserStatusChange(handler: () => void): void {
    this.connectionHandlers.set('user_status', handler);
  }

  // Remove event handlers
  removeMessageHandler(roomId: string): void {
    this.messageHandlers.delete(roomId);
  }

  removeTypingHandler(roomId: string): void {
    this.typingHandlers.delete(roomId);
  }

  // Utility function to convert file to base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  // REST API methods
  async getUsers(): Promise<ChatUser[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/users`);
      const data = await response.json();
      return data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<ChatUser> {
    try {
      const response = await fetch(`${this.baseURL}/api/users/${userId}`);
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async getRooms(): Promise<ChatRoom[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/rooms`);
      const data = await response.json();
      return data.rooms;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  }

  async getRoom(roomId: string): Promise<ChatRoom> {
    try {
      const response = await fetch(`${this.baseURL}/api/rooms/${roomId}`);
      const data = await response.json();
      return data.room;
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  }

  async getRoomMessages(roomId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`);
      const data = await response.json();
      return data.messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async createRoom(roomData: { name: string; type: 'direct' | 'group'; participants: string[] }): Promise<ChatRoom> {
    try {
      const response = await fetch(`${this.baseURL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });
      const data = await response.json();
      return data.room;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  async getFile(fileId: string): Promise<{ file_id: string; name: string; size: number; type: string; data: string }> {
    try {
      const response = await fetch(`${this.baseURL}/api/files/${fileId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
  }

  // Search users by username
  async searchUsers(query: string): Promise<ChatUser[]> {
    try {
      const users = await this.getUsers();
      return users.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.display_name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Get user's fitness data (mock data for now)
  async getUserFitnessData(userId: string): Promise<FitnessData> {
    // Mock fitness data - in a real app, this would come from the fitness service
    return {
      steps: Math.floor(Math.random() * 10000) + 5000,
      calories: Math.floor(Math.random() * 500) + 200,
      distance: Math.floor(Math.random() * 10) + 2,
      workout_type: 'Running',
      duration: Math.floor(Math.random() * 60) + 30,
      heart_rate: Math.floor(Math.random() * 40) + 120,
      sleep_hours: Math.floor(Math.random() * 3) + 7,
      weight: Math.floor(Math.random() * 20) + 70,
      bmi: Math.floor(Math.random() * 5) + 22,
      goals: [
        { type: 'steps', target: 10000, current: 8500 },
        { type: 'calories', target: 500, current: 450 },
        { type: 'sleep', target: 8, current: 7.5 }
      ],
      achievements: [
        { type: 'streak', title: '7 Day Streak', description: 'Worked out for 7 days in a row' },
        { type: 'distance', title: '5K Runner', description: 'Completed a 5K run' }
      ]
    };
  }
}

// Create singleton instance
const chatAPI = new ChatAPIService();
export default chatAPI;
