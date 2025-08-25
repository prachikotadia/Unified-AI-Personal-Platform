import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Truck, Shield, Gift, Star, Lock, 
  CheckCircle, AlertCircle, ChevronDown, ChevronUp,
  MapPin, Phone, Mail, User, Building, Globe,
  Package, Clock, DollarSign, Percent, Zap,
  ArrowLeft, ArrowRight, Loader2
} from 'lucide-react';
import { marketplaceAPI, CartItem, Order } from '../../services/api';
import { useTheme } from '../../store/theme';

interface ShippingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

interface BillingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer' | 'crypto';
  name: string;
  icon: string;
  last4?: string;
  brand?: string;
  is_default: boolean;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimated_days: number;
  is_available: boolean;
}

const CheckoutPage: React.FC = () => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US'
  });
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US'
  });
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>('');
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [orderSummary, setOrderSummary] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = useCallback(async () => {
    try {
      setLoading(true);
      const [cartData, loyaltyData] = await Promise.all([
        marketplaceAPI.getCart('user_123'),
        marketplaceAPI.getLoyaltyProgram('user_123')
      ]);

      setCartItems(cartData || []);
      setLoyaltyPoints(loyaltyData?.points_balance || 0);

      // Calculate subtotal
      const subtotalValue = cartData?.reduce((sum: number, item: CartItem) => 
        sum + (item.product.price * item.quantity), 0) || 0;
      setSubtotal(subtotalValue);

      // Mock shipping methods
      setShippingMethods([
        {
          id: 'standard',
          name: 'Standard Shipping',
          description: '5-7 business days',
          price: 5.99,
          estimated_days: 5,
          is_available: true
        },
        {
          id: 'express',
          name: 'Express Shipping',
          description: '2-3 business days',
          price: 12.99,
          estimated_days: 2,
          is_available: true
        },
        {
          id: 'overnight',
          name: 'Overnight Shipping',
          description: 'Next business day',
          price: 24.99,
          estimated_days: 1,
          is_available: true
        }
      ]);

      // Mock payment methods
      setPaymentMethods([
        {
          id: 'credit_card',
          type: 'credit_card',
          name: 'Credit Card',
          icon: 'credit-card',
          is_default: true
        },
        {
          id: 'paypal',
          type: 'paypal',
          name: 'PayPal',
          icon: 'paypal',
          is_default: false
        },
        {
          id: 'apple_pay',
          type: 'apple_pay',
          name: 'Apple Pay',
          icon: 'apple',
          is_default: false
        },
        {
          id: 'google_pay',
          type: 'google_pay',
          name: 'Google Pay',
          icon: 'google',
          is_default: false
        }
      ]);

      setSelectedShippingMethod('standard');
      setSelectedPaymentMethod('credit_card');
    } catch (error) {
      console.error('Error loading checkout data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate totals when dependencies change
  useEffect(() => {
    const shippingMethod = shippingMethods.find(m => m.id === selectedShippingMethod);
    const shippingCostValue = shippingMethod?.price || 0;
    setShippingCost(shippingCostValue);

    // Calculate tax (mock calculation)
    const taxRate = 0.08; // 8% tax rate
    const taxValue = subtotal * taxRate;
    setTaxAmount(taxValue);

    // Calculate loyalty points discount
    const loyaltyDiscount = useLoyaltyPoints ? (loyaltyPointsToUse * 0.01) : 0; // 1 cent per point
    setDiscountAmount(loyaltyDiscount);

    // Calculate total
    const total = subtotal + shippingCostValue + taxValue - loyaltyDiscount;
    setTotalAmount(total);
  }, [subtotal, selectedShippingMethod, shippingMethods, taxAmount, useLoyaltyPoints, loyaltyPointsToUse]);

  const handleAddressChange = useCallback((type: 'shipping' | 'billing', field: string, value: string) => {
    if (type === 'shipping') {
      setShippingAddress(prev => ({ ...prev, [field]: value }));
      if (useSameAddress) {
        setBillingAddress(prev => ({ ...prev, [field]: value }));
      }
    } else {
      setBillingAddress(prev => ({ ...prev, [field]: value }));
    }
  }, [useSameAddress]);

  const handleUseSameAddress = useCallback((checked: boolean) => {
    setUseSameAddress(checked);
    if (checked) {
      setBillingAddress(shippingAddress);
    }
  }, [shippingAddress]);

  const handleLoyaltyPointsChange = useCallback((checked: boolean) => {
    setUseLoyaltyPoints(checked);
    if (checked) {
      setLoyaltyPointsToUse(Math.min(loyaltyPoints, Math.floor(subtotal * 100))); // Max 1 point per dollar
    } else {
      setLoyaltyPointsToUse(0);
    }
  }, [loyaltyPoints, subtotal]);

  const handleLoyaltyPointsInput = useCallback((value: number) => {
    const maxPoints = Math.min(loyaltyPoints, Math.floor(subtotal * 100));
    setLoyaltyPointsToUse(Math.min(value, maxPoints));
  }, [loyaltyPoints, subtotal]);

  const validateStep = useCallback((step: number) => {
    switch (step) {
      case 1: // Shipping Address
        return shippingAddress.first_name && shippingAddress.last_name && 
               shippingAddress.email && shippingAddress.phone && 
               shippingAddress.address && shippingAddress.city && 
               shippingAddress.state && shippingAddress.zip_code;
      case 2: // Payment Method
        return selectedPaymentMethod && (!useSameAddress ? 
          (billingAddress.first_name && billingAddress.last_name && 
           billingAddress.email && billingAddress.phone && 
           billingAddress.address && billingAddress.city && 
           billingAddress.state && billingAddress.zip_code) : true);
      case 3: // Review
        return true;
      default:
        return false;
    }
  }, [shippingAddress, billingAddress, selectedPaymentMethod, useSameAddress]);

  const handleNextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  }, [currentStep, validateStep]);

  const handlePrevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    try {
      setLoading(true);
      
      const orderData = {
        user_id: 'user_123',
        shipping_address: shippingAddress,
        billing_address: useSameAddress ? shippingAddress : billingAddress,
        payment_method: selectedPaymentMethod,
        shipping_method: selectedShippingMethod
      };

      const order = await marketplaceAPI.createOrder(orderData);
      setOrderSummary(order);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setLoading(false);
    }
  }, [shippingAddress, billingAddress, useSameAddress, selectedPaymentMethod, selectedShippingMethod]);

  if (loading && !cartItems.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-gray-600 dark:text-gray-300">Loading checkout...</span>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Add some items to your cart to proceed with checkout
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const StepIndicator: React.FC<{ step: number; current: number; title: string }> = ({ step, current, title }) => (
    <div className="flex items-center">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
        step <= current 
          ? 'bg-blue-500 border-blue-500 text-white' 
          : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
      }`}>
        {step < current ? <CheckCircle size={16} /> : step}
      </div>
      <span className={`ml-2 text-sm font-medium ${
        step <= current 
          ? 'text-blue-500' 
          : 'text-gray-500 dark:text-gray-400'
      }`}>
        {title}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Checkout
          </h1>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6">
            <StepIndicator step={1} current={currentStep} title="Shipping" />
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 mx-4" />
            <StepIndicator step={2} current={currentStep} title="Payment" />
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 mx-4" />
            <StepIndicator step={3} current={currentStep} title="Review" />
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 mx-4" />
            <StepIndicator step={4} current={currentStep} title="Complete" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`p-6 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin size={20} />
                    Shipping Address
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.first_name}
                        onChange={(e) => handleAddressChange('shipping', 'first_name', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.last_name}
                        onChange={(e) => handleAddressChange('shipping', 'last_name', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => handleAddressChange('shipping', 'email', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => handleAddressChange('shipping', 'phone', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Company (Optional)
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.company || ''}
                        onChange={(e) => handleAddressChange('shipping', 'company', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Address *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.address}
                        onChange={(e) => handleAddressChange('shipping', 'address', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Address 2 (Optional)
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.address2 || ''}
                        onChange={(e) => handleAddressChange('shipping', 'address2', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => handleAddressChange('shipping', 'city', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => handleAddressChange('shipping', 'state', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.zip_code}
                        onChange={(e) => handleAddressChange('shipping', 'zip_code', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Country *
                      </label>
                      <select
                        value={shippingAddress.country}
                        onChange={(e) => handleAddressChange('shipping', 'country', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={useSameAddress}
                        onChange={(e) => handleUseSameAddress(e.target.checked)}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Use same address for billing
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Payment Methods */}
                  <div className={`p-6 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <CreditCard size={20} />
                      Payment Method
                    </h2>

                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            selectedPaymentMethod === method.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedPaymentMethod === method.id}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedPaymentMethod === method.id
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {selectedPaymentMethod === method.id && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard size={20} className="text-gray-600 dark:text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {method.name}
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Billing Address (if different from shipping) */}
                  {!useSameAddress && (
                    <div className={`p-6 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    }`}>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Building size={20} />
                        Billing Address
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.first_name}
                            onChange={(e) => handleAddressChange('billing', 'first_name', e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.last_name}
                            onChange={(e) => handleAddressChange('billing', 'last_name', e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Address *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.address}
                            onChange={(e) => handleAddressChange('billing', 'address', e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.city}
                            onChange={(e) => handleAddressChange('billing', 'city', e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            State *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.state}
                            onChange={(e) => handleAddressChange('billing', 'state', e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            ZIP Code *
                          </label>
                          <input
                            type="text"
                            value={billingAddress.zip_code}
                            onChange={(e) => handleAddressChange('billing', 'zip_code', e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Country *
                          </label>
                          <select
                            value={billingAddress.country}
                            onChange={(e) => handleAddressChange('billing', 'country', e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            required
                          >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="AU">Australia</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`p-6 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield size={20} />
                    Review Order
                  </h2>

                  <div className="space-y-6">
                    {/* Order Items */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Order Items</h3>
                      <div className="space-y-3">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {item.product.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900 dark:text-white">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Shipping Address</h3>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-900 dark:text-white">
                          {shippingAddress.first_name} {shippingAddress.last_name}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {shippingAddress.address}
                          {shippingAddress.address2 && <br />}
                          {shippingAddress.address2}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip_code}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {shippingAddress.country}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {shippingAddress.phone}
                        </p>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Payment Method</h3>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-900 dark:text-white">
                          {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && orderSummary && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-6 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="text-center">
                    <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Order Confirmed!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Thank you for your purchase. Your order has been successfully placed.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Order Number</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {orderSummary.order_number}
                      </p>
                    </div>
                    <button
                      onClick={() => window.location.href = '/marketplace/orders'}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      View Order
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentStep === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <ArrowLeft size={16} />
                  Previous
                </button>

                <button
                  onClick={currentStep === 3 ? handlePlaceOrder : handleNextStep}
                  disabled={loading || !validateStep(currentStep)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                    loading || !validateStep(currentStep)
                      ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Processing...
                    </>
                  ) : (
                    <>
                      {currentStep === 3 ? 'Place Order' : 'Next'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className={`sticky top-6 p-6 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>

              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Shipping Method */}
              {currentStep >= 1 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Shipping Method</h4>
                  <select
                    value={selectedShippingMethod}
                    onChange={(e) => setSelectedShippingMethod(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md border text-sm ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    {shippingMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name} - ${method.price.toFixed(2)} ({method.description})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Loyalty Points */}
              {loyaltyPoints > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                      <Gift size={14} />
                      Loyalty Points
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {loyaltyPoints} points available
                    </span>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={useLoyaltyPoints}
                      onChange={(e) => handleLoyaltyPointsChange(e.target.checked)}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Use loyalty points
                    </span>
                  </label>
                  {useLoyaltyPoints && (
                    <div className="mt-2">
                      <input
                        type="number"
                        min="0"
                        max={Math.min(loyaltyPoints, Math.floor(subtotal * 100))}
                        value={loyaltyPointsToUse}
                        onChange={(e) => handleLoyaltyPointsInput(Number(e.target.value))}
                        className={`w-full px-2 py-1 text-sm rounded border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Points to use"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Max: {Math.min(loyaltyPoints, Math.floor(subtotal * 100))} points
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-900 dark:text-white">${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="text-gray-900 dark:text-white">${taxAmount.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Loyalty Discount</span>
                    <span className="text-green-600">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-400">
                    Secure checkout with SSL encryption
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
