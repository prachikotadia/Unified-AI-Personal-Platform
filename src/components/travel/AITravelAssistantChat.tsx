import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Send, X, Minimize2, Maximize2, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AITravelAssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  initialMessage?: string;
}

const AITravelAssistantChat: React.FC<AITravelAssistantChatProps> = ({
  isOpen,
  onClose,
  onMinimize,
  initialMessage
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: initialMessage || 'Hello! I\'m your AI Travel Assistant. I can help you plan trips, find destinations, optimize itineraries, and answer travel questions. How can I assist you today?',
      timestamp: new Date()
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
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: generateAIResponse(userMessage.content),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiResponse]);
    setLoading(false);
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('budget') || lowerInput.includes('cost') || lowerInput.includes('price')) {
      return 'I can help you optimize your travel budget! Based on your destination and travel dates, I can suggest ways to save money on flights, accommodations, and activities. Would you like me to analyze your current trip budget?';
    }

    if (lowerInput.includes('destination') || lowerInput.includes('where') || lowerInput.includes('place')) {
      return 'I can recommend destinations based on your preferences! Tell me about your interests (beach, mountains, culture, adventure), budget, and travel dates, and I\'ll suggest perfect destinations for you.';
    }

    if (lowerInput.includes('itinerary') || lowerInput.includes('schedule') || lowerInput.includes('plan')) {
      return 'I can help you create or optimize your itinerary! I can suggest activities, restaurants, and the best order to visit places. Would you like me to review your current itinerary?';
    }

    if (lowerInput.includes('flight') || lowerInput.includes('airline') || lowerInput.includes('booking')) {
      return 'I can help with flight bookings and price predictions! I can analyze flight prices, suggest the best time to book, and help you find the best deals. What route are you looking for?';
    }

    if (lowerInput.includes('hotel') || lowerInput.includes('accommodation') || lowerInput.includes('stay')) {
      return 'I can help you find the perfect accommodation! Based on your preferences and budget, I can recommend hotels, vacation rentals, or other options. What are you looking for?';
    }

    if (lowerInput.includes('restaurant') || lowerInput.includes('food') || lowerInput.includes('dining')) {
      return 'I can recommend restaurants based on your cuisine preferences, budget, and location! I can suggest local favorites, fine dining, or budget-friendly options. What type of food are you interested in?';
    }

    if (lowerInput.includes('activity') || lowerInput.includes('things to do') || lowerInput.includes('attractions')) {
      return 'I can suggest activities and attractions! Based on your interests and destination, I can recommend must-see places, hidden gems, and experiences. What are you interested in?';
    }

    return 'I understand you\'re asking about travel. I can help with:\n\n• Destination recommendations\n• Budget optimization\n• Itinerary planning\n• Flight price predictions\n• Hotel bookings\n• Restaurant suggestions\n• Activity recommendations\n\nWhat would you like help with?';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[600px] z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Brain className="text-blue-600" size={20} />
          <h3 className="font-semibold">AI Travel Assistant</h3>
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded">
            AI
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Minimize2 size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles size={12} className="text-blue-600" />
                  <span className="text-xs font-medium">AI Assistant</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</span>
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
            placeholder="Ask me anything about travel..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITravelAssistantChat;

