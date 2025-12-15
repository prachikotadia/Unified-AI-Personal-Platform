import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import CreatePostModal from './CreatePostModal';

interface ShareBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: {
    id: string;
    name: string;
    category: string;
    amount: number;
    spent: number;
    period: string;
  };
  onShare: (postData: any) => void;
}

const ShareBudgetModal: React.FC<ShareBudgetModalProps> = ({ isOpen, onClose, budget, onShare }) => {
  const [showPostModal, setShowPostModal] = useState(false);
  const remaining = budget.amount - budget.spent;
  const percentage = (budget.spent / budget.amount) * 100;

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
              <DollarSign className="text-green-600" size={24} />
              <h2 className="text-xl font-semibold">Share Budget</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h3 className="font-semibold mb-3">{budget.name}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Budget:</span>
                  <span className="font-medium">${budget.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Spent:</span>
                  <span className="font-medium">${budget.spent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Remaining:</span>
                  <span className={`font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${remaining.toLocaleString()}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{budget.category}</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${percentage > 100 ? 'bg-red-600' : percentage > 80 ? 'bg-yellow-600' : 'bg-green-600'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
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
                onClick={() => setShowPostModal(true)}
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
          onShare({ ...postData, budget });
        }}
        shareType="budget"
        shareData={budget}
        initialContent={`💰 ${budget.name}: $${budget.spent.toLocaleString()} / $${budget.amount.toLocaleString()} (${percentage.toFixed(1)}%)`}
      />
    </>
  );
};

export default ShareBudgetModal;

