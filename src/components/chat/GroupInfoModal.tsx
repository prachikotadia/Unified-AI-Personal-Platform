import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Settings, UserPlus, UserMinus, Crown, Volume2, VolumeX, Trash2, Edit2, Camera } from 'lucide-react';
import { ChatRoom } from '../../store/chat';

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: ChatRoom;
  currentUserId: string;
  onUpdateGroup: (updates: Partial<ChatRoom>) => void;
  onLeaveGroup: () => void;
  onDeleteGroup: () => void;
  onAddMember: () => void;
  onRemoveMember: (userId: string) => void;
}

const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
  isOpen,
  onClose,
  group,
  currentUserId,
  onUpdateGroup,
  onLeaveGroup,
  onDeleteGroup,
  onAddMember,
  onRemoveMember
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  const [groupAvatar, setGroupAvatar] = useState(group.avatar);

  const isAdmin = group.participants[0] === currentUserId; // First participant is admin

  const handleSave = () => {
    onUpdateGroup({ name: groupName, avatar: groupAvatar });
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Group Info</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Group Avatar & Name */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src={groupAvatar}
                alt={group.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700">
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setGroupAvatar(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleSave}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{group.name}</h3>
                {isAdmin && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={18} />
                <h4 className="font-medium">Members ({group.participants.length})</h4>
              </div>
              {isAdmin && (
                <button
                  onClick={onAddMember}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <UserPlus size={16} />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {group.participants.map((userId) => (
                <div key={userId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                      {userId.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">
                      {userId === currentUserId ? 'You' : `User ${userId.slice(-4)}`}
                    </span>
                    {userId === group.participants[0] && (
                      <Crown className="text-yellow-500" size={16} />
                    )}
                  </div>
                  {isAdmin && userId !== currentUserId && (
                    <button
                      onClick={() => onRemoveMember(userId)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <UserMinus size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onLeaveGroup}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <UserMinus size={18} />
              <span>Leave Group</span>
            </button>
            {isAdmin && (
              <button
                onClick={onDeleteGroup}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
                <span>Delete Group</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GroupInfoModal;

