import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Package, 
  Truck, 
  CreditCard,
  CheckCircle,
  MapPin,
  Clock,
  Shield,
  Truck as TruckIcon
} from 'lucide-react';
import { useToastHelpers } from '../../components/ui/Toast';

const ReviewPage = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToastHelpers();
  
  const [orderData, setOrderData] = useState<any>(null);
  const [addressData, setAddressData] = useState<any>(null);
  const [shippingMethod, setShippingMethod] = useState('standard');

  useEffect(() => {
    // Get order and address data from session storage
    const orderDataStr = sessionStorage.getItem('checkoutOrderData');
    const addressDataStr = sessionStorage.getItem('checkoutAddressData');
    
    if (!orderDataStr || !addressDataStr) {
      showError('Missing checkout data', 'Please start the checkout process again');
      navigate('/marketplace/cart');
      return;
    }

    try {
      setOrderData(JSON.parse(orderDataStr));
      setAddressData(JSON.parse(addressDataStr));
    } catch (error) {
      showError('Invalid checkout data', 'Please start the checkout process again');
      navigate('/marketplace/cart');
    }
  }, [navigate, showError]);

  const shippingMethods = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: '5-7 business days',
      price: orderData?.shipping || 5.99,
      icon: <TruckIcon className="w-5 h-5" />
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: '2-3 business days',
      price: 12.99,
      icon: <TruckIcon className="w-5 h-5" />
    },
    {
      id: 'overnight',
      name: 'Overnight Delivery',
      description: 'Next business day',
      price: 24.99,
      icon: <TruckIcon className="w-5 h-5" />
    }
  ];

  const getShippingPrice = () => {
    const method = shippingMethods.find(m => m.id === shippingMethod);
    return method?.price || 0;
  };

  const getTotal = () => {
    if (!orderData) return 0;
    return orderData.subtotal + getShippingPrice() + orderData.tax;
  };

  const handleContinue = () => {
    console.log('ReviewPage: Continue button clicked');
    
    // Store shipping method in session storage
    const checkoutData = {
      ...orderData,
      shippingMethod,
      shippingPrice: getShippingPrice(),
      total: getTotal()
    };
    sessionStorage.setItem('checkoutOrderData', JSON.stringify(checkoutData));
    
    // Ensure address data is preserved
    if (addressData) {
      sessionStorage.setItem('checkoutAddressData', JSON.stringify(addressData));
    }
    
    console.log('ReviewPage: Navigating to payment page');
    console.log('ReviewPage: Order data stored:', checkoutData);
    console.log('ReviewPage: Address data stored:', addressData);
    navigate('/marketplace/checkout/payment');
  };

  const handleBack = () => {
    navigate('/marketplace/checkout/address');
  };

  if (!orderData || !addressData) {
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Review Order</h1>
            <button
              onClick={handleBack}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Review Items</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Address</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full">
                <Truck className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Review</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              
              <div className="space-y-4">
                {orderData.items.map((item: any) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
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
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Address</h2>
              
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">{addressData.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{addressData.phone}</p>
                  <p className="text-sm text-gray-900">
                    {addressData.addressLine1}
                    {addressData.addressLine2 && `, ${addressData.addressLine2}`}
                  </p>
                  <p className="text-sm text-gray-900">
                    {addressData.city}, {addressData.state} {addressData.zipCode}
                  </p>
                  <p className="text-sm text-gray-600">{addressData.country}</p>
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Method</h2>
              
              <div className="space-y-3">
                {shippingMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      shippingMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setShippingMethod(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                          {method.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{method.name}</h3>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${method.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${orderData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${getShippingPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${orderData.tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-900">Secure Checkout</h3>
                    <p className="text-sm text-green-700">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">Estimated Delivery</h3>
                    <p className="text-sm text-blue-700">
                      {shippingMethod === 'standard' && '5-7 business days'}
                      {shippingMethod === 'express' && '2-3 business days'}
                      {shippingMethod === 'overnight' && 'Next business day'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
