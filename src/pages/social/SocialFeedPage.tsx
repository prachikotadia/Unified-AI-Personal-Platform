import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Plus,
  Trophy,
  Activity,
  Plane,
  DollarSign,
  Bookmark,
  Flag,
  EyeOff,
  UserPlus,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Reply,
  Trash2,
  Edit
} from 'lucide-react'
import CreatePostModal from '../../components/social/CreatePostModal'
import ShareAchievementModal from '../../components/social/ShareAchievementModal'
import ShareWorkoutModal from '../../components/social/ShareWorkoutModal'
import ShareTripModal from '../../components/social/ShareTripModal'
import ShareBudgetModal from '../../components/social/ShareBudgetModal'
import CommentModal from '../../components/social/CommentModal'
import PostOptionsModal from '../../components/social/PostOptionsModal'
import ReportPostModal from '../../components/social/ReportPostModal'
import { useToastHelpers } from '../../components/ui/Toast'
import { useAuthStore } from '../../store/auth'
import { useSocialStore } from '../../store/social'

const SocialFeedPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { success } = useToastHelpers()
  const {
    toggleLike,
    toggleSave,
    hidePost,
    toggleFollow,
    isLiked,
    isSaved,
    isHidden,
    isFollowing,
  } = useSocialStore()
  
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)
  const [showShareAchievementModal, setShowShareAchievementModal] = useState(false)
  const [showShareWorkoutModal, setShowShareWorkoutModal] = useState(false)
  const [showShareTripModal, setShowShareTripModal] = useState(false)
  const [showShareBudgetModal, setShowShareBudgetModal] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [showPostOptions, setShowPostOptions] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [filterType, setFilterType] = useState<'all' | 'budget' | 'trip' | 'workout' | 'achievement'>('all')
  const [sortOption, setSortOption] = useState<'recent' | 'popular' | 'trending'>('recent')
  const [postOptionsPosition, setPostOptionsPosition] = useState<{ x: number; y: number } | undefined>()

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
      liked: false,
      userId: 'user2',
      userName: 'Sarah M.',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      commentsList: []
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
      liked: true,
      userId: 'user3',
      userName: 'Mike R.',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      commentsList: []
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
      liked: false,
      userId: 'user4',
      userName: 'Emma L.',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      commentsList: []
    },
  ]

  const handleLike = async (postId: number) => {
    if (user?.id) {
      await toggleLike(user.id, postId.toString())
    }
  }

  const handleSave = async (postId: number) => {
    const wasSaved = isSaved(postId.toString())
    if (user?.id) {
      await toggleSave(user.id, postId.toString())
    }
    if (wasSaved) {
      success('Post Unsaved', 'Post has been removed from saved items')
    } else {
      success('Post Saved', 'Post has been saved to your collection')
    }
  }

  const handleShare = (post: any) => {
    console.log('Share post:', post.id)
    success('Post Shared', 'Post has been shared successfully!')
  }

  const handleHide = async (postId: number) => {
    if (user?.id) {
      await hidePost(user.id, postId.toString())
      success('Post Hidden', 'This post will no longer appear in your feed')
    }
  }

  const handleFollow = async (userId: string) => {
    const wasFollowing = isFollowing(userId)
    if (user?.id) {
      await toggleFollow(user.id, userId)
    }
    if (wasFollowing) {
      success('Unfollowed', 'You have unfollowed this user')
    } else {
      success('Following', 'You are now following this user')
    }
  }

  const handlePostOptions = (post: any, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    setPostOptionsPosition({ x: rect.left, y: rect.top + 30 })
    setSelectedPost(post)
    setShowPostOptions(true)
  }

  const filteredAndSortedItems = feedItems
    .filter(item => {
      if (isHidden(item.id)) return false
      if (filterType === 'all') return true
      return item.type === filterType
    })
    .sort((a, b) => {
      if (sortOption === 'popular') {
        return (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)
      } else if (sortOption === 'trending') {
        return b.likes - a.likes
      }
      return 0 // recent (default order)
    })

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Social Feed</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Stay updated with your connections' activities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-xl hover:from-sky-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 text-gray-700 dark:text-gray-300 font-medium"
              title="Refresh Feed"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => setShowShareAchievementModal(true)}
            className="flex flex-col items-center justify-center space-y-2 p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800 hover:bg-gradient-to-br hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 transition-all duration-200"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Achievement</span>
          </button>
          <button
            onClick={() => setShowShareWorkoutModal(true)}
            className="flex flex-col items-center justify-center space-y-2 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-gradient-to-br hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30 transition-all duration-200"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Workout</span>
          </button>
          <button
            onClick={() => setShowShareTripModal(true)}
            className="flex flex-col items-center justify-center space-y-2 p-4 bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 rounded-xl border border-sky-200 dark:border-sky-800 hover:bg-gradient-to-br hover:from-sky-100 hover:to-cyan-100 dark:hover:from-sky-900/30 dark:hover:to-cyan-900/30 transition-all duration-200"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Trip</span>
          </button>
          <button
            onClick={() => setShowShareBudgetModal(true)}
            className="flex flex-col items-center justify-center space-y-2 p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200 dark:border-violet-800 hover:bg-gradient-to-br hover:from-violet-100 hover:to-purple-100 dark:hover:from-violet-900/30 dark:hover:to-purple-900/30 transition-all duration-200"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Budget</span>
          </button>
        </div>

        {/* Filter and Sort */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 dark:text-white font-medium"
            >
              <option value="all">All Posts</option>
              <option value="budget">Budget</option>
              <option value="trip">Trip</option>
              <option value="workout">Workout</option>
              <option value="achievement">Achievement</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <ArrowUpDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 dark:text-white font-medium"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="trending">Trending</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Feed Items */}
      <div className="space-y-6">
        {filteredAndSortedItems.map((item, index) => {
          const postIsLiked = isLiked(item.id)
          const postIsSaved = isSaved(item.id)
          const userIsFollowing = isFollowing(item.userId)
          const isOwnPost = item.userId === user?.id
          
          return (
            <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
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
              
              <div className="flex items-center gap-2">
                {!isOwnPost && (
                  <button
                    onClick={() => handleFollow(item.userId)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      userIsFollowing
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        : 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white hover:from-sky-600 hover:to-cyan-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {userIsFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
                <button
                  onClick={(e) => handlePostOptions(item, e)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="More options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <p className="text-gray-800 dark:text-gray-200">{item.content}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => handleLike(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    postIsLiked 
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${postIsLiked ? 'fill-current' : ''}`} />
                  <span>{item.likes + (postIsLiked && !item.liked ? 1 : 0) - (!postIsLiked && item.liked ? 1 : 0)}</span>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedPost(item)
                    setShowCommentModal(true)
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-sky-500 transition-all duration-200"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{item.comments}</span>
                </button>
                
                <button
                  onClick={() => handleShare(item)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-emerald-500 transition-all duration-200"
                >
                  <Share2 className="w-5 h-5" />
                  <span>{item.shares}</span>
                </button>

                <button
                  onClick={() => handleSave(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    postIsSaved 
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-amber-500'
                  }`}
                  title={postIsSaved ? 'Unsave' : 'Save'}
                >
                  <Bookmark className={`w-5 h-5 ${postIsSaved ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <div className="text-xs text-gray-400">
                {item.type} • {item.timestamp}
              </div>
            </div>
          </motion.div>
          )
        })}
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onSubmit={(postData) => {
          console.log('Post created:', postData)
          success('Post Created', 'Your post has been shared successfully!')
        }}
      />

      <ShareAchievementModal
        isOpen={showShareAchievementModal}
        onClose={() => setShowShareAchievementModal(false)}
        achievement={{
          id: '1',
          title: 'Fitness Goal Achieved',
          description: 'Completed 30-day workout challenge',
          date: new Date()
        }}
        onShare={(postData) => {
          console.log('Share achievement:', postData)
          success('Achievement Shared', 'Your achievement has been shared!')
        }}
      />

      <ShareWorkoutModal
        isOpen={showShareWorkoutModal}
        onClose={() => setShowShareWorkoutModal(false)}
        workout={{
          id: '1',
          name: 'Morning Run',
          type: 'Running',
          duration: 30,
          calories: 300,
          date: new Date()
        }}
        onShare={(postData) => {
          console.log('Share workout:', postData)
          success('Workout Shared', 'Your workout has been shared!')
        }}
      />

      <ShareTripModal
        isOpen={showShareTripModal}
        onClose={() => setShowShareTripModal(false)}
        trip={{
          id: '1',
          name: 'Tokyo Adventure',
          destination: 'Tokyo, Japan',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-15'),
          description: 'Excited to explore Japan!'
        }}
        onShare={(postData) => {
          console.log('Share trip:', postData)
          success('Trip Shared', 'Your trip has been shared!')
        }}
      />

      <ShareBudgetModal
        isOpen={showShareBudgetModal}
        onClose={() => setShowShareBudgetModal(false)}
        budget={{
          id: '1',
          name: 'Monthly Budget',
          category: 'General',
          amount: 5000,
          spent: 3200,
          period: 'monthly'
        }}
        onShare={(postData) => {
          console.log('Share budget:', postData)
          success('Budget Shared', 'Your budget has been shared!')
        }}
      />

      <CommentModal
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false)
          setSelectedPost(null)
        }}
        postId={selectedPost?.id || ''}
        comments={selectedPost?.commentsList || []}
        onAddComment={(content) => {
          console.log('Add comment:', content)
          success('Comment Added', 'Your comment has been posted!')
        }}
        onLikeComment={(commentId) => {
          console.log('Like comment:', commentId)
        }}
        onReplyComment={(commentId, content) => {
          console.log('Reply to comment:', commentId, content)
          success('Reply Posted', 'Your reply has been posted!')
        }}
        onDeleteComment={(commentId) => {
          console.log('Delete comment:', commentId)
          success('Comment Deleted', 'Your comment has been deleted')
        }}
      />

      {selectedPost && (
        <PostOptionsModal
          isOpen={showPostOptions}
          onClose={() => {
            setShowPostOptions(false)
            setSelectedPost(null)
          }}
          isOwnPost={selectedPost?.userId === user?.id}
          onShare={() => {
            handleShare(selectedPost)
            setShowPostOptions(false)
          }}
          onSave={() => {
            handleSave(selectedPost.id)
            setShowPostOptions(false)
          }}
          onReport={() => {
            setShowPostOptions(false)
            setShowReportModal(true)
          }}
          onHide={() => {
            handleHide(selectedPost.id)
            setShowPostOptions(false)
          }}
          onDelete={() => {
            if (window.confirm('Are you sure you want to delete this post?')) {
              console.log('Delete post:', selectedPost.id)
              success('Post Deleted', 'Your post has been deleted')
              setShowPostOptions(false)
              setSelectedPost(null)
            }
          }}
          onEdit={() => {
            setShowPostOptions(false)
            setShowCreatePostModal(true)
          }}
          onCopyLink={() => {
            navigator.clipboard.writeText(`${window.location.origin}/social/post/${selectedPost.id}`)
            success('Link Copied', 'Post link has been copied to clipboard')
            setShowPostOptions(false)
          }}
          position={postOptionsPosition}
        />
      )}

      {selectedPost && (
        <ReportPostModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false)
            setSelectedPost(null)
          }}
          postId={selectedPost.id}
          onSubmit={(reason, description) => {
            console.log('Report post:', reason, description)
            success('Report Submitted', 'Thank you for reporting. We will review this content.')
          }}
        />
      )}
    </div>
  )
}

export default SocialFeedPage
