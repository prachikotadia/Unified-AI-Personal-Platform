import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingDown, Lightbulb, CheckCircle, X, DollarSign, Target } from 'lucide-react';
import { Transaction, Budget } from '../../services/financeAPI';

interface OptimizationOpportunity {
  id: string;
  category: string;
  currentSpending: number;
  optimizedSpending: number;
  savings: number;
  method: string;
  description: string;
  actionSteps: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: string;
}

interface AIExpenseOptimizationProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  budgets?: Budget[];
  onApply?: (opportunity: OptimizationOpportunity) => void;
}

const AIExpenseOptimization: React.FC<AIExpenseOptimizationProps> = ({
  isOpen,
  onClose,
  transactions,
  budgets = [],
  onApply
}) => {
  const [opportunities, setOpportunities] = useState<OptimizationOpportunity[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && transactions.length > 0) {
      generateOpportunities();
    }
  }, [isOpen, transactions, budgets]);

  const generateOpportunities = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const newOpportunities: OptimizationOpportunity[] = [];

    // Food & Dining Optimization
    const foodSpending = categoryTotals['food_dining'] || 0;
    if (foodSpending > 300) {
      newOpportunities.push({
        id: 'food_optimization',
        category: 'Food & Dining',
        currentSpending: foodSpending,
        optimizedSpending: foodSpending * 0.7,
        savings: foodSpending * 0.3,
        method: 'Meal Planning & Cooking at Home',
        description: 'Reduce dining out and meal delivery by 30% through better meal planning.',
        actionSteps: [
          'Plan weekly meals on Sunday',
          'Prep ingredients in advance',
          'Cook in batches for multiple meals',
          'Use grocery delivery for convenience',
          'Limit dining out to special occasions'
        ],
        difficulty: 'medium',
        timeframe: '2-4 weeks'
      });
    }

    // Subscription Optimization
    const subscriptions = expenses.filter(t => 
      t.description.toLowerCase().includes('subscription') ||
      t.description.toLowerCase().includes('netflix') ||
      t.description.toLowerCase().includes('spotify') ||
      t.description.toLowerCase().includes('premium')
    );
    const subscriptionTotal = subscriptions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    if (subscriptionTotal > 50) {
      newOpportunities.push({
        id: 'subscription_optimization',
        category: 'Subscriptions',
        currentSpending: subscriptionTotal,
        optimizedSpending: subscriptionTotal * 0.6,
        savings: subscriptionTotal * 0.4,
        method: 'Subscription Audit & Consolidation',
        description: 'Review and cancel unused subscriptions, switch to annual plans for discounts.',
        actionSteps: [
          'List all active subscriptions',
          'Cancel services used less than once a month',
          'Switch to annual plans for 15-20% savings',
          'Share family plans with trusted friends/family',
          'Set calendar reminders to review quarterly'
        ],
        difficulty: 'easy',
        timeframe: '1 week'
      });
    }

    // Transportation Optimization
    const transportSpending = categoryTotals['transportation'] || 0;
    if (transportSpending > 200) {
      newOpportunities.push({
        id: 'transport_optimization',
        category: 'Transportation',
        currentSpending: transportSpending,
        optimizedSpending: transportSpending * 0.75,
        savings: transportSpending * 0.25,
        method: 'Smart Transportation Choices',
        description: 'Reduce transportation costs through carpooling, public transit, and fuel efficiency.',
        actionSteps: [
          'Use public transit for regular commutes',
          'Carpool for work or events',
          'Combine errands into single trips',
          'Maintain vehicle for better fuel efficiency',
          'Consider walking or biking for short distances'
        ],
        difficulty: 'medium',
        timeframe: '2-3 weeks'
      });
    }

    // Shopping Optimization
    const shoppingSpending = categoryTotals['shopping'] || 0;
    if (shoppingSpending > 150) {
      newOpportunities.push({
        id: 'shopping_optimization',
        category: 'Shopping',
        currentSpending: shoppingSpending,
        optimizedSpending: shoppingSpending * 0.8,
        savings: shoppingSpending * 0.2,
        method: 'Smart Shopping Strategies',
        description: 'Reduce impulse purchases and use strategic shopping techniques.',
        actionSteps: [
          'Implement 24-hour rule for non-essential purchases',
          'Use price comparison tools',
          'Wait for sales and use coupons',
          'Buy generic brands for non-brand items',
          'Unsubscribe from promotional emails'
        ],
        difficulty: 'easy',
        timeframe: '1-2 weeks'
      });
    }

    // Utility Optimization
    const billsSpending = categoryTotals['bills'] || 0;
    if (billsSpending > 100) {
      newOpportunities.push({
        id: 'utility_optimization',
        category: 'Utilities',
        currentSpending: billsSpending,
        optimizedSpending: billsSpending * 0.85,
        savings: billsSpending * 0.15,
        method: 'Energy Efficiency & Bill Negotiation',
        description: 'Reduce utility costs through efficiency improvements and provider negotiation.',
        actionSteps: [
          'Switch to LED light bulbs',
          'Use programmable thermostat',
          'Unplug devices when not in use',
          'Negotiate with service providers',
          'Compare and switch to better rates'
        ],
        difficulty: 'medium',
        timeframe: '1 month'
      });
    }

    setOpportunities(newOpportunities.sort((a, b) => b.savings - a.savings));
    setLoading(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <h2 className="text-xl font-semibold">AI Expense Optimization</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-gray-600">Analyzing your expenses...</span>
            </div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingDown className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No optimization opportunities found</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-900">Total Potential Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${opportunities.reduce((sum, o) => sum + o.savings, 0).toFixed(2)}/month
                  </p>
                </div>
                <TrendingDown className="text-green-600" size={32} />
              </div>
            </div>

            {opportunities.map((opp) => (
              <div key={opp.id} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{opp.category} Optimization</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(opp.difficulty)}`}>
                        {opp.difficulty.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{opp.method}</p>
                    <p className="text-xs text-gray-600 mb-3">{opp.description}</p>
                    
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center p-2 bg-red-50 rounded">
                        <p className="text-xs text-gray-600">Current</p>
                        <p className="font-semibold text-red-600">${opp.currentSpending.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-xs text-gray-600">Optimized</p>
                        <p className="font-semibold text-green-600">${opp.optimizedSpending.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-xs text-gray-600">Savings</p>
                        <p className="font-semibold text-blue-600">${opp.savings.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                        <Lightbulb size={14} />
                        Action Steps:
                      </p>
                      <ul className="space-y-1">
                        {opp.actionSteps.map((step, i) => (
                          <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 text-xs text-gray-600">
                        <Target size={12} className="inline mr-1" />
                        Timeframe: {opp.timeframe}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onApply?.(opp);
                    onClose();
                  }}
                  className="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Apply Optimization
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AIExpenseOptimization;

