import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Navigation, MapPin, Clock, Car, Walk, Bike } from 'lucide-react';

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  from: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  to: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
}

const DirectionsModal: React.FC<DirectionsModalProps> = ({
  isOpen,
  onClose,
  from,
  to
}) => {
  const [transportMode, setTransportMode] = useState<'driving' | 'walking' | 'transit' | 'bicycling'>('driving');

  const handleGetDirections = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=${transportMode}`;
    window.open(mapsUrl, '_blank');
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
            <Navigation className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Get Directions</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* From */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin size={16} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">From</div>
                <div className="font-medium">{from.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{from.address}</div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
          </div>

          {/* To */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin size={16} />
              </div>
              <div className="flex-1">
                <div className="text-xs text-green-600 dark:text-green-400 mb-1">To</div>
                <div className="font-medium">{to.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{to.address}</div>
              </div>
            </div>
          </div>

          {/* Transport Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transport Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTransportMode('driving')}
                className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  transportMode === 'driving'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <Car size={18} />
                <span className="text-sm">Driving</span>
              </button>
              <button
                onClick={() => setTransportMode('walking')}
                className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  transportMode === 'walking'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <Walk size={18} />
                <span className="text-sm">Walking</span>
              </button>
              <button
                onClick={() => setTransportMode('transit')}
                className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  transportMode === 'transit'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <Navigation size={18} />
                <span className="text-sm">Transit</span>
              </button>
              <button
                onClick={() => setTransportMode('bicycling')}
                className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  transportMode === 'bicycling'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <Bike size={18} />
                <span className="text-sm">Bicycling</span>
              </button>
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
              onClick={handleGetDirections}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Navigation size={16} />
              Get Directions
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DirectionsModal;

