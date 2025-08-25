import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Share2, 
  Heart, 
  MessageCircle, 
  UserPlus,
  Activity,
  Calendar,
  ArrowRight,
  Eye,
  ThumbsUp,
  Send,
  Sparkles
} from 'lucide-react'
import AIInsights from '../../components/ai/AIInsights'
import AIAssistant from '../../components/ai/AIAssistant'

const SocialPage = () => {
  // Mock social data
  const connections = [
    { id: 1, name: 'Sarah M.', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', status: 'online' },
    { id: 2, name: 'Mike R.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', status: 'offline' },
    { id: 3, name: 'Emma L.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', status: 'online' },
  ]

  const sharedItems = [
    { id: 1, type: 'budget', user: 'Sarah M.', title: 'Monthly Budget', description: 'Shared their monthly budget plan', likes: 5, comments: 2 },
    { id: 2, type: 'trip', user: 'Mike R.', title: 'Tokyo Trip', description: 'Planning a trip to Tokyo next month', likes: 8, comments: 4 },
    { id: 3, type: 'workout', user: 'Emma L.', title: 'Morning Run', description: 'Completed a 5km run this morning', likes: 12, comments: 3 },
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
            <h1 className="text-3xl font-bold mb-2">Social</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with friends and share your lifestyle
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-gray-500">{connections.length} connections</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connections */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold mb-6">Connections</h2>
          
          <div className="space-y-4">
            {connections.map((connection, index) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="relative">
                  <img
                    src={connection.avatar}
                    alt={connection.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    connection.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium">{connection.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{connection.status}</p>
                </div>
                
                <button className="btn-secondary text-sm">
                  Message
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Shared Items Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <h2 className="text-xl font-semibold mb-6">Shared Items</h2>
          
          <div className="space-y-6">
            {sharedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to rounded-lg flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">{item.user}</span>
                      <span className="text-sm text-gray-500">shared a {item.type}</span>
                    </div>
                    
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500">
                        <Heart className="w-4 h-4" />
                        <span>{item.likes}</span>
                      </button>
                      
                      <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500">
                        <MessageCircle className="w-4 h-4" />
                        <span>{item.comments}</span>
                      </button>
                      
                      <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-500">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Social Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Sparkles className="w-8 h-8 text-indigo-500" />
          <div>
            <h2 className="text-2xl font-bold mb-1">AI Social Insights</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Smart social engagement and connection recommendations
            </p>
          </div>
        </div>
        
        <AIInsights type="social" limit={3} />
      </motion.div>

      {/* AI Assistant */}
      <AIAssistant module="social" />
    </div>
  )
}

export default SocialPage
