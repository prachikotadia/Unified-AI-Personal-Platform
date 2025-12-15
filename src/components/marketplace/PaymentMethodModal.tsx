import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, Wallet, DollarSign, Lock, Shield, CheckCircle2 } from 'lucide-react';
import CreditCardPreview from './CreditCardPreview';

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'cod';
  cardNumber?: string;
  cardholderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (method: Omit<PaymentMethod, 'id'>) => void;
  editingMethod?: PaymentMethod | null;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMethod
}) => {
  const [formData, setFormData] = useState({
    type: 'card' as 'card' | 'wallet' | 'cod',
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    last4: '',
    brand: 'Visa',
    isDefault: false
  });
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (editingMethod) {
      setFormData({
        type: editingMethod.type,
        cardNumber: editingMethod.cardNumber || '',
        cardholderName: editingMethod.cardholderName || '',
        expiryMonth: editingMethod.expiryMonth || '',
        expiryYear: editingMethod.expiryYear || '',
        cvv: '',
        last4: editingMethod.last4 || '',
        brand: editingMethod.brand || 'Visa',
        isDefault: editingMethod.isDefault
      });
    } else {
      setFormData({
        type: 'card',
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        last4: '',
        brand: 'Visa',
        isDefault: false
      });
    }
  }, [editingMethod, isOpen]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    }
    return v;
  };

  const detectCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'Mastercard';
    if (cleaned.startsWith('3')) return 'Amex';
    if (cleaned.startsWith('6')) return 'Discover';
    return 'Visa';
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    const last4 = formatted.replace(/\s/g, '').slice(-4);
    const brand = detectCardBrand(formatted);
    setFormData({
      ...formData,
      cardNumber: formatted,
      last4: last4.length === 4 ? last4 : '',
      brand: brand
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type === 'card' && (!formData.cardNumber || !formData.cardholderName || !formData.expiryMonth || !formData.expiryYear)) {
      alert('Please fill in all card details');
      return;
    }
    onSave(formData);
    onClose();
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
          <h2 className="text-xl font-semibold">
            {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="card">Credit/Debit Card</option>
              <option value="wallet">Digital Wallet</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          {formData.type === 'card' && (
            <>
              {/* Credit Card Preview */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6">
                <CreditCardPreview
                  cardNumber={formData.cardNumber}
                  cardholderName={formData.cardholderName}
                  expiryMonth={formData.expiryMonth}
                  expiryYear={formData.expiryYear}
                  cvv={formData.cvv}
                  brand={formData.brand}
                  showCvv={focusedField === 'cvv'}
                  isFlipped={isCardFlipped}
                  onFlip={() => setIsCardFlipped(!isCardFlipped)}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Card Number *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      onFocus={() => {
                        setFocusedField('cardNumber');
                        setIsCardFlipped(false);
                      }}
                      maxLength={19}
                      placeholder="1234 5678 9012 3456"
                      required
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cardholder Name *
                  </label>
                  <input
                    type="text"
                    value={formData.cardholderName}
                    onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value.toUpperCase() })}
                    onFocus={() => {
                      setFocusedField('cardholderName');
                      setIsCardFlipped(false);
                    }}
                    placeholder="JOHN DOE"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all uppercase"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Month *
                    </label>
                    <select
                      value={formData.expiryMonth}
                      onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                      onFocus={() => {
                        setFocusedField('expiry');
                        setIsCardFlipped(false);
                      }}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month.toString().padStart(2, '0')}>
                          {month.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Year *
                    </label>
                    <select
                      value={formData.expiryYear}
                      onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                      onFocus={() => {
                        setFocusedField('expiry');
                        setIsCardFlipped(false);
                      }}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                    >
                      <option value="">YYYY</option>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      CVV *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setFormData({ ...formData, cvv: value });
                        }}
                        onFocus={() => {
                          setFocusedField('cvv');
                          setIsCardFlipped(true);
                        }}
                        onBlur={() => setFocusedField(null)}
                        placeholder="123"
                        maxLength={4}
                        required
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Your payment information is encrypted and secure</span>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Set as default payment method</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingMethod ? 'Update' : 'Add'} Payment Method</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PaymentMethodModal;

