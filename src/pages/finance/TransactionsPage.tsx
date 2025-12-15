import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  DollarSign,
  Tag,
  MapPin,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
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
  Gift,
  RefreshCw,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
  Copy,
  Repeat,
  Camera,
  Brain,
  X,
  FileText,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { transactionSyncService, SyncStatus } from '../../services/transactionSync';
import TransactionModal from '../../components/finance/TransactionModal';
import BulkOperationsModal from '../../components/finance/BulkOperationsModal';
import { useTransactions } from '../../hooks/useFinance';
import { Transaction as APITransaction } from '../../services/financeAPI';
import { useFinanceStore } from '../../store/finance';
import { usePagination } from '../../hooks/usePagination';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  amount: number;
  description: string;
  merchant?: string;
  location?: any;
  date: string;
  tags: string[];
  notes?: string;
  receipt_url?: string;
}

interface Category {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const TransactionsPage: React.FC = () => {
  // Use finance store for transactions (persists to localStorage)
  const { 
    transactions: storeTransactions, 
    isLoading: storeLoading,
    fetchTransactions,
    createTransaction: createTransactionHandler,
    updateTransaction: updateTransactionHandler,
    deleteTransaction: deleteTransactionHandler
  } = useTransactions();
  
  // Also get direct store actions for immediate updates
  const { createTransaction, updateTransaction, deleteTransaction } = useFinanceStore();
  
  // Convert store transactions to local Transaction format
  const transactions: Transaction[] = storeTransactions.map(t => ({
    id: t.id,
    type: t.type as 'income' | 'expense',
    category: t.category,
    subcategory: t.subcategory,
    amount: t.amount,
    description: t.description,
    merchant: t.notes || '',
    location: undefined,
    date: t.date,
    tags: [],
    notes: t.notes,
    receipt_url: t.receipt_url
  }));
  
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const loading = storeLoading;
  
  // New state for enhanced features
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(transactionSyncService.getStatus());
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'update' | 'delete' | 'tag'>('update');
  
  // Additional modal states
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [showReceiptUploadModal, setShowReceiptUploadModal] = useState(false);
  const [showReceiptScannerModal, setShowReceiptScannerModal] = useState(false);
  const [showReceiptViewModal, setShowReceiptViewModal] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'none' | 'date' | 'category' | 'merchant'>('none');
  const [isAICategorizing, setIsAICategorizing] = useState(false);

  const expenseCategories: Category[] = [
    { value: 'food_dining', label: 'Food & Dining', icon: <Utensils size={20} />, color: '#FF6B6B' },
    { value: 'transportation', label: 'Transportation', icon: <Car size={20} />, color: '#4ECDC4' },
    { value: 'housing', label: 'Housing', icon: <Home size={20} />, color: '#45B7D1' },
    { value: 'utilities', label: 'Utilities', icon: <Zap size={20} />, color: '#96CEB4' },
    { value: 'entertainment', label: 'Entertainment', icon: <Film size={20} />, color: '#FFEAA7' },
    { value: 'shopping', label: 'Shopping', icon: <ShoppingBag size={20} />, color: '#DDA0DD' },
    { value: 'healthcare', label: 'Healthcare', icon: <Heart size={20} />, color: '#98D8C8' },
    { value: 'education', label: 'Education', icon: <BookOpen size={20} />, color: '#F7DC6F' },
    { value: 'travel', label: 'Travel', icon: <Plane size={20} />, color: '#BB8FCE' },
    { value: 'insurance', label: 'Insurance', icon: <InsuranceIcon size={20} />, color: '#85C1E9' },
    { value: 'taxes', label: 'Taxes', icon: <Coins size={20} />, color: '#F8C471' },
    { value: 'debt_payment', label: 'Debt Payment', icon: <DebtIcon size={20} />, color: '#EC7063' },
    { value: 'savings', label: 'Savings', icon: <Gem size={20} />, color: '#52C3D2' },
    { value: 'investment', label: 'Investment', icon: <InvestmentIcon size={20} />, color: '#58D68D' },
    { value: 'other', label: 'Other', icon: <Package size={20} />, color: '#BDC3C7' }
  ];

