import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target, 
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Percent,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Download,
  Share2,
  Trophy,
  Star,
  Zap,
  PiggyBank,
  Home,
  Car,
  Plane,
  GraduationCap,
  Heart,
  ShoppingBag,
  Info,
  Brain,
  X,
  GitBranch
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { FinancialGoal } from '../../services/financeAPI';
import GoalModal from '../../components/finance/GoalModal';

const GoalsPage: React.FC = () => {
  const { financialGoals, isLoading, fetchFinancialGoals, createFinancialGoal, updateFinancialGoal, deleteFinancialGoal } = useFinance();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showAIGoalModal, setShowAIGoalModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'savings' | 'debt' | 'investment' | 'purchase' | 'emergency' | 'other'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [showAmounts, setShowAmounts] = useState(true);

  useEffect(() => {
    fetchFinancialGoals();
  }, [fetchFinancialGoals]);

  const handleAddGoal = () => {
    setModalMode('add');
    setSelectedGoal(undefined);
    setShowGoalModal(true);
  };

  const handleEditGoal = (goal: FinancialGoal) => {
    setModalMode('edit');
    setSelectedGoal(goal);
    setShowGoalModal(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      await deleteFinancialGoal(goalId);
    }
  };

  const handleGoalSuccess = (goal: FinancialGoal) => {
    if (modalMode === 'add') {
      createFinancialGoal(goal);
    } else if (modalMode === 'edit') {
      updateFinancialGoal(goal.id, goal);
    }
    setShowGoalModal(false);
  };

  const handleAddProgress = (goal: FinancialGoal) => {
    setSelectedGoal(goal);
    setShowProgressModal(true);
  };

  const handleConfirmProgress = (amount: number) => {
    if (selectedGoal) {
      const updated = {
        ...selectedGoal,
        current_amount: selectedGoal.current_amount + amount
      };
      updateFinancialGoal(selectedGoal.id, updated);
      setShowProgressModal(false);
      setSelectedGoal(undefined);
    }
  };

  const handleViewTimeline = (goal: FinancialGoal) => {
    setSelectedGoal(goal);
    setShowTimelineModal(true);
  };

  const getGoalCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings':
        return <PiggyBank className="text-green-600" size={20} />;
      case 'debt':
        return <TrendingDown className="text-red-600" size={20} />;
      case 'investment':
        return <TrendingUp className="text-blue-600" size={20} />;
      case 'purchase':
        return <ShoppingBag className="text-purple-600" size={20} />;
      case 'emergency':
        return <AlertTriangle className="text-orange-600" size={20} />;
      case 'home':
        return <Home className="text-indigo-600" size={20} />;
      case 'vehicle':
        return <Car className="text-gray-600" size={20} />;
      case 'travel':
        return <Plane className="text-cyan-600" size={20} />;
      case 'education':
        return <GraduationCap className="text-yellow-600" size={20} />;
      case 'health':
        return <Heart className="text-pink-600" size={20} />;
      default:
        return <Target className="text-gray-600" size={20} />;
    }
  };

  const getGoalCategoryLabel = (category: string) => {
    switch (category) {
      case 'savings':
        return 'Savings';
      case 'debt':
        return 'Debt Repayment';
      case 'investment':
        return 'Investment';
      case 'purchase':
        return 'Purchase';
      case 'emergency':
        return 'Emergency Fund';
      case 'home':
        return 'Home';
      case 'vehicle':
        return 'Vehicle';
      case 'travel':
        return 'Travel';
      case 'education':
        return 'Education';
      case 'health':
        return 'Health';
      default:
        return 'Other';
    }
  };

  const getProgressPercentage = (goal: FinancialGoal) => {
    if (goal.target_amount === 0) return 0;
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  };

  const getProgressColor = (percentage: number, deadline: string) => {
    const isOverdue = new Date(deadline) < new Date();
    if (isOverdue) return 'bg-red-500';
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="text-red-600" size={16} />;
      case 'medium':
        return <Clock className="text-yellow-600" size={16} />;
      case 'low':
        return <CheckCircle className="text-green-600" size={16} />;
      default:
        return <Star className="text-gray-600" size={16} />;
    }
  };

  const filteredGoals = financialGoals.filter(goal => {
    const matchesSearch = goal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || goal.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalGoals = financialGoals.length;
  const completedGoals = financialGoals.filter(goal => goal.status === 'completed').length;
  const activeGoals = financialGoals.filter(goal => goal.status === 'active').length;
  const overdueGoals = financialGoals.filter(goal => goal.status === 'overdue').length;
  const totalTargetAmount = financialGoals.reduce((sum, goal) => sum + (goal.target_amount || 0), 0);
  const totalCurrentAmount = financialGoals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Goals</h1>
          <p className="text-gray-600">Set, track, and achieve your financial objectives</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowAIGoalModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Brain size={16} />
            AI Goal Recommendations
          </button>
          <button
            onClick={() => setShowAmounts(!showAmounts)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title={showAmounts ? 'Hide Amounts' : 'Show Amounts'}
          >
            {showAmounts ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button
            onClick={handleAddGoal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Goal
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Goals</p>
              <p className="text-2xl font-bold text-gray-900">{totalGoals}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="text-blue-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedGoals}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Trophy className="text-green-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-blue-600">{activeGoals}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Zap className="text-blue-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueGoals}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Total Target</p>
            <p className="text-2xl font-bold text-gray-900">
              {showAmounts ? `$${totalTargetAmount.toLocaleString()}` : '••••••'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Amount</p>
            <p className="text-2xl font-bold text-blue-600">
              {showAmounts ? `$${totalCurrentAmount.toLocaleString()}` : '••••••'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Progress</p>
            <p className="text-2xl font-bold text-green-600">
              {totalTargetAmount > 0 ? `${((totalCurrentAmount / totalTargetAmount) * 100).toFixed(1)}%` : '0%'}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all"
              style={{ width: `${totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search goals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="savings">Savings</option>
              <option value="debt">Debt Repayment</option>
              <option value="investment">Investment</option>
              <option value="purchase">Purchase</option>
              <option value="emergency">Emergency Fund</option>
              <option value="home">Home</option>
              <option value="vehicle">Vehicle</option>
              <option value="travel">Travel</option>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
            <button
              onClick={() => fetchFinancialGoals()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {isLoading.financialGoals ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading goals...</span>
          </div>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No goals found</h3>
          <p className="mt-2 text-gray-600">
            {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' 
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by creating your first financial goal.'
            }
          </p>
          {!searchTerm && filterCategory === 'all' && filterStatus === 'all' && (
            <button
              onClick={handleAddGoal}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus size={16} />
              Create Goal
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGoals.map((goal, index) => {
            const progressPercentage = getProgressPercentage(goal);
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isOverdue = daysRemaining < 0;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Goal Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getGoalCategoryIcon(goal.category)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                        <p className="text-sm text-gray-600">{getGoalCategoryLabel(goal.category)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(goal.priority)}
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                        {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{goal.description}</p>

                  {isOverdue && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle size={16} />
                        <span className="text-sm font-medium">Overdue by {Math.abs(daysRemaining)} days</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Goal Progress */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {progressPercentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${getProgressColor(progressPercentage, goal.deadline)}`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Current Amount</p>
                        <p className="font-semibold text-blue-600">
                          {showAmounts ? `$${(goal.current_amount || 0).toLocaleString()}` : '••••••'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Target Amount</p>
                        <p className="font-semibold text-gray-900">
                          {showAmounts ? `$${(goal.target_amount || 0).toLocaleString()}` : '••••••'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Deadline</span>
                      <span className="text-gray-900">
                        {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Time Remaining</span>
                      <span className={isOverdue ? 'text-red-600' : 'text-gray-900'}>
                        {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 flex-wrap">
                    <button
                      onClick={() => handleAddProgress(goal)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Add Progress"
                    >
                      <Plus size={14} />
                      Progress
                    </button>
                    <button
                      onClick={() => handleViewTimeline(goal)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="View Timeline"
                    >
                      <GitBranch size={14} />
                      Timeline
                    </button>
                    <button
                      onClick={() => handleEditGoal(goal)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={12} />
                      {goal.priority.toUpperCase()}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={showGoalModal}
        onClose={() => {
          setShowGoalModal(false);
          setSelectedGoal(undefined);
        }}
        mode={modalMode === 'delete' ? 'edit' : modalMode}
        goal={selectedGoal}
        onSave={handleGoalSuccess}
      />

      {/* Add Progress Modal */}
      {showProgressModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Progress to {selectedGoal.name}</h2>
              <button onClick={() => {
                setShowProgressModal(false);
                setSelectedGoal(undefined);
              }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Progress</label>
                <p className="text-lg font-semibold">
                  ${(selectedGoal.current_amount || 0).toLocaleString()} of ${(selectedGoal.target_amount || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Add</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  id="progress-amount"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowProgressModal(false);
                    setSelectedGoal(undefined);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const amount = parseFloat((document.getElementById('progress-amount') as HTMLInputElement)?.value || '0');
                    if (amount > 0) {
                      handleConfirmProgress(amount);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Progress
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Timeline Modal */}
      {showTimelineModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Timeline: {selectedGoal.name}</h2>
              <button onClick={() => {
                setShowTimelineModal(false);
                setSelectedGoal(undefined);
              }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {/* Start Point */}
                  <div className="relative pl-12">
                    <div className="absolute left-0 top-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Target size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Goal Created</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedGoal.created_at || new Date().toISOString()).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">Target: ${(selectedGoal.target_amount || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Progress Milestones */}
                  <div className="relative pl-12">
                    <div className="absolute left-0 top-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <TrendingUp size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Current Progress</h3>
                      <p className="text-sm text-gray-600">
                        ${(selectedGoal.current_amount || 0).toLocaleString()} ({getProgressPercentage(selectedGoal).toFixed(1)}%)
                      </p>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="relative pl-12">
                    <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center ${
                      new Date(selectedGoal.deadline) < new Date() ? 'bg-red-500' : 'bg-purple-500'
                    }`}>
                      <Calendar size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Target Deadline</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedGoal.deadline).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getDaysRemaining(selectedGoal.deadline) < 0 
                          ? `${Math.abs(getDaysRemaining(selectedGoal.deadline))} days overdue`
                          : `${getDaysRemaining(selectedGoal.deadline)} days remaining`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Goal Recommendations Modal */}
      {showAIGoalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">AI Goal Recommendations</h2>
              <button onClick={() => setShowAIGoalModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                AI-powered goal recommendations based on your financial situation and spending patterns.
              </p>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Emergency Fund</h3>
                  <p className="text-sm text-gray-600 mb-2">Recommended: $10,000</p>
                  <p className="text-xs text-gray-500">Based on 3-6 months of expenses</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Retirement Savings</h3>
                  <p className="text-sm text-gray-600 mb-2">Recommended: $50,000 by age 30</p>
                  <p className="text-xs text-gray-500">Based on your current age and income</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Debt Payoff</h3>
                  <p className="text-sm text-gray-600 mb-2">Recommended: Pay off high-interest debt first</p>
                  <p className="text-xs text-gray-500">Focus on debts above 10% interest rate</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Apply Recommendations
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
