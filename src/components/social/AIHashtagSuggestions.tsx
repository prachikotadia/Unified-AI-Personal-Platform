import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Hash, Sparkles } from 'lucide-react';

interface AIHashtagSuggestionsProps {
  content: string;
  postType?: 'achievement' | 'workout' | 'trip' | 'budget' | 'general';
  onSelectHashtags: (hashtags: string[]) => void;
}

const AIHashtagSuggestions: React.FC<AIHashtagSuggestionsProps> = ({
  content,
  postType,
  onSelectHashtags
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (content.trim()) {
      generateHashtags();
    } else {
      setSuggestions([]);
    }
  }, [content, postType]);

  const generateHashtags = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // AI-powered hashtag suggestions based on content
    const contentLower = content.toLowerCase();
    const baseHashtags: string[] = [];

    // Content-based hashtags
    if (contentLower.includes('workout') || contentLower.includes('exercise') || contentLower.includes('fitness')) {
      baseHashtags.push('#fitness', '#workout', '#health', '#exercise', '#gym');
    }
    if (contentLower.includes('trip') || contentLower.includes('travel') || contentLower.includes('vacation')) {
      baseHashtags.push('#travel', '#adventure', '#wanderlust', '#explore', '#vacation');
    }
    if (contentLower.includes('budget') || contentLower.includes('finance') || contentLower.includes('money')) {
      baseHashtags.push('#finance', '#budget', '#money', '#savings', '#financialfreedom');
    }
    if (contentLower.includes('achievement') || contentLower.includes('goal') || contentLower.includes('success')) {
      baseHashtags.push('#achievement', '#goals', '#success', '#motivation', '#inspiration');
    }

    // Type-based hashtags
    if (postType === 'workout') {
      baseHashtags.push('#fitnessjourney', '#workoutmotivation', '#fitlife');
    } else if (postType === 'trip') {
      baseHashtags.push('#travelgram', '#travelphotography', '#travelblogger');
    } else if (postType === 'budget') {
      baseHashtags.push('#personalfinance', '#budgeting', '#financialplanning');
    } else if (postType === 'achievement') {
      baseHashtags.push('#proud', '#milestone', '#celebration');
    }

    // General popular hashtags
    baseHashtags.push('#lifestyle', '#motivation', '#inspiration', '#daily', '#life');

    setSuggestions([...new Set(baseHashtags)].slice(0, 10));
    setLoading(false);
  };

  const handleToggleHashtag = (hashtag: string) => {
    setSelected(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hashtag)) {
        newSet.delete(hashtag);
      } else {
        newSet.add(hashtag);
      }
      onSelectHashtags(Array.from(newSet));
      return newSet;
    });
  };

  if (!content.trim() || suggestions.length === 0) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2 text-xs text-gray-500">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        <span>Generating hashtags...</span>
      </div>
    );
  }

  return (
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="text-blue-600" size={16} />
        <span className="text-xs font-medium text-blue-800 dark:text-blue-200">AI Hashtag Suggestions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((hashtag, index) => (
          <button
            key={index}
            onClick={() => handleToggleHashtag(hashtag)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              selected.has(hashtag)
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/40'
            }`}
          >
            <Hash size={12} className="inline mr-1" />
            {hashtag.replace('#', '')}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIHashtagSuggestions;

