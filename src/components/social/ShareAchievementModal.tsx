import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Image as ImageIcon, Globe, Users, Lock } from 'lucide-react';
import CreatePostModal from './CreatePostModal';

interface ShareAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    id: string;
    title: string;
    description: string;
    icon?: string;
    date?: Date;
  };
  onShare: (postData: any) => void;
}

const ShareAchievementModal: React.FC<ShareAchievementModalProps> = ({ isOpen, onClose, achievement, onShare }) => {
  const [showPostModal, setShowPostModal] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-600" size={24} />
              <h2 className="text-xl font-semibold">Share Achievement</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h3 className="font-semibold mb-1">{achievement.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
              {achievement.date && (
                <p className="text-xs text-gray-500 mt-2">
                  Achieved on {new Date(achievement.date).toLocaleDateString()}
                </p>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share this achievement with your friends and celebrate your success!
            </p>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPostModal(true);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Post
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <CreatePostModal
        isOpen={showPostModal}
        onClose={() => {
          setShowPostModal(false);
          onClose();
        }}
        onSubmit={(postData) => {
          onShare({ ...postData, achievement });
        }}
        shareType="achievement"
        shareData={achievement}
        initialContent={`🎉 Just achieved: ${achievement.title}! ${achievement.description}`}
      />
    </>
  );
};

export default ShareAchievementModal;

