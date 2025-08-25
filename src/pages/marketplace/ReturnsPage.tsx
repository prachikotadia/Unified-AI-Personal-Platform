import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, ArrowLeft, RefreshCw, Truck, CheckCircle, 
  Clock, AlertCircle, FileText, DollarSign, Calendar,
  MapPin, Phone, Mail, User, Building, Loader2,
  ChevronDown, ChevronUp, Download, Printer, Share2
} from 'lucide-react';
import { marketplaceAPI } from '../../services/api';
import { useTheme } from '../../store/theme';

interface Return {
  id: number;
  order_id: number;
  user_id: string;
  return_number: string;
  status: 'requested' | 'approved' | 'rejected' | 'in_transit' | 'received' | 'refunded';
  reason: string;
  description?: string;
  return_method: 'shipping' | 'drop_off';
  tracking_number?: string;
  refund_amount?: number;
  refund_method?: string;
  created_at: string;
  updated_at: string;
  order?: Order;
}

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

interface Product {
  id: number;
  name: string;
  images: string[];
  price: number;
}

const ReturnsPage: React.FC = () => {
  const { theme } = useTheme();
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [showCreateReturn, setShowCreateReturn] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Load returns data
  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = useCallback(async () => {
    try {
      setLoading(true);
      const returnsData = await marketplaceAPI.getReturns('user_123');
      setReturns(returnsData || []);
    } catch (error) {
      console.error('Error loading returns:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredReturns = returns.filter(ret => 
    filterStatus === 'all' || ret.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'approved': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'in_transit': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'received': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'refunded': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested': return <Clock size={16} />;
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <AlertCircle size={16} />;
      case 'in_transit': return <Truck size={16} />;
      case 'received': return <Package size={16} />;
      case 'refunded': return <DollarSign size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-gray-600 dark:text-gray-300">Loading returns...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Returns & Refunds
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your return requests and refund status
              </p>
            </div>
            <button
              onClick={() => setShowCreateReturn(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Package size={16} />
              Create Return
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All Returns ({returns.length})
            </button>
            {['requested', 'approved', 'in_transit', 'received', 'refunded', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({returns.filter(r => r.status === status).length})
              </button>
            ))}
          </div>
        </div>

        {/* Returns List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReturns.map((returnItem) => (
            <motion.div
              key={returnItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-lg cursor-pointer transition-all duration-200 ${
                theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              } hover:shadow-lg`}
              onClick={() => setSelectedReturn(returnItem)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Return #{returnItem.return_number}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Order #{returnItem.order_id}
                  </p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                  {getStatusIcon(returnItem.status)}
                  {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Created: {formatDate(returnItem.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package size={14} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Method: {returnItem.return_method === 'shipping' ? 'Shipping' : 'Drop-off'}
                  </span>
                </div>
                {returnItem.refund_amount && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={14} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Refund: ${returnItem.refund_amount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  <strong>Reason:</strong> {returnItem.reason}
                </p>
                {returnItem.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                    {returnItem.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredReturns.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No returns found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filterStatus === 'all' 
                ? "You haven't created any returns yet."
                : `No returns with status "${filterStatus}" found.`
              }
            </p>
          </div>
        )}

        {/* Return Details Modal */}
        <AnimatePresence>
          {selectedReturn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedReturn(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Return Details
                    </h2>
                    <button
                      onClick={() => setSelectedReturn(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <ArrowLeft size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Return Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Return Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Return Number:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {selectedReturn.return_number}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Order Number:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            #{selectedReturn.order_id}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Status:</span>
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReturn.status)}`}>
                            {getStatusIcon(selectedReturn.status)}
                            {selectedReturn.status.charAt(0).toUpperCase() + selectedReturn.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Return Method:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {selectedReturn.return_method === 'shipping' ? 'Shipping' : 'Drop-off'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Created:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatDate(selectedReturn.created_at)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatDate(selectedReturn.updated_at)}
                          </span>
                        </div>
                        {selectedReturn.tracking_number && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Tracking Number:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {selectedReturn.tracking_number}
                            </span>
                          </div>
                        )}
                        {selectedReturn.refund_amount && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Refund Amount:</span>
                            <span className="font-medium text-green-600">
                              ${selectedReturn.refund_amount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {selectedReturn.refund_method && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Refund Method:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {selectedReturn.refund_method}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Reason for Return</h4>
                        <p className="text-gray-600 dark:text-gray-400">{selectedReturn.reason}</p>
                        {selectedReturn.description && (
                          <div className="mt-2">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Additional Details</h4>
                            <p className="text-gray-600 dark:text-gray-400">{selectedReturn.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Order Items
                      </h3>
                      <div className="space-y-3">
                        {selectedReturn.order?.items?.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <img
                              src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                              alt={item.product_name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {item.product_name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                SKU: {item.product_sku}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900 dark:text-white">
                                ${item.total_price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedReturn.order && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900 dark:text-white">Order Total:</span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              ${selectedReturn.order.total_amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t">
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Download size={16} />
                        Download Label
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Printer size={16} />
                        Print Details
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Share2 size={16} />
                        Share
                      </button>
                    </div>
                    <button
                      onClick={() => setSelectedReturn(null)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Return Modal */}
        <AnimatePresence>
          {showCreateReturn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowCreateReturn(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`w-full max-w-2xl rounded-lg ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Create New Return
                    </h2>
                    <button
                      onClick={() => setShowCreateReturn(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <ArrowLeft size={24} />
                    </button>
                  </div>

                  <div className="text-center py-8">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Return Creation
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      To create a return, please go to your order details and select the items you want to return.
                    </p>
                    <button
                      onClick={() => window.location.href = '/marketplace/orders'}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      View Orders
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReturnsPage;
