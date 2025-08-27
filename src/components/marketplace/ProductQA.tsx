import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Plus, 
  Minus, 
  ThumbsUp, 
  ThumbsDown, 
  User, 
  CheckCircle, 
  AlertCircle,
  Send,
  Edit,
  Trash2,
  Flag,
  Calendar,
  Star,
  HelpCircle
} from 'lucide-react';

interface Question {
  id: string;
  productId: string;
  question: string;
  answer?: string;
  askedBy: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  answeredBy?: {
    name: string;
    avatar: string;
    verified: boolean;
    isSeller: boolean;
  };
  askedAt: string;
  answeredAt?: string;
  helpful: number;
  notHelpful: number;
  status: 'pending' | 'answered' | 'rejected';
  isVerified: boolean;
}

interface ProductQAProps {
  productId: string;
  productName: string;
  onAskQuestion?: (question: string) => void;
  onAnswerQuestion?: (questionId: string, answer: string) => void;
  onVoteHelpful?: (questionId: string, isHelpful: boolean) => void;
  onReportQuestion?: (questionId: string, reason: string) => void;
  isModerator?: boolean;
}

const ProductQA: React.FC<ProductQAProps> = ({
  productId,
  productName,
  onAskQuestion,
  onAnswerQuestion,
  onVoteHelpful,
  onReportQuestion,
  isModerator = false
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAskForm, setShowAskForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [answeringQuestion, setAnsweringQuestion] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'answered' | 'pending'>('all');

  useEffect(() => {
    fetchQuestions();
  }, [productId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      // Mock data
      const mockQuestions: Question[] = [
        {
          id: '1',
          productId,
          question: 'Does this phone support wireless charging?',
          answer: 'Yes, the iPhone 15 Pro Max supports MagSafe wireless charging up to 15W and Qi wireless charging up to 7.5W.',
          askedBy: {
            name: 'John Smith',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            verified: true
          },
          answeredBy: {
            name: 'Apple Support',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            verified: true,
            isSeller: true
          },
          askedAt: '2024-01-15T10:00:00Z',
          answeredAt: '2024-01-15T14:30:00Z',
          helpful: 12,
          notHelpful: 2,
          status: 'answered',
          isVerified: true
        },
        {
          id: '2',
          productId,
          question: 'What\'s the battery life like for gaming?',
          answer: 'The iPhone 15 Pro Max offers excellent battery life for gaming. You can expect around 6-8 hours of continuous gaming on high settings, depending on the game and brightness level.',
          askedBy: {
            name: 'Sarah Johnson',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
            verified: false
          },
          answeredBy: {
            name: 'Tech Expert',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            verified: true,
            isSeller: false
          },
          askedAt: '2024-01-14T16:00:00Z',
          answeredAt: '2024-01-14T18:45:00Z',
          helpful: 8,
          notHelpful: 1,
          status: 'answered',
          isVerified: true
        },
        {
          id: '3',
          productId,
          question: 'Is the camera quality better than the previous model?',
          status: 'pending',
          askedBy: {
            name: 'Mike Wilson',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            verified: true
          },
          askedAt: '2024-01-16T09:00:00Z',
          helpful: 0,
          notHelpful: 0,
          isVerified: false
        },
        {
          id: '4',
          productId,
          question: 'Does it come with a charger in the box?',
          answer: 'No, the iPhone 15 Pro Max does not come with a charger in the box. It includes a USB-C to Lightning cable, but you\'ll need to purchase a compatible charger separately.',
          askedBy: {
            name: 'Emily Davis',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
            verified: false
          },
          answeredBy: {
            name: 'Apple Support',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            verified: true,
            isSeller: true
          },
          askedAt: '2024-01-13T11:00:00Z',
          answeredAt: '2024-01-13T15:20:00Z',
          helpful: 25,
          notHelpful: 3,
          status: 'answered',
          isVerified: true
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      setQuestions(mockQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    try {
      const question: Question = {
        id: Date.now().toString(),
        productId,
        question: newQuestion,
        askedBy: {
          name: 'Current User',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          verified: true
        },
        askedAt: new Date().toISOString(),
        helpful: 0,
        notHelpful: 0,
        status: 'pending',
        isVerified: false
      };

      setQuestions(prev => [question, ...prev]);
      setNewQuestion('');
      setShowAskForm(false);

      if (onAskQuestion) {
        onAskQuestion(newQuestion);
      }
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  const handleAnswerQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || !answeringQuestion) return;

    try {
      setQuestions(prev => prev.map(q => 
        q.id === answeringQuestion 
          ? {
              ...q,
              answer: answerText,
              answeredBy: {
                name: 'Current User',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
                verified: true,
                isSeller: false
              },
              answeredAt: new Date().toISOString(),
              status: 'answered' as const
            }
          : q
      ));

      setAnswerText('');
      setAnsweringQuestion(null);

      if (onAnswerQuestion) {
        onAnswerQuestion(answeringQuestion, answerText);
      }
    } catch (error) {
      console.error('Error answering question:', error);
    }
  };

  const handleVoteHelpful = (questionId: string, isHelpful: boolean) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? {
            ...q,
            helpful: isHelpful ? q.helpful + 1 : q.helpful,
            notHelpful: !isHelpful ? q.notHelpful + 1 : q.notHelpful
          }
        : q
    ));

    if (onVoteHelpful) {
      onVoteHelpful(questionId, isHelpful);
    }
  };

  const toggleQuestionExpansion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const getFilteredQuestions = () => {
    if (filter === 'all') return questions;
    return questions.filter(q => q.status === filter);
  };

  const filteredQuestions = getFilteredQuestions();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Questions & Answers</h3>
          <span className="text-sm text-gray-500">({questions.length})</span>
        </div>
        <button
          onClick={() => setShowAskForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ask a Question</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        {[
          { value: 'all', label: 'All Questions', count: questions.length },
          { value: 'answered', label: 'Answered', count: questions.filter(q => q.status === 'answered').length },
          { value: 'pending', label: 'Pending', count: questions.filter(q => q.status === 'pending').length }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label} ({option.count})
          </button>
        ))}
      </div>

      {/* Ask Question Form */}
      <AnimatePresence>
        {showAskForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
          >
            <form onSubmit={handleAskQuestion}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ask a question about {productName}
                </label>
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {newQuestion.length}/500 characters
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={!newQuestion.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Question
                </button>
                <button
                  type="button"
                  onClick={() => setShowAskForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No questions yet' : `No ${filter} questions`}
            </h4>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'Be the first to ask a question about this product'
                : `No ${filter} questions found`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowAskForm(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Ask First Question</span>
              </button>
            )}
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-4"
            >
              {/* Question */}
              <div className="flex items-start space-x-3">
                <img
                  src={question.askedBy.avatar}
                  alt={question.askedBy.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{question.askedBy.name}</span>
                    {question.askedBy.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(question.askedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-900 mb-3">{question.question}</p>
                  
                  {/* Question Actions */}
                  <div className="flex items-center space-x-4 text-sm">
                    <button
                      onClick={() => handleVoteHelpful(question.id, true)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Helpful ({question.helpful})</span>
                    </button>
                    <button
                      onClick={() => handleVoteHelpful(question.id, false)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Not Helpful ({question.notHelpful})</span>
                    </button>
                    {!question.answer && (
                      <button
                        onClick={() => setAnsweringQuestion(question.id)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Answer
                      </button>
                    )}
                    <button className="text-gray-600 hover:text-gray-700">
                      Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Answer Form */}
              {answeringQuestion === question.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <form onSubmit={handleAnswerQuestion}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Answer
                      </label>
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        maxLength={1000}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {answerText.length}/1000 characters
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={!answerText.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Submit Answer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAnsweringQuestion(null);
                          setAnswerText('');
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Answer */}
              {question.answer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 pl-11"
                >
                  <div className="border-l-2 border-blue-200 pl-4">
                    <div className="flex items-start space-x-3">
                      <img
                        src={question.answeredBy?.avatar}
                        alt={question.answeredBy?.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{question.answeredBy?.name}</span>
                          {question.answeredBy?.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          )}
                          {question.answeredBy?.isSeller && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Seller
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {question.answeredAt && new Date(question.answeredAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-900">{question.answer}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Status Badge */}
              {question.status === 'pending' && (
                <div className="mt-3 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600">Awaiting answer</span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductQA;
