import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
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
  BarChart3,
  PieChart,
  Target,
  Zap,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Globe,
  Coins,
  Briefcase,
  Monitor,
  Package,
  Receipt,
  Info,
  Brain,
  X,
  LineChart,
  LayoutGrid,
  ArrowUpDown
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { Investment } from '../../services/financeAPI';
import { Link } from 'react-router-dom';

const InvestmentsPage: React.FC = () => {
  const { investments, isLoading, fetchInvestments, createInvestment, updateInvestment, deleteInvestment } = useFinance();
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'stocks' | 'bonds' | 'etfs' | 'mutual_funds' | 'real_estate' | 'crypto' | 'other'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'sold' | 'pending'>('all');
  const [showAmounts, setShowAmounts] = useState(true);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const handleAddInvestment = () => {
    setModalMode('add');
    setSelectedInvestment(undefined);
    setShowInvestmentModal(true);
  };

  const handleEditInvestment = (investment: Investment) => {
    setModalMode('edit');
    setSelectedInvestment(investment);
    setShowInvestmentModal(true);
  };

  const handleDeleteInvestment = async (investmentId: string) => {
    if (window.confirm('Are you sure you want to delete this investment? This action cannot be undone.')) {
      await deleteInvestment(investmentId);
    }
  };

  const handleInvestmentSuccess = (investment: Investment) => {
    if (modalMode === 'add') {
      createInvestment(investment);
    } else if (modalMode === 'edit') {
      updateInvestment(investment.id, investment);
    }
    setShowInvestmentModal(false);
  };

  const handleViewDetails = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowDetailModal(true);
  };

  const handleAddTransaction = (investment?: Investment) => {
    if (investment) {
      setSelectedInvestment(investment);
    }
    setShowTransactionModal(true);
  };

  const getInvestmentTypeIcon = (type: string) => {
    switch (type) {
      case 'stocks':
        return <TrendingUp className="text-green-600" size={20} />;
      case 'bonds':
        return <Building2 className="text-blue-600" size={20} />;
      case 'etfs':
        return <BarChart3 className="text-purple-600" size={20} />;
      case 'mutual_funds':
        return <PieChart className="text-indigo-600" size={20} />;
      case 'real_estate':
        return <Package className="text-orange-600" size={20} />;
      case 'crypto':
        return <Coins className="text-yellow-600" size={20} />;
      default:
        return <Briefcase className="text-gray-600" size={20} />;
    }
  };

  const getInvestmentTypeLabel = (type: string) => {
    switch (type) {
      case 'stocks':
        return 'Stocks';
      case 'bonds':
        return 'Bonds';
      case 'etfs':
        return 'ETFs';
      case 'mutual_funds':
        return 'Mutual Funds';
      case 'real_estate':
        return 'Real Estate';
      case 'crypto':
        return 'Cryptocurrency';
      default:
        return 'Other';
    }
  };

  const getReturnPercentage = (investment: Investment) => {
    const purchasePrice = investment.purchase_price || 0;
    const currentValue = investment.current_value || 0;
    if (purchasePrice === 0) return 0;
    return ((currentValue - purchasePrice) / purchasePrice) * 100;
  };

  const getReturnColor = (returnPercentage: number) => {
    if (returnPercentage > 0) return 'text-green-600';
    if (returnPercentage < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
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

  const calculateTotalValue = () => {
    return investments.reduce((sum, investment) => sum + (investment.current_value || 0), 0);
  };

  const calculateTotalCost = () => {
    return investments.reduce((sum, investment) => sum + (investment.purchase_price || 0), 0);
  };

  const calculateTotalReturn = () => {
    return calculateTotalValue() - calculateTotalCost();
  };

  const calculateTotalReturnPercentage = () => {
    const totalCost = calculateTotalCost();
    if (totalCost === 0) return 0;
    return (calculateTotalReturn() / totalCost) * 100;
  };

  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || investment.investment_type === filterType;
    const matchesStatus = filterStatus === 'all' || investment.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalValue = calculateTotalValue();
  const totalCost = calculateTotalCost();
  const totalReturn = calculateTotalReturn();
  const totalReturnPercentage = calculateTotalReturnPercentage();
  const activeInvestments = investments.filter(inv => inv.status === 'active').length;
  const soldInvestments = investments.filter(inv => inv.status === 'sold').length;
  const pendingInvestments = investments.filter(inv => inv.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
          <p className="text-gray-600">Track and manage your investment portfolio</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Brain size={16} />
            AI Recommendations
          </button>
          <button
            onClick={() => setShowPortfolioModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <LayoutGrid size={16} />
            Portfolio View
          </button>
          <button
            onClick={() => setShowPerformanceModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <LineChart size={16} />
            Performance Chart
          </button>
          <button
            onClick={() => handleAddTransaction()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ArrowUpDown size={16} />
            Add Transaction
          </button>
          <button
            onClick={() => setShowAmounts(!showAmounts)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title={showAmounts ? 'Hide Amounts' : 'Show Amounts'}
          >
            {showAmounts ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button
            onClick={handleAddInvestment}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Investment
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
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {showAmounts ? `$${totalValue.toLocaleString()}` : '••••••'}
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
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Return</p>
              <p className={`text-2xl font-bold ${getReturnColor(totalReturnPercentage)}`}>
                {showAmounts ? `$${totalReturn.toLocaleString()}` : '••••••'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
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
              <p className="text-sm font-medium text-gray-600">Return %</p>
              <p className={`text-2xl font-bold ${getReturnColor(totalReturnPercentage)}`}>
                {totalReturnPercentage.toFixed(2)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Percent className="text-purple-600" size={24} />
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
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{activeInvestments}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Portfolio Overview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">Total Cost</p>
            <p className="text-2xl font-bold text-gray-900">
              {showAmounts ? `$${totalCost.toLocaleString()}` : '••••••'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Value</p>
            <p className="text-2xl font-bold text-blue-600">
              {showAmounts ? `$${totalValue.toLocaleString()}` : '••••••'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Return</p>
            <p className={`text-2xl font-bold ${getReturnColor(totalReturnPercentage)}`}>
              {showAmounts ? `$${totalReturn.toLocaleString()}` : '••••••'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{activeInvestments} Active</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{soldInvestments} Sold</span>
              {pendingInvestments > 0 && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">{pendingInvestments} Pending</span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${totalReturn >= 0 ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gradient-to-r from-red-500 to-gray-500'}`}
              style={{ width: `${Math.min(Math.abs(totalReturnPercentage), 100)}%` }}
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
                placeholder="Search investments..."
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
              <option value="stocks">Stocks</option>
              <option value="bonds">Bonds</option>
              <option value="etfs">ETFs</option>
              <option value="mutual_funds">Mutual Funds</option>
              <option value="real_estate">Real Estate</option>
              <option value="crypto">Cryptocurrency</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="pending">Pending</option>
            </select>
            <button
              onClick={() => fetchInvestments()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Investments Grid */}
      {isLoading.investments ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading investments...</span>
          </div>
        </div>
      ) : filteredInvestments.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No investments found</h3>
          <p className="mt-2 text-gray-600">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by adding your first investment.'
            }
          </p>
          {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
            <button
              onClick={handleAddInvestment}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus size={16} />
              Add Investment
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredInvestments.map((investment, index) => {
            const returnPercentage = getReturnPercentage(investment);
            const returnAmount = (investment.current_value || 0) - (investment.purchase_price || 0);

            return (
              <motion.div
                key={investment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Investment Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getInvestmentTypeIcon(investment.investment_type)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{investment.name}</h3>
                        <p className="text-sm text-gray-600">{getInvestmentTypeLabel(investment.investment_type)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRiskIcon(investment.risk_level)}
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investment.status)}`}>
                        {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Symbol: {investment.symbol}</span>
                    <span>Shares: {investment.quantity}</span>
                  </div>

                  {investment.notes && (
                    <p className="text-sm text-gray-600">{investment.notes}</p>
                  )}
                </div>

                {/* Investment Details */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Purchase Price</p>
                        <p className="font-semibold text-gray-900">
                          {showAmounts ? `$${(investment.purchase_price || 0).toLocaleString()}` : '••••••'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Current Value</p>
                        <p className="font-semibold text-blue-600">
                          {showAmounts ? `$${(investment.current_value || 0).toLocaleString()}` : '••••••'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Return Amount</p>
                        <p className={`font-semibold ${getReturnColor(returnPercentage)}`}>
                          {showAmounts ? `$${(returnAmount || 0).toLocaleString()}` : '••••••'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Return %</p>
                        <p className={`font-semibold ${getReturnColor(returnPercentage)}`}>
                          {returnPercentage.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Purchase Date</span>
                      <span className="text-gray-900">
                        {new Date(investment.purchase_date).toLocaleDateString()}
                      </span>
                    </div>

                    {investment.sell_date && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Sell Date</span>
                        <span className="text-gray-900">
                          {new Date(investment.sell_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Risk Level</span>
                      <span className="text-gray-900 capitalize">{investment.risk_level}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 flex-wrap">
                    <button
                      onClick={() => handleViewDetails(investment)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Info size={14} />
                      Details
                    </button>
                    <button
                      onClick={() => handleEditInvestment(investment)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleAddTransaction(investment)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Add Transaction"
                    >
                      <ArrowUpDown size={14} />
                      Transaction
                    </button>
                    <button
                      onClick={() => handleDeleteInvestment(investment.id)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={12} />
                      {investment.investment_type.toUpperCase()}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Investment Detail Modal */}
      {showDetailModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Investment Details</h2>
              <button onClick={() => {
                setShowDetailModal(false);
                setSelectedInvestment(undefined);
              }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{selectedInvestment.name}</h3>
                <p className="text-sm text-gray-600">{getInvestmentTypeLabel(selectedInvestment.investment_type)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Symbol</p>
                  <p className="font-semibold">{selectedInvestment.symbol}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-semibold">{selectedInvestment.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Purchase Price</p>
                  <p className="font-semibold">${(selectedInvestment.purchase_price || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Value</p>
                  <p className="font-semibold text-blue-600">${(selectedInvestment.current_value || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Return</p>
                  <p className={`font-semibold ${getReturnColor(getReturnPercentage(selectedInvestment))}`}>
                    ${((selectedInvestment.current_value || 0) - (selectedInvestment.purchase_price || 0)).toLocaleString()} ({getReturnPercentage(selectedInvestment).toFixed(2)}%)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risk Level</p>
                  <p className="font-semibold capitalize">{selectedInvestment.risk_level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold capitalize">{selectedInvestment.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Purchase Date</p>
                  <p className="font-semibold">{new Date(selectedInvestment.purchase_date).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedInvestment.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="text-sm">{selectedInvestment.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Portfolio View Modal */}
      {showPortfolioModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Portfolio View</h2>
              <button onClick={() => setShowPortfolioModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['stocks', 'bonds', 'etfs', 'crypto'].map(type => {
                  const typeInvestments = investments.filter(inv => inv.investment_type === type);
                  const typeValue = typeInvestments.reduce((sum, inv) => sum + inv.current_value, 0);
                  const percentage = totalValue > 0 ? (typeValue / totalValue) * 100 : 0;
                  return (
                    <div key={type} className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">{getInvestmentTypeLabel(type)}</p>
                      <p className="text-lg font-semibold">${typeValue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Allocation Chart</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <PieChart size={48} className="text-gray-400" />
                  <span className="ml-2 text-gray-500">Chart visualization</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Performance Chart Modal */}
      {showPerformanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Performance Chart</h2>
              <button onClick={() => setShowPerformanceModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Total Return</p>
                  <p className={`text-2xl font-semibold ${getReturnColor(totalReturnPercentage)}`}>
                    ${totalReturn.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Return %</p>
                  <p className={`text-2xl font-semibold ${getReturnColor(totalReturnPercentage)}`}>
                    {totalReturnPercentage.toFixed(2)}%
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-semibold">${totalValue.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Performance Over Time</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <LineChart size={48} className="text-gray-400" />
                  <span className="ml-2 text-gray-500">Chart visualization</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Transaction</h2>
              <button onClick={() => {
                setShowTransactionModal(false);
                setSelectedInvestment(undefined);
              }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Investment</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" id="transaction-investment">
                  <option value="">Select Investment</option>
                  {investments.map(inv => (
                    <option key={inv.id} value={inv.id} selected={selectedInvestment?.id === inv.id}>
                      {inv.name} ({inv.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" id="transaction-type">
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" id="transaction-quantity" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per Share</label>
                <input type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" id="transaction-price" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" id="transaction-date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTransactionModal(false);
                    setSelectedInvestment(undefined);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle transaction save
                    setShowTransactionModal(false);
                    setSelectedInvestment(undefined);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Transaction
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Recommendations Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">AI Investment Recommendations</h2>
              <button onClick={() => setShowAIModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                AI-powered investment recommendations based on your portfolio and risk profile.
              </p>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Diversification Suggestion</h3>
                  <p className="text-sm text-gray-600 mb-2">Consider adding bonds to balance your portfolio</p>
                  <p className="text-xs text-gray-500">Your portfolio is currently 80% stocks, 20% crypto</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Rebalancing Opportunity</h3>
                  <p className="text-sm text-gray-600 mb-2">Your tech stocks have grown significantly</p>
                  <p className="text-xs text-gray-500">Consider taking some profits and diversifying</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Risk Assessment</h3>
                  <p className="text-sm text-gray-600 mb-2">Your portfolio risk level is: High</p>
                  <p className="text-xs text-gray-500">Consider adding lower-risk investments</p>
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

export default InvestmentsPage;
