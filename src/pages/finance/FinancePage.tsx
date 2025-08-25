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
  Tag
} from 'lucide-react';
import Sparkles from './Sparkles';
import AIInsights from '../../components/ai/AIInsights';
import AIAssistant from '../../components/ai/AIAssistant';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  merchant?: string;
}

interface BankAccount {
  id: string;
  account_name: string;
  account_type: string;
  bank_name: string;
  balance: number;
  currency: string;
  is_primary: boolean;
}

interface CreditScore {
  score: number;
  range: string;
  trend: string;
  last_updated: string;
}

interface FinancialOffer {
  id: string;
  type: string;
  title: string;
  description: string;
  provider: string;
  approval_chance: number;
  is_pre_approved: boolean;
}

interface MonthlySpending {
  total_income: number;
  total_expenses: number;
  net_savings: number;
  category_breakdown: Record<string, number>;
  spending_trend: string;
}

const FinancePage: React.FC = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [creditScore, setCreditScore] = useState<CreditScore | null>(null);
  const [offers, setOffers] = useState<FinancialOffer[]>([]);
  const [monthlySpending, setMonthlySpending] = useState<MonthlySpending | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setTransactions([
        { id: '1', type: 'expense', category: 'food_dining', amount: 45.50, description: 'Grocery Shopping', date: '2024-06-15', merchant: 'Walmart' },
        { id: '2', type: 'income', category: 'salary', amount: 8500, description: 'Monthly Salary', date: '2024-06-01', merchant: 'Company Inc' },
        { id: '3', type: 'expense', category: 'transportation', amount: 65.00, description: 'Gas Station', date: '2024-06-14', merchant: 'Shell' },
        { id: '4', type: 'expense', category: 'entertainment', amount: 15.99, description: 'Netflix Subscription', date: '2024-06-10', merchant: 'Netflix' },
        { id: '5', type: 'expense', category: 'utilities', amount: 150.00, description: 'Electric Bill', date: '2024-06-05', merchant: 'Power Company' }
      ]);

      setBankAccounts([
        { id: '1', account_name: 'Main Checking', account_type: 'checking', bank_name: 'Chase Bank', balance: 5240.50, currency: 'USD', is_primary: true },
        { id: '2', account_name: 'Savings Account', account_type: 'savings', bank_name: 'Ally Bank', balance: 12500.00, currency: 'USD', is_primary: false },
        { id: '3', account_name: 'Credit Card', account_type: 'credit_card', bank_name: 'American Express', balance: -1250.75, currency: 'USD', is_primary: false }
      ]);

      setCreditScore({
        score: 745,
        range: 'Very Good',
        trend: 'improving',
        last_updated: '2024-06-01'
      });

      setOffers([
        { id: '1', type: 'credit_card', title: 'Chase Freedom Unlimited', description: 'Earn 1.5% cash back on all purchases', provider: 'Chase Bank', approval_chance: 0.85, is_pre_approved: true },
        { id: '2', type: 'loan', title: 'Personal Loan - Low APR', description: 'Consolidate debt with our low-interest loan', provider: 'Wells Fargo', approval_chance: 0.70, is_pre_approved: false },
        { id: '3', type: 'investment', title: 'High-Yield Savings Account', description: 'Earn 4.5% APY on your savings', provider: 'Ally Bank', approval_chance: 0.95, is_pre_approved: true }
      ]);

      setMonthlySpending({
        total_income: 8500,
        total_expenses: 6200,
        net_savings: 2300,
        category_breakdown: {
          housing: 1800,
          food_dining: 800,
          transportation: 400,
          utilities: 300,
          entertainment: 500,
          shopping: 600,
          healthcare: 200,
          insurance: 300,
          taxes: 500,
          debt_payment: 800
        },
        spending_trend: 'decreasing'
      });

      setLoading(false);
    }, 1000);
  }, []);

  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

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

  if (loading) {
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
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Download size={20} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Share2 size={20} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
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
                <p className="text-2xl font-bold text-blue-600">{creditScore?.score}</p>
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
                <p className="text-2xl font-bold text-purple-600">{offers.length}</p>
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
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All
                  </button>
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
                          <p className="text-sm text-gray-600">{transaction.merchant}</p>
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
                  <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                        <p className="text-sm text-gray-600">{transaction.merchant} • {new Date(transaction.date).toLocaleDateString()}</p>
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
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Budget
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(monthlySpending?.category_breakdown || {}).map(([category, amount]) => (
                  <div key={category} className="p-6 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: getCategoryColor(category) + '20' }}
                      >
                        <div style={{ color: getCategoryColor(category) }}>
                          {getCategoryIcon(category)}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">{category.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-600">Monthly Budget</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Spent</span>
                        <span>${amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((amount / 1000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900">${amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Financial Goals</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                    <p className="text-3xl font-bold text-green-600">${monthlySpending?.total_income.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Income</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">${monthlySpending?.total_expenses.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">${monthlySpending?.net_savings.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Net Savings</p>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending by Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(monthlySpending?.category_breakdown || {}).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: getCategoryColor(category) + '20' }}
                        >
                          <div style={{ color: getCategoryColor(category) }}>
                            {getCategoryIcon(category)}
                          </div>
                        </div>
                        <span className="font-medium text-gray-900 capitalize">{category.replace('_', ' ')}</span>
                      </div>
                      <span className="font-semibold text-gray-900">${amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Credit Score */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Credit Score</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold text-blue-600">{creditScore?.score}</p>
                    <p className="text-sm text-gray-600">{creditScore?.range} • {creditScore?.trend}</p>
                    <p className="text-sm text-gray-600">Last updated: {creditScore?.last_updated}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{creditScore?.score}</p>
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
                  {offers.map((offer) => (
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
    </div>
  );
};

export default FinancePage;
