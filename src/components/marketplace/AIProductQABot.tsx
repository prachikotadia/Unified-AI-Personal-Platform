import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, MessageCircle, X, Sparkles } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  answer: string;
  confidence: number;
  timestamp: Date;
}

interface AIProductQABotProps {
  productId: number;
  productName: string;
  existingQuestions?: Array<{
    question: string;
    answer: string;
  }>;
  onQuestionAsked?: (question: string, answer: string) => void;
}

const AIProductQABot: React.FC<AIProductQABotProps> = ({
  productId,
  productName,
  existingQuestions = [],
  onQuestionAsked
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [questions]);

  const handleAskQuestion = async () => {
    if (!input.trim() || loading) return;

    const userQuestion = input.trim();
    setInput('');
    setLoading(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // AI answer generation (mock)
    let answer = '';
    const lowerQuestion = userQuestion.toLowerCase();

    if (lowerQuestion.includes('size') || lowerQuestion.includes('dimension')) {
      answer = `Based on the product specifications, this item comes in standard sizes. Please refer to the size chart in the product description for exact measurements. If you need help choosing the right size, I can assist you based on your preferences.`;
    } else if (lowerQuestion.includes('warranty') || lowerQuestion.includes('guarantee')) {
      answer = `This product comes with a manufacturer's warranty. The warranty period and coverage details are listed in the product specifications. For specific warranty questions, I recommend contacting the seller directly.`;
    } else if (lowerQuestion.includes('shipping') || lowerQuestion.includes('delivery')) {
      answer = `Shipping options and delivery times vary based on your location. Standard shipping typically takes 5-7 business days, while express shipping is available for faster delivery. Free shipping is available for orders over $50.`;
    } else if (lowerQuestion.includes('return') || lowerQuestion.includes('refund')) {
      answer = `Our return policy allows returns within 30 days of purchase in original condition. Items must be unused and in original packaging. Refunds are processed within 5-7 business days after we receive the returned item.`;
    } else if (lowerQuestion.includes('compatible') || lowerQuestion.includes('work with')) {
      answer = `Compatibility information is available in the product specifications. If you're looking for compatibility with a specific device or system, please check the "Compatibility" section or contact the seller for detailed information.`;
    } else if (lowerQuestion.includes('color') || lowerQuestion.includes('colour')) {
      answer = `Available colors are listed in the product options. You can select your preferred color from the dropdown menu. If you need help choosing, I can recommend colors based on popular choices and customer reviews.`;
    } else {
      // Generic AI response
      answer = `Based on the product information and customer reviews, ${productName} is a quality product that meets the specifications listed. For more specific details, I recommend checking the product description, customer reviews, or contacting the seller directly.`;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      question: userQuestion,
      answer,
      confidence: 0.85,
      timestamp: new Date()
    };

    setQuestions(prev => [...prev, newQuestion]);
    onQuestionAsked?.(userQuestion, answer);
    setLoading(false);
  };

  const suggestedQuestions = [
    'What is the warranty period?',
    'What are the dimensions?',
    'Is this compatible with [device]?',
    'What colors are available?',
    'What is the return policy?'
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Brain className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">AI Product Assistant</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{productName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {questions.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Ask me anything about this product!
                    </p>
                    <div className="space-y-2">
                      {suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInput(q);
                            setTimeout(() => handleAskQuestion(), 100);
                          }}
                          className="block w-full text-left text-xs px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {questions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="max-w-[80%] bg-blue-600 text-white rounded-lg p-3">
                        <p className="text-sm">{q.question}</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-[80%] bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={14} className="text-blue-600" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            AI Answer ({Math.round(q.confidence * 100)}% confidence)
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{q.answer}</p>
                      </div>
                    </div>
                  </div>
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
                    onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                    placeholder="Ask a question..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  />
                  <button
                    onClick={handleAskQuestion}
                    disabled={loading || !input.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIProductQABot;

