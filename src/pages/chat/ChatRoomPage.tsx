import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Send, 
  MoreHorizontal, 
  Phone, 
  Video, 
  ArrowLeft,
  Search,
  Paperclip,
  Smile,
  Mic
} from 'lucide-react'
import { useChatStore } from '../../store/chat'
import { useAuthStore } from '../../store/auth'
import { formatDateTime } from '../../lib/utils'

const ChatRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const { user } = useAuthStore()
  const { rooms, messages, currentRoomId, addMessage, setCurrentRoom } = useChatStore()
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Set current room when component mounts
  useEffect(() => {
    if (roomId) {
      setCurrentRoom(roomId)
    }
  }, [roomId, setCurrentRoom])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Get current room data
  const currentRoom = rooms.find(room => room.id === roomId)
  const roomMessages = messages[roomId || ''] || []

  const handleSendMessage = () => {
    if (message.trim() && roomId && user) {
      addMessage(roomId, {
        roomId,
        senderId: 'user1', // Current user ID
        senderName: user.displayName || 'You',
        senderAvatar: user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        content: message.trim(),
        type: 'text',
        isRead: false
      })
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chat room not found</h2>
          <Link to="/chat" className="btn-primary">
            Back to Chats
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 border-b border-white/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/chat" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="relative">
              <img
                src={currentRoom.avatar}
                alt={currentRoom.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {currentRoom.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            
            <div>
              <h2 className="font-semibold">{currentRoom.name}</h2>
              <p className="text-sm text-gray-500">
                {currentRoom.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {roomMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          roomMessages.map((msg, index) => {
            const isOwn = msg.senderId === 'user1'
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                  isOwn 
                    ? 'bg-blue-gradient-from text-white' 
                    : 'glass-card'
                }`}>
                  {!isOwn && (
                    <div className="flex items-center space-x-2 mb-1">
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-4 h-4 rounded-full"
                      />
                      <p className="text-xs text-gray-500">{msg.senderName}</p>
                    </div>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    isOwn ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatDateTime(msg.timestamp)}
                  </p>
                </div>
              </motion.div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </motion.div>

      {/* Message Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4 border-t border-white/10"
      >
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <Paperclip className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <Smile className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-white/50 dark:bg-black/50 rounded-lg border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-gradient-from"
          />
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-2 bg-blue-gradient-from text-white rounded-lg hover:bg-blue-gradient-to transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ChatRoomPage
