import React from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, DollarSign, Tag, FileText, Building2, Edit, Trash2, Download } from 'lucide-react';
import { Transaction } from '../../services/financeAPI';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onEdit,
  onDelete
}) => {
  if (!isOpen || !transaction) return null;

  const getCategoryIcon = (category: string) => {
    const categoryMap: Record<string, string> = {
      food_dining: '🍽️',
      transportation: '🚗',
      shopping: '🛍️',
      entertainment: '🎬',
      bills: '📄',
      healthcare: '🏥',
      education: '📚',
      travel: '✈️',
      other: '📦'
    };
    return categoryMap[category] || '📦';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600 bg-green-50';
      case 'expense':
        return 'text-red-600 bg-red-50';
      case 'transfer':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Transaction Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${getTypeColor(transaction.type)}`}>
                <DollarSign size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{transaction.description}</h3>
                <p className="text-sm text-gray-600 capitalize">{transaction.type}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(transaction.type)}`}>
              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
            </div>
          </div>

          {/* Amount Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Amount</span>
              <span className={`text-2xl font-bold ${
                transaction.type === 'income' ? 'text-green-600' : 
                transaction.type === 'expense' ? 'text-red-600' : 
                'text-blue-600'
              }`}>
                {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                ${Math.abs(transaction.amount).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Tag className="text-gray-400" size={20} />
              <div>
                <p className="text-xs text-gray-600">Category</p>
                <p className="font-semibold capitalize flex items-center gap-2">
                  <span>{getCategoryIcon(transaction.category)}</span>
                  {transaction.category.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Calendar className="text-gray-400" size={20} />
              <div>
                <p className="text-xs text-gray-600">Date</p>
                <p className="font-semibold">
                  {new Date(transaction.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {transaction.account_id && (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Building2 className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-600">Account</p>
                  <p className="font-semibold">Account ID: {transaction.account_id}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <FileText className="text-gray-400" size={20} />
              <div>
                <p className="text-xs text-gray-600">Created</p>
                <p className="font-semibold">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {transaction.notes && (
            <div className="border rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Notes</p>
              <p className="text-gray-900">{transaction.notes}</p>
            </div>
          )}

          {/* Receipt Section */}
          {transaction.receipt_url && (
            <div className="border rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Receipt</p>
              <div className="flex items-center gap-3">
                <img
                  src={transaction.receipt_url}
                  alt="Receipt"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
                <button
                  onClick={() => window.open(transaction.receipt_url, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  View Full Receipt
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t">
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(transaction);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit size={16} />
                Edit Transaction
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this transaction?')) {
                    onDelete(transaction.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                Delete Transaction
              </button>
            )}
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TransactionDetailModal;

