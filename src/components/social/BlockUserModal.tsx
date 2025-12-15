import React from 'react';
import { motion } from 'framer-motion';
import { X, Shield, AlertTriangle } from 'lucide-react';
import { useToastHelpers } from '../../components/ui/Toast';

interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onConfirm: () => void;
}

const BlockUserModal: React.FC<BlockUserModalProps> = ({ isOpen, onClose, userName, onConfirm }) => {
  const { success } = useToastHelpers();

  const handleConfirm = () => {
    onConfirm();
    success('User Blocked', `${userName} has been blocked. You won't see their content anymore.`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="text-red-600" size={24} />
            <h2 className="text-xl font-semibold">Block User</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  Are you sure you want to block {userName}?
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  You won't be able to see their posts, comments, or send them messages. They also won't be able to see your content.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Block User
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BlockUserModal;

