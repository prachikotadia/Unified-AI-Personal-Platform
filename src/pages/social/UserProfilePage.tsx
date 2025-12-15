import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Edit2,
  UserPlus,
  UserMinus,
  MessageCircle,
  Shield,
  UserCheck,
  UserX,
  Share2,
  Eye,
  Trophy,
  Share2 as ShareIcon,
  Settings,
  Camera,
  MapPin,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  Globe,
  Calendar,
  Heart,
  MessageSquare,
  Activity,
  Plane,
  DollarSign
} from 'lucide-react';
import EditProfileModal from '../../components/social/EditProfileModal';
import BlockUserModal from '../../components/social/BlockUserModal';
import { useToastHelpers } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/auth';

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { success } = useToastHelpers();
  const [profile, setProfile] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [sharedItems, setSharedItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'achievements' | 'shared'>('posts');

  useEffect(() => {
    // Check if viewing own profile
    const ownProfile = userId === currentUser?.id || !userId;
    setIsOwnProfile(ownProfile);

    // Mock profile data
    const mockProfile = {
      id: userId || currentUser?.id || 'user1',
      name: ownProfile ? 'You' : 'Sarah M.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      bio: 'Fitness enthusiast, travel lover, and finance geek. Always learning and growing!',
      location: 'New York, NY',
      occupation: 'Software Engineer',
      education: 'MIT',
      email: 'sarah@example.com',
      phone: '+1 (555) 123-4567',
      website: 'https://sarah.example.com',
      joinDate: new Date('2023-01-15'),
      friendsCount: 156,
      postsCount: 42,
      followersCount: 234,
      followingCount: 189
    };

    setProfile(mockProfile);
    setIsFriend(!ownProfile && Math.random() > 0.5);
    setIsFollowing(!ownProfile && Math.random() > 0.3);

    // Mock data
    setPosts([
      { id: 1, content: 'Just completed my monthly budget review!', type: 'budget', likes: 15, comments: 8, timestamp: '2 hours ago' },
      { id: 2, content: 'Morning run completed! 5km in 25 minutes.', type: 'workout', likes: 31, comments: 6, timestamp: '1 day ago' },
      { id: 3, content: 'Planning my next adventure! Tokyo here I come!', type: 'trip', likes: 23, comments: 12, timestamp: '3 days ago' }
    ]);

    setAchievements([
      { id: 1, title: '30-Day Workout Challenge', description: 'Completed 30 consecutive days of workouts', date: new Date('2024-01-15') },
      { id: 2, title: 'Budget Master', description: 'Stayed within budget for 3 months', date: new Date('2024-02-01') }
    ]);

    setSharedItems([
      { id: 1, type: 'budget', title: 'Monthly Budget', description: 'Shared their monthly budget plan', timestamp: '2 hours ago' },
      { id: 2, type: 'workout', title: 'Morning Run', description: 'Completed a 5km run', timestamp: '1 day ago' }
    ]);
  }, [userId, currentUser]);

  const handleAddFriend = () => {
    setIsFriend(true);
    success('Friend Request Sent', 'Friend request has been sent!');
  };

  const handleRemoveFriend = () => {
    if (window.confirm('Remove this person from your friends?')) {
      setIsFriend(false);
      success('Friend Removed', 'This person has been removed from your friends.');
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    success(isFollowing ? 'Unfollowed' : 'Following', isFollowing ? 'You have unfollowed this user' : 'You are now following this user');
  };

  const handleBlock = () => {
    setShowBlockModal(true);
  };

  const handleConfirmBlock = () => {
    setIsBlocked(true);
    setIsFriend(false);
    setIsFollowing(false);
    setShowBlockModal(false);
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/social/profile/${profile.id}`;
    navigator.clipboard.writeText(profileUrl);
    success('Link Copied', 'Profile link has been copied to clipboard!');
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700">
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
              {profile.bio && (
                <p className="text-gray-600 dark:text-gray-400 mb-3">{profile.bio}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.occupation && (
                  <div className="flex items-center gap-1">
                    <Briefcase size={14} />
                    <span>{profile.occupation}</span>
                  </div>
                )}
                {profile.education && (
                  <div className="flex items-center gap-1">
                    <GraduationCap size={14} />
                    <span>{profile.education}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate(`/chat/${profile.id}`)}
                  className="btn-primary flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
                {isFriend ? (
                  <button
                    onClick={handleRemoveFriend}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <UserMinus className="w-4 h-4" />
                    Remove Friend
                  </button>
                ) : (
                  <button
                    onClick={handleAddFriend}
                    className="btn-primary flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Friend
                  </button>
                )}
                <button
                  onClick={handleFollow}
                  className={`btn-secondary flex items-center gap-2 ${
                    isFollowing ? 'bg-gray-200 dark:bg-gray-700' : ''
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserX className="w-4 h-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Follow
                    </>
                  )}
                </button>
                <button
                  onClick={handleBlock}
                  className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Shield className="w-4 h-4" />
                  Block
                </button>
              </>
            )}
            <button
              onClick={handleShareProfile}
              className="btn-secondary flex items-center gap-2"
              title="Share Profile"
            >
              <ShareIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold">{profile.postsCount}</div>
            <div className="text-sm text-gray-500">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{profile.friendsCount}</div>
            <div className="text-sm text-gray-500">Friends</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{profile.followersCount}</div>
            <div className="text-sm text-gray-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{profile.followingCount}</div>
            <div className="text-sm text-gray-500">Following</div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'posts'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <MessageSquare className="inline w-4 h-4 mr-2" />
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'achievements'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Trophy className="inline w-4 h-4 mr-2" />
            Achievements ({achievements.length})
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'shared'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Share2 className="inline w-4 h-4 mr-2" />
            Shared Items ({sharedItems.length})
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-800 dark:text-gray-200 mb-2">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart size={14} />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      {post.comments}
                    </span>
                    <span>{post.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-start gap-4">
                  <Trophy className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'shared' && (
            <div className="space-y-4">
              {sharedItems.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {item.type === 'budget' && <DollarSign className="w-5 h-5 text-green-600" />}
                    {item.type === 'workout' && <Activity className="w-5 h-5 text-red-600" />}
                    {item.type === 'trip' && <Plane className="w-5 h-5 text-blue-600" />}
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
                  <p className="text-xs text-gray-500">{item.timestamp}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={profile}
          onSave={(updates) => {
            setProfile(prev => ({ ...prev, ...updates }));
            success('Profile Updated', 'Your profile has been updated successfully!');
          }}
        />
      )}

      {!isOwnProfile && (
        <BlockUserModal
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          userName={profile.name}
          onConfirm={handleConfirmBlock}
        />
      )}
    </div>
  );
};

export default UserProfilePage;

