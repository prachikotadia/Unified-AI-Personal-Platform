import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Lightbulb } from 'lucide-react';

interface AIContentSuggestionsProps {
  postType?: 'achievement' | 'workout' | 'trip' | 'budget' | 'general';
  userActivity?: any;
  onSelectSuggestion?: (suggestion: string) => void;
}

const AIContentSuggestions: React.FC<AIContentSuggestionsProps> = ({
  postType,
  userActivity,
  onSelectSuggestion
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateSuggestions();
  }, [postType, userActivity]);

  const generateSuggestions = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // AI-powered content suggestions
    let mockSuggestions: string[] = [];

    switch (postType) {
      case 'achievement':
        mockSuggestions = [
          '🎉 Just hit a major milestone! [Describe your achievement and how you got there]',
          'So proud to share this achievement with you all! [Add personal story]',
          'Hard work pays off! Today I achieved [achievement]. Here\'s what I learned...'
        ];
        break;
      case 'workout':
        mockSuggestions = [
          '💪 Just crushed my workout! [Workout details] Feeling stronger every day!',
          'Morning workout complete! [Details] Starting the day right!',
          'New personal record today! [Details] The grind never stops! 💪'
        ];
        break;
      case 'trip':
        mockSuggestions = [
          '✈️ Planning an amazing trip to [destination]! Any recommendations?',
          'Can\'t wait to explore [destination]! Here\'s what I\'m most excited about...',
          'Travel mode: ON! 🗺️ Heading to [destination] - adventure awaits!'
        ];
        break;
      case 'budget':
        mockSuggestions = [
          '💰 Monthly budget review complete! [Share insights and tips]',
          'Financial goals update: [Progress]. Here\'s what\'s working for me...',
          'Budget milestone achieved! [Details] Small steps lead to big wins!'
        ];
        break;
      default:
        mockSuggestions = [
          'What\'s on your mind? Share your thoughts and connect with friends!',
          'Starting the day with gratitude. What are you grateful for today?',
          'Life update: [Share what\'s new in your life]'
        ];
    }

    setSuggestions(mockSuggestions);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2 text-xs text-gray-500">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        <span>Generating content suggestions...</span>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="text-blue-600" size={16} />
        <span className="text-xs font-medium text-blue-800 dark:text-blue-200">AI Content Suggestions</span>
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectSuggestion && onSelectSuggestion(suggestion)}
            className="w-full text-left p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-xs"
          >
            <div className="flex items-start gap-2">
              <Lightbulb className="text-yellow-600 flex-shrink-0 mt-0.5" size={14} />
              <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIContentSuggestions;

