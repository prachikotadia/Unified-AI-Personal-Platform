import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Save, Plus, Calendar, Flag } from 'lucide-react';
import { FinancialGoal, FinancialGoalCreate, FinancialGoalUpdate } from '../../services/financeAPI';
import { useToastHelpers } from '../ui/Toast';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: FinancialGoal) => void;
  goal?: FinancialGoal | null;
  mode: 'add' | 'edit';
}

const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  goal,
  mode
}) => {
  const { success, error } = useToastHelpers();
  const [formData, setFormData] = useState<FinancialGoalCreate>({
    name: '',
    description: '',
    target_amount: 0,
    current_amount: 0,
    currency: 'USD',
    category: 'savings',
    priority: 'medium',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (goal && mode === 'edit') {
      setFormData({
        name: goal.name,
        description: goal.description,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount,
        currency: goal.currency,
        category: goal.category,
        priority: goal.priority,
        deadline: goal.deadline.split('T')[0],
        status: goal.status,
        notes: goal.notes || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        target_amount: 0,
        current_amount: 0,
        currency: 'USD',
        category: 'savings',
        priority: 'medium',
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        notes: ''
      });
    }
  }, [goal, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Goal name is required');
      }
      if (formData.target_amount <= 0) {
        throw new Error('Target amount must be greater than 0');
      }
      if (formData.current_amount < 0) {
        throw new Error('Current amount cannot be negative');
      }
      if (formData.current_amount > formData.target_amount) {
        throw new Error('Current amount cannot exceed target amount');
      }

      // Create goal object
      const goalData: FinancialGoal = {
        id: goal?.id || Date.now().toString(),
        user_id: 'user_123',
        name: formData.name.trim(),
        description: formData.description.trim(),
        target_amount: formData.target_amount,
        current_amount: formData.current_amount,
        currency: formData.currency,
        category: formData.category,
        priority: formData.priority,
        deadline: formData.deadline,
        status: formData.status,
        notes: formData.notes || undefined,
        created_at: goal?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      onSave(goalData);
      success(`${mode === 'add' ? 'Financial goal created' : 'Financial goal updated'} successfully!`);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save financial goal');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { value: 'savings', label: 'Savings' },
    { value: 'emergency_fund', label: 'Emergency Fund' },
    { value: 'vacation', label: 'Vacation' },
    { value: 'house', label: 'House Down Payment' },
    { value: 'car', label: 'Car Purchase' },
    { value: 'education', label: 'Education' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'retirement', label: 'Retirement' },
    { value: 'investment', label: 'Investment' },
    { value: 'debt_payoff', label: 'Debt Payoff' },
    { value: 'business', label: 'Business' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'text-gray-500' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
    { value: 'high', label: 'High Priority', color: 'text-red-600' }
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' }
  ];

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' }
  ];

  const progressPercentage = formData.target_amount > 0 
    ? Math.min((formData.current_amount / formData.target_amount) * 100, 100) 
    : 0;

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
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="text-purple-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {mode === 'add' ? 'Set New Goal' : 'Edit Goal'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' ? 'Create a new financial goal' : 'Update goal details'}
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
              {/* Goal Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Emergency Fund, Vacation Fund"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your financial goal..."
                  rows={3}
                  required
                />
              </div>

              {/* Category and Priority */}
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
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Amount and Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Current Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.current_amount}
                  onChange={(e) => setFormData({ ...formData, current_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Progress Bar */}
              {formData.target_amount > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>${formData.current_amount.toLocaleString()}</span>
                    <span>${formData.target_amount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Deadline and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'add' ? <Plus size={16} /> : <Save size={16} />}
                      {mode === 'add' ? 'Set Goal' : 'Save Changes'}
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

export default GoalModal;
