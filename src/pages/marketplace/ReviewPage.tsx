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
  Truck as TruckIcon,
  Edit,
  Tag,
  X
} from 'lucide-react';
import { useToastHelpers } from '../../components/ui/Toast';
import CouponModal from '../../components/marketplace/CouponModal';

const ReviewPage = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToastHelpers();
  
  const [orderData, setOrderData] = useState<any>(null);
  const [addressData, setAddressData] = useState<any>(null);
  const [paymentMethodData, setPaymentMethodData] = useState<any>(null);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    // Get order, address, and payment data from session storage
    const orderDataStr = sessionStorage.getItem('checkoutOrderData');
    const addressDataStr = sessionStorage.getItem('checkoutAddressData');
    const paymentDataStr = sessionStorage.getItem('checkoutPaymentMethod');
    
    if (!orderDataStr || !addressDataStr) {
      showError('Missing checkout data', 'Please start the checkout process again');
      navigate('/marketplace/cart');
      return;
    }

    try {
      setOrderData(JSON.parse(orderDataStr));
      setAddressData(JSON.parse(addressDataStr));
      if (paymentDataStr) {
        setPaymentMethodData(JSON.parse(paymentDataStr));
      }
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

  const getCouponDiscount = () => {
    if (!appliedCoupon || !orderData) return 0;
    if (appliedCoupon.type === 'percentage') {
      return (orderData.subtotal * appliedCoupon.discount) / 100;
    }
    return appliedCoupon.discount;
  };

  const getTotal = () => {
    if (!orderData) return 0;
    return orderData.subtotal - getCouponDiscount() + getShippingPrice() + orderData.tax;
  };

  const handleApplyCoupon = (coupon: any) => {
    setAppliedCoupon(coupon);
    success('Coupon Applied', `Coupon ${coupon.code} applied successfully!`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    success('Coupon Removed', 'Coupon removed successfully');
  };

  const handleEditAddress = () => {
    navigate('/marketplace/checkout/address');
  };

  const handleEditPayment = () => {
    navigate('/marketplace/checkout/payment');
  };

  const handleEditShipping = () => {
    // Shipping is editable on this page, so just scroll to shipping section
    document.getElementById('shipping-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    
    try {
      // Simulate order placement
      await new Promise(resolve => setTimeout(resolve, 2000));

      const order = {
        id: Date.now().toString(),
        items: orderData.items,
        address: addressData,
        paymentMethod: paymentMethodData,
        shippingMethod,
        coupon: appliedCoupon,
        subtotal: orderData.subtotal,
        shipping: getShippingPrice(),
        tax: orderData.tax,
        couponDiscount: getCouponDiscount(),
        total: getTotal(),
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      // Store order in session storage
      sessionStorage.setItem('lastOrder', JSON.stringify(order));
      
      // Clear checkout data
      sessionStorage.removeItem('checkoutOrderData');
      sessionStorage.removeItem('checkoutAddressData');
      sessionStorage.removeItem('checkoutPaymentMethod');

      success('Order Placed!', 'Your order has been confirmed');
      navigate('/marketplace/checkout/success');
    } catch (error) {
      showError('Order Failed', 'There was an error placing your order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleBack = () => {
    navigate('/marketplace/checkout/payment');
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
                <button
                  onClick={handleEditAddress}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  <Edit size={16} />
                  Edit
                </button>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                <div className="flex-1">
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

            {/* Payment Method */}
            {paymentMethodData && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
                  <button
                    onClick={handleEditPayment}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {paymentMethodData.type === 'card' 
                        ? `${paymentMethodData.brand} •••• ${paymentMethodData.last4}`
                        : paymentMethodData.type === 'wallet'
                        ? 'Digital Wallet'
                        : 'Cash on Delivery'}
                    </h3>
                    {paymentMethodData.cardholderName && (
                      <p className="text-sm text-gray-600">{paymentMethodData.cardholderName}</p>
                    )}
                    {paymentMethodData.expiryMonth && paymentMethodData.expiryYear && (
                      <p className="text-sm text-gray-600">
                        Expires {paymentMethodData.expiryMonth}/{paymentMethodData.expiryYear}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Method */}
            <div id="shipping-section" className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Shipping Method</h2>
                <button
                  onClick={handleEditShipping}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  <Edit size={16} />
                  Edit
                </button>
              </div>
              
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
                
                {/* Coupon Discount */}
                {appliedCoupon && (
                  <div className="flex justify-between text-blue-600">
                    <div className="flex items-center gap-2">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-700"
                        title="Remove coupon"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <span>-${getCouponDiscount().toFixed(2)}</span>
                  </div>
                )}

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

              {/* Apply Coupon Button */}
              <button
                onClick={() => setShowCouponModal(true)}
                className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
              >
                <Tag size={16} />
                {appliedCoupon ? 'Change Coupon' : 'Apply Coupon'}
              </button>

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
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                {isPlacingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Place Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Coupon Modal */}
        <CouponModal
          isOpen={showCouponModal}
          onClose={() => setShowCouponModal(false)}
          onApply={handleApplyCoupon}
          appliedCoupon={appliedCoupon}
          onRemove={handleRemoveCoupon}
        />
      </div>
    </div>
  );
};

export default ReviewPage;
