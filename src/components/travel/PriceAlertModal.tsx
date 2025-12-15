import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plane, DollarSign, Calendar, Bell } from 'lucide-react';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert?: {
    id: number;
    route: string;
    currentPrice: number;
    targetPrice: number;
    status: string;
  } | null;
  onSave: (alertData: {
    route: string;
    origin: string;
    destination: string;
    targetPrice: number;
    travelDates?: string;
  }) => void;
}

const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  alert,
  onSave
}) => {
  const [origin, setOrigin] = useState(alert ? alert.route.split(' → ')[0] : '');
  const [destination, setDestination] = useState(alert ? alert.route.split(' → ')[1] : '');
  const [targetPrice, setTargetPrice] = useState(alert?.targetPrice.toString() || '');
  const [travelDates, setTravelDates] = useState('');
  const [notifyWhen, setNotifyWhen] = useState<'below' | 'above'>('below');

  useEffect(() => {
    if (alert) {
      const parts = alert.route.split(' → ');
      setOrigin(parts[0] || '');
      setDestination(parts[1] || '');
      setTargetPrice(alert.targetPrice.toString());
    }
  }, [alert]);

  const handleSave = () => {
    if (!origin.trim() || !destination.trim()) {
      alert('Please enter origin and destination');
      return;
    }
    if (!targetPrice || parseFloat(targetPrice) <= 0) {
      alert('Please enter a valid target price');
      return;
    }

    onSave({
      route: `${origin} → ${destination}`,
      origin: origin.trim(),
      destination: destination.trim(),
      targetPrice: parseFloat(targetPrice),
      travelDates: travelDates || undefined
    });
    
    // Reset form
    setOrigin('');
    setDestination('');
    setTargetPrice('');
    setTravelDates('');
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
          <div className="flex items-center gap-2">
            <Bell className="text-orange-600" size={24} />
            <h2 className="text-xl font-semibold">{alert ? 'Edit Price Alert' : 'Create Price Alert'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Plane className="inline w-4 h-4 mr-1" />
                From *
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Origin city"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Plane className="inline w-4 h-4 mr-1" />
                To *
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Destination city"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Target Price *
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Enter target price"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notify When Price
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setNotifyWhen('below')}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  notifyWhen === 'below'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Drops Below
              </button>
              <button
                onClick={() => setNotifyWhen('above')}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  notifyWhen === 'above'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Rises Above
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Travel Dates (Optional)
            </label>
            <input
              type="text"
              value={travelDates}
              onChange={(e) => setTravelDates(e.target.value)}
              placeholder="Select dates or leave blank for any dates"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              You'll receive notifications when the flight price {notifyWhen === 'below' ? 'drops below' : 'rises above'} ${targetPrice || '0'} for this route.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Bell size={16} />
              {alert ? 'Update Alert' : 'Create Alert'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PriceAlertModal;

