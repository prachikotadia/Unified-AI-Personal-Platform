import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Check,
  X,
  User,
  Clock,
  Send,
  Users
} from 'lucide-react';
import FindFriendsModal from '../../components/social/FindFriendsModal';
import { useToastHelpers } from '../../components/ui/Toast';

interface FriendRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  timestamp: Date;
  mutualFriends?: number;
}

const FriendRequestsPage = () => {
  const navigate = useNavigate();
  const { success } = useToastHelpers();
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [showFindFriendsModal, setShowFindFriendsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    // Mock friend requests
    const mockReceived: FriendRequest[] = [
      {
        id: 'req1',
        userId: 'user2',
        userName: 'Sarah M.',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        timestamp: new Date('2024-01-20'),
        mutualFriends: 5
      },
      {
        id: 'req2',
        userId: 'user3',
        userName: 'Mike R.',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        timestamp: new Date('2024-01-19'),
        mutualFriends: 3
      }
    ];

    const mockSent: FriendRequest[] = [
      {
        id: 'sent1',
        userId: 'user4',
        userName: 'Emma L.',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        timestamp: new Date('2024-01-18')
      }
    ];

    setReceivedRequests(mockReceived);
    setSentRequests(mockSent);
  }, []);

  const handleAccept = (requestId: string) => {
    const request = receivedRequests.find(r => r.id === requestId);
    if (request) {
      setReceivedRequests(prev => prev.filter(r => r.id !== requestId));
      success('Request Accepted', `You are now friends with ${request.userName}!`);
    }
  };

  const handleDecline = (requestId: string) => {
    const request = receivedRequests.find(r => r.id === requestId);
    if (request) {
      setReceivedRequests(prev => prev.filter(r => r.id !== requestId));
      success('Request Declined', 'Friend request has been declined.');
    }
  };

  const handleCancelSent = (requestId: string) => {
    const request = sentRequests.find(r => r.id === requestId);
    if (request) {
      setSentRequests(prev => prev.filter(r => r.id !== requestId));
      success('Request Cancelled', 'Friend request has been cancelled.');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Friend Requests</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your friend requests and connections
            </p>
          </div>
          <button
            onClick={() => setShowFindFriendsModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Send Friend Request
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'received'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <User className="inline w-4 h-4 mr-2" />
            Received ({receivedRequests.length})
            {activeTab === 'received' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'sent'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Send className="inline w-4 h-4 mr-2" />
            Sent ({sentRequests.length})
            {activeTab === 'sent' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {activeTab === 'received' ? (
            receivedRequests.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Friend Requests
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You don't have any pending friend requests.
                </p>
                <button
                  onClick={() => setShowFindFriendsModal(true)}
                  className="btn-primary"
                >
                  Find Friends
                </button>
              </div>
            ) : (
              receivedRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={request.userAvatar}
                      alt={request.userName}
                      className="w-16 h-16 rounded-full object-cover cursor-pointer"
                      onClick={() => navigate(`/social/profile/${request.userId}`)}
                    />
                    <div>
                      <h3
                        className="font-semibold cursor-pointer hover:text-blue-600"
                        onClick={() => navigate(`/social/profile/${request.userId}`)}
                      >
                        {request.userName}
                      </h3>
                      {request.mutualFriends && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {request.mutualFriends} mutual friend{request.mutualFriends !== 1 ? 's' : ''}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Clock className="inline w-3 h-3 mr-1" />
                        {new Date(request.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAccept(request.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(request.id)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                </motion.div>
              ))
            )
          ) : (
            sentRequests.length === 0 ? (
              <div className="text-center py-12">
                <Send className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Sent Requests
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You haven't sent any friend requests yet.
                </p>
                <button
                  onClick={() => setShowFindFriendsModal(true)}
                  className="btn-primary"
                >
                  Find Friends
                </button>
              </div>
            ) : (
              sentRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={request.userAvatar}
                      alt={request.userName}
                      className="w-16 h-16 rounded-full object-cover cursor-pointer"
                      onClick={() => navigate(`/social/profile/${request.userId}`)}
                    />
                    <div>
                      <h3
                        className="font-semibold cursor-pointer hover:text-blue-600"
                        onClick={() => navigate(`/social/profile/${request.userId}`)}
                      >
                        {request.userName}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Clock className="inline w-3 h-3 mr-1" />
                        Sent {new Date(request.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelSent(request.id)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </motion.div>
              ))
            )
          )}
        </div>
      </motion.div>

      <FindFriendsModal
        isOpen={showFindFriendsModal}
        onClose={() => setShowFindFriendsModal(false)}
        onSendRequest={(userId) => {
          success('Request Sent', 'Friend request has been sent!');
        }}
      />
    </div>
  );
};

export default FriendRequestsPage;

