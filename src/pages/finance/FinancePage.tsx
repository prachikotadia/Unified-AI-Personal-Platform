import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  PiggyBank, 
  Target, 
  BarChart3,
  Plus,
  Wallet,
  Shield,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Settings,
  Download,
  Share2,
  Utensils,
  Car,
  Home,
  Zap,
  Film,
  ShoppingBag,
  Heart,
  BookOpen,
  Plane,
  Shield as InsuranceIcon,
  Coins,
  CreditCard as DebtIcon,
  Gem,
  TrendingUp as InvestmentIcon,
  Briefcase,
  Monitor,
  Building,
  TrendingUp as RentalIcon,
  Banknote,
  BarChart3 as DividendIcon,
  Package,
  Receipt,
  Calendar,
  MapPin,
  Tag,
  Bell,
  Brain
} from 'lucide-react';
import Sparkles from './Sparkles';
import AIInsights from '../../components/ai/AIInsights';
import AIAssistant from '../../components/ai/AIAssistant';
import { useFinance } from '../../hooks/useFinance';
import { Transaction, BankAccount, Budget, FinancialGoal } from '../../services/financeAPI';
import { bankIntegrationAPIService, BankConnection, LiveTransaction, CreditScoreData, FinancialOffer as BankFinancialOffer } from '../../services/bankIntegration';
import { notificationService } from '../../services/notificationService';
import { useToastHelpers } from '../../components/ui/Toast';
import BankConnectionModal from '../../components/finance/BankConnectionModal';
import NotificationCenter from '../../components/finance/NotificationCenter';
import ExportShareModal from '../../components/finance/ExportShareModal';
import AIForecastingModal from '../../components/finance/AIForecastingModal';
import FinanceSettingsModal from '../../components/finance/FinanceSettingsModal';
import TransactionModal from '../../components/finance/TransactionModal';
import BankAccountModal from '../../components/finance/BankAccountModal';
import BudgetModal from '../../components/finance/BudgetModal';
import GoalModal from '../../components/finance/GoalModal';

