import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, RefreshCw, X } from 'lucide-react';
import { Transaction, Budget, FinancialGoal } from '../../services/financeAPI';

interface FinancialInsight {
  id: string;
  type: 'spending' | 'savings' | 'budget' | 'investment' | 'debt' | 'goal';
  title: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

interface AIFinancialInsightsProps {
  transactions?: Transaction[];
  budgets?: Budget[];
  goals?: FinancialGoal[];
  onInsightAction?: (insight: FinancialInsight) => void;
  limit?: number;
}

const AIFinancialInsights: React.FC<AIFinancialInsightsProps> = ({
  transactions = [],
  budgets = [],
  goals = [],
  onInsightAction,
  limit = 5
}) => {
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateInsights();
  }, [transactions, budgets, goals]);

  const generateInsights = async () => {
    setLoading(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newInsights: FinancialInsight[] = [];

    // Spending Pattern Analysis
    if (transactions.length > 0) {
      const expenses = transactions.filter(t => t.type === 'expense');
      const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const avgExpense = totalExpenses / expenses.length;

      if (avgExpense > 100) {
        newInsights.push({
          id: '1',
          type: 'spending',
          title: 'High Average Transaction',
          message: `Your average transaction is $${avgExpense.toFixed(2)}. Consider reviewing larger expenses for optimization opportunities.`,
          impact: 'medium',
          actionable: true,
          actionLabel: 'Review Expenses'
        });
      }

      // Category Analysis
      const categoryTotals = expenses.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);

      const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
      if (topCategory && topCategory[1] > totalExpenses * 0.3) {
        newInsights.push({
          id: '2',
          type: 'spending',
          title: 'Category Concentration',
          message: `${topCategory[0].replace('_', ' ')} accounts for ${((topCategory[1] / totalExpenses) * 100).toFixed(1)}% of your expenses. Consider diversifying spending.`,
          impact: 'high',
          actionable: true,
          actionLabel: 'View Breakdown'
        });
      }
    }

    // Budget Analysis
    if (budgets.length > 0) {
      const overBudget = budgets.filter(b => b.spent > b.amount);
      if (overBudget.length > 0) {
        newInsights.push({
          id: '3',
          type: 'budget',
          title: 'Budget Alerts',
          message: `You're over budget in ${overBudget.length} category${overBudget.length > 1 ? 'ies' : ''}. Review your spending to get back on track.`,
          impact: 'high',
          actionable: true,
          actionLabel: 'View Budgets'
        });
      }
    }

    // Savings Analysis
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    if (savingsRate < 20 && income > 0) {
      newInsights.push({
        id: '4',
        type: 'savings',
        title: 'Low Savings Rate',
        message: `Your savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 20% to build a strong financial foundation.`,
        impact: 'high',
        actionable: true,
        actionLabel: 'Improve Savings'
      });
    }

    // Goal Progress
    if (goals.length > 0) {
      const atRiskGoals = goals.filter(g => {
        const progress = (g.current_amount / g.target_amount) * 100;
        const daysRemaining = (new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return progress < 50 && daysRemaining < 90;
      });

      if (atRiskGoals.length > 0) {
        newInsights.push({
          id: '5',
          type: 'goal',
          title: 'Goals at Risk',
          message: `${atRiskGoals.length} financial goal${atRiskGoals.length > 1 ? 's are' : ' is'} at risk of not being met. Consider adjusting your strategy.`,
          impact: 'high',
          actionable: true,
          actionLabel: 'Review Goals'
        });
      }
    }

    setInsights(newInsights.slice(0, limit));
    setLoading(false);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'spending':
        return <TrendingDown className="text-red-600" size={20} />;
      case 'savings':
        return <TrendingUp className="text-green-600" size={20} />;
      case 'budget':
        return <AlertTriangle className="text-yellow-600" size={20} />;
      case 'investment':
        return <TrendingUp className="text-blue-600" size={20} />;
      case 'debt':
        return <AlertTriangle className="text-red-600" size={20} />;
      case 'goal':
        return <Lightbulb className="text-purple-600" size={20} />;
      default:
        return <Brain className="text-gray-600" size={20} />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Analyzing your finances...</span>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Brain className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No insights available at this time</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => (
        <motion.div
          key={insight.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`border-2 rounded-lg p-4 ${getImpactColor(insight.impact)}`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
              <p className="text-sm text-gray-700">{insight.message}</p>
              {insight.actionable && insight.actionLabel && (
                <button
                  onClick={() => onInsightAction?.(insight)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {insight.actionLabel} →
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AIFinancialInsights;

