import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CreditCard, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Percent,
  Calendar,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Download,
  Share2,
  Banknote,
  Building2,
  Car,
  Home,
  GraduationCap,
  Heart,
  ShoppingBag,
  Zap,
  Target,
  BarChart3,
  Calculator,
  Snowflake,
  Mountain,
  Brain,
  X,
  Info
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { DebtTracker } from '../../services/financeAPI';

const DebtTrackerPage: React.FC = () => {
  const { debtTrackers, isLoading, fetchDebtTrackers, createDebtTracker, updateDebtTracker, deleteDebtTracker } = useFinance();
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showPayoffCalculator, setShowPayoffCalculator] = useState(false);
  const [showSnowballModal, setShowSnowballModal] = useState(false);
  const [showAvalancheModal, setShowAvalancheModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedDebt, setSelectedDebt] = useState<DebtTracker | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'car_loan' | 'personal_loan'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paid_off' | 'overdue'>('all');
  const [showAmounts, setShowAmounts] = useState(true);

  useEffect(() => {
    fetchDebtTrackers();
  }, [fetchDebtTrackers]);

  const handleAddDebt = () => {
    setModalMode('add');
    setSelectedDebt(undefined);
    setShowDebtModal(true);
  };

  const handleEditDebt = (debt: DebtTracker) => {
    setModalMode('edit');
    setSelectedDebt(debt);
    setShowDebtModal(true);
  };

  const handleDeleteDebt = async (debtId: string) => {
    if (window.confirm('Are you sure you want to delete this debt? This action cannot be undone.')) {
      await deleteDebtTracker(debtId);
    }
  };

  const handleDebtSuccess = (debt: DebtTracker) => {
    if (modalMode === 'add') {
      createDebtTracker(debt);
    } else if (modalMode === 'edit') {
      updateDebtTracker(debt.id, debt);
    }
    setShowDebtModal(false);
  };

  const handleMakePayment = (debt: DebtTracker) => {
    setSelectedDebt(debt);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = (amount: number) => {
    if (selectedDebt) {
      const updated = {
        ...selectedDebt,
        current_balance: Math.max(0, selectedDebt.current_balance - amount)
      };
      if (updated.current_balance === 0) {
        updated.status = 'paid_off';
      }
      updateDebtTracker(selectedDebt.id, updated);
      setShowPaymentModal(false);
      setSelectedDebt(undefined);
    }
  };

  const getDebtTypeIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return <CreditCard className="text-purple-600" size={20} />;
      case 'loan':
        return <Banknote className="text-blue-600" size={20} />;
      case 'mortgage':
        return <Home className="text-indigo-600" size={20} />;
      case 'student_loan':
        return <GraduationCap className="text-yellow-600" size={20} />;
      case 'car_loan':
        return <Car className="text-gray-600" size={20} />;
      case 'personal_loan':
        return <Building2 className="text-green-600" size={20} />;
      default:
        return <TrendingDown className="text-red-600" size={20} />;
    }
  };

  const getDebtTypeLabel = (type: string) => {
    switch (type) {
      case 'credit_card':
        return 'Credit Card';
      case 'loan':
        return 'Personal Loan';
      case 'mortgage':
        return 'Mortgage';
      case 'student_loan':
        return 'Student Loan';
      case 'car_loan':
        return 'Car Loan';
      case 'personal_loan':
        return 'Personal Loan';
      default:
        return 'Other Debt';
    }
  };

  const getProgressPercentage = (debt: DebtTracker) => {
    const originalAmount = debt.original_amount || 0;
    const currentBalance = debt.current_balance || 0;
    if (originalAmount === 0) return 0;
    const paidAmount = originalAmount - currentBalance;
    return Math.min((paidAmount / originalAmount) * 100, 100);
  };

  const getProgressColor = (percentage: number, status: string) => {
    if (status === 'paid_off') return 'bg-green-500';
    if (status === 'overdue') return 'bg-red-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'paid_off':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    const diffTime = dueDateObj.getTime() - today.getTime();
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
        return <Target className="text-gray-600" size={16} />;
    }
  };

  const calculateMonthlyPayment = (debt: DebtTracker) => {
    const currentBalance = debt.current_balance || 0;
    const remainingPayments = debt.remaining_payments || 1;
    const interestRate = debt.interest_rate || 0;
    
    if (interestRate === 0) {
      return currentBalance / remainingPayments;
    }
    
    const monthlyRate = interestRate / 100 / 12;
    const payment = currentBalance * (monthlyRate * Math.pow(1 + monthlyRate, remainingPayments)) / 
                   (Math.pow(1 + monthlyRate, remainingPayments) - 1);
    return payment;
  };

  const filteredDebts = debtTrackers.filter(debt => {
    const matchesSearch = debt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.creditor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || debt.debt_type === filterType;
    const matchesStatus = filterStatus === 'all' || debt.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalDebt = debtTrackers.reduce((sum, debt) => sum + (debt.current_balance || 0), 0);
  const totalOriginalDebt = debtTrackers.reduce((sum, debt) => sum + (debt.original_amount || 0), 0);
  const totalPaidOff = totalOriginalDebt - totalDebt;
  const activeDebts = debtTrackers.filter(debt => debt.status === 'active').length;
  const paidOffDebts = debtTrackers.filter(debt => debt.status === 'paid_off').length;
  const overdueDebts = debtTrackers.filter(debt => debt.status === 'overdue').length;
  const totalMonthlyPayments = debtTrackers.reduce((sum, debt) => sum + calculateMonthlyPayment(debt), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Debt Tracker</h1>
          <p className="text-gray-600">Monitor and manage your debts and loans</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Brain size={16} />
            AI Payoff Strategy
          </button>
          <button
            onClick={() => setShowPayoffCalculator(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Calculator size={16} />
            Payoff Calculator
          </button>
          <button
            onClick={() => setShowSnowballModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Snowflake size={16} />
            Debt Snowball
          </button>
          <button
            onClick={() => setShowAvalancheModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Mountain size={16} />
            Debt Avalanche
          </button>
          <button
            onClick={() => setShowAmounts(!showAmounts)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title={showAmounts ? 'Hide Amounts' : 'Show Amounts'}
          >
            {showAmounts ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button
            onClick={handleAddDebt}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Debt
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
              <p className="text-sm font-medium text-gray-600">Total Debt</p>
              <p className="text-2xl font-bold text-red-600">
                {showAmounts ? `$${totalDebt.toLocaleString()}` : '••••••'}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="text-red-600" size={24} />
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
              <p className="text-sm font-medium text-gray-600">Paid Off</p>
              <p className="text-2xl font-bold text-green-600">
                {showAmounts ? `$${totalPaidOff.toLocaleString()}` : '••••••'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
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
              <p className="text-sm font-medium text-gray-600">Monthly Payments</p>
              <p className="text-2xl font-bold text-blue-600">
                {showAmounts ? `$${totalMonthlyPayments.toFixed(0)}` : '••••••'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
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
              <p className="text-sm font-medium text-gray-600">Active Debts</p>
              <p className="text-2xl font-bold text-gray-900">{activeDebts}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <BarChart3 className="text-gray-600" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Debt Overview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Debt Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">Original Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              {showAmounts ? `$${totalOriginalDebt.toLocaleString()}` : '••••••'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Balance</p>
            <p className="text-2xl font-bold text-red-600">
              {showAmounts ? `$${totalDebt.toLocaleString()}` : '••••••'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Progress</p>
            <p className="text-2xl font-bold text-green-600">
              {totalOriginalDebt > 0 ? `${((totalPaidOff / totalOriginalDebt) * 100).toFixed(1)}%` : '0%'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{activeDebts} Active</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{paidOffDebts} Paid</span>
              {overdueDebts > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">{overdueDebts} Overdue</span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-red-500 to-green-500 h-3 rounded-full transition-all"
              style={{ width: `${totalOriginalDebt > 0 ? (totalPaidOff / totalOriginalDebt) * 100 : 0}%` }}
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
                placeholder="Search debts..."
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
              <option value="credit_card">Credit Cards</option>
              <option value="loan">Personal Loans</option>
              <option value="mortgage">Mortgage</option>
              <option value="student_loan">Student Loans</option>
              <option value="car_loan">Car Loans</option>
              <option value="personal_loan">Personal Loans</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paid_off">Paid Off</option>
              <option value="overdue">Overdue</option>
            </select>
            <button
              onClick={() => fetchDebtTrackers()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Debts Grid */}
      {isLoading.debtTrackers ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading debts...</span>
          </div>
        </div>
      ) : filteredDebts.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No debts found</h3>
          <p className="mt-2 text-gray-600">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by adding your first debt.'
            }
          </p>
          {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
            <button
              onClick={handleAddDebt}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus size={16} />
              Add Debt
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDebts.map((debt, index) => {
            const progressPercentage = getProgressPercentage(debt);
            const monthlyPayment = calculateMonthlyPayment(debt);
            const daysRemaining = getDaysRemaining(debt.due_date);
            const isOverdue = daysRemaining < 0;

            return (
              <motion.div
                key={debt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Debt Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getDebtTypeIcon(debt.debt_type)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{debt.name}</h3>
                        <p className="text-sm text-gray-600">{getDebtTypeLabel(debt.debt_type)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(debt.priority)}
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(debt.status)}`}>
                        {debt.status.replace('_', ' ').charAt(0).toUpperCase() + debt.status.replace('_', ' ').slice(1)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{debt.creditor}</span>
                    <span>Account: {debt.account_number}</span>
                  </div>

                  {isOverdue && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle size={16} />
                        <span className="text-sm font-medium">Overdue by {Math.abs(daysRemaining)} days</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Debt Details */}
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
                        className={`h-3 rounded-full transition-all ${getProgressColor(progressPercentage, debt.status)}`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Current Balance</p>
                        <p className="font-semibold text-red-600">
                          {showAmounts ? `$${(debt.current_balance || 0).toLocaleString()}` : '••••••'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Original Amount</p>
                        <p className="font-semibold text-gray-900">
                          {showAmounts ? `$${(debt.original_amount || 0).toLocaleString()}` : '••••••'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Interest Rate</p>
                        <p className="font-semibold text-gray-900">{debt.interest_rate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Monthly Payment</p>
                        <p className="font-semibold text-blue-600">
                          {showAmounts ? `$${monthlyPayment.toFixed(0)}` : '••••••'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Due Date</span>
                      <span className="text-gray-900">
                        {new Date(debt.due_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Remaining Payments</span>
                      <span className="text-gray-900">{debt.remaining_payments}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 flex-wrap">
                    <button
                      onClick={() => handleMakePayment(debt)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Make Payment"
                    >
                      <Banknote size={14} />
                      Pay
                    </button>
                    <button
                      onClick={() => handleEditDebt(debt)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDebt(debt.id)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={12} />
                      {debt.priority.toUpperCase()}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Make Payment Modal */}
      {showPaymentModal && selectedDebt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Make Payment</h2>
              <button onClick={() => {
                setShowPaymentModal(false);
                setSelectedDebt(undefined);
              }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-lg font-semibold">${(selectedDebt.current_balance || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Minimum Payment</p>
                <p className="text-lg font-semibold">${(selectedDebt.monthly_payment || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min={selectedDebt.monthly_payment}
                  max={selectedDebt.current_balance}
                  defaultValue={selectedDebt.monthly_payment}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  id="payment-amount"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedDebt(undefined);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const amount = parseFloat((document.getElementById('payment-amount') as HTMLInputElement)?.value || '0');
                    if (amount >= selectedDebt.monthly_payment && amount <= selectedDebt.current_balance) {
                      handleConfirmPayment(amount);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Make Payment
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Payoff Calculator Modal */}
      {showPayoffCalculator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Debt Payoff Calculator</h2>
              <button onClick={() => setShowPayoffCalculator(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">Calculate how long it will take to pay off your debts.</p>
              <div className="space-y-3">
                {debtTrackers.filter(d => d.status === 'active').map(debt => {
                  const monthlyPayment = calculateMonthlyPayment(debt);
                  const monthsRemaining = debt.remaining_payments;
                  const totalInterest = (monthlyPayment * monthsRemaining) - debt.current_balance;
                  return (
                    <div key={debt.id} className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">{debt.name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Months Remaining</p>
                          <p className="font-semibold">{monthsRemaining}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Interest</p>
                          <p className="font-semibold">${totalInterest.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Debt Snowball Modal */}
      {showSnowballModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Debt Snowball Strategy</h2>
              <button onClick={() => setShowSnowballModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">Pay off debts from smallest to largest balance. This strategy provides psychological wins.</p>
              <div className="space-y-2">
                {[...debtTrackers].filter(d => d.status === 'active').sort((a, b) => a.current_balance - b.current_balance).map((debt, index) => (
                  <div key={debt.id} className="p-3 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold">{debt.name}</p>
                        <p className="text-sm text-gray-600">${(debt.current_balance || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Debt Avalanche Modal */}
      {showAvalancheModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Debt Avalanche Strategy</h2>
              <button onClick={() => setShowAvalancheModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">Pay off debts from highest to lowest interest rate. This strategy saves the most money.</p>
              <div className="space-y-2">
                {[...debtTrackers].filter(d => d.status === 'active').sort((a, b) => b.interest_rate - a.interest_rate).map((debt, index) => (
                  <div key={debt.id} className="p-3 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold">{debt.name}</p>
                        <p className="text-sm text-gray-600">{debt.interest_rate}% interest</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Payoff Strategy Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">AI Debt Payoff Strategy</h2>
              <button onClick={() => setShowAIModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                AI-powered debt payoff recommendations based on your financial situation.
              </p>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Recommended Strategy</h3>
                  <p className="text-sm text-gray-600 mb-2">Debt Avalanche Method</p>
                  <p className="text-xs text-gray-500">Based on your high-interest credit cards, paying highest interest first will save you $2,340 in interest.</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Payment Optimization</h3>
                  <p className="text-sm text-gray-600 mb-2">Increase monthly payment by $200</p>
                  <p className="text-xs text-gray-500">This will reduce payoff time by 8 months</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Consolidation Opportunity</h3>
                  <p className="text-sm text-gray-600 mb-2">Consider debt consolidation loan at 12% APR</p>
                  <p className="text-xs text-gray-500">Could save $1,200 annually in interest</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Apply Strategy
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DebtTrackerPage;
