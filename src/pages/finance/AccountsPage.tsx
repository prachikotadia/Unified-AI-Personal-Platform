import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Wallet, 
  Building2,
  CreditCard,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lock,
  Unlock,
  Banknote,
  DollarSign,
  Percent
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { BankAccount } from '../../services/financeAPI';
import BankConnectionModal from '../../components/finance/BankConnectionModal';

const AccountsPage: React.FC = () => {
  const { bankAccounts, isLoading, fetchBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount } = useFinance();
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'checking' | 'savings' | 'credit' | 'investment'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showBalances, setShowBalances] = useState(true);

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  const handleAddAccount = () => {
    setSelectedAccount(undefined);
    setShowBankModal(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setShowBankModal(true);
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      await deleteBankAccount(accountId);
    }
  };

  const handleAccountSuccess = (account: BankAccount) => {
    if (selectedAccount) {
      updateBankAccount(account.id, account);
    } else {
      createBankAccount(account);
    }
    setShowBankModal(false);
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet className="text-blue-600" size={20} />;
      case 'savings':
        return <PiggyBank className="text-green-600" size={20} />;
      case 'credit':
        return <CreditCard className="text-purple-600" size={20} />;
      case 'investment':
        return <TrendingUp className="text-orange-600" size={20} />;
      default:
        return <Building2 className="text-gray-600" size={20} />;
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking':
        return 'Checking Account';
      case 'savings':
        return 'Savings Account';
      case 'credit':
        return 'Credit Card';
      case 'investment':
        return 'Investment Account';
      default:
        return 'Account';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const filteredAccounts = bankAccounts.filter(account => {
    const matchesSearch = account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.bank_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || account.account_type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && account.is_active) ||
                         (filterStatus === 'inactive' && !account.is_active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const activeAccounts = bankAccounts.filter(account => account.is_active).length;
  const totalAccounts = bankAccounts.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Accounts</h1>
          <p className="text-gray-600">Manage your bank accounts and financial institutions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title={showBalances ? 'Hide Balances' : 'Show Balances'}
          >
            {showBalances ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button
            onClick={handleAddAccount}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Account
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
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {showBalances ? `$${totalBalance.toLocaleString()}` : '••••••'}
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
              <p className="text-sm font-medium text-gray-600">Active Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{activeAccounts}</p>
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
              <p className="text-sm font-medium text-gray-600">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{totalAccounts}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Wallet className="text-purple-600" size={24} />
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
              <p className="text-sm font-medium text-gray-600">Inactive Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{totalAccounts - activeAccounts}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Clock className="text-gray-600" size={24} />
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
                placeholder="Search accounts..."
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
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="credit">Credit Cards</option>
              <option value="investment">Investment</option>
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
              onClick={() => fetchBankAccounts()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      {isLoading.bankAccounts ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading accounts...</span>
          </div>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No accounts found</h3>
          <p className="mt-2 text-gray-600">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by adding your first bank account.'
            }
          </p>
          {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
            <button
              onClick={handleAddAccount}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus size={16} />
              Add Account
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAccounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Account Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getAccountTypeIcon(account.account_type)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{account.account_name}</h3>
                      <p className="text-sm text-gray-600">{getAccountTypeLabel(account.account_type)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.is_active)}`}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </div>
                    {account.is_primary && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Primary</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>{account.bank_name}</span>
                  <span>Account: {account.account_number}</span>
                </div>

                {account.credit_limit && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-800">Credit Limit: ${account.credit_limit.toLocaleString()}</span>
                      <span className="text-purple-600">
                        Used: {((account.balance / account.credit_limit) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Details */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Current Balance</span>
                    <span className={`text-lg font-semibold ${getBalanceColor(account.balance)}`}>
                      {showBalances ? `$${account.balance.toLocaleString()}` : '••••••'}
                    </span>
                  </div>

                  {account.interest_rate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Interest Rate</span>
                      <span className="text-sm text-gray-900">{account.interest_rate}%</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Last Updated</span>
                    <span className="text-sm text-gray-600">
                      {new Date(account.last_updated).toLocaleDateString()}
                    </span>
                  </div>

                  {account.is_active && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Status</span>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="text-green-600" size={16} />
                        <span className="text-sm text-green-600">Connected</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEditAccount(account)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                  <div className="flex-1" />
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Settings size={12} />
                    {account.account_type.toUpperCase()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Bank Connection Modal */}
      <BankConnectionModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSuccess={handleAccountSuccess}
      />
    </div>
  );
};

export default AccountsPage;
