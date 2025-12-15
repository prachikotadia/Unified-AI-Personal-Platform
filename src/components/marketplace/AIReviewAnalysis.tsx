import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Star, TrendingUp, TrendingDown, MessageSquare, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  author: string;
  date: string;
  helpful: number;
}

interface ReviewSentiment {
  positive: number;
  negative: number;
  neutral: number;
}

interface ReviewInsight {
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  percentage: number;
  examples: string[];
}

interface AIReviewAnalysisProps {
  productId: number;
  reviews: Review[];
  onAnalysisComplete?: (insights: ReviewInsight[]) => void;
}

const AIReviewAnalysis: React.FC<AIReviewAnalysisProps> = ({
  productId,
  reviews,
  onAnalysisComplete
}) => {
  const [insights, setInsights] = useState<ReviewInsight[]>([]);
  const [sentiment, setSentiment] = useState<ReviewSentiment>({ positive: 0, negative: 0, neutral: 0 });
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');

  useEffect(() => {
    if (reviews.length > 0) {
      analyzeReviews();
    }
  }, [reviews]);

  const analyzeReviews = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate overall sentiment
    const total = reviews.length;
    const positive = reviews.filter(r => r.rating >= 4).length;
    const negative = reviews.filter(r => r.rating <= 2).length;
    const neutral = total - positive - negative;

    setSentiment({
      positive: (positive / total) * 100,
      negative: (negative / total) * 100,
      neutral: (neutral / total) * 100
    });

    // Generate category insights
    const categoryInsights: ReviewInsight[] = [];

    // Quality analysis
    const qualityKeywords = ['quality', 'durable', 'well-made', 'cheap', 'poor quality', 'broke'];
    const qualityReviews = reviews.filter(r => 
      qualityKeywords.some(keyword => 
        r.comment.toLowerCase().includes(keyword) || r.title.toLowerCase().includes(keyword)
      )
    );
    const qualityPositive = qualityReviews.filter(r => r.rating >= 4).length;
    const qualitySentiment = qualityPositive > qualityReviews.length / 2 ? 'positive' : 
                            qualityPositive < qualityReviews.length / 2 ? 'negative' : 'neutral';
    
    categoryInsights.push({
      category: 'Quality',
      sentiment: qualitySentiment,
      percentage: (qualityPositive / qualityReviews.length) * 100 || 0,
      examples: qualityReviews.slice(0, 3).map(r => r.comment.substring(0, 100))
    });

    // Value analysis
    const valueKeywords = ['value', 'worth', 'price', 'expensive', 'affordable', 'overpriced'];
    const valueReviews = reviews.filter(r => 
      valueKeywords.some(keyword => 
        r.comment.toLowerCase().includes(keyword) || r.title.toLowerCase().includes(keyword)
      )
    );
    const valuePositive = valueReviews.filter(r => r.rating >= 4).length;
    const valueSentiment = valuePositive > valueReviews.length / 2 ? 'positive' : 
                          valuePositive < valueReviews.length / 2 ? 'negative' : 'neutral';
    
    categoryInsights.push({
      category: 'Value for Money',
      sentiment: valueSentiment,
      percentage: (valuePositive / valueReviews.length) * 100 || 0,
      examples: valueReviews.slice(0, 3).map(r => r.comment.substring(0, 100))
    });

    // Performance analysis
    const performanceKeywords = ['performance', 'fast', 'slow', 'works well', 'doesn\'t work', 'reliable'];
    const performanceReviews = reviews.filter(r => 
      performanceKeywords.some(keyword => 
        r.comment.toLowerCase().includes(keyword) || r.title.toLowerCase().includes(keyword)
      )
    );
    const performancePositive = performanceReviews.filter(r => r.rating >= 4).length;
    const performanceSentiment = performancePositive > performanceReviews.length / 2 ? 'positive' : 
                                 performancePositive < performanceReviews.length / 2 ? 'negative' : 'neutral';
    
    categoryInsights.push({
      category: 'Performance',
      sentiment: performanceSentiment,
      percentage: (performancePositive / performanceReviews.length) * 100 || 0,
      examples: performanceReviews.slice(0, 3).map(r => r.comment.substring(0, 100))
    });

    setInsights(categoryInsights);

    // Generate summary
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const overallSentiment = sentiment.positive > 70 ? 'overwhelmingly positive' :
                            sentiment.positive > 50 ? 'mostly positive' :
                            sentiment.negative > 50 ? 'mostly negative' : 'mixed';

    setSummary(
      `Based on ${reviews.length} reviews with an average rating of ${avgRating.toFixed(1)}/5, ` +
      `customer sentiment is ${overallSentiment}. ${Math.round(sentiment.positive)}% of reviews are positive, ` +
      `${Math.round(sentiment.negative)}% are negative, and ${Math.round(sentiment.neutral)}% are neutral.`
    );

    onAnalysisComplete?.(categoryInsights);
    setLoading(false);
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 text-gray-500">
          <AlertCircle size={20} />
          <p>No reviews available for analysis</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">AI is analyzing reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold">AI Review Analysis</h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
          Powered by AI
        </span>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">{summary}</p>
        </div>
      )}

      {/* Sentiment Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Overall Sentiment</h4>
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Positive</span>
              <span className="text-sm font-medium text-green-600">{sentiment.positive.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${sentiment.positive}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Neutral</span>
              <span className="text-sm font-medium text-gray-600">{sentiment.neutral.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gray-500 h-2 rounded-full"
                style={{ width: `${sentiment.neutral}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Negative</span>
              <span className="text-sm font-medium text-red-600">{sentiment.negative.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${sentiment.negative}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Insights */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Category Analysis</h4>
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-gray-900 dark:text-white">{insight.category}</h5>
              <div className="flex items-center gap-2">
                {insight.sentiment === 'positive' ? (
                  <ThumbsUp className="text-green-600" size={16} />
                ) : insight.sentiment === 'negative' ? (
                  <ThumbsDown className="text-red-600" size={16} />
                ) : (
                  <MessageSquare className="text-gray-600" size={16} />
                )}
                <span className={`text-sm font-medium ${
                  insight.sentiment === 'positive' ? 'text-green-600' :
                  insight.sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {insight.percentage.toFixed(0)}% {insight.sentiment}
                </span>
              </div>
            </div>
            {insight.examples.length > 0 && (
              <div className="mt-2 space-y-1">
                {insight.examples.slice(0, 2).map((example, idx) => (
                  <p key={idx} className="text-xs text-gray-600 dark:text-gray-400 italic">
                    "{example}..."
                  </p>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>AI Analysis:</strong> This analysis uses natural language processing to understand review sentiment and themes. 
          Results are based on keyword analysis and rating patterns.
        </p>
      </div>
    </div>
  );
};

export default AIReviewAnalysis;

