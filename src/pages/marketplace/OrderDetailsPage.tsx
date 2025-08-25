import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  Truck, 
  Eye,
  ArrowLeft,
  Star,
  Download,
  Printer,
  MessageCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { marketplaceAPI, Order } from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatCurrency, formatDateTime } from '../../lib/utils';

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await marketplaceAPI.getOrderById(Number(orderId));
      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order details:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load order details'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-500';
      case 'shipped':
        return 'text-blue-500';
      case 'processing':
        return 'text-purple-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Your order has been delivered successfully';
      case 'shipped':
        return 'Your order is on its way to you';
      case 'processing':
        return 'Your order is being prepared for shipment';
      case 'cancelled':
        return 'Your order has been cancelled';
      default:
        return 'Your order is being processed';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={`${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Order not found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link 
              to="/marketplace/orders" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/marketplace/orders" 
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Order Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Order #{order.order_number}
              </p>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(order.status)}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Order Status
                </h2>
                <p className={`text-lg font-medium capitalize ${getStatusColor(order.status)}`}>
                  {order.status}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Placed on {formatDateTime(order.created_at)}
              </p>
              {order.estimated_delivery && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Estimated delivery: {formatDateTime(order.estimated_delivery)}
                </p>
              )}
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400">
            {getStatusDescription(order.status)}
          </p>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Order Items ({order.items.length})
          </h2>
          
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {item.product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-1">
                    {renderStars(item.product.rating)}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({item.product.review_count})
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Quantity: {item.quantity}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(item.price)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Order Summary
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
              <span className="font-medium">{formatCurrency(order.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
              <span className="font-medium">{formatCurrency(order.tax)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Shipping Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Shipping Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Shipping Address</h3>
              <div className="text-gray-600 dark:text-gray-400">
                <p>{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                <p>{order.shipping_address.address}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
                <p>{order.shipping_address.country}</p>
                <p className="mt-2">Phone: {order.shipping_address.phone}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Payment Method</h3>
              <div className="text-gray-600 dark:text-gray-400">
                <p className="capitalize">{order.payment_method.type}</p>
                {order.payment_method.last4 && (
                  <p>•••• {order.payment_method.last4}</p>
                )}
                {order.payment_method.brand && (
                  <p>{order.payment_method.brand}</p>
                )}
                <p className="mt-2 capitalize">Status: {order.payment_status}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Order Actions
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Download size={16} />
              Download Invoice
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Printer size={16} />
              Print Order
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <MessageCircle size={16} />
              Contact Support
            </button>
            
            {order.status === 'delivered' && (
              <Link 
                to={`/marketplace/product/${order.items[0].product.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Star size={16} />
                Write Review
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
