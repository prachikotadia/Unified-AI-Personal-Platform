import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import chatAPI, { ChatMessage as APIChatMessage, ChatRoom as APIChatRoom, ChatUser, FitnessData } from '../services/chatAPI'

export interface Message {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file' | 'fitness_data'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  fitnessData?: FitnessData
  isRead: boolean
}

export interface ChatRoom {
  id: string
  name: string
  avatar: string
  type: 'direct' | 'group'
  participants: string[]
  lastMessage?: Message
  unreadCount: number
  isOnline: boolean
  lastSeen?: Date
}

interface ChatState {
  // Data
  rooms: ChatRoom[]
  currentRoomId: string | null
  messages: Record<string, Message[]>
  users: ChatUser[]
  currentUser: ChatUser | null
  
  // Real-time state
  isConnected: boolean
  typingUsers: Record<string, Set<string>> // roomId -> Set of typing user IDs
  
  // Loading states
  isLoading: boolean
  isLoadingMessages: boolean
  isLoadingUsers: boolean
  
  // Error states
  error: string | null
  
  // Actions
  connect: (userId: string) => Promise<void>
  disconnect: () => void
  setCurrentRoom: (roomId: string) => void
  addMessage: (roomId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  sendMessage: (roomId: string, content: string) => void
  sendImage: (roomId: string, file: File) => Promise<void>
  sendFile: (roomId: string, file: File) => Promise<void>
  shareFitnessData: (roomId: string, fitnessData: FitnessData) => void
  markAsRead: (roomId: string, messageId: string) => void
  createRoom: (room: Omit<ChatRoom, 'id' | 'unreadCount'>) => void
  updateRoom: (roomId: string, updates: Partial<ChatRoom>) => void
  deleteRoom: (roomId: string) => void
  searchUsers: (query: string) => Promise<ChatUser[]>
  getUsers: () => Promise<void>
  getRooms: () => Promise<void>
  getRoomMessages: (roomId: string) => Promise<void>
  setTypingIndicator: (roomId: string, userId: string, isTyping: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      rooms: [],
      currentRoomId: null,
      messages: {},
      users: [],
      currentUser: null,
      isConnected: false,
      typingUsers: {},
      isLoading: false,
      isLoadingMessages: false,
      isLoadingUsers: false,
      error: null,

      // Connect to WebSocket
      connect: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Connect to WebSocket
          await chatAPI.connect(userId);
          
          // Set up event handlers
          chatAPI.onUserStatusChange(() => {
            // Refresh users when status changes
            get().getUsers();
          });
          
          set({ isConnected: true, isLoading: false });
          
          // Load initial data
          await Promise.all([
            get().getUsers(),
            get().getRooms()
          ]);
          
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to connect to chat server',
            isLoading: false 
          });
        }
      },

      disconnect: () => {
        chatAPI.disconnect();
        set({ isConnected: false });
      },

      setCurrentRoom: (roomId: string) => {
        const { messages, rooms } = get();
        
        // Leave previous room
        const currentRoomId = get().currentRoomId;
        if (currentRoomId) {
          chatAPI.leaveRoom(currentRoomId);
          chatAPI.removeMessageHandler(currentRoomId);
          chatAPI.removeTypingHandler(currentRoomId);
        }
        
        // Join new room
        chatAPI.joinRoom(roomId);
        
        // Set up message handler for this room
        chatAPI.onMessage(roomId, (message: APIChatMessage) => {
          const newMessage: Message = {
            id: message.id,
            roomId: message.room_id,
            senderId: message.sender_id,
            senderName: message.sender_name,
            senderAvatar: message.sender_avatar || '',
            content: message.content,
            timestamp: new Date(message.timestamp),
            type: message.message_type as any,
            fileUrl: message.file_url,
            fileName: message.file_name,
            fileSize: message.file_size,
            fileType: message.file_type,
            fitnessData: message.fitness_data,
            isRead: message.is_read
          };
          
          get().addMessage(roomId, newMessage);
        });
        
        // Set up typing handler for this room
        chatAPI.onTyping(roomId, (data) => {
          get().setTypingIndicator(roomId, data.user_id, data.is_typing);
        });
        
        set({ currentRoomId: roomId });
        
        // Mark messages as read
        const roomMessages = messages[roomId] || [];
        const unreadMessageIds = roomMessages
          .filter(msg => !msg.isRead && msg.senderId !== get().currentUser?.id)
          .map(msg => msg.id);
        
        if (unreadMessageIds.length > 0) {
          chatAPI.markMessagesAsRead(roomId, unreadMessageIds);
        }
        
        // Update unread count
        const updatedRooms = rooms.map(room => 
          room.id === roomId ? { ...room, unreadCount: 0 } : room
        );
        set({ rooms: updatedRooms });
      },

      addMessage: (roomId: string, messageData: Omit<Message, 'id' | 'timestamp'>) => {
        const { messages, rooms } = get();
        const newMessage: Message = {
          ...messageData,
          id: `msg_${Date.now()}_${Math.random()}`,
          timestamp: new Date()
        };

        // Add message to room
        const roomMessages = messages[roomId] || [];
        const updatedMessages = {
          ...messages,
          [roomId]: [...roomMessages, newMessage]
        };

        // Update room's last message and unread count
        const updatedRooms = rooms.map(room => {
          if (room.id === roomId) {
            return {
              ...room,
              lastMessage: newMessage,
              unreadCount: messageData.senderId === get().currentUser?.id ? room.unreadCount : room.unreadCount + 1
            }
          }
          return room
        });

        set({ messages: updatedMessages, rooms: updatedRooms });
      },

      sendMessage: (roomId: string, content: string) => {
        chatAPI.sendMessage(roomId, content);
      },

      sendImage: async (roomId: string, file: File) => {
        try {
          await chatAPI.sendImage(roomId, file);
        } catch (error: any) {
          set({ error: error.message || 'Failed to send image' });
        }
      },

      sendFile: async (roomId: string, file: File) => {
        try {
          await chatAPI.sendFile(roomId, file);
        } catch (error: any) {
          set({ error: error.message || 'Failed to send file' });
        }
      },

      shareFitnessData: (roomId: string, fitnessData: FitnessData) => {
        chatAPI.shareFitnessData(roomId, fitnessData);
      },

      markAsRead: (roomId: string, messageId: string) => {
        const { messages } = get();
        const roomMessages = messages[roomId] || [];
        const updatedMessages = {
          ...messages,
          [roomId]: roomMessages.map(msg => 
            msg.id === messageId ? { ...msg, isRead: true } : msg
          )
        };
        set({ messages: updatedMessages });
      },

      createRoom: async (roomData: Omit<ChatRoom, 'id' | 'unreadCount'>) => {
        try {
          const newRoom = await chatAPI.createRoom({
            name: roomData.name,
            type: roomData.type,
            participants: roomData.participants
          });
          
          const chatRoom: ChatRoom = {
            id: newRoom.id,
            name: newRoom.name,
            avatar: roomData.avatar,
            type: newRoom.type as any,
            participants: newRoom.participants,
            unreadCount: 0,
            isOnline: false
          };
          
          const { rooms } = get();
          set({ rooms: [...rooms, chatRoom] });
        } catch (error: any) {
          set({ error: error.message || 'Failed to create room' });
        }
      },

      updateRoom: (roomId: string, updates: Partial<ChatRoom>) => {
        const { rooms } = get();
        const updatedRooms = rooms.map(room => 
          room.id === roomId ? { ...room, ...updates } : room
        );
        set({ rooms: updatedRooms });
      },

      deleteRoom: (roomId: string) => {
        const { rooms, messages } = get();
        const updatedRooms = rooms.filter(room => room.id !== roomId);
        const updatedMessages = { ...messages };
        delete updatedMessages[roomId];
        set({ rooms: updatedRooms, messages: updatedMessages });
      },

      searchUsers: async (query: string) => {
        try {
          const users = await chatAPI.searchUsers(query);
          return users;
        } catch (error: any) {
          set({ error: error.message || 'Failed to search users' });
          return [];
        }
      },

      getUsers: async () => {
        try {
          set({ isLoadingUsers: true });
          const users = await chatAPI.getUsers();
          set({ users, isLoadingUsers: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch users',
            isLoadingUsers: false 
          });
        }
      },

      getRooms: async () => {
        try {
          const rooms = await chatAPI.getRooms();
          const chatRooms: ChatRoom[] = rooms.map(room => ({
            id: room.id,
            name: room.name,
            avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
            type: room.type as any,
            participants: room.participants,
            unreadCount: 0,
            isOnline: false,
            lastMessage: room.last_message ? {
              id: room.last_message.id,
              roomId: room.last_message.room_id,
              senderId: room.last_message.sender_id,
              senderName: room.last_message.sender_name,
              senderAvatar: room.last_message.sender_avatar || '',
              content: room.last_message.content,
              timestamp: new Date(room.last_message.timestamp),
              type: room.last_message.message_type as any,
              isRead: room.last_message.is_read
            } : undefined
          }));
          set({ rooms: chatRooms });
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch rooms' });
        }
      },

      getRoomMessages: async (roomId: string) => {
        try {
          set({ isLoadingMessages: true });
          const messages = await chatAPI.getRoomMessages(roomId);
          const chatMessages: Message[] = messages.map(msg => ({
            id: msg.id,
            roomId: msg.room_id,
            senderId: msg.sender_id,
            senderName: msg.sender_name,
            senderAvatar: msg.sender_avatar || '',
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            type: msg.message_type as any,
            fileUrl: msg.file_url,
            fileName: msg.file_name,
            fileSize: msg.file_size,
            fileType: msg.file_type,
            fitnessData: msg.fitness_data,
            isRead: msg.is_read
          }));
          
          const { messages: existingMessages } = get();
          set({ 
            messages: { ...existingMessages, [roomId]: chatMessages },
            isLoadingMessages: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch messages',
            isLoadingMessages: false 
          });
        }
      },

      setTypingIndicator: (roomId: string, userId: string, isTyping: boolean) => {
        const { typingUsers } = get();
        const roomTypingUsers = typingUsers[roomId] || new Set();
        
        if (isTyping) {
          roomTypingUsers.add(userId);
        } else {
          roomTypingUsers.delete(userId);
        }
        
        set({ 
          typingUsers: { 
            ...typingUsers, 
            [roomId]: roomTypingUsers 
          } 
        });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        rooms: state.rooms,
        messages: state.messages,
        users: state.users
      })
    }
  )
)
