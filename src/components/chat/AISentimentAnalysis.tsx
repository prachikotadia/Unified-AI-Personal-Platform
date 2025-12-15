import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { Message } from '../../store/chat';

interface AISentimentAnalysisProps {
  messages: Message[];
  showDetails?: boolean;
}

interface SentimentResult {
  overall: 'positive' | 'neutral' | 'negative';
  score: number;
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  insights: string[];
}

const AISentimentAnalysis: React.FC<AISentimentAnalysisProps> = ({ messages, showDetails = false }) => {
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      analyzeSentiment();
    }
  }, [messages]);

  const analyzeSentiment = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // AI-powered sentiment analysis
    const textMessages = messages.filter(m => m.type === 'text');
    const totalMessages = textMessages.length;

    // Mock sentiment analysis
    const mockSentiment: SentimentResult = {
      overall: 'positive',
      score: 0.75,
      breakdown: {
        positive: Math.round(totalMessages * 0.6),
        neutral: Math.round(totalMessages * 0.3),
        negative: Math.round(totalMessages * 0.1)
      },
      insights: [
        'Conversation tone is generally positive and friendly',
        'Most messages express agreement and support',
        'Minimal negative sentiment detected'
      ]
    };

    setSentiment(mockSentiment);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Analyzing sentiment...</span>
      </div>
    );
  }

  if (!sentiment) return null;

  const getSentimentIcon = () => {
    switch (sentiment.overall) {
      case 'positive':
        return <TrendingUp className="text-green-600" size={20} />;
      case 'negative':
        return <TrendingDown className="text-red-600" size={20} />;
      default:
        return <Minus className="text-gray-600" size={20} />;
    }
  };

  const getSentimentColor = () => {
    switch (sentiment.overall) {
      case 'positive':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'negative':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getSentimentColor()}`}>
      <div className="flex items-center gap-2 mb-3">
        <Brain className="text-blue-600" size={18} />
        <h4 className="font-semibold">Sentiment Analysis</h4>
        {getSentimentIcon()}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Overall Sentiment</span>
            <span className="text-sm font-bold capitalize">{sentiment.overall}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                sentiment.overall === 'positive' ? 'bg-green-600' :
                sentiment.overall === 'negative' ? 'bg-red-600' : 'bg-gray-600'
              }`}
              style={{ width: `${sentiment.score * 100}%` }}
            />
          </div>
        </div>

        {showDetails && (
          <>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                <div className="font-bold text-green-600">{sentiment.breakdown.positive}</div>
                <div className="text-xs">Positive</div>
              </div>
              <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                <div className="font-bold text-gray-600">{sentiment.breakdown.neutral}</div>
                <div className="text-xs">Neutral</div>
              </div>
              <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                <div className="font-bold text-red-600">{sentiment.breakdown.negative}</div>
                <div className="text-xs">Negative</div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-2">Insights</h5>
              <ul className="space-y-1">
                {sentiment.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs">
                    <AlertCircle className="mt-0.5 flex-shrink-0" size={14} />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AISentimentAnalysis;

