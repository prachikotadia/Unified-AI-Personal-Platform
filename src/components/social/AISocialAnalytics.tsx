import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, BarChart3, TrendingUp, Users, Heart, MessageCircle, Share2, Eye } from 'lucide-react';

interface AISocialAnalyticsProps {
  userId: string;
  posts?: any[];
  showCharts?: boolean;
}

interface SocialAnalytics {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  averageEngagement: number;
  topPostType: string;
  bestPostingTime: string;
  growthRate: number;
  insights: string[];
  recommendations: string[];
}

const AISocialAnalytics: React.FC<AISocialAnalyticsProps> = ({
  userId,
  posts = [],
  showCharts = false
}) => {
  const [analytics, setAnalytics] = useState<SocialAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (posts.length > 0) {
      generateAnalytics();
    }
  }, [posts]);

  const generateAnalytics = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // AI-powered social analytics
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);
    const totalShares = posts.reduce((sum, post) => sum + (post.shares || 0), 0);
    const averageEngagement = posts.length > 0
      ? ((totalLikes + totalComments + totalShares) / posts.length).toFixed(1)
      : 0;

    const postTypes = posts.reduce((acc, post) => {
      acc[post.type] = (acc[post.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPostType = Object.entries(postTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'general';

    const mockAnalytics: SocialAnalytics = {
      totalPosts: posts.length,
      totalLikes,
      totalComments,
      totalShares,
      averageEngagement: parseFloat(averageEngagement),
      topPostType,
      bestPostingTime: '6:00 PM - 8:00 PM',
      growthRate: 12.5,
      insights: [
        `Your ${topPostType} posts perform best with ${Math.round(totalLikes / posts.length)} average likes`,
        `Posting in the evening (6-8 PM) typically gets 30% more engagement`,
        `Posts with hashtags receive 2x more reach on average`,
        `Your engagement rate is ${averageEngagement}% above average`
      ],
      recommendations: [
        'Post more achievement and workout content - these get the highest engagement',
        'Use 3-5 relevant hashtags per post to increase discoverability',
        'Post consistently 2-3 times per week for optimal growth',
        'Engage with comments within the first hour for better algorithm visibility'
      ]
    };

    setAnalytics(mockAnalytics);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Generating analytics...</span>
      </div>
    );
  }

  if (!analytics || posts.length === 0) return null;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-blue-600" size={18} />
        <h4 className="font-semibold">AI Social Analytics</h4>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
          AI
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <BarChart3 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <div className="text-xl font-bold">{analytics.totalPosts}</div>
          <div className="text-xs text-gray-500">Posts</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Heart className="w-5 h-5 text-red-600 mx-auto mb-1" />
          <div className="text-xl font-bold">{analytics.totalLikes}</div>
          <div className="text-xs text-gray-500">Likes</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <MessageCircle className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <div className="text-xl font-bold">{analytics.totalComments}</div>
          <div className="text-xs text-gray-500">Comments</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <div className="text-xl font-bold">{analytics.averageEngagement}</div>
          <div className="text-xs text-gray-500">Avg Engagement</div>
        </div>
      </div>

      <div className="mb-4">
        <h5 className="text-sm font-medium mb-2">AI Insights</h5>
        <ul className="space-y-1">
          {analytics.insights.map((insight, index) => (
            <li key={index} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
              <TrendingUp className="mt-0.5 flex-shrink-0 text-blue-600" size={12} />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h5 className="text-sm font-medium mb-2">AI Recommendations</h5>
        <ul className="space-y-1">
          {analytics.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Brain className="mt-0.5 flex-shrink-0 text-purple-600" size={12} />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AISocialAnalytics;

