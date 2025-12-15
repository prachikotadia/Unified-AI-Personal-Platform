import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useChatStore } from '../../store/chat'
import EnhancedChatRoom from '../../components/chat/EnhancedChatRoom'

const ChatRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const { rooms } = useChatStore()

  // Get current room data
  const currentRoom = rooms.find(room => room.id === roomId)

  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Chat room not found</h2>
          <Link 
            to="/chat" 
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-lg hover:from-sky-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Chats</span>
          </Link>
        </div>
      </div>
    )
  }

  // Chat works offline - no need to check connection status

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      >
        <Link 
          to="/chat" 
          className="inline-flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Chats</span>
        </Link>
      </motion.div>

      {/* Enhanced Chat Room */}
      <div className="flex-1">
        <EnhancedChatRoom roomId={roomId!} />
      </div>
    </div>
  )
}

export default ChatRoomPage
