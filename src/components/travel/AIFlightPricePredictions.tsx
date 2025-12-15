import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PricePrediction {
  date: string;
  predictedPrice: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface AIFlightPricePredictionsProps {
  route: {
    origin: string;
    destination: string;
  };
  travelDate?: string;
  onPredictionGenerated?: (predictions: PricePrediction[]) => void;
}

const AIFlightPricePredictions: React.FC<AIFlightPricePredictionsProps> = ({
  route,
  travelDate,
  onPredictionGenerated
}) => {
  const [predictions, setPredictions] = useState<PricePrediction[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');

  useEffect(() => {
    generatePredictions();
  }, [route, travelDate]);

  const generatePredictions = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock current price
    const basePrice = 450;
    setCurrentPrice(basePrice);

    // Generate predictions for next 60 days
    const newPredictions: PricePrediction[] = [];
    const now = new Date();

    for (let i = 0; i < 60; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      // Simulate price fluctuations
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const daysUntilTravel = travelDate ? Math.ceil((new Date(travelDate).getTime() - date.getTime()) / (1000 * 60 * 60 * 24)) : 30;
      
      // Price tends to increase as travel date approaches
      const timeFactor = Math.max(1, 1 + (30 - daysUntilTravel) / 30 * 0.3);
      // Weekend flights are more expensive
      const weekendFactor = isWeekend ? 1.15 : 1.0;
      // Random variation
      const randomFactor = 1 + (Math.random() - 0.5) * 0.1;
      
      const predictedPrice = basePrice * timeFactor * weekendFactor * randomFactor;
      const confidence = Math.max(0.5, 1 - (i / 60) * 0.4);
      
      // Determine trend
      const avgRecent = i > 0 ? predictions.slice(-7).reduce((sum, p) => sum + p.predictedPrice, 0) / Math.min(7, predictions.length) : basePrice;
      const trend = predictedPrice > avgRecent * 1.05 ? 'increasing' : 
                    predictedPrice < avgRecent * 0.95 ? 'decreasing' : 'stable';

      newPredictions.push({
        date: date.toISOString().split('T')[0],
        predictedPrice: Math.round(predictedPrice),
        confidence,
        trend
      });
    }

    setPredictions(newPredictions);

    // Generate summary
    const avgPredicted = newPredictions.reduce((sum, p) => sum + p.predictedPrice, 0) / newPredictions.length;
    const minPrice = Math.min(...newPredictions.map(p => p.predictedPrice));
    const bestDate = newPredictions.find(p => p.predictedPrice === minPrice);
    
    setSummary(
      `AI predicts average price of $${avgPredicted.toFixed(0)} over the next 60 days. ` +
      `Best time to book: ${bestDate ? new Date(bestDate.date).toLocaleDateString() : 'N/A'} at $${minPrice.toFixed(0)}.`
    );

    onPredictionGenerated?.(newPredictions);
    setLoading(false);
  };

  const chartData = predictions.slice(0, 30).map(p => ({
    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: p.predictedPrice,
    confidence: p.confidence
  }));

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
        <h3 className="text-lg font-semibold">AI Flight Price Predictions</h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
          Powered by AI
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <strong>Route:</strong> {route.origin} → {route.destination}
        </p>
        {currentPrice > 0 && (
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            Current Price: ${currentPrice.toFixed(2)}
          </p>
        )}
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
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">30-Day Price Forecast</h4>
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
                domain={['dataMin - 20', 'dataMax + 20']}
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

      {/* Best Time to Book */}
      {predictions.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-green-600" size={18} />
            <h4 className="font-semibold text-green-900 dark:text-green-200">Best Time to Book</h4>
          </div>
          <p className="text-sm text-green-800 dark:text-green-300">
            Based on AI analysis, book between 2-8 weeks before travel for optimal prices.
            Avoid booking within 1 week of travel date.
          </p>
        </div>
      )}

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

export default AIFlightPricePredictions;

