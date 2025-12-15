import React from 'react';
import { motion } from 'framer-motion';
import { X, Reply, Forward, Copy, Trash2, Edit, MoreVertical } from 'lucide-react';

interface MessageOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReply: () => void;
  onForward: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  isOwnMessage: boolean;
  position?: { x: number; y: number };
}

const MessageOptionsModal: React.FC<MessageOptionsModalProps> = ({
  isOpen,
  onClose,
  onReply,
  onForward,
  onCopy,
  onDelete,
  onEdit,
  isOwnMessage,
  position
}) => {
  if (!isOpen) return null;

  const options = [
    { icon: Reply, label: 'Reply', action: onReply },
    { icon: Forward, label: 'Forward', action: onForward },
    { icon: Copy, label: 'Copy', action: onCopy },
    ...(isOwnMessage && onEdit ? [{ icon: Edit, label: 'Edit', action: onEdit }] : []),
    { icon: Trash2, label: 'Delete', action: onDelete, danger: true }
  ];

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-2 min-w-[150px] ${
          position ? 'absolute' : 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
        }`}
        style={position ? { left: position.x, top: position.y } : {}}
        onClick={(e) => e.stopPropagation()}
      >
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => {
              option.action();
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              option.danger ? 'text-red-600 dark:text-red-400' : ''
            }`}
          >
            <option.icon size={18} />
            <span>{option.label}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default MessageOptionsModal;

