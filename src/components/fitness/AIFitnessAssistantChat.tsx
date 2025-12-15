import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Brain, MessageSquare, Loader2, Sparkles, Bot, User } from 'lucide-react';

interface AIFitnessAssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
  fitnessContext?: {
    recentWorkouts?: any[];
    goals?: any[];
    nutritionData?: any;
    progressData?: any;
  };
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
  suggestions?: string[];
}

const AIFitnessAssistantChat: React.FC<AIFitnessAssistantChatProps> = ({
  isOpen,
  onClose,
  initialMessage,
  fitnessContext
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      setMessages([{
        id: 'initial-ai',
        sender: 'ai',
        text: initialMessage,
        timestamp: new Date()
      }]);
    } else if (messages.length === 0) {
      setMessages([{
        id: 'welcome-ai',
        sender: 'ai',
        text: 'Hello! I\'m your AI Fitness Assistant. I can help you with workout planning, nutrition advice, recovery tips, and progress tracking. What would you like to know?',
        timestamp: new Date(),
        suggestions: [
          'Create a workout plan',
          'Nutrition advice',
          'Recovery tips',
          'Track my progress'
        ]
      }]);
    }
  }, [initialMessage, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || isSending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate AI response based on user input
    const aiResponse = generateAIResponse(userMessage.text);
    
    setMessages((prev) => [...prev, aiResponse]);
    setIsSending(false);
  };

  const generateAIResponse = (userInput: string): ChatMessage => {
    const lowerInput = userInput.toLowerCase().trim();
    let response = '';
    let suggestions: string[] = [];

    // Handle greetings
    if (lowerInput === 'hi' || lowerInput === 'hello' || lowerInput === 'hey' || lowerInput.startsWith('hi ') || lowerInput.startsWith('hello ')) {
      const greetings = [
        'Hello! I\'m your AI Fitness Assistant. I can help you with workout planning, nutrition advice, recovery tips, and progress tracking. What would you like to know?',
        'Hi there! Ready to help you reach your fitness goals. What can I assist you with today?',
        'Hey! I\'m here to support your fitness journey. How can I help you?'
      ];
      return {
        id: Date.now().toString(),
        sender: 'ai',
        text: greetings[Math.floor(Math.random() * greetings.length)],
        timestamp: new Date(),
        suggestions: [
          'Create a workout plan',
          'Nutrition advice',
          'Recovery tips',
          'Track my progress'
        ]
      };
    }

    if (lowerInput.includes('workout') || lowerInput.includes('exercise') || lowerInput.includes('training')) {
      response = 'I can help you create a personalized workout plan! Based on your fitness goals and current level, I recommend:\n\n' +
        '1. **Strength Training**: 3-4 times per week focusing on compound movements\n' +
        '2. **Cardio**: 2-3 times per week for cardiovascular health\n' +
        '3. **Flexibility**: Daily stretching or yoga sessions\n\n' +
        'Would you like me to create a specific workout plan for you?';
      suggestions = ['Create strength plan', 'Cardio recommendations', 'Flexibility routine'];
    } else if (lowerInput.includes('nutrition') || lowerInput.includes('diet') || lowerInput.includes('meal')) {
      response = 'Great question about nutrition! Here are some key recommendations:\n\n' +
        '1. **Protein**: Aim for 0.8-1g per pound of body weight for muscle recovery\n' +
        '2. **Carbohydrates**: Include complex carbs for energy, especially around workouts\n' +
        '3. **Hydration**: Drink 2.5-3 liters of water daily\n' +
        '4. **Timing**: Eat protein within 30 minutes post-workout\n\n' +
        'Would you like a personalized meal plan?';
      suggestions = ['Meal plan', 'Protein recommendations', 'Hydration tips'];
    } else if (lowerInput.includes('recovery') || lowerInput.includes('rest') || lowerInput.includes('sore')) {
      response = 'Recovery is crucial for progress! Here are my top recommendations:\n\n' +
        '1. **Sleep**: Aim for 7-9 hours of quality sleep\n' +
        '2. **Active Recovery**: Light activities like walking or yoga on rest days\n' +
        '3. **Stretching**: 10-15 minutes post-workout\n' +
        '4. **Nutrition**: Ensure adequate protein and hydration\n' +
        '5. **Rest Days**: Take 1-2 complete rest days per week\n\n' +
        'How are you feeling after your recent workouts?';
      suggestions = ['Sleep tips', 'Stretching routine', 'Active recovery ideas'];
    } else if (lowerInput.includes('progress') || lowerInput.includes('track') || lowerInput.includes('results')) {
      response = 'Tracking progress is essential! Here\'s what I recommend:\n\n' +
        '1. **Measurements**: Track weight, body fat, and measurements weekly\n' +
        '2. **Photos**: Take progress photos monthly\n' +
        '3. **Performance**: Log workout performance (weights, reps, duration)\n' +
        '4. **How you feel**: Note energy levels and recovery\n\n' +
        'Would you like me to analyze your current progress?';
      suggestions = ['Analyze progress', 'Set goals', 'View trends'];
    } else if (lowerInput.includes('goal') || lowerInput.includes('target')) {
      response = 'Setting clear goals is the first step to success! Here\'s how to set effective fitness goals:\n\n' +
        '1. **Be Specific**: Instead of "get fit", try "lose 10 pounds in 3 months"\n' +
        '2. **Measurable**: Track progress with numbers\n' +
        '3. **Achievable**: Set realistic targets\n' +
        '4. **Time-bound**: Set deadlines\n\n' +
        'What specific fitness goal would you like to achieve?';
      suggestions = ['Weight loss goal', 'Muscle gain goal', 'Endurance goal'];
    } else {
      response = 'I\'m here to help with all aspects of your fitness journey! I can assist with:\n\n' +
        '• Workout planning and exercise selection\n' +
        '• Nutrition advice and meal planning\n' +
        '• Recovery and rest recommendations\n' +
        '• Progress tracking and goal setting\n' +
        '• Answering fitness-related questions\n\n' +
        'What would you like to know more about?';
      suggestions = ['Workout help', 'Nutrition advice', 'Recovery tips', 'Progress tracking'];
    }

    return {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: response,
      timestamp: new Date(),
      suggestions
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Brain className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="font-semibold">AI Fitness Assistant</h2>
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
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
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

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about fitness..."
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AIFitnessAssistantChat;

