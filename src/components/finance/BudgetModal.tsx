import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Save, Plus, Bell, Calendar } from 'lucide-react';
import { Budget, BudgetCreate, BudgetUpdate } from '../../services/financeAPI';
import { useToastHelpers } from '../ui/Toast';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Budget) => void;
  budget?: Budget | null;
  mode: 'add' | 'edit';
}

const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  budget,
  mode
}) => {
  const { success, error } = useToastHelpers();
  const [formData, setFormData] = useState<BudgetCreate>({
    name: '',
    category: 'other',
    amount: 0,
    currency: 'USD',
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    budget_type: 'category',
    goal_amount: 0,
    goal_deadline: '',
    alerts: {
      warning_threshold: 80,
      critical_threshold: 95,
      email_alerts: true,
      push_alerts: true
    },
    notes: '',
    is_active: true
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (budget && mode === 'edit') {
      setFormData({
        name: budget.name,
        category: budget.category,
        amount: budget.amount,
        currency: budget.currency,
        period: budget.period,
        start_date: budget.start_date.split('T')[0],
        end_date: budget.end_date?.split('T')[0] || '',
        budget_type: budget.budget_type,
        goal_amount: budget.goal_amount || 0,
        goal_deadline: budget.goal_deadline?.split('T')[0] || '',
        alerts: budget.alerts,
        notes: budget.notes || '',
        is_active: budget.is_active
      });
    } else {
      setFormData({
        name: '',
        category: 'other',
        amount: 0,
        currency: 'USD',
        period: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        budget_type: 'category',
        goal_amount: 0,
        goal_deadline: '',
        alerts: {
          warning_threshold: 80,
          critical_threshold: 95,
          email_alerts: true,
          push_alerts: true
        },
        notes: '',
        is_active: true
      });
    }
  }, [budget, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Budget name is required');
      }
      if (formData.amount <= 0) {
        throw new Error('Budget amount must be greater than 0');
      }
      if (formData.budget_type === 'goal' && formData.goal_amount <= 0) {
        throw new Error('Goal amount must be greater than 0');
      }

      // Create budget object
      const budgetData: Budget = {
        id: budget?.id || Date.now().toString(),
        user_id: 'user_123',
        name: formData.name.trim(),
        category: formData.category,
        amount: formData.amount,
        currency: formData.currency,
        period: formData.period,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        budget_type: formData.budget_type,
        goal_amount: formData.goal_amount || undefined,
        goal_deadline: formData.goal_deadline || undefined,
        alerts: formData.alerts,
        notes: formData.notes || undefined,
        is_active: formData.is_active,
        spent: budget?.spent || 0,
        remaining: budget?.remaining || formData.amount,
        created_at: budget?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      onSave(budgetData);
      success(`${mode === 'add' ? 'Budget created' : 'Budget updated'} successfully!`);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save budget');
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
    { value: 'education', label: 'Education' },
    { value: 'travel', label: 'Travel' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'taxes', label: 'Taxes' },
    { value: 'debt_payment', label: 'Debt Payment' },
    { value: 'savings', label: 'Savings' },
    { value: 'other', label: 'Other' }
  ];

  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const budgetTypes = [
    { value: 'category', label: 'Category Budget' },
    { value: 'goal', label: 'Goal Budget' },
    { value: 'overall', label: 'Overall Budget' }
  ];

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="text-green-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {mode === 'add' ? 'Create Budget' : 'Edit Budget'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {mode === 'add' ? 'Set up a new budget' : 'Update budget details'}
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
              {/* Budget Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Food Budget, Vacation Fund"
                  required
                />
              </div>

              {/* Budget Type and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Type *
                  </label>
                  <select
                    value={formData.budget_type}
                    onChange={(e) => setFormData({ ...formData, budget_type: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {budgetTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
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
              </div>

              {/* Amount and Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Amount *
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

              {/* Period and Start Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period *
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {periods.map((period) => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Goal Amount and Deadline (for goal budgets) */}
              {formData.budget_type === 'goal' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Goal Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.goal_amount}
                      onChange={(e) => setFormData({ ...formData, goal_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Goal Deadline *
                    </label>
                    <input
                      type="date"
                      value={formData.goal_deadline}
                      onChange={(e) => setFormData({ ...formData, goal_deadline: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Alert Thresholds */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Bell size={16} />
                  Alert Settings
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warning Threshold (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.alerts.warning_threshold}
                      onChange={(e) => setFormData({
                        ...formData,
                        alerts: {
                          ...formData.alerts,
                          warning_threshold: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Critical Threshold (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.alerts.critical_threshold}
                      onChange={(e) => setFormData({
                        ...formData,
                        alerts: {
                          ...formData.alerts,
                          critical_threshold: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="emailAlerts"
                      checked={formData.alerts.email_alerts}
                      onChange={(e) => setFormData({
                        ...formData,
                        alerts: {
                          ...formData.alerts,
                          email_alerts: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="emailAlerts" className="text-sm font-medium text-gray-700">
                      Email alerts
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="pushAlerts"
                      checked={formData.alerts.push_alerts}
                      onChange={(e) => setFormData({
                        ...formData,
                        alerts: {
                          ...formData.alerts,
                          push_alerts: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="pushAlerts" className="text-sm font-medium text-gray-700">
                      Push notifications
                    </label>
                  </div>
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

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Budget is active
                </label>
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
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'add' ? <Plus size={16} /> : <Save size={16} />}
                      {mode === 'add' ? 'Create Budget' : 'Save Changes'}
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

export default BudgetModal;
