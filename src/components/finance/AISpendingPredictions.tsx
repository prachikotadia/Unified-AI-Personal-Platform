import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Calendar, BarChart3, X } from 'lucide-react';
import { Transaction } from '../../services/financeAPI';

interface SpendingPrediction {
  period: string;
  predictedAmount: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: string[];
}

interface AISpendingPredictionsProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  period?: 'month' | 'quarter' | 'year';
}

const AISpendingPredictions: React.FC<AISpendingPredictionsProps> = ({
  isOpen,
  onClose,
  transactions,
  period = 'month'
}) => {
  const [predictions, setPredictions] = useState<SpendingPrediction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && transactions.length > 0) {
      generatePredictions();
    }
  }, [isOpen, transactions, period]);

  const generatePredictions = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Analyze historical spending
    const expenses = transactions.filter(t => t.type === 'expense');
    const monthlySpending = expenses.reduce((acc, t) => {
      const month = new Date(t.date).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const months = Object.keys(monthlySpending).sort().slice(-6);
    const amounts = months.map(m => monthlySpending[m]);
    const avgSpending = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    
    // Calculate trend
    const recentAvg = amounts.slice(-3).reduce((sum, a) => sum + a, 0) / 3;
    const earlierAvg = amounts.slice(0, 3).reduce((sum, a) => sum + a, 0) / 3;
    const trend = recentAvg > earlierAvg * 1.1 ? 'increasing' : 
                  recentAvg < earlierAvg * 0.9 ? 'decreasing' : 'stable';

    // Generate predictions for next periods
    const newPredictions: SpendingPrediction[] = [];
    const periods = period === 'month' ? 3 : period === 'quarter' ? 4 : 12;

    for (let i = 1; i <= periods; i++) {
      const futureDate = new Date();
      if (period === 'month') {
        futureDate.setMonth(futureDate.getMonth() + i);
      } else if (period === 'quarter') {
        futureDate.setMonth(futureDate.getMonth() + i * 3);
      } else {
        futureDate.setFullYear(futureDate.getFullYear() + i);
      }

      let predictedAmount = avgSpending;
      if (trend === 'increasing') {
        predictedAmount = avgSpending * (1 + 0.05 * i);
      } else if (trend === 'decreasing') {
        predictedAmount = avgSpending * (1 - 0.03 * i);
      }

      newPredictions.push({
        period: futureDate.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric',
          ...(period === 'quarter' && { month: 'long' })
        }),
        predictedAmount,
        confidence: Math.max(0.6, 1 - (i * 0.1)),
        trend,
        factors: [
          `Based on ${months.length} months of historical data`,
          trend === 'increasing' ? 'Spending trend is increasing' : 
          trend === 'decreasing' ? 'Spending trend is decreasing' : 
          'Spending trend is stable',
          `Average monthly spending: $${avgSpending.toFixed(2)}`
        ]
      });
    }

    setPredictions(newPredictions);
    setLoading(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="text-red-600" size={20} />;
      case 'decreasing':
        return <TrendingDown className="text-green-600" size={20} />;
      default:
        return <BarChart3 className="text-blue-600" size={20} />;
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
            <h2 className="text-xl font-semibold">AI Spending Predictions</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-gray-600">Analyzing spending patterns...</span>
            </div>
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>Not enough data for predictions</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>AI Analysis:</strong> Based on your historical spending patterns, 
                here are predictions for the next {period === 'month' ? '3 months' : 
                period === 'quarter' ? '4 quarters' : '12 months'}.
              </p>
            </div>

            {predictions.map((prediction, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getTrendIcon(prediction.trend)}
                    <div>
                      <h3 className="font-semibold">{prediction.period}</h3>
                      <p className="text-sm text-gray-600 capitalize">{prediction.trend} trend</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ${prediction.predictedAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {(prediction.confidence * 100).toFixed(0)}% confidence
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  {prediction.factors.map((factor, i) => (
                    <p key={i} className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      {factor}
                    </p>
                  ))}
                </div>

                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      prediction.trend === 'increasing' ? 'bg-red-500' :
                      prediction.trend === 'decreasing' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((prediction.predictedAmount / predictions[0].predictedAmount) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> These predictions are based on historical patterns and may not account for 
                unexpected events or changes in spending behavior.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AISpendingPredictions;