  const incomeCategories: Category[] = [
    { value: 'salary', label: 'Salary', icon: <Briefcase size={20} />, color: '#2ECC71' },
    { value: 'freelance', label: 'Freelance', icon: <Monitor size={20} />, color: '#3498DB' },
    { value: 'business', label: 'Business', icon: <Building size={20} />, color: '#9B59B6' },
    { value: 'investment', label: 'Investment', icon: <InvestmentIcon size={20} />, color: '#F1C40F' },
    { value: 'rental', label: 'Rental', icon: <RentalIcon size={20} />, color: '#E67E22' },
    { value: 'interest', label: 'Interest', icon: <Banknote size={20} />, color: '#1ABC9C' },
    { value: 'dividend', label: 'Dividend', icon: <DividendIcon size={20} />, color: '#34495E' },
    { value: 'gift', label: 'Gift', icon: <Gift size={20} />, color: '#E74C3C' },
    { value: 'refund', label: 'Refund', icon: <Receipt size={20} />, color: '#95A5A6' },
    { value: 'other', label: 'Other', icon: <Package size={20} />, color: '#BDC3C7' }
  ];

  useEffect(() => {
    // Load transactions from store (which loads from localStorage)
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    let filtered = transactions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, selectedType, selectedCategory, sortBy, sortOrder]);

  // Pagination for large transaction lists
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedTransactions,
    goToPage,
    nextPage,
    previousPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
  } = usePagination({
    items: filteredTransactions,
    itemsPerPage: 50, // Show 50 transactions per page
    initialPage: 1,
  });

  // Subscribe to sync status updates
  useEffect(() => {
    const unsubscribe = transactionSyncService.subscribeToStatus(setSyncStatus);
    return unsubscribe;
  }, []);

  // Subscribe to new transactions from sync
  useEffect(() => {
    const unsubscribe = transactionSyncService.subscribeToTransactions((newTransactions) => {
      setTransactions(prev => [...newTransactions, ...prev]);
      setFilteredTransactions(prev => [...newTransactions, ...prev]);
    });
    return unsubscribe;
  }, []);

  const getCategoryIcon = (category: string) => {
    const allCategories = [...expenseCategories, ...incomeCategories];
    const found = allCategories.find(c => c.value === category);
    return found?.icon || <Package size={20} />;
  };

  const getCategoryColor = (category: string) => {
    const allCategories = [...expenseCategories, ...incomeCategories];
    const found = allCategories.find(c => c.value === category);
    return found?.color || '#BDC3C7';
  };

  const getCategoryLabel = (category: string) => {
    const allCategories = [...expenseCategories, ...incomeCategories];
    const found = allCategories.find(c => c.value === category);
    return found?.label || category.replace('_', ' ');
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netFlow = totalIncome - totalExpenses;

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowEditModal(true);
  };

  // Enhanced transaction handlers
  const handleAddTransaction = () => {
    setModalMode('add');
    setSelectedTransaction(null);
    setShowTransactionModal(true);
  };

