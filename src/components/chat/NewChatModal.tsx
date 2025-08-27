import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { X, Search, UserPlus, Users } from 'lucide-react'
import { useChatStore } from '../../store/chat'
import { useNotifications } from '../../contexts/NotificationContext'

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
}

const NewChatModal = ({ isOpen, onClose }: NewChatModalProps) => {
  const { createRoom } = useChatStore()
  const { addNotification } = useNotifications()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'direct' | 'group'>('direct')

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

  const handleCreateChat = (user?: typeof availableUsers[0]) => {
    if (selectedType === 'direct' && user) {
      createRoom({
        name: user.name,
        avatar: user.avatar,
        type: 'direct',
        participants: ['user1', user.id],
        isOnline: false
      })
      addNotification({
        type: 'success',
        title: 'Chat Created',
        message: `Started a conversation with ${user.name}`
      })
    } else if (selectedType === 'group') {
      createRoom({
        name: 'New Group',
        avatar: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=150&h=150&fit=crop',
        type: 'group',
        participants: ['user1'],
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
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">New Chat</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Type Selection */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setSelectedType('direct')}
                className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${
                  selectedType === 'direct'
                    ? 'bg-blue-gradient-from text-white'
                    : 'glass-card hover:bg-white/10'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Direct Message</span>
              </button>
              <button
                onClick={() => setSelectedType('group')}
                className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${
                  selectedType === 'group'
                    ? 'bg-blue-gradient-from text-white'
                    : 'glass-card hover:bg-white/10'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Group Chat</span>
              </button>
            </div>

            {selectedType === 'direct' ? (
              <>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-black/50 rounded-lg border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-gradient-from"
                  />
                </div>

                {/* User List */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleCreateChat(user)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-medium">{user.name}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Create Group Chat</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Start a group conversation with multiple people
                </p>
                <button
                  onClick={() => handleCreateChat()}
                  className="btn-primary"
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
