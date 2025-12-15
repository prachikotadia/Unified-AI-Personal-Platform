import React from 'react';
import { motion } from 'framer-motion';
import { X, User, Phone, Mail, MapPin, Calendar, MessageCircle, Video, PhoneCall, Ban } from 'lucide-react';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    avatar: string;
    email?: string;
    phone?: string;
    location?: string;
    joinedDate?: Date;
    isOnline: boolean;
  };
  onMessage: () => void;
  onCall: () => void;
  onVideoCall: () => void;
  onBlock?: () => void;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({
  isOpen,
  onClose,
  user,
  onMessage,
  onCall,
  onVideoCall,
  onBlock
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">User Info</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* User Avatar & Name */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                user.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            {user.email && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Mail size={18} className="text-gray-500" />
                <span className="text-sm">{user.email}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Phone size={18} className="text-gray-500" />
                <span className="text-sm">{user.phone}</span>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <MapPin size={18} className="text-gray-500" />
                <span className="text-sm">{user.location}</span>
              </div>
            )}
            {user.joinedDate && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Calendar size={18} className="text-gray-500" />
                <span className="text-sm">
                  Joined {user.joinedDate.toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                onMessage();
                onClose();
              }}
              className="flex flex-col items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-sm">Message</span>
            </button>
            <button
              onClick={() => {
                onCall();
                onClose();
              }}
              className="flex flex-col items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
            >
              <PhoneCall size={20} />
              <span className="text-sm">Call</span>
            </button>
            <button
              onClick={() => {
                onVideoCall();
                onClose();
              }}
              className="flex flex-col items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
            >
              <Video size={20} />
              <span className="text-sm">Video</span>
            </button>
            {onBlock && (
              <button
                onClick={() => {
                  onBlock();
                  onClose();
                }}
                className="flex flex-col items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                <Ban size={20} />
                <span className="text-sm">Block</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserInfoModal;

