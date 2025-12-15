import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, ShoppingCart, Heart, Search, Brain } from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { useWishlistStore } from '../../store/wishlist';
import { useToastHelpers } from '../../components/ui/Toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

interface AIShoppingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSearch?: (query: string) => void;
}

const AIShoppingAssistant: React.FC<AIShoppingAssistantProps> = ({
  isOpen,
  onClose,
  onProductSearch
}) => {
  const { success } = useToastHelpers();
  const { addToCart } = useCartStore();
  const { addToWishlist } = useWishlistStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your AI Shopping Assistant. I can help you find products, compare prices, get recommendations, and more. What are you looking for?',
      timestamp: new Date(),
      suggestions: [
        'Find a smartphone under $500',
        'Show me deals on headphones',
        'What\'s trending in electronics?',
        'Help me choose a laptop'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    // AI response logic
    const lowerInput = userMessage.content.toLowerCase();
    let response: Message;

    if (lowerInput.includes('find') || lowerInput.includes('search') || lowerInput.includes('show')) {
      const productMatch = userMessage.content.match(/(?:find|search|show).*?(?:for|me)?\s+(.+)/i);
      const product = productMatch ? productMatch[1] : 'products';
      
      response = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I found several options for "${product}". Here are some recommendations based on your preferences.`,
        timestamp: new Date(),
        suggestions: [
          'View all results',
          'Filter by price',
          'Show only deals',
          'Compare products'
        ],
        actions: [
          {
            label: 'Search Products',
            action: () => {
              onProductSearch?.(product);
              onClose();
            }
          }
        ]
      };
    } else if (lowerInput.includes('deal') || lowerInput.includes('discount') || lowerInput.includes('sale')) {
      response = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I found some great deals for you! Here are products currently on sale.',
        timestamp: new Date(),
        suggestions: [
          'Show all deals',
          'Deals in electronics',
          'Fashion deals',
          'Home & garden deals'
        ]
      };
    } else if (lowerInput.includes('compare') || lowerInput.includes('difference')) {
      response = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I can help you compare products! Please tell me which products you\'d like to compare, or I can suggest similar products.',
        timestamp: new Date(),
        suggestions: [
          'Compare smartphones',
          'Compare laptops',
          'Compare headphones',
          'Show comparison tool'
        ]
      };
    } else if (lowerInput.includes('recommend') || lowerInput.includes('suggest')) {
      response = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Based on your browsing history and preferences, here are my personalized recommendations for you.',
        timestamp: new Date(),
        suggestions: [
          'View recommendations',
          'Customize preferences',
          'See why recommended',
          'Save recommendations'
        ]
      };
    } else {
      response = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I can help you with:\n• Finding products\n• Comparing prices\n• Getting recommendations\n• Finding deals\n• Answering product questions\n\nWhat would you like to do?',
        timestamp: new Date(),
        suggestions: [
          'Find a product',
          'Show me deals',
          'Get recommendations',
          'Compare products'
        ]
      };
    }

    setMessages(prev => [...prev, response]);
    setLoading(false);
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="bg-white dark:bg-gray-800 rounded-t-xl w-full max-w-md h-[600px] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Brain className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Shopping Assistant</h3>
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestion(suggestion)}
                        className="block w-full text-left text-xs px-3 py-2 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {message.actions && message.actions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={action.action}
                        className="block w-full text-left text-xs px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about shopping..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIShoppingAssistant;