  const handleEditTransactionModal = (transaction: Transaction) => {
    setModalMode('edit');
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleDeleteTransactionModal = (transaction: Transaction) => {
    setModalMode('delete');
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleTransactionSuccess = async (transaction: Transaction) => {
    try {
      if (modalMode === 'add') {
        // Convert to API format and save to store (persists to localStorage)
        const apiTransaction: APITransaction = {
          id: transaction.id || Date.now().toString(),
          user_id: 'user_123',
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          date: transaction.date,
          account_id: undefined,
          notes: transaction.notes,
          receipt_url: transaction.receipt_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await createTransaction(apiTransaction);
        // Store automatically persists to localStorage via persist middleware
      } else if (modalMode === 'edit' && selectedTransaction) {
        // Convert to API format and update in store (persists to localStorage)
        const apiTransaction: Partial<APITransaction> = {
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          date: transaction.date,
          notes: transaction.notes,
          receipt_url: transaction.receipt_url,
          updated_at: new Date().toISOString()
        };
        await updateTransaction(selectedTransaction.id, apiTransaction);
        // Store automatically persists to localStorage via persist middleware
      }
      setShowTransactionModal(false);
      setSelectedTransaction(null);
      setModalMode('add');
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleTransactionDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      // Store automatically persists to localStorage via persist middleware
      setShowTransactionModal(false);
      setSelectedTransaction(null);
      setModalMode('add');
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleConfirmDelete = (transaction: Transaction) => {
    handleTransactionDelete(transaction.id);
    setShowTransactionModal(false);
    setSelectedTransaction(null);
    setModalMode('add');
  };

  // Bulk operations handlers
  const handleBulkUpdate = async (transactionIds: string[], updates: Partial<Transaction>) => {
    // Update each transaction in the store
    for (const id of transactionIds) {
      try {
        const apiUpdates: Partial<APITransaction> = {
          description: updates.description,
          amount: updates.amount,
          type: updates.type as 'income' | 'expense',
          category: updates.category,
          date: updates.date,
          notes: updates.notes,
          receipt_url: updates.receipt_url,
          updated_at: new Date().toISOString()
        };
        await updateTransaction(id, apiUpdates);
      } catch (error) {
        console.error(`Error updating transaction ${id}:`, error);
      }
    }
  };

  const handleBulkDelete = async (transactionIds: string[]) => {
    // Delete each transaction from the store
    for (const id of transactionIds) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        console.error(`Error deleting transaction ${id}:`, error);
      }
    }
  };

  const handleImport = async (newTransactions: Transaction[]) => {
    // Import transactions to store
    for (const transaction of newTransactions) {
      try {
        const apiTransaction: APITransaction = {
          id: transaction.id || Date.now().toString(),
          user_id: 'user_123',
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          date: transaction.date,
          account_id: undefined,
          notes: transaction.notes,
          receipt_url: transaction.receipt_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await createTransaction(apiTransaction);
      } catch (error) {
        console.error(`Error importing transaction ${transaction.id}:`, error);
      }
    }
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    // Simulate export functionality
    console.log(`Exporting transactions in ${format} format`);
    // In a real implementation, this would call the export service
    if (format === 'csv') {
      const csvContent = [
        ['Date', 'Description', 'Category', 'Amount', 'Type', 'Merchant'].join(','),
        ...filteredTransactions.map(t => [
          t.date,
          `"${t.description}"`,
          t.category,
          t.amount,
          t.type,
          t.merchant || ''
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDuplicateTransaction = async (transaction: Transaction) => {
    try {
      const duplicated: APITransaction = {
        id: Date.now().toString(),
        user_id: 'user_123',
        description: `${transaction.description} (Copy)`,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: new Date().toISOString().split('T')[0],
        account_id: undefined,
        notes: transaction.notes,
        receipt_url: transaction.receipt_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await createTransaction(duplicated);
    } catch (error) {
      console.error('Error duplicating transaction:', error);
    }
  };

  const handleMarkAsRecurring = async (transaction: Transaction) => {
    // Note: Recurring flag would need to be added to the Transaction model
    // For now, just update the transaction with a note
    try {
      await updateTransaction(transaction.id, {
        notes: transaction.notes ? `${transaction.notes} [Recurring]` : '[Recurring]',
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking transaction as recurring:', error);
    }
  };

  const handleViewReceipt = (receiptUrl: string) => {
    setSelectedReceiptUrl(receiptUrl);
    setShowReceiptViewModal(true);
  };

  const handleReceiptUpload = async (file: File) => {
    // Simulate receipt upload
    console.log('Uploading receipt:', file.name);
    // In a real implementation, this would upload to a storage service
    // and return the URL
    return `https://example.com/receipts/${file.name}`;
  };

  const handleAICategorize = async () => {
    setIsAICategorizing(true);
    try {
      // Simulate AI categorization
      await new Promise(resolve => setTimeout(resolve, 2000));
      // In a real implementation, this would call an AI service
      // to categorize uncategorized transactions
      const uncategorized = transactions.filter(t => !t.category || t.category === 'other');
      // Mock categorization
      const categorized = uncategorized.map(t => ({
        ...t,
        category: t.type === 'expense' ? 'food_dining' : 'salary'
      }));
      setTransactions(prev => prev.map(t => {
        const found = categorized.find(c => c.id === t.id);
        return found || t;
      }));
    } finally {
      setIsAICategorizing(false);
    }
  };

  // Group transactions
  // Use paginated transactions for grouping
  const transactionsToGroup = paginatedTransactions.length > 0 ? paginatedTransactions : filteredTransactions;
  
  const groupedTransactions = (() => {
    if (groupBy === 'none') return { 'All': transactionsToGroup };
    
    const groups: Record<string, Transaction[]> = {};
    transactionsToGroup.forEach(t => {
      let key = 'All';
      if (groupBy === 'date') {
        key = new Date(t.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      } else if (groupBy === 'category') {
        key = getCategoryLabel(t.category);
      } else if (groupBy === 'merchant') {
        key = t.merchant || 'Unknown';
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  })();

  // Sync handlers
  const handleManualSync = async () => {
    try {
      await transactionSyncService.performSync();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
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
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-2">Manage your income and expenses</p>
            
            {/* Sync Status */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                {syncStatus.isConnected ? (
                  <CheckCircle className="text-green-600" size={16} />
                ) : (
                  <AlertCircle className="text-red-600" size={16} />
                )}
                <span className="text-sm text-gray-600">
                  {syncStatus.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {syncStatus.lastSync && (
                <div className="flex items-center gap-2">
                  <Clock className="text-gray-400" size={16} />
                  <span className="text-sm text-gray-600">
                    Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
                  </span>
                </div>
              )}
              
              {syncStatus.syncInProgress && (
                <div className="flex items-center gap-2">
                  <RefreshCw className="text-blue-600 animate-spin" size={16} />
                  <span className="text-sm text-blue-600">Syncing...</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleManualSync}
              disabled={syncStatus.syncInProgress}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={syncStatus.syncInProgress ? 'animate-spin' : ''} size={16} />
              Sync
            </button>
            
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Filter size={16} />
              Bulk Operations
            </button>

            <button
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Upload size={16} />
              Bulk Import
            </button>

            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>

            <button
              onClick={() => setShowFilterSidebar(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Filter size={16} />
              Filter
            </button>

            <button
              onClick={() => setShowReceiptUploadModal(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <Upload size={16} />
              Receipt Upload
            </button>

            <button
              onClick={() => setShowReceiptScannerModal(true)}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
            >
              <Camera size={16} />
              Receipt Scanner
            </button>

            <button
              onClick={handleAICategorize}
              disabled={isAICategorizing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Brain size={16} className={isAICategorizing ? 'animate-pulse' : ''} />
              AI Categorize
            </button>
            
            <button 
              onClick={handleAddTransaction}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add Transaction
            </button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ArrowUpRight className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
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
                <p className="text-sm text-gray-600">Net Flow</p>
                <p className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${netFlow.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${netFlow >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={netFlow >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'all' | 'income' | 'expense')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {selectedType === 'income' || selectedType === 'all' ? (
                <optgroup label="Income Categories">
                  {incomeCategories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </optgroup>
              ) : null}
              {selectedType === 'expense' || selectedType === 'all' ? (
                <optgroup label="Expense Categories">
                  {expenseCategories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </optgroup>
              ) : null}
            </select>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'description')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="description">Description</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>

          {/* Group By */}
          <div className="mt-4 flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Group By:</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'none' | 'date' | 'category' | 'merchant')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="none">None</option>
              <option value="date">Date</option>
              <option value="category">Category</option>
              <option value="merchant">Merchant</option>
            </select>
          </div>
        </motion.div>

        {/* Transactions List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Transactions ({filteredTransactions.length})
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            <AnimatePresence>
              {Object.entries(groupedTransactions).map(([groupName, groupTransactions]) => (
                <div key={groupName}>
                  {groupBy !== 'none' && (
                    <div className="px-6 py-3 bg-gray-100 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Layers size={16} />
                        {groupName} ({groupTransactions.length})
                      </h3>
                    </div>
                  )}
                  {groupTransactions.map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-6 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: getCategoryColor(transaction.category) + '20' }}
                          >
                            <div style={{ color: getCategoryColor(transaction.category) }}>
                              {getCategoryIcon(transaction.category)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Tag size={14} />
                                {getCategoryLabel(transaction.category)}
                              </span>
                              {transaction.merchant && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  {transaction.merchant}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(transaction.date).toLocaleDateString()}
                              </span>
                            </div>
                            {transaction.tags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {transaction.tags.map(tag => (
                                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 capitalize">
                              {transaction.type}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEditTransactionModal(transaction)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleTransactionDelete(transaction.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDuplicateTransaction(transaction)}
                              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Duplicate"
                            >
                              <Copy size={16} />
                            </button>
                            <button 
                              onClick={() => handleMarkAsRecurring(transaction)}
                              className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Mark as Recurring"
                            >
                              <Repeat size={16} />
                            </button>
                            {transaction.receipt_url ? (
                              <button 
                                onClick={() => handleViewReceipt(transaction.receipt_url!)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="View Receipt"
                              >
                                <Receipt size={16} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setShowReceiptUploadModal(true);
                                }}
                                className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                title="Upload Receipt"
                              >
                                <Upload size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </AnimatePresence>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <DollarSign size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">Try adjusting your filters or add a new transaction.</p>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredTransactions.length > 50 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex} to {endIndex} of {filteredTransactions.length} transactions
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={previousPage}
                  disabled={!canGoPrevious}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-1 rounded ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        } transition-colors`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={nextPage}
                  disabled={!canGoNext}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Add Transaction Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Transaction</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    {expenseCategories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Transaction description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Merchant</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Merchant name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Transaction
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Transaction Modal */}
        {showEditModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Transaction</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    defaultValue={selectedTransaction.type}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    defaultValue={selectedTransaction.category}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {expenseCategories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={selectedTransaction.amount}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    defaultValue={selectedTransaction.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Merchant</label>
                  <input
                    type="text"
                    defaultValue={selectedTransaction.merchant}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    defaultValue={selectedTransaction.date}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Transaction
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>

      {/* Enhanced Transaction Modal */}
      {modalMode !== 'delete' && (
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => {
            setShowTransactionModal(false);
            setSelectedTransaction(null);
          }}
          mode={modalMode}
          transaction={selectedTransaction || undefined}
          onSave={(transaction) => {
            if (modalMode === 'add') {
              handleTransactionSuccess(transaction);
            } else if (modalMode === 'edit') {
              handleTransactionSuccess(transaction);
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {modalMode === 'delete' && selectedTransaction && showTransactionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Transaction</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedTransaction.description}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTransactionModal(false);
                  setSelectedTransaction(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(selectedTransaction)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bulk Operations Modal */}
      <BulkOperationsModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        transactions={transactions}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDelete}
        onImport={handleImport}
        onExport={handleExport}
      />

      {/* Filter Sidebar */}
      {showFilterSidebar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="bg-white w-80 h-full shadow-xl overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button
                  onClick={() => setShowFilterSidebar(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as 'all' | 'income' | 'expense')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Categories</option>
                  {selectedType === 'income' || selectedType === 'all' ? (
                    <optgroup label="Income">
                      {incomeCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </optgroup>
                  ) : null}
                  {selectedType === 'expense' || selectedType === 'all' ? (
                    <optgroup label="Expenses">
                      {expenseCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </optgroup>
                  ) : null}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'description')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="description">Description</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSelectedCategory('all');
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
          <div className="flex-1" onClick={() => setShowFilterSidebar(false)}></div>
        </div>
      )}

      {/* Receipt Upload Modal */}
      {showReceiptUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upload Receipt</h2>
              <button onClick={() => setShowReceiptUploadModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 mb-2">Drop receipt image here or click to browse</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="receipt-upload"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && selectedTransaction) {
                      const url = await handleReceiptUpload(file);
                      const updated = { ...selectedTransaction, receipt_url: url };
                      setTransactions(prev => prev.map(t => t.id === selectedTransaction.id ? updated : t));
                      setShowReceiptUploadModal(false);
                    }
                  }}
                />
                <label
                  htmlFor="receipt-upload"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Select File
                </label>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Receipt Scanner Modal */}
      {showReceiptScannerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Receipt Scanner</h2>
              <button onClick={() => setShowReceiptScannerModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 mb-4">Camera access required for receipt scanning</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Open Camera
                </button>
              </div>
              <p className="text-sm text-gray-500 text-center">
                This feature will use your device camera to scan and extract information from receipts
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Receipt View Modal */}
      {showReceiptViewModal && selectedReceiptUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Receipt</h2>
              <button onClick={() => {
                setShowReceiptViewModal(false);
                setSelectedReceiptUrl(null);
              }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <img
                src={selectedReceiptUrl}
                alt="Receipt"
                className="w-full rounded-lg border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = '<p class="text-gray-500 text-center py-8">Receipt image not available</p>';
                  }
                }}
              />
              <div className="flex gap-2">
                <a
                  href={selectedReceiptUrl}
                  download
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                >
                  Download
                </a>
                <button
                  onClick={() => {
                    setShowReceiptViewModal(false);
                    setSelectedReceiptUrl(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
