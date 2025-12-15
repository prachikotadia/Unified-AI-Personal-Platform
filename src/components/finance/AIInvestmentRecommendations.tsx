import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, BarChart3, CheckCircle, X, Star } from 'lucide-react';
import { Investment } from '../../services/financeAPI';

interface InvestmentRecommendation {
  id: string;
  type: 'diversification' | 'rebalancing' | 'new_investment' | 'risk_adjustment';
  title: string;
  description: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  potentialReturn?: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface AIInvestmentRecommendationsProps {
  isOpen: boolean;
  onClose: () => void;
  investments?: Investment[];
  onApply?: (recommendation: InvestmentRecommendation) => void;
}

const AIInvestmentRecommendations: React.FC<AIInvestmentRecommendationsProps> = ({
  isOpen,
  onClose,
  investments = [],
  onApply
}) => {
  const [recommendations, setRecommendations] = useState<InvestmentRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      generateRecommendations();
    }
  }, [isOpen, investments]);

  const generateRecommendations = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newRecommendations: InvestmentRecommendation[] = [];

    // Portfolio Analysis
    const totalValue = investments.reduce((sum, inv) => sum + inv.current_value, 0);
    const typeDistribution = investments.reduce((acc, inv) => {
      acc[inv.investment_type] = (acc[inv.investment_type] || 0) + inv.current_value;
      return acc;
    }, {} as Record<string, number>);

    // Diversification Check
    const stocksPercentage = (typeDistribution['stocks'] || 0) / totalValue;
    if (stocksPercentage > 0.8 && totalValue > 0) {
      newRecommendations.push({
        id: 'diversification',
        type: 'diversification',
        title: 'Portfolio Diversification',
        description: 'Your portfolio is heavily weighted in stocks (80%+). Consider adding bonds or ETFs for better diversification.',
        reasoning: 'A well-diversified portfolio reduces risk and can provide more stable returns over time.',
        priority: 'high',
        riskLevel: 'medium'
      });
    }

    // Rebalancing Opportunity
    const highPerformers = investments.filter(inv => {
      const returnPct = ((inv.current_value - inv.purchase_price) / inv.purchase_price) * 100;
      return returnPct > 30;
    });

    if (highPerformers.length > 0) {
      newRecommendations.push({
        id: 'rebalancing',
        type: 'rebalancing',
        title: 'Rebalancing Opportunity',
        description: `${highPerformers.length} investment${highPerformers.length > 1 ? 's have' : ' has'} performed exceptionally well. Consider taking some profits and rebalancing.`,
        reasoning: 'Rebalancing helps maintain your target asset allocation and locks in gains.',
        priority: 'medium',
        riskLevel: 'low'
      });
    }

    // Risk Assessment
    const highRiskInvestments = investments.filter(inv => inv.risk_level === 'high');
    if (highRiskInvestments.length / investments.length > 0.5 && investments.length > 0) {
      newRecommendations.push({
        id: 'risk_adjustment',
        type: 'risk_adjustment',
        title: 'High Risk Portfolio',
        description: 'Over 50% of your portfolio is in high-risk investments. Consider adding lower-risk options.',
        reasoning: 'Balancing risk helps protect your capital while still allowing for growth.',
        priority: 'high',
        riskLevel: 'medium'
      });
    }

    // New Investment Suggestion
    if (totalValue < 10000) {
      newRecommendations.push({
        id: 'new_investment',
        type: 'new_investment',
        title: 'Build Your Portfolio',
        description: 'Consider starting with low-cost index funds or ETFs to build a solid foundation.',
        reasoning: 'Index funds provide broad market exposure with lower fees and risk.',
        priority: 'medium',
        potentialReturn: 7,
        riskLevel: 'low'
      });
    }

    setRecommendations(newRecommendations);
    setLoading(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diversification':
        return <BarChart3 className="text-blue-600" size={20} />;
      case 'rebalancing':
        return <TrendingUp className="text-green-600" size={20} />;
      case 'new_investment':
        return <Star className="text-yellow-600" size={20} />;
      case 'risk_adjustment':
        return <TrendingDown className="text-red-600" size={20} />;
      default:
        return <Brain className="text-purple-600" size={20} />;
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
            <h2 className="text-xl font-semibold">AI Investment Recommendations</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-gray-600">Analyzing your portfolio...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>No investment recommendations available at this time</p>
              </div>
            ) : (
              recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getTypeIcon(rec.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{rec.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                      <p className="text-xs text-gray-600 mb-3">{rec.reasoning}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Risk Level: <span className="font-semibold capitalize">{rec.riskLevel}</span>
                        </span>
                        {rec.potentialReturn && (
                          <span className="text-gray-600">
                            Potential Return: <span className="font-semibold text-green-600">{rec.potentialReturn}%</span>
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          onApply?.(rec);
                          onClose();
                        }}
                        className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Apply Recommendation
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AIInvestmentRecommendations;

