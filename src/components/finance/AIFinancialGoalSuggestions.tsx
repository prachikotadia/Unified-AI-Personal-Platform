import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, TrendingUp, CheckCircle, X, Calendar, DollarSign } from 'lucide-react';
import { Transaction, FinancialGoal } from '../../services/financeAPI';

interface GoalSuggestion {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  suggestedDeadline: string;
  monthlyContribution: number;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

interface AIFinancialGoalSuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  transactions?: Transaction[];
  existingGoals?: FinancialGoal[];
  onApply?: (suggestion: GoalSuggestion) => void;
}

const AIFinancialGoalSuggestions: React.FC<AIFinancialGoalSuggestionsProps> = ({
  isOpen,
  onClose,
  transactions = [],
  existingGoals = [],
  onApply
}) => {
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      generateSuggestions();
    }
  }, [isOpen, transactions, existingGoals]);

  const generateSuggestions = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const monthlyIncome = income / Math.max(1, transactions.length / 30);
    const monthlySavings = monthlyIncome - expenses;

    const newSuggestions: GoalSuggestion[] = [];
    const existingGoalCategories = existingGoals.map(g => g.category);

    // Emergency Fund
    if (!existingGoalCategories.includes('emergency')) {
      const emergencyTarget = monthlyIncome * 6; // 6 months of income
      newSuggestions.push({
        id: 'emergency',
        name: 'Emergency Fund',
        category: 'emergency',
        targetAmount: emergencyTarget,
        suggestedDeadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        monthlyContribution: monthlySavings * 0.3,
        reasoning: 'An emergency fund covering 6 months of expenses provides financial security and peace of mind.',
        priority: 'high',
        icon: '🛡️'
      });
    }

    // Retirement Savings
    if (!existingGoalCategories.includes('retirement')) {
      const retirementTarget = monthlyIncome * 12 * 10; // 10 years of income
      newSuggestions.push({
        id: 'retirement',
        name: 'Retirement Savings',
        category: 'investment',
        targetAmount: retirementTarget,
        suggestedDeadline: new Date(Date.now() + 30 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        monthlyContribution: monthlySavings * 0.2,
        reasoning: 'Starting early with retirement savings allows compound interest to work in your favor.',
        priority: 'high',
        icon: '🏖️'
      });
    }

    // Debt Payoff
    if (!existingGoalCategories.includes('debt')) {
      newSuggestions.push({
        id: 'debt_payoff',
        name: 'Debt Freedom',
        category: 'debt',
        targetAmount: 10000,
        suggestedDeadline: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        monthlyContribution: monthlySavings * 0.25,
        reasoning: 'Paying off high-interest debt should be a priority to reduce financial stress.',
        priority: 'high',
        icon: '💳'
      });
    }

    // Vacation Fund
    if (!existingGoalCategories.includes('travel')) {
      newSuggestions.push({
        id: 'vacation',
        name: 'Dream Vacation',
        category: 'purchase',
        targetAmount: 5000,
        suggestedDeadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        monthlyContribution: monthlySavings * 0.15,
        reasoning: 'Setting aside money for experiences like vacations can improve quality of life.',
        priority: 'medium',
        icon: '✈️'
      });
    }

    // Home Down Payment
    if (!existingGoalCategories.includes('home')) {
      newSuggestions.push({
        id: 'home',
        name: 'Home Down Payment',
        category: 'purchase',
        targetAmount: 50000,
        suggestedDeadline: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        monthlyContribution: monthlySavings * 0.2,
        reasoning: 'Saving for a home down payment is a significant financial milestone.',
        priority: 'medium',
        icon: '🏠'
      });
    }

    setSuggestions(newSuggestions);
    setLoading(false);
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
            <h2 className="text-xl font-semibold">AI Financial Goal Suggestions</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-gray-600">Analyzing your financial situation...</span>
            </div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No goal suggestions available at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>AI Analysis:</strong> Based on your financial profile, here are personalized goal suggestions 
                to help you achieve financial success.
              </p>
            </div>

            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{suggestion.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{suggestion.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                        suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {suggestion.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{suggestion.reasoning}</p>
                    
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <DollarSign size={16} className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-600">Target</p>
                          <p className="font-semibold">${suggestion.targetAmount.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <TrendingUp size={16} className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-600">Monthly</p>
                          <p className="font-semibold">${suggestion.monthlyContribution.toFixed(0)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Calendar size={16} className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-600">Deadline</p>
                          <p className="font-semibold text-xs">
                            {new Date(suggestion.suggestedDeadline).toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onApply?.(suggestion);
                        onClose();
                      }}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Create This Goal
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AIFinancialGoalSuggestions;

