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
  Shield,
  Lock,
  DollarSign,
  CreditCard as CreditCardIcon,
  Wallet,
  Plus,
  Edit,
  Trash2,
  Star
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { useToastHelpers } from '../../components/ui/Toast';
import PaymentMethodModal from '../../components/marketplace/PaymentMethodModal';

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'cod';
  cardNumber?: string;
  cardholderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { success, error: showError } = useToastHelpers();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      cardholderName: user?.displayName || user?.username || 'User',
      expiryMonth: '12',
      expiryYear: '2025',
      isDefault: true
    }
  ]);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  
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
    name: user?.displayName || user?.username || 'User',
    phone: '+1 (555) 123-4567',
    email: user?.email || '',
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
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethodId) || paymentMethods[0];
  const paymentMethod = selectedPaymentMethod?.type || 'card';

  const handleSavePaymentMethod = async (methodData: Omit<PaymentMethod, 'id'>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingMethod) {
        setPaymentMethods(prev => prev.map(pm => {
          if (pm.id === editingMethod.id) {
            const updated = { ...pm, ...methodData };
            return updated;
          }
          if (methodData.isDefault) {
            return { ...pm, isDefault: false };
          }
          return pm;
        }));
        success('Payment method updated', 'Payment method has been updated');
      } else {
        const newMethod: PaymentMethod = {
          id: Date.now().toString(),
          ...methodData,
          isDefault: paymentMethods.length === 0 || methodData.isDefault
        };
        
        if (methodData.isDefault) {
          setPaymentMethods(prev => prev.map(pm => ({ ...pm, isDefault: false })));
        }
        setPaymentMethods(prev => [...prev, newMethod]);
        setSelectedPaymentMethodId(newMethod.id);
        success('Payment method added', 'New payment method has been added');
      }
      
      setEditingMethod(null);
      setShowPaymentModal(false);
    } catch (error) {
      showError('Failed to save payment method', 'Please try again');
    }
  };

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setShowPaymentModal(true);
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    if (paymentMethods.length <= 1) {
      showError('Cannot delete', 'You must have at least one payment method');
      return;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setPaymentMethods(prev => prev.filter(pm => pm.id !== methodId));
      if (selectedPaymentMethodId === methodId) {
        setSelectedPaymentMethodId(paymentMethods[0]?.id || '');
      }
      success('Payment method deleted', 'Payment method has been removed');
    } catch (error) {
      showError('Failed to delete', 'Please try again');
    }
  };

  const handleSetAsDefault = async (methodId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setPaymentMethods(prev => prev.map(pm => ({
        ...pm,
        isDefault: pm.id === methodId
      })));
      success('Default payment method updated', 'Default payment method has been changed');
    } catch (error) {
      showError('Failed to update', 'Please try again');
    }
  };

  useEffect(() => {
    const isDev = (import.meta as any).env?.MODE === 'development';
    
    if (isDev) {
      console.log('=== PAYMENT PAGE DEBUG START ===');
      console.log('PaymentPage: Component mounted');
    }
    
    try {
      // Get order and address data from session storage
      const orderDataStr = sessionStorage.getItem('checkoutOrderData');
      const addressDataStr = sessionStorage.getItem('checkoutAddressData');
      
      // Try to use session storage data if available, otherwise keep default mock data
      if (orderDataStr && addressDataStr) {
        try {
          const parsedOrderData = JSON.parse(orderDataStr);
          const parsedAddressData = JSON.parse(addressDataStr);
          
          setOrderData(parsedOrderData);
          setAddressData(parsedAddressData);
          
          if (isDev) {
            console.log('PaymentPage: Session storage data loaded successfully');
          }
        } catch (parseError) {
          if (isDev) {
            console.error('PaymentPage: ERROR parsing session storage data:', parseError);
          }
        }
      }
    } catch (error) {
      if (isDev) {
        console.error('PaymentPage: ERROR in useEffect:', error);
      }
    }
    
    if (isDev) {
      console.log('=== PAYMENT PAGE DEBUG END ===');
    }
  }, []);

  const paymentMethodTypes = [
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
    const method = paymentMethodTypes.find(m => m.id === paymentMethod);
    return method?.fee || 0;
  };

  const getTotal = () => {
    if (!orderData) return 0;
    return (orderData.total || 0) + getPaymentFee();
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
    navigate('/marketplace/checkout/address');
  };

  const handleContinue = () => {
    if (!selectedPaymentMethodId) {
      showError('Please select a payment method', 'You must select a payment method');
      return;
    }

    // Validate card data if using card payment
    if (paymentMethod === 'card') {
      // If using saved card, only need CVV
      if (selectedPaymentMethod.last4) {
        if (!cardData.cvv || cardData.cvv.length < 3) {
          showError('CVV required', 'Please enter the CVV for your saved card');
          return;
        }
      } else {
        // New card, validate all fields
        if (!validateCardData()) {
          return;
        }
      }
    }

    // Store payment method and card data in session storage
    const paymentData = {
      ...selectedPaymentMethod,
      cvv: paymentMethod === 'card' ? cardData.cvv : undefined
    };
    sessionStorage.setItem('checkoutPaymentMethod', JSON.stringify(paymentData));
    navigate('/marketplace/checkout/review');
  };

  const isDev = (import.meta as any).env?.MODE === 'development';
  if (isDev) {
    console.log('=== PAYMENT PAGE RENDER DEBUG ===');
    console.log('PaymentPage: Render state - orderData:', orderData);
    console.log('PaymentPage: Render state - addressData:', addressData);
    if (orderData) {
      console.log('PaymentPage: orderData.subtotal:', orderData.subtotal);
      console.log('PaymentPage: orderData.shipping:', orderData.shipping);
      console.log('PaymentPage: orderData.tax:', orderData.tax);
    }
    console.log('=== PAYMENT PAGE RENDER DEBUG END ===');
  }

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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
                <button
                  onClick={() => {
                    setEditingMethod(null);
                    setShowPaymentModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Payment Method
                </button>
              </div>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isSelected = selectedPaymentMethodId === method.id;
                  return (
                    <motion.div
                      key={method.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPaymentMethodId(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                            {method.type === 'card' ? <CreditCardIcon className="w-5 h-5" /> :
                             method.type === 'wallet' ? <Wallet className="w-5 h-5" /> :
                             <DollarSign className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900">
                                {method.type === 'card' ? `${method.brand} •••• ${method.last4}` :
                                 method.type === 'wallet' ? 'Digital Wallet' :
                                 'Cash on Delivery'}
                              </h3>
                              {method.isDefault && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            {method.cardholderName && (
                              <p className="text-sm text-gray-600">{method.cardholderName}</p>
                            )}
                            {method.expiryMonth && method.expiryYear && (
                              <p className="text-sm text-gray-600">
                                Expires {method.expiryMonth}/{method.expiryYear}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!method.isDefault && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetAsDefault(method.id);
                              }}
                              className="text-gray-400 hover:text-yellow-600 transition-colors"
                              title="Set as Default"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPaymentMethod(method);
                            }}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {paymentMethods.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePaymentMethod(method.id);
                              }}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Card Payment Form - Only show if using a new card or card method requires CVV */}
            {paymentMethod === 'card' && selectedPaymentMethod && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Card Details</h2>
                
                {selectedPaymentMethod.last4 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6 border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                          <CreditCardIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {selectedPaymentMethod.brand} •••• {selectedPaymentMethod.last4}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedPaymentMethod.cardholderName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Expires</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {selectedPaymentMethod.expiryMonth}/{selectedPaymentMethod.expiryYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Saved card - Secure payment</span>
                    </div>
                  </motion.div>
                ) : null}
                
                <div className="space-y-4">
                  {!selectedPaymentMethod.last4 && (
                    <>
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
                          placeholder={user?.displayName || user?.username || "Full Name"}
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
                    </>
                  )}
                  
                  {selectedPaymentMethod.last4 && (
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
                  )}
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
                onClick={handleContinue}
                disabled={isProcessing || !selectedPaymentMethodId}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <span>Continue to Review</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Payment Method Modal */}
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setEditingMethod(null);
          }}
          onSave={handleSavePaymentMethod}
          editingMethod={editingMethod}
        />
      </div>
    </div>
  );
};

export default PaymentPage;
