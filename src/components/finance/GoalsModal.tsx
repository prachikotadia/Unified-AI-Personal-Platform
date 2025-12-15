import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit, Trash2, Target, Save, DollarSign, Calendar } from 'lucide-react';
import { useFinanceStore } from '../../store/finance';
import { FinancialGoal } from '../../services/financeAPI';
import { generateLocalId } from '../../utils/financeHelpers';
import { useToastHelpers } from '../ui/Toast';

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoalsModal: React.FC<GoalsModalProps> = ({ isOpen, onClose }) => {
  const { financialGoals, createFinancialGoal, updateFinancialGoal, deleteFinancialGoal } = useFinanceStore();
  const { success, error } = useToastHelpers();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<FinancialGoal>>({
    name: '',
    target_amount: 0,
    current_amount: 0,
    category: 'emergency',
    deadline: '',
    status: 'active',
  });

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.target_amount) {
        error('Name and target amount are required');
        return;
      }

      const now = new Date().toISOString();
      const goalData: FinancialGoal = {
        id: editingId || generateLocalId(),
        user_id: 'user_123',
        name: formData.name!,
        target_amount: formData.target_amount!,
        current_amount: formData.current_amount || 0,
        category: formData.category || 'emergency',
        deadline: formData.deadline || undefined,
        status: formData.status || 'active',
        notes: formData.notes,
        created_at: editingId ? financialGoals.find(g => g.id === editingId)?.created_at || now : now,
        updated_at: now,
      };

      if (editingId) {
        await updateFinancialGoal(editingId, goalData);
        success('Goal updated successfully!');
      } else {
        await createFinancialGoal(goalData);
        success('Goal created successfully!');
      }

      setFormData({ name: '', target_amount: 0, current_amount: 0, category: 'emergency', deadline: '', status: 'active' });
      setEditingId(null);
      setShowAddForm(false);
    } catch (err: any) {
      error(err.message || 'Failed to save goal');
    }
  };

  const handleEdit = (goal: FinancialGoal) => {
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount || 0,
      category: goal.category,
      deadline: goal.deadline,
      status: goal.status,
      notes: goal.notes,
    });
    setEditingId(goal.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteFinancialGoal(id);
        success('Goal deleted successfully!');
      } catch (err: any) {
        error(err.message || 'Failed to delete goal');
      }
    }
  };

  const progress = (goal: FinancialGoal) => {
    return goal.target_amount > 0 ? ((goal.current_amount || 0) / goal.target_amount) * 100 : 0;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Financial Goals</h2>
                <p className="text-sm text-gray-600">Manage your financial goals</p>
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
                  {editingId ? 'Edit Goal' : 'Add New Goal'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Emergency Fund"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category || 'emergency'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="emergency">Emergency Fund</option>
                      <option value="vacation">Vacation</option>
                      <option value="house">House</option>
                      <option value="car">Car</option>
                      <option value="investment">Investment</option>
                      <option value="wedding">Wedding</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount *</label>
                    <input
                      type="number"
                      value={formData.target_amount || 0}
                      onChange={(e) => setFormData({ ...formData, target_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount</label>
                    <input
                      type="number"
                      value={formData.current_amount || 0}
                      onChange={(e) => setFormData({ ...formData, current_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                    <input
                      type="date"
                      value={formData.deadline || ''}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status || 'active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    {editingId ? 'Update Goal' : 'Create Goal'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                      setFormData({ name: '', target_amount: 0, current_amount: 0, category: 'emergency', deadline: '', status: 'active' });
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
                className="mb-4 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add New Goal
              </button>
            )}

            {/* Goals List */}
            <div className="space-y-4">
              {financialGoals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Target size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No goals yet. Create your first financial goal!</p>
                </div>
              ) : (
                financialGoals.map((goal) => (
                  <div key={goal.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{goal.category.replace('_', ' ')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(goal)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
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
                        <span className="font-semibold">{progress(goal).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(progress(goal), 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Current:</span>
                        <span className="ml-2 font-semibold">${(goal.current_amount || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Target:</span>
                        <span className="ml-2 font-semibold">${goal.target_amount.toLocaleString()}</span>
                      </div>
                      {goal.deadline && (
                        <div className="col-span-2 flex items-center gap-1 text-gray-600">
                          <Calendar size={14} />
                          <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {financialGoals.length} goal{financialGoals.length !== 1 ? 's' : ''} total
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

export default GoalsModal;

