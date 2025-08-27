import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, Tag, FileText, Save, Plus } from 'lucide-react';
import { Transaction, TransactionCreate, TransactionUpdate } from '../../services/financeAPI';
import { useToastHelpers } from '../ui/Toast';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  transaction?: Transaction | null;
  mode: 'add' | 'edit';
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transaction,
  mode
}) => {
  const { success, error } = useToastHelpers();
  const [formData, setFormData] = useState<TransactionCreate>({
    description: '',
    amount: 0,
    type: 'expense',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
    account_id: '',
    notes: '',
    receipt_url: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (transaction && mode === 'edit') {
      setFormData({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date.split('T')[0],
        account_id: transaction.account_id || '',
        notes: transaction.notes || '',
        receipt_url: transaction.receipt_url || ''
      });
    } else {
      setFormData({
        description: '',
        amount: 0,
        type: 'expense',
        category: 'other',
        date: new Date().toISOString().split('T')[0],
        account_id: '',
        notes: '',
        receipt_url: ''
      });
    }
  }, [transaction, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (formData.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Create transaction object
      const transactionData: Transaction = {
        id: transaction?.id || Date.now().toString(),
        user_id: 'user_123',
        description: formData.description.trim(),
        amount: formData.amount,
        type: formData.type,
        category: formData.category,
        date: formData.date,
        account_id: formData.account_id || undefined,
        notes: formData.notes || undefined,
        receipt_url: formData.receipt_url || undefined,
        created_at: transaction?.created_at || new Date().toISOString()
      };

      onSave(transactionData);
      success(`${mode === 'add' ? 'Transaction added' : 'Transaction updated'} successfully!`);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { value: 'food_dining', label: 'Food & Dining' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'housing', label: 'Housing' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'salary', label: 'Salary' },
    { value: 'investment', label: 'Investment' },
    { value: 'education', label: 'Education' },
    { value: 'travel', label: 'Travel' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'taxes', label: 'Taxes' },
    { value: 'debt_payment', label: 'Debt Payment' },
    { value: 'savings', label: 'Savings' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'business', label: 'Business' },
    { value: 'rental', label: 'Rental Income' },
    { value: 'interest', label: 'Interest' },
    { value: 'dividend', label: 'Dividend' },
    { value: 'gift', label: 'Gift' },
    { value: 'refund', label: 'Refund' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="text-blue-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {mode === 'add' ? 'Add Transaction' : 'Edit Transaction'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' ? 'Record a new transaction' : 'Update transaction details'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter transaction description"
                  required
                />
              </div>

              {/* Amount and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' | 'transfer' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
              </div>

              {/* Category and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Account ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account (Optional)
                </label>
                <input
                  type="text"
                  value={formData.account_id}
                  onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Account ID"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any additional notes..."
                  rows={3}
                />
              </div>

              {/* Receipt URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.receipt_url}
                  onChange={(e) => setFormData({ ...formData, receipt_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/receipt"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'add' ? <Plus size={16} /> : <Save size={16} />}
                      {mode === 'add' ? 'Add Transaction' : 'Save Changes'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionModal;
