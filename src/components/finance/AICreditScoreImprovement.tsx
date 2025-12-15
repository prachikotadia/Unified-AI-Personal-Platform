import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, CheckCircle, X, AlertTriangle, Target, Calendar } from 'lucide-react';
import { CreditScoreData } from '../../services/bankIntegration';
import { DebtTracker, Transaction } from '../../services/financeAPI';

interface ImprovementTip {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  actionSteps: string[];
  estimatedPoints: number;
}

interface AICreditScoreImprovementProps {
  isOpen: boolean;
  onClose: () => void;
  creditScore?: CreditScoreData | null;
  debts?: DebtTracker[];
  transactions?: Transaction[];
  onApply?: (tip: ImprovementTip) => void;
}

const AICreditScoreImprovement: React.FC<AICreditScoreImprovementProps> = ({
  isOpen,
  onClose,
  creditScore,
  debts = [],
  transactions = [],
  onApply
}) => {
  const [tips, setTips] = useState<ImprovementTip[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      generateTips();
    }
  }, [isOpen, creditScore, debts, transactions]);

  const generateTips = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newTips: ImprovementTip[] = [];
    const currentScore = creditScore?.score || 650;
    const scoreRange = creditScore?.range || 'fair';

    // Payment History Tips
    if (scoreRange === 'poor' || scoreRange === 'fair') {
      newTips.push({
        id: 'payment_history',
        title: 'Improve Payment History',
        description: 'Payment history is the most important factor in your credit score. Always pay bills on time.',
        impact: 'high',
        timeframe: '3-6 months',
        actionSteps: [
          'Set up automatic payments for all bills',
          'Create payment reminders in your calendar',
          'Pay at least the minimum amount on time',
          'Consider using bill pay services'
        ],
        estimatedPoints: 20
      });
    }

    // Credit Utilization
    const creditCards = debts.filter(d => d.debt_type === 'credit_card');
    const totalCreditLimit = creditCards.reduce((sum, d) => sum + (d.original_amount || 0), 0);
    const totalBalance = creditCards.reduce((sum, d) => sum + d.current_balance, 0);
    const utilization = totalCreditLimit > 0 ? (totalBalance / totalCreditLimit) * 100 : 0;

    if (utilization > 30) {
      newTips.push({
        id: 'credit_utilization',
        title: 'Reduce Credit Utilization',
        description: `Your credit utilization is ${utilization.toFixed(1)}%. Aim to keep it below 30% for optimal credit health.`,
        impact: 'high',
        timeframe: '1-2 months',
        actionSteps: [
          `Pay down ${(totalBalance - totalCreditLimit * 0.3).toFixed(0)} to get below 30%`,
          'Make multiple payments per month',
          'Avoid maxing out credit cards',
          'Consider requesting credit limit increases'
        ],
        estimatedPoints: 15
      });
    }

    // Debt Payoff
    const highInterestDebts = debts.filter(d => d.interest_rate > 15);
    if (highInterestDebts.length > 0) {
      newTips.push({
        id: 'debt_payoff',
        title: 'Pay Off High-Interest Debt',
        description: `You have ${highInterestDebts.length} high-interest debt${highInterestDebts.length > 1 ? 's' : ''}. Paying these off will improve your credit score.`,
        impact: 'high',
        timeframe: '6-12 months',
        actionSteps: [
          'Focus on highest interest rate debts first',
          'Consider debt consolidation',
          'Make extra payments when possible',
          'Avoid taking on new debt'
        ],
        estimatedPoints: 10
      });
    }

    // Credit Mix
    if (creditCards.length === 0 && debts.length > 0) {
      newTips.push({
        id: 'credit_mix',
        title: 'Diversify Credit Types',
        description: 'Having a mix of credit types (credit cards, loans) can improve your score.',
        impact: 'medium',
        timeframe: '6-12 months',
        actionSteps: [
          'Consider a secured credit card if needed',
          'Use credit cards responsibly',
          'Maintain a good mix of credit types',
          'Don\'t open too many accounts at once'
        ],
        estimatedPoints: 5
      });
    }

    // Length of Credit History
    if (currentScore < 700) {
      newTips.push({
        id: 'credit_history',
        title: 'Build Credit History',
        description: 'A longer credit history demonstrates reliability to lenders.',
        impact: 'medium',
        timeframe: '12+ months',
        actionSteps: [
          'Keep oldest accounts open',
          'Use credit cards regularly but pay in full',
          'Avoid closing old accounts',
          'Be patient - history takes time to build'
        ],
        estimatedPoints: 8
      });
    }

    // New Credit Applications
    newTips.push({
      id: 'new_credit',
      title: 'Limit New Credit Applications',
      description: 'Too many hard inquiries in a short time can lower your score.',
      impact: 'low',
      timeframe: 'Immediate',
      actionSteps: [
        'Space out credit applications',
        'Only apply when necessary',
        'Check if pre-qualification is available',
        'Monitor your credit report regularly'
      ],
      estimatedPoints: 3
    });

    setTips(newTips.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    }));
    setLoading(false);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
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
            <h2 className="text-xl font-semibold">AI Credit Score Improvement Tips</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-gray-600">Analyzing your credit profile...</span>
            </div>
          </div>
        ) : tips.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No improvement tips available at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {creditScore && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current Credit Score</p>
                    <p className="text-3xl font-bold text-blue-600">{creditScore.score}</p>
                    <p className="text-sm text-gray-600 capitalize mt-1">{creditScore.range.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Potential Improvement</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{tips.reduce((sum, t) => sum + t.estimatedPoints, 0)} points
                    </p>
                    <p className="text-xs text-gray-600 mt-1">If all tips are followed</p>
                  </div>
                </div>
              </div>
            )}

            {tips.map((tip) => (
              <div key={tip.id} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{tip.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(tip.impact)}`}>
                        {tip.impact.toUpperCase()} IMPACT
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        +{tip.estimatedPoints} points
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{tip.description}</p>
                    
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        <span>Timeframe: {tip.timeframe}</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                        <Target size={14} />
                        Action Steps:
                      </p>
                      <ul className="space-y-1">
                        {tip.actionSteps.map((step, i) => (
                          <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                            <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onApply?.(tip);
                    onClose();
                  }}
                  className="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Get Started
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AICreditScoreImprovement;

