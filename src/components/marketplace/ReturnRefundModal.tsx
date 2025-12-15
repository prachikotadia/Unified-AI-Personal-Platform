import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, RotateCcw, Package, AlertCircle } from 'lucide-react';

interface OrderItem {
  id: string;
  product: {
    id: number;
    name: string;
    image: string;
  };
  quantity: number;
  price: number;
}

interface ReturnRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  items: OrderItem[];
  onReturn: (returnData: { items: string[]; reason: string; type: 'return' | 'refund' }) => Promise<void>;
}

const ReturnRefundModal: React.FC<ReturnRefundModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  items,
  onReturn
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [returnType, setReturnType] = useState<'return' | 'refund'>('return');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const returnReasons = [
    'Defective/Damaged',
    'Wrong item received',
    'Item not as described',
    'Changed my mind',
    'Size/Color not suitable',
    'Other'
  ];

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one item to return');
      return;
    }
    if (!reason) {
      alert('Please select a reason');
      return;
    }

    setLoading(true);
    await onReturn({
      items: Array.from(selectedItems),
      reason,
      type: returnType
    });
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <RotateCcw className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Return/Refund Request</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Order #{orderNumber}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Request Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer flex-1 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="returnType"
                    value="return"
                    checked={returnType === 'return'}
                    onChange={(e) => setReturnType(e.target.value as 'return' | 'refund')}
                    className="text-blue-600"
                  />
                  <div>
                    <p className="font-medium">Return Item</p>
                    <p className="text-xs text-gray-500">Return item for replacement or store credit</p>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer flex-1 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="returnType"
                    value="refund"
                    checked={returnType === 'refund'}
                    onChange={(e) => setReturnType(e.target.value as 'return' | 'refund')}
                    className="text-blue-600"
                  />
                  <div>
                    <p className="font-medium">Refund</p>
                    <p className="text-xs text-gray-500">Get full refund to original payment method</p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Items to Return
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item) => {
                  const isSelected = selectedItems.has(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItem(item.id)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Return *
              </label>
              <div className="space-y-2">
                {returnReasons.map((r) => (
                  <label key={r} className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={(e) => setReason(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-blue-600 mt-0.5" size={16} />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Return Policy</p>
                  <p>Items must be returned within 30 days of delivery. Items must be in original condition with tags attached.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedItems.size === 0 || !reason}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <RotateCcw size={16} />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReturnRefundModal;

