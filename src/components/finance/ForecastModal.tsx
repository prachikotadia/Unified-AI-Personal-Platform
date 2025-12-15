import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit, Trash2, TrendingUp, Save, Calendar } from 'lucide-react';
import { useFinanceStore } from '../../store/finance';
import { ForecastCreate } from '../../services/financeAPI';
import { useToastHelpers } from '../ui/Toast';

interface ForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForecastModal: React.FC<ForecastModalProps> = ({ isOpen, onClose }) => {
  const { forecasts, createForecast, updateForecast, deleteForecast } = useFinanceStore();
  const { success, error } = useToastHelpers();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<ForecastCreate>>({
    title: '',
    predicted_value: 0,
    forecast_type: 'income',
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    confidence_level: 'medium',
  });

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.predicted_value) {
        error('Title and predicted value are required');
        return;
      }

      if (editingId) {
        await updateForecast(editingId, formData);
        success('Forecast updated successfully!');
      } else {
        await createForecast(formData as ForecastCreate);
        success('Forecast created successfully!');
      }

      setFormData({
        title: '',
        predicted_value: 0,
        forecast_type: 'income',
        period: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        confidence_level: 'medium',
      });
      setEditingId(null);
      setShowAddForm(false);
    } catch (err: any) {
      error(err.message || 'Failed to save forecast');
    }
  };

  const handleEdit = (forecast: any) => {
    setFormData({
      title: forecast.title,
      predicted_value: forecast.predicted_value,
      forecast_type: forecast.forecast_type,
      period: forecast.period,
      start_date: forecast.start_date.split('T')[0],
      end_date: forecast.end_date?.split('T')[0],
      confidence_level: forecast.confidence_level,
      notes: forecast.notes,
    });
    setEditingId(forecast.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this forecast?')) {
      try {
        await deleteForecast(id);
        success('Forecast deleted successfully!');
      } catch (err: any) {
        error(err.message || 'Failed to delete forecast');
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
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Financial Forecasts</h2>
                <p className="text-sm text-gray-600">Create and manage financial forecasts</p>
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
                  {editingId ? 'Edit Forecast' : 'Create New Forecast'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Monthly Income Forecast"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Type</label>
                    <select
                      value={formData.forecast_type || 'income'}
                      onChange={(e) => setFormData({ ...formData, forecast_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                      <option value="savings">Savings</option>
                      <option value="investment">Investment</option>
                      <option value="debt">Debt</option>
                      <option value="net_worth">Net Worth</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Predicted Value *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.predicted_value || 0}
                      onChange={(e) => setFormData({ ...formData, predicted_value: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                    <select
                      value={formData.period || 'monthly'}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date || ''}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confidence Level</label>
                    <select
                      value={formData.confidence_level || 'medium'}
                      onChange={(e) => setFormData({ ...formData, confidence_level: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    {editingId ? 'Update Forecast' : 'Create Forecast'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                      setFormData({
                        title: '',
                        predicted_value: 0,
                        forecast_type: 'income',
                        period: 'monthly',
                        start_date: new Date().toISOString().split('T')[0],
                        confidence_level: 'medium',
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
                className="mb-4 w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Create New Forecast
              </button>
            )}

            {/* Forecasts List */}
            <div className="space-y-4">
              {forecasts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No forecasts yet. Create your first forecast!</p>
                </div>
              ) : (
                forecasts.map((forecast) => (
                  <div key={forecast.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{forecast.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {forecast.forecast_type.replace('_', ' ')} • {forecast.period}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(forecast)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(forecast.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Predicted Value:</span>
                        <p className="font-semibold text-lg">${forecast.predicted_value.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Confidence:</span>
                        <p className="font-semibold capitalize">{forecast.confidence_level || 'medium'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Start Date:</span>
                        <p className="font-semibold">{new Date(forecast.start_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {forecasts.length} forecast{forecasts.length !== 1 ? 's' : ''} total
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

export default ForecastModal;

