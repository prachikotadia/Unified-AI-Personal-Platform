import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ReactionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReaction: (emoji: string) => void;
  position?: { x: number; y: number };
}

const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '👏', '🎉', '💯', '✅', '❌'];

const ReactionPickerModal: React.FC<ReactionPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectReaction,
  position
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-full p-2 shadow-2xl ${
          position ? 'absolute' : 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
        }`}
        style={position ? { left: position.x, top: position.y } : {}}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-2">
          {commonReactions.map((emoji, index) => (
            <button
              key={index}
              onClick={() => {
                onSelectReaction(emoji);
                onClose();
              }}
              className="p-2 text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ReactionPickerModal;