const FinancePage: React.FC = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // New state for enhanced features
  const [bankConnections, setBankConnections] = useState<BankConnection[]>([]);
  const [liveTransactions, setLiveTransactions] = useState<LiveTransaction[]>([]);
  const [enhancedCreditScore, setEnhancedCreditScore] = useState<CreditScoreData | null>(null);
  const [personalizedOffers, setPersonalizedOffers] = useState<BankFinancialOffer[]>([]);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  // Modal states for add functionality
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBankAccountModal, setShowBankAccountModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // Use toast helpers
  const { success, error: showError, info } = useToastHelpers();
  
  // Use finance service
  const {
    transactions,
    bankAccounts,
    budgets,
    financialGoals,
    isLoading,
    errors,
    fetchTransactions,
    fetchBankAccounts,
    fetchBudgets,
    fetchFinancialGoals,
    createTransaction,
    createBankAccount,
    createBudget,
    createFinancialGoal,
    getTotalBalance,
    getMonthlyIncome,
    getMonthlyExpenses,
    getMonthlySavings,
    getSavingsRate
  } = useFinance();

  useEffect(() => {
    // Load all finance data
    const loadFinanceData = async () => {
      try {
        await Promise.all([
          fetchTransactions(),
          fetchBankAccounts(),
          fetchBudgets(),
          fetchFinancialGoals()
        ]);
      } catch (error) {
        console.error('Error loading finance data:', error);
      }
    };

    loadFinanceData();
  }, [fetchTransactions, fetchBankAccounts, fetchBudgets, fetchFinancialGoals]);

  // Load enhanced features
  useEffect(() => {
    const loadEnhancedFeatures = async () => {
      try {
        // Load bank connections
        const connections = await bankIntegrationAPIService.getBankConnections();
        setBankConnections(connections);

        // Load live transactions from connected accounts
        if (connections.length > 0) {
          const liveTransactions = await bankIntegrationAPIService.getLiveTransactions();
          setLiveTransactions(liveTransactions);
        }

        // Load enhanced credit score
        const enhancedScore = await bankIntegrationAPIService.getCreditScore();
        setEnhancedCreditScore(enhancedScore);

        // Load personalized offers
        const offers = await bankIntegrationAPIService.getPersonalizedOffers();
        setPersonalizedOffers(offers);

        // Load notifications count
        const notifications = await notificationService.getNotifications();
        setUnreadNotifications(notifications.filter(n => !n.read).length);

        // Subscribe to real-time updates
        notificationService.subscribeToNotifications((notification) => {
          setUnreadNotifications(prev => prev + 1);
        });

      } catch (error) {
        console.error('Error loading enhanced features:', error);
      }
    };

    loadEnhancedFeatures();
  }, []);

  // Handle bank connection success
  const handleBankConnectionSuccess = (connection: BankConnection) => {
    setBankConnections(prev => [...prev, connection]);
  };

  // Handle add functionality
  const handleAddTransaction = async (transaction: Transaction) => {
    try {
      await createTransaction(transaction);
      success('Transaction added successfully!');
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleAddBankAccount = async (account: BankAccount) => {
    try {
      await createBankAccount(account);
      success('Bank account added successfully!');
    } catch (error) {
      console.error('Error adding bank account:', error);
    }
  };

  const handleAddBudget = async (budget: Budget) => {
    try {
      await createBudget(budget);
      success('Budget created successfully!');
    } catch (error) {
      console.error('Error creating budget:', error);
    }
  };

  const handleAddGoal = async (goal: FinancialGoal) => {
    try {
      await createFinancialGoal(goal);
      success('Financial goal created successfully!');
    } catch (error) {
      console.error('Error creating financial goal:', error);
    }
  };

  // Handle export/share actions
  const handleExport = () => {
    // Create a comprehensive financial report
    const reportData = {
      generatedAt: new Date().toISOString(),
      totalBalance: totalBalance,
      monthlyIncome: totalIncome,
      monthlyExpenses: totalExpenses,
      monthlySavings: monthlySavings,
      savingsRate: savingsRate,
      bankAccounts: bankAccounts,
      recentTransactions: transactions.slice(0, 10),
      summary: {
        totalAccounts: bankAccounts.length,
        totalTransactions: transactions.length,
        averageTransactionAmount: transactions.length > 0 
          ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length 
          : 0,
      }
    };

    // Create and download the report
    const reportBlob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(reportBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success toast
    success('Financial report downloaded successfully!');
    
    // Also show the export modal for additional options
    setShowExportModal(true);
  };

  const handleShare = () => {
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'My Finance Dashboard',
        text: `Check out my financial summary: Total Balance: $${totalBalance.toLocaleString()}, Monthly Income: $${totalIncome.toLocaleString()}, Savings Rate: ${savingsRate.toFixed(1)}%`,
        url: window.location.href,
      }).catch((error) => {
        console.log('Error sharing:', error);
        // Fallback to modal
        setShowShareModal(true);
      });
    } else {
      // Fallback to modal for browsers that don't support Web Share API
      info('Sharing options available in the modal');
      setShowShareModal(true);
    }
  };

  const totalBalance = getTotalBalance();
  const totalIncome = getMonthlyIncome();
  const totalExpenses = getMonthlyExpenses();
  const monthlySavings = getMonthlySavings();
  const savingsRate = getSavingsRate();

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      food_dining: <Utensils size={20} />,
      transportation: <Car size={20} />,
      housing: <Home size={20} />,
      utilities: <Zap size={20} />,
      entertainment: <Film size={20} />,
      shopping: <ShoppingBag size={20} />,
      healthcare: <Heart size={20} />,
      salary: <Briefcase size={20} />,
      investment: <InvestmentIcon size={20} />,
      education: <BookOpen size={20} />,
      travel: <Plane size={20} />,
      insurance: <InsuranceIcon size={20} />,
      taxes: <Coins size={20} />,
      debt_payment: <DebtIcon size={20} />,
      savings: <Gem size={20} />,
      freelance: <Monitor size={20} />,
      business: <Building size={20} />,
      rental: <RentalIcon size={20} />,
      interest: <Banknote size={20} />,
      dividend: <DividendIcon size={20} />,
      gift: <Gift size={20} />,
      refund: <Receipt size={20} />,
      other: <Package size={20} />
    };
    return icons[category] || <Package size={20} />;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food_dining: '#FF6B6B',
      transportation: '#4ECDC4',
      housing: '#45B7D1',
      utilities: '#96CEB4',
      entertainment: '#FFEAA7',
      shopping: '#DDA0DD',
      healthcare: '#98D8C8',
      salary: '#2ECC71',
      investment: '#F1C40F'
    };
    return colors[category] || '#BDC3C7';
  };

  if (isLoading.transactions || isLoading.bankAccounts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <DollarSign className="text-green-600" />
              Finance Dashboard
              <Sparkles />
            </h1>
            <p className="text-gray-600 mt-2">Manage your money, track expenses, and grow your wealth</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Download Financial Report"
            >
              <Download size={20} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Share Dashboard"
            >
              <Share2 size={20} />
            </button>
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Finance Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </motion.div>

        {/* Balance Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Total Balance</h2>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {showBalance ? `$${totalBalance.toLocaleString()}` : '••••••'}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ArrowUpRight className="text-green-500" size={16} />
            <span className="text-green-500">+$2,300 this month</span>
            <span>•</span>
            <span>27.1% savings rate</span>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <ArrowDownRight className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Credit Score</p>
                <p className="text-2xl font-bold text-blue-600">750</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Offers</p>
                <p className="text-2xl font-bold text-purple-600">{transactions.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Gift className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex space-x-1 bg-white rounded-xl p-1 shadow-lg mb-8"
        >
          {['overview', 'transactions', 'accounts', 'budgets', 'goals', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Transactions */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                                <div className="flex items-center gap-2">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
                <button
                  onClick={() => setShowBankModal(true)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Connect Bank Account"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => setShowAIModal(true)}
                  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  title="AI Forecasting"
                >
                  <Brain size={16} />
                </button>
                <button
                  onClick={() => setShowNotificationCenter(true)}
                  className="relative p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Notifications"
                >
                  <Bell size={16} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>
              </div>
                </div>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: getCategoryColor(transaction.category) + '20' }}
                        >
                          <div style={{ color: getCategoryColor(transaction.category) }}>
                            {getCategoryIcon(transaction.category)}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.category.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank Accounts */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Bank Accounts</h3>
                  <button 
                    onClick={() => setShowBankAccountModal(true)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  {bankAccounts.map((account) => (
                    <div key={account.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Wallet className="text-blue-600" size={16} />
                          <span className="font-medium text-gray-900">{account.account_name}</span>
                          {account.is_primary && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Primary</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{account.bank_name} • {account.account_type}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${account.balance.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
                <button 
                  onClick={() => setShowTransactionModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Transaction
                </button>
              </div>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: getCategoryColor(transaction.category) + '20' }}
                      >
                        <div style={{ color: getCategoryColor(transaction.category) }}>
                          {getCategoryIcon(transaction.category)}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-600">{transaction.category.replace('_', ' ')} • {new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">{transaction.category.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Bank Accounts</h3>
                <button 
                  onClick={() => setShowBankAccountModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Account
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bankAccounts.map((account) => (
                  <div key={account.id} className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="text-blue-600" size={20} />
                        <span className="font-semibold text-gray-900">{account.account_name}</span>
                      </div>
                      {account.is_primary && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Primary</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{account.bank_name}</p>
                    <p className="text-sm text-gray-600 mb-4 capitalize">{account.account_type.replace('_', ' ')}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-4">
                      ${account.balance.toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        View Details
                      </button>
                      <button className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                        Transfer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'budgets' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Budgets</h3>
                <button 
                  onClick={() => setShowBudgetModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Budget
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: '1', name: 'Food & Dining', category: 'food_dining', amount: 500, spent: 320, remaining: 180 },
                  { id: '2', name: 'Transportation', category: 'transportation', amount: 300, spent: 180, remaining: 120 },
                  { id: '3', name: 'Entertainment', category: 'entertainment', amount: 200, spent: 150, remaining: 50 }
                ].map((budget) => (
                  <div key={budget.id} className="p-6 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: getCategoryColor(budget.category) + '20' }}
                      >
                        <div style={{ color: getCategoryColor(budget.category) }}>
                          {getCategoryIcon(budget.category)}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">{budget.name}</p>
                        <p className="text-sm text-gray-600">Monthly Budget</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Spent</span>
                        <span>${budget.spent.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((budget.spent / budget.amount) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900">${budget.remaining.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">remaining of ${budget.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Financial Goals</h3>
                <button 
                  onClick={() => setShowGoalModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Set New Goal
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Emergency Fund', target: 15000, current: 12500, icon: <Shield size={24} /> },
                  { name: 'Vacation Fund', target: 5000, current: 3200, icon: <Plane size={24} /> },
                  { name: 'House Down Payment', target: 50000, current: 15000, icon: <Home size={24} /> },
                  { name: 'Car Fund', target: 25000, current: 8000, icon: <Car size={24} /> },
                  { name: 'Investment Portfolio', target: 100000, current: 45000, icon: <InvestmentIcon size={24} /> },
                  { name: 'Wedding Fund', target: 30000, current: 12000, icon: <Heart size={24} /> }
                ].map((goal) => {
                  const progress = (goal.current / goal.target) * 100;
                  return (
                    <div key={goal.name} className="p-6 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-blue-600">{goal.icon}</div>
                        <div>
                          <p className="font-semibold text-gray-900">{goal.name}</p>
                          <p className="text-sm text-gray-600">Target: ${goal.target.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-gray-900">${goal.current.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">${(goal.target - goal.current).toLocaleString()} remaining</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Spending Overview */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Income</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">${monthlySavings.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Net Savings</p>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending by Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: '1', name: 'Food & Dining', category: 'food_dining', spent: 320 },
                    { id: '2', name: 'Transportation', category: 'transportation', spent: 180 },
                    { id: '3', name: 'Entertainment', category: 'entertainment', spent: 150 },
                    { id: '4', name: 'Shopping', category: 'shopping', spent: 120 }
                  ].map((budget) => (
                    <div key={budget.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: getCategoryColor(budget.category) + '20' }}
                        >
                          <div style={{ color: getCategoryColor(budget.category) }}>
                            {getCategoryIcon(budget.category)}
                          </div>
                        </div>
                        <span className="font-medium text-gray-900 capitalize">{budget.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900">${budget.spent.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Credit Score */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Credit Score</h3>
                <div className="flex items-center justify-between">
                  <div>
                                    <p className="text-4xl font-bold text-blue-600">750</p>
                <p className="text-sm text-gray-600">Good • +15</p>
                <p className="text-sm text-gray-600">Last updated: Today</p>
                  </div>
                  <div className="text-right">
                    <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">750</p>
                        <p className="text-xs text-gray-600">FICO Score</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Offers */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Personalized Offers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {personalizedOffers.slice(0, 3).map((offer) => (
                    <div key={offer.id} className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full capitalize">
                          {offer.type.replace('_', ' ')}
                        </span>
                        {offer.is_pre_approved && (
                          <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                            Pre-approved
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{offer.title}</h4>
                      <p className="text-sm text-gray-600 mb-4">{offer.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">{offer.provider}</span>
                        <span className="text-sm font-medium text-blue-600">
                          {(offer.approval_chance * 100).toFixed(0)}% approval
                        </span>
                      </div>
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Learn More
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* AI Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <AIInsights type="finance" />
        </motion.div>

        {/* AI Assistant */}
        <AIAssistant module="finance" />
      </div>

      {/* Enhanced Feature Modals */}
      <BankConnectionModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSuccess={handleBankConnectionSuccess}
      />

      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />

      <ExportShareModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        type="export"
      />

      <ExportShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        type="share"
      />

      <AIForecastingModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
      />

      <FinanceSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={() => success('Finance settings saved successfully!')}
      />

      {/* Add Modals */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSave={handleAddTransaction}
        mode="add"
      />

      <BankAccountModal
        isOpen={showBankAccountModal}
        onClose={() => setShowBankAccountModal(false)}
        onSave={handleAddBankAccount}
        mode="add"
      />

      <BudgetModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        onSave={handleAddBudget}
        mode="add"
      />

      <GoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onSave={handleAddGoal}
        mode="add"
      />
    </div>
  );
};

export default FinancePage;
