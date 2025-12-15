import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Tag, CheckCircle, AlertCircle } from 'lucide-react';

interface Coupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minPurchase?: number;
  validUntil?: string;
}

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (coupon: Coupon) => void;
  appliedCoupon?: Coupon | null;
  onRemove?: () => void;
}

const CouponModal: React.FC<CouponModalProps> = ({
  isOpen,
  onClose,
  onApply,
  appliedCoupon,
  onRemove
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock available coupons
  const availableCoupons: Coupon[] = [
    { code: 'SAVE10', discount: 10, type: 'percentage', minPurchase: 50 },
    { code: 'SAVE20', discount: 20, type: 'percentage', minPurchase: 100 },
    { code: 'FREESHIP', discount: 5.99, type: 'fixed' },
    { code: 'WELCOME15', discount: 15, type: 'percentage' }
  ];

  const handleApply = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const coupon = availableCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase().trim());
    
    if (coupon) {
      onApply(coupon);
      setCouponCode('');
      setLoading(false);
      onClose();
    } else {
      setError('Invalid coupon code');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Tag className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Apply Coupon</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {appliedCoupon ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      {appliedCoupon.code}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {appliedCoupon.type === 'percentage'
                        ? `${appliedCoupon.discount}% off`
                        : `$${appliedCoupon.discount} off`}
                    </p>
                  </div>
                </div>
                {onRemove && (
                  <button
                    onClick={() => {
                      onRemove();
                      onClose();
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter Coupon Code
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleApply();
                  }
                }}
                placeholder="Enter coupon code"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {error && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Available Coupons:
              </p>
              <div className="space-y-2">
                {availableCoupons.map((coupon) => (
                  <button
                    key={coupon.code}
                    onClick={() => {
                      setCouponCode(coupon.code);
                      handleApply();
                    }}
                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{coupon.code}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {coupon.type === 'percentage'
                            ? `${coupon.discount}% off`
                            : `$${coupon.discount} off`}
                          {coupon.minPurchase && ` • Min. purchase $${coupon.minPurchase}`}
                        </p>
                      </div>
                      <Tag size={16} className="text-blue-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={loading || !couponCode.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Applying...' : 'Apply Coupon'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CouponModal;

