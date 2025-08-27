import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useChatStore } from '../../store/chat'
import { useAuthStore } from '../../store/auth'
import { formatDateTime } from '../../lib/utils'
import NewChatModal from '../../components/chat/NewChatModal'
import AIInsights from '../../components/ai/AIInsights'
import AIAssistant from '../../components/ai/AIAssistant'
import ChatTest from '../../components/chat/ChatTest'

const ChatPage = () => {
  const { user } = useAuthStore()
  const { 
    rooms, 
    setCurrentRoom, 
    connect, 
    disconnect, 
    isConnected, 
    isLoading, 
    error,
    getRooms,
    getUsers
  } = useChatStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewChatModal, setShowNewChatModal] = useState(false)

  // Connect to chat server on component mount
  useEffect(() => {
    if (user?.id && !isConnected) {
      connect(user.id);
    }
    
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [user?.id, isConnected, connect, disconnect]);

  // Filter rooms based on search
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Chat</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with friends and collaborate
            </p>
            <div className="flex items-center space-x-2 mt-2">
              {isConnected ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm">Disconnected</span>
                </div>
              )}
              {isLoading && (
                <div className="text-blue-600 text-sm">Connecting...</div>
              )}
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
            </div>
          </div>
          <button 
            onClick={() => setShowNewChatModal(true)}
            className="btn-primary flex items-center space-x-2"
            disabled={!isConnected}
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-black/50 rounded-lg border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-gradient-from"
          />
        </div>
      </motion.div>

      {/* Chat Rooms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-6">Recent Conversations</h2>
        
        <div className="space-y-4">
          {filteredRooms.map((room, index) => (
            <Link
              key={room.id}
              to={`/chat/${room.id}`}
              onClick={() => setCurrentRoom(room.id)}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center space-x-4 p-4 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
              <div className="relative">
                <img
                  src={room.avatar}
                  alt={room.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {room.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{room.name}</h3>
                  <span className="text-xs text-gray-500">
                    {room.lastMessage ? formatDateTime(room.lastMessage.timestamp) : ''}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {room.lastMessage?.content || 'No messages yet'}
                  </p>
                  {room.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      <NewChatModal 
        isOpen={showNewChatModal} 
        onClose={() => setShowNewChatModal(false)} 
      />

      {/* AI Chat Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Sparkles className="w-8 h-8 text-teal-500" />
          <div>
            <h2 className="text-2xl font-bold mb-1">AI Chat Insights</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Smart conversation and communication recommendations
            </p>
          </div>
        </div>
        
        <AIInsights type="chat" limit={3} />
      </motion.div>

      {/* AI Assistant */}
      <AIAssistant module="chat" />

      {/* Chat Test Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <ChatTest />
      </motion.div>
    </div>
  )
}

export default ChatPage
