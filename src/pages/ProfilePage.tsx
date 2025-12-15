import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  Edit, 
  User, 
  Calendar, 
  MapPin, 
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  Globe,
  Activity,
  Plane,
  DollarSign,
  Users,
  Target,
  TrendingUp,
  Clock
} from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { useToastHelpers } from '../components/ui/Toast'
import EditProfileModal from '../components/social/EditProfileModal'
import { useFitness } from '../hooks/useFitness'
import { useTravel } from '../hooks/useTravel'
import { useFinanceStore } from '../store/finance'
import { useSocialStore } from '../store/social'

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore()
  const { success } = useToastHelpers()
  const [showEditModal, setShowEditModal] = useState(false)
  const { dashboard: fitnessDashboard } = useFitness()
  const { stats: travelStats } = useTravel()
  const { transactions, budgets, financialGoals } = useFinanceStore()
  const { connections } = useSocialStore()

  // Calculate real stats from stores
  const profileData = {
    stats: {
      totalWorkouts: fitnessDashboard?.weekly_stats?.workouts || 0,
      totalTrips: travelStats?.totalTrips || 0,
      totalBudget: budgets.reduce((sum, budget) => sum + ((budget as any).limit || (budget as any).amount || 0), 0),
      connections: connections.size || 0,
      transactions: transactions.length || 0,
      goals: financialGoals.length || 0,
    },
    recentActivity: [
      { type: 'workout', text: 'Completed morning run', time: '2 hours ago', icon: Activity },
      { type: 'budget', text: 'Updated monthly budget', time: '1 day ago', icon: DollarSign },
      { type: 'trip', text: 'Booked flight to Tokyo', time: '3 days ago', icon: Plane },
    ]
  }

  const handleSaveProfile = (updates: any) => {
    // Update user in auth store (which persists to localStorage)
    // Properly merge all fields including preferences
    updateUser({
      displayName: updates.name || user?.displayName,
      bio: updates.bio || user?.bio,
      location: updates.location || user?.location,
      avatar: updates.avatar || user?.avatar,
      email: updates.email || user?.email, // Update email at top level
      preferences: {
        ...user?.preferences, // Preserve all existing preferences
        occupation: updates.occupation,
        education: updates.education,
        phone: updates.phone,
        website: updates.website,
      }
    })
    success('Profile Updated', 'Your profile has been updated successfully!')
  }

  const profileForModal = {
    name: user?.displayName || 'Guest User',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: user?.bio || 'Demo user - explore OmniLife features.',
    location: user?.location || 'Demo Mode',
    occupation: user?.preferences?.occupation || '',
    education: user?.preferences?.education || '',
    email: user?.email || '',
    phone: user?.preferences?.phone || '',
    website: user?.preferences?.website || '',
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage your account and preferences
            </p>
          </div>
          <button 
            onClick={() => setShowEditModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-xl hover:from-sky-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            <Edit className="w-5 h-5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </motion.div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
          <div className="relative flex-shrink-0">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
              alt={user?.displayName}
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{user?.displayName || 'Guest User'}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">@{user?.username || 'guest_user'}</p>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{user?.bio || 'Demo user - explore OmniLife features.'}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-sky-900/30 dark:to-cyan-900/30 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Location</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.location || 'Demo Mode'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Joined</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '12/8/2025'}
                  </p>
                </div>
              </div>

              {user?.preferences?.occupation && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Occupation</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.preferences.occupation}</p>
                  </div>
                </div>
              )}

              {user?.preferences?.education && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Education</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.preferences.education}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            {(user?.email || user?.preferences?.phone || user?.preferences?.website) && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Contact Information</h3>
                <div className="flex flex-wrap gap-3">
                  {user?.email && (
                    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{user.email}</span>
                    </div>
                  )}
                  {user?.preferences?.phone && (
                    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{user.preferences.phone}</span>
                    </div>
                  )}
                  {user?.preferences?.website && (
                    <a 
                      href={user.preferences.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Website</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-sky-200 dark:border-sky-800"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{profileData.stats.totalWorkouts}</div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Workouts</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{profileData.stats.totalTrips}</div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Trips</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-violet-200 dark:border-violet-800"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">${profileData.stats.totalBudget.toLocaleString()}</div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget Saved</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{profileData.stats.connections}</div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Connections</div>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{profileData.stats.transactions}</div>
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Transactions</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-5 border border-rose-200 dark:border-rose-800"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{profileData.stats.goals}</div>
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Financial Goals</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-xl p-5 border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {user?.preferences?.isGuest ? 'Guest' : 'Member'}
          </div>
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Account Type</div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
          <button 
            onClick={() => {
              // Navigate to activity page or show more activities
              success('View All', 'Showing all activities')
            }}
            className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {profileData.recentActivity.map((activity, index) => {
            const Icon = activity.icon || User
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white">{activity.text}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>


      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profileForModal}
        onSave={handleSaveProfile}
      />
    </div>
  )
}

export default ProfilePage
