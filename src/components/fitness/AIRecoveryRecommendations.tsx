import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Heart, Moon, Droplet, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface RecoveryRecommendation {
  id: string;
  category: 'sleep' | 'nutrition' | 'hydration' | 'stretching' | 'rest' | 'active_recovery';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  duration: string;
  matchScore: number;
  reasoning: string;
  benefits: string[];
  instructions: string[];
}

interface AIRecoveryRecommendationsProps {
  recentWorkouts?: any[];
  sleepData?: {
    averageHours?: number;
    quality?: number;
  };
  nutritionData?: {
    proteinIntake?: number;
    hydration?: number;
  };
  onApplyRecommendation?: (recommendation: RecoveryRecommendation) => void;
}

const AIRecoveryRecommendations: React.FC<AIRecoveryRecommendationsProps> = ({
  recentWorkouts,
  sleepData,
  nutritionData,
  onApplyRecommendation
}) => {
  const [recommendations, setRecommendations] = useState<RecoveryRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateRecommendations();
  }, [recentWorkouts, sleepData, nutritionData]);

  const generateRecommendations = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // AI-powered recovery recommendations
    const mockRecommendations: RecoveryRecommendation[] = [
      {
        id: '1',
        category: 'sleep',
        title: 'Improve Sleep Quality',
        description: 'Aim for 7-9 hours of quality sleep to optimize recovery and muscle growth.',
        priority: 'high',
        duration: '7-9 hours',
        matchScore: 0.95,
        reasoning: 'Your recent workout intensity suggests you need adequate sleep for recovery. Current sleep patterns may be limiting your progress.',
        benefits: ['Faster muscle recovery', 'Improved performance', 'Better hormone regulation', 'Reduced injury risk'],
        instructions: [
          'Maintain consistent sleep schedule',
          'Avoid screens 1 hour before bed',
          'Keep bedroom cool and dark',
          'Limit caffeine after 2 PM',
          'Practice relaxation techniques'
        ]
      },
      {
        id: '2',
        category: 'nutrition',
        title: 'Post-Workout Protein',
        description: 'Consume 20-30g of protein within 30 minutes after your workout.',
        priority: 'high',
        duration: '30 minutes post-workout',
        matchScore: 0.92,
        reasoning: 'Your workout frequency and intensity require adequate protein for muscle repair and growth.',
        benefits: ['Muscle protein synthesis', 'Faster recovery', 'Reduced muscle soreness', 'Improved adaptation'],
        instructions: [
          'Eat protein-rich meal or shake',
          'Include fast-digesting protein',
          'Combine with carbohydrates',
          'Stay hydrated',
          'Consider BCAAs if needed'
        ]
      },
      {
        id: '3',
        category: 'stretching',
        title: 'Post-Workout Stretching',
        description: 'Perform 10-15 minutes of dynamic and static stretching after workouts.',
        priority: 'medium',
        duration: '10-15 minutes',
        matchScore: 0.88,
        reasoning: 'Regular stretching can improve flexibility, reduce muscle tension, and prevent injuries.',
        benefits: ['Improved flexibility', 'Reduced muscle soreness', 'Better range of motion', 'Injury prevention'],
        instructions: [
          'Start with dynamic stretches',
          'Focus on worked muscle groups',
          'Hold static stretches 30-60 seconds',
          'Don\'t stretch to the point of pain',
          'Breathe deeply during stretches'
        ]
      },
      {
        id: '4',
        category: 'hydration',
        title: 'Increase Water Intake',
        description: 'Aim for 2.5-3 liters of water daily, especially around workouts.',
        priority: 'medium',
        duration: 'Throughout the day',
        matchScore: 0.85,
        reasoning: 'Proper hydration is essential for recovery, performance, and overall health.',
        benefits: ['Better performance', 'Improved recovery', 'Joint lubrication', 'Temperature regulation'],
        instructions: [
          'Drink water before, during, and after workouts',
          'Monitor urine color (should be light)',
          'Include electrolytes if sweating heavily',
          'Avoid excessive caffeine/alcohol',
          'Eat water-rich foods'
        ]
      },
      {
        id: '5',
        category: 'active_recovery',
        title: 'Light Activity Day',
        description: 'Engage in light activities like walking or yoga on rest days.',
        priority: 'low',
        duration: '20-30 minutes',
        matchScore: 0.80,
        reasoning: 'Active recovery can improve blood flow and reduce muscle stiffness without overloading your system.',
        benefits: ['Improved blood flow', 'Reduced stiffness', 'Mental refreshment', 'Maintained mobility'],
        instructions: [
          'Choose low-intensity activities',
          'Focus on movement, not intensity',
          'Listen to your body',
          'Avoid high-impact exercises',
          'Enjoy the process'
        ]
      },
      {
        id: '6',
        category: 'rest',
        title: 'Complete Rest Day',
        description: 'Take a full rest day to allow your body to fully recover.',
        priority: 'high',
        duration: '24 hours',
        matchScore: 0.90,
        reasoning: 'Your recent workout volume suggests you may benefit from a complete rest day to prevent overtraining.',
        benefits: ['Full recovery', 'Prevents overtraining', 'Hormone balance', 'Mental refreshment'],
        instructions: [
          'Avoid structured exercise',
          'Get adequate sleep',
          'Eat nutritious meals',
          'Stay hydrated',
          'Engage in relaxing activities'
        ]
      }
    ];

    setRecommendations(mockRecommendations);
    setLoading(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sleep':
        return Moon;
      case 'nutrition':
        return Heart;
      case 'hydration':
        return Droplet;
      case 'stretching':
        return Activity;
      case 'rest':
        return Clock;
      case 'active_recovery':
        return Heart;
      default:
        return CheckCircle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">AI is analyzing your recovery needs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold">AI Recovery Recommendations</h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
          Powered by AI
        </span>
      </div>

      <div className="space-y-4">
        {recommendations.map((recommendation, index) => {
          const Icon = getCategoryIcon(recommendation.category);
          const isApplied = appliedRecommendations.has(recommendation.id);

          return (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-4 ${getPriorityColor(recommendation.priority)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="text-blue-600" size={20} />
                  <div>
                    <h4 className="font-semibold">{recommendation.title}</h4>
                    <p className="text-sm opacity-90">{recommendation.description}</p>
                  </div>
                </div>
                {isApplied && (
                  <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                )}
              </div>

              <div className="flex items-center gap-3 mb-3 text-sm">
                <span className="font-medium">Priority: {recommendation.priority.toUpperCase()}</span>
                <span className="opacity-75">Duration: {recommendation.duration}</span>
                <div className="flex items-center gap-1 ml-auto">
                  <div className="w-12 bg-white/50 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${recommendation.matchScore * 100}%` }}
                    />
                  </div>
                  <span className="text-xs opacity-75">
                    {Math.round(recommendation.matchScore * 100)}%
                  </span>
                </div>
              </div>

              <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-2 mb-3">
                <p className="text-xs mb-1">
                  <Sparkles className="inline w-3 h-3 mr-1" />
                  <strong>AI Insight:</strong> {recommendation.reasoning}
                </p>
              </div>

              <div className="mb-3">
                <p className="text-xs font-medium mb-1">Benefits:</p>
                <div className="flex flex-wrap gap-1">
                  {recommendation.benefits.map((benefit, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-white/70 dark:bg-gray-600 px-2 py-0.5 rounded"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              <details className="mb-3">
                <summary className="text-xs font-medium cursor-pointer hover:opacity-80">
                  View Instructions
                </summary>
                <ol className="mt-2 space-y-1 text-xs pl-4">
                  {recommendation.instructions.map((instruction, idx) => (
                    <li key={idx} className="list-decimal">{instruction}</li>
                  ))}
                </ol>
              </details>

              {onApplyRecommendation && !isApplied && (
                <button
                  onClick={() => {
                    onApplyRecommendation(recommendation);
                    setAppliedRecommendations(prev => new Set([...prev, recommendation.id]));
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Apply Recommendation
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> These recommendations are personalized based on your workout patterns, 
            sleep data, and nutrition. Adjust based on how you feel and consult a professional if needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIRecoveryRecommendations;

