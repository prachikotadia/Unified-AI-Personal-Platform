import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
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
  Sparkles,
  Plus,
  Search,
  User,
  X,
  Shield,
  Brain,
  Bookmark,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react'
import AIInsights from '../../components/ai/AIInsights'
import AIAssistant from '../../components/ai/AIAssistant'
import FindFriendsModal from '../../components/social/FindFriendsModal'
import CreatePostModal from '../../components/social/CreatePostModal'
import AIFriendSuggestions from '../../components/social/AIFriendSuggestions'
import AISocialAssistant from '../../components/social/AISocialAssistant'
import AISocialInsightsModal from '../../components/social/AISocialInsightsModal'
import BlockUserModal from '../../components/social/BlockUserModal'
import { useToastHelpers } from '../../components/ui/Toast'
import { useAuthStore } from '../../store/auth'
import { useSocialStore } from '../../store/social'

const SocialPage = () => {
  const navigate = useNavigate()
  const { success, info } = useToastHelpers()
  const { user } = useAuthStore()
  const { 
    connections: connectionIds, 
    addConnection, 
    removeConnection, 
    toggleBlock,
    isBlocked,
    posts,
    createPost,
    toggleLike,
    toggleSave,
    isLiked,
    isSaved,
    toggleFollow,
    isFollowing,
    isConnected,
    isLoading,
    error,
    checkConnection,
    syncWithBackend
  } = useSocialStore()
  
  const [showFindFriendsModal, setShowFindFriendsModal] = useState(false)
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)
  const [showAISocialAssistant, setShowAISocialAssistant] = useState(false)
  const [showAISocialInsightsModal, setShowAISocialInsightsModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [userToBlock, setUserToBlock] = useState<{ id: string; name: string } | null>(null)
  const hasShownOfflineNotification = useRef(false)

  // Check connection status on mount
  useEffect(() => {
    checkConnection()
    // Sync with backend if connected
    if (user?.id && isConnected) {
      syncWithBackend(user.id).catch(() => {
        // Silently fail - works offline
      })
    }
  }, [user?.id, checkConnection, syncWithBackend])
  
  // Show info toast when connection status changes (only once)
  useEffect(() => {
    if (error && !isConnected && !hasShownOfflineNotification.current) {
      info('Social Offline', 'Social features are working offline. Changes will sync when connection is restored.')
      hasShownOfflineNotification.current = true
    } else if (isConnected && hasShownOfflineNotification.current) {
      // Reset when connection is restored
      hasShownOfflineNotification.current = false
    }
  }, [error, isConnected])

  // Mock social data
  const connections = [
    { id: '1', name: 'Sarah M.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', status: 'online' },
    { id: '2', name: 'Mike R.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', status: 'offline' },
    { id: '3', name: 'Emma L.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', status: 'online' },
  ].filter(conn => !isBlocked(conn.id))

  // Combine user posts with mock shared items
  const allPosts = [
    ...posts.map(post => ({
      id: post.id,
      type: 'post',
      user: post.userName,
      title: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
      description: post.content,
      likes: post.likes + (isLiked(post.id) ? 1 : 0),
      comments: post.comments,
      images: post.images,
      createdAt: post.createdAt
    })),
    { id: '1', type: 'budget', user: 'Sarah M.', title: 'Monthly Budget', description: 'Shared their monthly budget plan', likes: 5, comments: 2 },
    { id: '2', type: 'trip', user: 'Mike R.', title: 'Tokyo Trip', description: 'Planning a trip to Tokyo next month', likes: 8, comments: 4 },
    { id: '3', type: 'workout', user: 'Emma L.', title: 'Morning Run', description: 'Completed a 5km run this morning', likes: 12, comments: 3 },
  ]
  
  const sharedItems = allPosts

  const handleRemoveConnection = (userId: string, userName: string) => {
    if (window.confirm(`Remove ${userName} from your connections?`)) {
      removeConnection(userId)
      success('Connection Removed', `${userName} has been removed from your connections.`)
    }
  }

  const handleBlockUser = (userId: string, userName: string) => {
    setUserToBlock({ id: userId, name: userName })
    setShowBlockModal(true)
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
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">Social Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg">
                  Connect with friends and share your lifestyle
                </p>
            <div className="flex items-center space-x-3 mt-3">
              {isConnected ? (
                <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Online</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800" title="Backend unavailable - using local data">
                  <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Offline</span>
                </div>
              )}
              {isLoading && (
                <div className="flex items-center space-x-2 bg-sky-50 dark:bg-sky-900/20 px-3 py-1.5 rounded-lg border border-sky-200 dark:border-sky-800">
                  <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium text-sky-700 dark:text-sky-400">Syncing...</span>
                </div>
              )}
              {error && (
                <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setShowFindFriendsModal(true)}
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-6 h-6" />
            <span className="text-sm font-medium">Find Friends</span>
          </button>
          <button
            onClick={() => setShowCreatePostModal(true)}
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-gradient-to-br from-sky-500 to-cyan-600 text-white rounded-xl hover:from-sky-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium">Create Post</span>
          </button>
          <button
            onClick={() => navigate('/social/feed')}
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Eye className="w-6 h-6" />
            <span className="text-sm font-medium">View Feed</span>
          </button>
          <button
            onClick={() => navigate('/social/shared')}
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Share2 className="w-6 h-6" />
            <span className="text-sm font-medium">Shared Items</span>
          </button>
          <button
            onClick={() => setShowAISocialInsightsModal(true)}
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Brain className="w-6 h-6" />
            <span className="text-sm font-medium">AI Insights</span>
          </button>
          <button
            onClick={() => setShowAISocialAssistant(true)}
            className="flex flex-col items-center justify-center space-y-2 p-5 bg-gradient-to-r from-sky-500 to-violet-600 text-white rounded-xl hover:from-sky-600 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Brain className="w-6 h-6" />
            <span className="text-sm font-medium">AI Assistant</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connections */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connections</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {connections.length} {connections.length === 1 ? 'connection' : 'connections'}
            </span>
          </div>
          
          <div className="space-y-3">
            {connections.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No connections yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Find friends to get started!</p>
              </div>
            ) : (
              connections.map((connection, index) => (
                <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={connection.avatar}
                      alt={connection.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                      connection.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{connection.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{connection.status}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => user?.id && toggleFollow(user.id, connection.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isFollowing(connection.id)
                          ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      title={isFollowing(connection.id) ? 'Unfollow' : 'Follow'}
                    >
                      {isFollowing(connection.id) ? 'Following' : 'Follow'}
                    </button>
                    <button
                      onClick={() => navigate(`/chat/${connection.id}`)}
                      className="p-2 bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-lg hover:bg-sky-200 dark:hover:bg-sky-900/30 transition-colors"
                      title="Message"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/social/profile/${connection.id}`)}
                      className="p-2 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/30 transition-colors"
                      title="View Profile"
                    >
                      <User className="w-4 h-4" />
                    </button>
                    <div className="relative group">
                      <button
                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="More options"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 min-w-[180px]">
                          <button
                            onClick={() => handleRemoveConnection(connection.id, connection.name)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                          >
                            Remove Connection
                          </button>
                          <button
                            onClick={() => handleBlockUser(connection.id, connection.name)}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            Block User
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Shared Items Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shared Items</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {sharedItems.length} {sharedItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          
          <div className="space-y-4">
            {sharedItems.length === 0 ? (
              <div className="text-center py-12">
                <Share2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No shared items yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Share your achievements, workouts, trips, or budgets!</p>
              </div>
            ) : (
              sharedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="p-5 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                      <Share2 className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-bold text-gray-900 dark:text-white">{item.user}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">shared a {item.type}</span>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{item.description}</p>
                      
                      <div className="flex items-center space-x-6">
                        <button 
                          onClick={() => {
                            if (item.id && user?.id) {
                              toggleLike(user.id, item.id.toString())
                            }
                          }}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            item.id && isLiked(item.id.toString())
                              ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${item.id && isLiked(item.id.toString()) ? 'fill-current' : ''}`} />
                          <span>{item.likes}</span>
                        </button>
                        
                        <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-500 transition-all duration-200">
                          <MessageCircle className="w-4 h-4" />
                          <span>{item.comments}</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            if (item.id) {
                              user?.id && toggleSave(user.id, item.id.toString())
                            }
                          }}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            item.id && isSaved(item.id.toString())
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500'
                          }`}
                          title={item.id && isSaved(item.id.toString()) ? 'Unsave post' : 'Save post'}
                        >
                          <Bookmark className={`w-4 h-4 ${item.id && isSaved(item.id.toString()) ? 'fill-current' : ''}`} />
                          <span>Save</span>
                        </button>
                        
                        <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500 transition-all duration-200">
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* AI Friend Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">AI Friend Suggestions</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Discover people you might know
              </p>
            </div>
          </div>
        </div>
        
        <AIFriendSuggestions
          currentUserId={user?.id || "user1"}
          onSendRequest={(userId) => {
            addConnection(userId)
            success('Request Sent', 'Friend request has been sent!')
          }}
          onViewProfile={(userId) => {
            navigate(`/social/profile/${userId}`)
          }}
        />
      </motion.div>

      {/* AI Social Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">AI Social Insights</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Smart social engagement and connection recommendations
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAISocialInsightsModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <Eye className="w-4 h-4" />
            View All
          </button>
        </div>
        
        <AIInsights type="social" limit={3} />
      </motion.div>

      {/* AI Assistant */}
      <AIAssistant module="social" />

      {/* Modals */}
      <FindFriendsModal
        isOpen={showFindFriendsModal}
        onClose={() => setShowFindFriendsModal(false)}
        onSendRequest={(userId) => {
          success('Request Sent', 'Friend request has been sent!')
        }}
      />

      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onSubmit={async (postData) => {
          if (user?.id) {
            await createPost(user.id, {
              userId: user.id,
              userName: user.displayName || user.username || 'You',
              userAvatar: user.avatar || '',
              content: postData.content,
              images: postData.images?.map(img => URL.createObjectURL(img)),
              videos: postData.videos?.map(vid => URL.createObjectURL(vid)),
              privacy: postData.privacy,
              hashtags: postData.hashtags,
            })
            success('Post Created', 'Your post has been shared successfully!')
          }
        }}
      />

      <AISocialAssistant
        isOpen={showAISocialAssistant}
        onClose={() => setShowAISocialAssistant(false)}
        socialContext={{
          recentPosts: [],
          connections,
          activity: {}
        }}
      />

      {userToBlock && (
        <BlockUserModal
          isOpen={showBlockModal}
          onClose={() => {
            setShowBlockModal(false)
            setUserToBlock(null)
          }}
          userName={userToBlock.name}
          onConfirm={() => {
            toggleBlock(userToBlock.id)
            removeConnection(userToBlock.id)
            success('User Blocked', `${userToBlock.name} has been blocked`)
            setShowBlockModal(false)
            setUserToBlock(null)
          }}
        />
      )}

      <AISocialInsightsModal
        isOpen={showAISocialInsightsModal}
        onClose={() => setShowAISocialInsightsModal(false)}
        userId={user?.id || 'user1'}
      />
    </div>
  )
}

export default SocialPage
