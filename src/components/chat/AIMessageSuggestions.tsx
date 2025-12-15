import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Send } from 'lucide-react';

interface AIMessageSuggestionsProps {
  conversationContext: string[];
  onSelectSuggestion: (suggestion: string) => void;
  maxSuggestions?: number;
}

const AIMessageSuggestions: React.FC<AIMessageSuggestionsProps> = ({
  conversationContext,
  onSelectSuggestion,
  maxSuggestions = 3
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateSuggestions();
  }, [conversationContext]);

  const generateSuggestions = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // AI-powered message suggestions based on context
    const lastMessage = conversationContext[conversationContext.length - 1] || '';
    const mockSuggestions = [
      `Thanks for sharing that! ${lastMessage.includes('?') ? 'Let me think about it.' : 'I appreciate it.'}`,
      `That's interesting. ${lastMessage.toLowerCase().includes('meeting') ? 'When would be a good time?' : 'Tell me more about that.'}`,
      `Got it! ${lastMessage.toLowerCase().includes('project') ? 'I can help with that.' : 'Sounds good.'}`
    ].slice(0, maxSuggestions);

    setSuggestions(mockSuggestions);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>AI is generating suggestions...</span>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="text-blue-600" size={16} />
        <span className="text-xs font-medium text-blue-800 dark:text-blue-200">AI Suggestions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectSuggestion(suggestion)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-700 text-sm rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-200 dark:border-blue-800"
          >
            <Sparkles size={12} className="text-blue-600" />
            <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
            <Send size={12} className="text-blue-600" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default AIMessageSuggestions;

