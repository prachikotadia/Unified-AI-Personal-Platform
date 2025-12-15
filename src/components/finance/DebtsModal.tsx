import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit, Trash2, CreditCard, Save, Calendar } from 'lucide-react';
import { useFinanceStore } from '../../store/finance';
import { DebtTracker, DebtTrackerCreate } from '../../services/financeAPI';
import { generateLocalId } from '../../utils/financeHelpers';
import { useToastHelpers } from '../ui/Toast';

interface DebtsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DebtsModal: React.FC<DebtsModalProps> = ({ isOpen, onClose }) => {
  const { debtTrackers, createDebtTracker, updateDebtTracker, deleteDebtTracker } = useFinanceStore();
  const { success, error } = useToastHelpers();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<DebtTrackerCreate>>({
    name: '',
    creditor: '',
    account_number: '',
    debt_type: 'credit_card',
    original_amount: 0,
    current_balance: 0,
    interest_rate: 0,
    monthly_payment: 0,
    due_date: '',
    remaining_payments: 0,
    priority: 'medium',
    status: 'active',
  });

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.current_balance) {
        error('Name and current balance are required');
        return;
      }

      const now = new Date().toISOString();
      const debtData: DebtTracker = {
        id: editingId || generateLocalId(),
        user_id: 'user_123',
        name: formData.name!,
        creditor: formData.creditor || '',
        account_number: formData.account_number || '',
        debt_type: formData.debt_type || 'credit_card',
        original_amount: formData.original_amount || formData.current_balance!,
        current_balance: formData.current_balance!,
        interest_rate: formData.interest_rate || 0,
        monthly_payment: formData.monthly_payment || 0,
        due_date: formData.due_date || now,
        remaining_payments: formData.remaining_payments || 0,
        priority: formData.priority || 'medium',
        status: formData.status || 'active',
        notes: formData.notes,
        created_at: editingId ? debtTrackers.find(d => d.id === editingId)?.created_at || now : now,
        updated_at: now,
      };

      if (editingId) {
        await updateDebtTracker(editingId, debtData);
        success('Debt updated successfully!');
      } else {
        await createDebtTracker(debtData);
        success('Debt created successfully!');
      }

      setFormData({
        name: '',
        creditor: '',
        account_number: '',
        debt_type: 'credit_card',
        original_amount: 0,
        current_balance: 0,
        interest_rate: 0,
        monthly_payment: 0,
        due_date: '',
        remaining_payments: 0,
        priority: 'medium',
        status: 'active',
      });
      setEditingId(null);
      setShowAddForm(false);
    } catch (err: any) {
      error(err.message || 'Failed to save debt');
    }
  };

  const handleEdit = (debt: DebtTracker) => {
    setFormData({
      name: debt.name,
      creditor: debt.creditor,
      account_number: debt.account_number,
      debt_type: debt.debt_type,
      original_amount: debt.original_amount,
      current_balance: debt.current_balance,
      interest_rate: debt.interest_rate,
      monthly_payment: debt.monthly_payment,
      due_date: debt.due_date.split('T')[0],
      remaining_payments: debt.remaining_payments,
      priority: debt.priority,
      status: debt.status,
      notes: debt.notes,
    });
    setEditingId(debt.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this debt?')) {
      try {
        await deleteDebtTracker(id);
        success('Debt deleted successfully!');
      } catch (err: any) {
        error(err.message || 'Failed to delete debt');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <CreditCard className="text-red-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Debt Tracker</h2>
                <p className="text-sm text-gray-600">Manage your debts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">
                  {editingId ? 'Edit Debt' : 'Add New Debt'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Debt Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., Credit Card"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Creditor</label>
                    <input
                      type="text"
                      value={formData.creditor || ''}
                      onChange={(e) => setFormData({ ...formData, creditor: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., Bank Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Debt Type</label>
                    <select
                      value={formData.debt_type || 'credit_card'}
                      onChange={(e) => setFormData({ ...formData, debt_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="loan">Loan</option>
                      <option value="mortgage">Mortgage</option>
                      <option value="student_loan">Student Loan</option>
                      <option value="car_loan">Car Loan</option>
                      <option value="personal_loan">Personal Loan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Balance *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.current_balance || 0}
                      onChange={(e) => setFormData({ ...formData, current_balance: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.original_amount || 0}
                      onChange={(e) => setFormData({ ...formData, original_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.interest_rate || 0}
                      onChange={(e) => setFormData({ ...formData, interest_rate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Payment</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.monthly_payment || 0}
                      onChange={(e) => setFormData({ ...formData, monthly_payment: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={formData.due_date || ''}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    {editingId ? 'Update Debt' : 'Create Debt'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                      setFormData({
                        name: '',
                        creditor: '',
                        account_number: '',
                        debt_type: 'credit_card',
                        original_amount: 0,
                        current_balance: 0,
                        interest_rate: 0,
                        monthly_payment: 0,
                        due_date: '',
                        remaining_payments: 0,
                        priority: 'medium',
                        status: 'active',
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Add Button */}
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mb-4 w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add New Debt
              </button>
            )}

            {/* Debts List */}
            <div className="space-y-4">
              {debtTrackers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No debts tracked yet. Add your first debt!</p>
                </div>
              ) : (
                debtTrackers.map((debt) => {
                  const paidOff = (debt.original_amount || debt.current_balance) - debt.current_balance;
                  const progress = debt.original_amount > 0 
                    ? (paidOff / debt.original_amount) * 100 
                    : 0;
                  
                  return (
                    <div key={debt.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{debt.name}</h3>
                          <p className="text-sm text-gray-600">
                            {debt.creditor && `${debt.creditor} • `}
                            {debt.debt_type.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(debt)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(debt.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Current Balance:</span>
                          <p className="font-semibold">${(debt.current_balance || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Monthly Payment:</span>
                          <p className="font-semibold">${(debt.monthly_payment || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Interest Rate:</span>
                          <p className="font-semibold">{(debt.interest_rate || 0).toFixed(2)}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {debtTrackers.length} debt{debtTrackers.length !== 1 ? 's' : ''} total
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DebtsModal;

