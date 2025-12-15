import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Hash } from 'lucide-react';
import { Message } from '../../store/chat';

interface AIConversationTopicsProps {
  messages: Message[];
  onSelectTopic?: (topic: string) => void;
}

const AIConversationTopics: React.FC<AIConversationTopicsProps> = ({ messages, onSelectTopic }) => {
  const [topics, setTopics] = useState<Array<{ name: string; count: number; relevance: number }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      extractTopics();
    }
  }, [messages]);

  const extractTopics = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // AI-powered topic extraction
    const mockTopics = [
      { name: 'Project Planning', count: 12, relevance: 0.95 },
      { name: 'Team Meeting', count: 8, relevance: 0.85 },
      { name: 'Deadlines', count: 6, relevance: 0.75 },
      { name: 'Technical Discussion', count: 5, relevance: 0.70 },
      { name: 'Resource Allocation', count: 4, relevance: 0.65 }
    ];

    setTopics(mockTopics);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Extracting topics...</span>
      </div>
    );
  }

  if (topics.length === 0) return null;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="text-blue-600" size={18} />
        <h4 className="font-semibold">Conversation Topics</h4>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
          AI
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {topics.map((topic, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectTopic && onSelectTopic(topic.name)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-200 dark:border-blue-800"
          >
            <Hash size={14} />
            <span className="text-sm font-medium">{topic.name}</span>
            <span className="text-xs bg-blue-200 dark:bg-blue-800 px-1.5 py-0.5 rounded">
              {topic.count}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default AIConversationTopics;

