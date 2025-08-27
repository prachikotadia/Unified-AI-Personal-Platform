import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bell, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  TrendingDown,
  Target,
  Zap
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand: string;
}

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAlertCreated: (alert: any) => void;
}

const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  product,
  onAlertCreated
}) => {
  const [targetPrice, setTargetPrice] = useState<number>(product.price * 0.9);
  const [alertType, setAlertType] = useState<'drop' | 'increase'>('drop');
  const [notificationType, setNotificationType] = useState<'email' | 'push' | 'both'>('both');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const alert = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        currentPrice: product.price,
        targetPrice,
        alertType,
        notificationType,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      onAlertCreated(alert);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setTargetPrice(product.price * 0.9);
        setAlertType('drop');
        setNotificationType('both');
      }, 2000);
    } catch (error) {
      console.error('Error creating price alert:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSavings = () => {
    const savings = product.price - targetPrice;
    const percentage = (savings / product.price) * 100;
    return { savings, percentage };
  };

  const { savings, percentage } = getSavings();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Set Price Alert</h2>
                  <p className="text-sm text-gray-600">Get notified when the price changes</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Info */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.brand}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-lg font-bold text-gray-900">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {success ? (
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Alert Created!</h3>
                <p className="text-gray-600">You'll be notified when the price reaches ${targetPrice}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Alert Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Alert Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAlertType('drop')}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                        alertType === 'drop'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-sm font-medium">Price Drop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlertType('increase')}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                        alertType === 'increase'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Target className="w-4 h-4" />
                      <span className="text-sm font-medium">Price Increase</span>
                    </button>
                  </div>
                </div>

                {/* Target Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Price
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter target price"
                    />
                  </div>
                  {alertType === 'drop' && savings > 0 && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                      <TrendingDown className="w-4 h-4" />
                      <span>You'll save ${savings.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                    </div>
                  )}
                </div>

                {/* Notification Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Notification Method
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'email', label: 'Email', icon: '📧' },
                      { value: 'push', label: 'Push Notification', icon: '🔔' },
                      { value: 'both', label: 'Both', icon: '📧🔔' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="notificationType"
                          value={option.value}
                          checked={notificationType === option.value}
                          onChange={(e) => setNotificationType(e.target.value as any)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">How it works:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• We'll monitor the price 24/7</li>
                        <li>• You'll get notified when the price reaches ${targetPrice}</li>
                        <li>• Alerts are active for 30 days</li>
                        <li>• You can manage alerts in your account settings</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || targetPrice <= 0}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        <span>Create Alert</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PriceAlertModal;
