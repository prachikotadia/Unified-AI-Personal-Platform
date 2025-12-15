import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Brain, MessageSquare, Loader2, Bot, User } from 'lucide-react';

interface AIChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  conversationContext?: string[];
  onSendMessage?: (message: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  isOpen,
  onClose,
  conversationContext = [],
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
        text: 'Hello! I\'m your AI Chat Assistant. I can help you with message suggestions, conversation summaries, translations, and more. How can I assist you?',
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
    const lowerInput = userInput.toLowerCase().trim();
    
    // Handle greetings
    if (lowerInput === 'hi' || lowerInput === 'hello' || lowerInput === 'hey' || lowerInput === 'hey there' || lowerInput.startsWith('hi ') || lowerInput.startsWith('hello ')) {
      const greetings = [
        'Hello! How can I help you today?',
        'Hi there! What would you like to know?',
        'Hey! I\'m here to assist you. What can I do for you?',
        'Hello! I\'m your AI assistant. How can I help?',
        'Hi! I\'m ready to help. What do you need?'
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Handle "how are you" type questions
    if (lowerInput.includes('how are you') || lowerInput.includes('how\'s it going') || lowerInput.includes('how do you do')) {
      return 'I\'m doing great, thank you for asking! I\'m here and ready to help you with anything you need. How can I assist you today?';
    }
    
    // Handle "what can you do" type questions
    if (lowerInput.includes('what can you do') || lowerInput.includes('what do you do') || lowerInput.includes('help me') || lowerInput.includes('capabilities')) {
      return 'I can help you with many things! I can assist with message suggestions, conversation summaries, translations, sentiment analysis, and more. What would you like to try?';
    }
    
    // Handle specific feature requests
    if (lowerInput.includes('suggest') || lowerInput.includes('message')) {
      return 'I can help you craft better messages! Based on your conversation context, I suggest being clear, concise, and friendly. Would you like me to generate specific message suggestions?';
    } else if (lowerInput.includes('summarize') || lowerInput.includes('summary')) {
      return 'I can summarize your conversations! I\'ll extract key points, action items, and important information. Would you like me to summarize a specific conversation?';
    } else if (lowerInput.includes('translate') || lowerInput.includes('language')) {
      return 'I can translate messages between multiple languages! Just let me know which language you\'d like to translate to, and I\'ll help you communicate across language barriers.';
    } else if (lowerInput.includes('sentiment') || lowerInput.includes('tone')) {
      return 'I can analyze the sentiment and tone of your conversations! This helps you understand the emotional context and adjust your communication style accordingly.';
    } else if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return 'You\'re welcome! I\'m always here to help. Is there anything else you\'d like to know?';
    } else if (lowerInput.includes('bye') || lowerInput.includes('goodbye') || lowerInput.includes('see you')) {
      return 'Goodbye! Feel free to come back anytime if you need help. Have a great day!';
    } else {
      // Default helpful response
      const defaultResponses = [
        'I\'m here to help with your chat needs! I can assist with message suggestions, conversation summaries, translations, sentiment analysis, and more. What would you like help with?',
        'That\'s interesting! I can help you with various chat features like message suggestions, translations, and conversation analysis. What would you like to explore?',
        'I\'m your AI assistant ready to help! I can assist with message crafting, translations, summaries, and more. How can I assist you today?'
      ];
      return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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
              <h2 className="font-semibold">AI Chat Assistant</h2>
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
              placeholder="Ask me anything about chat features..."
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

export default AIChatAssistant;

