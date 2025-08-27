import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CreditCard,
  CheckCircle,
  Shield,
  Lock,
  DollarSign,
  CreditCard as CreditCardIcon,
  Wallet
} from 'lucide-react';
// import { useToastHelpers } from '../../components/ui/Toast';

const PaymentPage = () => {
  const navigate = useNavigate();
  // const { success, error: showError } = useToastHelpers();
  
  // Simple toast functions for now
  const success = (title: string, message: string) => {
    console.log('SUCCESS:', title, message);
    alert(`${title}: ${message}`);
  };
  
  const showError = (title: string, message: string) => {
    console.log('ERROR:', title, message);
    alert(`ERROR: ${title} - ${message}`);
  };
  
  // Initialize with default mock data to prevent null errors
  const defaultOrderData = {
    items: [
      {
        id: 1,
        productId: 1,
        product: {
          id: 1,
          name: 'Test Product',
          price: 99.99,
          image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
          brand: 'Test Brand',
          inStock: true
        },
        quantity: 1
      }
    ],
    subtotal: 99.99,
    shipping: 5.99,
    tax: 8.00,
    total: 113.98,
    orderType: 'cart',
    checkoutDate: new Date().toISOString()
  };

  const defaultAddressData = {
    id: '1',
    type: 'home',
    name: 'John Doe',
    phone: '+1 (555) 123-4567',
    email: 'john@example.com',
    addressLine1: '123 Test Street',
    addressLine2: '',
    city: 'Test City',
    state: 'CA',
    zipCode: '12345',
    country: 'United States',
    isDefault: true
  };

  const [orderData, setOrderData] = useState<any>(defaultOrderData);
  const [addressData, setAddressData] = useState<any>(defaultAddressData);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  useEffect(() => {
    console.log('=== PAYMENT PAGE DEBUG START ===');
    console.log('PaymentPage: Component mounted');
    
    try {
      // Get order and address data from session storage
      const orderDataStr = sessionStorage.getItem('checkoutOrderData');
      const addressDataStr = sessionStorage.getItem('checkoutAddressData');
      
      console.log('PaymentPage: Raw order data from session storage:', orderDataStr);
      console.log('PaymentPage: Raw address data from session storage:', addressDataStr);
      
      // Debug: Log all session storage keys and values
      console.log('PaymentPage: All session storage keys:', Object.keys(sessionStorage));
      console.log('PaymentPage: Session storage length:', sessionStorage.length);
      
      // Try to use session storage data if available, otherwise keep default mock data
      if (orderDataStr && addressDataStr) {
        try {
          console.log('PaymentPage: Attempting to parse session storage data...');
          const parsedOrderData = JSON.parse(orderDataStr);
          const parsedAddressData = JSON.parse(addressDataStr);
          
          console.log('PaymentPage: Parsed order data:', parsedOrderData);
          console.log('PaymentPage: Parsed address data:', parsedAddressData);
          console.log('PaymentPage: Checkout date from session storage:', parsedOrderData.checkoutDate);
          console.log('PaymentPage: Checkout date formatted:', parsedOrderData.checkoutDate ? new Date(parsedOrderData.checkoutDate).toLocaleString() : 'Not available');
          
          setOrderData(parsedOrderData);
          setAddressData(parsedAddressData);
          
          console.log('PaymentPage: Session storage data loaded successfully');
        } catch (parseError) {
          console.error('PaymentPage: ERROR parsing session storage data:', parseError);
          console.log('PaymentPage: Using default mock data due to parsing error');
        }
      } else {
        console.log('PaymentPage: No session storage data found, using default mock data');
      }
    } catch (error) {
      console.error('PaymentPage: ERROR in useEffect:', error);
      console.log('PaymentPage: Using default mock data due to error');
    }
    
    console.log('PaymentPage: Current state after useEffect:');
    console.log('PaymentPage: orderData state:', orderData);
    console.log('PaymentPage: addressData state:', addressData);
    console.log('=== PAYMENT PAGE DEBUG END ===');
  }, []);

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Cash on Delivery (COD)',
      description: 'Pay when you receive your order',
      icon: <DollarSign className="w-5 h-5" />,
      fee: 2.99
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay securely with your card',
      icon: <CreditCardIcon className="w-5 h-5" />,
      fee: 0
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      description: 'Pay with PayPal, Apple Pay, or Google Pay',
      icon: <Wallet className="w-5 h-5" />,
      fee: 0
    }
  ];

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData(prev => ({
      ...prev,
      cardNumber: formatted
    }));
  };

  const validateCardData = () => {
    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length < 16) {
      showError('Invalid card number', 'Please enter a valid 16-digit card number');
      return false;
    }
    if (!cardData.cardholderName) {
      showError('Cardholder name required', 'Please enter the cardholder name');
      return false;
    }
    if (!cardData.expiryMonth || !cardData.expiryYear) {
      showError('Expiry date required', 'Please enter the card expiry date');
      return false;
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      showError('CVV required', 'Please enter the 3-digit CVV');
      return false;
    }
    return true;
  };

  const getPaymentFee = () => {
    const method = paymentMethods.find(m => m.id === paymentMethod);
    return method?.fee || 0;
  };

  const getTotal = () => {
    if (!orderData) return 0;
    return (orderData.total || 0) + getPaymentFee();
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'card' && !validateCardData()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order object
      const order = {
        id: Date.now().toString(),
        items: orderData?.items || [],
        address: addressData || {},
        paymentMethod,
        paymentFee: getPaymentFee(),
        subtotal: orderData?.subtotal || 0,
        shipping: orderData?.shipping || 0,
        tax: orderData?.tax || 0,
        total: getTotal(),
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        estimatedDelivery: getEstimatedDelivery()
      };

      // Store order in session storage for success page
      sessionStorage.setItem('lastOrder', JSON.stringify(order));
      
      // Clear checkout data
      sessionStorage.removeItem('checkoutOrderData');
      sessionStorage.removeItem('checkoutAddressData');

      success('Order placed successfully!', 'Your order has been confirmed');
      
      navigate('/marketplace/checkout/success');
    } catch (error) {
      showError('Payment failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getEstimatedDelivery = () => {
    const shippingMethod = orderData?.shippingMethod || 'standard';
    const today = new Date();
    const deliveryDate = new Date(today);
    
    switch (shippingMethod) {
      case 'overnight':
        deliveryDate.setDate(today.getDate() + 1);
        break;
      case 'express':
        deliveryDate.setDate(today.getDate() + 3);
        break;
      default:
        deliveryDate.setDate(today.getDate() + 7);
        break;
    }
    
    return deliveryDate.toISOString();
  };

  const getCheckoutDateFormatted = () => {
    if (orderData?.checkoutDate) {
      return new Date(orderData.checkoutDate).toLocaleString();
    }
    return new Date().toLocaleString();
  };

  const handleBack = () => {
    navigate('/marketplace/checkout/review');
  };

  console.log('=== PAYMENT PAGE RENDER DEBUG ===');
  console.log('PaymentPage: Render state - orderData:', orderData);
  console.log('PaymentPage: Render state - addressData:', addressData);
  console.log('PaymentPage: orderData type:', typeof orderData);
  console.log('PaymentPage: addressData type:', typeof addressData);
  console.log('PaymentPage: orderData is null:', orderData === null);
  console.log('PaymentPage: addressData is null:', addressData === null);
  if (orderData) {
    console.log('PaymentPage: orderData.subtotal:', orderData.subtotal);
    console.log('PaymentPage: orderData.shipping:', orderData.shipping);
    console.log('PaymentPage: orderData.tax:', orderData.tax);
    console.log('PaymentPage: orderData.checkoutDate:', orderData.checkoutDate);
    console.log('PaymentPage: Checkout date formatted:', orderData.checkoutDate ? new Date(orderData.checkoutDate).toLocaleString() : 'Not available');
  }
  console.log('=== PAYMENT PAGE RENDER DEBUG END ===');

  // Safety check - if orderData is still null, show loading
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
              <p className="text-sm text-gray-600 mt-1">
                Checkout Date: {getCheckoutDateFormatted()}
              </p>
            </div>
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
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Review</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
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
                        {method.fee > 0 && (
                          <p className="text-sm text-gray-600">+${method.fee.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Card Payment Form */}
            {paymentMethod === 'card' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Card Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardData.cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      name="cardholderName"
                      value={cardData.cardholderName}
                      onChange={handleCardInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Month *
                      </label>
                      <select
                        name="expiryMonth"
                        value={cardData.expiryMonth}
                        onChange={handleCardInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year *
                      </label>
                      <select
                        name="expiryYear"
                        value={cardData.expiryYear}
                        onChange={handleCardInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleCardInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* COD Notice */}
            {paymentMethod === 'cod' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
              >
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-yellow-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-yellow-900">Cash on Delivery</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      You will pay ${getTotal().toFixed(2)} in cash when your order is delivered. 
                      Please have the exact amount ready for the delivery person.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${(orderData?.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${(orderData?.shipping || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${(orderData?.tax || 0).toFixed(2)}</span>
                </div>
                {getPaymentFee() > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Fee</span>
                    <span className="font-medium">${getPaymentFee().toFixed(2)}</span>
                  </div>
                )}
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
                  <Lock className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-900">Secure Payment</h3>
                    <p className="text-sm text-green-700">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
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
      </div>
    </div>
  );
};

export default PaymentPage;
