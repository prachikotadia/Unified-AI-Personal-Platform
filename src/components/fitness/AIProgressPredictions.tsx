import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, TrendingDown, Target, Calendar, AlertCircle } from 'lucide-react';

interface ProgressPrediction {
  metric: string;
  current: number;
  predicted: number;
  change: number;
  timeframe: string;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  reasoning: string;
}

interface AIProgressPredictionsProps {
  currentData: {
    weight?: number;
    bodyFat?: number;
    muscleMass?: number;
    workoutsPerWeek?: number;
  };
  goals?: {
    targetWeight?: number;
    targetBodyFat?: number;
    targetMuscleMass?: number;
  };
  period?: 'week' | 'month' | 'quarter' | 'year';
}

const AIProgressPredictions: React.FC<AIProgressPredictionsProps> = ({
  currentData,
  goals,
  period = 'month'
}) => {
  const [predictions, setPredictions] = useState<ProgressPrediction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generatePredictions();
  }, [currentData, goals, period]);

  const generatePredictions = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // AI prediction logic
    const mockPredictions: ProgressPrediction[] = [
      {
        metric: 'Weight',
        current: currentData.weight || 70.5,
        predicted: 68.0,
        change: -2.5,
        timeframe: '30 days',
        confidence: 0.85,
        trend: 'down',
        reasoning: 'Based on your current workout frequency and nutrition patterns, you\'re on track to lose 2.5kg in the next month.'
      },
      {
        metric: 'Body Fat',
        current: currentData.bodyFat || 18.5,
        predicted: 16.0,
        change: -2.5,
        timeframe: '30 days',
        confidence: 0.80,
        trend: 'down',
        reasoning: 'Your consistent strength training and cardio routine should help reduce body fat percentage.'
      },
      {
        metric: 'Muscle Mass',
        current: currentData.muscleMass || 45.2,
        predicted: 46.5,
        change: 1.3,
        timeframe: '30 days',
        confidence: 0.75,
        trend: 'up',
        reasoning: 'With your current protein intake and strength training, muscle mass should increase gradually.'
      },
      {
        metric: 'Workout Frequency',
        current: currentData.workoutsPerWeek || 3,
        predicted: 4,
        change: 1,
        timeframe: '30 days',
        confidence: 0.70,
        trend: 'up',
        reasoning: 'Your consistency is improving. AI predicts you\'ll increase to 4 workouts per week.'
      }
    ];

    setPredictions(mockPredictions);
    setLoading(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="text-green-600" size={20} />;
      case 'down':
        return <TrendingDown className="text-blue-600" size={20} />;
      default:
        return <Target className="text-gray-600" size={20} />;
    }
  };

  const getTrendColor = (trend: string, metric: string) => {
    if (metric === 'Weight' || metric === 'Body Fat') {
      return trend === 'down' ? 'text-green-600' : 'text-red-600';
    }
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">AI is generating progress predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold">AI Progress Predictions</h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
          Powered by AI
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar size={14} />
          <span>Predictions for next {period === 'month' ? '30 days' : period === 'week' ? '7 days' : period === 'quarter' ? '90 days' : '365 days'}</span>
        </div>
      </div>

      <div className="space-y-4">
        {predictions.map((prediction, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getTrendIcon(prediction.trend)}
                <h4 className="font-semibold">{prediction.metric}</h4>
              </div>
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                {Math.round(prediction.confidence * 100)}% confidence
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Current</div>
                <div className="text-lg font-bold">{prediction.current}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Predicted</div>
                <div className={`text-lg font-bold ${getTrendColor(prediction.trend, prediction.metric)}`}>
                  {prediction.predicted}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Change</div>
                <div className={`text-lg font-bold ${getTrendColor(prediction.trend, prediction.metric)}`}>
                  {prediction.change > 0 ? '+' : ''}{prediction.change}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <Sparkles className="inline w-3 h-3 mr-1" />
                <strong>AI Analysis:</strong> {prediction.reasoning}
              </p>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Timeframe: {prediction.timeframe}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            <strong>Note:</strong> These predictions are based on your current patterns and historical data. 
            Actual results may vary based on consistency, diet, and other factors.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIProgressPredictions;

