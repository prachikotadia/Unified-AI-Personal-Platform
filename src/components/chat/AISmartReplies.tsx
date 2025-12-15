import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { Message } from '../../store/chat';

interface AISmartRepliesProps {
  lastMessage: Message | null;
  onSelectReply: (reply: string) => void;
}

const AISmartReplies: React.FC<AISmartRepliesProps> = ({ lastMessage, onSelectReply }) => {
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'text') {
      generateReplies();
    } else {
      setReplies([]);
    }
  }, [lastMessage]);

  const generateReplies = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const messageContent = lastMessage?.content.toLowerCase() || '';
    
    // AI-powered smart replies based on message content
    let smartReplies: string[] = [];

    if (messageContent.includes('?')) {
      smartReplies = ['Yes, that sounds good!', 'I need to think about that', 'Let me check and get back to you'];
    } else if (messageContent.includes('thank') || messageContent.includes('thanks')) {
      smartReplies = ['You\'re welcome!', 'Happy to help!', 'Anytime!'];
    } else if (messageContent.includes('meeting') || messageContent.includes('call')) {
      smartReplies = ['Sounds good!', 'What time works for you?', 'I\'ll be there'];
    } else if (messageContent.includes('sorry') || messageContent.includes('apologize')) {
      smartReplies = ['No worries!', 'It\'s okay', 'Don\'t worry about it'];
    } else {
      smartReplies = ['Got it!', 'Thanks for letting me know', 'I understand'];
    }

    setReplies(smartReplies);
    setLoading(false);
  };

  if (!lastMessage || lastMessage.type !== 'text' || replies.length === 0) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        <span>Generating replies...</span>
      </div>
    );
  }

  return (
    <div className="p-2 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="text-green-600" size={14} />
        <span className="text-xs font-medium text-green-800 dark:text-green-200">Smart Replies</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {replies.map((reply, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectReply(reply)}
            className="px-3 py-1.5 bg-white dark:bg-gray-700 text-xs rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors border border-green-200 dark:border-green-800"
          >
            {reply}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default AISmartReplies;

