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
  private connectionErrorCallback: ((error: string) => void) | null = null;
  private connectionStatusCallback: ((connected: boolean) => void) | null = null;
  // Initialize cache as unavailable to skip first health check (prevents initial error)
  // Set timestamp to current time so cache appears fresh on first load
  private serverAvailableCache: { available: boolean; timestamp: number } = {
    available: false,
    timestamp: Date.now() // Set to current time so cache appears fresh, preventing initial health check
  };
  private readonly CACHE_DURATION = 30000; // 30 seconds cache
  private healthCheckInProgress: boolean = false;
  private healthCheckPromise: Promise<boolean> | null = null;

  // Connect to WebSocket
  connect(userId: string): Promise<void> {
    return new Promise(async (resolve) => {
      try {
        // Check cache first - if server was unavailable recently, skip check entirely
        const cacheAge = Date.now() - this.serverAvailableCache.timestamp;
        if (cacheAge < this.CACHE_DURATION && !this.serverAvailableCache.available) {
          // Server was recently unavailable, skip connection attempt
          resolve();
          return;
        }
        
        // Only check server availability if cache is expired or server was previously available
        // This prevents the initial health check error on first load
        if (cacheAge >= this.CACHE_DURATION || this.serverAvailableCache.available) {
          const isAvailable = await this.isChatServerAvailable();
          if (!isAvailable) {
            // Notify user that server is unavailable
            this.emitConnectionStatusChange(false, 'Chat server unavailable - using offline mode');
            resolve();
            return;
          }
        } else {
          // Cache says unavailable and still fresh, skip connection
          this.emitConnectionStatusChange(false, 'Chat server unavailable - using offline mode');
          resolve();
          return;
        }
        
        // Use WebSocket URL for connection
        const wsURL = this.baseURL.replace('http://', 'ws://');
        this.socket = io(wsURL, {
          transports: ['websocket'],
          query: { user_id: userId },
          reconnection: false, // Disable auto-reconnection to reduce error spam
          timeout: 2000, // Short timeout
        });

        this.socket.on('connect', () => {
          // Notify about successful connection
          this.emitConnectionStatusChange(true, 'Connected to chat server');
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          // Notify about disconnection with reason
          const message = reason === 'io server disconnect' 
            ? 'Disconnected by server' 
            : reason === 'io client disconnect'
            ? 'Disconnected by client'
            : 'Connection lost';
          this.emitConnectionStatusChange(false, message);
        });

        this.socket.on('connect_error', (error) => {
          // Notify about connection error with detailed message
          const errorMessage = error.message || 'Failed to connect to chat server';
          this.emitConnectionError(errorMessage);
          this.emitConnectionStatusChange(false, errorMessage);
          // Resolve instead of reject to prevent unhandled promise rejections
          // The app will work in offline mode with fallback data
          resolve();
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
        // Silently handle initialization errors - resolve to prevent unhandled rejections
        resolve();
      }
    });
  }

  // Check if chat server is available (with caching and debouncing to reduce repeated checks)
  private async isChatServerAvailable(): Promise<boolean> {
    // Check cache first
    const cacheAge = Date.now() - this.serverAvailableCache.timestamp;
    if (cacheAge < this.CACHE_DURATION) {
      return this.serverAvailableCache.available;
    }
    
    // If a health check is already in progress, wait for it
    if (this.healthCheckInProgress && this.healthCheckPromise) {
      return await this.healthCheckPromise;
    }
    
    // Start new health check
    this.healthCheckInProgress = true;
    this.healthCheckPromise = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout
        
        const response = await fetch(`${this.baseURL}/health`, {
          method: 'GET',
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit',
        });
        
        clearTimeout(timeoutId);
        const available = response.ok;
        
        // Cache the result
        this.serverAvailableCache = {
          available,
          timestamp: Date.now()
        };
        
        this.healthCheckInProgress = false;
        this.healthCheckPromise = null;
        return available;
      } catch (error) {
        // Cache the failure result
        this.serverAvailableCache = {
          available: false,
          timestamp: Date.now()
        };
        this.healthCheckInProgress = false;
        this.healthCheckPromise = null;
        return false;
      }
    })();
    
    return await this.healthCheckPromise;
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      if (this.connectionStatusCallback) {
        this.connectionStatusCallback(false);
      }
    }
  }

  // Set callback for connection errors
  onConnectionError(callback: (error: string) => void) {
    this.connectionErrorCallback = callback;
  }

  // Set callback for connection status changes (with optional message)
  onConnectionStatusChange(callback: (connected: boolean, message?: string) => void) {
    this.connectionStatusCallback = callback as any;
  }

  // Remove callbacks
  removeConnectionErrorCallback() {
    this.connectionErrorCallback = null;
  }

  removeConnectionStatusCallback() {
    this.connectionStatusCallback = null;
  }
  
  // Emit connection status change with message
  private emitConnectionStatusChange(isConnected: boolean, message?: string) {
    if (this.connectionStatusCallback) {
      // Check if callback accepts message parameter
      if (this.connectionStatusCallback.length >= 2) {
        (this.connectionStatusCallback as any)(isConnected, message);
      } else {
        this.connectionStatusCallback(isConnected);
      }
    }
  }
  
  // Emit connection error
  private emitConnectionError(error: string) {
    if (this.connectionErrorCallback) {
      this.connectionErrorCallback(error);
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
      // Silently handle errors
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
      // Silently handle errors
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
    // Check cache first - if server was unavailable recently, skip check entirely
    if (this.serverAvailableCache && 
        Date.now() - this.serverAvailableCache.timestamp < this.CACHE_DURATION &&
        !this.serverAvailableCache.available) {
      // Server was recently unavailable, return empty array immediately
      return [];
    }
    
    // Check if server is available before making request
    const isAvailable = await this.isChatServerAvailable();
    if (!isAvailable) {
      // Return empty array immediately without making request
      return [];
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${this.baseURL}/api/users`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Update cache if server becomes unavailable
        this.serverAvailableCache = { available: false, timestamp: Date.now() };
        return [];
      }
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      // Update cache if server becomes unavailable
      this.serverAvailableCache = { available: false, timestamp: Date.now() };
      return [];
    }
  }

  async getUser(userId: string): Promise<ChatUser> {
    try {
      const response = await fetch(`${this.baseURL}/api/users/${userId}`);
      const data = await response.json();
      return data.user;
    } catch (error) {
      // Silently handle errors
      throw error;
    }
  }

  async getRooms(): Promise<ChatRoom[]> {
    // Check cache first - if server was unavailable recently, skip check entirely
    if (this.serverAvailableCache && 
        Date.now() - this.serverAvailableCache.timestamp < this.CACHE_DURATION &&
        !this.serverAvailableCache.available) {
      // Server was recently unavailable, return empty array immediately
      return [];
    }
    
    // Check if server is available before making request
    const isAvailable = await this.isChatServerAvailable();
    if (!isAvailable) {
      // Return empty array immediately without making request
      return [];
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${this.baseURL}/api/rooms`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Update cache if server becomes unavailable
        this.serverAvailableCache = { available: false, timestamp: Date.now() };
        return [];
      }
      const data = await response.json();
      return data.rooms || [];
    } catch (error) {
      // Update cache if server becomes unavailable
      this.serverAvailableCache = { available: false, timestamp: Date.now() };
      return [];
    }
  }

  async getRoom(roomId: string): Promise<ChatRoom> {
    try {
      const response = await fetch(`${this.baseURL}/api/rooms/${roomId}`);
      const data = await response.json();
      return data.room;
    } catch (error) {
      // Silently handle errors
      throw error;
    }
  }

  async getRoomMessages(roomId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.messages;
    } catch (error: any) {
      // Silently handle connection errors - chat works offline
      if (error?.message?.includes('Failed to fetch') || error?.message?.includes('CONNECTION_REFUSED')) {
        // Return empty array instead of throwing - allows fallback to localStorage
        return [];
      }
      // Re-throw other errors
      throw error;
    }
  }

  async createRoom(roomData: { name: string; type: 'direct' | 'group'; participants: string[] }): Promise<ChatRoom> {
    // Check if server is available before making request
    const isAvailable = await this.isChatServerAvailable();
    if (!isAvailable) {
      // Return a mock room for offline mode
      return {
        id: `room-${Date.now()}-${Math.random()}`,
        name: roomData.name,
        type: roomData.type,
        participants: roomData.participants,
        created_at: new Date().toISOString(),
      };
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${this.baseURL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Update cache if server becomes unavailable
        this.serverAvailableCache = { available: false, timestamp: Date.now() };
        // Return mock room for offline mode
        return {
          id: `room-${Date.now()}-${Math.random()}`,
          name: roomData.name,
          type: roomData.type,
          participants: roomData.participants,
          created_at: new Date().toISOString(),
        };
      }
      const data = await response.json();
      return data.room;
    } catch (error) {
      // Update cache if server becomes unavailable
      this.serverAvailableCache = { available: false, timestamp: Date.now() };
      // Return mock room for offline mode
      return {
        id: `room-${Date.now()}-${Math.random()}`,
        name: roomData.name,
        type: roomData.type,
        participants: roomData.participants,
        created_at: new Date().toISOString(),
      };
    }
  }

  async getFile(fileId: string): Promise<{ file_id: string; name: string; size: number; type: string; data: string }> {
    try {
      const response = await fetch(`${this.baseURL}/api/files/${fileId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      // Silently handle errors
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
      // Silently handle errors
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
