import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin, 
  Calendar,
  CreditCard,
  DollarSign,
  ArrowRight,
  Home,
  ShoppingBag
} from 'lucide-react';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    // Get order data from session storage
    const orderDataStr = sessionStorage.getItem('lastOrder');
    if (!orderDataStr) {
      navigate('/marketplace');
      return;
    }

    try {
      setOrder(JSON.parse(orderDataStr));
    } catch (error) {
      navigate('/marketplace');
    }
  }, [navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cod':
        return <DollarSign className="w-5 h-5" />;
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cod':
        return 'Cash on Delivery';
      case 'card':
        return 'Credit/Debit Card';
      case 'wallet':
        return 'Digital Wallet';
      default:
        return 'Payment';
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border p-8 text-center mb-6"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. We've received your order and will begin processing it right away.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-blue-900 font-medium">Order #{order.id}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600">{item.product.brand}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Delivery Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Delivery Address */}
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Delivery Address</h3>
                    <p className="text-sm text-gray-600">{order.address.name}</p>
                    <p className="text-sm text-gray-600">{order.address.phone}</p>
                    <p className="text-sm text-gray-900">
                      {order.address.addressLine1}
                      {order.address.addressLine2 && `, ${order.address.addressLine2}`}
                    </p>
                    <p className="text-sm text-gray-900">
                      {order.address.city}, {order.address.state} {order.address.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">{order.address.country}</p>
                  </div>
                </div>

                {/* Estimated Delivery */}
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Estimated Delivery</h3>
                    <p className="text-sm text-gray-900 font-medium">
                      {formatDate(order.estimatedDelivery)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      We'll send you tracking information once your order ships.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
              
              <div className="flex items-center space-x-3 mb-4">
                {getPaymentMethodIcon(order.paymentMethod)}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {getPaymentMethodName(order.paymentMethod)}
                  </h3>
                  {order.paymentMethod === 'cod' && (
                    <p className="text-sm text-gray-600">
                      Pay ${order.total.toFixed(2)} when you receive your order
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${order.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${order.tax.toFixed(2)}</span>
                  </div>
                  {order.paymentFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Fee</span>
                      <span className="font-medium">${order.paymentFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm border p-6 sticky top-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">Order Processing</h3>
                    <p className="text-sm text-blue-700">We'll start preparing your order</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Truck className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-900">Shipping</h3>
                    <p className="text-sm text-green-700">You'll receive tracking info</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-purple-900">Delivery</h3>
                    <p className="text-sm text-purple-700">Your order will arrive safely</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => navigate(`/marketplace/orders/${order.id}`)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>View Order Details</span>
                </button>

                <button
                  onClick={() => navigate('/marketplace')}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Home className="w-5 h-5" />
                  <span>Continue Shopping</span>
                </button>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-2">Need Help?</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  If you have any questions about your order, please contact our customer support.
                </p>
                <button className="text-sm text-yellow-800 hover:text-yellow-900 font-medium">
                  Contact Support
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
