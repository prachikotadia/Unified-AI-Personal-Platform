import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  DollarSign,
  Plane,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Eye,
  Filter,
  X,
  User
} from 'lucide-react';
import CommentModal from '../../components/social/CommentModal';
import { useToastHelpers } from '../../components/ui/Toast';

interface SharedItem {
  id: string;
  type: 'finance' | 'travel' | 'fitness' | 'achievement';
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  image?: string;
}

const SharedItemsPage = () => {
  const navigate = useNavigate();
  const { success } = useToastHelpers();
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'finance' | 'travel' | 'fitness' | 'achievement'>('all');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SharedItem | null>(null);

  useEffect(() => {
    // Mock data
    const mockItems: SharedItem[] = [
      {
        id: '1',
        type: 'finance',
        title: 'Monthly Budget Achievement',
        content: 'Just completed my monthly budget review! Feeling great about my spending habits this month.',
        author: {
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        likes: 24,
        comments: 8,
        shares: 3,
        timestamp: '2 hours ago'
      },
      {
        id: '2',
        type: 'travel',
        title: 'Amazing Trip to Japan',
        content: 'Just returned from an incredible 2-week adventure in Japan! The cherry blossoms were absolutely breathtaking.',
        author: {
          name: 'Mike Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        likes: 156,
        comments: 23,
        shares: 12,
        timestamp: '1 day ago',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop'
      },
      {
        id: '3',
        type: 'fitness',
        title: 'New Personal Record!',
        content: 'Hit a new PR on my deadlift today - 315 lbs! All that hard work is finally paying off.',
        author: {
          name: 'Alex Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        likes: 89,
        comments: 15,
        shares: 7,
        timestamp: '3 hours ago'
      },
      {
        id: '4',
        type: 'achievement',
        title: 'Graduation Day!',
        content: 'Finally graduated with my Master\'s degree! Four years of hard work and dedication have paid off.',
        author: {
          name: 'Emily Davis',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        likes: 342,
        comments: 45,
        shares: 28,
        timestamp: '5 hours ago',
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9e1?w=600&h=400&fit=crop'
      }
    ];
    setSharedItems(mockItems);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'finance':
        return <DollarSign size={20} className="text-green-600" />;
      case 'travel':
        return <Plane size={20} className="text-blue-600" />;
      case 'fitness':
        return <TrendingUp size={20} className="text-red-600" />;
      case 'achievement':
        return <Users size={20} className="text-purple-600" />;
      default:
        return <Users size={20} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'finance':
        return 'bg-green-100 text-green-800';
      case 'travel':
        return 'bg-blue-100 text-blue-800';
      case 'fitness':
        return 'bg-red-100 text-red-800';
      case 'achievement':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueUsers = Array.from(new Set(sharedItems.map(item => item.author.name)));

  const filteredItems = sharedItems.filter(item => {
    const matchesType = selectedFilter === 'all' || item.type === selectedFilter;
    const matchesUser = selectedUserFilter === 'all' || item.author.name === selectedUserFilter;
    return matchesType && matchesUser;
  });

  const handleLike = (itemId: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleShare = (item: SharedItem) => {
    console.log('Share item:', item.id);
    success('Item Shared', 'Item has been shared successfully!');
  };

  const handleClearFilters = () => {
    setSelectedFilter('all');
    setSelectedUserFilter('all');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shared Items</h1>
          <p className="text-gray-600">Discover what your friends are sharing across all modules</p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-4 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold">Filters</h3>
            </div>
            {(selectedFilter !== 'all' || selectedUserFilter !== 'all') && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Type</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All Items' },
                  { value: 'finance', label: 'Finance' },
                  { value: 'travel', label: 'Travel' },
                  { value: 'fitness', label: 'Fitness' },
                  { value: 'achievement', label: 'Achievements' }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedFilter(filter.value as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedFilter === filter.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Filter by User</label>
              <select
                value={selectedUserFilter}
                onChange={(e) => setSelectedUserFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
              >
                <option value="all">All Users</option>
                {uniqueUsers.map((user) => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Shared Items */}
        <div className="space-y-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.author.avatar}
                      alt={item.author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.author.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </span>
                        <span>•</span>
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(item.type)}
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-700 mb-4">{item.content}</p>
                
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        likedItems.has(item.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart size={16} className={likedItems.has(item.id) ? 'fill-current' : ''} />
                      <span className="text-sm">{item.likes + (likedItems.has(item.id) ? 1 : 0)}</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowCommentModal(true);
                      }}
                      className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle size={16} />
                      <span className="text-sm">{item.comments}</span>
                    </button>
                    <button
                      onClick={() => handleShare(item)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
                    >
                      <Share2 size={16} />
                      <span className="text-sm">{item.shares}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => navigate(`/social/shared/${item.id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600"
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Users size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shared items found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later for new content.</p>
          </motion.div>
        )}
      </div>

      {/* Comment Modal */}
      {selectedItem && (
        <CommentModal
          isOpen={showCommentModal}
          onClose={() => {
            setShowCommentModal(false);
            setSelectedItem(null);
          }}
          postId={selectedItem.id}
          comments={[]}
          onAddComment={(content) => {
            console.log('Add comment:', content);
            success('Comment Added', 'Your comment has been posted!');
          }}
          onLikeComment={(commentId) => {
            console.log('Like comment:', commentId);
          }}
          onReplyComment={(commentId, content) => {
            console.log('Reply to comment:', commentId, content);
            success('Reply Posted', 'Your reply has been posted!');
          }}
          onDeleteComment={(commentId) => {
            console.log('Delete comment:', commentId);
            success('Comment Deleted', 'Your comment has been deleted');
          }}
        />
      )}
    </div>
  );
};

export default SharedItemsPage;
