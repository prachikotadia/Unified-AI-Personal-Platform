import React from 'react';
import { motion } from 'framer-motion';
import { X, Brain, TrendingUp, Target, Users, Star } from 'lucide-react';

interface AIReasoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  reason: string;
  confidence?: number;
  factors?: string[];
}

const AIReasoningModal: React.FC<AIReasoningModalProps> = ({
  isOpen,
  onClose,
  productName,
  reason,
  confidence,
  factors
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Why Recommended</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">{productName}</p>
            {confidence && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-blue-700 dark:text-blue-300">
                  {Math.round(confidence * 100)}% match
                </span>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Brain size={16} className="text-blue-600" />
              Primary Reason
            </h3>
            <p className="text-gray-700 dark:text-gray-300">{reason}</p>
          </div>

          {factors && factors.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Key Factors</h3>
              <div className="space-y-2">
                {factors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="mt-0.5">
                      {factor.includes('browsing') && <TrendingUp size={16} className="text-green-600" />}
                      {factor.includes('purchase') && <Target size={16} className="text-blue-600" />}
                      {factor.includes('similar') && <Users size={16} className="text-purple-600" />}
                      {factor.includes('rating') && <Star size={16} className="text-yellow-600" />}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{factor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Our AI analyzes your browsing history, purchase patterns, and preferences to provide personalized recommendations.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Got it
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIReasoningModal;

