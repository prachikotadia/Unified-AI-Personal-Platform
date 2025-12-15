import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Calendar, DollarSign, AlertCircle, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PriceHistory {
  date: string;
  price: number;
}

interface PricePrediction {
  date: string;
  predictedPrice: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface AIPricePredictionProps {
  productId: number;
  productName: string;
  currentPrice: number;
  onPredictionGenerated?: (prediction: PricePrediction[]) => void;
}

const AIPricePrediction: React.FC<AIPricePredictionProps> = ({
  productId,
  productName,
  currentPrice,
  onPredictionGenerated
}) => {
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [predictions, setPredictions] = useState<PricePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');

  useEffect(() => {
    generatePrediction();
  }, [productId, currentPrice]);

  const generatePrediction = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock historical price data
    const history: PriceHistory[] = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      history.push({
        date: date.toISOString().split('T')[0],
        price: currentPrice * (1 + variation)
      });
    }
    setPriceHistory(history);

    // AI prediction logic
    const recentPrices = history.slice(-7).map(h => h.price);
    const avgRecent = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
    const trend = avgRecent > currentPrice * 1.02 ? 'increasing' : 
                  avgRecent < currentPrice * 0.98 ? 'decreasing' : 'stable';

    // Generate predictions for next 30 days
    const futurePredictions: PricePrediction[] = [];
    const basePrice = currentPrice;
    const trendFactor = trend === 'increasing' ? 1.01 : trend === 'decreasing' ? 0.99 : 1.0;

    for (let i = 1; i <= 30; i++) {
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + i);
      
      // Simulate price movement with some randomness
      const predictedPrice = basePrice * Math.pow(trendFactor, i) * (1 + (Math.random() - 0.5) * 0.05);
      const confidence = Math.max(0.5, 1 - (i / 30) * 0.3); // Confidence decreases over time

      futurePredictions.push({
        date: futureDate.toISOString().split('T')[0],
        predictedPrice: Math.max(0, predictedPrice),
        confidence,
        trend
      });
    }

    setPredictions(futurePredictions);

    // Generate summary
    const avgPredicted = futurePredictions.reduce((sum, p) => sum + p.predictedPrice, 0) / futurePredictions.length;
    const change = ((avgPredicted - currentPrice) / currentPrice) * 100;
    
    if (Math.abs(change) < 2) {
      setSummary(`Prices are expected to remain relatively stable around $${currentPrice.toFixed(2)} over the next 30 days.`);
    } else {
      setSummary(
        `AI predicts prices will ${change > 0 ? 'increase' : 'decrease'} by approximately ${Math.abs(change).toFixed(1)}% ` +
        `over the next 30 days, with an average predicted price of $${avgPredicted.toFixed(2)}.`
      );
    }

    onPredictionGenerated?.(futurePredictions);
    setLoading(false);
  };

  const chartData = [
    ...priceHistory.map(h => ({
      date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: h.price,
      type: 'historical'
    })),
    ...predictions.slice(0, 7).map(p => ({
      date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: p.predictedPrice,
      type: 'predicted'
    }))
  ];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">AI is analyzing price trends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold">AI Price Prediction</h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
          Powered by AI
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <strong>Product:</strong> {productName}
        </p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          Current Price: ${currentPrice.toFixed(2)}
        </p>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">{summary}</p>
        </div>
      )}

      {/* Price Chart */}
      {chartData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Price Trend (30 days)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="currentColor" 
                className="opacity-20"
              />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="currentColor"
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="currentColor"
                className="text-muted-foreground"
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))', 
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                fillOpacity={0.3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Predictions Table */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">30-Day Forecast</h4>
        <div className="max-h-48 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Date</th>
                <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Predicted Price</th>
                <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Confidence</th>
                <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">Trend</th>
              </tr>
            </thead>
            <tbody>
              {predictions.slice(0, 10).map((prediction, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                    {new Date(prediction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                    ${prediction.predictedPrice.toFixed(2)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${prediction.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {Math.round(prediction.confidence * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {prediction.trend === 'increasing' ? (
                      <TrendingUp className="text-green-600" size={16} />
                    ) : prediction.trend === 'decreasing' ? (
                      <TrendingDown className="text-red-600" size={16} />
                    ) : (
                      <div className="w-4 h-4 bg-gray-400 rounded-full" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>AI Prediction:</strong> These predictions are based on historical price data and market trends. 
          Actual prices may vary. Use this information as a guide, not a guarantee.
        </p>
      </div>
    </div>
  );
};

export default AIPricePrediction;

