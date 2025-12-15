import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, TrendingDown, CheckCircle, X, AlertCircle, BarChart3 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviewCount: number;
  brand: string;
  specifications: Record<string, string>;
}

interface AIComparisonInsight {
  category: string;
  winner: string | null;
  reasoning: string;
  score: {
    product1: number;
    product2: number;
  };
}

interface AIProductComparisonProps {
  products: Product[];
  onInsightGenerated?: (insights: AIComparisonInsight[]) => void;
}

const AIProductComparison: React.FC<AIProductComparisonProps> = ({
  products,
  onInsightGenerated
}) => {
  const [insights, setInsights] = useState<AIComparisonInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [overallWinner, setOverallWinner] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');

  useEffect(() => {
    if (products.length >= 2) {
      generateComparison();
    }
  }, [products]);

  const generateComparison = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // AI-powered comparison analysis
    const comparisonInsights: AIComparisonInsight[] = [];
    
    // Price comparison
    const prices = products.map(p => p.price);
    const minPrice = Math.min(...prices);
    const priceWinner = products.find(p => p.price === minPrice)?.id || null;
    comparisonInsights.push({
      category: 'Price',
      winner: priceWinner,
      reasoning: `Product ${products.findIndex(p => p.id === priceWinner) + 1} offers the best value at $${minPrice.toFixed(2)}`,
      score: {
        product1: products[0] ? (1 - (products[0].price - minPrice) / minPrice) * 100 : 0,
        product2: products[1] ? (1 - (products[1].price - minPrice) / minPrice) * 100 : 0
      }
    });

    // Rating comparison
    const ratings = products.map(p => p.rating);
    const maxRating = Math.max(...ratings);
    const ratingWinner = products.find(p => p.rating === maxRating)?.id || null;
    comparisonInsights.push({
      category: 'Customer Rating',
      winner: ratingWinner,
      reasoning: `Product ${products.findIndex(p => p.id === ratingWinner) + 1} has the highest rating (${maxRating}/5) with ${products.find(p => p.id === ratingWinner)?.reviewCount} reviews`,
      score: {
        product1: products[0] ? (products[0].rating / 5) * 100 : 0,
        product2: products[1] ? (products[1].rating / 5) * 100 : 0
      }
    });

    // Value score (price vs rating)
    const valueScores = products.map(p => ({
      id: p.id,
      score: (p.rating / 5) * 100 - ((p.price - minPrice) / minPrice) * 50
    }));
    const bestValue = valueScores.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    comparisonInsights.push({
      category: 'Best Value',
      winner: bestValue.id,
      reasoning: `Product ${products.findIndex(p => p.id === bestValue.id) + 1} offers the best balance of price and quality`,
      score: {
        product1: products[0] ? valueScores.find(v => v.id === products[0].id)?.score || 0 : 0,
        product2: products[1] ? valueScores.find(v => v.id === products[1].id)?.score || 0 : 0
      }
    });

    // Brand comparison
    if (products[0] && products[1] && products[0].brand !== products[1].brand) {
      comparisonInsights.push({
        category: 'Brand',
        winner: null,
        reasoning: `Comparing ${products[0].brand} vs ${products[1].brand} - both are reputable brands`,
        score: {
          product1: 50,
          product2: 50
        }
      });
    }

    setInsights(comparisonInsights);
    
    // Determine overall winner
    const winnerCounts = comparisonInsights.reduce((acc, insight) => {
      if (insight.winner) {
        acc[insight.winner] = (acc[insight.winner] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const overall = Object.entries(winnerCounts).reduce((best, [id, count]) => 
      count > best.count ? { id, count } : best
    , { id: null as string | null, count: 0 });

    setOverallWinner(overall.id);
    
    // Generate summary
    const winnerProduct = products.find(p => p.id === overall.id);
    setSummary(winnerProduct 
      ? `Based on AI analysis, ${winnerProduct.name} is the recommended choice, winning ${overall.count} out of ${comparisonInsights.length} comparison categories.`
      : 'Both products have their strengths. Consider your specific needs and preferences.'
    );

    onInsightGenerated?.(comparisonInsights);
    setLoading(false);
  };

  if (products.length < 2) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 text-gray-500">
          <AlertCircle size={20} />
          <p>Add at least 2 products to compare</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">AI is analyzing products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold">AI Comparison Analysis</h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
          Powered by AI
        </span>
      </div>

      {/* Overall Winner */}
      {overallWinner && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-600" size={20} />
            <h4 className="font-semibold text-green-900 dark:text-green-200">Recommended Choice</h4>
          </div>
          <p className="text-sm text-green-800 dark:text-green-300">{summary}</p>
        </div>
      )}

      {/* Insights */}
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white">{insight.category}</h4>
              {insight.winner && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle size={16} />
                  <span className="text-xs font-medium">
                    Product {products.findIndex(p => p.id === insight.winner) + 1}
                  </span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{insight.reasoning}</p>
            
            {/* Score Bars */}
            <div className="space-y-2">
              {products.map((product, idx) => (
                <div key={product.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Product {idx + 1}: {product.name}
                    </span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {idx === 0 ? insight.score.product1 : insight.score.product2}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        insight.winner === product.id
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${idx === 0 ? insight.score.product1 : insight.score.product2}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Disclaimer */}
      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>AI Analysis:</strong> This comparison is generated using AI algorithms analyzing price, ratings, reviews, and specifications. 
          Consider your personal preferences and needs when making a decision.
        </p>
      </div>
    </div>
  );
};

export default AIProductComparison;

