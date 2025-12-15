import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, UserPlus, Check, XCircle } from 'lucide-react';
import { useToastHelpers } from '../../components/ui/Toast';

interface FindFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendRequest: (userId: string) => void;
}

const FindFriendsModal: React.FC<FindFriendsModalProps> = ({ isOpen, onClose, onSendRequest }) => {
  const { success } = useToastHelpers();
  const [searchTerm, setSearchTerm] = useState('');
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  // Mock users for demo
  const availableUsers = [
    { id: 'user2', name: 'Sarah M.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', mutualFriends: 3 },
    { id: 'user3', name: 'Mike R.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', mutualFriends: 5 },
    { id: 'user4', name: 'Emma L.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', mutualFriends: 2 },
    { id: 'user5', name: 'John D.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', mutualFriends: 1 },
  ];

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendRequest = (userId: string) => {
    setSentRequests(prev => new Set([...prev, userId]));
    onSendRequest(userId);
    success('Request Sent', 'Friend request has been sent successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Find Friends</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.mutualFriends} mutual friend{user.mutualFriends !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {sentRequests.has(user.id) ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check size={18} />
                    <span className="text-sm">Request Sent</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <UserPlus size={16} />
                    <span>Add Friend</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FindFriendsModal;

