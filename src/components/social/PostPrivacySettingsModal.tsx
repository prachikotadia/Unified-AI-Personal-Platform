import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Globe, Users, Lock, UserCheck } from 'lucide-react';
import { useToastHelpers } from '../../components/ui/Toast';

interface PostPrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrivacy: 'public' | 'friends' | 'private' | 'custom';
  onSave: (privacy: 'public' | 'friends' | 'private' | 'custom', customSettings?: any) => void;
}

const PostPrivacySettingsModal: React.FC<PostPrivacySettingsModalProps> = ({
  isOpen,
  onClose,
  currentPrivacy,
  onSave
}) => {
  const { success } = useToastHelpers();
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private' | 'custom'>(currentPrivacy);
  const [customSettings, setCustomSettings] = useState({
    allowComments: true,
    allowShares: true,
    visibleTo: [] as string[]
  });

  const handleSave = () => {
    onSave(privacy, privacy === 'custom' ? customSettings : undefined);
    success('Privacy Updated', 'Post privacy settings have been saved!');
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
          <h2 className="text-xl font-semibold">Privacy Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {[
            { value: 'public', icon: Globe, label: 'Public', description: 'Anyone can see this post' },
            { value: 'friends', icon: Users, label: 'Friends', description: 'Only your friends can see this post' },
            { value: 'private', icon: Lock, label: 'Private', description: 'Only you can see this post' },
            { value: 'custom', icon: UserCheck, label: 'Custom', description: 'Choose specific privacy options' }
          ].map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setPrivacy(option.value as any)}
                className={`w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-colors ${
                  privacy === option.value
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className={`mt-0.5 ${privacy === option.value ? 'text-blue-600' : 'text-gray-500'}`} size={20} />
                <div className="flex-1 text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
                </div>
                {privacy === option.value && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            );
          })}

          {privacy === 'custom' && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Allow Comments</span>
                <button
                  onClick={() => setCustomSettings(prev => ({ ...prev, allowComments: !prev.allowComments }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    customSettings.allowComments ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      customSettings.allowComments ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Allow Shares</span>
                <button
                  onClick={() => setCustomSettings(prev => ({ ...prev, allowShares: !prev.allowShares }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    customSettings.allowShares ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      customSettings.allowShares ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PostPrivacySettingsModal;

