import { motion } from 'framer-motion'
import { Edit, Settings, User, Calendar, MapPin } from 'lucide-react'
import { useAuthStore } from '../store/auth'

const ProfilePage = () => {
  const { user } = useAuthStore()

  // Mock profile data
  const profileData = {
    stats: {
      totalWorkouts: 45,
      totalTrips: 8,
      totalBudget: 12500,
      connections: 24
    },
    recentActivity: [
      { type: 'workout', text: 'Completed morning run', time: '2 hours ago' },
      { type: 'budget', text: 'Updated monthly budget', time: '1 day ago' },
      { type: 'trip', text: 'Booked flight to Tokyo', time: '3 days ago' },
    ]
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account and preferences
            </p>
          </div>
          <button className="btn-secondary flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </motion.div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center space-x-6">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
            alt={user?.displayName}
            className="w-24 h-24 rounded-full object-cover"
          />
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{user?.displayName}</h2>
            <p className="text-gray-600 mb-2">@{user?.username}</p>
            <p className="text-gray-500 mb-4">{user?.bio || 'AI-powered lifestyle enthusiast'}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{user?.location || 'San Francisco, CA'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {user?.createdAt && new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 text-center"
        >
          <div className="text-2xl font-bold text-blue-500 mb-2">{profileData.stats.totalWorkouts}</div>
          <div className="text-sm text-gray-500">Workouts</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 text-center"
        >
          <div className="text-2xl font-bold text-green-500 mb-2">{profileData.stats.totalTrips}</div>
          <div className="text-sm text-gray-500">Trips</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 text-center"
        >
          <div className="text-2xl font-bold text-purple-500 mb-2">${profileData.stats.totalBudget.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Budget Saved</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 text-center"
        >
          <div className="text-2xl font-bold text-orange-500 mb-2">{profileData.stats.connections}</div>
          <div className="text-sm text-gray-500">Connections</div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
        
        <div className="space-y-4">
          {profileData.recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              
              <div className="flex-1">
                <p className="font-medium">{activity.text}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default ProfilePage
