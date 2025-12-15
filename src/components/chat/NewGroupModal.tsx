import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, Users, Image as ImageIcon, Upload } from 'lucide-react';
import { useChatStore } from '../../store/chat';
import { useAuthStore } from '../../store/auth';
import { useToastHelpers } from '../../components/ui/Toast';

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewGroupModal: React.FC<NewGroupModalProps> = ({ isOpen, onClose }) => {
  const { createRoom, users, currentUser } = useChatStore();
  const { user } = useAuthStore();
  const { success } = useToastHelpers();
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // Get current user ID
  const currentUserId = currentUser?.id || user?.id || `guest_${Date.now()}`

  // Mock users for demo (in real app, use users from store)
  const availableUsers = (users && Array.isArray(users) && users.length > 0) ? users : [
    { id: 'user2', name: 'Sarah M.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
    { id: 'user3', name: 'Mike R.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
    { id: 'user4', name: 'Emma L.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
    { id: 'user5', name: 'John D.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
  ];

  const filteredUsers = availableUsers.filter((user: any) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleMember = (userId: string) => {
    setSelectedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      return;
    }

    const participants = Array.from(selectedMembers);
    if (participants.length === 0) {
      return;
    }

    createRoom({
      name: groupName,
      avatar: groupAvatar || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=150&h=150&fit=crop',
      type: 'group',
      participants: [currentUserId, ...participants], // Include current user
      isOnline: false
    });

    success('Group Created', `Group "${groupName}" has been created successfully`);
    onClose();
    
    // Reset form
    setGroupName('');
    setGroupAvatar('');
    setSelectedMembers(new Set());
    setAvatarFile(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Group</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Group Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={groupAvatar || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=150&h=150&fit=crop'}
                  alt="Group avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                />
                <label className="absolute bottom-0 right-0 p-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full cursor-pointer hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Group Name */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">Group Name *</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Search Members */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">Add Members</label>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>

              {/* Selected Members Count */}
              {selectedMembers.size > 0 && (
                <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  {selectedMembers.size} member{selectedMembers.size !== 1 ? 's' : ''} selected
                </div>
              )}

              {/* User List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredUsers.map((user: any) => (
                  <button
                    key={user.id}
                    onClick={() => handleToggleMember(user.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 border ${
                      selectedMembers.has(user.id)
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                    <span className={`font-semibold flex-1 text-left ${
                      selectedMembers.has(user.id) ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>{user.name}</span>
                    {selectedMembers.has(user.id) && (
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Button */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedMembers.size === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
              >
                Create Group
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewGroupModal;

