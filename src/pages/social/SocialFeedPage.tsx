import { motion } from 'framer-motion'
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'

const SocialFeedPage = () => {
  // Mock feed data
  const feedItems = [
    {
      id: 1,
      user: {
        name: 'Sarah M.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        status: 'online'
      },
      content: 'Just completed my monthly budget review! Feeling great about my spending habits this month.',
      type: 'budget',
      likes: 15,
      comments: 8,
      shares: 3,
      timestamp: '2 hours ago',
      liked: false
    },
    {
      id: 2,
      user: {
        name: 'Mike R.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        status: 'offline'
      },
      content: 'Planning my next adventure! 🗺️ Tokyo here I come! Anyone have recommendations for must-visit places?',
      type: 'trip',
      likes: 23,
      comments: 12,
      shares: 5,
      timestamp: '4 hours ago',
      liked: true
    },
    {
      id: 3,
      user: {
        name: 'Emma L.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        status: 'online'
      },
              content: 'Morning run completed! 5km in 25 minutes. Feeling energized for the day ahead!',
      type: 'workout',
      likes: 31,
      comments: 6,
      shares: 2,
      timestamp: '6 hours ago',
      liked: false
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Social Feed</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Stay updated with your connections' activities
            </p>
          </div>
        </div>
      </motion.div>

      {/* Feed Items */}
      <div className="space-y-6">
        {feedItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6"
          >
            {/* User Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={item.user.avatar}
                    alt={item.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    item.user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                
                <div>
                  <h3 className="font-semibold">{item.user.name}</h3>
                  <p className="text-sm text-gray-500">{item.timestamp}</p>
                </div>
              </div>
              
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-4">
              <p className="text-gray-800 dark:text-gray-200">{item.content}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-6">
                <button className={`flex items-center space-x-2 text-sm transition-colors ${
                  item.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}>
                  <Heart className={`w-4 h-4 ${item.liked ? 'fill-current' : ''}`} />
                  <span>{item.likes}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{item.comments}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-green-500 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>{item.shares}</span>
                </button>
              </div>
              
              <div className="text-xs text-gray-400">
                {item.type} • {item.timestamp}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default SocialFeedPage
