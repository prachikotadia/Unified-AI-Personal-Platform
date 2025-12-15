import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { 
  Plus, 
  Search, 
  Sparkles,
  Wifi,
  WifiOff,
  Users,
  Filter,
  Settings,
  Brain,
  Archive,
  Trash2,
  Bell,
  BellOff,
  Pin,
  MoreVertical,
  MessageSquare
} from 'lucide-react'
import { useChatStore } from '../../store/chat'
import { useAuthStore } from '../../store/auth'
import { formatDateTime } from '../../lib/utils'
import { useToastHelpers } from '../../components/ui/Toast'
import NewChatModal from '../../components/chat/NewChatModal'
import NewGroupModal from '../../components/chat/NewGroupModal'
import ChatSettingsModal from '../../components/chat/ChatSettingsModal'
import AIChatAssistant from '../../components/chat/AIChatAssistant'
import AIInsights from '../../components/ai/AIInsights'
import AIAssistant from '../../components/ai/AIAssistant'

const ChatPage = () => {
  const { user } = useAuthStore()
  const { success, error: showError, info } = useToastHelpers()
  const { 
    rooms, 
    setCurrentRoom, 
    connect, 
    disconnect, 
    isConnected, 
    isLoading, 
    error,
    getRooms,
    getUsers,
    createRoom
  } = useChatStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [showNewGroupModal, setShowNewGroupModal] = useState(false)
  const [showChatSettings, setShowChatSettings] = useState(false)
  const [showAIChatAssistant, setShowAIChatAssistant] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'group'>('all')
  const [pinnedRooms, setPinnedRooms] = useState<Set<string>>(new Set())
  const [mutedRooms, setMutedRooms] = useState<Set<string>>(new Set())
  const [archivedRooms, setArchivedRooms] = useState<Set<string>>(new Set())
  const hasShownOfflineNotification = useRef(false)

  // Show info toast when connection fails (only once)
  useEffect(() => {
    if (error && !isConnected && !hasShownOfflineNotification.current) {
      info('Chat Offline', 'Chat server is unavailable. You can still send messages, which will be saved locally.');
      hasShownOfflineNotification.current = true
    } else if (isConnected && hasShownOfflineNotification.current) {
      // Reset when connection is restored
      hasShownOfflineNotification.current = false
    }
  }, [error, isConnected]);

  // Initialize chat on component mount
  
  useEffect(() => {
    // Initialize current user if not set
    const { currentUser } = useChatStore.getState();
    if (!currentUser && user?.id) {
      const chatUser = {
        id: user.id,
        username: user.username || user.displayName || 'User',
        display_name: user.displayName || user.username || 'User',
        avatar: user.avatar || '',
        is_online: true
      };
      useChatStore.setState({ currentUser: chatUser });
    }
    
    // Try to connect (optional - works offline too)
    if (user?.id && !isConnected) {
      connect(user.id).catch(() => {
        // Silently fail - chat works offline
      });
    }
    
    // Initialize demo rooms if none exist
    if (rooms.length === 0) {
      // Create a demo direct chat
      createRoom({
        name: 'Demo Contact',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        type: 'direct',
        participants: [user?.id || 'demo_user', 'demo_contact'],
        isOnline: true
      });
      // Create a demo group chat
      createRoom({
        name: 'Demo Group',
        avatar: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=150&h=150&fit=crop',
        type: 'group',
        participants: [user?.id || 'demo_user', 'demo_member1', 'demo_member2', 'demo_member3'],
        isOnline: false
      });
    }
    
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [user?.id, isConnected, connect, disconnect, rooms.length, createRoom]);

  // Filter and sort rooms based on search and filter type
  const filteredRooms = rooms
    .filter(room => {
      const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterType === 'all' || room.type === filterType
      const notArchived = !archivedRooms.has(room.id)
      return matchesSearch && matchesFilter && notArchived
    })
    .sort((a, b) => {
      // Sort by last message timestamp (most recent first)
      const aTime = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0
      const bTime = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0
      return bTime - aTime
    })

  const handleArchiveRoom = (roomId: string) => {
    setArchivedRooms(prev => {
      const newSet = new Set(prev)
      newSet.add(roomId)
      return newSet
    })
  }

  const handleDeleteRoom = (roomId: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      // Remove room from local state
      // Note: This would typically call a deleteRoom function from the store
      // For now, we'll just filter it out from the display
      setArchivedRooms(prev => {
        const newSet = new Set(prev)
        newSet.add(roomId)
        return newSet
      })
    }
  }

  const handleMuteRoom = (roomId: string) => {
    setMutedRooms(prev => {
      const newSet = new Set(prev)
      if (newSet.has(roomId)) {
        newSet.delete(roomId)
      } else {
        newSet.add(roomId)
      }
      return newSet
    })
  }

  const handlePinRoom = (roomId: string) => {
    setPinnedRooms(prev => {
      const newSet = new Set(prev)
      if (newSet.has(roomId)) {
        newSet.delete(roomId)
      } else {
        newSet.add(roomId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">Chat Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg">
              Connect with friends and collaborate
            </p>
            <div className="flex items-center space-x-3 mt-3">
              {isConnected ? (
                <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800">
                  <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">Disconnected</span>
                </div>
              )}
              {isLoading && (
                <div className="flex items-center space-x-2 bg-sky-50 dark:bg-sky-900/20 px-3 py-1.5 rounded-lg border border-sky-200 dark:border-sky-800">
                  <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium text-sky-700 dark:text-sky-400">Connecting...</span>
                </div>
              )}
              {error && (
                <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800">
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <button 
            onClick={() => setShowNewChatModal(true)}
            className="flex flex-col items-center justify-center space-y-1 sm:space-y-2 p-4 sm:p-5 bg-gradient-to-br from-sky-500 to-cyan-600 text-white rounded-xl hover:from-sky-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-h-[80px] sm:min-h-[100px]"
            disabled={!isConnected}
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm font-medium">New Chat</span>
          </button>
          <button 
            onClick={() => setShowNewGroupModal(true)}
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={!isConnected}
          >
            <Users className="w-6 h-6" />
            <span className="text-sm font-medium">New Group</span>
          </button>
          <button 
            onClick={() => setShowChatSettings(true)}
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Settings className="w-6 h-6" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button 
            onClick={() => setShowAIChatAssistant(true)}
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl hover:from-indigo-600 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Brain className="w-6 h-6" />
            <span className="text-sm font-medium">AI Assistant</span>
          </button>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div className="flex gap-2">
              {(['all', 'direct', 'group'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filterType === type
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat Rooms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Conversations</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredRooms.length} {filteredRooms.length === 1 ? 'conversation' : 'conversations'}
          </span>
        </div>
        
        <div className="space-y-3">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-sky-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No conversations found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Start a new chat to get started!</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-lg hover:from-sky-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                disabled={!isConnected}
              >
                Start New Chat
              </button>
            </div>
          ) : (
            filteredRooms.map((room, index) => (
              <div
                key={room.id}
                className="group relative"
              >
                <Link
                  to={`/chat/${room.id}`}
                  onClick={() => setCurrentRoom(room.id)}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={`flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600 ${
                      pinnedRooms.has(room.id) ? 'bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 border-l-4 border-sky-500' : 'bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={room.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name)}&background=random`}
                        alt={room.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name)}&background=random`
                        }}
                      />
                      {room.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800" />
                      )}
                      {pinnedRooms.has(room.id) && (
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                          <Pin className="w-3 h-3 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate">{room.name}</h3>
                          {mutedRooms.has(room.id) && (
                            <BellOff className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                          {room.lastMessage ? formatDateTime(room.lastMessage.timestamp) : ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
                          {room.lastMessage?.content || 'No messages yet'}
                        </p>
                        {room.unreadCount > 0 && (
                          <span className="bg-gradient-to-r from-sky-500 to-cyan-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 min-w-[24px] text-center">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
                
                {/* Room Actions */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handlePinRoom(room.id)
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title={pinnedRooms.has(room.id) ? "Unpin" : "Pin"}
                    >
                      <Pin className={`w-4 h-4 ${pinnedRooms.has(room.id) ? 'text-sky-600 fill-sky-600' : 'text-gray-400'}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleMuteRoom(room.id)
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title={mutedRooms.has(room.id) ? "Unmute" : "Mute"}
                    >
                      {mutedRooms.has(room.id) ? (
                        <BellOff className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Bell className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleArchiveRoom(room.id)
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteRoom(room.id)
                      }}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <NewChatModal 
        isOpen={showNewChatModal} 
        onClose={() => setShowNewChatModal(false)} 
      />

      <NewGroupModal
        isOpen={showNewGroupModal}
        onClose={() => setShowNewGroupModal(false)}
      />

      <ChatSettingsModal
        isOpen={showChatSettings}
        onClose={() => setShowChatSettings(false)}
        onSaveSettings={(settings) => {
          console.log('Chat settings saved:', settings)
        }}
      />

      <AIChatAssistant
        isOpen={showAIChatAssistant}
        onClose={() => setShowAIChatAssistant(false)}
        conversationContext={rooms.flatMap(room => 
          room.lastMessage ? [room.lastMessage.content] : []
        )}
      />

      {/* AI Chat Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">AI Chat Insights</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Smart conversation and communication recommendations
            </p>
          </div>
        </div>
        
        <AIInsights type="chat" limit={3} />
      </motion.div>

      {/* AI Assistant */}
      <AIAssistant module="chat" />
    </div>
  )
}

export default ChatPage
