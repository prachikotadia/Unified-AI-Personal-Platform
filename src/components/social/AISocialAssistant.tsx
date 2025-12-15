import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Brain, MessageSquare, Loader2, Bot, User } from 'lucide-react';

interface AISocialAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  socialContext?: {
    recentPosts?: any[];
    connections?: any[];
    activity?: any;
  };
  onSendMessage?: (message: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const AISocialAssistant: React.FC<AISocialAssistantProps> = ({
  isOpen,
  onClose,
  socialContext,
  onSendMessage
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        sender: 'ai',
        text: 'Hello! I\'m your AI Social Assistant. I can help you with post suggestions, engagement tips, friend recommendations, and social media best practices. How can I assist you?',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || isSending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    if (onSendMessage) {
      onSendMessage(userMessage.text);
    }

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1000));

    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: generateAIResponse(userMessage.text),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsSending(false);
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('post') || lowerInput.includes('share') || lowerInput.includes('content')) {
      return 'I can help you create engaging posts! Here are some tips:\n\n' +
        '1. **Be Authentic**: Share genuine experiences and thoughts\n' +
        '2. **Use Hashtags**: 3-5 relevant hashtags can increase reach by 2x\n' +
        '3. **Add Media**: Posts with images/videos get 2.3x more engagement\n' +
        '4. **Best Times**: Post between 6-8 PM on weekdays for maximum engagement\n' +
        '5. **Engage Back**: Reply to comments within the first hour\n\n' +
        'Would you like me to suggest specific content for your next post?';
    } else if (lowerInput.includes('friend') || lowerInput.includes('connect') || lowerInput.includes('network')) {
      return 'I can help you expand your network! Here\'s what I recommend:\n\n' +
        '1. **Mutual Connections**: Connect with people who share mutual friends\n' +
        '2. **Common Interests**: Find people with similar hobbies and activities\n' +
        '3. **Engage First**: Like and comment on posts before sending friend requests\n' +
        '4. **Be Active**: Regular posting helps you appear in friend suggestions\n\n' +
        'Would you like me to generate personalized friend suggestions?';
    } else if (lowerInput.includes('engagement') || lowerInput.includes('likes') || lowerInput.includes('comments')) {
      return 'Here are proven strategies to boost engagement:\n\n' +
        '1. **Post Consistently**: 2-3 posts per week is optimal\n' +
        '2. **Ask Questions**: Posts with questions get 2x more comments\n' +
        '3. **Use Stories**: Share behind-the-scenes content\n' +
        '4. **Engage Actively**: Respond to comments and messages promptly\n' +
        '5. **Post at Peak Times**: 6-8 PM weekdays, 10 AM-12 PM weekends\n\n' +
        'I can analyze your posting patterns and suggest improvements!';
    } else if (lowerInput.includes('hashtag') || lowerInput.includes('tag')) {
      return 'Hashtags are powerful for discoverability! Here\'s how to use them:\n\n' +
        '1. **Relevance**: Use hashtags related to your content\n' +
        '2. **Mix**: Combine popular (#fitness) and niche (#homeworkout) tags\n' +
        '3. **Quantity**: 3-5 hashtags is the sweet spot\n' +
        '4. **Research**: Check what hashtags your audience uses\n' +
        '5. **Location**: Add location-based hashtags when relevant\n\n' +
        'I can suggest hashtags for your next post based on the content!';
    } else {
      return 'I\'m here to help with all aspects of your social presence! I can assist with:\n\n' +
        '• Creating engaging post content\n' +
        '• Finding the best time to post\n' +
        '• Suggesting relevant hashtags\n' +
        '• Friend recommendations\n' +
        '• Engagement strategies\n' +
        '• Social media analytics\n\n' +
        'What would you like help with?';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl h-[600px] flex flex-col shadow-xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Brain className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="font-semibold">AI Social Assistant</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Powered by AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Bot className="text-blue-600 dark:text-blue-400" size={16} />
                </div>
              )}
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : ''}`}>
                <div
                  className={`rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <User className="text-gray-600 dark:text-gray-400" size={16} />
                </div>
              )}
            </div>
          ))}
          {isSending && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Bot className="text-blue-600 dark:text-blue-400" size={16} />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <Loader2 className="animate-spin text-blue-600" size={16} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me about social media tips, post ideas, engagement strategies..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isSending}
            />
            <button
              onClick={handleSendMessage}
              disabled={isSending || input.trim() === ''}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AISocialAssistant;

