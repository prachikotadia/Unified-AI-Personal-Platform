import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Sparkles, TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle } from 'lucide-react';

interface AIProgressAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  progressData: {
    weight?: { current: number; previous: number; goal: number }[];
    workouts?: { date: string; count: number }[];
    nutrition?: { date: string; calories: number }[];
    period: string;
  };
}

const AIProgressAnalysisModal: React.FC<AIProgressAnalysisModalProps> = ({
  isOpen,
  onClose,
  progressData
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      generateAnalysis();
    }
  }, [isOpen]);

  const generateAnalysis = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // AI analysis logic
    const mockAnalysis = {
      overallTrend: 'positive',
      insights: [
        {
          type: 'positive',
          title: 'Consistent Weight Loss',
          description: 'You\'ve been losing weight consistently over the past month. Great job maintaining your routine!',
          icon: TrendingDown
        },
        {
          type: 'warning',
          title: 'Workout Frequency',
          description: 'Your workout frequency has decreased slightly. Consider maintaining at least 3-4 workouts per week.',
          icon: AlertCircle
        },
        {
          type: 'positive',
          title: 'Nutrition Balance',
          description: 'Your nutrition intake is well-balanced and aligned with your goals.',
          icon: CheckCircle
        }
      ],
      predictions: [
        {
          metric: 'Weight',
          current: 70.5,
          predicted: 68.0,
          timeframe: '30 days',
          confidence: 0.85
        },
        {
          metric: 'Body Fat',
          current: 18.5,
          predicted: 16.0,
          timeframe: '30 days',
          confidence: 0.80
        }
      ],
      recommendations: [
        'Continue your current workout routine for optimal results',
        'Consider adding 2-3 cardio sessions per week',
        'Maintain your current nutrition plan',
        'Ensure adequate sleep (7-8 hours) for recovery'
      ],
      achievements: [
        'Lost 2.5kg in the past month',
        'Completed 15 workouts this month',
        'Maintained consistent nutrition tracking'
      ]
    };

    setAnalysis(mockAnalysis);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">AI Progress Analysis</h2>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
              Powered by AI
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">AI is analyzing your progress...</p>
          </div>
        ) : analysis && (
          <div className="space-y-6">
            {/* Overall Trend */}
            <div className={`p-4 rounded-lg ${
              analysis.overallTrend === 'positive'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {analysis.overallTrend === 'positive' ? (
                  <TrendingUp className="text-green-600" size={20} />
                ) : (
                  <TrendingDown className="text-yellow-600" size={20} />
                )}
                <h3 className="font-semibold text-lg">
                  Overall Progress: {analysis.overallTrend === 'positive' ? 'Excellent' : 'Good'}
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Your fitness journey is on track! Keep up the great work.
              </p>
            </div>

            {/* Insights */}
            <div>
              <h3 className="font-semibold mb-3">Key Insights</h3>
              <div className="space-y-3">
                {analysis.insights.map((insight: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      insight.type === 'positive'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <insight.icon className={`mt-0.5 ${
                        insight.type === 'positive' ? 'text-green-600' : 'text-yellow-600'
                      }`} size={20} />
                      <div>
                        <h4 className="font-medium mb-1">{insight.title}</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictions */}
            <div>
              <h3 className="font-semibold mb-3">AI Predictions</h3>
              <div className="grid grid-cols-2 gap-4">
                {analysis.predictions.map((prediction: any, index: number) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{prediction.metric}</span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {Math.round(prediction.confidence * 100)}% confidence
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Current:</span>
                        <span className="font-medium">{prediction.current}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Predicted:</span>
                        <span className="font-medium text-blue-600">{prediction.predicted}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        In {prediction.timeframe}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="font-semibold mb-3">AI Recommendations</h3>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Sparkles className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="font-semibold mb-3">Recent Achievements</h3>
              <div className="space-y-2">
                {analysis.achievements.map((achievement: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                    <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
                    <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AIProgressAnalysisModal;

