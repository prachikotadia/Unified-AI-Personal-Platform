import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingDown, TrendingUp, Target, CheckCircle, X } from 'lucide-react';
import { Budget, Transaction } from '../../services/financeAPI';

interface BudgetRecommendation {
  id: string;
  category: string;
  currentSpending: number;
  recommendedAmount: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  potentialSavings: number;
}

interface AIBudgetRecommendationsProps {
  isOpen: boolean;
  onClose: () => void;
  transactions?: Transaction[];
  existingBudgets?: Budget[];
  onApply?: (recommendations: BudgetRecommendation[]) => void;
}

const AIBudgetRecommendations: React.FC<AIBudgetRecommendationsProps> = ({
  isOpen,
  onClose,
  transactions = [],
  existingBudgets = [],
  onApply
}) => {
  const [recommendations, setRecommendations] = useState<BudgetRecommendation[]>([]);
  const [selectedRecommendations, setSelectedRecommendations] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      generateRecommendations();
    }
  }, [isOpen, transactions, existingBudgets]);

  const generateRecommendations = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const expenseCategories = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const newRecommendations: BudgetRecommendation[] = [];

    Object.entries(expenseCategories).forEach(([category, spending]) => {
      const avgMonthly = spending;
      const recommended = avgMonthly * 0.9; // 10% reduction
      const savings = avgMonthly - recommended;

      if (savings > 20) {
        newRecommendations.push({
          id: category,
          category: category.replace('_', ' '),
          currentSpending: avgMonthly,
          recommendedAmount: recommended,
          reason: `Based on your spending patterns, reducing ${category.replace('_', ' ')} expenses by 10% could help you save $${savings.toFixed(2)} monthly.`,
          priority: savings > 100 ? 'high' : savings > 50 ? 'medium' : 'low',
          potentialSavings: savings
        });
      }
    });

    setRecommendations(newRecommendations.sort((a, b) => b.potentialSavings - a.potentialSavings));
    setLoading(false);
  };

  const toggleRecommendation = (id: string) => {
    const newSelected = new Set(selectedRecommendations);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecommendations(newSelected);
  };

  const handleApply = () => {
    const selected = recommendations.filter(r => selectedRecommendations.has(r.id));
    onApply?.(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold">AI Budget Recommendations</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-gray-600">Analyzing your spending patterns...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>No budget recommendations available at this time</p>
              </div>
            ) : (
              <>
                {recommendations.map((rec) => {
                  const isSelected = selectedRecommendations.has(rec.id);
                  return (
                    <div
                      key={rec.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleRecommendation(rec.id)}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRecommendation(rec.id)}
                          className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold capitalize">{rec.category}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {rec.priority.toUpperCase()} PRIORITY
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-600">Current</p>
                              <p className="font-semibold text-red-600">${rec.currentSpending.toFixed(2)}</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-600">Recommended</p>
                              <p className="font-semibold text-green-600">${rec.recommendedAmount.toFixed(2)}</p>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded">
                              <p className="text-xs text-gray-600">Savings</p>
                              <p className="font-semibold text-green-700">${rec.potentialSavings.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-purple-900">Total Potential Savings</p>
                      <p className="text-2xl font-bold text-purple-600">
                        ${recommendations
                          .filter(r => selectedRecommendations.has(r.id))
                          .reduce((sum, r) => sum + r.potentialSavings, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                    <Target className="text-purple-600" size={32} />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={selectedRecommendations.size === 0}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Apply Selected ({selectedRecommendations.size})
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AIBudgetRecommendations;

