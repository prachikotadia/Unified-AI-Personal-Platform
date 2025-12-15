import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Truck, MapPin, Calculator } from 'lucide-react';

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  description: string;
}

interface ShippingCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  onSelectShipping?: (option: ShippingOption) => void;
}

const ShippingCalculatorModal: React.FC<ShippingCalculatorModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  onSelectShipping
}) => {
  const [zipCode, setZipCode] = useState('');
  const [selectedOption, setSelectedOption] = useState<ShippingOption | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock shipping options
  const shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      price: subtotal > 35 ? 0 : 5.99,
      estimatedDays: '5-7 business days',
      description: 'Free on orders over $35'
    },
    {
      id: 'express',
      name: 'Express Shipping',
      price: 12.99,
      estimatedDays: '2-3 business days',
      description: 'Fast delivery'
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      price: 24.99,
      estimatedDays: 'Next business day',
      description: 'Fastest delivery option'
    }
  ];

  const handleCalculate = async () => {
    if (!zipCode.trim()) return;

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
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
            <Calculator className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Estimate Shipping</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="inline mr-1" size={16} />
              Zip Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter zip code"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleCalculate}
                disabled={loading || !zipCode.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Calculating...' : 'Calculate'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Options:</p>
            {shippingOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setSelectedOption(option)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedOption?.id === option.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Truck className="text-blue-600 mt-1" size={20} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{option.name}</h3>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {option.price === 0 ? 'Free' : `$${option.price.toFixed(2)}`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {option.estimatedDays}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedOption && onSelectShipping) {
                  onSelectShipping(selectedOption);
                }
                onClose();
              }}
              disabled={!selectedOption}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Shipping
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ShippingCalculatorModal;

