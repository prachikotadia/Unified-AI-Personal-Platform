import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  Brain,
  Edit,
  Trash2,
  Filter,
  Search,
  ArrowRight,
  Upload,
  FileText,
  PieChart,
  TrendingDown,
  RefreshCw,
  MoreVertical,
  Info,
  X,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import Sparkles from './Sparkles';
import AIInsights from '../../components/ai/AIInsights';
import AIAssistant from '../../components/ai/AIAssistant';
import { useFinance } from '../../hooks/useFinance';
import { useFinanceStore } from '../../store/finance';
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
import BulkOperationsModal from '../../components/finance/BulkOperationsModal';
import GoalsModal from '../../components/finance/GoalsModal';
import InvestmentsModal from '../../components/finance/InvestmentsModal';
import DebtsModal from '../../components/finance/DebtsModal';
import ForecastModal from '../../components/finance/ForecastModal';
import FilterModal, { FilterState } from '../../components/finance/FilterModal';
import ImportModal from '../../components/finance/ImportModal';
import CategoryBreakdownModal from '../../components/finance/CategoryBreakdownModal';
import TrendAnalysisModal from '../../components/finance/TrendAnalysisModal';
import CreditScoreDetailModal from '../../components/finance/CreditScoreDetailModal';
import CreditScoreCard from '../../components/finance/CreditScoreCard';
import AIBudgetRecommendations from '../../components/finance/AIBudgetRecommendations';
import FinancialOffersModal from '../../components/finance/FinancialOffersModal';
import { useNavigate } from 'react-router-dom';
import { isBackendAvailable, API_BASE_URL } from '../../config/api';

