import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, CheckCircle, AlertCircle, Loader2, Building2, CreditCard, PiggyBank, Building } from 'lucide-react';
import { bankIntegrationAPIService, BankConnection } from '../../services/bankIntegration';

interface BankConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (connection: BankConnection) => void;
}

const SUPPORTED_BANKS = [
  { name: 'Chase Bank', logo: '🏦', type: 'Major Bank' },
  { name: 'Bank of America', logo: '🏛️', type: 'Major Bank' },
  { name: 'Wells Fargo', logo: '🏦', type: 'Major Bank' },
  { name: 'Citibank', logo: '🏛️', type: 'Major Bank' },
  { name: 'Ally Bank', logo: '🏦', type: 'Online Bank' },
  { name: 'Capital One', logo: '🏛️', type: 'Major Bank' },
  { name: 'American Express', logo: '💳', type: 'Credit Card' },
  { name: 'Discover Bank', logo: '🏦', type: 'Online Bank' },
  { name: 'US Bank', logo: '🏛️', type: 'Major Bank' },
  { name: 'PNC Bank', logo: '🏦', type: 'Regional Bank' },
];

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking Account', icon: <Building2 size={20} /> },
  { value: 'savings', label: 'Savings Account', icon: <PiggyBank size={20} /> },
  { value: 'credit_card', label: 'Credit Card', icon: <CreditCard size={20} /> },
  { value: 'investment', label: 'Investment Account', icon: <Building size={20} /> },
];

const BankConnectionModal: React.FC<BankConnectionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'select-bank' | 'credentials' | 'connecting' | 'success' | 'error'>('select-bank');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [accountType, setAccountType] = useState<string>('checking');
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [connection, setConnection] = useState<BankConnection | null>(null);

  const handleBankSelect = (bankName: string) => {
    setSelectedBank(bankName);
    setStep('credentials');
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('connecting');
    setError('');

    try {
      const newConnection = await bankIntegrationAPIService.connectBankAccount(selectedBank, {
        username: credentials.username,
        password: credentials.password,
        accountType,
      });

      setConnection(newConnection);
      setStep('success');
      setTimeout(() => {
        onSuccess(newConnection);
        onClose();
        resetModal();
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect bank account');
      setStep('error');
    }
  };

  const resetModal = () => {
    setStep('select-bank');
    setSelectedBank('');
    setAccountType('checking');
    setCredentials({ username: '', password: '' });
    setError('');
    setConnection(null);
  };

  const handleClose = () => {
    if (step === 'connecting') return; // Prevent closing while connecting
    onClose();
    resetModal();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="text-blue-600" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Connect Bank Account</h2>
                  <p className="text-sm text-gray-600">Securely link your bank account</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={step === 'connecting'}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'select-bank' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select Your Bank</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose your bank from our list of supported institutions
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                    {SUPPORTED_BANKS.map((bank) => (
                      <button
                        key={bank.name}
                        onClick={() => handleBankSelect(bank.name)}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="text-2xl">{bank.logo}</div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{bank.name}</div>
                          <div className="text-sm text-gray-600">{bank.type}</div>
                        </div>
                        <CheckCircle className="text-gray-400" size={20} />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield size={16} />
                    <span>Your credentials are encrypted and secure</span>
                  </div>
                </div>
              )}

              {step === 'credentials' && (
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Connect to {selectedBank}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Enter your bank credentials to securely connect your account
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ACCOUNT_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setAccountType(type.value)}
                          className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                            accountType === type.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {type.icon}
                          <span className="text-sm">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Username or Email
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your username or email"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield size={16} />
                    <span>Your credentials are encrypted and never stored</span>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep('select-bank')}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Connect Account
                    </button>
                  </div>
                </form>
              )}

              {step === 'connecting' && (
                <div className="text-center py-8">
                  <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Connecting to {selectedBank}</h3>
                  <p className="text-sm text-gray-600">
                    Please wait while we securely connect your account...
                  </p>
                </div>
              )}

              {step === 'success' && connection && (
                <div className="text-center py-8">
                  <CheckCircle className="text-green-600 mx-auto mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Successfully Connected!</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your {connection.bank_name} account has been connected successfully.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-800">
                      <div>Account: ****{connection.account_number}</div>
                      <div>Balance: ${connection.balance.toLocaleString()}</div>
                      <div>Status: {connection.status}</div>
                    </div>
                  </div>
                </div>
              )}

              {step === 'error' && (
                <div className="text-center py-8">
                  <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Failed</h3>
                  <p className="text-sm text-gray-600 mb-4">{error}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('select-bank')}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BankConnectionModal;
