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
  Percent,
  Link as LinkIcon,
  RefreshCw as SyncIcon,
  Brain,
  X
} from 'lucide-react';
import { useFinance } from '../../hooks/useFinance';
import { BankAccount } from '../../services/financeAPI';
import BankConnectionModal from '../../components/finance/BankConnectionModal';
import BankAccountModal from '../../components/finance/BankAccountModal';
import { Link } from 'react-router-dom';

const AccountsPage: React.FC = () => {
  const { bankAccounts, isLoading, fetchBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount } = useFinance();
  const [showBankModal, setShowBankModal] = useState(false);
  const [showBankConnectionModal, setShowBankConnectionModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | undefined>();
  const [syncingAccount, setSyncingAccount] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'checking' | 'savings' | 'credit' | 'investment'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showBalances, setShowBalances] = useState(true);

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  const handleAddAccount = () => {
    setModalMode('add');
    setSelectedAccount(undefined);
    setShowBankModal(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setModalMode('edit');
    setSelectedAccount(account);
    setShowBankModal(true);
  };

  const handleSyncAccount = async (accountId: string) => {
    setSyncingAccount(accountId);
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    await fetchBankAccounts();
    setSyncingAccount(null);
  };

  const handleViewTransactions = (accountId: string) => {
    // Navigate to transactions page with account filter
    window.location.href = `/finance/transactions?account=${accountId}`;
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
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Brain size={16} />
            AI Recommendations
          </button>
          <button
            onClick={() => setShowBankConnectionModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <LinkIcon size={16} />
            Link Bank
          </button>
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
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 flex-wrap">
                  <Link
                    to={`/finance/transactions?account=${account.id}`}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Transactions"
                  >
                    <Eye size={14} />
                    Transactions
                  </Link>
                  <button
                    onClick={() => handleSyncAccount(account.id)}
                    disabled={syncingAccount === account.id}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Sync Now"
                  >
                    {syncingAccount === account.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <SyncIcon size={14} />
                        Sync
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleEditAccount(account)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
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

      {/* Bank Account Modal */}
      <BankAccountModal
        isOpen={showBankModal}
        onClose={() => {
          setShowBankModal(false);
          setSelectedAccount(undefined);
        }}
        mode={modalMode}
        account={selectedAccount || undefined}
        onSave={handleAccountSuccess}
      />

      {/* Bank Connection Modal */}
      <BankConnectionModal
        isOpen={showBankConnectionModal}
        onClose={() => setShowBankConnectionModal(false)}
        onSuccess={(connection) => {
          // Convert BankConnection to BankAccount format
          const account: BankAccount = {
            id: connection.id,
            user_id: '', // Will be set by backend
            account_name: `${connection.bank_name} ${connection.account_type}`,
            bank_name: connection.bank_name,
            account_number: connection.account_number,
            account_type: connection.account_type === 'credit_card' ? 'credit' : connection.account_type,
            balance: connection.balance || 0,
            currency: connection.currency || 'USD',
            interest_rate: 0,
            credit_limit: connection.account_type === 'credit_card' ? connection.available_balance : undefined,
            is_active: connection.status === 'connected',
            is_primary: false,
            last_updated: connection.last_sync || new Date().toISOString(),
            created_at: new Date().toISOString()
          };
          createBankAccount(account);
          setShowBankConnectionModal(false);
        }}
      />

      {/* AI Recommendations Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">AI Account Recommendations</h2>
              <button onClick={() => setShowAIModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                AI-powered account recommendations based on your financial goals and spending patterns.
              </p>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">High-Yield Savings Account</h3>
                  <p className="text-sm text-gray-600 mb-2">Recommended: Open a high-yield savings account with 4.5% APY</p>
                  <p className="text-xs text-gray-500">Based on your current savings balance, you could earn $450 more annually</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Credit Card Optimization</h3>
                  <p className="text-sm text-gray-600 mb-2">Consider a balance transfer card with 0% APR</p>
                  <p className="text-xs text-gray-500">Could save you $1,200 in interest over 18 months</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Account Consolidation</h3>
                  <p className="text-sm text-gray-600 mb-2">You have 3 checking accounts - consider consolidating</p>
                  <p className="text-xs text-gray-500">This will simplify your finances and reduce fees</p>
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

export default AccountsPage;
