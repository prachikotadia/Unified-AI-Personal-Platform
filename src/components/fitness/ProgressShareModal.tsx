import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Share2, Copy, Mail, MessageCircle, Link2, CheckCircle } from 'lucide-react';

interface ProgressShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  progressData: {
    weight?: number;
    bodyFat?: number;
    muscleMass?: number;
    workouts?: number;
    achievements?: number;
    period?: string;
  };
}

const ProgressShareModal: React.FC<ProgressShareModalProps> = ({
  isOpen,
  onClose,
  progressData
}) => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [shareMethod, setShareMethod] = useState<'link' | 'email' | 'social'>('link');

  const shareLink = `${window.location.origin}/fitness/progress?share=${btoa(JSON.stringify(progressData))}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareByEmail = () => {
    // Email sharing logic would go here
    alert(`Progress data would be sent to ${email}`);
  };

  const handleShareToSocial = (platform: string) => {
    // Social sharing logic would go here
    alert(`Progress would be shared to ${platform}`);
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
            <Share2 className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Share Progress</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Share Method Selection */}
          <div className="flex gap-2">
            <button
              onClick={() => setShareMethod('link')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                shareMethod === 'link'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Link2 className="w-4 h-4 inline mr-2" />
              Link
            </button>
            <button
              onClick={() => setShareMethod('email')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                shareMethod === 'email'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </button>
            <button
              onClick={() => setShareMethod('social')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                shareMethod === 'social'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Social
            </button>
          </div>

          {/* Link Sharing */}
          {shareMethod === 'link' && (
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Share Link</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={16} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Email Sharing */}
          {shareMethod === 'email' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                onClick={handleShareByEmail}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Mail size={16} />
                Send Progress
              </button>
            </div>
          )}

          {/* Social Sharing */}
          {shareMethod === 'social' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShareToSocial('Facebook')}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Facebook
              </button>
              <button
                onClick={() => handleShareToSocial('Twitter')}
                className="px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
              >
                Twitter
              </button>
              <button
                onClick={() => handleShareToSocial('Instagram')}
                className="px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Instagram
              </button>
              <button
                onClick={() => handleShareToSocial('WhatsApp')}
                className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                WhatsApp
              </button>
            </div>
          )}

          {/* Progress Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Progress Summary</p>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              {progressData.weight && <p>Weight: {progressData.weight} kg</p>}
              {progressData.bodyFat && <p>Body Fat: {progressData.bodyFat}%</p>}
              {progressData.muscleMass && <p>Muscle Mass: {progressData.muscleMass} kg</p>}
              {progressData.workouts && <p>Workouts: {progressData.workouts}</p>}
              {progressData.achievements && <p>Achievements: {progressData.achievements}</p>}
              {progressData.period && <p>Period: {progressData.period}</p>}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressShareModal;

