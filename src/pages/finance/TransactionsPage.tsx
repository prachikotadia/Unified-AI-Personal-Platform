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
  Gift
} from 'lucide-react';

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);

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
    // Mock data loading
    setTimeout(() => {
      const mockTransactions: Transaction[] = [
        { id: '1', type: 'expense', category: 'food_dining', amount: 45.50, description: 'Grocery Shopping', merchant: 'Walmart', date: '2024-06-15', tags: ['groceries', 'food'], notes: 'Weekly grocery shopping' },
        { id: '2', type: 'income', category: 'salary', amount: 8500, description: 'Monthly Salary', merchant: 'Company Inc', date: '2024-06-01', tags: ['salary', 'income'] },
        { id: '3', type: 'expense', category: 'transportation', amount: 65.00, description: 'Gas Station', merchant: 'Shell', date: '2024-06-14', tags: ['gas', 'transportation'] },
        { id: '4', type: 'expense', category: 'entertainment', amount: 15.99, description: 'Netflix Subscription', merchant: 'Netflix', date: '2024-06-10', tags: ['subscription', 'entertainment'] },
        { id: '5', type: 'expense', category: 'utilities', amount: 150.00, description: 'Electric Bill', merchant: 'Power Company', date: '2024-06-05', tags: ['utilities', 'bill'] },
        { id: '6', type: 'expense', category: 'shopping', amount: 89.99, description: 'Amazon Purchase', merchant: 'Amazon', date: '2024-06-12', tags: ['shopping', 'online'] },
        { id: '7', type: 'income', category: 'freelance', amount: 500, description: 'Freelance Project', merchant: 'Client XYZ', date: '2024-06-08', tags: ['freelance', 'income'] },
        { id: '8', type: 'expense', category: 'healthcare', amount: 25.00, description: 'Pharmacy', merchant: 'CVS', date: '2024-06-13', tags: ['healthcare', 'medicine'] },
        { id: '9', type: 'expense', category: 'travel', amount: 250.00, description: 'Hotel Booking', merchant: 'Marriott', date: '2024-06-07', tags: ['travel', 'hotel'] },
        { id: '10', type: 'income', category: 'investment', amount: 150, description: 'Dividend Payment', merchant: 'Vanguard', date: '2024-06-03', tags: ['investment', 'dividend'] }
      ];
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  }, []);

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

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowEditModal(true);
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
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Transaction
          </button>
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
              {filteredTransactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: getCategoryColor(transaction.category) + '20' }}
                      >
                        <div style={{ color: getCategoryColor(transaction.category) }}>
                          {getCategoryIcon(transaction.category)}
                        </div>
                      </div>
                      <div>
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
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditTransaction(transaction)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        {transaction.receipt_url && (
                          <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Receipt size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
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
        </motion.div>

        {/* Add Transaction Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
    </div>
  );
};

export default TransactionsPage;