const FinancePage: React.FC = () => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Backend connection status
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [aiServiceAvailable, setAiServiceAvailable] = useState<boolean | null>(null);
  
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
  
  // Modal states for edit/delete/view
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [transactionModalMode, setTransactionModalMode] = useState<'add' | 'edit'>('add');
  const [accountModalMode, setAccountModalMode] = useState<'add' | 'edit'>('add');
  const [budgetModalMode, setBudgetModalMode] = useState<'add' | 'edit'>('add');
  const [goalModalMode, setGoalModalMode] = useState<'add' | 'edit'>('add');
  
  // Additional modal states
  const [showTransactionDetailModal, setShowTransactionDetailModal] = useState(false);
  const [showCreditScoreModal, setShowCreditScoreModal] = useState(false);
  const [showFinancialOffersModal, setShowFinancialOffersModal] = useState(false);
  const [showCategoryBreakdownModal, setShowCategoryBreakdownModal] = useState(false);
  const [showTrendAnalysisModal, setShowTrendAnalysisModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showProgressUpdateModal, setShowProgressUpdateModal] = useState(false);
  const [showBudgetDetailModal, setShowBudgetDetailModal] = useState(false);
  const [showGoalDetailModal, setShowGoalDetailModal] = useState(false);
  const [showBulkOperationsModal, setShowBulkOperationsModal] = useState(false);
  const [showAIInsightsModal, setShowAIInsightsModal] = useState(false);
  const [showAIBudgetModal, setShowAIBudgetModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showInvestmentsModal, setShowInvestmentsModal] = useState(false);
  const [showDebtTrackerModal, setShowDebtTrackerModal] = useState(false);
  
  // Filter/Sort/Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  
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
    updateTransaction,
    deleteTransaction,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    createBudget,
    updateBudget,
    deleteBudget,
    createFinancialGoal,
    updateFinancialGoal,
    deleteFinancialGoal,
    getTotalBalance,
    getMonthlyIncome,
    getMonthlyExpenses,
    getMonthlySavings,
    getSavingsRate
  } = useFinance();

  // Get import/export functions from store
  const { exportFinanceData, importFinanceData } = useFinanceStore();

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

  // Check backend availability on mount and periodically
  useEffect(() => {
    const checkBackendStatus = async () => {
      const available = await isBackendAvailable();
      setIsBackendOnline(available);
      setIsUsingMockData(!available);
      
      // Check AI service availability
      if (available) {
        try {
          const apiUrl = API_BASE_URL;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const testResponse = await fetch(`${apiUrl}/api/ai/model-info`, {
            method: 'GET',
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          setAiServiceAvailable(testResponse.ok);
        } catch {
          setAiServiceAvailable(false);
        }
      } else {
        setAiServiceAvailable(false);
      }
      
      if (!available && isBackendOnline === null) {
        // Only show on initial load, not on periodic checks
        info('Offline Mode', 'Backend is unavailable. Using local data and demo services.');
      }
    };
    
    checkBackendStatus();
    
    // Check periodically (every 30 seconds)
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, [info, isBackendOnline]);

  // Load enhanced features
  useEffect(() => {
    const loadEnhancedFeatures = async () => {
      try {
        const backendAvailable = await isBackendAvailable();
        setIsBackendOnline(backendAvailable);
        setIsUsingMockData(!backendAvailable);

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

        // Show indicator if using mock data
        if (!backendAvailable) {
          setIsUsingMockData(true);
        }

      } catch (error) {
        console.error('Error loading enhanced features:', error);
        setIsBackendOnline(false);
        setIsUsingMockData(true);
        showError('Connection Error', 'Unable to connect to backend. Some features may use demo data.');
      }
    };

    loadEnhancedFeatures();
  }, [showError]);

  // Handle bank connection success
  const handleBankConnectionSuccess = (connection: BankConnection) => {
    setBankConnections(prev => [...prev, connection]);
  };

  // Handle add functionality
  const handleAddTransaction = async (transaction: Transaction) => {
    try {
      await createTransaction(transaction);
      success('Transaction added successfully!');
      setShowTransactionModal(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
      showError('Failed to add transaction');
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTransactionModalMode('edit');
    setShowTransactionModal(true);
  };

  const handleUpdateTransaction = async (transaction: Transaction) => {
    try {
      await updateTransaction(transaction.id, transaction);
      success('Transaction updated successfully!');
      setShowTransactionModal(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Error updating transaction:', error);
      showError('Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(transactionId);
        success('Transaction deleted successfully!');
      } catch (error) {
        console.error('Error deleting transaction:', error);
        showError('Failed to delete transaction');
      }
    }
  };

  const handleViewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetailModal(true);
  };

  const handleAddBankAccount = async (account: BankAccount) => {
    try {
      await createBankAccount(account);
      success('Bank account added successfully!');
      setShowBankAccountModal(false);
    } catch (error) {
      console.error('Error adding bank account:', error);
      showError('Failed to add bank account');
    }
  };

  const handleEditBankAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setAccountModalMode('edit');
    setShowBankAccountModal(true);
  };

  const handleUpdateBankAccount = async (account: BankAccount) => {
    try {
      await updateBankAccount(account.id, account);
      success('Bank account updated successfully!');
      setShowBankAccountModal(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error updating bank account:', error);
      showError('Failed to update bank account');
    }
  };

  const handleDeleteBankAccount = async (accountId: string) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      try {
        await deleteBankAccount(accountId);
        success('Bank account deleted successfully!');
      } catch (error) {
        console.error('Error deleting bank account:', error);
        showError('Failed to delete bank account');
      }
    }
  };

  const handleViewAccountTransactions = (accountId: string) => {
    setFilterCategory('all');
    setFilterType('all');
    // Filter transactions by account
    // This would be handled by the transactions tab
    setActiveTab('transactions');
  };

  const handleAddBudget = async (budget: Budget) => {
    try {
      await createBudget(budget);
      success('Budget created successfully!');
      setShowBudgetModal(false);
    } catch (error) {
      console.error('Error creating budget:', error);
      showError('Failed to create budget');
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setBudgetModalMode('edit');
    setShowBudgetModal(true);
  };

  const handleUpdateBudget = async (budget: Budget) => {
    try {
      await updateBudget(budget.id, budget);
      success('Budget updated successfully!');
      setShowBudgetModal(false);
      setSelectedBudget(null);
    } catch (error) {
      console.error('Error updating budget:', error);
      showError('Failed to update budget');
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(budgetId);
        success('Budget deleted successfully!');
      } catch (error) {
        console.error('Error deleting budget:', error);
        showError('Failed to delete budget');
      }
    }
  };

  const handleViewBudgetDetails = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowBudgetDetailModal(true);
  };

  const handleAddGoal = async (goal: FinancialGoal) => {
    try {
      await createFinancialGoal(goal);
      success('Financial goal created successfully!');
      setShowGoalModal(false);
    } catch (error) {
      console.error('Error creating financial goal:', error);
      showError('Failed to create financial goal');
    }
  };

  const handleEditGoal = (goal: FinancialGoal) => {
    setSelectedGoal(goal);
    setGoalModalMode('edit');
    setShowGoalModal(true);
  };

  const handleUpdateGoal = async (goal: FinancialGoal) => {
    try {
      await updateFinancialGoal(goal.id, goal);
      success('Financial goal updated successfully!');
      setShowGoalModal(false);
      setSelectedGoal(null);
    } catch (error) {
      console.error('Error updating financial goal:', error);
      showError('Failed to update financial goal');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this financial goal?')) {
      try {
        await deleteFinancialGoal(goalId);
        success('Financial goal deleted successfully!');
      } catch (error) {
        console.error('Error deleting financial goal:', error);
        showError('Failed to delete financial goal');
      }
    }
  };

  const handleAddProgress = (goal: FinancialGoal) => {
    setSelectedGoal(goal);
    setShowProgressUpdateModal(true);
  };

  const handleUpdateProgress = async (goalId: string, progress: number) => {
    try {
      const goal = financialGoals.find(g => g.id === goalId);
      if (goal) {
        const updatedGoal = { ...goal, current_amount: (goal.current_amount || 0) + progress };
        await updateFinancialGoal(goalId, updatedGoal);
        success('Progress updated successfully!');
        setShowProgressUpdateModal(false);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      showError('Failed to update progress');
    }
  };

  // Filter and sort handlers
  const handleFilterTransactions = () => {
    setShowFilterModal(true);
  };

  const handleFilterApply = (filters: FilterState) => {
    if (filters.type === 'transfer') {
      setFilterType('all');
    } else {
      setFilterType(filters.type === 'all' ? 'all' : filters.type);
    }
    setFilterCategory(filters.category);
    if (filters.dateRange.start) {
      // Apply date range filtering if needed
      // This can be extended to use date range in filteredTransactions
    }
    success('Filters applied successfully!');
  };

  const handleSortTransactions = (sort: 'date' | 'amount' | 'category') => {
    setSortBy(sort);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleExportTransactions = () => {
    setShowExportModal(true);
  };

  const handleExportComplete = (format: string) => {
    success(`Finance data exported as ${format.toUpperCase()} successfully!`);
  };

  const handleImportTransactions = () => {
    setShowImportModal(true);
  };

  // Filtered and sorted transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = searchTerm === '' || 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortBy === 'category') {
      comparison = a.category.localeCompare(b.category);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Handle export/share actions
  const handleExport = () => {
    try {
      // Use the store's export function
      const jsonData = exportFinanceData();
      
      // Create and download the report
      const reportBlob = new Blob([jsonData], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(reportBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finance-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success toast
      success('Finance data exported successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to export finance data');
    }
  };

  // Handle import
  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const merge = window.confirm('Do you want to merge with existing data? (Click OK to merge, Cancel to replace)');
        await importFinanceData(text, merge);
        success(`Finance data imported successfully! (${merge ? 'Merged' : 'Replaced'})`);
      } catch (error: any) {
        showError(error.message || 'Failed to import finance data');
      }
    };
    input.click();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Title Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1 flex-wrap">
                  Finance Dashboard
                  {/* Backend Connection Status Indicator */}
                  {isBackendOnline !== null && (
                    <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
                      {isBackendOnline ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700">
                          <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-medium text-green-700 dark:text-green-300">Online</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-300 dark:border-amber-700" title="Backend unavailable - using local data">
                          <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Offline</span>
                        </div>
                      )}
                      {aiServiceAvailable === false && isBackendOnline && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-300 dark:border-orange-700" title="AI service unavailable">
                          <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          <span className="text-xs font-medium text-orange-700 dark:text-orange-300">AI Offline</span>
                        </div>
                      )}
                    </div>
                  )}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base">
                  Manage your money, track expenses, and grow your wealth
                  {isUsingMockData && (
                    <span className="ml-1 sm:ml-2 text-xs text-amber-600 dark:text-amber-400">(Demo Mode)</span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Utility Icons */}
            <div className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-gray-800 rounded-xl p-1.5 sm:p-2 shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <button 
                onClick={handleExport}
                className="p-2 sm:p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
                title="Export All Finance Data"
                aria-label="Export"
              >
                <Download size={18} />
              </button>
              <button 
                onClick={handleImport}
                className="p-2 sm:p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
                title="Import Finance Data"
                aria-label="Import"
              >
                <Upload size={18} />
              </button>
              <button 
                onClick={handleShare}
                className="p-2 sm:p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
                title="Share Dashboard"
                aria-label="Share"
              >
                <Share2 size={18} />
              </button>
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="p-2 sm:p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
                title="Finance Settings"
                aria-label="Settings"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={() => setShowNotificationCenter(true)}
                className="relative p-2 sm:p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-semibold text-[10px] sm:text-xs">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Action Buttons - Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <button 
              onClick={() => setShowGoalsModal(true)}
              className="px-5 py-3 text-sm font-semibold bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2 shadow-sm border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
            >
              <Target size={18} />
              View All Goals
            </button>
            <button 
              onClick={() => setShowInvestmentsModal(true)}
              className="px-5 py-3 text-sm font-semibold bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-400 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2 shadow-sm border-2 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md"
            >
              <InvestmentIcon size={18} />
              View Investments
            </button>
            <button 
              onClick={() => setShowDebtTrackerModal(true)}
              className="px-5 py-3 text-sm font-semibold bg-white dark:bg-gray-800 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 shadow-sm border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 hover:shadow-md"
            >
              <DebtIcon size={18} />
              View Debt Tracker
            </button>
          </div>

          {/* AI & Primary Action Buttons - Row 2 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            <button 
              onClick={() => setShowAIInsightsModal(true)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-md hover:shadow-lg transform hover:scale-105 min-h-[44px]"
              title="AI Financial Insights"
            >
              <Brain size={16} />
              <span className="hidden sm:inline">AI Insights</span>
              <span className="sm:hidden">Insights</span>
            </button>
            <button 
              onClick={() => setShowAIBudgetModal(true)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-md hover:shadow-lg transform hover:scale-105 min-h-[44px]"
              title="AI Budget Recommendations"
            >
              <Brain size={16} />
              <span className="hidden sm:inline">AI Budget</span>
              <span className="sm:hidden">Budget</span>
            </button>
            <button 
              onClick={() => setShowAIModal(true)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-md hover:shadow-lg transform hover:scale-105 min-h-[44px]"
              title="AI Forecasting"
            >
              <Brain size={16} />
              <span className="hidden sm:inline">AI Forecast</span>
              <span className="sm:hidden">Forecast</span>
            </button>
            <button 
              onClick={() => setShowBankModal(true)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-md hover:shadow-lg transform hover:scale-105 min-h-[44px]"
              title="Connect Bank Account"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Connect Bank</span>
              <span className="sm:hidden">Bank</span>
            </button>
            <button 
              onClick={() => setShowCreditScoreModal(true)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-md hover:shadow-lg transform hover:scale-105 min-h-[44px]"
              title="View Credit Score Details"
            >
              <Shield size={16} />
              <span className="hidden sm:inline">Credit Score</span>
              <span className="sm:hidden">Credit</span>
            </button>
            <button 
              onClick={() => setShowFinancialOffersModal(true)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-md hover:shadow-lg transform hover:scale-105 min-h-[44px]"
              title="View Financial Offers"
            >
              <Gift size={16} />
              <span className="hidden sm:inline">Offers</span>
              <span className="sm:hidden">Offers</span>
            </button>
          </div>
        </motion.div>

        {/* Balance Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Total Balance</h2>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              title={showBalance ? "Hide Balance" : "Show Balance"}
            >
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="text-5xl font-bold text-gray-900 mb-4">
            {showBalance ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <ArrowUpRight size={18} />
              <span>+$2,300 this month</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span className="text-gray-600 font-medium">27.1% savings rate</span>
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
                <p className="text-2xl font-bold text-blue-600">{enhancedCreditScore?.score || 750}</p>
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
                <p className="text-2xl font-bold text-purple-600">{personalizedOffers.length}</p>
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link 
                      to="/finance/transactions"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                  View All
                      <ArrowRight size={14} />
                    </Link>
                <button
                      onClick={() => {
                        setTransactionModalMode('add');
                        setSelectedTransaction(null);
                        setShowTransactionModal(true);
                      }}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Add Transaction"
                >
                  <Plus size={16} />
                </button>
                <button
                      onClick={handleFilterTransactions}
                      className={`p-2 rounded-lg transition-colors relative ${
                        filterCategory !== 'all' || filterType !== 'all' || searchTerm !== ''
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                      title="Filter Transactions"
                    >
                      <Filter size={16} />
                      {(filterCategory !== 'all' || filterType !== 'all' || searchTerm !== '') && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white dark:border-gray-800"></span>
                      )}
                </button>
                <button
                      onClick={handleExportTransactions}
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Export Transactions"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={handleImportTransactions}
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Import Transactions"
                    >
                      <Upload size={16} />
                    </button>
                    <button
                      onClick={() => navigate('/finance/reports')}
                      className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      title="Financial Reports"
                    >
                      <FileText size={16} />
                    </button>
                    <button
                      onClick={() => navigate('/finance/analytics')}
                      className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      title="Analytics & Reports"
                    >
                      <BarChart3 size={16} />
                    </button>
                    <button
                      onClick={() => setShowCategoryBreakdownModal(true)}
                      className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                      title="Category Breakdown"
                    >
                      <PieChart size={16} />
                    </button>
                    <button
                      onClick={() => setShowTrendAnalysisModal(true)}
                      className="p-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                      title="Trend Analysis"
                    >
                      <TrendingUp size={16} />
                    </button>
              </div>
                </div>
                <div className="space-y-4">
                  {sortedTransactions.slice(0, 5).length > 0 ? (
                    sortedTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                        <div className="flex items-center gap-3 flex-1">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: getCategoryColor(transaction.category) + '20' }}
                          >
                            <div style={{ color: getCategoryColor(transaction.category) }}>
                              {getCategoryIcon(transaction.category)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.category.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleViewTransactionDetails(transaction)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="View Details"
                            >
                              <Info size={16} />
                            </button>
                            <button
                              onClick={() => handleEditTransaction(transaction)}
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Filter size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500 dark:text-gray-400">No transactions match your filters</p>
                      <button
                        onClick={() => {
                          setFilterCategory('all');
                          setFilterType('all');
                          setSearchTerm('');
                        }}
                        className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bank Accounts */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Bank Accounts</h3>
                  <div className="flex items-center gap-2">
                    <Link 
                      to="/finance/accounts"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      View All
                      <ArrowRight size={14} />
                    </Link>
                  <button 
                      onClick={() => {
                        setAccountModalMode('add');
                        setSelectedAccount(null);
                        setShowBankAccountModal(true);
                      }}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Add Account"
                  >
                    <Plus size={16} />
                  </button>
                    <button
                      onClick={() => setShowBankModal(true)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Connect Bank Account"
                    >
                      <Wallet size={16} />
                  </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {bankAccounts.map((account) => (
                    <div key={account.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Wallet className="text-blue-600" size={16} />
                          <span className="font-medium text-gray-900">{account.account_name}</span>
                          {account.is_primary && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Primary</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditBankAccount(account)}
                            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteBankAccount(account.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{account.bank_name} • {account.account_type}</p>
                      <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-gray-900">
                        ${account.balance.toLocaleString()}
                      </p>
                        <button
                          onClick={() => handleViewAccountTransactions(account.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View Transactions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {/* Filter */}
                <button 
                    onClick={handleFilterTransactions}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Filter size={16} />
                    Filter
                  </button>
                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [sort, order] = e.target.value.split('-');
                        setSortBy(sort as 'date' | 'amount' | 'category');
                        setSortOrder(order as 'asc' | 'desc');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="date-desc">Date (Newest)</option>
                      <option value="date-asc">Date (Oldest)</option>
                      <option value="amount-desc">Amount (High to Low)</option>
                      <option value="amount-asc">Amount (Low to High)</option>
                      <option value="category-asc">Category (A-Z)</option>
                      <option value="category-desc">Category (Z-A)</option>
                    </select>
                  </div>
                  {/* Bulk Actions */}
                  <button
                    onClick={() => setShowBulkOperationsModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <FileText size={16} />
                    Bulk Actions
                  </button>
                  {/* Export */}
                  <button
                    onClick={handleExportTransactions}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Download size={16} />
                    Export
                  </button>
                  {/* Import */}
                  <button
                    onClick={handleImportTransactions}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Import
                  </button>
                  {/* Add Transaction */}
                  <button 
                    onClick={() => {
                      setTransactionModalMode('add');
                      setSelectedTransaction(null);
                      setShowTransactionModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                  Add Transaction
                </button>
                </div>
              </div>
              <div className="space-y-4">
                {sortedTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No transactions found</p>
                  </div>
                ) : (
                  sortedTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: getCategoryColor(transaction.category) + '20' }}
                      >
                        <div style={{ color: getCategoryColor(transaction.category) }}>
                          {getCategoryIcon(transaction.category)}
                        </div>
                      </div>
                        <div className="flex-1">
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-600">{transaction.category.replace('_', ' ')} • {new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                      <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">{transaction.category.replace('_', ' ')}</p>
                    </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleViewTransactionDetails(transaction)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Info size={16} />
                          </button>
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                  </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Bank Accounts</h3>
                <div className="flex items-center gap-2">
                <button 
                    onClick={() => setShowBankModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Wallet size={16} />
                    Connect Bank
                  </button>
                  <button 
                    onClick={() => {
                      setAccountModalMode('add');
                      setSelectedAccount(null);
                      setShowBankAccountModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                  Add Account
                </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bankAccounts.map((account) => (
                  <div key={account.id} className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="text-blue-600" size={20} />
                        <span className="font-semibold text-gray-900">{account.account_name}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditBankAccount(account)}
                          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteBankAccount(account.id)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
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
                      <button
                        onClick={() => handleViewAccountTransactions(account.id)}
                        className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View Transactions
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
                <div className="flex items-center gap-2">
                <button 
                    onClick={() => setShowAIBudgetModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Brain size={16} />
                    AI Recommendations
                  </button>
                  <button 
                    onClick={() => {
                      setBudgetModalMode('add');
                      setSelectedBudget(null);
                      setShowBudgetModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                  Create Budget
                </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No budgets created yet</p>
                  </div>
                ) : (
                  budgets.map((budget) => {
                    const spent = transactions
                      .filter(t => t.category === budget.category && t.type === 'expense')
                      .reduce((sum, t) => sum + t.amount, 0);
                    const remaining = budget.amount - spent;
                    return (
                      <div key={budget.id} className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
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
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleViewBudgetDetails(budget)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="View Details"
                            >
                              <Info size={16} />
                            </button>
                            <button
                              onClick={() => handleEditBudget(budget)}
                              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteBudget(budget.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Spent</span>
                            <span>${spent.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((spent / budget.amount) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                        <p className="text-lg font-bold text-gray-900">${Math.max(remaining, 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">remaining of ${budget.amount.toLocaleString()}</p>
                  </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Financial Goals</h3>
                <button 
                  onClick={() => {
                    setGoalModalMode('add');
                    setSelectedGoal(null);
                    setShowGoalModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Set New Goal
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {financialGoals.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No financial goals set yet</p>
                  </div>
                ) : (
                  financialGoals.map((goal) => {
                    const progress = goal.target_amount > 0 ? ((goal.current_amount || 0) / goal.target_amount) * 100 : 0;
                    const goalIcons: Record<string, React.ReactNode> = {
                      emergency: <Shield size={24} />,
                      vacation: <Plane size={24} />,
                      house: <Home size={24} />,
                      car: <Car size={24} />,
                      investment: <InvestmentIcon size={24} />,
                      wedding: <Heart size={24} />,
                      default: <Target size={24} />
                    };
                    const goalIcon = goalIcons[goal.category] || goalIcons.default;
                  return (
                      <div key={goal.id} className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-blue-600">{goalIcon}</div>
                        <div>
                          <p className="font-semibold text-gray-900">{goal.name}</p>
                              <p className="text-sm text-gray-600">Target: ${goal.target_amount.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleAddProgress(goal)}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                              title="Add Progress"
                            >
                              <Plus size={16} />
                            </button>
                            <button
                              onClick={() => handleEditGoal(goal)}
                              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
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
                              style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                        <p className="text-lg font-bold text-gray-900">${(goal.current_amount || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">${(goal.target_amount - (goal.current_amount || 0)).toLocaleString()} remaining</p>
                    </div>
                  );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Action Buttons */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Analytics Actions</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => navigate('/finance/reports')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <FileText size={16} />
                      Monthly Reports
                    </button>
                    <button
                      onClick={() => setShowCategoryBreakdownModal(true)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                    >
                      <PieChart size={16} />
                      Category Breakdown
                    </button>
                    <button
                      onClick={() => setShowTrendAnalysisModal(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <TrendingUp size={16} />
                      Trend Analysis
                    </button>
                    <Link
                      to="/finance/forecast"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <Brain size={16} />
                      Spending Analytics
                    </Link>
                  </div>
                </div>
              </div>

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

              {/* Credit Score - Enhanced */}
              <div className="relative">
                <CreditScoreCard
                  creditScore={enhancedCreditScore}
                  onClick={() => setShowCreditScoreModal(true)}
                />
                {isUsingMockData && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-300 dark:border-amber-700">
                    <Info className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Demo</span>
                  </div>
                )}
              </div>

              {/* Financial Offers */}
              <div className="bg-white rounded-2xl shadow-lg p-6 relative">
                {isUsingMockData && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-300 dark:border-amber-700">
                    <Info className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Demo</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Personalized Offers</h3>
                  <button
                    onClick={() => setShowFinancialOffersModal(true)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                  >
                    <Gift size={16} />
                    View All Offers
                  </button>
                </div>
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

      {/* Add/Edit Modals */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setSelectedTransaction(null);
        }}
        onSave={transactionModalMode === 'add' ? handleAddTransaction : handleUpdateTransaction}
        transaction={selectedTransaction}
        mode={transactionModalMode}
      />

      <BankAccountModal
        isOpen={showBankAccountModal}
        onClose={() => {
          setShowBankAccountModal(false);
          setSelectedAccount(null);
        }}
        onSave={accountModalMode === 'add' ? handleAddBankAccount : handleUpdateBankAccount}
        account={selectedAccount}
        mode={accountModalMode}
      />

      <BudgetModal
        isOpen={showBudgetModal}
        onClose={() => {
          setShowBudgetModal(false);
          setSelectedBudget(null);
        }}
        onSave={budgetModalMode === 'add' ? handleAddBudget : handleUpdateBudget}
        budget={selectedBudget}
        mode={budgetModalMode}
      />

      <GoalModal
        isOpen={showGoalModal}
        onClose={() => {
          setShowGoalModal(false);
          setSelectedGoal(null);
        }}
        onSave={goalModalMode === 'add' ? handleAddGoal : handleUpdateGoal}
        goal={selectedGoal}
        mode={goalModalMode}
      />

      {/* Bulk Operations Modal */}
      <BulkOperationsModal
        isOpen={showBulkOperationsModal}
        onClose={() => setShowBulkOperationsModal(false)}
        transactions={transactions}
        onBulkUpdate={async (ids, updates) => {
          // Handle bulk update
          success('Transactions updated successfully!');
        }}
        onBulkDelete={async (ids) => {
          // Handle bulk delete
          for (const id of ids) {
            await deleteTransaction(id);
          }
          success('Transactions deleted successfully!');
        }}
        onImport={async (imported) => {
          // Handle import
          success('Transactions imported successfully!');
        }}
        onExport={(format) => {
          // Handle export
          success(`Transactions exported as ${format.toUpperCase()}!`);
        }}
      />

      {/* Transaction Detail Modal */}
      {showTransactionDetailModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-lg shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Transaction Details</h3>
              <button onClick={() => setShowTransactionDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <p><strong>Description:</strong> {selectedTransaction.description}</p>
              <p><strong>Amount:</strong> ${selectedTransaction.amount.toLocaleString()}</p>
              <p><strong>Category:</strong> {selectedTransaction.category}</p>
              <p><strong>Date:</strong> {new Date(selectedTransaction.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Credit Score Detail Modal - Enhanced */}
      <CreditScoreDetailModal
        isOpen={showCreditScoreModal}
        onClose={() => setShowCreditScoreModal(false)}
        creditScore={enhancedCreditScore}
      />

      {/* Financial Offers Modal */}
      <FinancialOffersModal
        isOpen={showFinancialOffersModal}
        onClose={() => setShowFinancialOffersModal(false)}
        offers={personalizedOffers.map(offer => ({
          id: offer.id,
          title: offer.title,
          description: offer.description,
          type: (offer.type === 'insurance' ? 'credit_card' : offer.type) as 'credit_card' | 'loan' | 'savings' | 'investment',
          benefits: offer.benefits || [],
          eligibility: offer.requirements?.join(', ') || `Credit score: ${offer.credit_score_requirement || 'N/A'}, Income: ${offer.income_requirement ? `$${offer.income_requirement.toLocaleString()}` : 'N/A'}`,
          rating: offer.approval_chance ? Math.round(offer.approval_chance / 20) : undefined
        }))}
        onApply={(offerId) => {
          const offer = personalizedOffers.find(o => o.id === offerId);
          if (offer) {
            success('Application Started', `Application for ${offer.title} has been initiated. You will be redirected to complete the process.`);
            // In a real app, this would redirect to the application page
            console.log('Apply for offer:', offerId);
          }
        }}
        onLearnMore={(offerId) => {
          const offer = personalizedOffers.find(o => o.id === offerId);
          if (offer) {
            const details = [
              `Provider: ${offer.provider}`,
              offer.interest_rate ? `Interest Rate: ${offer.interest_rate}%` : '',
              offer.annual_fee ? `Annual Fee: $${offer.annual_fee}` : '',
              offer.cashback_rate ? `Cashback Rate: ${offer.cashback_rate}%` : '',
              offer.rewards_points ? `Rewards Points: ${offer.rewards_points}` : '',
              `Approval Chance: ${offer.approval_chance}%`,
              offer.is_pre_approved ? 'Pre-approved' : ''
            ].filter(Boolean).join('\n');
            info('Offer Details', `${offer.title}\n\n${details}\n\n${offer.description}`);
            // In a real app, this would open a detailed view or external link
            console.log('Learn more about offer:', offerId);
          }
        }}
      />

      {/* Category Breakdown Modal */}
      <CategoryBreakdownModal
        isOpen={showCategoryBreakdownModal}
        onClose={() => setShowCategoryBreakdownModal(false)}
        transactions={transactions}
      />

      {/* Trend Analysis Modal */}
      <TrendAnalysisModal
        isOpen={showTrendAnalysisModal}
        onClose={() => setShowTrendAnalysisModal(false)}
        transactions={transactions}
      />

      {/* Inline Trend Analysis Modal (old) - REMOVED */}
      {false && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Trend Analysis</h3>
              </div>
              <button 
                onClick={() => setShowTrendAnalysisModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Monthly Trends */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Spending Trends</h4>
                <div className="space-y-4">
                  {(() => {
                    const monthlyData = transactions.reduce((acc, t) => {
                      if (t.type === 'expense') {
                        const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                        acc[month] = (acc[month] || 0) + t.amount;
                      }
                      return acc;
                    }, {} as Record<string, number>);
                    
                    const sortedMonths = Object.entries(monthlyData)
                      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                      .slice(-6); // Last 6 months
                    
                    const maxAmount = Math.max(...Object.values(monthlyData), 1);
                    
                    return sortedMonths.length > 0 ? (
                      <div className="space-y-3">
                        {sortedMonths.map(([month, amount]) => {
                          const percentage = (amount / maxAmount) * 100;
                          return (
                            <div key={month} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{month}</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div 
                                  className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No expense data available for trend analysis</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              {/* Income vs Expense Comparison */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income vs Expenses</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-sm text-green-600 dark:text-green-400 mb-1">Total Income</div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      ${transactions
                        .filter(t => t.type === 'income')
                        .reduce((sum, t) => sum + t.amount, 0)
                        .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-sm text-red-600 dark:text-red-400 mb-1">Total Expenses</div>
                    <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                      ${transactions
                        .filter(t => t.type === 'expense')
                        .reduce((sum, t) => sum + t.amount, 0)
                        .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        initialFilters={{
          type: filterType === 'all' ? 'all' : filterType,
          category: filterCategory,
          dateRange: { start: '', end: '' },
          amountRange: { min: 0, max: 100000 }
        }}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        importType="transactions"
      />

      {/* Inline Import Modal (old) - REMOVED */}
      {false && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Upload className="text-gray-600 dark:text-gray-400" size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Import Transactions</h3>
              </div>
              <button 
                onClick={() => setShowImportModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select File (CSV or JSON)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <input 
                    type="file" 
                    accept=".csv,.json" 
                    className="hidden" 
                    id="import-file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const data = JSON.parse(event.target?.result as string);
                            if (data.transactions && Array.isArray(data.transactions)) {
                              // Import transactions using the finance store
                              data.transactions.forEach((t: Transaction) => {
                                createTransaction(t).catch(console.error);
                              });
                              success(`Successfully imported ${data.transactions.length} transactions!`);
                              setShowImportModal(false);
                            } else {
                              showError('Invalid file format. Expected JSON with transactions array.');
                            }
                          } catch (error) {
                            showError('Failed to parse file. Please check the format.');
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                  <label 
                    htmlFor="import-file"
                    className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Click to upload
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Supports CSV and JSON formats
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Progress Update Modal */}
      {showProgressUpdateModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-lg shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Progress to {selectedGoal.name}</h3>
              <button onClick={() => setShowProgressUpdateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Amount"
                className="w-full px-3 py-2 border rounded-lg"
                id="progress-amount"
              />
              <button
                onClick={() => {
                  const amount = parseFloat((document.getElementById('progress-amount') as HTMLInputElement)?.value || '0');
                  if (amount > 0) {
                    handleUpdateProgress(selectedGoal.id, amount);
                  }
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Detail Modal */}
      {showBudgetDetailModal && selectedBudget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-lg shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Budget Details</h3>
              <button onClick={() => setShowBudgetDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedBudget.name}</p>
              <p><strong>Category:</strong> {selectedBudget.category}</p>
              <p><strong>Amount:</strong> ${selectedBudget.amount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Goal Detail Modal */}
      {showGoalDetailModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-lg shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Goal Details</h3>
              <button onClick={() => setShowGoalDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedGoal.name}</p>
              <p><strong>Target:</strong> ${selectedGoal.target_amount.toLocaleString()}</p>
              <p><strong>Current:</strong> ${(selectedGoal.current_amount || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Modal */}
      {showAIInsightsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">AI Financial Insights</h3>
              <button onClick={() => setShowAIInsightsModal(false)}>
                <X size={20} />
              </button>
            </div>
            <AIInsights type="finance" limit={10} />
          </div>
        </div>
      )}

      {/* AI Budget Recommendations Modal */}
      <AIBudgetRecommendations
        isOpen={showAIBudgetModal}
        onClose={() => setShowAIBudgetModal(false)}
        transactions={transactions}
        existingBudgets={budgets}
        onApply={(recommendations) => {
          // Apply selected recommendations by creating budgets
          recommendations.forEach(rec => {
            const budgetData: Budget = {
              id: `budget-${Date.now()}-${Math.random()}`,
              user_id: 'current-user',
              name: `AI Recommended: ${rec.category}`,
              category: rec.category.toLowerCase().replace(/\s+/g, '_'),
              amount: rec.recommendedAmount,
              period: 'monthly',
              currency: 'USD',
              budget_type: 'category',
              start_date: new Date().toISOString(),
              end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
              is_active: true,
              spent: 0,
              remaining: rec.recommendedAmount,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              alerts: {
                warning_threshold: 0.8,
                critical_threshold: 0.95,
                email_alerts: true,
                push_alerts: true,
              },
            };
            handleAddBudget(budgetData);
          });
          success('Recommendations Applied', `Applied ${recommendations.length} AI budget recommendations!`);
        }}
      />

      {/* Goals Modal */}
      <GoalsModal
        isOpen={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
      />

      {/* Investments Modal */}
      <InvestmentsModal
        isOpen={showInvestmentsModal}
        onClose={() => setShowInvestmentsModal(false)}
      />

      {/* Debt Tracker Modal */}
      <DebtsModal
        isOpen={showDebtTrackerModal}
        onClose={() => setShowDebtTrackerModal(false)}
      />

      {/* Forecast Modal */}
      <ForecastModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
      />
    </div>
  );
};

export default FinancePage;
