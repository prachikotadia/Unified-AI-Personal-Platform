import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { X, Search, UserPlus, Users } from 'lucide-react'
import { useChatStore } from '../../store/chat'
import { useAuthStore } from '../../store/auth'
import { useNotifications } from '../../contexts/NotificationContext'

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
}

const NewChatModal = ({ isOpen, onClose }: NewChatModalProps) => {
  const { createRoom, currentUser } = useChatStore()
  const { user } = useAuthStore()
  const { addNotification } = useNotifications()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'direct' | 'group'>('direct')
  
  // Get current user ID
  const currentUserId = currentUser?.id || user?.id || `guest_${Date.now()}`

  // Mock users for demo
  const availableUsers = [
    { id: 'user2', name: 'Sarah M.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
    { id: 'user3', name: 'Mike R.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
    { id: 'user4', name: 'Emma L.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
    { id: 'user5', name: 'John D.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
  ]

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateChat = (selectedUser?: typeof availableUsers[0]) => {
    if (selectedType === 'direct' && selectedUser) {
      createRoom({
        name: selectedUser.name,
        avatar: selectedUser.avatar,
        type: 'direct',
        participants: [currentUserId, selectedUser.id],
        isOnline: false
      })
      addNotification({
        type: 'success',
        title: 'Chat Created',
        message: `Started a conversation with ${selectedUser.name}`
      })
    } else if (selectedType === 'group') {
      createRoom({
        name: 'New Group',
        avatar: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=150&h=150&fit=crop',
        type: 'group',
        participants: [currentUserId],
        isOnline: false
      })
      addNotification({
        type: 'success',
        title: 'Group Created',
        message: 'New group chat created successfully'
      })
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Chat</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Type Selection */}
            <div className="flex space-x-3 mb-6">
              <button
                onClick={() => setSelectedType('direct')}
                className={`flex-1 flex flex-col items-center justify-center space-y-2 p-4 rounded-xl transition-all duration-200 ${
                  selectedType === 'direct'
                    ? 'bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                <span className="text-sm font-medium">Direct Message</span>
              </button>
              <button
                onClick={() => setSelectedType('group')}
                className={`flex-1 flex flex-col items-center justify-center space-y-2 p-4 rounded-xl transition-all duration-200 ${
                  selectedType === 'group'
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Group Chat</span>
              </button>
            </div>

            {selectedType === 'direct' ? (
              <>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>

                {/* User List */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleCreateChat(user)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                      <span className="font-semibold text-gray-900 dark:text-white">{user.name}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Create Group Chat</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Start a group conversation with multiple people
                </p>
                <button
                  onClick={() => handleCreateChat()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  Create Group
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NewChatModal
