import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Truck, MapPin, CheckCircle, Clock, Package } from 'lucide-react';

interface TrackingEvent {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  trackingNumber?: string;
}

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orderId,
  trackingNumber
}) => {
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchTrackingInfo();
    }
  }, [isOpen, orderId]);

  const fetchTrackingInfo = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock tracking events
    const mockEvents: TrackingEvent[] = [
      {
        id: '1',
        status: 'delivered',
        location: 'New York, NY',
        timestamp: new Date().toISOString(),
        description: 'Delivered to customer'
      },
      {
        id: '2',
        status: 'out_for_delivery',
        location: 'New York Distribution Center',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        description: 'Out for delivery'
      },
      {
        id: '3',
        status: 'in_transit',
        location: 'Chicago, IL',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'In transit to destination'
      },
      {
        id: '4',
        status: 'shipped',
        location: 'Warehouse',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        description: 'Package shipped'
      },
      {
        id: '5',
        status: 'processing',
        location: 'Warehouse',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        description: 'Order processing'
      }
    ];

    setTrackingEvents(mockEvents);
    setEstimatedDelivery(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString());
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'out_for_delivery':
        return <Truck className="text-blue-600" size={20} />;
      case 'in_transit':
        return <Package className="text-purple-600" size={20} />;
      case 'shipped':
        return <Truck className="text-blue-600" size={20} />;
      default:
        return <Clock className="text-yellow-600" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 border-green-500';
      case 'out_for_delivery':
        return 'bg-blue-100 border-blue-500';
      case 'in_transit':
        return 'bg-purple-100 border-purple-500';
      case 'shipped':
        return 'bg-blue-100 border-blue-500';
      default:
        return 'bg-yellow-100 border-yellow-500';
    }
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
            <Truck className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Track Package</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {trackingNumber && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tracking Number</p>
                <p className="font-mono font-semibold text-lg">{trackingNumber}</p>
              </div>
            )}

            {estimatedDelivery && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Delivery</p>
                <p className="font-semibold text-lg">
                  {new Date(estimatedDelivery).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-4">Tracking History</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                <div className="space-y-4">
                  {trackingEvents.map((event, index) => (
                    <div key={event.id} className="relative flex items-start gap-4">
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${getStatusColor(event.status)}`}>
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold capitalize">{event.status.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={12} />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderTrackingModal;

