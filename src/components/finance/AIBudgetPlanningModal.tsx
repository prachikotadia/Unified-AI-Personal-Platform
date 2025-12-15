import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, TrendingUp, TrendingDown, Target, CheckCircle } from 'lucide-react';

interface BudgetRecommendation {
  category: string;
  currentSpending: number;
  recommendedAmount: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface AIBudgetPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (recommendations: BudgetRecommendation[]) => void;
  recommendations?: BudgetRecommendation[];
}

const AIBudgetPlanningModal: React.FC<AIBudgetPlanningModalProps> = ({
  isOpen,
  onClose,
  onApply,
  recommendations = []
}) => {
  const [selectedRecommendations, setSelectedRecommendations] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const defaultRecommendations: BudgetRecommendation[] = recommendations.length > 0 ? recommendations : [
    {
      category: 'Food & Dining',
      currentSpending: 600,
      recommendedAmount: 500,
      reason: 'Based on your spending patterns, reducing dining out by $100/month could help you save more',
      priority: 'high'
    },
    {
      category: 'Transportation',
      currentSpending: 350,
      recommendedAmount: 300,
      reason: 'Consider carpooling or using public transport to reduce costs',
      priority: 'medium'
    },
    {
      category: 'Entertainment',
      currentSpending: 200,
      recommendedAmount: 150,
      reason: 'Small reduction can free up funds for savings goals',
      priority: 'low'
    }
  ];

  const toggleRecommendation = (category: string) => {
    const newSelected = new Set(selectedRecommendations);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedRecommendations(newSelected);
  };

  const handleApply = () => {
    if (onApply) {
      const selected = defaultRecommendations.filter(rec => 
        selectedRecommendations.has(rec.category)
      );
      onApply(selected);
    }
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSavings = (current: number, recommended: number) => {
    return current - recommended;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold">AI Budget Planning</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <strong>AI Analysis:</strong> Based on your spending patterns and financial goals, 
              here are personalized budget recommendations to help you save more effectively.
            </p>
          </div>

          {defaultRecommendations.map((recommendation, index) => {
            const savings = getSavings(recommendation.currentSpending, recommendation.recommendedAmount);
            const isSelected = selectedRecommendations.has(recommendation.category);

            return (
              <div
                key={index}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleRecommendation(recommendation.category)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRecommendation(recommendation.category)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {recommendation.category}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                          {recommendation.priority.toUpperCase()} PRIORITY
                        </span>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{recommendation.reason}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Current</p>
                    <p className="font-semibold text-red-600">
                      ${recommendation.currentSpending}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Recommended</p>
                    <p className="font-semibold text-green-600">
                      ${recommendation.recommendedAmount}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Potential Savings</p>
                    <p className="font-semibold text-green-700 flex items-center justify-center gap-1">
                      <TrendingDown size={16} />
                      ${savings}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {defaultRecommendations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No budget recommendations available at this time</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-blue-900">Total Potential Savings</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${defaultRecommendations
                    .filter(rec => selectedRecommendations.has(rec.category))
                    .reduce((sum, rec) => sum + getSavings(rec.currentSpending, rec.recommendedAmount), 0)
                    .toLocaleString()}
                </p>
              </div>
              <Target className="text-blue-600" size={32} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={selectedRecommendations.size === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} />
            Apply Selected Recommendations
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AIBudgetPlanningModal;

