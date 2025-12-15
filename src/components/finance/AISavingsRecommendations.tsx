import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, PiggyBank, TrendingUp, Target, CheckCircle, X, Lightbulb } from 'lucide-react';
import { Transaction } from '../../services/financeAPI';

interface SavingsRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  currentSpending: number;
  potentialSavings: number;
  actionSteps: string[];
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
}

interface AISavingsRecommendationsProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onApply?: (recommendation: SavingsRecommendation) => void;
}

const AISavingsRecommendations: React.FC<AISavingsRecommendationsProps> = ({
  isOpen,
  onClose,
  transactions,
  onApply
}) => {
  const [recommendations, setRecommendations] = useState<SavingsRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && transactions.length > 0) {
      generateRecommendations();
    }
  }, [isOpen, transactions]);

  const generateRecommendations = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    const newRecommendations: SavingsRecommendation[] = [];

    // Subscription Analysis
    const subscriptions = expenses.filter(t => 
      t.description.toLowerCase().includes('subscription') ||
      t.description.toLowerCase().includes('netflix') ||
      t.description.toLowerCase().includes('spotify') ||
      t.description.toLowerCase().includes('premium')
    );
    const subscriptionTotal = subscriptions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    if (subscriptionTotal > 50) {
      newRecommendations.push({
        id: 'subscriptions',
        title: 'Reduce Subscription Costs',
        description: `You're spending $${subscriptionTotal.toFixed(2)}/month on subscriptions. Review and cancel unused services.`,
        category: 'Subscriptions',
        currentSpending: subscriptionTotal,
        potentialSavings: subscriptionTotal * 0.3,
        actionSteps: [
          'Review all active subscriptions',
          'Cancel services you rarely use',
          'Consider family plans for shared services',
          'Set reminders to review quarterly'
        ],
        priority: 'high',
        timeframe: 'Immediate'
      });
    }

    // Dining Out Analysis
    const diningOut = expenses.filter(t => 
      t.category === 'food_dining' && 
      (t.description.toLowerCase().includes('restaurant') ||
       t.description.toLowerCase().includes('cafe') ||
       t.description.toLowerCase().includes('delivery'))
    );
    const diningTotal = diningOut.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    if (diningTotal > 200) {
      newRecommendations.push({
        id: 'dining',
        title: 'Reduce Dining Out',
        description: `You're spending $${diningTotal.toFixed(2)}/month on dining out. Cooking at home more often could save significant money.`,
        category: 'Food & Dining',
        currentSpending: diningTotal,
        potentialSavings: diningTotal * 0.4,
        actionSteps: [
          'Plan weekly meal prep',
          'Limit dining out to weekends',
          'Use grocery delivery for convenience',
          'Try batch cooking recipes'
        ],
        priority: 'medium',
        timeframe: '1-2 weeks'
      });
    }

    // Low Savings Rate
    if (savingsRate < 20 && totalIncome > 0) {
      newRecommendations.push({
        id: 'savings_rate',
        title: 'Increase Savings Rate',
        description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 20% to build financial security.`,
        category: 'General Savings',
        currentSpending: totalExpenses,
        potentialSavings: totalIncome * 0.2 - (totalIncome - totalExpenses),
        actionSteps: [
          'Set up automatic transfers to savings',
          'Follow the 50/30/20 budget rule',
          'Track expenses daily',
          'Review and adjust monthly'
        ],
        priority: 'high',
        timeframe: '1 month'
      });
    }

    // Impulse Purchases
    const shopping = expenses.filter(t => t.category === 'shopping');
    const shoppingTotal = shopping.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    if (shoppingTotal > 150) {
      newRecommendations.push({
        id: 'shopping',
        title: 'Reduce Impulse Purchases',
        description: `You're spending $${shoppingTotal.toFixed(2)}/month on shopping. Implement a 24-hour rule for non-essential purchases.`,
        category: 'Shopping',
        currentSpending: shoppingTotal,
        potentialSavings: shoppingTotal * 0.25,
        actionSteps: [
          'Wait 24 hours before making purchases',
          'Create a shopping list and stick to it',
          'Unsubscribe from promotional emails',
          'Use cash for discretionary spending'
        ],
        priority: 'medium',
        timeframe: '2 weeks'
      });
    }

    setRecommendations(newRecommendations.sort((a, b) => b.potentialSavings - a.potentialSavings));
    setLoading(false);
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
            <h2 className="text-xl font-semibold">AI Savings Recommendations</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-gray-600">Analyzing your spending...</span>
            </div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <PiggyBank className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No savings recommendations available at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-900">Total Potential Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${recommendations.reduce((sum, r) => sum + r.potentialSavings, 0).toFixed(2)}/month
                  </p>
                </div>
                <PiggyBank className="text-green-600" size={32} />
              </div>
            </div>

            {recommendations.map((rec) => (
              <div key={rec.id} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{rec.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600">Current</p>
                        <p className="font-semibold">${rec.currentSpending.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-xs text-gray-600">Potential Savings</p>
                        <p className="font-semibold text-green-600">${rec.potentialSavings.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-xs text-gray-600">Timeframe</p>
                        <p className="font-semibold text-blue-600">{rec.timeframe}</p>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                        <Lightbulb size={14} />
                        Action Steps:
                      </p>
                      <ul className="space-y-1">
                        {rec.actionSteps.map((step, i) => (
                          <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onApply?.(rec);
                    onClose();
                  }}
                  className="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Apply Recommendation
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AISavingsRecommendations;

