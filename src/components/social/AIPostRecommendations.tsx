import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, Clock, Hash } from 'lucide-react';

interface PostRecommendation {
  id: string;
  type: 'achievement' | 'workout' | 'trip' | 'budget' | 'general';
  title: string;
  content: string;
  suggestedHashtags: string[];
  bestTimeToPost: string;
  expectedEngagement: number;
  matchScore: number;
  reasoning: string;
}

interface AIPostRecommendationsProps {
  userActivity?: {
    recentPosts?: any[];
    recentAchievements?: any[];
    recentWorkouts?: any[];
    recentTrips?: any[];
  };
  onSelectRecommendation?: (recommendation: PostRecommendation) => void;
}

const AIPostRecommendations: React.FC<AIPostRecommendationsProps> = ({
  userActivity,
  onSelectRecommendation
}) => {
  const [recommendations, setRecommendations] = useState<PostRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateRecommendations();
  }, [userActivity]);

  const generateRecommendations = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // AI-powered post recommendations
    const mockRecommendations: PostRecommendation[] = [
      {
        id: '1',
        type: 'achievement',
        title: 'Share Your Recent Achievement',
        content: 'You recently completed a fitness goal! Sharing achievements typically gets 40% more engagement.',
        suggestedHashtags: ['#fitness', '#achievement', '#goals', '#motivation'],
        bestTimeToPost: '6:00 PM - 8:00 PM',
        expectedEngagement: 85,
        matchScore: 0.95,
        reasoning: 'Based on your activity patterns, sharing achievements in the evening gets the best response from your network.'
      },
      {
        id: '2',
        type: 'workout',
        title: 'Post Your Workout Progress',
        content: 'Your consistent workout routine is impressive! Consider sharing your progress to inspire others.',
        suggestedHashtags: ['#workout', '#fitness', '#progress', '#health'],
        bestTimeToPost: '7:00 AM - 9:00 AM',
        expectedEngagement: 72,
        matchScore: 0.88,
        reasoning: 'Morning workout posts tend to resonate well with your audience and encourage healthy habits.'
      },
      {
        id: '3',
        type: 'trip',
        title: 'Share Your Travel Plans',
        content: 'You have an upcoming trip! Travel posts generate high engagement and help you connect with fellow travelers.',
        suggestedHashtags: ['#travel', '#adventure', '#wanderlust', '#explore'],
        bestTimeToPost: '12:00 PM - 2:00 PM',
        expectedEngagement: 95,
        matchScore: 0.92,
        reasoning: 'Travel content performs best during lunch hours when people are browsing social media.'
      }
    ];

    setRecommendations(mockRecommendations);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">AI is generating post recommendations...</span>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-blue-600" size={20} />
        <h3 className="font-semibold">AI Post Recommendations</h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
          Powered by AI
        </span>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold">{rec.title}</h4>
              <div className="flex items-center gap-1">
                <div className="w-12 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${rec.matchScore * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {Math.round(rec.matchScore * 100)}%
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{rec.content}</p>

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={14} />
                <span>Best time: {rec.bestTimeToPost}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <TrendingUp size={14} />
                <span>Expected engagement: {rec.expectedEngagement}%</span>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs font-medium mb-1">Suggested Hashtags:</p>
              <div className="flex flex-wrap gap-1">
                {rec.suggestedHashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mb-3">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <Sparkles className="inline w-3 h-3 mr-1" />
                <strong>AI Insight:</strong> {rec.reasoning}
              </p>
            </div>

            {onSelectRecommendation && (
              <button
                onClick={() => onSelectRecommendation(rec)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Use This Recommendation
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AIPostRecommendations;

