import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  ArrowLeft, 
  CheckCircle, 
  X, 
  AlertCircle,
  Search,
  Filter,
  Calendar,
  User,
  Flag,
  Shield,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  BarChart3,
  Clock,
  Star
} from 'lucide-react';

interface Question {
  id: string;
  productId: string;
  productName: string;
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
  status: 'pending' | 'answered' | 'rejected' | 'flagged';
  isVerified: boolean;
  reportCount: number;
  reportReasons: string[];
}

const QAModerationPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'flagged' | 'rejected'>('all');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      // Mock data
      const mockQuestions: Question[] = [
        {
          id: '1',
          productId: '1',
          productName: 'Apple iPhone 15 Pro Max',
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
          isVerified: true,
          reportCount: 0,
          reportReasons: []
        },
        {
          id: '2',
          productId: '1',
          productName: 'Apple iPhone 15 Pro Max',
          question: 'Is this phone worth the money?',
          status: 'flagged',
          askedBy: {
            name: 'Anonymous User',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            verified: false
          },
          askedAt: '2024-01-16T09:00:00Z',
          helpful: 0,
          notHelpful: 5,
          status: 'flagged',
          isVerified: false,
          reportCount: 3,
          reportReasons: ['Spam', 'Inappropriate content', 'Offensive language']
        },
        {
          id: '3',
          productId: '2',
          productName: 'Sony WH-1000XM4 Headphones',
          question: 'How long does the battery last?',
          status: 'pending',
          askedBy: {
            name: 'Sarah Johnson',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
            verified: true
          },
          askedAt: '2024-01-16T11:00:00Z',
          helpful: 0,
          notHelpful: 0,
          isVerified: false,
          reportCount: 0,
          reportReasons: []
        },
        {
          id: '4',
          productId: '3',
          productName: 'Samsung 65" QLED TV',
          question: 'Does this TV have good picture quality?',
          answer: 'Yes, this TV has excellent picture quality with QLED technology and 4K resolution.',
          askedBy: {
            name: 'Mike Wilson',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            verified: true
          },
          answeredBy: {
            name: 'Samsung Support',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            verified: true,
            isSeller: true
          },
          askedAt: '2024-01-15T16:00:00Z',
          answeredAt: '2024-01-15T18:30:00Z',
          helpful: 8,
          notHelpful: 1,
          status: 'answered',
          isVerified: true,
          reportCount: 0,
          reportReasons: []
        },
        {
          id: '5',
          productId: '4',
          productName: 'Instant Pot Duo',
          question: 'This product is terrible, don\'t buy it!',
          status: 'rejected',
          askedBy: {
            name: 'Anonymous User',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            verified: false
          },
          askedAt: '2024-01-14T14:00:00Z',
          helpful: 0,
          notHelpful: 15,
          isVerified: false,
          reportCount: 8,
          reportReasons: ['Inappropriate content', 'Offensive language', 'False information', 'Spam']
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

  const handleApproveQuestion = (questionId: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, status: 'answered' as const, isVerified: true }
        : q
    ));
  };

  const handleRejectQuestion = (questionId: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, status: 'rejected' as const }
        : q
    ));
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleBulkAction = (action: 'approve' | 'reject' | 'delete') => {
    selectedQuestions.forEach(questionId => {
      switch (action) {
        case 'approve':
          handleApproveQuestion(questionId);
          break;
        case 'reject':
          handleRejectQuestion(questionId);
          break;
        case 'delete':
          handleDeleteQuestion(questionId);
          break;
      }
    });
    setSelectedQuestions(new Set());
  };

  const toggleQuestionSelection = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const getFilteredQuestions = () => {
    let filtered = questions;

    if (searchQuery) {
      filtered = filtered.filter(q =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.askedBy.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter);
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'flagged':
        return 'text-red-600 bg-red-100';
      case 'rejected':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'flagged':
        return <Flag className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredQuestions = getFilteredQuestions();

  const stats = {
    total: questions.length,
    pending: questions.filter(q => q.status === 'pending').length,
    flagged: questions.filter(q => q.status === 'flagged').length,
    rejected: questions.filter(q => q.status === 'rejected').length,
    answered: questions.filter(q => q.status === 'answered').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/marketplace" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft size={20} className="mr-2" />
                Back to Marketplace
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-blue-600">
                <Shield className="w-6 h-6" />
                <h1 className="text-2xl font-bold text-gray-900">Q&A Moderation</h1>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                <Shield className="w-3 h-3" />
                <span>Admin Panel</span>
              </div>
            </div>
            <button
              onClick={fetchQuestions}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Flagged</p>
                <p className="text-2xl font-bold text-red-600">{stats.flagged}</p>
              </div>
              <Flag className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-600">{stats.rejected}</p>
              </div>
              <X className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.answered}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions, products, or users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedQuestions.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedQuestions.size} question(s) selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Approve All
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedQuestions.has(question.id)}
                    onChange={() => toggleQuestionSelection(question.id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />

                  {/* Question Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-gray-900">{question.productName}</span>
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(question.status)}`}>
                            {getStatusIcon(question.status)}
                            <span className="capitalize">{question.status}</span>
                          </div>
                          {question.reportCount > 0 && (
                            <div className="flex items-center space-x-1 text-red-600 text-xs">
                              <Flag className="w-3 h-3" />
                              <span>{question.reportCount} reports</span>
                            </div>
                          )}
                        </div>

                        <p className="text-gray-900 mb-3">{question.question}</p>

                        {question.answer && (
                          <div className="bg-gray-50 border-l-2 border-blue-200 pl-4 py-2 mb-3">
                            <p className="text-gray-700">{question.answer}</p>
                          </div>
                        )}

                        {/* User Info */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <img
                              src={question.askedBy.avatar}
                              alt={question.askedBy.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span>{question.askedBy.name}</span>
                            {question.askedBy.verified && (
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <span>{new Date(question.askedAt).toLocaleDateString()}</span>
                          <div className="flex items-center space-x-2">
                            <span>Helpful: {question.helpful}</span>
                            <span>Not Helpful: {question.notHelpful}</span>
                          </div>
                        </div>

                        {/* Report Reasons */}
                        {question.reportReasons.length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                            <h4 className="text-sm font-medium text-red-800 mb-2">Report Reasons:</h4>
                            <div className="flex flex-wrap gap-2">
                              {question.reportReasons.map((reason, index) => (
                                <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/marketplace/product/${question.productId}`}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {question.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveQuestion(question.id)}
                              className="p-2 text-green-600 hover:text-green-700 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectQuestion(question.id)}
                              className="p-2 text-red-600 hover:text-red-700 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QAModerationPage;
