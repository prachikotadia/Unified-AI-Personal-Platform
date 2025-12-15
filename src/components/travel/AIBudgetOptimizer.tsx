import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, DollarSign, TrendingDown, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface BudgetOptimization {
  category: string;
  current: number;
  recommended: number;
  savings: number;
  suggestions: string[];
  priority: 'high' | 'medium' | 'low';
}

interface AIBudgetOptimizerProps {
  trip: {
    id: string;
    destination: string;
    budget: number;
    currency: string;
    start_date: string;
    end_date: string;
  };
  onApplyOptimization?: (optimizations: BudgetOptimization[]) => void;
}

const AIBudgetOptimizer: React.FC<AIBudgetOptimizerProps> = ({
  trip,
  onApplyOptimization
}) => {
  const [optimizations, setOptimizations] = useState<BudgetOptimization[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    if (trip) {
      optimizeBudget();
    }
  }, [trip]);

  const optimizeBudget = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // AI budget optimization logic
    const mockOptimizations: BudgetOptimization[] = [
      {
        category: 'Accommodation',
        current: trip.budget * 0.4,
        recommended: trip.budget * 0.35,
        savings: trip.budget * 0.05,
        suggestions: [
          'Consider booking 2-3 months in advance for better rates',
          'Look for accommodations slightly outside city center (15-20% savings)',
          'Consider vacation rentals for longer stays'
        ],
        priority: 'high'
      },
      {
        category: 'Transportation',
        current: trip.budget * 0.25,
        recommended: trip.budget * 0.22,
        savings: trip.budget * 0.03,
        suggestions: [
          'Book flights on weekdays for lower prices',
          'Use public transportation instead of taxis',
          'Consider multi-city passes for attractions'
        ],
        priority: 'medium'
      },
      {
        category: 'Food & Dining',
        current: trip.budget * 0.20,
        recommended: trip.budget * 0.18,
        savings: trip.budget * 0.02,
        suggestions: [
          'Mix of local street food and restaurants (save 30-40%)',
          'Book restaurants in advance for discounts',
          'Avoid tourist-trap restaurants'
        ],
        priority: 'medium'
      },
      {
        category: 'Activities',
        current: trip.budget * 0.15,
        recommended: trip.budget * 0.15,
        savings: 0,
        suggestions: [
          'Look for free walking tours',
          'Book attraction tickets online in advance',
          'Consider city passes for multiple attractions'
        ],
        priority: 'low'
      }
    ];

    const savings = mockOptimizations.reduce((sum, opt) => sum + opt.savings, 0);
    setTotalSavings(savings);
    setOptimizations(mockOptimizations);
    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">AI is optimizing your budget...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold">AI Budget Optimizer</h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
          Powered by AI
        </span>
      </div>

      {/* Summary */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-800 dark:text-green-200 mb-1">
              <strong>Potential Savings:</strong>
            </p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-200">
              {trip.currency} {totalSavings.toFixed(2)}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              {((totalSavings / trip.budget) * 100).toFixed(1)}% of your total budget
            </p>
          </div>
          <TrendingDown className="text-green-600" size={32} />
        </div>
      </div>

      {/* Optimizations */}
      <div className="space-y-4">
        {optimizations.map((opt, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{opt.category}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(opt.priority)}`}>
                  {opt.priority.toUpperCase()} PRIORITY
                </span>
              </div>
              {opt.savings > 0 && (
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Savings</div>
                  <div className="font-bold text-green-600">
                    {trip.currency} {opt.savings.toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current</div>
                <div className="font-medium">{trip.currency} {opt.current.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Recommended</div>
                <div className="font-medium text-blue-600">{trip.currency} {opt.recommended.toFixed(2)}</div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">AI Suggestions:</p>
              <ul className="space-y-1">
                {opt.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={12} />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {onApplyOptimization && (
        <div className="mt-6">
          <button
            onClick={() => onApplyOptimization(optimizations)}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            Apply Optimizations
          </button>
        </div>
      )}
    </div>
  );
};

export default AIBudgetOptimizer;

