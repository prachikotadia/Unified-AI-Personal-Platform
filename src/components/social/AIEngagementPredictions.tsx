import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Clock, Users, Heart, MessageCircle, Share2 } from 'lucide-react';

interface AIEngagementPredictionsProps {
  postContent: string;
  postType?: 'achievement' | 'workout' | 'trip' | 'budget' | 'general';
  hashtags?: string[];
  suggestedPostTime?: Date;
}

interface EngagementPrediction {
  expectedLikes: number;
  expectedComments: number;
  expectedShares: number;
  expectedReach: number;
  bestPostTime: string;
  confidence: number;
  factors: Array<{
    factor: string;
    impact: 'positive' | 'neutral' | 'negative';
    explanation: string;
  }>;
}

const AIEngagementPredictions: React.FC<AIEngagementPredictionsProps> = ({
  postContent,
  postType,
  hashtags = [],
  suggestedPostTime
}) => {
  const [prediction, setPrediction] = useState<EngagementPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (postContent.trim()) {
      generatePrediction();
    }
  }, [postContent, postType, hashtags]);

  const generatePrediction = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // AI-powered engagement predictions
    const contentLength = postContent.length;
    const hasHashtags = hashtags.length > 0;
    const hasMedia = postContent.includes('image') || postContent.includes('photo');

    const baseEngagement = {
      expectedLikes: 25,
      expectedComments: 8,
      expectedShares: 3,
      expectedReach: 150
    };

    // Adjust based on factors
    let likes = baseEngagement.expectedLikes;
    let comments = baseEngagement.expectedComments;
    let shares = baseEngagement.expectedShares;
    let reach = baseEngagement.expectedReach;

    const factors: EngagementPrediction['factors'] = [];

    if (contentLength > 100) {
      likes += 10;
      factors.push({
        factor: 'Detailed Content',
        impact: 'positive',
        explanation: 'Longer posts tend to get more engagement'
      });
    }

    if (hasHashtags) {
      likes += 15;
      reach += 50;
      factors.push({
        factor: 'Hashtags',
        impact: 'positive',
        explanation: 'Hashtags help increase discoverability'
      });
    }

    if (hasMedia) {
      likes += 20;
      comments += 5;
      factors.push({
        factor: 'Media Content',
        impact: 'positive',
        explanation: 'Posts with images/videos get significantly more engagement'
      });
    }

    if (postType === 'achievement') {
      likes += 15;
      comments += 3;
      factors.push({
        factor: 'Achievement Post',
        impact: 'positive',
        explanation: 'Achievement posts generate high positive engagement'
      });
    }

    const mockPrediction: EngagementPrediction = {
      expectedLikes: Math.round(likes),
      expectedComments: Math.round(comments),
      expectedShares: Math.round(shares),
      expectedReach: Math.round(reach),
      bestPostTime: suggestedPostTime
        ? new Date(suggestedPostTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '6:00 PM - 8:00 PM',
      confidence: 0.82,
      factors
    };

    setPrediction(mockPrediction);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Predicting engagement...</span>
      </div>
    );
  }

  if (!prediction || !postContent.trim()) return null;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-blue-600" size={18} />
        <h4 className="font-semibold">AI Engagement Prediction</h4>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
          {Math.round(prediction.confidence * 100)}% confidence
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Heart className="w-5 h-5 text-red-600 mx-auto mb-1" />
          <div className="text-lg font-bold">{prediction.expectedLikes}</div>
          <div className="text-xs text-gray-500">Likes</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <MessageCircle className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <div className="text-lg font-bold">{prediction.expectedComments}</div>
          <div className="text-xs text-gray-500">Comments</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Share2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <div className="text-lg font-bold">{prediction.expectedShares}</div>
          <div className="text-xs text-gray-500">Shares</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <div className="text-lg font-bold">{prediction.expectedReach}</div>
          <div className="text-xs text-gray-500">Reach</div>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Clock size={14} />
          <span>Best time to post: {prediction.bestPostTime}</span>
        </div>
      </div>

      {prediction.factors.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2">Key Factors:</p>
          <div className="space-y-1">
            {prediction.factors.map((factor, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                {factor.impact === 'positive' ? (
                  <TrendingUp className="text-green-600 mt-0.5 flex-shrink-0" size={12} />
                ) : (
                  <span className="w-3 h-3 mt-0.5 flex-shrink-0" />
                )}
                <span className="text-gray-600 dark:text-gray-400">
                  <strong>{factor.factor}:</strong> {factor.explanation}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIEngagementPredictions;

