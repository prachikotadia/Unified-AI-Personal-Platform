import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Bell,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Percent,
  Eye,
  Settings,
  RefreshCw,
  Filter,
  Search,
  Download,
  Brain
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import BudgetModal from '../../components/finance/BudgetModal';
import AIForecastingModal from '../../components/finance/AIForecastingModal';
import { Budget } from '../../services/financeAPI';

const BudgetsPage: React.FC = () => {
  const { budgets, isLoading, fetchBudgets, createBudget, updateBudget, deleteBudget } = useFinance();
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'category' | 'goal' | 'overall'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleAddBudget = () => {
    setModalMode('add');
    setSelectedBudget(undefined);
    setShowBudgetModal(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setModalMode('edit');
    setSelectedBudget(budget);
    setShowBudgetModal(true);
  };

  const handleDeleteBudget = (budget: Budget) => {
    setModalMode('delete');
    setSelectedBudget(budget);
    setShowBudgetModal(true);
  };

  const handleBudgetSuccess = (budget: Budget) => {
    if (modalMode === 'add') {
      createBudget(budget);
    } else if (modalMode === 'edit') {
      updateBudget(budget.id, budget);
    }
    setShowBudgetModal(false);
  };

  const handleBudgetDelete = (budgetId: string) => {
    deleteBudget(budgetId);
    setShowBudgetModal(false);
  };

  const getProgressPercentage = (budget: Budget) => {
    if (budget.amount === 0) return 0;
    return Math.min((budget.spent / budget.amount) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBudgetTypeIcon = (type: string) => {
    switch (type) {
      case 'category':
        return <PieChart className="text-blue-600" size={20} />;
      case 'goal':
        return <Target className="text-green-600" size={20} />;
      case 'overall':
        return <BarChart3 className="text-purple-600" size={20} />;
      default:
        return <Target className="text-gray-600" size={20} />;
    }
  };

  const getBudgetTypeLabel = (type: string) => {
    switch (type) {
      case 'category':
        return 'Category Budget';
      case 'goal':
        return 'Goal Budget';
      case 'overall':
        return 'Overall Budget';
      default:
        return 'Budget';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getAlertStatus = (budget: Budget) => {
    const percentage = getProgressPercentage(budget);
    if (percentage >= budget.alerts.critical_threshold * 100) {
      return { type: 'critical', icon: <AlertTriangle className="text-red-600" size={16} /> };
    } else if (percentage >= budget.alerts.warning_threshold * 100) {
      return { type: 'warning', icon: <AlertTriangle className="text-yellow-600" size={16} /> };
    }
    return null;
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || budget.budget_type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && budget.is_active) ||
                         (filterStatus === 'inactive' && !budget.is_active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalBudgetAmount = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = budgets.reduce((sum, budget) => sum + budget.remaining, 0);
  const activeBudgets = budgets.filter(budget => budget.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600">Track and manage your financial budgets</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Brain size={16} />
            AI Forecasting
          </button>
          <button
            onClick={handleAddBudget}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Budget
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
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">${totalBudgetAmount.toFixed(2)}</p>
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
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="text-red-600" size={24} />
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
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-gray-900">${totalRemaining.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
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
              <p className="text-sm font-medium text-gray-600">Active Budgets</p>
              <p className="text-2xl font-bold text-gray-900">{activeBudgets}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search budgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="category">Category Budgets</option>
              <option value="goal">Goal Budgets</option>
              <option value="overall">Overall Budgets</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={() => fetchBudgets()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Budgets Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading budgets...</span>
          </div>
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="text-center py-12">
          <Target className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No budgets found</h3>
          <p className="mt-2 text-gray-600">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by creating your first budget.'
            }
          </p>
          {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
            <button
              onClick={handleAddBudget}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus size={16} />
              Create Budget
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBudgets.map((budget, index) => (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Budget Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getBudgetTypeIcon(budget.budget_type)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{budget.name}</h3>
                      <p className="text-sm text-gray-600">{getBudgetTypeLabel(budget.budget_type)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getAlertStatus(budget)?.icon}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.is_active)}`}>
                      {budget.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Category: {budget.category.replace('_', ' ')}</span>
                  <span>Period: {budget.period}</span>
                </div>

                {budget.budget_type === 'goal' && budget.goal_amount > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-800">Goal: ${budget.goal_amount.toFixed(2)}</span>
                      {budget.goal_deadline && (
                        <span className="text-blue-600">Deadline: {new Date(budget.goal_deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Budget Progress */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {getProgressPercentage(budget).toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getProgressColor(getProgressPercentage(budget))}`}
                      style={{ width: `${getProgressPercentage(budget)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-600">Budget</p>
                      <p className="font-semibold text-gray-900">${budget.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Spent</p>
                      <p className="font-semibold text-red-600">${budget.spent.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Remaining</p>
                      <p className="font-semibold text-green-600">${budget.remaining.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Alert Thresholds */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Warning: {Math.round(budget.alerts.warning_threshold * 100)}%</span>
                    <span>Critical: {Math.round(budget.alerts.critical_threshold * 100)}%</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEditBudget(budget)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(budget)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                  <div className="flex-1" />
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <BudgetModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        mode={modalMode}
        budget={selectedBudget}
        onSuccess={handleBudgetSuccess}
        onDelete={handleBudgetDelete}
      />

      <AIForecastingModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
      />
    </div>
  );
};

export default BudgetsPage;
