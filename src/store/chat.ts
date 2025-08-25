import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file'
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
  rooms: ChatRoom[]
  currentRoomId: string | null
  messages: Record<string, Message[]>
  isLoading: boolean
  error: string | null
  
  // Actions
  setCurrentRoom: (roomId: string) => void
  addMessage: (roomId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  markAsRead: (roomId: string, messageId: string) => void
  createRoom: (room: Omit<ChatRoom, 'id' | 'unreadCount'>) => void
  updateRoom: (roomId: string, updates: Partial<ChatRoom>) => void
  deleteRoom: (roomId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      rooms: [
        {
          id: '1',
          name: 'Sarah M.',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          type: 'direct',
          participants: ['user1', 'user2'],
          unreadCount: 2,
          isOnline: true,
          lastMessage: {
            id: 'msg1',
            roomId: '1',
            senderId: 'user2',
            senderName: 'Sarah M.',
            senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            content: 'Thanks for sharing the budget!',
            timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
            type: 'text',
            isRead: false
          }
        },
        {
          id: '2',
          name: 'Mike R.',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          type: 'direct',
          participants: ['user1', 'user3'],
          unreadCount: 0,
          isOnline: false,
          lastMessage: {
            id: 'msg2',
            roomId: '2',
            senderId: 'user3',
            senderName: 'Mike R.',
            senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            content: 'Great workout today!',
            timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            type: 'text',
            isRead: true
          }
        },
        {
          id: '3',
          name: 'Travel Planning',
          avatar: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=150&h=150&fit=crop',
          type: 'group',
          participants: ['user1', 'user2', 'user3', 'user4'],
          unreadCount: 1,
          isOnline: false,
          lastMessage: {
            id: 'msg3',
            roomId: '3',
            senderId: 'user4',
            senderName: 'Emma',
            senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            content: 'When are we meeting?',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            type: 'text',
            isRead: false
          }
        }
      ],
      currentRoomId: null,
      messages: {
        '1': [
          {
            id: 'msg1',
            roomId: '1',
            senderId: 'user2',
            senderName: 'Sarah M.',
            senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            content: 'Thanks for sharing the budget!',
            timestamp: new Date(Date.now() - 2 * 60 * 1000),
            type: 'text',
            isRead: false
          },
          {
            id: 'msg2',
            roomId: '1',
            senderId: 'user1',
            senderName: 'You',
            senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            content: 'No problem! Let me know if you need any help with it.',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            type: 'text',
            isRead: true
          }
        ],
        '2': [
          {
            id: 'msg3',
            roomId: '2',
            senderId: 'user3',
            senderName: 'Mike R.',
            senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            content: 'Great workout today!',
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            type: 'text',
            isRead: true
          },
          {
            id: 'msg4',
            roomId: '2',
            senderId: 'user1',
            senderName: 'You',
            senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            content: 'Thanks! How was your run?',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            type: 'text',
            isRead: true
          }
        ],
        '3': [
          {
            id: 'msg5',
            roomId: '3',
            senderId: 'user4',
            senderName: 'Emma',
            senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            content: 'When are we meeting?',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            type: 'text',
            isRead: false
          },
          {
            id: 'msg6',
            roomId: '3',
            senderId: 'user2',
            senderName: 'Sarah',
            senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            content: 'I think tomorrow at 3 PM works for everyone',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            type: 'text',
            isRead: true
          }
        ]
      },
      isLoading: false,
      error: null,

      setCurrentRoom: (roomId: string) => {
        set({ currentRoomId: roomId })
        // Mark messages as read when entering room
        const { messages } = get()
        const roomMessages = messages[roomId] || []
        const updatedMessages = {
          ...messages,
          [roomId]: roomMessages.map(msg => ({ ...msg, isRead: true }))
        }
        set({ messages: updatedMessages })
        
        // Update unread count
        const { rooms } = get()
        const updatedRooms = rooms.map(room => 
          room.id === roomId ? { ...room, unreadCount: 0 } : room
        )
        set({ rooms: updatedRooms })
      },

      addMessage: (roomId: string, messageData: Omit<Message, 'id' | 'timestamp'>) => {
        const { messages, rooms } = get()
        const newMessage: Message = {
          ...messageData,
          id: `msg_${Date.now()}_${Math.random()}`,
          timestamp: new Date()
        }

        // Add message to room
        const roomMessages = messages[roomId] || []
        const updatedMessages = {
          ...messages,
          [roomId]: [...roomMessages, newMessage]
        }

        // Update room's last message and unread count
        const updatedRooms = rooms.map(room => {
          if (room.id === roomId) {
            return {
              ...room,
              lastMessage: newMessage,
              unreadCount: messageData.senderId === 'user1' ? room.unreadCount : room.unreadCount + 1
            }
          }
          return room
        })

        set({ messages: updatedMessages, rooms: updatedRooms })
      },

      markAsRead: (roomId: string, messageId: string) => {
        const { messages } = get()
        const roomMessages = messages[roomId] || []
        const updatedMessages = {
          ...messages,
          [roomId]: roomMessages.map(msg => 
            msg.id === messageId ? { ...msg, isRead: true } : msg
          )
        }
        set({ messages: updatedMessages })
      },

      createRoom: (roomData: Omit<ChatRoom, 'id' | 'unreadCount'>) => {
        const { rooms } = get()
        const newRoom: ChatRoom = {
          ...roomData,
          id: `room_${Date.now()}_${Math.random()}`,
          unreadCount: 0
        }
        set({ rooms: [...rooms, newRoom] })
      },

      updateRoom: (roomId: string, updates: Partial<ChatRoom>) => {
        const { rooms } = get()
        const updatedRooms = rooms.map(room => 
          room.id === roomId ? { ...room, ...updates } : room
        )
        set({ rooms: updatedRooms })
      },

      deleteRoom: (roomId: string) => {
        const { rooms, messages } = get()
        const updatedRooms = rooms.filter(room => room.id !== roomId)
        const updatedMessages = { ...messages }
        delete updatedMessages[roomId]
        set({ rooms: updatedRooms, messages: updatedMessages })
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        rooms: state.rooms,
        messages: state.messages
      })
    }
  )
)
