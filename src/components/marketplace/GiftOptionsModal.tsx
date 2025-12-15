import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Gift, MessageSquare, CheckCircle } from 'lucide-react';

interface GiftOption {
  giftWrap: boolean;
  giftMessage: string;
  recipientName: string;
  recipientEmail: string;
}

interface GiftOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (options: GiftOption) => void;
  initialOptions?: GiftOption;
}

const GiftOptionsModal: React.FC<GiftOptionsModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialOptions
}) => {
  const [giftWrap, setGiftWrap] = useState(initialOptions?.giftWrap || false);
  const [giftMessage, setGiftMessage] = useState(initialOptions?.giftMessage || '');
  const [recipientName, setRecipientName] = useState(initialOptions?.recipientName || '');
  const [recipientEmail, setRecipientEmail] = useState(initialOptions?.recipientEmail || '');

  const handleApply = () => {
    onApply({
      giftWrap,
      giftMessage,
      recipientName,
      recipientEmail
    });
    onClose();
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
          <div className="flex items-center gap-2">
            <Gift className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold">Gift Options</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Gift Wrap */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Gift className="text-purple-600" size={20} />
              <div>
                <h3 className="font-semibold">Gift Wrap</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add premium gift wrapping ($4.99)
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={giftWrap}
                onChange={(e) => setGiftWrap(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Recipient Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Recipient Information (Optional)</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recipient Name
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Enter recipient name"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Enter recipient email"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Gift Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MessageSquare className="inline mr-1" size={16} />
              Gift Message (Optional)
            </label>
            <textarea
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              placeholder="Write a personal message..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              {giftMessage.length}/500 characters
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              Apply Gift Options
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GiftOptionsModal;

