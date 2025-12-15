import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit, Trash2, TrendingUp, Save, DollarSign } from 'lucide-react';
import { useFinanceStore } from '../../store/finance';
import { Investment, InvestmentCreate } from '../../services/financeAPI';
import { generateLocalId } from '../../utils/financeHelpers';
import { useToastHelpers } from '../ui/Toast';

interface InvestmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvestmentsModal: React.FC<InvestmentsModalProps> = ({ isOpen, onClose }) => {
  const { investments = [], createInvestment, updateInvestment, deleteInvestment } = useFinanceStore();
  const { success, error } = useToastHelpers();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<InvestmentCreate>>({
    name: '',
    symbol: '',
    investment_type: 'stocks',
    purchase_price: 0,
    current_value: 0,
    quantity: 0,
    purchase_date: new Date().toISOString().split('T')[0],
    risk_level: 'medium',
    status: 'active',
  });

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.purchase_price || !formData.quantity) {
        error('Name, purchase price, and quantity are required');
        return;
      }

      const now = new Date().toISOString();
      const investmentData: Investment = {
        id: editingId || generateLocalId(),
        user_id: 'user_123',
        name: formData.name!,
        symbol: formData.symbol || '',
        investment_type: formData.investment_type || 'stocks',
        purchase_price: formData.purchase_price!,
        current_value: formData.current_value || formData.purchase_price!,
        quantity: formData.quantity!,
        purchase_date: formData.purchase_date || now,
        sell_date: formData.sell_date,
        risk_level: formData.risk_level || 'medium',
        status: formData.status || 'active',
        notes: formData.notes,
        created_at: editingId ? investments.find(i => i.id === editingId)?.created_at || now : now,
        updated_at: now,
      };

      if (editingId) {
        await updateInvestment(editingId, investmentData);
        success('Investment updated successfully!');
      } else {
        await createInvestment(investmentData);
        success('Investment created successfully!');
      }

      setFormData({
        name: '',
        symbol: '',
        investment_type: 'stocks',
        purchase_price: 0,
        current_value: 0,
        quantity: 0,
        purchase_date: new Date().toISOString().split('T')[0],
        risk_level: 'medium',
        status: 'active',
      });
      setEditingId(null);
      setShowAddForm(false);
    } catch (err: any) {
      error(err.message || 'Failed to save investment');
    }
  };

  const handleEdit = (investment: Investment) => {
    setFormData({
      name: investment.name || '',
      symbol: investment.symbol || '',
      investment_type: investment.investment_type || 'stocks',
      purchase_price: investment.purchase_price || 0,
      current_value: investment.current_value || investment.purchase_price || 0,
      quantity: investment.quantity || 0,
      purchase_date: investment.purchase_date ? (investment.purchase_date.includes('T') ? investment.purchase_date.split('T')[0] : investment.purchase_date) : new Date().toISOString().split('T')[0],
      sell_date: investment.sell_date ? (investment.sell_date.includes('T') ? investment.sell_date.split('T')[0] : investment.sell_date) : undefined,
      risk_level: investment.risk_level || 'medium',
      status: investment.status || 'active',
      notes: investment.notes,
    });
    setEditingId(investment.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      try {
        await deleteInvestment(id);
        success('Investment deleted successfully!');
      } catch (err: any) {
        error(err.message || 'Failed to delete investment');
      }
    }
  };

  const calculateReturn = (investment: Investment) => {
    const purchasePrice = investment.purchase_price || 0;
    const currentValue = investment.current_value || 0;
    const quantity = investment.quantity || 0;
    const totalCost = purchasePrice * quantity;
    const totalValue = currentValue * quantity;
    return totalValue - totalCost;
  };

  const calculateReturnPercent = (investment: Investment) => {
    const purchasePrice = investment.purchase_price || 0;
    const quantity = investment.quantity || 0;
    const totalCost = purchasePrice * quantity;
    if (totalCost === 0) return 0;
    return ((calculateReturn(investment) / totalCost) * 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Investments</h2>
                <p className="text-sm text-gray-600">Manage your investment portfolio</p>
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
                  {editingId ? 'Edit Investment' : 'Add New Investment'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Apple Inc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                    <input
                      type="text"
                      value={formData.symbol || ''}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., AAPL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.investment_type || 'stocks'}
                      onChange={(e) => setFormData({ ...formData, investment_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="stocks">Stocks</option>
                      <option value="bonds">Bonds</option>
                      <option value="etfs">ETFs</option>
                      <option value="mutual_funds">Mutual Funds</option>
                      <option value="real_estate">Real Estate</option>
                      <option value="crypto">Crypto</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.purchase_price || 0}
                      onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.current_value || 0}
                      onChange={(e) => setFormData({ ...formData, current_value: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      value={formData.quantity || 0}
                      onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                    <input
                      type="date"
                      value={formData.purchase_date || ''}
                      onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                    <select
                      value={formData.risk_level || 'medium'}
                      onChange={(e) => setFormData({ ...formData, risk_level: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    {editingId ? 'Update Investment' : 'Create Investment'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                      setFormData({
                        name: '',
                        symbol: '',
                        investment_type: 'stocks',
                        purchase_price: 0,
                        current_value: 0,
                        quantity: 0,
                        purchase_date: new Date().toISOString().split('T')[0],
                        risk_level: 'medium',
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
                className="mb-4 w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add New Investment
              </button>
            )}

            {/* Investments List */}
            <div className="space-y-4">
              {investments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No investments yet. Add your first investment!</p>
                </div>
              ) : (
                investments.map((investment) => {
                  const returnAmount = calculateReturn(investment);
                  const returnPercent = calculateReturnPercent(investment);
                  return (
                    <div key={investment.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{investment.name}</h3>
                          <p className="text-sm text-gray-600">
                            {investment.symbol && `${investment.symbol} • `}
                            {(investment.investment_type || 'stocks').replace('_', ' ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(investment)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(investment.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Purchase Price:</span>
                          <p className="font-semibold">${(investment.purchase_price || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Current Value:</span>
                          <p className="font-semibold">${(investment.current_value || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Quantity:</span>
                          <p className="font-semibold">{investment.quantity || 0}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Return:</span>
                          <p className={`font-semibold ${returnAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {returnAmount >= 0 ? '+' : ''}${returnAmount.toLocaleString()} ({returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(2)}%)
                          </p>
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
              {investments.length} investment{investments.length !== 1 ? 's' : ''} total
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
      )}
    </AnimatePresence>
  );
};

export default InvestmentsModal;

