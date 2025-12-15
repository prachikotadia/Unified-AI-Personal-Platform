import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, TrendingUp, Users, Heart, MessageCircle, Share2, BarChart3, Sparkles } from 'lucide-react';

interface AISocialInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface SocialInsight {
  id: string;
  type: 'engagement' | 'growth' | 'content' | 'timing' | 'audience';
  title: string;
  description: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  data?: any;
}

const AISocialInsightsModal: React.FC<AISocialInsightsModalProps> = ({ isOpen, onClose, userId }) => {
  const [insights, setInsights] = useState<SocialInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateInsights();
    }
  }, [isOpen, userId]);

  const generateInsights = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // AI-powered social insights
    const mockInsights: SocialInsight[] = [
      {
        id: '1',
        type: 'engagement',
        title: 'Engagement Rate Improvement',
        description: 'Your engagement rate has increased by 15% over the last month. Achievement posts are driving the highest engagement.',
        recommendation: 'Continue sharing achievements and consider posting 2-3 times per week for optimal growth.',
        impact: 'high',
        data: { currentRate: 8.5, previousRate: 7.4, change: 15 }
      },
      {
        id: '2',
        type: 'timing',
        title: 'Optimal Posting Times',
        description: 'Your posts perform best when shared between 6-8 PM on weekdays. This aligns with when your audience is most active.',
        recommendation: 'Schedule your posts for evening hours to maximize reach and engagement.',
        impact: 'high',
        data: { bestTime: '6:00 PM - 8:00 PM', engagementBoost: 30 }
      },
      {
        id: '3',
        type: 'content',
        title: 'Content Performance Analysis',
        description: 'Workout and achievement posts receive 2.3x more engagement than budget posts. Your audience loves fitness content!',
        recommendation: 'Increase the frequency of workout and achievement posts while maintaining variety.',
        impact: 'medium',
        data: { topType: 'workout', engagementMultiplier: 2.3 }
      },
      {
        id: '4',
        type: 'audience',
        title: 'Audience Growth Opportunity',
        description: 'You have 156 friends but only 42 posts. Increasing post frequency could help you reach more people in your network.',
        recommendation: 'Aim to post at least once every 2-3 days to stay visible in your friends\' feeds.',
        impact: 'medium',
        data: { friendsCount: 156, postsCount: 42, ratio: 0.27 }
      },
      {
        id: '5',
        type: 'growth',
        title: 'Network Expansion',
        description: 'You have 5 mutual friends with several suggested connections. Connecting with them could expand your reach.',
        recommendation: 'Send friend requests to people with mutual connections to grow your network organically.',
        impact: 'low',
        data: { potentialConnections: 12, avgMutualFriends: 5 }
      }
    ];

    setInsights(mockInsights);
    setLoading(false);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'engagement':
        return <Heart className="text-red-600" size={20} />;
      case 'timing':
        return <BarChart3 className="text-blue-600" size={20} />;
      case 'content':
        return <Share2 className="text-green-600" size={20} />;
      case 'audience':
        return <Users className="text-purple-600" size={20} />;
      case 'growth':
        return <TrendingUp className="text-orange-600" size={20} />;
      default:
        return <Brain className="text-blue-600" size={20} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">AI Social Insights</h2>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
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
            <p className="text-gray-600 dark:text-gray-400">AI is analyzing your social activity...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getImpactColor(insight.impact)}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {getTypeIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{insight.title}</h3>
                      <span className="text-xs px-2 py-0.5 bg-white/50 dark:bg-gray-800/50 rounded-full capitalize">
                        {insight.impact} impact
                      </span>
                    </div>
                    <p className="text-sm mb-2">{insight.description}</p>
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 mt-2">
                      <p className="text-xs font-medium mb-1">💡 Recommendation:</p>
                      <p className="text-xs">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AISocialInsightsModal;

