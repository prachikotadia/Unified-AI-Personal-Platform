import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useChatStore } from '../../store/chat'
import EnhancedChatRoom from '../../components/chat/EnhancedChatRoom'

const ChatRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const { rooms, isConnected } = useChatStore()

  // Get current room data
  const currentRoom = rooms.find(room => room.id === roomId)

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

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Not Connected</h2>
          <p className="text-gray-600 mb-4">Please wait while we connect to the chat server...</p>
          <Link to="/chat" className="btn-primary">
            Back to Chats
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4"
      >
        <Link to="/chat" className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeft className="w-4 h-4" />
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
